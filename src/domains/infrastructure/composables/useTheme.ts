// 主题组合式函数
import { computed, ref, watch, onMounted, onUnmounted } from 'vue';
import { useStorage } from '@vueuse/core';
import themeService from '../services/themeService';
import type { ThemeConfig, ThemeMode, ColorScheme, DeviceType } from '../services/themeService';

// 导出类型供外部使用
export type { ThemeConfig, ThemeMode, DeviceType, ColorScheme };

// 主题组合式函数
export function useTheme() {
  // 当前主题配置
  const themeConfig = ref<ThemeConfig>(themeService.getThemeConfig());
  
  // 系统主题
  const systemTheme = ref<ThemeMode>(themeService.getSystemTheme());
  
  // 设备类型
  const deviceType = ref<DeviceType>(themeService.getDeviceType());
  
  // 屏幕尺寸
  const screenSize = ref(themeService.getScreenSize());
  
  // 计算属性
  const isDark = computed(() => {
    if (themeConfig.value.mode === 'auto') {
      return systemTheme.value === 'dark';
    }
    return themeConfig.value.mode === 'dark';
  });
  
  const isLight = computed(() => !isDark.value);
  
  // 添加 theme 和 colorScheme 计算属性以兼容 App.vue 和其他组件
  const theme = computed(() => themeConfig.value.mode);
  const colorScheme = computed(() => themeConfig.value.colorScheme);
  
  const isMobile = computed(() => deviceType.value === 'mobile');
  const isTablet = computed(() => deviceType.value === 'tablet');
  const isDesktop = computed(() => deviceType.value === 'desktop');
  
  const isLandscape = computed(() => themeService.isLandscape);
  const isPortrait = computed(() => themeService.isPortrait);
  
  // 监听主题变化
  const stopThemeWatcher = themeService.onThemeChange((newConfig) => {
    themeConfig.value = newConfig;
  });
  
  // 监听设备变化
  const stopDeviceWatcher = themeService.onDeviceChange((newDeviceType) => {
    deviceType.value = newDeviceType;
  });
  
  // 监听屏幕尺寸变化
  const stopScreenSizeWatcher = themeService.onScreenSizeChange((newSize) => {
    screenSize.value = newSize;
  });
  
  // 方法
  const setThemeMode = (mode: ThemeMode) => {
    themeService.setThemeMode(mode);
  };
  
  const setColorScheme = (scheme: ColorScheme) => {
    themeService.setColorScheme(scheme);
  };
  
  const setPrimaryColor = (color: string) => {
    themeService.setPrimaryColor(color);
  };
  
  const setFontSize = (size: 'small' | 'medium' | 'large') => {
    themeService.setFontSize(size);
  };
  
  const setBorderRadius = (radius: 'none' | 'small' | 'medium' | 'large') => {
    themeService.setBorderRadius(radius);
  };
  
  const toggleSidebar = () => {
    themeService.toggleSidebar();
  };
  
  const setSidebarCollapsed = (collapsed: boolean) => {
    themeService.setSidebarCollapsed(collapsed);
  };
  
  const toggleCompactMode = () => {
    themeService.toggleCompactMode();
  };
  
  const setCompactMode = (enabled: boolean) => {
    themeService.setCompactMode(enabled);
  };
  
  const toggleAnimations = () => {
    themeService.toggleAnimations();
  };
  
  const setAnimationsEnabled = (enabled: boolean) => {
    themeService.setAnimationsEnabled(enabled);
  };
  
  const toggleHighContrast = () => {
    themeService.toggleHighContrast();
  };
  
  const setHighContrast = (enabled: boolean) => {
    themeService.setHighContrast(enabled);
  };
  
  const toggleReducedMotion = () => {
    themeService.toggleReducedMotion();
  };
  
  const setReducedMotion = (enabled: boolean) => {
    themeService.setReducedMotion(enabled);
  };
  
  const resetTheme = () => {
    themeService.resetTheme();
  };
  
  // 清理
  onUnmounted(() => {
    stopThemeWatcher();
    stopDeviceWatcher();
    stopScreenSizeWatcher();
  });
  
  return {
    // 状态
    themeConfig: computed(() => themeConfig.value),
    systemTheme: computed(() => systemTheme.value),
    deviceType: computed(() => deviceType.value),
    screenSize: computed(() => screenSize.value),
    
    // 计算属性 - 兼容性属性
    theme,
    colorScheme,
    isDark,
    isLight,
    isMobile,
    isTablet,
    isDesktop,
    isLandscape,
    isPortrait,
    
    // 方法
    setThemeMode,
    setColorScheme,
    setPrimaryColor,
    setFontSize,
    setBorderRadius,
    toggleSidebar,
    setSidebarCollapsed,
    toggleCompactMode,
    setCompactMode,
    toggleAnimations,
    setAnimationsEnabled,
    toggleHighContrast,
    setHighContrast,
    toggleReducedMotion,
    setReducedMotion,
    resetTheme,
  };
}

// 响应式设计组合式函数
export function useResponsive() {
  const { deviceType, screenSize, isMobile, isTablet, isDesktop, isLandscape, isPortrait } = useTheme();
  
  // 计算属性
  const isSmallScreen = computed(() => screenSize.value.width < 768);
  const isMediumScreen = computed(() => screenSize.value.width >= 768 && screenSize.value.width < 1024);
  const isLargeScreen = computed(() => screenSize.value.width >= 1024);
  
  // 断点
  const breakpoints = {
    mobile: 768,
    tablet: 1024,
    desktop: 1200,
  };
  
  // 响应式值
  const responsiveValue = <T>(values: { mobile?: T; tablet?: T; desktop?: T }): T => {
    if (isMobile.value && values.mobile !== undefined) return values.mobile;
    if (isTablet.value && values.tablet !== undefined) return values.tablet;
    if (isDesktop.value && values.desktop !== undefined) return values.desktop;
    
    // 回退到桌面值或第一个可用值
    return values.desktop ?? values.tablet ?? values.mobile ?? (undefined as unknown as T);
  };
  
  // 响应式类名
  const responsiveClass = (classes: { mobile?: string; tablet?: string; desktop?: string }): string => {
    return responsiveValue(classes);
  };
  
  // 响应式样式
  const responsiveStyle = (styles: { mobile?: any; tablet?: any; desktop?: any }): any => {
    return responsiveValue(styles);
  };
  
  // 监听屏幕尺寸变化
  const onScreenChange = (callback: (size: { width: number; height: number }) => void) => {
    return watch(screenSize, callback, { immediate: true });
  };
  
  // 监听设备类型变化
  const onDeviceChange = (callback: (type: DeviceType) => void) => {
    return watch(deviceType, callback, { immediate: true });
  };
  
  return {
    // 状态
    deviceType,
    screenSize,
    breakpoints,
    
    // 计算属性
    isMobile,
    isTablet,
    isDesktop,
    isLandscape,
    isPortrait,
    isSmallScreen,
    isMediumScreen,
    isLargeScreen,
    
    // 方法
    responsiveValue,
    responsiveClass,
    responsiveStyle,
    onScreenChange,
    onDeviceChange,
  };
}

// 主题切换组合式函数
export function useThemeToggle() {
  const { themeConfig, isDark, isLight } = useTheme();
  
  // 切换主题模式
  const toggleThemeMode = () => {
    const currentMode = themeConfig.value.mode;
    let newMode: ThemeMode;
    
    if (currentMode === 'light') {
      newMode = 'dark';
    } else if (currentMode === 'dark') {
      newMode = 'auto';
    } else {
      newMode = 'light';
    }
    
    themeService.setThemeMode(newMode);
  };
  
  // 切换明暗主题
  const toggleDarkLight = () => {
    themeService.setThemeMode(isDark.value ? 'light' : 'dark');
  };
  
  // 设置为明主题
  const setLightTheme = () => {
    themeService.setThemeMode('light');
  };
  
  // 设置为暗主题
  const setDarkTheme = () => {
    themeService.setThemeMode('dark');
  };
  
  // 设置为自动主题
  const setAutoTheme = () => {
    themeService.setThemeMode('auto');
  };
  
  return {
    themeConfig,
    isDark,
    isLight,
    toggleThemeMode,
    toggleDarkLight,
    setLightTheme,
    setDarkTheme,
    setAutoTheme,
  };
}

// 颜色方案组合式函数
export function useColorScheme() {
  const { themeConfig } = useTheme();
  
  // 可用的颜色方案
  const colorSchemes: { value: ColorScheme; label: string; primaryColor: string }[] = [
    { value: 'default', label: '默认蓝', primaryColor: '#409EFF' },
    { value: 'blue', label: '深空蓝', primaryColor: '#1890FF' },
    { value: 'green', label: '自然绿', primaryColor: '#52C41A' },
    { value: 'purple', label: '优雅紫', primaryColor: '#722ED1' },
    { value: 'orange', label: '活力橙', primaryColor: '#FA8C16' },
    { value: 'red', label: '热情红', primaryColor: '#F5222D' },
  ];
  
  // 当前颜色方案
  const currentColorScheme = computed(() => themeConfig.value.colorScheme);
  
  // 切换颜色方案
  const setColorScheme = (scheme: ColorScheme) => {
    themeService.setColorScheme(scheme);
    
    // 同时设置对应的主色调
    const schemeConfig = colorSchemes.find(s => s.value === scheme);
    if (schemeConfig) {
      themeService.setPrimaryColor(schemeConfig.primaryColor);
    }
  };
  
  // 获取颜色方案配置
  const getColorSchemeConfig = (scheme: ColorScheme) => {
    return colorSchemes.find(s => s.value === scheme);
  };
  
  return {
    colorSchemes,
    currentColorScheme,
    setColorScheme,
    getColorSchemeConfig,
  };
}

// 可访问性组合式函数
export function useAccessibility() {
  const { themeConfig } = useTheme();
  
  // 可访问性设置
  const accessibilitySettings = computed(() => ({
    highContrast: themeConfig.value.highContrast,
    reducedMotion: themeConfig.value.reducedMotion,
    fontSize: themeConfig.value.fontSize,
    animationsEnabled: themeConfig.value.animationsEnabled,
  }));
  
  // 切换高对比度
  const toggleHighContrast = () => {
    themeService.toggleHighContrast();
  };
  
  // 设置高对比度
  const setHighContrast = (enabled: boolean) => {
    themeService.setHighContrast(enabled);
  };
  
  // 切换减少动画
  const toggleReducedMotion = () => {
    themeService.toggleReducedMotion();
  };
  
  // 设置减少动画
  const setReducedMotion = (enabled: boolean) => {
    themeService.setReducedMotion(enabled);
  };
  
  // 设置字体大小
  const setFontSize = (size: 'small' | 'medium' | 'large') => {
    themeService.setFontSize(size);
  };
  
  // 切换动画
  const toggleAnimations = () => {
    themeService.toggleAnimations();
  };
  
  // 设置动画
  const setAnimationsEnabled = (enabled: boolean) => {
    themeService.setAnimationsEnabled(enabled);
  };
  
  return {
    accessibilitySettings,
    toggleHighContrast,
    setHighContrast,
    toggleReducedMotion,
    setReducedMotion,
    setFontSize,
    toggleAnimations,
    setAnimationsEnabled,
  };
}