// 主题相关工具函数
import type { Ref, ComputedRef } from 'vue';
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import type { Theme, ThemeConfig, ThemeMode } from '@/domains/shared/types/theme';
import { lightTheme, darkTheme, defaultThemeConfig, THEME_STORAGE_KEY, THEME_CLASS_PREFIX, getSystemTheme } from '@/domains/shared/types/theme';
import { storageService } from '@/domains/infrastructure/storage';

// 主题组合式函数
export function useTheme() {
  // 主题配置
  const config = ref<ThemeConfig>(defaultThemeConfig);
  
  // 当前主题
  const currentTheme = ref<Theme>(lightTheme);
  
  // 主题模式
  const themeMode = ref<ThemeMode>('light');
  
  // 是否为深色主题
  const isDark = computed(() => isDarkTheme(currentTheme.value));
  
  // 初始化主题配置
  const initThemeConfig = () => {
    const savedConfig = storageService.getItem(THEME_STORAGE_KEY);
    if (savedConfig) {
      config.value = { ...defaultThemeConfig, ...savedConfig };
    }
    
    // 初始化主题模式
    if (config.value.followSystem) {
      themeMode.value = getSystemTheme();
    } else {
      themeMode.value = config.value.defaultTheme as ThemeMode;
    }
    
    // 设置当前主题
    updateCurrentTheme();
  };
  
  // 更新当前主题
  const updateCurrentTheme = () => {
    const theme = config.value.customThemes.find(t => t.name === themeMode.value) || 
                  (themeMode.value === 'dark' ? darkTheme : lightTheme);
    currentTheme.value = theme;
    
    // 应用主题到DOM
    applyThemeToDOM(theme);
  };
  
  // 应用主题到DOM
  const applyThemeToDOM = (theme: Theme) => {
    if (typeof document !== 'undefined') {
      // 移除所有主题类
      document.body.classList.remove(
        ...config.value.customThemes.map(t => `${THEME_CLASS_PREFIX}${t.name}`)
      );
      
      // 添加当前主题类
      document.body.classList.add(`${THEME_CLASS_PREFIX}${theme.name}`);
      
      // 设置CSS变量
      const root = document.documentElement;
      Object.entries(theme.colors).forEach(([key, value]) => {
        if (typeof value === 'object') {
          Object.entries(value).forEach(([subKey, subValue]) => {
            root.style.setProperty(`--color-${key}-${subKey}`, subValue as string);
          });
        } else {
          root.style.setProperty(`--color-${key}`, value as string);
        }
      });
      
      // 设置字体
      root.style.setProperty('--font-family', theme.typography.fontFamily);
      
      // 设置间距
      Object.entries(theme.spacing).forEach(([key, value]) => {
        root.style.setProperty(`--spacing-${key}`, value);
      });
      
      // 设置圆角
      Object.entries(theme.borderRadius).forEach(([key, value]) => {
        root.style.setProperty(`--border-radius-${key}`, value);
      });
      
      // 设置阴影
      Object.entries(theme.shadows).forEach(([key, value]) => {
        root.style.setProperty(`--shadow-${key}`, value);
      });
      
      // 设置过渡
      root.style.setProperty('--transition-duration-fast', theme.transitions.duration.fast);
      root.style.setProperty('--transition-duration-normal', theme.transitions.duration.normal);
      root.style.setProperty('--transition-duration-slow', theme.transitions.duration.slow);
      root.style.setProperty('--transition-easing-in', theme.transitions.easing.easeIn);
      root.style.setProperty('--transition-easing-out', theme.transitions.easing.easeOut);
      root.style.setProperty('--transition-easing-in-out', theme.transitions.easing.easeInOut);
      
      // 设置断点
      Object.entries(theme.breakpoints).forEach(([key, value]) => {
        root.style.setProperty(`--breakpoint-${key}`, value);
      });
    }
  };
  
  // 切换主题
  const toggleTheme = () => {
    themeMode.value = themeMode.value === 'light' ? 'dark' : 'light';
    updateCurrentTheme();
    saveThemeConfig();
  };
  
  // 设置主题模式
  const setThemeMode = (mode: ThemeMode) => {
    themeMode.value = mode;
    updateCurrentTheme();
    saveThemeConfig();
  };
  
  // 设置主题配置
  const setThemeConfig = (newConfig: Partial<ThemeConfig>) => {
    config.value = { ...config.value, ...newConfig };
    
    // 如果更改了跟随系统设置，更新主题模式
    if (newConfig.followSystem !== undefined) {
      if (newConfig.followSystem) {
        themeMode.value = getSystemTheme();
      } else {
        themeMode.value = config.value.defaultTheme as ThemeMode;
      }
    }
    
    // 如果更改了默认主题，且不跟随系统设置，更新主题模式
    if (newConfig.defaultTheme !== undefined && !config.value.followSystem) {
      themeMode.value = newConfig.defaultTheme as ThemeMode;
    }
    
    updateCurrentTheme();
    saveThemeConfig();
  };
  
  // 保存主题配置
  const saveThemeConfig = () => {
    storageService.setItem(THEME_STORAGE_KEY, config.value);
  };
  
  // 添加自定义主题
  const addCustomTheme = (theme: Theme) => {
    config.value.customThemes.push(theme);
    saveThemeConfig();
  };
  
  // 移除自定义主题
  const removeCustomTheme = (themeId: string) => {
    config.value.customThemes = config.value.customThemes.filter(t => t.id !== themeId);
    saveThemeConfig();
  };
  
  // 更新自定义主题
  const updateCustomTheme = (themeId: string, updates: Partial<Theme>) => {
    const themeIndex = config.value.customThemes.findIndex(t => t.id === themeId);
    if (themeIndex !== -1) {
      config.value.customThemes[themeIndex] = { ...config.value.customThemes[themeIndex], ...updates };
      saveThemeConfig();
      
      // 如果更新的是当前主题，重新应用
      if (currentTheme.value.id === themeId) {
        updateCurrentTheme();
      }
    }
  };
  
  // 获取主题CSS变量
  const getThemeVariable = (path: string): string | undefined => {
    if (typeof document !== 'undefined') {
      return getComputedStyle(document.documentElement).getPropertyValue(`--${path}`).trim();
    }
    return undefined;
  };
  
  // 监听系统主题变化
  let mediaQuery: MediaQueryList | null = null;
  
  const handleSystemThemeChange = () => {
    if (config.value.followSystem) {
      themeMode.value = getSystemTheme();
      updateCurrentTheme();
    }
  };
  
  // 设置媒体查询监听
  const setupMediaQueryListener = () => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', handleSystemThemeChange);
    }
  };
  
  // 清理媒体查询监听
  const cleanupMediaQueryListener = () => {
    if (mediaQuery) {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
      mediaQuery = null;
    }
  };
  
  // 生命周期钩子
  onMounted(() => {
    initThemeConfig();
    setupMediaQueryListener();
  });
  
  onUnmounted(() => {
    cleanupMediaQueryListener();
  });
  
  // 监听主题模式变化
  watch(themeMode, () => {
    updateCurrentTheme();
  });
  
  return {
    // 响应式数据
    config: config as Ref<ThemeConfig>,
    currentTheme: currentTheme as Ref<Theme>,
    themeMode: themeMode as Ref<ThemeMode>,
    isDark: isDark as ComputedRef<boolean>,
    
    // 方法
    toggleTheme,
    setThemeMode,
    setThemeConfig,
    addCustomTheme,
    removeCustomTheme,
    updateCustomTheme,
    getThemeVariable,
  };
}

// 主题相关工具函数
export const themeUtils = {
  // 判断是否为深色主题
  isDarkTheme,
  
  // 获取主题类名
  getThemeClass,
  
  // 获取系统主题
  getSystemTheme,
  
  // 生成主题CSS变量
  generateThemeCSSVariables: (theme: Theme): Record<string, string> => {
    const variables: Record<string, string> = {};
    
    // 颜色变量
    Object.entries(theme.colors).forEach(([key, value]) => {
      if (typeof value === 'object') {
        Object.entries(value).forEach(([subKey, subValue]) => {
          variables[`--color-${key}-${subKey}`] = subValue;
        });
      } else {
        variables[`--color-${key}`] = value;
      }
    });
    
    // 字体变量
    variables['--font-family'] = theme.typography.fontFamily;
    
    // 间距变量
    Object.entries(theme.spacing).forEach(([key, value]) => {
      variables[`--spacing-${key}`] = value;
    });
    
    // 圆角变量
    Object.entries(theme.borderRadius).forEach(([key, value]) => {
      variables[`--border-radius-${key}`] = value;
    });
    
    // 阴影变量
    Object.entries(theme.shadows).forEach(([key, value]) => {
      variables[`--shadow-${key}`] = value;
    });
    
    // 过渡变量
    variables['--transition-duration-fast'] = theme.transitions.duration.fast;
    variables['--transition-duration-normal'] = theme.transitions.duration.normal;
    variables['--transition-duration-slow'] = theme.transitions.duration.slow;
    variables['--transition-easing-in'] = theme.transitions.easing.easeIn;
    variables['--transition-easing-out'] = theme.transitions.easing.easeOut;
    variables['--transition-easing-in-out'] = theme.transitions.easing.easeInOut;
    
    // 断点变量
    Object.entries(theme.breakpoints).forEach(([key, value]) => {
      variables[`--breakpoint-${key}`] = value;
    });
    
    return variables;
  },
  
  // 应用主题CSS变量到元素
  applyThemeCSSVariables: (element: HTMLElement, theme: Theme) => {
    const variables = themeUtils.generateThemeCSSVariables(theme);
    Object.entries(variables).forEach(([key, value]) => {
      element.style.setProperty(key, value);
    });
  },
  
  // 创建主题CSS字符串
  createThemeCSS: (theme: Theme, className: string): string => {
    const variables = themeUtils.generateThemeCSSVariables(theme);
    const variableEntries = Object.entries(variables)
      .map(([key, value]) => `  ${key}: ${value};`)
      .join('\n');
    
    return `.${className} {\n${variableEntries}\n}`;
  },
  
  // 创建主题切换CSS
  createThemeTransitionCSS: (): string => {
    return `
* {
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease, fill 0.3s ease, stroke 0.3s ease, opacity 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease !important;
}
    `;
  },
};

// 导出主题相关类型和函数
export type { Theme, ThemeConfig, ThemeMode };
export { lightTheme, darkTheme, defaultThemeConfig };