// 基础设施域入口文件
// 提供基础设施相关的服务、工具和配置的统一导出

// HTTP客户端
export { default as httpClient } from './http';

// 存储服务
export { default as storageService } from './storage';

// 日志服务
export { default as logService } from './logging';

// 工具函数
export * from './utils';

// 类型定义
export type {
  FlexDirection,
  FlexAlign,
  FlexJustify,
  SpacingSize,
  MaxWidth,
  ResponsiveConfig,
  ResponsiveContainerProps,
} from './types';

// 常量
export const INFRASTRUCTURE_DOMAIN_NAME = 'infrastructure';

// 默认配置
export const INFRASTRUCTURE_CONFIG = {
  // HTTP配置
  http: {
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
    timeout: 10000,
    retryAttempts: 3,
    retryDelay: 1000,
  },
  // 存储配置
  storage: {
    prefix: 'fantastic-admin-',
    defaultExpiry: 7 * 24 * 60 * 60 * 1000, // 7天
  },
  // 日志配置
  logging: {
    level: import.meta.env.DEV ? 'debug' : 'error',
    maxLogSize: 1000,
    enableConsole: true,
    enableRemote: !import.meta.env.DEV,
    remoteEndpoint: '/api/logs',
  },
} as const;