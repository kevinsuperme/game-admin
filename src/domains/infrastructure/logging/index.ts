// 日志服务实现
import type { LogLevel, LogEntry } from '@/domains/shared/types';
import { httpClient } from '../http';
import LogPlatformService from './platform';

// 日志级别映射
const LOG_LEVEL_MAP: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// 日志服务类
class LogService {
  private currentLogLevel: LogLevel = import.meta.env.DEV ? 'debug' : 'error';
  private logs: LogEntry[] = [];
  private maxLogSize: number = 1000;
  private enableConsole: boolean = true;
  private enableRemote: boolean = !import.meta.env.DEV;
  private remoteEndpoint: string = '/api/logs';
  private logPlatform: LogPlatformService | null = null;

  /**
   * 记录调试日志
   * @param message 日志消息
   * @param data 附加数据
   * @param context 上下文信息
   */
  debug(message: string, data?: any, context?: string): void {
    this.log('debug', message, data, context);
  }

  /**
   * 记录信息日志
   * @param message 日志消息
   * @param data 附加数据
   * @param context 上下文信息
   */
  info(message: string, data?: any, context?: string): void {
    this.log('info', message, data, context);
  }

  /**
   * 记录警告日志
   * @param message 日志消息
   * @param data 附加数据
   * @param context 上下文信息
   */
  warn(message: string, data?: any, context?: string): void {
    this.log('warn', message, data, context);
  }

  /**
   * 记录错误日志
   * @param message 日志消息
   * @param data 附加数据
   * @param context 上下文信息
   */
  error(message: string, data?: any, context?: string): void {
    this.log('error', message, data, context);
  }

  /**
   * 记录日志
   * @param level 日志级别
   * @param message 日志消息
   * @param data 附加数据
   * @param context 上下文信息
   */
  private log(level: LogLevel, message: string, data?: any, context?: string): void {
    // 检查日志级别
    if (LOG_LEVEL_MAP[level] < LOG_LEVEL_MAP[this.currentLogLevel]) {
      return;
    }

    // 创建日志条目
    const logEntry: LogEntry = {
      id: this.generateLogId(),
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      context,
      url: window.location.href,
      userAgent: navigator.userAgent,
      userId: this.getUserId(),
    };

    // 添加到内存日志
    this.addToMemoryLog(logEntry);

    // 控制台输出
    if (this.enableConsole) {
      this.logToConsole(logEntry);
    }

    // 发送到日志平台
    if (this.logPlatform && level !== 'debug') {
      this.logPlatform.enqueueLog(logEntry);
    }

    // 远程日志
    if (this.enableRemote && level !== 'debug') {
      this.logToRemote(logEntry);
    }
  }

  /**
   * 设置日志级别
   * @param level 日志级别
   */
  setLogLevel(level: LogLevel): void {
    this.currentLogLevel = level;
  }

  /**
   * 设置是否启用控制台日志
   * @param enable 是否启用
   */
  setConsoleEnabled(enable: boolean): void {
    this.enableConsole = enable;
  }

  /**
   * 设置是否启用远程日志
   * @param enable 是否启用
   */
  setRemoteEnabled(enable: boolean): void {
    this.enableRemote = enable;
  }

  /**
   * 设置远程日志端点
   * @param endpoint 端点URL
   */
  setRemoteEndpoint(endpoint: string): void {
    this.remoteEndpoint = endpoint;
  }

  /**
   * 初始化日志平台
   * @param config 日志平台配置
   */
  initLogPlatform(config: any): void {
    try {
      this.logPlatform = new LogPlatformService(config);
    } catch (error) {
      console.error('[LogService] Failed to initialize log platform:', error);
    }
  }

  /**
   * 设置日志平台配置
   * @param config 日志平台配置
   */
  setLogPlatformConfig(config: any): void {
    if (this.logPlatform) {
      this.logPlatform.updateConfig(config);
    }
  }

  /**
   * 设置最大日志数量
   * @param maxSize 最大日志数量
   */
  setMaxLogSize(maxSize: number): void {
    this.maxLogSize = maxSize;
    
    // 如果当前日志数量超过新的最大值，则裁剪
    if (this.logs.length > maxSize) {
      this.logs = this.logs.slice(-maxSize);
    }
  }

  /**
   * 获取内存中的日志
   * @param level 可选的日志级别过滤
   * @param count 可选的日志数量限制
   * @returns 日志数组
   */
  getLogs(level?: LogLevel, count?: number): LogEntry[] {
    let logs = [...this.logs];
    
    // 按级别过滤
    if (level) {
      logs = logs.filter(log => log.level === level);
    }
    
    // 限制数量
    if (count && count > 0) {
      logs = logs.slice(-count);
    }
    
    return logs;
  }

  /**
   * 清空内存中的日志
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * 导出日志为JSON字符串
   * @param level 可选的日志级别过滤
   * @param count 可选的日志数量限制
   * @returns JSON字符串
   */
  exportLogs(level?: LogLevel, count?: number): string {
    const logs = this.getLogs(level, count);
    return JSON.stringify(logs, null, 2);
  }

  /**
   * 下载日志文件
   * @param filename 文件名
   * @param level 可选的日志级别过滤
   * @param count 可选的日志数量限制
   */
  downloadLogs(filename = 'logs.json', level?: LogLevel, count?: number): void {
    const logs = this.exportLogs(level, count);
    const blob = new Blob([logs], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  /**
   * 生成日志ID
   * @returns 日志ID
   */
  private generateLogId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * 获取用户ID
   * @returns 用户ID
   */
  private getUserId(): string | undefined {
    // 这里可以从认证服务或存储中获取用户ID
    return localStorage.getItem('super-admin-user-id') || undefined;
  }

  /**
   * 添加到内存日志
   * @param logEntry 日志条目
   */
  private addToMemoryLog(logEntry: LogEntry): void {
    this.logs.push(logEntry);
    
    // 如果超过最大日志数量，则删除最旧的日志
    if (this.logs.length > this.maxLogSize) {
      this.logs.shift();
    }
  }

  /**
   * 输出到控制台
   * @param logEntry 日志条目
   */
  private logToConsole(logEntry: LogEntry): void {
    const { level, message, data, context } = logEntry;
    const prefix = context ? `[${context}]` : '';
    
    switch (level) {
      case 'debug':
        console.debug(`%c[DEBUG] ${prefix} ${message}`, 'color: #888', data);
        break;
      case 'info':
        console.info(`%c[INFO] ${prefix} ${message}`, 'color: #007bff', data);
        break;
      case 'warn':
        console.warn(`%c[WARN] ${prefix} ${message}`, 'color: #ffc107', data);
        break;
      case 'error':
        console.error(`%c[ERROR] ${prefix} ${message}`, 'color: #dc3545', data);
        break;
    }
  }

  /**
   * 发送到远程日志服务
   * @param logEntry 日志条目
   */
  private async logToRemote(logEntry: LogEntry): Promise<void> {
    try {
      // 使用navigator.sendBeacon确保页面卸载时也能发送日志
      if (navigator.sendBeacon) {
        const data = JSON.stringify(logEntry);
        navigator.sendBeacon(this.remoteEndpoint, data);
      } else {
        // 降级到普通HTTP请求
        await httpClient.post(this.remoteEndpoint, logEntry);
      }
    } catch (error) {
      console.error('[LogService] Failed to send log to remote:', error);
    }
  }
}

// 创建日志服务实例
const logService = new LogService();

export default logService;