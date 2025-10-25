// 布局域工具函数

import type { 
  LayoutConfig, 
  ThemeConfig, 
  DeviceInfo,
  NotificationItem,
  SearchResultItem,
  TabConfig,
  BreadcrumbItem,
  MenuItem
} from '../types';

// 布局相关工具函数

/**
 * 获取布局模式显示名称
 */
export function getLayoutModeDisplayName(mode: string): string {
  const modeMap: Record<string, string> = {
    side: '侧边菜单模式',
    top: '顶部菜单模式',
    mix: '混合菜单模式',
  };
  return modeMap[mode] || mode;
}

/**
 * 获取主题模式显示名称
 */
export function getThemeModeDisplayName(mode: string): string {
  const modeMap: Record<string, string> = {
    light: '浅色主题',
    dark: '深色主题',
    auto: '跟随系统',
  };
  return modeMap[mode] || mode;
}

/**
 * 获取设备类型显示名称
 */
export function getDeviceTypeDisplayName(device: DeviceInfo): string {
  if (device.isMobile) return '移动设备';
  if (device.isTablet) return '平板设备';
  if (device.isDesktop) return '桌面设备';
  return '未知设备';
}

/**
 * 获取断点显示名称
 */
export function getBreakpointDisplayName(breakpoint: string): string {
  const breakpointMap: Record<string, string> = {
    xs: '超小屏幕',
    sm: '小屏幕',
    md: '中等屏幕',
    lg: '大屏幕',
    xl: '超大屏幕',
    xxl: '超超大屏幕',
  };
  return breakpointMap[breakpoint] || breakpoint;
}

/**
 * 获取通知类型显示名称
 */
export function getNotificationTypeDisplayName(type: string): string {
  const typeMap: Record<string, string> = {
    info: '信息',
    success: '成功',
    warning: '警告',
    error: '错误',
  };
  return typeMap[type] || type;
}

/**
 * 获取通知类型对应的图标
 */
export function getNotificationTypeIcon(type: string): string {
  const iconMap: Record<string, string> = {
    info: 'info-circle',
    success: 'check-circle',
    warning: 'exclamation-circle',
    error: 'close-circle',
  };
  return iconMap[type] || 'info-circle';
}

/**
 * 获取通知类型对应的颜色
 */
export function getNotificationTypeColor(type: string): string {
  const colorMap: Record<string, string> = {
    info: '#1890ff',
    success: '#52c41a',
    warning: '#faad14',
    error: '#f5222d',
  };
  return colorMap[type] || '#1890ff';
}

/**
 * 获取搜索结果类型显示名称
 */
export function getSearchResultTypeDisplayName(type: string): string {
  const typeMap: Record<string, string> = {
    menu: '菜单',
    page: '页面',
    component: '组件',
    history: '历史记录',
  };
  return typeMap[type] || type;
}

/**
 * 获取搜索结果类型对应的图标
 */
export function getSearchResultTypeIcon(type: string): string {
  const iconMap: Record<string, string> = {
    menu: 'menu',
    page: 'file',
    component: 'code',
    history: 'clock-circle',
  };
  return iconMap[type] || 'file';
}

/**
 * 获取标签页样式显示名称
 */
export function getTabStyleDisplayName(style: string): string {
  const styleMap: Record<string, string> = {
    card: '卡片式',
    line: '线条式',
    button: '按钮式',
  };
  return styleMap[style] || style;
}

/**
 * 获取动画模式显示名称
 */
export function getAnimationModeDisplayName(mode: string): string {
  const modeMap: Record<string, string> = {
    fade: '淡入淡出',
    slide: '滑动',
    zoom: '缩放',
    none: '无动画',
  };
  return modeMap[mode] || mode;
}

/**
 * 获取组件尺寸显示名称
 */
export function getComponentSizeDisplayName(size: string): string {
  const sizeMap: Record<string, string> = {
    small: '小',
    medium: '中',
    large: '大',
  };
  return sizeMap[size] || size;
}

/**
 * 根据路径生成标签页标题
 */
export function generateTabTitle(path: string, menuItems: MenuItem[]): string {
  // 查找匹配的菜单项
  const findMenuItem = (items: MenuItem[], path: string): MenuItem | null => {
    for (const item of items) {
      if (item.path === path) {
        return item;
      }
      if (item.children) {
        const found = findMenuItem(item.children, path);
        if (found) return found;
      }
    }
    return null;
  };
  
  const menuItem = findMenuItem(menuItems, path);
  return menuItem?.title || path;
}

/**
 * 根据路径生成面包屑
 */
export function generateBreadcrumbs(path: string, menuItems: MenuItem[]): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [];
  
  // 查找菜单项路径
  const findMenuPath = (items: MenuItem[], path: string, currentPath: MenuItem[] = []): MenuItem[] | null => {
    for (const item of items) {
      const newPath = [...currentPath, item];
      if (item.path === path) {
        return newPath;
      }
      if (item.children) {
        const found = findMenuPath(item.children, path, newPath);
        if (found) return found;
      }
    }
    return null;
  };
  
  const menuPath = findMenuPath(menuItems, path);
  if (menuPath) {
    menuPath.forEach((item, index) => {
      breadcrumbs.push({
        title: item.title,
        path: item.path,
        icon: item.icon,
        disabled: index === menuPath.length - 1, // 最后一个不可点击
      });
    });
  } else {
    // 如果没有找到匹配的菜单项，则使用路径生成面包屑
    const pathSegments = path.split('/').filter(Boolean);
    let currentPath = '';
    
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      breadcrumbs.push({
        title: segment,
        path: currentPath,
        disabled: index === pathSegments.length - 1,
      });
    });
  }
  
  return breadcrumbs;
}

/**
 * 生成唯一ID
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 格式化时间
 */
export function formatTime(time: string | Date): string {
  const date = new Date(time);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  // 一分钟内
  if (diff < 60 * 1000) {
    return '刚刚';
  }
  
  // 一小时内
  if (diff < 60 * 60 * 1000) {
    return `${Math.floor(diff / (60 * 1000))}分钟前`;
  }
  
  // 一天内
  if (diff < 24 * 60 * 60 * 1000) {
    return `${Math.floor(diff / (60 * 60 * 1000))}小时前`;
  }
  
  // 一周内
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    return `${Math.floor(diff / (24 * 60 * 60 * 1000))}天前`;
  }
  
  // 超过一周，显示具体日期
  return date.toLocaleDateString();
}

/**
 * 获取主题色彩变量
 */
export function getThemeColorVariables(theme: ThemeConfig): Record<string, string> {
  return {
    '--primary-color': theme.primaryColor,
    '--success-color': theme.successColor,
    '--warning-color': theme.warningColor,
    '--error-color': theme.errorColor,
    '--info-color': theme.infoColor,
    '--component-size': theme.componentSize,
    '--border-radius': `${theme.borderRadius}px`,
  };
}

/**
 * 应用主题色彩变量
 */
export function applyThemeColorVariables(theme: ThemeConfig): void {
  const variables = getThemeColorVariables(theme);
  const root = document.documentElement;
  
  Object.entries(variables).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}

/**
 * 检查是否为移动设备
 */
export function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * 检查是否为平板设备
 */
export function isTabletDevice(): boolean {
  return /iPad|Android/i.test(navigator.userAgent) && !isMobileDevice();
}

/**
 * 检查是否为桌面设备
 */
export function isDesktopDevice(): boolean {
  return !isMobileDevice() && !isTabletDevice();
}

/**
 * 获取设备信息
 */
export function getDeviceInfo(): DeviceInfo {
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

/**
 * 检查是否支持全屏
 */
export function isFullscreenSupported(): boolean {
  return !!(
    document.fullscreenEnabled ||
    (document as any).webkitFullscreenEnabled ||
    (document as any).mozFullScreenEnabled ||
    (document as any).msFullscreenEnabled
  );
}

/**
 * 进入全屏
 */
export function enterFullscreen(element: Element = document.documentElement): Promise<void> {
  if (element.requestFullscreen) {
    return element.requestFullscreen();
  } else if ((element as any).webkitRequestFullscreen) {
    return (element as any).webkitRequestFullscreen();
  } else if ((element as any).mozRequestFullScreen) {
    return (element as any).mozRequestFullScreen();
  } else if ((element as any).msRequestFullscreen) {
    return (element as any).msRequestFullscreen();
  } else {
    return Promise.reject(new Error('Fullscreen not supported'));
  }
}

/**
 * 退出全屏
 */
export function exitFullscreen(): Promise<void> {
  if (document.exitFullscreen) {
    return document.exitFullscreen();
  } else if ((document as any).webkitExitFullscreen) {
    return (document as any).webkitExitFullscreen();
  } else if ((document as any).mozCancelFullScreen) {
    return (document as any).mozCancelFullScreen();
  } else if ((document as any).msExitFullscreen) {
    return (document as any).msExitFullscreen();
  } else {
    return Promise.reject(new Error('Fullscreen not supported'));
  }
}

/**
 * 检查是否处于全屏状态
 */
export function isFullscreen(): boolean {
  return !!(
    document.fullscreenElement ||
    (document as any).webkitFullscreenElement ||
    (document as any).mozFullScreenElement ||
    (document as any).msFullscreenElement
  );
}

/**
 * 切换全屏状态
 */
export function toggleFullscreen(element?: Element): Promise<void> {
  if (isFullscreen()) {
    return exitFullscreen();
  } else {
    return enterFullscreen(element);
  }
}

/**
 * 监听全屏变化
 */
export function onFullscreenChange(callback: (isFullscreen: boolean) => void): () => void {
  const handler = () => callback(isFullscreen());
  
  document.addEventListener('fullscreenchange', handler);
  document.addEventListener('webkitfullscreenchange', handler);
  document.addEventListener('mozfullscreenchange', handler);
  document.addEventListener('MSFullscreenChange', handler);
  
  // 返回取消监听的函数
  return () => {
    document.removeEventListener('fullscreenchange', handler);
    document.removeEventListener('webkitfullscreenchange', handler);
    document.removeEventListener('mozfullscreenchange', handler);
    document.removeEventListener('MSFullscreenChange', handler);
  };
}

/**
 * 监听窗口大小变化
 */
export function onResize(callback: (size: { width: number; height: number }) => void): () => void {
  const handler = () => callback({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  
  window.addEventListener('resize', handler);
  
  // 返回取消监听的函数
  return () => window.removeEventListener('resize', handler);
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let lastTime = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastTime >= wait) {
      lastTime = now;
      func(...args);
    }
  };
}