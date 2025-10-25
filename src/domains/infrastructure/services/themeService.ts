// 主题切换和移动端适配服务
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useStorage } from '@vueuse/core';
import logService from '../logging';

// 主题类型定义
export type ThemeMode = 'light' | 'dark' | 'auto';
export type ColorScheme = 'default' | 'blue' | 'green' | 'purple' | 'orange' | 'red';

// 设备类型定义
export type DeviceType = 'desktop' | 'tablet' | 'mobile';

// 断点定义
const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1200,
};

// 主题配置接口
export interface ThemeConfig {
  mode: ThemeMode;
  colorScheme: ColorScheme;
  primaryColor: string;
  fontSize: 'small' | 'medium' | 'large';
  borderRadius: 'none' | 'small' | 'medium' | 'large';
  sidebarCollapsed: boolean;
  compactMode: boolean;
  animationsEnabled: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
}

// 默认主题配置
const defaultThemeConfig: ThemeConfig = {
  mode: 'auto',
  colorScheme: 'default',
  primaryColor: '#409EFF',
  fontSize: 'medium',
  borderRadius: 'medium',
  sidebarCollapsed: false,
  compactMode: false,
  animationsEnabled: true,
  highContrast: false,
  reducedMotion: false,
};

// 主题服务类
class ThemeService {
  private themeConfig = useStorage<ThemeConfig>('fantastic-admin-theme', defaultThemeConfig);
  private systemTheme = ref<ThemeMode>('light');
  private deviceType = ref<DeviceType>('desktop');
  private screenWidth = ref(0);
  private screenHeight = ref(0);
  private isPortrait = ref(true);
  private mediaQueryLists: Record<string, MediaQueryList> = {};
  private listeners: Array<() => void> = [];

  constructor() {
    this.initSystemThemeDetection();
    this.initDeviceDetection();
    this.initMediaQueryListeners();
    this.applyTheme();
  }

  /**
   * 初始化系统主题检测
   */
  private initSystemThemeDetection() {
    // 检测系统主题
    const updateSystemTheme = () => {
      this.systemTheme.value = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      
      // 如果主题模式为 auto，则应用系统主题
      if (this.themeConfig.value.mode === 'auto') {
        this.applyTheme();
      }
    };

    // 初始检测
    updateSystemTheme();

    // 监听系统主题变化
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    darkModeQuery.addEventListener('change', updateSystemTheme);
    
    // 添加到监听器列表，以便在组件卸载时清理
    this.listeners.push(() => {
      darkModeQuery.removeEventListener('change', updateSystemTheme);
    });
  }

  /**
   * 初始化设备检测
   */
  private initDeviceDetection() {
    // 初始检测
    this.updateDeviceType();

    // 监听窗口大小变化
    const handleResize = () => {
      this.updateDeviceType();
      this.handleDeviceChange();
    };

    window.addEventListener('resize', handleResize);
    this.listeners.push(() => {
      window.removeEventListener('resize', handleResize);
    });

    // 监听屏幕方向变化
    const handleOrientationChange = () => {
      this.isPortrait.value = window.innerHeight > window.innerWidth;
      this.handleDeviceChange();
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    this.listeners.push(() => {
      window.removeEventListener('orientationchange', handleOrientationChange);
    });
  }

  /**
   * 初始化媒体查询监听器
   */
  private initMediaQueryListeners() {
    // 监听用户偏好
    const preferences = [
      { query: '(prefers-reduced-motion: reduce)', key: 'reducedMotion' },
      { query: '(prefers-contrast: high)', key: 'highContrast' },
    ];

    preferences.forEach(({ query, key }) => {
      const mediaQuery = window.matchMedia(query);
      this.mediaQueryLists[key] = mediaQuery;

      const handleChange = () => {
        if (key === 'reducedMotion') {
          this.themeConfig.value.reducedMotion = mediaQuery.matches;
        } else if (key === 'highContrast') {
          this.themeConfig.value.highContrast = mediaQuery.matches;
        }
        this.applyTheme();
      };

      // 初始检测
      handleChange();

      // 监听变化
      mediaQuery.addEventListener('change', handleChange);
      
      // 添加到监听器列表
      this.listeners.push(() => {
        mediaQuery.removeEventListener('change', handleChange);
      });
    });
  }

  /**
   * 更新设备类型
   */
  private updateDeviceType() {
    this.screenWidth.value = window.innerWidth;
    this.screenHeight.value = window.innerHeight;
    this.isPortrait.value = window.innerHeight > window.innerWidth;

    if (this.screenWidth.value < BREAKPOINTS.mobile) {
      this.deviceType.value = 'mobile';
    } else if (this.screenWidth.value < BREAKPOINTS.tablet) {
      this.deviceType.value = 'tablet';
    } else {
      this.deviceType.value = 'desktop';
    }
  }

  /**
   * 处理设备变化
   */
  private handleDeviceChange() {
    // 在移动设备上自动折叠侧边栏
    if (this.deviceType.value === 'mobile' && !this.themeConfig.value.sidebarCollapsed) {
      this.themeConfig.value.sidebarCollapsed = true;
    }

    // 在小屏幕设备上启用紧凑模式
    if (this.screenWidth.value < BREAKPOINTS.mobile) {
      this.themeConfig.value.compactMode = true;
    } else if (this.screenWidth.value > BREAKPOINTS.tablet) {
      this.themeConfig.value.compactMode = false;
    }

    // 记录设备变化
    logService.info('设备类型变化', {
      deviceType: this.deviceType.value,
      screenWidth: this.screenWidth.value,
      screenHeight: this.screenHeight.value,
      isPortrait: this.isPortrait.value,
    }, 'ThemeService');
  }

  /**
   * 应用主题
   */
  private applyTheme() {
    const root = document.documentElement;
    const { mode, colorScheme, primaryColor, fontSize, borderRadius, animationsEnabled, highContrast, reducedMotion } = this.themeConfig.value;

    // 应用颜色模式
    if (mode === 'auto') {
      root.classList.remove('light', 'dark');
      root.classList.add(this.systemTheme.value);
    } else {
      root.classList.remove('light', 'dark', 'auto');
      root.classList.add(mode);
    }

    // 应用颜色方案
    root.classList.remove('color-default', 'color-blue', 'color-green', 'color-purple', 'color-orange', 'color-red');
    root.classList.add(`color-${colorScheme}`);

    // 应用主色调
    root.style.setProperty('--el-color-primary', primaryColor);

    // 应用字体大小
    root.classList.remove('font-small', 'font-medium', 'font-large');
    root.classList.add(`font-${fontSize}`);

    // 应用圆角
    root.classList.remove('radius-none', 'radius-small', 'radius-medium', 'radius-large');
    root.classList.add(`radius-${borderRadius}`);

    // 应用动画设置
    if (animationsEnabled && !reducedMotion) {
      root.classList.remove('no-animations');
    } else {
      root.classList.add('no-animations');
    }

    // 应用高对比度
    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // 应用减少动画
    if (reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    // 应用移动端适配
    this.applyMobileAdaptations();
  }

  /**
   * 应用移动端适配
   */
  private applyMobileAdaptations() {
    const root = document.documentElement;
    
    // 移动端适配
    if (this.deviceType.value === 'mobile') {
      root.classList.add('mobile-device');
      
      // 设置移动端视口
      const viewport = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
      }
      
      // 禁用hover效果（移动设备上通常没有真正的hover）
      root.classList.add('no-hover');
    } else {
      root.classList.remove('mobile-device', 'no-hover');
      
      // 重置桌面端视口
      const viewport = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
      }
    }

    // 平板适配
    if (this.deviceType.value === 'tablet') {
      root.classList.add('tablet-device');
    } else {
      root.classList.remove('tablet-device');
    }

    // 横屏适配
    if (!this.isPortrait.value) {
      root.classList.add('landscape-orientation');
    } else {
      root.classList.remove('landscape-orientation');
    }
  }

  /**
   * 设置主题模式
   * @param mode 主题模式
   */
  setThemeMode(mode: ThemeMode) {
    this.themeConfig.value.mode = mode;
    this.applyTheme();
    
    logService.info('主题模式变更', { mode }, 'ThemeService');
  }

  /**
   * 设置颜色方案
   * @param scheme 颜色方案
   */
  setColorScheme(scheme: ColorScheme) {
    this.themeConfig.value.colorScheme = scheme;
    this.applyTheme();
    
    logService.info('颜色方案变更', { scheme }, 'ThemeService');
  }

  /**
   * 设置主色调
   * @param color 主色调
   */
  setPrimaryColor(color: string) {
    this.themeConfig.value.primaryColor = color;
    this.applyTheme();
    
    logService.info('主色调变更', { color }, 'ThemeService');
  }

  /**
   * 设置字体大小
   * @param size 字体大小
   */
  setFontSize(size: 'small' | 'medium' | 'large') {
    this.themeConfig.value.fontSize = size;
    this.applyTheme();
    
    logService.info('字体大小变更', { size }, 'ThemeService');
  }

  /**
   * 设置圆角
   * @param radius 圆角大小
   */
  setBorderRadius(radius: 'none' | 'small' | 'medium' | 'large') {
    this.themeConfig.value.borderRadius = radius;
    this.applyTheme();
    
    logService.info('圆角设置变更', { radius }, 'ThemeService');
  }

  /**
   * 切换侧边栏折叠状态
   */
  toggleSidebar() {
    this.themeConfig.value.sidebarCollapsed = !this.themeConfig.value.sidebarCollapsed;
    
    logService.info('侧边栏状态变更', { 
      collapsed: this.themeConfig.value.sidebarCollapsed 
    }, 'ThemeService');
  }

  /**
   * 设置侧边栏折叠状态
   * @param collapsed 是否折叠
   */
  setSidebarCollapsed(collapsed: boolean) {
    this.themeConfig.value.sidebarCollapsed = collapsed;
    
    logService.info('侧边栏状态变更', { 
      collapsed 
    }, 'ThemeService');
  }

  /**
   * 切换紧凑模式
   */
  toggleCompactMode() {
    this.themeConfig.value.compactMode = !this.themeConfig.value.compactMode;
    this.applyTheme();
    
    logService.info('紧凑模式变更', { 
      enabled: this.themeConfig.value.compactMode 
    }, 'ThemeService');
  }

  /**
   * 设置紧凑模式
   * @param enabled 是否启用
   */
  setCompactMode(enabled: boolean) {
    this.themeConfig.value.compactMode = enabled;
    this.applyTheme();
    
    logService.info('紧凑模式变更', { 
      enabled 
    }, 'ThemeService');
  }

  /**
   * 切换动画
   */
  toggleAnimations() {
    this.themeConfig.value.animationsEnabled = !this.themeConfig.value.animationsEnabled;
    this.applyTheme();
    
    logService.info('动画设置变更', { 
      enabled: this.themeConfig.value.animationsEnabled 
    }, 'ThemeService');
  }

  /**
   * 设置动画
   * @param enabled 是否启用
   */
  setAnimationsEnabled(enabled: boolean) {
    this.themeConfig.value.animationsEnabled = enabled;
    this.applyTheme();
    
    logService.info('动画设置变更', { 
      enabled 
    }, 'ThemeService');
  }

  /**
   * 切换高对比度
   */
  toggleHighContrast() {
    this.themeConfig.value.highContrast = !this.themeConfig.value.highContrast;
    this.applyTheme();
    
    logService.info('高对比度变更', { 
      enabled: this.themeConfig.value.highContrast 
    }, 'ThemeService');
  }

  /**
   * 设置高对比度
   * @param enabled 是否启用
   */
  setHighContrast(enabled: boolean) {
    this.themeConfig.value.highContrast = enabled;
    this.applyTheme();
    
    logService.info('高对比度变更', { 
      enabled 
    }, 'ThemeService');
  }

  /**
   * 切换减少动画
   */
  toggleReducedMotion() {
    this.themeConfig.value.reducedMotion = !this.themeConfig.value.reducedMotion;
    this.applyTheme();
    
    logService.info('减少动画变更', { 
      enabled: this.themeConfig.value.reducedMotion 
    }, 'ThemeService');
  }

  /**
   * 设置减少动画
   * @param enabled 是否启用
   */
  setReducedMotion(enabled: boolean) {
    this.themeConfig.value.reducedMotion = enabled;
    this.applyTheme();
    
    logService.info('减少动画变更', { 
      enabled 
    }, 'ThemeService');
  }

  /**
   * 重置主题配置
   */
  resetTheme() {
    this.themeConfig.value = { ...defaultThemeConfig };
    this.applyTheme();
    
    logService.info('主题重置', {}, 'ThemeService');
  }

  /**
   * 获取当前主题配置
   */
  getThemeConfig(): ThemeConfig {
    return { ...this.themeConfig.value };
  }

  /**
   * 获取系统主题
   */
  getSystemTheme(): ThemeMode {
    return this.systemTheme.value;
  }

  /**
   * 获取设备类型
   */
  getDeviceType(): DeviceType {
    return this.deviceType.value;
  }

  /**
   * 获取屏幕尺寸
   */
  getScreenSize(): { width: number; height: number } {
    return {
      width: this.screenWidth.value,
      height: this.screenHeight.value,
    };
  }

  /**
   * 是否为移动设备
   */
  isMobile(): boolean {
    return this.deviceType.value === 'mobile';
  }

  /**
   * 是否为平板设备
   */
  isTablet(): boolean {
    return this.deviceType.value === 'tablet';
  }

  /**
   * 是否为桌面设备
   */
  isDesktop(): boolean {
    return this.deviceType.value === 'desktop';
  }

  /**
   * 是否为横屏
   */
  isLandscape(): boolean {
    return !this.isPortrait.value;
  }

  /**
   * 获取屏幕方向
   */
  getScreenOrientation(): boolean {
    return this.isPortrait.value;
  }

  /**
   * 监听主题变化
   * @param callback 回调函数
   */
  onThemeChange(callback: (config: ThemeConfig) => void): () => void {
    const stopWatcher = watch(
      () => this.themeConfig.value,
      (newConfig) => callback(newConfig),
      { deep: true }
    );
    
    return stopWatcher;
  }

  /**
   * 监听设备变化
   * @param callback 回调函数
   */
  onDeviceChange(callback: (deviceType: DeviceType) => void): () => void {
    const stopWatcher = watch(
      () => this.deviceType.value,
      (newDeviceType) => callback(newDeviceType)
    );
    
    return stopWatcher;
  }

  /**
   * 监听屏幕尺寸变化
   * @param callback 回调函数
   */
  onScreenSizeChange(callback: (size: { width: number; height: number }) => void): () => void {
    const stopWatcher = watch(
      () => ({ width: this.screenWidth.value, height: this.screenHeight.value }),
      (newSize) => callback(newSize)
    );
    
    return stopWatcher;
  }

  /**
   * 清理监听器
   */
  cleanup() {
    this.listeners.forEach(cleanup => cleanup());
    this.listeners = [];
  }
}

// 创建主题服务实例
const themeService = new ThemeService();

// 导出服务实例和类型
export default themeService;
export { ThemeConfig, ThemeMode, ColorScheme, DeviceType, BREAKPOINTS };