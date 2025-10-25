// 日志级别类型定义
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

// 日志条目接口定义
export interface LogEntry {
  id: string;
  timestamp: number;
  level: LogLevel;
  message: string;
  data?: any;
  context?: string;
  url?: string;
  userAgent?: string;
  userId?: string;
}