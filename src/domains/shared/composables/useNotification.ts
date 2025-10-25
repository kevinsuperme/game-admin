// 通知相关组合式函数
import { ref, reactive, computed, watch } from 'vue';
import type { Ref, ComputedRef } from 'vue';

// 通知类型
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

// 通知位置
export type NotificationPosition = 
  | 'top-right'
  | 'top-left'
  | 'top-center'
  | 'bottom-right'
  | 'bottom-left'
  | 'bottom-center';

// 通知项
export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  closable?: boolean;
  showIcon?: boolean;
  position?: NotificationPosition;
  onClick?: () => void;
  onClose?: () => void;
  createdAt: number;
}

// 通知配置
export interface NotificationConfig {
  maxCount?: number;
  duration?: number;
  position?: NotificationPosition;
  closable?: boolean;
  showIcon?: boolean;
}

// 默认通知配置
export const defaultNotificationConfig: NotificationConfig = {
  maxCount: 5,
  duration: 4500,
  position: 'top-right',
  closable: true,
  showIcon: true,
};

// 通知组合式函数
export function useNotification(config: NotificationConfig = {}) {
  // 合并配置
  const notificationConfig = { ...defaultNotificationConfig, ...config };
  
  // 通知列表
  const notifications = ref<NotificationItem[]>([]);
  
  // 通知计数
  const count = computed(() => notifications.value.length);
  
  // 是否有通知
  const hasNotifications = computed(() => count.value > 0);
  
  // 按类型分组的计数
  const countByType = computed(() => {
    return notifications.value.reduce((acc, notification) => {
      acc[notification.type] = (acc[notification.type] || 0) + 1;
      return acc;
    }, {} as Record<NotificationType, number>);
  });
  
  // 生成唯一ID
  const generateId = (): string => {
    return `notification_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  };
  
  // 添加通知
  const addNotification = (notification: Omit<NotificationItem, 'id' | 'createdAt'>): string => {
    const id = generateId();
    const newNotification: NotificationItem = {
      id,
      createdAt: Date.now(),
      duration: notificationConfig.duration,
      closable: notificationConfig.closable,
      showIcon: notificationConfig.showIcon,
      position: notificationConfig.position,
      ...notification,
    };
    
    // 检查最大数量限制
    if (notificationConfig.maxCount && notifications.value.length >= notificationConfig.maxCount) {
      // 移除最早的通知
      const oldestNotification = notifications.value.reduce((oldest, current) => 
        current.createdAt < oldest.createdAt ? current : oldest
      );
      removeNotification(oldestNotification.id);
    }
    
    // 添加新通知
    notifications.value.push(newNotification);
    
    // 设置自动关闭定时器
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }
    
    return id;
  };
  
  // 移除通知
  const removeNotification = (id: string): boolean => {
    const index = notifications.value.findIndex(n => n.id === id);
    if (index !== -1) {
      const notification = notifications.value[index];
      notifications.value.splice(index, 1);
      
      // 调用关闭回调
      if (notification.onClose) {
        notification.onClose();
      }
      
      return true;
    }
    return false;
  };
  
  // 清空所有通知
  const clearAllNotifications = (): void => {
    // 调用所有通知的关闭回调
    notifications.value.forEach(notification => {
      if (notification.onClose) {
        notification.onClose();
      }
    });
    
    notifications.value = [];
  };
  
  // 清空指定类型的通知
  const clearNotificationsByType = (type: NotificationType): void => {
    const notificationsToRemove = notifications.value.filter(n => n.type === type);
    
    notificationsToRemove.forEach(notification => {
      if (notification.onClose) {
        notification.onClose();
      }
    });
    
    notifications.value = notifications.value.filter(n => n.type !== type);
  };
  
  // 成功通知
  const success = (title: string, message?: string, options?: Partial<NotificationItem>): string => {
    return addNotification({
      type: 'success',
      title,
      message,
      ...options,
    });
  };
  
  // 错误通知
  const error = (title: string, message?: string, options?: Partial<NotificationItem>): string => {
    return addNotification({
      type: 'error',
      title,
      message,
      duration: 0, // 错误通知默认不自动关闭
      ...options,
    });
  };
  
  // 警告通知
  const warning = (title: string, message?: string, options?: Partial<NotificationItem>): string => {
    return addNotification({
      type: 'warning',
      title,
      message,
      ...options,
    });
  };
  
  // 信息通知
  const info = (title: string, message?: string, options?: Partial<NotificationItem>): string => {
    return addNotification({
      type: 'info',
      title,
      message,
      ...options,
    });
  };
  
  // 更新通知配置
  const updateConfig = (newConfig: Partial<NotificationConfig>): void => {
    Object.assign(notificationConfig, newConfig);
  };
  
  // 获取指定位置的通知
  const getNotificationsByPosition = (position: NotificationPosition): NotificationItem[] => {
    return notifications.value.filter(n => n.position === position);
  };
  
  return {
    // 响应式数据
    notifications: notifications as Ref<NotificationItem[]>,
    count: count as ComputedRef<number>,
    hasNotifications: hasNotifications as ComputedRef<boolean>,
    countByType: countByType as ComputedRef<Record<NotificationType, number>>,
    
    // 方法
    addNotification,
    removeNotification,
    clearAllNotifications,
    clearNotificationsByType,
    success,
    error,
    warning,
    info,
    updateConfig,
    getNotificationsByPosition,
  };
}

// 全局通知管理器
class NotificationManager {
  private static instance: NotificationManager;
  private notificationStore: ReturnType<typeof useNotification>;
  
  private constructor() {
    this.notificationStore = useNotification();
  }
  
  public static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }
  
  public getStore() {
    return this.notificationStore;
  }
  
  // 便捷方法
  public success(title: string, message?: string, options?: Partial<NotificationItem>): string {
    return this.notificationStore.success(title, message, options);
  }
  
  public error(title: string, message?: string, options?: Partial<NotificationItem>): string {
    return this.notificationStore.error(title, message, options);
  }
  
  public warning(title: string, message?: string, options?: Partial<NotificationItem>): string {
    return this.notificationStore.warning(title, message, options);
  }
  
  public info(title: string, message?: string, options?: Partial<NotificationItem>): string {
    return this.notificationStore.info(title, message, options);
  }
  
  public clear(): void {
    this.notificationStore.clearAllNotifications();
  }
}

// 导出全局通知管理器实例
export const notificationManager = NotificationManager.getInstance();

// 导出类型
export type {
  NotificationType,
  NotificationPosition,
  NotificationItem,
  NotificationConfig,
};