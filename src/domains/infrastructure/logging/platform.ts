// 日志平台接入服务
import type { LogEntry } from '@/domains/shared/types';
import { httpClient } from '../http';

// 日志平台配置接口
export interface LogPlatformConfig {
  /** 日志平台API端点 */
  endpoint: string;
  /** 认证令牌 */
  token?: string;
  /** 应用标识 */
  appId: string;
  /** 环境标识 */
  env: 'development' | 'production' | 'test';
  /** 是否启用 */
  enabled: boolean;
  /** 批量发送日志的数量 */
  batchSize?: number;
  /** 发送间隔(ms) */
  sendInterval?: number;
}

// 日志平台接入类
class LogPlatformService {
  private config: LogPlatformConfig;
  private logQueue: LogEntry[] = [];
  private sendTimer: number | null = null;
  private isSending: boolean = false;

  constructor(config: LogPlatformConfig) {
    this.config = {
      batchSize: 10,
      sendInterval: 5000,
      ...config
    };

    // 启动定时发送
    if (this.config.enabled) {
      this.startSending();
    }
  }

  /**
   * 发送日志到平台
   * @param logs 日志数组
   */
  async sendLogs(logs: LogEntry[]): Promise<boolean> {
    if (!this.config.enabled || !logs.length) {
      return false;
    }

    try {
      const payload = {
        appId: this.config.appId,
        env: this.config.env,
        logs: logs.map(log => ({
          ...log,
          // 添加额外的上下文信息
          platform: 'web',
          userAgent: navigator.userAgent,
          timestamp: new Date(log.timestamp).getTime()
        }))
      };

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (this.config.token) {
        headers['Authorization'] = `Bearer ${this.config.token}`;
      }

      await httpClient.post(this.config.endpoint, payload, { headers });
      return true;
    } catch (error) {
      console.error('[LogPlatformService] Failed to send logs:', error);
      return false;
    }
  }

  /**
   * 添加日志到队列
   * @param log 日志条目
   */
  enqueueLog(log: LogEntry): void {
    if (!this.config.enabled) {
      return;
    }

    // 添加到队列
    this.logQueue.push(log);

    // 如果队列超过批量大小，立即发送
    if (this.logQueue.length >= (this.config.batchSize || 10)) {
      this.sendLogsNow();
    }
  }

  /**
   * 立即发送日志
   */
  async sendLogsNow(): Promise<void> {
    if (!this.config.enabled || this.isSending || !this.logQueue.length) {
      return;
    }

    this.isSending = true;
    const logsToSend = this.logQueue.splice(0, this.config.batchSize || 10);

    try {
      await this.sendLogs(logsToSend);
    } finally {
      this.isSending = false;
    }
  }

  /**
   * 启动定时发送
   */
  private startSending(): void {
    if (this.sendTimer) {
      clearInterval(this.sendTimer);
    }

    this.sendTimer = window.setInterval(() => {
      this.sendLogsNow();
    }, this.config.sendInterval);
  }

  /**
   * 停止定时发送
   */
  stopSending(): void {
    if (this.sendTimer) {
      clearInterval(this.sendTimer);
      this.sendTimer = null;
    }
  }

  /**
   * 更新配置
   * @param config 新配置
   */
  updateConfig(config: Partial<LogPlatformConfig>): void {
    this.config = { ...this.config, ...config };
    
    // 如果启用状态改变，重新启动发送
    if (config.enabled !== undefined) {
      if (config.enabled) {
        this.startSending();
      } else {
        this.stopSending();
      }
    }
  }

  /**
   * 获取队列中的日志数量
   */
  getQueueSize(): number {
    return this.logQueue.length;
  }

  /**
   * 清空日志队列
   */
  clearQueue(): void {
    this.logQueue = [];
  }
}

export default LogPlatformService;