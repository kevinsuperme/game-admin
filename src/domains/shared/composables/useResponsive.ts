// 响应式相关工具函数
import { ref, reactive, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import type { Ref, ComputedRef, Reactive } from 'vue';

// 响应式断点
export interface Breakpoints {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

// 默认断点配置
export const defaultBreakpoints: Breakpoints = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1400,
};

// 响应式工具组合式函数
export function useBreakpoints(breakpoints: Breakpoints = defaultBreakpoints) {
  // 窗口宽度
  const windowWidth = ref(0);
  
  // 当前断点
  const currentBreakpoint = ref<keyof Breakpoints>('xs');
  
  // 断点状态
  const isXs = computed(() => windowWidth.value < breakpoints.sm);
  const isSm = computed(() => windowWidth.value >= breakpoints.sm && windowWidth.value < breakpoints.md);
  const isMd = computed(() => windowWidth.value >= breakpoints.md && windowWidth.value < breakpoints.lg);
  const isLg = computed(() => windowWidth.value >= breakpoints.lg && windowWidth.value < breakpoints.xl);
  const isXl = computed(() => windowWidth.value >= breakpoints.xl && windowWidth.value < breakpoints.xxl);
  const isXxl = computed(() => windowWidth.value >= breakpoints.xxl);
  
  // 小屏幕
  const isSmallScreen = computed(() => isSm.value || isXs.value);
  
  // 中等屏幕
  const isMediumScreen = computed(() => isMd.value);
  
  // 大屏幕
  const isLargeScreen = computed(() => isLg.value || isXl.value || isXxl.value);
  
  // 移动设备
  const isMobile = computed(() => isSmallScreen.value);
  
  // 平板设备
  const isTablet = computed(() => isMd.value);
  
  // 桌面设备
  const isDesktop = computed(() => isLargeScreen.value);
  
  // 更新窗口宽度
  const updateWindowWidth = () => {
    if (typeof window !== 'undefined') {
      windowWidth.value = window.innerWidth;
      
      // 更新当前断点
      if (windowWidth.value >= breakpoints.xxl) {
        currentBreakpoint.value = 'xxl';
      } else if (windowWidth.value >= breakpoints.xl) {
        currentBreakpoint.value = 'xl';
      } else if (windowWidth.value >= breakpoints.lg) {
        currentBreakpoint.value = 'lg';
      } else if (windowWidth.value >= breakpoints.md) {
        currentBreakpoint.value = 'md';
      } else if (windowWidth.value >= breakpoints.sm) {
        currentBreakpoint.value = 'sm';
      } else {
        currentBreakpoint.value = 'xs';
      }
    }
  };
  
  // 获取当前断点及以上的所有断点
  const currentAndUp = computed(() => {
    const breakpointKeys = Object.keys(breakpoints) as (keyof Breakpoints)[];
    const currentIndex = breakpointKeys.indexOf(currentBreakpoint.value);
    return breakpointKeys.slice(currentIndex);
  });
  
  // 获取当前断点及以下的所有断点
  const currentAndDown = computed(() => {
    const breakpointKeys = Object.keys(breakpoints) as (keyof Breakpoints)[];
    const currentIndex = breakpointKeys.indexOf(currentBreakpoint.value);
    return breakpointKeys.slice(0, currentIndex + 1);
  });
  
  // 监听窗口大小变化
  let resizeObserver: ResizeObserver | null = null;
  
  const setupResizeObserver = () => {
    if (typeof window !== 'undefined' && window.ResizeObserver) {
      resizeObserver = new ResizeObserver(() => {
        updateWindowWidth();
      });
      resizeObserver.observe(document.body);
    }
  };
  
  const cleanupResizeObserver = () => {
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }
  };
  
  // 生命周期钩子
  onMounted(() => {
    updateWindowWidth();
    setupResizeObserver();
    
    // 备用方案：监听resize事件
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', updateWindowWidth);
    }
  });
  
  onUnmounted(() => {
    cleanupResizeObserver();
    
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', updateWindowWidth);
    }
  });
  
  return {
    // 响应式数据
    windowWidth: windowWidth as Ref<number>,
    currentBreakpoint: currentBreakpoint as Ref<keyof Breakpoints>,
    
    // 断点状态
    isXs: isXs as ComputedRef<boolean>,
    isSm: isSm as ComputedRef<boolean>,
    isMd: isMd as ComputedRef<boolean>,
    isLg: isLg as ComputedRef<boolean>,
    isXl: isXl as ComputedRef<boolean>,
    isXxl: isXxl as ComputedRef<boolean>,
    isSmallScreen: isSmallScreen as ComputedRef<boolean>,
    isMediumScreen: isMediumScreen as ComputedRef<boolean>,
    isLargeScreen: isLargeScreen as ComputedRef<boolean>,
    isMobile: isMobile as ComputedRef<boolean>,
    isTablet: isTablet as ComputedRef<boolean>,
    isDesktop: isDesktop as ComputedRef<boolean>,
    
    // 断点范围
    currentAndUp: currentAndUp as ComputedRef<(keyof Breakpoints)[]>,
    currentAndDown: currentAndDown as ComputedRef<(keyof Breakpoints)[]>,
    
    // 方法
    updateWindowWidth,
  };
}

// 媒体查询组合式函数
export function useMediaQuery(query: string) {
  const matches = ref(false);
  let mediaQuery: MediaQueryList | null = null;
  
  const updateMatches = () => {
    if (mediaQuery) {
      matches.value = mediaQuery.matches;
    }
  };
  
  onMounted(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      mediaQuery = window.matchMedia(query);
      matches.value = mediaQuery.matches;
      
      // 添加监听器
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', updateMatches);
      } else {
        // 兼容旧版浏览器
        mediaQuery.addListener(updateMatches);
      }
    }
  });
  
  onUnmounted(() => {
    if (mediaQuery) {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', updateMatches);
      } else {
        // 兼容旧版浏览器
        mediaQuery.removeListener(updateMatches);
      }
      mediaQuery = null;
    }
  });
  
  return {
    matches: matches as ComputedRef<boolean>,
  };
}

// 设备方向组合式函数
export function useDeviceOrientation() {
  const orientation = ref<'portrait' | 'landscape'>('portrait');
  const angle = ref(0);
  
  const updateOrientation = () => {
    if (typeof screen !== 'undefined') {
      angle.value = screen.orientation?.angle || 0;
      orientation.value = angle.value % 180 === 0 ? 'portrait' : 'landscape';
    }
  };
  
  onMounted(() => {
    updateOrientation();
    
    if (typeof screen !== 'undefined' && screen.orientation) {
      screen.orientation.addEventListener('change', updateOrientation);
    } else if (typeof window !== 'undefined') {
      // 备用方案
      window.addEventListener('orientationchange', updateOrientation);
    }
  });
  
  onUnmounted(() => {
    if (typeof screen !== 'undefined' && screen.orientation) {
      screen.orientation.removeEventListener('change', updateOrientation);
    } else if (typeof window !== 'undefined') {
      window.removeEventListener('orientationchange', updateOrientation);
    }
  });
  
  return {
    orientation: orientation as Ref<'portrait' | 'landscape'>,
    angle: angle as Ref<number>,
  };
}

// 设备像素比组合式函数
export function useDevicePixelRatio() {
  const dpr = ref(1);
  
  const updateDpr = () => {
    if (typeof window !== 'undefined' && window.devicePixelRatio) {
      dpr.value = window.devicePixelRatio;
    }
  };
  
  onMounted(() => {
    updateDpr();
    
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia(`(resolution: ${dpr.value}dppx)`);
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', updateDpr);
      } else {
        // 兼容旧版浏览器
        mediaQuery.addListener(updateDpr);
      }
    }
  });
  
  return {
    dpr: dpr as Ref<number>,
  };
}

// 可见区域组合式函数
export function useViewport() {
  const width = ref(0);
  const height = ref(0);
  const scrollTop = ref(0);
  const scrollLeft = ref(0);
  
  const updateDimensions = () => {
    if (typeof window !== 'undefined') {
      width.value = window.innerWidth;
      height.value = window.innerHeight;
      scrollTop.value = window.pageYOffset || document.documentElement.scrollTop;
      scrollLeft.value = window.pageXOffset || document.documentElement.scrollLeft;
    }
  };
  
  const scrollTo = (x: number, y: number) => {
    if (typeof window !== 'undefined') {
      window.scrollTo(x, y);
    }
  };
  
  const scrollToTop = () => {
    scrollTo(0, 0);
  };
  
  const scrollToBottom = () => {
    if (typeof document !== 'undefined') {
      scrollTo(0, document.documentElement.scrollHeight);
    }
  };
  
  onMounted(() => {
    updateDimensions();
    
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', updateDimensions);
      window.addEventListener('scroll', updateDimensions);
    }
  });
  
  onUnmounted(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', updateDimensions);
      window.removeEventListener('scroll', updateDimensions);
    }
  });
  
  return {
    width: width as Ref<number>,
    height: height as Ref<number>,
    scrollTop: scrollTop as Ref<number>,
    scrollLeft: scrollLeft as Ref<number>,
    
    // 方法
    scrollTo,
    scrollToTop,
    scrollToBottom,
    updateDimensions,
  };
}

// 元素可见性组合式函数
export function useElementVisibility(elementRef: Ref<HTMLElement | null>) {
  const isVisible = ref(false);
  const isIntersecting = ref(false);
  const intersectionRatio = ref(0);
  
  let observer: IntersectionObserver | null = null;
  
  const updateVisibility = (entries: IntersectionObserverEntry[]) => {
    const entry = entries[0];
    isVisible.value = entry.isIntersecting;
    isIntersecting.value = entry.isIntersecting;
    intersectionRatio.value = entry.intersectionRatio;
  };
  
  const startObserving = () => {
    if (typeof window !== 'undefined' && window.IntersectionObserver && elementRef.value) {
      observer = new IntersectionObserver(updateVisibility, {
        threshold: [0, 0.1, 0.5, 1],
      });
      observer.observe(elementRef.value);
    }
  };
  
  const stopObserving = () => {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  };
  
  // 监听元素变化
  watch(elementRef, (newElement) => {
    stopObserving();
    if (newElement) {
      startObserving();
    }
  });
  
  onMounted(() => {
    if (elementRef.value) {
      startObserving();
    }
  });
  
  onUnmounted(() => {
    stopObserving();
  });
  
  return {
    isVisible: isVisible as Ref<boolean>,
    isIntersecting: isIntersecting as Ref<boolean>,
    intersectionRatio: intersectionRatio as Ref<number>,
    
    // 方法
    startObserving,
    stopObserving,
  };
}

// 元素尺寸组合式函数
export function useElementSize(elementRef: Ref<HTMLElement | null>) {
  const width = ref(0);
  const height = ref(0);
  
  let observer: ResizeObserver | null = null;
  
  const updateSize = (entries: ResizeObserverEntry[]) => {
    const entry = entries[0];
    const rect = entry.contentRect;
    width.value = rect.width;
    height.value = rect.height;
  };
  
  const startObserving = () => {
    if (typeof window !== 'undefined' && window.ResizeObserver && elementRef.value) {
      observer = new ResizeObserver(updateSize);
      observer.observe(elementRef.value);
    }
  };
  
  const stopObserving = () => {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  };
  
  // 监听元素变化
  watch(elementRef, (newElement) => {
    stopObserving();
    if (newElement) {
      startObserving();
    }
  });
  
  onMounted(() => {
    if (elementRef.value) {
      startObserving();
    }
  });
  
  onUnmounted(() => {
    stopObserving();
  });
  
  return {
    width: width as Ref<number>,
    height: height as Ref<number>,
    
    // 方法
    startObserving,
    stopObserving,
  };
}

// 滚动锁定组合式函数
export function useScrollLock(initialState = false) {
  const isLocked = ref(initialState);
  const originalOverflow = ref('');
  const originalPaddingRight = ref('');
  
  const lock = () => {
    if (typeof document !== 'undefined' && !isLocked.value) {
      const body = document.body;
      const html = document.documentElement;
      
      // 保存原始样式
      originalOverflow.value = body.style.overflow;
      originalPaddingRight.value = body.style.paddingRight;
      
      // 计算滚动条宽度
      const scrollBarWidth = window.innerWidth - html.clientWidth;
      
      // 设置样式
      body.style.overflow = 'hidden';
      if (scrollBarWidth > 0) {
        body.style.paddingRight = `${scrollBarWidth}px`;
      }
      
      isLocked.value = true;
    }
  };
  
  const unlock = () => {
    if (typeof document !== 'undefined' && isLocked.value) {
      const body = document.body;
      
      // 恢复原始样式
      body.style.overflow = originalOverflow.value;
      body.style.paddingRight = originalPaddingRight.value;
      
      isLocked.value = false;
    }
  };
  
  const toggle = () => {
    if (isLocked.value) {
      unlock();
    } else {
      lock();
    }
  };
  
  // 组件卸载时自动解锁
  onUnmounted(() => {
    if (isLocked.value) {
      unlock();
    }
  });
  
  return {
    isLocked: isLocked as Ref<boolean>,
    lock,
    unlock,
    toggle,
  };
}

// 导出所有响应式工具
export {
  defaultBreakpoints,
};

// 导出类型
export type {
  Breakpoints,
};