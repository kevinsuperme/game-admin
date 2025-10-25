// 系统域类型定义
// 定义系统管理相关的接口和类型

// 系统信息
export interface SystemInfo {
  name: string;
  version: string;
  buildTime: string;
  environment: 'development' | 'production' | 'testing';
  description: string;
  author: string;
  homepage: string;
  repository: string;
  license: string;
  nodeVersion: string;
  platform: string;
  arch: string;
  uptime: number;
  memoryUsage: {
    total: number;
    free: number;
    used: number;
    percentage: number;
  };
  cpuUsage: {
    model: string;
    cores: number;
    speed: number;
    usage: number;
  };
  diskUsage: {
    total: number;
    free: number;
    used: number;
    percentage: number;
  };
}

// 系统配置
export interface SystemConfig {
  siteName: string;
  siteDescription: string;
  siteKeywords: string;
  siteAuthor: string;
  siteUrl: string;
  logo: string;
  favicon: string;
  theme: {
    primaryColor: string;
    accentColor: string;
    backgroundColor: string;
    textColor: string;
    mode: 'light' | 'dark' | 'auto';
  };
  features: {
    registration: boolean;
    emailVerification: boolean;
    twoFactorAuth: boolean;
    socialLogin: boolean;
    fileUpload: boolean;
    notifications: boolean;
    analytics: boolean;
  };
  limits: {
    maxFileSize: number;
    maxFileCount: number;
    maxLoginAttempts: number;
    passwordMinLength: number;
    sessionTimeout: number;
  };
  email: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
    from: string;
  };
  storage: {
    type: 'local' | 'oss' | 's3';
    path: string;
    bucket?: string;
    region?: string;
    accessKey?: string;
    secretKey?: string;
  };
}

// 系统日志
export interface SystemLog {
  id: string;
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  userId?: string;
  ip?: string;
  userAgent?: string;
  module: string;
  action: string;
  details?: string;
  stack?: string;
}

// 系统通知
export interface SystemNotification {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'success' | 'warning' | 'error';
  level: 'low' | 'medium' | 'high' | 'urgent';
  target: 'all' | 'admin' | 'user' | string[];
  status: 'draft' | 'published' | 'expired';
  startTime?: string;
  endTime?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  readBy?: string[];
  actions?: Array<{
    label: string;
    url?: string;
    action?: string;
    style?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  }>;
}

// 系统任务
export interface SystemTask {
  id: string;
  name: string;
  description: string;
  type: 'cleanup' | 'backup' | 'report' | 'notification' | 'maintenance' | 'custom';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  schedule?: {
    type: 'once' | 'interval' | 'cron';
    value: string;
    timezone?: string;
  };
  progress: number;
  startTime?: string;
  endTime?: string;
  nextRunTime?: string;
  lastRunTime?: string;
  result?: any;
  error?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  params?: Record<string, any>;
}

// 系统备份
export interface SystemBackup {
  id: string;
  name: string;
  description: string;
  type: 'full' | 'incremental' | 'differential';
  status: 'pending' | 'running' | 'completed' | 'failed';
  size: number;
  path: string;
  compression: boolean;
  encryption: boolean;
  includes: string[];
  excludes: string[];
  createdAt: string;
  completedAt?: string;
  createdBy: string;
  downloadUrl?: string;
  restoreUrl?: string;
}

// 系统更新
export interface SystemUpdate {
  id: string;
  version: string;
  title: string;
  description: string;
  type: 'major' | 'minor' | 'patch';
  status: 'available' | 'downloading' | 'installing' | 'completed' | 'failed';
  releaseDate: string;
  size: number;
  downloadUrl: string;
  checksum: string;
  changelog: string;
  prerequisites?: string[];
  breakingChanges?: string[];
  createdAt: string;
  updatedAt: string;
  downloadedAt?: string;
  installedAt?: string;
}

// 系统统计
export interface SystemStats {
  users: {
    total: number;
    active: number;
    new: number;
    online: number;
  };
  content: {
    total: number;
    published: number;
    draft: number;
    archived: number;
  };
  traffic: {
    visits: number;
    pageViews: number;
    uniqueVisitors: number;
    bounceRate: number;
  };
  performance: {
    responseTime: number;
    throughput: number;
    errorRate: number;
    availability: number;
  };
  storage: {
    total: number;
    used: number;
    available: number;
    percentage: number;
  };
  bandwidth: {
    total: number;
    used: number;
    available: number;
    percentage: number;
  };
}

// 系统服务
export interface SystemService {
  id: string;
  name: string;
  description: string;
  type: 'internal' | 'external';
  status: 'running' | 'stopped' | 'error' | 'maintenance';
  health: 'healthy' | 'unhealthy' | 'degraded' | 'unknown';
  endpoint?: string;
  port?: number;
  dependencies: string[];
  metrics: {
    uptime: number;
    requests: number;
    errors: number;
    responseTime: number;
  };
  createdAt: string;
  updatedAt: string;
  lastHealthCheck?: string;
}

// 系统安全
export interface SystemSecurity {
  firewall: {
    enabled: boolean;
    rules: Array<{
      id: string;
      name: string;
      action: 'allow' | 'deny';
      source: string;
      destination: string;
      port: number;
      protocol: string;
      enabled: boolean;
    }>;
  };
  ssl: {
    enabled: boolean;
    certificate: string;
    issuer: string;
    expiresAt: string;
    autoRenew: boolean;
  };
  authentication: {
    methods: string[];
    twoFactorAuth: boolean;
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSymbols: boolean;
    };
  };
  access: {
    ipWhitelist: string[];
    ipBlacklist: string[];
    rateLimit: {
      enabled: boolean;
      windowMs: number;
      maxRequests: number;
    };
  };
  audit: {
    enabled: boolean;
    logLevel: string;
    retentionDays: number;
  };
}

// 系统监控
export interface SystemMonitoring {
  alerts: Array<{
    id: string;
    name: string;
    description: string;
    type: 'threshold' | 'anomaly' | 'pattern';
    severity: 'low' | 'medium' | 'high' | 'critical';
    status: 'active' | 'inactive' | 'triggered';
    condition: Record<string, any>;
    actions: Array<{
      type: 'email' | 'webhook' | 'sms';
      target: string;
      template?: string;
    }>;
    createdAt: string;
    updatedAt: string;
    lastTriggered?: string;
  }>;
  metrics: Array<{
    name: string;
    value: number;
    unit: string;
    timestamp: string;
    tags?: Record<string, string>;
  }>;
  dashboards: Array<{
    id: string;
    name: string;
    description: string;
    widgets: Array<{
      id: string;
      type: string;
      title: string;
      query: string;
      visualization: string;
      position: {
        x: number;
        y: number;
        width: number;
        height: number;
      };
    }>;
    createdAt: string;
    updatedAt: string;
  }>;
}

// 系统维护
export interface SystemMaintenance {
  mode: boolean;
  message: string;
  startTime?: string;
  endTime?: string;
  allowedIps: string[];
  allowedPaths: string[];
  redirectUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// 系统服务接口
export interface SystemService {
  // 系统信息
  getSystemInfo(): Promise<SystemInfo>;
  
  // 系统配置
  getSystemConfig(): Promise<SystemConfig>;
  updateSystemConfig(config: Partial<SystemConfig>): Promise<SystemConfig>;
  
  // 系统日志
  getSystemLogs(params?: {
    level?: string;
    module?: string;
    startTime?: string;
    endTime?: string;
    page?: number;
    limit?: number;
  }): Promise<{ logs: SystemLog[]; total: number }>;
  clearSystemLogs(before?: string): Promise<void>;
  
  // 系统通知
  getSystemNotifications(params?: {
    type?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ notifications: SystemNotification[]; total: number }>;
  createSystemNotification(notification: Omit<SystemNotification, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>): Promise<SystemNotification>;
  updateSystemNotification(id: string, notification: Partial<SystemNotification>): Promise<SystemNotification>;
  deleteSystemNotification(id: string): Promise<void>;
  markNotificationAsRead(id: string, userId: string): Promise<void>;
  
  // 系统任务
  getSystemTasks(params?: {
    type?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ tasks: SystemTask[]; total: number }>;
  createSystemTask(task: Omit<SystemTask, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>): Promise<SystemTask>;
  updateSystemTask(id: string, task: Partial<SystemTask>): Promise<SystemTask>;
  deleteSystemTask(id: string): Promise<void>;
  runSystemTask(id: string): Promise<void>;
  cancelSystemTask(id: string): Promise<void>;
  
  // 系统备份
  getSystemBackups(params?: {
    type?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ backups: SystemBackup[]; total: number }>;
  createSystemBackup(backup: Omit<SystemBackup, 'id' | 'createdAt' | 'createdBy'>): Promise<SystemBackup>;
  deleteSystemBackup(id: string): Promise<void>;
  downloadSystemBackup(id: string): Promise<string>;
  restoreSystemBackup(id: string): Promise<void>;
  
  // 系统更新
  getSystemUpdates(): Promise<SystemUpdate[]>;
  checkSystemUpdates(): Promise<SystemUpdate[]>;
  downloadSystemUpdate(id: string): Promise<void>;
  installSystemUpdate(id: string): Promise<void>;
  
  // 系统统计
  getSystemStats(params?: {
    startDate?: string;
    endDate?: string;
    period?: 'hour' | 'day' | 'week' | 'month';
  }): Promise<SystemStats>;
  
  // 系统服务
  getSystemServices(): Promise<SystemService[]>;
  restartSystemService(id: string): Promise<void>;
  stopSystemService(id: string): Promise<void>;
  startSystemService(id: string): Promise<void>;
  
  // 系统安全
  getSystemSecurity(): Promise<SystemSecurity>;
  updateSystemSecurity(security: Partial<SystemSecurity>): Promise<SystemSecurity>;
  
  // 系统监控
  getSystemMonitoring(): Promise<SystemMonitoring>;
  updateSystemMonitoring(monitoring: Partial<SystemMonitoring>): Promise<SystemMonitoring>;
  
  // 系统维护
  getSystemMaintenance(): Promise<SystemMaintenance>;
  updateSystemMaintenance(maintenance: Partial<SystemMaintenance>): Promise<SystemMaintenance>;
}

// 系统状态管理接口
export interface SystemStore {
  // 系统信息
  systemInfo: SystemInfo | null;
  loading: boolean;
  error: string | null;
  
  // 系统配置
  systemConfig: SystemConfig | null;
  
  // 系统日志
  systemLogs: SystemLog[];
  logsTotal: number;
  logsLoading: boolean;
  
  // 系统通知
  systemNotifications: SystemNotification[];
  notificationsTotal: number;
  notificationsLoading: boolean;
  unreadNotifications: number;
  
  // 系统任务
  systemTasks: SystemTask[];
  tasksTotal: number;
  tasksLoading: boolean;
  
  // 系统备份
  systemBackups: SystemBackup[];
  backupsTotal: number;
  backupsLoading: boolean;
  
  // 系统更新
  systemUpdates: SystemUpdate[];
  updatesLoading: boolean;
  
  // 系统统计
  systemStats: SystemStats | null;
  statsLoading: boolean;
  
  // 系统服务
  systemServices: SystemService[];
  servicesLoading: boolean;
  
  // 系统安全
  systemSecurity: SystemSecurity | null;
  securityLoading: boolean;
  
  // 系统监控
  systemMonitoring: SystemMonitoring | null;
  monitoringLoading: boolean;
  
  // 系统维护
  systemMaintenance: SystemMaintenance | null;
  maintenanceLoading: boolean;
  
  // 操作方法
  fetchSystemInfo(): Promise<void>;
  fetchSystemConfig(): Promise<void>;
  updateSystemConfig(config: Partial<SystemConfig>): Promise<void>;
  fetchSystemLogs(params?: any): Promise<void>;
  clearSystemLogs(before?: string): Promise<void>;
  fetchSystemNotifications(params?: any): Promise<void>;
  createSystemNotification(notification: Omit<SystemNotification, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>): Promise<void>;
  updateSystemNotification(id: string, notification: Partial<SystemNotification>): Promise<void>;
  deleteSystemNotification(id: string): Promise<void>;
  markNotificationAsRead(id: string): Promise<void>;
  fetchSystemTasks(params?: any): Promise<void>;
  createSystemTask(task: Omit<SystemTask, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>): Promise<void>;
  updateSystemTask(id: string, task: Partial<SystemTask>): Promise<void>;
  deleteSystemTask(id: string): Promise<void>;
  runSystemTask(id: string): Promise<void>;
  cancelSystemTask(id: string): Promise<void>;
  fetchSystemBackups(params?: any): Promise<void>;
  createSystemBackup(backup: Omit<SystemBackup, 'id' | 'createdAt' | 'createdBy'>): Promise<void>;
  deleteSystemBackup(id: string): Promise<void>;
  downloadSystemBackup(id: string): Promise<string>;
  restoreSystemBackup(id: string): Promise<void>;
  checkSystemUpdates(): Promise<void>;
  downloadSystemUpdate(id: string): Promise<void>;
  installSystemUpdate(id: string): Promise<void>;
  fetchSystemStats(params?: any): Promise<void>;
  fetchSystemServices(): Promise<void>;
  restartSystemService(id: string): Promise<void>;
  stopSystemService(id: string): Promise<void>;
  startSystemService(id: string): Promise<void>;
  fetchSystemSecurity(): Promise<void>;
  updateSystemSecurity(security: Partial<SystemSecurity>): Promise<void>;
  fetchSystemMonitoring(): Promise<void>;
  updateSystemMonitoring(monitoring: Partial<SystemMonitoring>): Promise<void>;
  fetchSystemMaintenance(): Promise<void>;
  updateSystemMaintenance(maintenance: Partial<SystemMaintenance>): Promise<void>;
}