// 全局错误处理服务
import type { App } from 'vue';
import logService from '../logging';

// 错误类型定义
export interface ErrorInfo {
  id: string;
  timestamp: string;
  type: 'javascript' | 'network' | 'api' | 'vue' | 'promise';
  message: string;
  stack?: string;
  source?: string;
  line?: number;
  column?: number;
  url: string;
  userAgent: string;
  userId?: string;
  context?: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  handled: boolean;
  reported: boolean;
}

// 错误处理器类型
export type ErrorHandler = (error: ErrorInfo) => void | Promise<void>;

// 错误边界组件选项
export interface ErrorBoundaryOptions {
  fallback?: (error: ErrorInfo) => any;
  onError?: ErrorHandler;
  onErrorCaptured?: (error: Error, instance: any, info: string) => void;
  maxErrors?: number;
  resetTimeout?: number;
}

// 默认错误处理器
class GlobalErrorHandler {
  private handlers: ErrorHandler[] = [];
  private errorQueue: ErrorInfo[] = [];
  private maxQueueSize: number = 100;
  private isReporting: boolean = false;
  private errorCounts: Map<string, number> = new Map();
  private lastReportTime: Map<string, number> = new Map();
  private reportThreshold: number = 3; // 同一错误报告阈值
  private reportCooldown: number = 60000; // 报告冷却时间（毫秒）

  /**
   * 初始化全局错误处理
   * @param app Vue应用实例
   */
  install(app: App) {
    // 处理未捕获的JavaScript错误
    window.addEventListener('error', this.handleJavaScriptError.bind(this));
    
    // 处理未捕获的Promise拒绝
    window.addEventListener('unhandledrejection', this.handlePromiseRejection.bind(this));
    
    // 注册Vue错误处理器
    app.config.errorHandler = this.handleVueError.bind(this);
    
    // 注册Vue警告处理器
    app.config.warnHandler = this.handleVueWarning.bind(this);
    
    // 页面卸载时上报剩余错误
    window.addEventListener('beforeunload', this.reportErrorsOnUnload.bind(this));
    
    // 页面可见性变化时处理错误队列
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
  }

  /**
   * 添加错误处理器
   * @param handler 错误处理器函数
   */
  addHandler(handler: ErrorHandler) {
    this.handlers.push(handler);
  }

  /**
   * 移除错误处理器
   * @param handler 错误处理器函数
   */
  removeHandler(handler: ErrorHandler) {
    const index = this.handlers.indexOf(handler);
    if (index !== -1) {
      this.handlers.splice(index, 1);
    }
  }

  /**
   * 处理JavaScript错误
   * @param event 错误事件
   */
  private handleJavaScriptError(event: ErrorEvent) {
    const errorInfo: ErrorInfo = {
      id: this.generateErrorId(),
      timestamp: new Date().toISOString(),
      type: 'javascript',
      message: event.message,
      stack: event.error?.stack,
      source: event.filename,
      line: event.lineno,
      column: event.colno,
      url: window.location.href,
      userAgent: navigator.userAgent,
      userId: this.getUserId(),
      severity: this.determineSeverity(event.error),
      handled: false,
      reported: false,
    };

    this.processError(errorInfo);
  }

  /**
   * 处理Promise拒绝
   * @param event Promise拒绝事件
   */
  private handlePromiseRejection(event: PromiseRejectionEvent) {
    const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
    
    const errorInfo: ErrorInfo = {
      id: this.generateErrorId(),
      timestamp: new Date().toISOString(),
      type: 'promise',
      message: error.message,
      stack: error.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      userId: this.getUserId(),
      context: { reason: event.reason },
      severity: this.determineSeverity(error),
      handled: false,
      reported: false,
    };

    // 防止默认的控制台错误输出
    event.preventDefault();
    
    this.processError(errorInfo);
  }

  /**
   * 处理Vue错误
   * @param error 错误对象
   * @param instance Vue实例
   * @param info 错误信息
   */
  private handleVueError(error: unknown, instance: any, info: string) {
    const err = error instanceof Error ? error : new Error(String(error));
    
    const errorInfo: ErrorInfo = {
      id: this.generateErrorId(),
      timestamp: new Date().toISOString(),
      type: 'vue',
      message: err.message,
      stack: err.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      userId: this.getUserId(),
      context: { 
        info,
        componentName: instance?.$options?.name || 'Unknown',
        props: instance?.$props,
      },
      severity: this.determineSeverity(err),
      handled: false,
      reported: false,
    };

    this.processError(errorInfo);
  }

  /**
   * 处理Vue警告
   * @param msg 警告消息
   * @param instance Vue实例
   * @param trace 警告追踪
   */
  private handleVueWarning(msg: string, instance: any, trace: string) {
    // Vue警告通常不是严重错误，但可能指示潜在问题
    const errorInfo: ErrorInfo = {
      id: this.generateErrorId(),
      timestamp: new Date().toISOString(),
      type: 'vue',
      message: `Vue Warning: ${msg}`,
      url: window.location.href,
      userAgent: navigator.userAgent,
      userId: this.getUserId(),
      context: { 
        trace,
        componentName: instance?.$options?.name || 'Unknown',
      },
      severity: 'low',
      handled: true,
      reported: false,
    };

    // 仅在开发环境下记录Vue警告
    if (import.meta.env.DEV) {
      this.processError(errorInfo);
    }
  }

  /**
   * 处理API错误
   * @param error API错误对象
   * @param context 上下文信息
   */
  handleApiError(error: any, context?: Record<string, any>) {
    const message = error?.response?.data?.message || error?.message || 'API请求失败';
    
    const errorInfo: ErrorInfo = {
      id: this.generateErrorId(),
      timestamp: new Date().toISOString(),
      type: 'api',
      message,
      stack: error?.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      userId: this.getUserId(),
      context: {
        ...context,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        url: error?.config?.url,
        method: error?.config?.method,
      },
      severity: this.determineApiErrorSeverity(error),
      handled: false,
      reported: false,
    };

    this.processError(errorInfo);
  }

  /**
   * 处理网络错误
   * @param error 网络错误对象
   * @param context 上下文信息
   */
  handleNetworkError(error: any, context?: Record<string, any>) {
    const message = error?.message || '网络连接失败';
    
    const errorInfo: ErrorInfo = {
      id: this.generateErrorId(),
      timestamp: new Date().toISOString(),
      type: 'network',
      message,
      stack: error?.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      userId: this.getUserId(),
      context,
      severity: 'medium',
      handled: false,
      reported: false,
    };

    this.processError(errorInfo);
  }

  /**
   * 处理错误
   * @param errorInfo 错误信息
   */
  private processError(errorInfo: ErrorInfo) {
    // 记录到日志
    logService.error(errorInfo.message, errorInfo, 'GlobalErrorHandler');
    
    // 检查错误频率
    const errorKey = this.getErrorKey(errorInfo);
    const count = this.errorCounts.get(errorKey) || 0;
    const lastReport = this.lastReportTime.get(errorKey) || 0;
    const now = Date.now();
    
    this.errorCounts.set(errorKey, count + 1);
    
    // 决定是否需要报告
    const shouldReport = 
      count >= this.reportThreshold || 
      now - lastReport > this.reportCooldown ||
      errorInfo.severity === 'critical';
    
    if (shouldReport) {
      this.lastReportTime.set(errorKey, now);
      this.errorCounts.set(errorKey, 0); // 重置计数
      errorInfo.reported = true;
    }
    
    // 添加到错误队列
    this.addToErrorQueue(errorInfo);
    
    // 执行所有错误处理器
    this.executeHandlers(errorInfo);
    
    // 如果需要报告，则立即处理
    if (shouldReport) {
      this.reportErrors();
    }
  }

  /**
   * 添加到错误队列
   * @param errorInfo 错误信息
   */
  private addToErrorQueue(errorInfo: ErrorInfo) {
    this.errorQueue.push(errorInfo);
    
    // 如果队列超过最大大小，移除最旧的错误
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }
  }

  /**
   * 执行错误处理器
   * @param errorInfo 错误信息
   */
  private async executeHandlers(errorInfo: ErrorInfo) {
    for (const handler of this.handlers) {
      try {
        await handler(errorInfo);
      } catch (handlerError) {
        console.error('Error in error handler:', handlerError);
      }
    }
  }

  /**
   * 报告错误到远程服务器
   */
  private async reportErrors() {
    if (this.isReporting || this.errorQueue.length === 0) {
      return;
    }
    
    this.isReporting = true;
    
    try {
      // 获取需要报告的错误
      const errorsToReport = this.errorQueue.filter(error => error.reported);
      
      if (errorsToReport.length === 0) {
        return;
      }
      
      // 发送错误报告
      await this.sendErrorReport(errorsToReport);
      
      // 从队列中移除已报告的错误
      this.errorQueue = this.errorQueue.filter(error => !error.reported);
    } catch (error) {
      console.error('Failed to report errors:', error);
    } finally {
      this.isReporting = false;
    }
  }

  /**
   * 发送错误报告
   * @param errors 错误列表
   */
  private async sendErrorReport(errors: ErrorInfo[]) {
    const endpoint = '/api/errors/report';
    
    try {
      // 使用navigator.sendBeacon确保页面卸载时也能发送错误报告
      if (navigator.sendBeacon) {
        const data = JSON.stringify({ errors });
        navigator.sendBeacon(endpoint, data);
      } else {
        // 降级到普通HTTP请求
        const { httpClient } = await import('../http');
        await httpClient.post(endpoint, { errors });
      }
    } catch (error) {
      console.error('Failed to send error report:', error);
    }
  }

  /**
   * 页面卸载时上报剩余错误
   */
  private reportErrorsOnUnload() {
    if (this.errorQueue.length > 0) {
      this.sendErrorReport(this.errorQueue);
    }
  }

  /**
   * 处理页面可见性变化
   */
  private handleVisibilityChange() {
    // 当页面变为可见时，处理错误队列
    if (!document.hidden) {
      this.reportErrors();
    }
  }

  /**
   * 生成错误ID
   */
  private generateErrorId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * 获取用户ID
   */
  private getUserId(): string | undefined {
    return localStorage.getItem('super-admin-user-id') || undefined;
  }

  /**
   * 获取错误键值
   * @param errorInfo 错误信息
   */
  private getErrorKey(errorInfo: ErrorInfo): string {
    // 使用错误消息和堆栈的前几行作为键值
    const stack = errorInfo.stack || '';
    const stackLines = stack.split('\n').slice(0, 3).join('\n');
    return `${errorInfo.type}:${errorInfo.message}:${stackLines}`;
  }

  /**
   * 确定错误严重性
   * @param error 错误对象
   */
  private determineSeverity(error?: Error): 'low' | 'medium' | 'high' | 'critical' {
    if (!error) return 'medium';
    
    const message = error.message.toLowerCase();
    
    // 关键错误
    if (message.includes('security') || 
        message.includes('authentication') || 
        message.includes('authorization') ||
        message.includes('permission')) {
      return 'critical';
    }
    
    // 高级错误
    if (message.includes('network') || 
        message.includes('timeout') || 
        message.includes('connection') ||
        message.includes('failed to fetch')) {
      return 'high';
    }
    
    // 中级错误
    if (message.includes('type error') || 
        message.includes('reference error') || 
        message.includes('syntax error')) {
      return 'medium';
    }
    
    // 低级错误
    return 'low';
  }

  /**
   * 确定API错误严重性
   * @param error API错误对象
   */
  private determineApiErrorSeverity(error: any): 'low' | 'medium' | 'high' | 'critical' {
    const status = error?.response?.status;
    
    // 服务器错误
    if (status >= 500) {
      return 'high';
    }
    
    // 认证/授权错误
    if (status === 401 || status === 403) {
      return 'critical';
    }
    
    // 客户端错误
    if (status >= 400 && status < 500) {
      return 'medium';
    }
    
    // 网络错误
    if (!status) {
      return 'high';
    }
    
    return 'medium';
  }

  /**
   * 获取错误队列
   */
  getErrorQueue(): ErrorInfo[] {
    return [...this.errorQueue];
  }

  /**
   * 清空错误队列
   */
  clearErrorQueue(): void {
    this.errorQueue = [];
  }

  /**
   * 获取错误统计
   */
  getErrorStats(): {
    total: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
    recent: number;
  } {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    
    const byType: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};
    let recent = 0;
    
    for (const error of this.errorQueue) {
      // 按类型统计
      byType[error.type] = (byType[error.type] || 0) + 1;
      
      // 按严重性统计
      bySeverity[error.severity] = (bySeverity[error.severity] || 0) + 1;
      
      // 最近一小时的错误
      const errorTime = new Date(error.timestamp).getTime();
      if (errorTime > oneHourAgo) {
        recent++;
      }
    }
    
    return {
      total: this.errorQueue.length,
      byType,
      bySeverity,
      recent,
    };
  }
}

// 创建全局错误处理器实例
const globalErrorHandler = new GlobalErrorHandler();

// 错误边界组件
export function createErrorBoundary(options: ErrorBoundaryOptions = {}) {
  const {
    fallback,
    onError,
    onErrorCaptured,
    maxErrors = 10,
    resetTimeout = 30000,
  } = options;
  
  return {
    name: 'ErrorBoundary',
    data() {
      return {
        error: null as ErrorInfo | null,
        errorCount: 0,
        resetTimer: null as number | null,
      };
    },
    errorCaptured(err: Error, instance: any, info: string) {
      this.errorCount++;
      
      const errorInfo: ErrorInfo = {
        id: globalErrorHandler['generateErrorId'](),
        timestamp: new Date().toISOString(),
        type: 'vue',
        message: err.message,
        stack: err.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        userId: globalErrorHandler['getUserId'](),
        context: { 
          info,
          componentName: instance?.$options?.name || 'Unknown',
          errorCount: this.errorCount,
        },
        severity: globalErrorHandler['determineSeverity'](err),
        handled: true,
        reported: this.errorCount >= maxErrors,
      };
      
      this.error = errorInfo;
      
      // 执行自定义错误处理器
      if (onErrorCaptured) {
        onErrorCaptured(err, instance, info);
      }
      
      // 执行全局错误处理器
      globalErrorHandler['processError'](errorInfo);
      
      // 执行自定义错误处理
      if (onError) {
        onError(errorInfo);
      }
      
      // 如果错误次数超过阈值，设置重置定时器
      if (this.errorCount >= maxErrors) {
        this.setResetTimer();
      }
      
      // 阻止错误继续向上传播
      return false;
    },
    methods: {
      setResetTimer() {
        if (this.resetTimer) {
          clearTimeout(this.resetTimer);
        }
        
        this.resetTimer = window.setTimeout(() => {
          this.resetError();
        }, resetTimeout);
      },
      resetError() {
        this.error = null;
        this.errorCount = 0;
        
        if (this.resetTimer) {
          clearTimeout(this.resetTimer);
          this.resetTimer = null;
        }
      },
    },
    render() {
      if (this.error && fallback) {
        return fallback(this.error);
      }
      
      return this.$slots.default?.();
    },
  };
}

export default globalErrorHandler;