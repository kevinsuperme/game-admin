// 布局域状态管理

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { 
  LayoutConfig, 
  LayoutMode, 
  SidebarState, 
  HeaderState, 
  ContentState,
  TabConfig,
  BreadcrumbItem,
  DeviceInfo,
  FullscreenState,
  NotificationItem,
  ThemeConfig,
  LanguageConfig,
  PageLoadingState,
  SearchConfig,
  SearchResultItem
} from '../types';
import { storageService } from '../../infrastructure/storage';
import { STORAGE_KEYS } from '../../shared/constants';

// 默认布局配置
const defaultLayoutConfig: LayoutConfig = {
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
    content: '© 2024 Fantastic Admin',
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
    content: 'Fantastic Admin',
    color: 'rgba(0, 0, 0, 0.1)',
    fontSize: 16,
    fontFamily: 'Arial',
    zIndex: 9999,
    rotate: -22,
    gap: [100, 100],
    offset: [0, 0],
  },
};

// 默认主题配置
const defaultThemeConfig: ThemeConfig = {
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

// 默认语言配置
const defaultLanguageConfigs: LanguageConfig[] = [
  { key: 'zh-CN', title: '简体中文', icon: '🇨🇳' },
  { key: 'en-US', title: 'English', icon: '🇺🇸' },
];

// 默认搜索配置
const defaultSearchConfig: SearchConfig = {
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

export const useLayoutStore = defineStore('layout', () => {
  // 状态
  const layoutConfig = ref<LayoutConfig>({ ...defaultLayoutConfig });
  const themeConfig = ref<ThemeConfig>({ ...defaultThemeConfig });
  const currentLanguage = ref<string>('zh-CN');
  const languageConfigs = ref<LanguageConfig[]>([...defaultLanguageConfigs]);
  const deviceInfo = ref<DeviceInfo>({
    breakpoint: 'lg',
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    width: 1920,
    height: 1080,
  });
  const fullscreenState = ref<FullscreenState>({
    enabled: true,
    isFullscreen: false,
  });
  const tabs = ref<TabConfig[]>([]);
  const activeTabKey = ref<string>('');
  const breadcrumbs = ref<BreadcrumbItem[]>([]);
  const notifications = ref<NotificationItem[]>([]);
  const pageLoading = ref<PageLoadingState>({
    loading: false,
    tip: '加载中...',
    delay: 0,
    background: 'rgba(255, 255, 255, 0.7)',
    opacity: 0.8,
    spinner: true,
  });
  const searchConfig = ref<SearchConfig>({ ...defaultSearchConfig });
  const searchVisible = ref(false);
  const searchResults = ref<SearchResultItem[]>([]);
  const searchHistory = ref<string[]>([]);

  // 计算属性
  const sidebarCollapsed = computed(() => layoutConfig.value.sidebar.collapsed);
  const sidebarWidth = computed(() => 
    sidebarCollapsed.value 
      ? layoutConfig.value.sidebar.collapsedWidth 
      : layoutConfig.value.sidebar.width
  );
  const headerHeight = computed(() => layoutConfig.value.header.height);
  const footerHeight = computed(() => layoutConfig.value.footer.height);
  const contentHeight = computed(() => {
    const windowHeight = deviceInfo.value.height;
    const header = layoutConfig.value.header.show ? headerHeight.value : 0;
    const footer = layoutConfig.value.footer.show ? footerHeight.value : 0;
    return windowHeight - header - footer;
  });
  const isDarkMode = computed(() => themeConfig.value.mode === 'dark');
  const currentLanguageConfig = computed(() => 
    languageConfigs.value.find(lang => lang.key === currentLanguage.value) || languageConfigs.value[0]
  );
  const unreadNotifications = computed(() => 
    notifications.value.filter(notification => !notification.read)
  );
  const unreadNotificationCount = computed(() => unreadNotifications.value.length);

  // 初始化
  const initLayout = () => {
    // 从存储中加载配置
    loadLayoutConfig();
    loadThemeConfig();
    loadLanguage();
    loadTabs();
    loadSearchHistory();
    
    // 初始化标签页
    if (tabs.value.length === 0) {
      addTab({
        key: 'home',
        title: '首页',
        path: '/',
        closable: false,
        fixed: true,
        icon: 'home',
      });
    }
  };

  // 加载布局配置
  const loadLayoutConfig = () => {
    const savedConfig = storageService.get(STORAGE_KEYS.LAYOUT_CONFIG || 'fantastic-admin-layout-config');
    if (savedConfig) {
      layoutConfig.value = { ...defaultLayoutConfig, ...savedConfig };
    }
  };

  // 保存布局配置
  const saveLayoutConfig = () => {
    storageService.set(STORAGE_KEYS.LAYOUT_CONFIG || 'fantastic-admin-layout-config', layoutConfig.value);
  };

  // 加载主题配置
  const loadThemeConfig = () => {
    const savedConfig = storageService.get(STORAGE_KEYS.THEME_CONFIG || 'fantastic-admin-theme-config');
    if (savedConfig) {
      themeConfig.value = { ...defaultThemeConfig, ...savedConfig };
    }
  };

  // 保存主题配置
  const saveThemeConfig = () => {
    storageService.set(STORAGE_KEYS.THEME_CONFIG || 'fantastic-admin-theme-config', themeConfig.value);
  };

  // 加载语言
  const loadLanguage = () => {
    const savedLanguage = storageService.get(STORAGE_KEYS.LANGUAGE || 'fantastic-admin-language');
    if (savedLanguage) {
      currentLanguage.value = savedLanguage;
    }
  };

  // 保存语言
  const saveLanguage = () => {
    storageService.set(STORAGE_KEYS.LANGUAGE || 'fantastic-admin-language', currentLanguage.value);
  };

  // 加载标签页
  const loadTabs = () => {
    const savedTabs = storageService.get(STORAGE_KEYS.TABS || 'fantastic-admin-tabs');
    if (savedTabs) {
      tabs.value = savedTabs;
      const savedActiveTab = storageService.get(STORAGE_KEYS.ACTIVE_TAB || 'fantastic-admin-active-tab');
      if (savedActiveTab) {
        activeTabKey.value = savedActiveTab;
      }
    }
  };

  // 保存标签页
  const saveTabs = () => {
    storageService.set(STORAGE_KEYS.TABS || 'fantastic-admin-tabs', tabs.value);
    storageService.set(STORAGE_KEYS.ACTIVE_TAB || 'fantastic-admin-active-tab', activeTabKey.value);
  };

  // 加载搜索历史
  const loadSearchHistory = () => {
    const savedHistory = storageService.get(STORAGE_KEYS.SEARCH_HISTORY || 'fantastic-admin-search-history');
    if (savedHistory) {
      searchHistory.value = savedHistory;
    }
  };

  // 保存搜索历史
  const saveSearchHistory = () => {
    storageService.set(STORAGE_KEYS.SEARCH_HISTORY || 'fantastic-admin-search-history', searchHistory.value);
  };

  // 更新布局配置
  const updateLayoutConfig = (config: Partial<LayoutConfig>) => {
    layoutConfig.value = { ...layoutConfig.value, ...config };
    saveLayoutConfig();
  };

  // 切换侧边栏折叠状态
  const toggleSidebar = () => {
    layoutConfig.value.sidebar.collapsed = !layoutConfig.value.sidebar.collapsed;
    saveLayoutConfig();
  };

  // 设置侧边栏折叠状态
  const setSidebarCollapsed = (collapsed: boolean) => {
    layoutConfig.value.sidebar.collapsed = collapsed;
    saveLayoutConfig();
  };

  // 设置侧边栏宽度
  const setSidebarWidth = (width: number) => {
    layoutConfig.value.sidebar.width = width;
    saveLayoutConfig();
  };

  // 切换布局模式
  const setLayoutMode = (mode: LayoutMode) => {
    layoutConfig.value.mode = mode;
    saveLayoutConfig();
  };

  // 更新主题配置
  const updateThemeConfig = (config: Partial<ThemeConfig>) => {
    themeConfig.value = { ...themeConfig.value, ...config };
    saveThemeConfig();
  };

  // 切换主题模式
  const toggleThemeMode = () => {
    const newMode = themeConfig.value.mode === 'light' ? 'dark' : 'light';
    updateThemeConfig({ mode: newMode });
  };

  // 设置主题模式
  const setThemeMode = (mode: 'light' | 'dark' | 'auto') => {
    updateThemeConfig({ mode });
  };

  // 设置主色调
  const setPrimaryColor = (color: string) => {
    updateThemeConfig({ primaryColor: color });
  };

  // 切换语言
  const setLanguage = (language: string) => {
    currentLanguage.value = language;
    saveLanguage();
  };

  // 更新设备信息
  const updateDeviceInfo = (info: Partial<DeviceInfo>) => {
    deviceInfo.value = { ...deviceInfo.value, ...info };
  };

  // 切换全屏状态
  const toggleFullscreen = () => {
    if (!fullscreenState.value.enabled) return;
    
    if (document.fullscreenElement) {
      document.exitFullscreen();
      fullscreenState.value.isFullscreen = false;
    } else {
      document.documentElement.requestFullscreen();
      fullscreenState.value.isFullscreen = true;
    }
  };

  // 设置全屏状态
  const setFullscreenState = (isFullscreen: boolean) => {
    fullscreenState.value.isFullscreen = isFullscreen;
  };

  // 添加标签页
  const addTab = (tab: TabConfig) => {
    // 检查标签页是否已存在
    const existingTab = tabs.value.find(t => t.key === tab.key);
    
    if (!existingTab) {
      tabs.value.push(tab);
    }
    
    // 激活标签页
    activeTabKey.value = tab.key;
    saveTabs();
  };

  // 关闭标签页
  const closeTab = (key: string) => {
    const index = tabs.value.findIndex(tab => tab.key === key);
    if (index === -1) return;
    
    const tab = tabs.value[index];
    if (tab.fixed) return; // 固定标签页不能关闭
    
    tabs.value.splice(index, 1);
    
    // 如果关闭的是当前激活的标签页，则激活相邻的标签页
    if (activeTabKey.value === key) {
      if (tabs.value.length > 0) {
        if (index < tabs.value.length) {
          activeTabKey.value = tabs.value[index].key;
        } else {
          activeTabKey.value = tabs.value[index - 1].key;
        }
      }
    }
    
    saveTabs();
  };

  // 关闭其他标签页
  const closeOtherTabs = (key: string) => {
    tabs.value = tabs.value.filter(tab => tab.key === key || tab.fixed);
    activeTabKey.value = key;
    saveTabs();
  };

  // 关闭所有标签页
  const closeAllTabs = () => {
    tabs.value = tabs.value.filter(tab => tab.fixed);
    if (tabs.value.length > 0) {
      activeTabKey.value = tabs.value[0].key;
    }
    saveTabs();
  };

  // 切换标签页
  const switchTab = (key: string) => {
    activeTabKey.value = key;
    saveTabs();
  };

  // 设置面包屑
  const setBreadcrumbs = (items: BreadcrumbItem[]) => {
    breadcrumbs.value = items;
  };

  // 添加通知
  const addNotification = (notification: NotificationItem) => {
    notifications.value.unshift(notification);
  };

  // 标记通知为已读
  const markNotificationAsRead = (id: string) => {
    const notification = notifications.value.find(n => n.id === id);
    if (notification) {
      notification.read = true;
    }
  };

  // 标记所有通知为已读
  const markAllNotificationsAsRead = () => {
    notifications.value.forEach(notification => {
      notification.read = true;
    });
  };

  // 删除通知
  const removeNotification = (id: string) => {
    const index = notifications.value.findIndex(n => n.id === id);
    if (index !== -1) {
      notifications.value.splice(index, 1);
    }
  };

  // 清空所有通知
  const clearNotifications = () => {
    notifications.value = [];
  };

  // 设置页面加载状态
  const setPageLoading = (loading: boolean, options?: Partial<PageLoadingState>) => {
    pageLoading.value = { ...pageLoading.value, loading, ...options };
  };

  // 显示搜索框
  const showSearch = () => {
    searchVisible.value = true;
  };

  // 隐藏搜索框
  const hideSearch = () => {
    searchVisible.value = false;
    searchResults.value = [];
  };

  // 执行搜索
  const performSearch = (query: string) => {
    if (!query.trim()) {
      searchResults.value = [];
      return;
    }
    
    // 添加到搜索历史
    if (!searchHistory.value.includes(query)) {
      searchHistory.value.unshift(query);
      if (searchHistory.value.length > searchConfig.value.maxHistoryItems) {
        searchHistory.value = searchHistory.value.slice(0, searchConfig.value.maxHistoryItems);
      }
      saveSearchHistory();
    }
    
    // 这里应该调用搜索服务获取结果
    // 暂时使用模拟数据
    searchResults.value = [
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
  };

  // 清空搜索历史
  const clearSearchHistory = () => {
    searchHistory.value = [];
    saveSearchHistory();
  };

  // 重置布局配置
  const resetLayoutConfig = () => {
    layoutConfig.value = { ...defaultLayoutConfig };
    saveLayoutConfig();
  };

  // 重置主题配置
  const resetThemeConfig = () => {
    themeConfig.value = { ...defaultThemeConfig };
    saveThemeConfig();
  };

  return {
    // 状态
    layoutConfig,
    themeConfig,
    currentLanguage,
    languageConfigs,
    deviceInfo,
    fullscreenState,
    tabs,
    activeTabKey,
    breadcrumbs,
    notifications,
    pageLoading,
    searchConfig,
    searchVisible,
    searchResults,
    searchHistory,
    
    // 计算属性
    sidebarCollapsed,
    sidebarWidth,
    headerHeight,
    footerHeight,
    contentHeight,
    isDarkMode,
    currentLanguageConfig,
    unreadNotifications,
    unreadNotificationCount,
    
    // 方法
    initLayout,
    updateLayoutConfig,
    toggleSidebar,
    setSidebarCollapsed,
    setSidebarWidth,
    setLayoutMode,
    updateThemeConfig,
    toggleThemeMode,
    setThemeMode,
    setPrimaryColor,
    setLanguage,
    updateDeviceInfo,
    toggleFullscreen,
    setFullscreenState,
    addTab,
    closeTab,
    closeOtherTabs,
    closeAllTabs,
    switchTab,
    setBreadcrumbs,
    addNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    removeNotification,
    clearNotifications,
    setPageLoading,
    showSearch,
    hideSearch,
    performSearch,
    clearSearchHistory,
    resetLayoutConfig,
    resetThemeConfig,
  };
});