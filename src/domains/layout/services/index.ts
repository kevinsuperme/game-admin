// 布局域服务

import type { 
  LayoutConfig, 
  ThemeConfig, 
  LanguageConfig, 
  DeviceInfo,
  NotificationItem,
  SearchResultItem,
  SearchConfig,
  TabConfig,
  BreadcrumbItem
} from '../types';
import { storageService } from '../../infrastructure/storage';
import { STORAGE_KEYS } from '../../shared/constants';
import { eventBus } from '../../infrastructure/events';

// 布局服务接口
export interface LayoutService {
  // 布局配置相关
  getLayoutConfig(): LayoutConfig;
  updateLayoutConfig(config: Partial<LayoutConfig>): Promise<void>;
  resetLayoutConfig(): Promise<void>;
  
  // 主题相关
  getThemeConfig(): ThemeConfig;
  updateThemeConfig(config: Partial<ThemeConfig>): Promise<void>;
  resetThemeConfig(): Promise<void>;
  toggleThemeMode(): Promise<void>;
  
  // 语言相关
  getCurrentLanguage(): string;
  getLanguageConfigs(): LanguageConfig[];
  setLanguage(language: string): Promise<void>;
  
  // 设备信息相关
  getDeviceInfo(): DeviceInfo;
  updateDeviceInfo(info: Partial<DeviceInfo>): void;
  
  // 标签页相关
  getTabs(): TabConfig[];
  addTab(tab: TabConfig): Promise<void>;
  closeTab(key: string): Promise<void>;
  closeOtherTabs(key: string): Promise<void>;
  closeAllTabs(): Promise<void>;
  switchTab(key: string): Promise<void>;
  
  // 面包屑相关
  setBreadcrumbs(items: BreadcrumbItem[]): void;
  
  // 通知相关
  getNotifications(): NotificationItem[];
  addNotification(notification: NotificationItem): Promise<void>;
  markNotificationAsRead(id: string): Promise<void>;
  markAllNotificationsAsRead(): Promise<void>;
  removeNotification(id: string): Promise<void>;
  clearNotifications(): Promise<void>;
  
  // 搜索相关
  getSearchConfig(): SearchConfig;
  updateSearchConfig(config: Partial<SearchConfig>): Promise<void>;
  performSearch(query: string): Promise<SearchResultItem[]>;
  getSearchHistory(): string[];
  clearSearchHistory(): Promise<void>;
}

// 布局服务实现
export class LayoutServiceImpl implements LayoutService {
  // 布局配置相关
  getLayoutConfig(): LayoutConfig {
    const savedConfig = storageService.get(STORAGE_KEYS.LAYOUT_CONFIG || 'super-admin-layout-config');
    return savedConfig || this.getDefaultLayoutConfig();
  }

  async updateLayoutConfig(config: Partial<LayoutConfig>): Promise<void> {
    const currentConfig = this.getLayoutConfig();
    const newConfig = { ...currentConfig, ...config };
    storageService.set(STORAGE_KEYS.LAYOUT_CONFIG || 'super-admin-layout-config', newConfig);
    
    // 发送布局配置更新事件
    eventBus.emit('layout:config-updated', newConfig);
  }

  async resetLayoutConfig(): Promise<void> {
    storageService.remove(STORAGE_KEYS.LAYOUT_CONFIG || 'super-admin-layout-config');
    
    // 发送布局配置重置事件
    eventBus.emit('layout:config-reset');
  }

  // 主题相关
  getThemeConfig(): ThemeConfig {
    const savedConfig = storageService.get(STORAGE_KEYS.THEME_CONFIG || 'super-admin-theme-config');
    return savedConfig || this.getDefaultThemeConfig();
  }

  async updateThemeConfig(config: Partial<ThemeConfig>): Promise<void> {
    const currentConfig = this.getThemeConfig();
    const newConfig = { ...currentConfig, ...config };
    storageService.set(STORAGE_KEYS.THEME_CONFIG || 'super-admin-theme-config', newConfig);
    
    // 发送主题配置更新事件
    eventBus.emit('theme:config-updated', newConfig);
  }

  async resetThemeConfig(): Promise<void> {
    storageService.remove(STORAGE_KEYS.THEME_CONFIG || 'super-admin-theme-config');
    
    // 发送主题配置重置事件
    eventBus.emit('theme:config-reset');
  }

  async toggleThemeMode(): Promise<void> {
    const currentConfig = this.getThemeConfig();
    const newMode = currentConfig.mode === 'light' ? 'dark' : 'light';
    await this.updateThemeConfig({ mode: newMode });
  }

  // 语言相关
  getCurrentLanguage(): string {
    return storageService.get(STORAGE_KEYS.LANGUAGE || 'super-admin-language') || 'zh-CN';
  }

  getLanguageConfigs(): LanguageConfig[] {
    return [
      { key: 'zh-CN', title: '简体中文', icon: '🇨🇳' },
      { key: 'en-US', title: 'English', icon: '🇺🇸' },
    ];
  }

  async setLanguage(language: string): Promise<void> {
    storageService.set(STORAGE_KEYS.LANGUAGE || 'super-admin-language', language);
    
    // 发送语言变更事件
    eventBus.emit('language:changed', language);
  }

  // 设备信息相关
  getDeviceInfo(): DeviceInfo {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // 根据宽度确定断点
    let breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' = 'lg';
    if (width < 576) breakpoint = 'xs';
    else if (width < 768) breakpoint = 'sm';
    else if (width < 992) breakpoint = 'md';
    else if (width < 1200) breakpoint = 'lg';
    else if (width < 1600) breakpoint = 'xl';
    else breakpoint = 'xxl';
    
    return {
      breakpoint,
      isMobile: width < 768,
      isTablet: width >= 768 && width < 992,
      isDesktop: width >= 992,
      width,
      height,
    };
  }

  updateDeviceInfo(info: Partial<DeviceInfo>): void {
    const currentInfo = this.getDeviceInfo();
    const newInfo = { ...currentInfo, ...info };
    
    // 发送设备信息更新事件
    eventBus.emit('device:info-updated', newInfo);
  }

  // 标签页相关
  getTabs(): TabConfig[] {
    return storageService.get(STORAGE_KEYS.TABS || 'super-admin-tabs') || [];
  }

  async addTab(tab: TabConfig): Promise<void> {
    const tabs = this.getTabs();
    
    // 检查标签页是否已存在
    const existingTab = tabs.find(t => t.key === tab.key);
    if (!existingTab) {
      tabs.push(tab);
    }
    
    // 保存标签页
    storageService.set(STORAGE_KEYS.TABS || 'super-admin-tabs', tabs);
    storageService.set(STORAGE_KEYS.ACTIVE_TAB || 'super-admin-active-tab', tab.key);
    
    // 发送标签页添加事件
    eventBus.emit('tab:added', tab);
  }

  async closeTab(key: string): Promise<void> {
    const tabs = this.getTabs();
    const index = tabs.findIndex(tab => tab.key === key);
    
    if (index === -1) return;
    
    const tab = tabs[index];
    if (tab.fixed) return; // 固定标签页不能关闭
    
    tabs.splice(index, 1);
    
    // 保存标签页
    storageService.set(STORAGE_KEYS.TABS || 'super-admin-tabs', tabs);
    
    // 发送标签页关闭事件
    eventBus.emit('tab:closed', key);
  }

  async closeOtherTabs(key: string): Promise<void> {
    const tabs = this.getTabs();
    const filteredTabs = tabs.filter(tab => tab.key === key || tab.fixed);
    
    // 保存标签页
    storageService.set(STORAGE_KEYS.TABS || 'super-admin-tabs', filteredTabs);
    storageService.set(STORAGE_KEYS.ACTIVE_TAB || 'super-admin-active-tab', key);
    
    // 发送标签页关闭事件
    eventBus.emit('tab:others-closed', key);
  }

  async closeAllTabs(): Promise<void> {
    const tabs = this.getTabs();
    const filteredTabs = tabs.filter(tab => tab.fixed);
    
    // 保存标签页
    storageService.set(STORAGE_KEYS.TABS || 'super-admin-tabs', filteredTabs);
    
    if (filteredTabs.length > 0) {
      storageService.set(STORAGE_KEYS.ACTIVE_TAB || 'super-admin-active-tab', filteredTabs[0].key);
    }
    
    // 发送标签页关闭事件
    eventBus.emit('tab:all-closed');
  }

  async switchTab(key: string): Promise<void> {
    storageService.set(STORAGE_KEYS.ACTIVE_TAB || 'super-admin-active-tab', key);
    
    // 发送标签页切换事件
    eventBus.emit('tab:switched', key);
  }

  // 面包屑相关
  setBreadcrumbs(items: BreadcrumbItem[]): void {
    // 发送面包屑更新事件
    eventBus.emit('breadcrumb:updated', items);
  }

  // 通知相关
  getNotifications(): NotificationItem[] {
    return storageService.get(STORAGE_KEYS.NOTIFICATIONS || 'super-admin-notifications') || [];
  }

  async addNotification(notification: NotificationItem): Promise<void> {
    const notifications = this.getNotifications();
    notifications.unshift(notification);
    
    // 保存通知
    storageService.set(STORAGE_KEYS.NOTIFICATIONS || 'super-admin-notifications', notifications);
    
    // 发送通知添加事件
    eventBus.emit('notification:added', notification);
  }

  async markNotificationAsRead(id: string): Promise<void> {
    const notifications = this.getNotifications();
    const notification = notifications.find(n => n.id === id);
    
    if (notification) {
      notification.read = true;
      
      // 保存通知
      storageService.set(STORAGE_KEYS.NOTIFICATIONS || 'super-admin-notifications', notifications);
      
      // 发送通知已读事件
      eventBus.emit('notification:read', id);
    }
  }

  async markAllNotificationsAsRead(): Promise<void> {
    const notifications = this.getNotifications();
    notifications.forEach(notification => {
      notification.read = true;
    });
    
    // 保存通知
    storageService.set(STORAGE_KEYS.NOTIFICATIONS || 'super-admin-notifications', notifications);
    
    // 发送所有通知已读事件
    eventBus.emit('notification:all-read');
  }

  async removeNotification(id: string): Promise<void> {
    const notifications = this.getNotifications();
    const index = notifications.findIndex(n => n.id === id);
    
    if (index !== -1) {
      notifications.splice(index, 1);
      
      // 保存通知
      storageService.set(STORAGE_KEYS.NOTIFICATIONS || 'super-admin-notifications', notifications);
      
      // 发送通知删除事件
      eventBus.emit('notification:removed', id);
    }
  }

  async clearNotifications(): Promise<void> {
    storageService.remove(STORAGE_KEYS.NOTIFICATIONS || 'super-admin-notifications');
    
    // 发送通知清空事件
    eventBus.emit('notification:cleared');
  }

  // 搜索相关
  getSearchConfig(): SearchConfig {
    return {
      enabled: true,
      placeholder: '搜索菜单、页面或组件',
      maxResults: 10,
      searchInMenu: true,
      searchInHistory: true,
      searchInPages: true,
      showHistory: true,
      maxHistoryItems: 10,
      hotkeys: ['ctrl+k', 'cmd+k'],
    };
  }

  async updateSearchConfig(config: Partial<SearchConfig>): Promise<void> {
    const currentConfig = this.getSearchConfig();
    const newConfig = { ...currentConfig, ...config };
    
    // 保存搜索配置
    storageService.set(STORAGE_KEYS.SEARCH_CONFIG || 'super-admin-search-config', newConfig);
    
    // 发送搜索配置更新事件
    eventBus.emit('search:config-updated', newConfig);
  }

  async performSearch(query: string): Promise<SearchResultItem[]> {
    // 添加到搜索历史
    const history = this.getSearchHistory();
    if (!history.includes(query)) {
      history.unshift(query);
      if (history.length > 10) {
        history.splice(10);
      }
      storageService.set(STORAGE_KEYS.SEARCH_HISTORY || 'super-admin-search-history', history);
    }
    
    // 这里应该调用搜索服务获取结果
    // 暂时返回模拟数据
    const results: SearchResultItem[] = [
      {
        key: '1',
        title: '用户管理',
        path: '/user',
        icon: 'user',
        description: '管理系统用户',
        type: 'menu',
      },
      {
        key: '2',
        title: '角色管理',
        path: '/role',
        icon: 'team',
        description: '管理系统角色',
        type: 'menu',
      },
    ];
    
    // 发送搜索结果事件
    eventBus.emit('search:performed', { query, results });
    
    return results;
  }

  getSearchHistory(): string[] {
    return storageService.get(STORAGE_KEYS.SEARCH_HISTORY || 'super-admin-search-history') || [];
  }

  async clearSearchHistory(): Promise<void> {
    storageService.remove(STORAGE_KEYS.SEARCH_HISTORY || 'super-admin-search-history');
    
    // 发送搜索历史清空事件
    eventBus.emit('search:history-cleared');
  }

  // 私有方法
  private getDefaultLayoutConfig(): LayoutConfig {
    return {
      mode: 'side',
      sidebar: {
        collapsed: false,
        width: 240,
        collapsedWidth: 64,
        show: true,
      },
      header: {
        show: true,
        height: 60,
        fixed: true,
        showBreadcrumb: true,
        showTabs: true,
        showFullscreen: true,
        showNotification: true,
        showThemeToggle: true,
        showLanguageToggle: true,
        showUserDropdown: true,
      },
      content: {
        padding: 16,
        minHeight: 400,
        showFooter: true,
        fullHeight: false,
      },
      tabs: {
        show: true,
        cache: true,
        showHome: true,
        showQuickButton: true,
        style: 'card',
      },
      footer: {
        show: true,
        height: 48,
        fixed: false,
        content: '© 2024 Super Admin',
      },
      menu: {
        accordion: false,
        collapsedShowTitle: false,
        showFirstLevelMenuIcon: true,
        subMenuWidth: 200,
      },
      animation: {
        enabled: true,
        mode: 'fade',
        duration: 300,
      },
      watermark: {
        enabled: false,
        content: 'Super Admin',
        color: 'rgba(0, 0, 0, 0.1)',
        fontSize: 16,
        fontFamily: 'Arial',
        zIndex: 9999,
        rotate: -22,
        gap: [100, 100],
        offset: [0, 0],
      },
    };
  }

  private getDefaultThemeConfig(): ThemeConfig {
    return {
      name: 'default',
      label: '默认主题',
      mode: 'light',
      primaryColor: '#1890ff',
      successColor: '#52c41a',
      warningColor: '#faad14',
      errorColor: '#f5222d',
      infoColor: '#1890ff',
      componentSize: 'medium',
      borderRadius: 6,
    };
  }
}

// 创建布局服务实例
export const layoutService = new LayoutServiceImpl();