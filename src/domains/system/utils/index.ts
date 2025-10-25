// 系统域工具函数
// 提供系统管理相关的工具函数

import type {
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
} from '../types';

// 系统信息相关工具函数
export function getSystemVersion(systemInfo: SystemInfo | null): string {
  return systemInfo?.version || '未知';
}

export function getSystemEnvironment(systemInfo: SystemInfo | null): string {
  const environment = systemInfo?.environment || 'unknown';
  const environmentMap: Record<string, string> = {
    development: '开发环境',
    production: '生产环境',
    testing: '测试环境',
    unknown: '未知环境',
  };
  return environmentMap[environment] || '未知环境';
}

export function getSystemUptime(systemInfo: SystemInfo | null): string {
  if (!systemInfo?.uptime) return '未知';
  
  const uptime = systemInfo.uptime;
  const days = Math.floor(uptime / (24 * 60 * 60));
  const hours = Math.floor((uptime % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((uptime % (60 * 60)) / 60);
  
  if (days > 0) {
    return `${days}天${hours}小时${minutes}分钟`;
  } else if (hours > 0) {
    return `${hours}小时${minutes}分钟`;
  } else {
    return `${minutes}分钟`;
  }
}

export function getSystemMemoryUsage(systemInfo: SystemInfo | null): {
  used: string;
  total: string;
  percentage: number;
} {
  if (!systemInfo?.memoryUsage) {
    return { used: '0 MB', total: '0 MB', percentage: 0 };
  }
  
  const { used, total, percentage } = systemInfo.memoryUsage;
  return {
    used: formatFileSize(used),
    total: formatFileSize(total),
    percentage,
  };
}

export function getSystemCpuUsage(systemInfo: SystemInfo | null): {
  usage: number;
  model: string;
  cores: number;
} {
  if (!systemInfo?.cpuUsage) {
    return { usage: 0, model: '未知', cores: 0 };
  }
  
  const { usage, model, cores } = systemInfo.cpuUsage;
  return { usage, model, cores };
}

export function getSystemDiskUsage(systemInfo: SystemInfo | null): {
  used: string;
  total: string;
  percentage: number;
} {
  if (!systemInfo?.diskUsage) {
    return { used: '0 GB', total: '0 GB', percentage: 0 };
  }
  
  const { used, total, percentage } = systemInfo.diskUsage;
  return {
    used: formatFileSize(used),
    total: formatFileSize(total),
    percentage,
  };
}

// 系统配置相关工具函数
export function getSystemThemeMode(config: SystemConfig | null): string {
  const mode = config?.theme?.mode || 'auto';
  const modeMap: Record<string, string> = {
    light: '浅色模式',
    dark: '深色模式',
    auto: '跟随系统',
  };
  return modeMap[mode] || '跟随系统';
}

export function getSystemFeatureStatus(config: SystemConfig | null, feature: keyof SystemConfig['features']): boolean {
  return config?.features?.[feature] || false;
}

export function getSystemLimitValue(config: SystemConfig | null, limit: keyof SystemConfig['limits']): number {
  return config?.limits?.[limit] || 0;
}

// 系统日志相关工具函数
export function getLogLevelText(level: SystemLog['level']): string {
  const levelMap: Record<SystemLog['level'], string> = {
    debug: '调试',
    info: '信息',
    warn: '警告',
    error: '错误',
    fatal: '致命',
  };
  return levelMap[level] || level;
}

export function getLogLevelColor(level: SystemLog['level']): string {
  const colorMap: Record<SystemLog['level'], string> = {
    debug: '#909399',
    info: '#409EFF',
    warn: '#E6A23C',
    error: '#F56C6C',
    fatal: '#C45656',
  };
  return colorMap[level] || '#909399';
}

export function formatSystemLogTime(timestamp: string): string {
  return new Date(timestamp).toLocaleString();
}

// 系统通知相关工具函数
export function getNotificationTypeText(type: SystemNotification['type']): string {
  const typeMap: Record<SystemNotification['type'], string> = {
    info: '信息',
    success: '成功',
    warning: '警告',
    error: '错误',
  };
  return typeMap[type] || type;
}

export function getNotificationTypeColor(type: SystemNotification['type']): string {
  const colorMap: Record<SystemNotification['type'], string> = {
    info: '#409EFF',
    success: '#67C23A',
    warning: '#E6A23C',
    error: '#F56C6C',
  };
  return colorMap[type] || '#409EFF';
}

export function getNotificationLevelText(level: SystemNotification['level']): string {
  const levelMap: Record<SystemNotification['level'], string> = {
    low: '低',
    medium: '中',
    high: '高',
    urgent: '紧急',
  };
  return levelMap[level] || level;
}

export function getNotificationLevelColor(level: SystemNotification['level']): string {
  const colorMap: Record<SystemNotification['level'], string> = {
    low: '#909399',
    medium: '#E6A23C',
    high: '#F56C6C',
    urgent: '#C45656',
  };
  return colorMap[level] || '#909399';
}

export function getNotificationStatusText(status: SystemNotification['status']): string {
  const statusMap: Record<SystemNotification['status'], string> = {
    draft: '草稿',
    published: '已发布',
    expired: '已过期',
  };
  return statusMap[status] || status;
}

export function getNotificationTargetText(target: SystemNotification['target']): string {
  if (target === 'all') return '所有用户';
  if (target === 'admin') return '管理员';
  if (target === 'user') return '普通用户';
  if (Array.isArray(target)) return `${target.length}个用户`;
  return target;
}

// 系统任务相关工具函数
export function getTaskTypeText(type: SystemTask['type']): string {
  const typeMap: Record<SystemTask['type'], string> = {
    cleanup: '清理',
    backup: '备份',
    report: '报告',
    notification: '通知',
    maintenance: '维护',
    custom: '自定义',
  };
  return typeMap[type] || type;
}

export function getTaskStatusText(status: SystemTask['status']): string {
  const statusMap: Record<SystemTask['status'], string> = {
    pending: '等待中',
    running: '运行中',
    completed: '已完成',
    failed: '失败',
    cancelled: '已取消',
  };
  return statusMap[status] || status;
}

export function getTaskStatusColor(status: SystemTask['status']): string {
  const colorMap: Record<SystemTask['status'], string> = {
    pending: '#909399',
    running: '#409EFF',
    completed: '#67C23A',
    failed: '#F56C6C',
    cancelled: '#909399',
  };
  return colorMap[status] || '#909399';
}

export function getTaskPriorityText(priority: SystemTask['priority']): string {
  const priorityMap: Record<SystemTask['priority'], string> = {
    low: '低',
    medium: '中',
    high: '高',
    urgent: '紧急',
  };
  return priorityMap[priority] || priority;
}

export function getTaskPriorityColor(priority: SystemTask['priority']): string {
  const colorMap: Record<SystemTask['priority'], string> = {
    low: '#909399',
    medium: '#E6A23C',
    high: '#F56C6C',
    urgent: '#C45656',
  };
  return colorMap[priority] || '#909399';
}

export function getTaskScheduleText(schedule: SystemTask['schedule']): string {
  if (!schedule) return '手动执行';
  
  const { type, value } = schedule;
  const typeMap: Record<string, string> = {
    once: '单次',
    interval: '间隔',
    cron: '定时',
  };
  
  return `${typeMap[type] || type}: ${value}`;
}

// 系统备份相关工具函数
export function getBackupTypeText(type: SystemBackup['type']): string {
  const typeMap: Record<SystemBackup['type'], string> = {
    full: '完整备份',
    incremental: '增量备份',
    differential: '差异备份',
  };
  return typeMap[type] || type;
}

export function getBackupStatusText(status: SystemBackup['status']): string {
  const statusMap: Record<SystemBackup['status'], string> = {
    pending: '等待中',
    running: '备份中',
    completed: '已完成',
    failed: '失败',
  };
  return statusMap[status] || status;
}

export function getBackupStatusColor(status: SystemBackup['status']): string {
  const colorMap: Record<SystemBackup['status'], string> = {
    pending: '#909399',
    running: '#409EFF',
    completed: '#67C23A',
    failed: '#F56C6C',
  };
  return colorMap[status] || '#909399';
}

// 系统更新相关工具函数
export function getUpdateTypeText(type: SystemUpdate['type']): string {
  const typeMap: Record<SystemUpdate['type'], string> = {
    major: '主要更新',
    minor: '次要更新',
    patch: '补丁更新',
  };
  return typeMap[type] || type;
}

export function getUpdateStatusText(status: SystemUpdate['status']): string {
  const statusMap: Record<SystemUpdate['status'], string> = {
    available: '可用',
    downloading: '下载中',
    installing: '安装中',
    completed: '已完成',
    failed: '失败',
  };
  return statusMap[status] || status;
}

export function getUpdateStatusColor(status: SystemUpdate['status']): string {
  const colorMap: Record<SystemUpdate['status'], string> = {
    available: '#409EFF',
    downloading: '#E6A23C',
    installing: '#409EFF',
    completed: '#67C23A',
    failed: '#F56C6C',
  };
  return colorMap[status] || '#409EFF';
}

// 系统服务相关工具函数
export function getServiceTypeText(type: SystemService['type']): string {
  const typeMap: Record<SystemService['type'], string> = {
    internal: '内部服务',
    external: '外部服务',
  };
  return typeMap[type] || type;
}

export function getServiceStatusText(status: SystemService['status']): string {
  const statusMap: Record<SystemService['status'], string> = {
    running: '运行中',
    stopped: '已停止',
    error: '错误',
    maintenance: '维护中',
  };
  return statusMap[status] || status;
}

export function getServiceStatusColor(status: SystemService['status']): string {
  const colorMap: Record<SystemService['status'], string> = {
    running: '#67C23A',
    stopped: '#909399',
    error: '#F56C6C',
    maintenance: '#E6A23C',
  };
  return colorMap[status] || '#909399';
}

export function getServiceHealthText(health: SystemService['health']): string {
  const healthMap: Record<SystemService['health'], string> = {
    healthy: '健康',
    unhealthy: '不健康',
    degraded: '降级',
    unknown: '未知',
  };
  return healthMap[health] || health;
}

export function getServiceHealthColor(health: SystemService['health']): string {
  const colorMap: Record<SystemService['health'], string> = {
    healthy: '#67C23A',
    unhealthy: '#F56C6C',
    degraded: '#E6A23C',
    unknown: '#909399',
  };
  return colorMap[health] || '#909399';
}

// 系统统计相关工具函数
export function formatSystemStatsValue(value: number, type: string): string {
  if (type === 'percentage') return `${value}%`;
  if (type === 'bytes') return formatFileSize(value);
  if (type === 'time') return `${value}ms`;
  return value.toString();
}

// 系统安全相关工具函数
export function getSecurityRuleActionText(action: 'allow' | 'deny'): string {
  return action === 'allow' ? '允许' : '拒绝';
}

export function getSecurityRuleActionColor(action: 'allow' | 'deny'): string {
  return action === 'allow' ? '#67C23A' : '#F56C6C';
}

// 系统监控相关工具函数
export function getAlertTypeText(type: 'threshold' | 'anomaly' | 'pattern'): string {
  const typeMap: Record<string, string> = {
    threshold: '阈值',
    anomaly: '异常',
    pattern: '模式',
  };
  return typeMap[type] || type;
}

export function getAlertSeverityText(severity: 'low' | 'medium' | 'high' | 'critical'): string {
  const severityMap: Record<string, string> = {
    low: '低',
    medium: '中',
    high: '高',
    critical: '严重',
  };
  return severityMap[severity] || severity;
}

export function getAlertSeverityColor(severity: 'low' | 'medium' | 'high' | 'critical'): string {
  const colorMap: Record<string, string> = {
    low: '#909399',
    medium: '#E6A23C',
    high: '#F56C6C',
    critical: '#C45656',
  };
  return colorMap[severity] || '#909399';
}

// 通用工具函数
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatDuration(seconds: number): string {
  const days = Math.floor(seconds / (24 * 60 * 60));
  const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((seconds % (60 * 60)) / 60);
  const secs = Math.floor(seconds % 60);
  
  const parts: string[] = [];
  if (days > 0) parts.push(`${days}天`);
  if (hours > 0) parts.push(`${hours}小时`);
  if (minutes > 0) parts.push(`${minutes}分钟`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}秒`);
  
  return parts.join(' ');
}

export function getPercentageColor(percentage: number): string {
  if (percentage < 50) return '#67C23A';
  if (percentage < 80) return '#E6A23C';
  return '#F56C6C';
}

export function getResponseTimeColor(responseTime: number): string {
  if (responseTime < 200) return '#67C23A';
  if (responseTime < 500) return '#E6A23C';
  return '#F56C6C';
}

export function getAvailabilityColor(availability: number): string {
  if (availability >= 99.9) return '#67C23A';
  if (availability >= 99) return '#E6A23C';
  return '#F56C6C';
}

export function getErrorRateColor(errorRate: number): string {
  if (errorRate < 0.1) return '#67C23A';
  if (errorRate < 1) return '#E6A23C';
  return '#F56C6C';
}

export function isSystemHealthy(services: SystemService[]): boolean {
  return services.every(service => service.health === 'healthy');
}

export function getSystemHealthStatus(services: SystemService[]): 'healthy' | 'degraded' | 'unhealthy' {
  const healthyCount = services.filter(service => service.health === 'healthy').length;
  const totalCount = services.length;
  
  if (healthyCount === totalCount) return 'healthy';
  if (healthyCount > totalCount / 2) return 'degraded';
  return 'unhealthy';
}

export function generateSystemReport(stats: SystemStats): string {
  const report = [
    `系统统计报告`,
    `生成时间: ${new Date().toLocaleString()}`,
    ``,
    `用户统计:`,
    `- 总用户数: ${stats.users.total}`,
    `- 活跃用户: ${stats.users.active}`,
    `- 新用户: ${stats.users.new}`,
    `- 在线用户: ${stats.users.online}`,
    ``,
    `内容统计:`,
    `- 总内容数: ${stats.content.total}`,
    `- 已发布: ${stats.content.published}`,
    `- 草稿: ${stats.content.draft}`,
    `- 已归档: ${stats.content.archived}`,
    ``,
    `流量统计:`,
    `- 访问量: ${stats.traffic.visits}`,
    `- 页面浏览量: ${stats.traffic.pageViews}`,
    `- 独立访客: ${stats.traffic.uniqueVisitors}`,
    `- 跳出率: ${stats.traffic.bounceRate}%`,
    ``,
    `性能统计:`,
    `- 响应时间: ${stats.performance.responseTime}ms`,
    `- 吞吐量: ${stats.performance.throughput}`,
    `- 错误率: ${stats.performance.errorRate}%`,
    `- 可用性: ${stats.performance.availability}%`,
    ``,
    `存储统计:`,
    `- 总存储: ${formatFileSize(stats.storage.total)}`,
    `- 已使用: ${formatFileSize(stats.storage.used)}`,
    `- 可用空间: ${formatFileSize(stats.storage.available)}`,
    `- 使用率: ${stats.storage.percentage}%`,
    ``,
    `带宽统计:`,
    `- 总带宽: ${formatFileSize(stats.bandwidth.total)}`,
    `- 已使用: ${formatFileSize(stats.bandwidth.used)}`,
    `- 可用带宽: ${formatFileSize(stats.bandwidth.available)}`,
    `- 使用率: ${stats.bandwidth.percentage}%`,
  ];
  
  return report.join('\n');
}