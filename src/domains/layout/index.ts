// 布局域入口文件

// 类型定义
export * from './types';

// 服务
export * from './services';

// 状态管理
export * from './stores';

// 工具函数
export * from './utils';

// 常量
export const LAYOUT_DOMAIN_NAME = 'layout';

// 默认配置
export const DEFAULT_LAYOUT_CONFIG = {
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

export const DEFAULT_THEME_CONFIG = {
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

export const DEFAULT_LANGUAGE_CONFIGS = [
  { key: 'zh-CN', title: '简体中文', icon: '🇨🇳' },
  { key: 'en-US', title: 'English', icon: '🇺🇸' },
];

export const DEFAULT_SEARCH_CONFIG = {
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