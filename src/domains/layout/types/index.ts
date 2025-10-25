// 布局域类型定义

// 布局模式
export type LayoutMode = 'side' | 'top' | 'mix' | 'single';

// 侧边栏状态
export type SidebarState = {
  collapsed: boolean;
  width: number;
  collapsedWidth: number;
  show: boolean;
};

// 顶部导航栏状态
export type HeaderState = {
  show: boolean;
  height: number;
  fixed: boolean;
  showBreadcrumb: boolean;
  showTabs: boolean;
  showFullscreen: boolean;
  showNotification: boolean;
  showThemeToggle: boolean;
  showLanguageToggle: boolean;
  showUserDropdown: boolean;
};

// 内容区域状态
export type ContentState = {
  padding: number;
  minHeight: number;
  showFooter: boolean;
  fullHeight: boolean;
};

// 标签页配置
export type TabConfig = {
  key: string;
  title: string;
  path: string;
  query?: Record<string, any>;
  params?: Record<string, any>;
  closable?: boolean;
  fixed?: boolean;
  icon?: string;
  locale?: string;
};

// 面包屑项
export type BreadcrumbItem = {
  title: string;
  path?: string;
  icon?: string;
  disabled?: boolean;
};

// 菜单项
export type MenuItem = {
  key: string;
  title: string;
  path?: string;
  icon?: string;
  children?: MenuItem[];
  badge?: string | number;
  hidden?: boolean;
  disabled?: boolean;
  target?: '_blank' | '_self';
  external?: boolean;
  permission?: string | string[];
  roles?: string[];
  keepAlive?: boolean;
  component?: string;
  redirect?: string;
  sort?: number;
  meta?: Record<string, any>;
};

// 布局配置
export type LayoutConfig = {
  mode: LayoutMode;
  sidebar: SidebarState;
  header: HeaderState;
  content: ContentState;
  tabs: {
    show: boolean;
    cache: boolean;
    showHome: boolean;
    showQuickButton: boolean;
    style: 'card' | 'line' | 'button';
  };
  footer: {
    show: boolean;
    height: number;
    fixed: boolean;
    content: string;
  };
  menu: {
    accordion: boolean;
    collapsedShowTitle: boolean;
    showFirstLevelMenuIcon: boolean;
    subMenuWidth: number;
  };
  animation: {
    enabled: boolean;
    mode: 'fade' | 'slide' | 'zoom' | 'flip';
    duration: number;
  };
  watermark: {
    enabled: boolean;
    content: string;
    color: string;
    fontSize: number;
    fontFamily: string;
    zIndex: number;
    rotate: number;
    gap: [number, number];
    offset: [number, number];
  };
};

// 布局主题
export type LayoutTheme = {
  name: string;
  label: string;
  mode: LayoutMode;
  darkMode: boolean;
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  sidebarColor: string;
  headerColor: string;
};

// 响应式断点
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

// 设备信息
export type DeviceInfo = {
  breakpoint: Breakpoint;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
  height: number;
};

// 全屏状态
export type FullscreenState = {
  enabled: boolean;
  isFullscreen: boolean;
};

// 通知项
export type NotificationItem = {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  timestamp: number;
  avatar?: string;
  duration?: number;
  onClick?: () => void;
  onClose?: () => void;
};

// 用户信息下拉菜单项
export type UserDropdownItem = {
  key: string;
  title: string;
  icon?: string;
  path?: string;
  divided?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children?: UserDropdownItem[];
};

// 语言配置
export type LanguageConfig = {
  key: string;
  title: string;
  icon?: string;
  flag?: string;
};

// 主题配置
export type ThemeConfig = {
  name: string;
  label: string;
  mode: 'light' | 'dark' | 'auto';
  primaryColor: string;
  successColor: string;
  warningColor: string;
  errorColor: string;
  infoColor: string;
  componentSize: 'small' | 'medium' | 'large';
  borderRadius: number;
};

// 页面加载状态
export type PageLoadingState = {
  loading: boolean;
  tip?: string;
  delay?: number;
  background?: string;
  opacity?: number;
  spinner?: boolean;
};

// 快捷操作项
export type QuickActionItem = {
  key: string;
  title: string;
  icon: string;
  path?: string;
  onClick?: () => void;
  badge?: string | number;
  tooltip?: string;
  disabled?: boolean;
};

// 搜索结果项
export type SearchResultItem = {
  key: string;
  title: string;
  path: string;
  icon?: string;
  description?: string;
  type: 'menu' | 'page' | 'component';
};

// 搜索配置
export type SearchConfig = {
  enabled: boolean;
  placeholder: string;
  maxResults: number;
  searchInMenu: boolean;
  searchInHistory: boolean;
  searchInPages: boolean;
  showHistory: boolean;
  maxHistoryItems: number;
  hotkeys: string[];
};

// 布局事件
export type LayoutEvents = {
  'sidebar:collapse': (collapsed: boolean) => void;
  'sidebar:width-change': (width: number) => void;
  'header:height-change': (height: number) => void;
  'tab:add': (tab: TabConfig) => void;
  'tab:close': (key: string) => void;
  'tab:switch': (key: string) => void;
  'menu:select': (key: string) => void;
  'menu:open': (key: string) => void;
  'menu:close': (key: string) => void;
  'theme:change': (theme: ThemeConfig) => void;
  'language:change': (language: string) => void;
  'fullscreen:change': (isFullscreen: boolean) => void;
  'notification:read': (id: string) => void;
  'notification:clear': () => void;
  'search:open': () => void;
  'search:close': () => void;
  'search:select': (item: SearchResultItem) => void;
};