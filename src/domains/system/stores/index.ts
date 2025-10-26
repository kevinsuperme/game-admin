// 系统域状态管理
// 使用Pinia管理系统相关的状态

import { defineStore } from 'pinia';
import type {
  SystemInfo,
  SystemConfig,
  SystemLog,
  SystemNotification,
  SystemTask,
  SystemBackup,
  SystemUpdate,
  SystemStats,
  SystemServiceData,
  SystemSecurity,
  SystemMonitoring,
  SystemMaintenance,
  SystemStore,
} from '../types';
import { systemService, systemManagementService } from '../services';

// 系统状态管理
export const useSystemStore = defineStore('system', {
  state: (): SystemStore => ({
    // 系统信息
    systemInfo: null,
    loading: false,
    error: null,
    
    // 系统配置
    systemConfig: null,
    
    // 系统日志
    systemLogs: [],
    logsTotal: 0,
    logsLoading: false,
    
    // 系统通知
    systemNotifications: [],
    notificationsTotal: 0,
    notificationsLoading: false,
    unreadNotifications: 0,
    
    // 系统任务
    systemTasks: [],
    tasksTotal: 0,
    tasksLoading: false,
    
    // 系统备份
    systemBackups: [],
    backupsTotal: 0,
    backupsLoading: false,
    
    // 系统更新
    systemUpdates: [],
    updatesLoading: false,
    
    // 系统统计
    systemStats: null,
    statsLoading: false,
    
    // 系统服务
    systemServices: [],
    servicesLoading: false,
    
    // 系统安全
    systemSecurity: null,
    securityLoading: false,
    
    // 系统监控
    systemMonitoring: null,
    monitoringLoading: false,
    
    // 系统维护
    systemMaintenance: null,
    maintenanceLoading: false,
  }),
  
  getters: {
    // 系统是否健康
    isSystemHealthy(): boolean {
      if (!this.systemServices || this.systemServices.length === 0) return false;
      return this.systemServices.every(service => service.health === 'healthy');
    },
    
    // 系统是否处于维护模式
    isSystemInMaintenance(): boolean {
      return this.systemMaintenance?.mode || false;
    },
    
    // 是否有可用的系统更新
    hasSystemUpdates(): boolean {
      return this.systemUpdates.some(update => update.status === 'available');
    },
    
    // 系统错误日志数量
    systemErrorLogsCount(): number {
      return this.systemLogs.filter(log => log.level === 'error' || log.level === 'fatal').length;
    },
    
    // 系统警告日志数量
    systemWarningLogsCount(): number {
      return this.systemLogs.filter(log => log.level === 'warn').length;
    },
    
    // 运行中的系统任务数量
    runningSystemTasksCount(): number {
      return this.systemTasks.filter(task => task.status === 'running').length;
    },
    
    // 失败的系统任务数量
    failedSystemTasksCount(): number {
      return this.systemTasks.filter(task => task.status === 'failed').length;
    },
    
    // 未读系统通知数量
    unreadSystemNotificationsCount(): number {
      return this.unreadNotifications;
    },
    
    // 紧急系统通知数量
    urgentSystemNotificationsCount(): number {
      return this.systemNotifications.filter(notification => 
        notification.level === 'urgent' && notification.status === 'published'
      ).length;
    },
    
    // 系统存储使用率
    systemStorageUsage(): number {
      if (!this.systemStats) return 0;
      return this.systemStats.storage.percentage;
    },
    
    // 系统带宽使用率
    systemBandwidthUsage(): number {
      if (!this.systemStats) return 0;
      return this.systemStats.bandwidth.percentage;
    },
    
    // 系统错误率
    systemErrorRate(): number {
      if (!this.systemStats) return 0;
      return this.systemStats.performance.errorRate;
    },
    
    // 系统可用性
    systemAvailability(): number {
      if (!this.systemStats) return 0;
      return this.systemStats.performance.availability;
    },
  },
  
  actions: {
    // 系统信息
    async fetchSystemInfo(): Promise<void> {
      try {
        this.loading = true;
        this.error = null;
        this.systemInfo = await systemService.getSystemInfo();
      } catch (error) {
        this.error = error instanceof Error ? error.message : '获取系统信息失败';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 系统配置
    async fetchSystemConfig(): Promise<void> {
      try {
        this.systemConfig = await systemService.getSystemConfig();
      } catch (error) {
        this.error = error instanceof Error ? error.message : '获取系统配置失败';
        throw error;
      }
    },
    
    async updateSystemConfig(config: Partial<SystemConfig>): Promise<SystemConfig> {
      try {
        this.systemConfig = await systemService.updateSystemConfig(config);
        return this.systemConfig;
      } catch (error) {
        this.error = error instanceof Error ? error.message : '更新系统配置失败';
        throw error;
      }
    },
    
    // 系统日志
    async fetchSystemLogs(params?: any): Promise<void> {
      try {
        this.logsLoading = true;
        const { logs, total } = await systemService.getSystemLogs(params);
        this.systemLogs = logs;
        this.logsTotal = total;
      } catch (error) {
        this.error = error instanceof Error ? error.message : '获取系统日志失败';
        throw error;
      } finally {
        this.logsLoading = false;
      }
    },
    
    async clearSystemLogs(before?: string): Promise<void> {
      try {
        await systemService.clearSystemLogs(before);
        // 重新获取日志
        await this.fetchSystemLogs();
      } catch (error) {
        this.error = error instanceof Error ? error.message : '清除系统日志失败';
        throw error;
      }
    },
    
    // 系统通知
    async fetchSystemNotifications(params?: any): Promise<void> {
      try {
        this.notificationsLoading = true;
        const { notifications, total } = await systemService.getSystemNotifications(params);
        this.systemNotifications = notifications;
        this.notificationsTotal = total;
        // 计算未读通知数量
        this.unreadNotifications = notifications.filter(n => n.status === 'published' && !n.readBy?.includes('current-user')).length;
      } catch (error) {
        this.error = error instanceof Error ? error.message : '获取系统通知失败';
        throw error;
      } finally {
        this.notificationsLoading = false;
      }
    },
    
    async createSystemNotification(notification: Omit<SystemNotification, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>): Promise<SystemNotification> {
      try {
        const result = await systemService.createSystemNotification(notification);
        // 重新获取通知
        await this.fetchSystemNotifications();
        return result;
      } catch (error) {
        this.error = error instanceof Error ? error.message : '创建系统通知失败';
        throw error;
      }
    },
    
    async updateSystemNotification(id: string, notification: Partial<SystemNotification>): Promise<SystemNotification> {
      try {
        const result = await systemService.updateSystemNotification(id, notification);
        // 重新获取通知
        await this.fetchSystemNotifications();
        return result;
      } catch (error) {
        this.error = error instanceof Error ? error.message : '更新系统通知失败';
        throw error;
      }
    },
    
    async deleteSystemNotification(id: string): Promise<void> {
      try {
        await systemService.deleteSystemNotification(id);
        // 重新获取通知
        await this.fetchSystemNotifications();
      } catch (error) {
        this.error = error instanceof Error ? error.message : '删除系统通知失败';
        throw error;
      }
    },
    
    async markNotificationAsRead(id: string): Promise<void> {
      try {
        await systemService.markNotificationAsRead(id, 'current-user');
        // 重新获取通知
        await this.fetchSystemNotifications();
      } catch (error) {
        this.error = error instanceof Error ? error.message : '标记通知为已读失败';
        throw error;
      }
    },
    
    // 系统任务
    async fetchSystemTasks(params?: any): Promise<void> {
      try {
        this.tasksLoading = true;
        const { tasks, total } = await systemService.getSystemTasks(params);
        this.systemTasks = tasks;
        this.tasksTotal = total;
      } catch (error) {
        this.error = error instanceof Error ? error.message : '获取系统任务失败';
        throw error;
      } finally {
        this.tasksLoading = false;
      }
    },
    
    async createSystemTask(task: Omit<SystemTask, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>): Promise<SystemTask> {
      try {
        const result = await systemService.createSystemTask(task);
        // 重新获取任务
        await this.fetchSystemTasks();
        return result;
      } catch (error) {
        this.error = error instanceof Error ? error.message : '创建系统任务失败';
        throw error;
      }
    },
    
    async updateSystemTask(id: string, task: Partial<SystemTask>): Promise<SystemTask> {
      try {
        const result = await systemService.updateSystemTask(id, task);
        // 重新获取任务
        await this.fetchSystemTasks();
        return result;
      } catch (error) {
        this.error = error instanceof Error ? error.message : '更新系统任务失败';
        throw error;
      }
    },
    
    async deleteSystemTask(id: string): Promise<void> {
      try {
        await systemService.deleteSystemTask(id);
        // 重新获取任务
        await this.fetchSystemTasks();
      } catch (error) {
        this.error = error instanceof Error ? error.message : '删除系统任务失败';
        throw error;
      }
    },
    
    async runSystemTask(id: string): Promise<void> {
      try {
        await systemService.runSystemTask(id);
        // 重新获取任务
        await this.fetchSystemTasks();
      } catch (error) {
        this.error = error instanceof Error ? error.message : '运行系统任务失败';
        throw error;
      }
    },
    
    async cancelSystemTask(id: string): Promise<void> {
      try {
        await systemService.cancelSystemTask(id);
        // 重新获取任务
        await this.fetchSystemTasks();
      } catch (error) {
        this.error = error instanceof Error ? error.message : '取消系统任务失败';
        throw error;
      }
    },
    
    // 系统备份
    async fetchSystemBackups(params?: any): Promise<void> {
      try {
        this.backupsLoading = true;
        const { backups, total } = await systemService.getSystemBackups(params);
        this.systemBackups = backups;
        this.backupsTotal = total;
      } catch (error) {
        this.error = error instanceof Error ? error.message : '获取系统备份失败';
        throw error;
      } finally {
        this.backupsLoading = false;
      }
    },
    
    async createSystemBackup(backup: Omit<SystemBackup, 'id' | 'createdAt' | 'createdBy'>): Promise<SystemBackup> {
      try {
        const result = await systemService.createSystemBackup(backup);
        // 重新获取备份
        await this.fetchSystemBackups();
        return result;
      } catch (error) {
        this.error = error instanceof Error ? error.message : '创建系统备份失败';
        throw error;
      }
    },
    
    async deleteSystemBackup(id: string): Promise<void> {
      try {
        await systemService.deleteSystemBackup(id);
        // 重新获取备份
        await this.fetchSystemBackups();
      } catch (error) {
        this.error = error instanceof Error ? error.message : '删除系统备份失败';
        throw error;
      }
    },
    
    async downloadSystemBackup(id: string): Promise<string> {
      try {
        return await systemService.downloadSystemBackup(id);
      } catch (error) {
        this.error = error instanceof Error ? error.message : '下载系统备份失败';
        throw error;
      }
    },
    
    async restoreSystemBackup(id: string): Promise<void> {
      try {
        await systemService.restoreSystemBackup(id);
        // 重新获取备份
        await this.fetchSystemBackups();
      } catch (error) {
        this.error = error instanceof Error ? error.message : '恢复系统备份失败';
        throw error;
      }
    },
    
    // 系统更新
    async checkSystemUpdates(): Promise<void> {
      try {
        this.updatesLoading = true;
        this.systemUpdates = await systemService.checkSystemUpdates();
      } catch (error) {
        this.error = error instanceof Error ? error.message : '检查系统更新失败';
        throw error;
      } finally {
        this.updatesLoading = false;
      }
    },
    
    async downloadSystemUpdate(id: string): Promise<void> {
      try {
        await systemService.downloadSystemUpdate(id);
        // 重新获取更新
        await this.checkSystemUpdates();
      } catch (error) {
        this.error = error instanceof Error ? error.message : '下载系统更新失败';
        throw error;
      }
    },
    
    async installSystemUpdate(id: string): Promise<void> {
      try {
        await systemService.installSystemUpdate(id);
        // 重新获取更新
        await this.checkSystemUpdates();
      } catch (error) {
        this.error = error instanceof Error ? error.message : '安装系统更新失败';
        throw error;
      }
    },
    
    // 系统统计
    async fetchSystemStats(params?: any): Promise<void> {
      try {
        this.statsLoading = true;
        this.systemStats = await systemService.getSystemStats(params);
      } catch (error) {
        this.error = error instanceof Error ? error.message : '获取系统统计失败';
        throw error;
      } finally {
        this.statsLoading = false;
      }
    },
    
    // 系统服务
    async fetchSystemServices(): Promise<void> {
      try {
        this.servicesLoading = true;
        this.systemServices = await systemService.getSystemServices();
      } catch (error) {
        this.error = error instanceof Error ? error.message : '获取系统服务失败';
        throw error;
      } finally {
        this.servicesLoading = false;
      }
    },
    
    async getSystemService(id: string): Promise<SystemServiceData> {
      try {
        return await systemService.getSystemService(id);
      } catch (error) {
        this.error = error instanceof Error ? error.message : '获取系统服务详情失败';
        throw error;
      }
    },
    
    async updateSystemService(id: string, service: Partial<SystemServiceData>): Promise<SystemServiceData> {
      try {
        const result = await systemService.updateSystemService(id, service);
        // 重新获取服务
        await this.fetchSystemServices();
        return result;
      } catch (error) {
        this.error = error instanceof Error ? error.message : '更新系统服务失败';
        throw error;
      }
    },
    
    async deleteSystemService(id: string): Promise<void> {
      try {
        await systemService.deleteSystemService(id);
        // 重新获取服务
        await this.fetchSystemServices();
      } catch (error) {
        this.error = error instanceof Error ? error.message : '删除系统服务失败';
        throw error;
      }
    },
    
    async restartSystemService(id: string): Promise<void> {
      try {
        await systemService.restartSystemService(id);
        // 重新获取服务
        await this.fetchSystemServices();
      } catch (error) {
        this.error = error instanceof Error ? error.message : '重启系统服务失败';
        throw error;
      }
    },
    
    async stopSystemService(id: string): Promise<void> {
      try {
        await systemService.stopSystemService(id);
        // 重新获取服务
        await this.fetchSystemServices();
      } catch (error) {
        this.error = error instanceof Error ? error.message : '停止系统服务失败';
        throw error;
      }
    },
    
    async startSystemService(id: string): Promise<void> {
      try {
        await systemService.startSystemService(id);
        // 重新获取服务
        await this.fetchSystemServices();
      } catch (error) {
        this.error = error instanceof Error ? error.message : '启动系统服务失败';
        throw error;
      }
    },
    
    // 系统安全
    async fetchSystemSecurity(): Promise<void> {
      try {
        this.securityLoading = true;
        this.systemSecurity = await systemService.getSystemSecurity();
      } catch (error) {
        this.error = error instanceof Error ? error.message : '获取系统安全设置失败';
        throw error;
      } finally {
        this.securityLoading = false;
      }
    },
    
    async updateSystemSecurity(security: Partial<SystemSecurity>): Promise<SystemSecurity> {
      try {
        this.systemSecurity = await systemService.updateSystemSecurity(security);
        return this.systemSecurity;
      } catch (error) {
        this.error = error instanceof Error ? error.message : '更新系统安全设置失败';
        throw error;
      }
    },
    
    // 系统监控
    async fetchSystemMonitoring(): Promise<void> {
      try {
        this.monitoringLoading = true;
        this.systemMonitoring = await systemService.getSystemMonitoring();
      } catch (error) {
        this.error = error instanceof Error ? error.message : '获取系统监控设置失败';
        throw error;
      } finally {
        this.monitoringLoading = false;
      }
    },
    
    async updateSystemMonitoring(monitoring: Partial<SystemMonitoring>): Promise<SystemMonitoring> {
      try {
        this.systemMonitoring = await systemService.updateSystemMonitoring(monitoring);
        return this.systemMonitoring;
      } catch (error) {
        this.error = error instanceof Error ? error.message : '更新系统监控设置失败';
        throw error;
      }
    },
    
    // 系统维护
    async fetchSystemMaintenance(): Promise<void> {
      try {
        this.maintenanceLoading = true;
        this.systemMaintenance = await systemService.getSystemMaintenance();
      } catch (error) {
        this.error = error instanceof Error ? error.message : '获取系统维护状态失败';
        throw error;
      } finally {
        this.maintenanceLoading = false;
      }
    },
    
    async updateSystemMaintenance(maintenance: Partial<SystemMaintenance>): Promise<SystemMaintenance> {
      try {
        this.systemMaintenance = await systemService.updateSystemMaintenance(maintenance);
        return this.systemMaintenance;
      } catch (error) {
        this.error = error instanceof Error ? error.message : '更新系统维护状态失败';
        throw error;
      }
    },
    
    // 系统设置
    async updateSystemSettings(settings: any): Promise<void> {
      try {
        await systemService.updateSystemConfig(settings);
        // 重新获取系统配置
        await this.fetchSystemConfig();
      } catch (error) {
        this.error = error instanceof Error ? error.message : '更新系统设置失败';
        throw error;
      }
    },
    
    // 更新设置
    async updateUpdateSettings(settings: any): Promise<void> {
      try {
        // 这里可以添加更新设置的逻辑
        // 目前先模拟成功
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        this.error = error instanceof Error ? error.message : '更新更新设置失败';
        throw error;
      }
    },
  },
});