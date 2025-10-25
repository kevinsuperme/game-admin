// 系统域入口文件
// 提供系统相关的类型、服务、状态管理和工具函数的统一导出

// 常量定义
export const SYSTEM_DOMAIN_NAME = 'system';

// 路由配置
export const SYSTEM_ROUTES = [
  {
    path: '/system',
    name: 'System',
    component: () => import('@/views/system/index.vue'),
    meta: {
      title: '系统管理',
      icon: 'setting',
      requiresAuth: true,
      roles: ['admin'],
    },
    children: [
      {
        path: 'info',
        name: 'SystemInfo',
        component: () => import('@/views/system/info/index.vue'),
        meta: {
          title: '系统信息',
          icon: 'info',
        },
      },
      {
        path: 'config',
        name: 'SystemConfig',
        component: () => import('@/views/system/config/index.vue'),
        meta: {
          title: '系统配置',
          icon: 'config',
        },
      },
      {
        path: 'logs',
        name: 'SystemLogs',
        component: () => import('@/views/system/logs/index.vue'),
        meta: {
          title: '系统日志',
          icon: 'document',
        },
      },
      {
        path: 'notifications',
        name: 'SystemNotifications',
        component: () => import('@/views/system/notifications/index.vue'),
        meta: {
          title: '系统通知',
          icon: 'notification',
        },
      },
      {
        path: 'tasks',
        name: 'SystemTasks',
        component: () => import('@/views/system/tasks/index.vue'),
        meta: {
          title: '系统任务',
          icon: 'task',
        },
      },
      {
        path: 'backups',
        name: 'SystemBackups',
        component: () => import('@/views/system/backups/index.vue'),
        meta: {
          title: '系统备份',
          icon: 'backup',
        },
      },
      {
        path: 'updates',
        name: 'SystemUpdates',
        component: () => import('@/views/system/updates/index.vue'),
        meta: {
          title: '系统更新',
          icon: 'update',
        },
      },
      {
        path: 'services',
        name: 'SystemServices',
        component: () => import('@/views/system/services/index.vue'),
        meta: {
          title: '系统服务',
          icon: 'service',
        },
      },
      {
        path: 'security',
        name: 'SystemSecurity',
        component: () => import('@/views/system/security/index.vue'),
        meta: {
          title: '系统安全',
          icon: 'security',
        },
      },
      {
        path: 'monitoring',
        name: 'SystemMonitoring',
        component: () => import('@/views/system/monitoring/index.vue'),
        meta: {
          title: '系统监控',
          icon: 'monitoring',
        },
      },
      {
        path: 'maintenance',
        name: 'SystemMaintenance',
        component: () => import('@/views/system/maintenance/index.vue'),
        meta: {
          title: '系统维护',
          icon: 'maintenance',
        },
      },
    ],
  },
];

// 枚举定义
export enum SystemLogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
}

export enum SystemNotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
}

export enum SystemNotificationLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum SystemNotificationStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  EXPIRED = 'expired',
}

export enum SystemTaskType {
  CLEANUP = 'cleanup',
  BACKUP = 'backup',
  REPORT = 'report',
  NOTIFICATION = 'notification',
  MAINTENANCE = 'maintenance',
  CUSTOM = 'custom',
}

export enum SystemTaskStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum SystemTaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum SystemBackupType {
  FULL = 'full',
  INCREMENTAL = 'incremental',
  DIFFERENTIAL = 'differential',
}

export enum SystemBackupStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum SystemUpdateType {
  MAJOR = 'major',
  MINOR = 'minor',
  PATCH = 'patch',
}

export enum SystemUpdateStatus {
  AVAILABLE = 'available',
  DOWNLOADING = 'downloading',
  INSTALLING = 'installing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum SystemServiceType {
  INTERNAL = 'internal',
  EXTERNAL = 'external',
}

export enum SystemServiceStatus {
  RUNNING = 'running',
  STOPPED = 'stopped',
  ERROR = 'error',
  MAINTENANCE = 'maintenance',
}

export enum SystemServiceHealth {
  HEALTHY = 'healthy',
  UNHEALTHY = 'unhealthy',
  DEGRADED = 'degraded',
  UNKNOWN = 'unknown',
}

export enum SystemAlertType {
  THRESHOLD = 'threshold',
  ANOMALY = 'anomaly',
  PATTERN = 'pattern',
}

export enum SystemAlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum SystemMaintenanceType {
  CLEANUP = 'cleanup',
  OPTIMIZATION = 'optimization',
  REPAIR = 'repair',
  UPDATE = 'update',
}

export enum SystemMaintenanceStatus {
  SCHEDULED = 'scheduled',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

// 默认配置
export const SYSTEM_CONFIG = {
  // 日志配置
  log: {
    level: SystemLogLevel.INFO,
    maxFiles: 30,
    maxSize: '10MB',
    format: 'json',
  },
  // 通知配置
  notification: {
    maxRetries: 3,
    retryInterval: 5000,
    batchSize: 100,
  },
  // 任务配置
  task: {
    maxConcurrent: 5,
    timeout: 3600000, // 1小时
    retryLimit: 3,
  },
  // 备份配置
  backup: {
    schedule: '0 2 * * *', // 每天凌晨2点
    retention: 30, // 保留30天
    compression: true,
  },
  // 监控配置
  monitoring: {
    interval: 60000, // 1分钟
    thresholds: {
      cpu: 80,
      memory: 80,
      disk: 85,
      responseTime: 500,
      errorRate: 1,
    },
  },
  // 安全配置
  security: {
    sessionTimeout: 3600000, // 1小时
    maxLoginAttempts: 5,
    lockoutDuration: 900000, // 15分钟
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
    },
  },
};

// 类型定义
export type {
  SystemInfo,
  SystemConfig,
  SystemLog,
  SystemNotification,
  SystemTask,
  SystemBackup,
  SystemUpdate,
  SystemStats,
  SystemService,
  SystemSecurity,
  SystemMonitoring,
  SystemMaintenance,
} from './types';

// 服务导出
export {
  systemService,
  SystemServiceImpl,
  systemManagementService,
  SystemManagementServiceImpl,
} from './services';

// 状态管理导出
export {
  useSystemStore,
} from './stores';

// 工具函数导出
export {
  // 系统信息相关
  getSystemVersion,
  getSystemEnvironment,
  getSystemUptime,
  getSystemMemoryUsage,
  getSystemCpuUsage,
  getSystemDiskUsage,
  
  // 系统配置相关
  getSystemThemeMode,
  getSystemFeatureStatus,
  getSystemLimitValue,
  
  // 系统日志相关
  getLogLevelText,
  getLogLevelColor,
  formatSystemLogTime,
  
  // 系统通知相关
  getNotificationTypeText,
  getNotificationTypeColor,
  getNotificationLevelText,
  getNotificationLevelColor,
  getNotificationStatusText,
  getNotificationTargetText,
  
  // 系统任务相关
  getTaskTypeText,
  getTaskStatusText,
  getTaskStatusColor,
  getTaskPriorityText,
  getTaskPriorityColor,
  getTaskScheduleText,
  
  // 系统备份相关
  getBackupTypeText,
  getBackupStatusText,
  getBackupStatusColor,
  
  // 系统更新相关
  getUpdateTypeText,
  getUpdateStatusText,
  getUpdateStatusColor,
  
  // 系统服务相关
  getServiceTypeText,
  getServiceStatusText,
  getServiceStatusColor,
  getServiceHealthText,
  getServiceHealthColor,
  
  // 系统统计相关
  formatSystemStatsValue,
  
  // 系统安全相关
  getSecurityRuleActionText,
  getSecurityRuleActionColor,
  
  // 系统监控相关
  getAlertTypeText,
  getAlertSeverityText,
  getAlertSeverityColor,
  
  // 通用工具函数
  formatFileSize,
  formatDuration,
  getPercentageColor,
  getResponseTimeColor,
  getAvailabilityColor,
  getErrorRateColor,
  isSystemHealthy,
  getSystemHealthStatus,
  generateSystemReport,
} from './utils';