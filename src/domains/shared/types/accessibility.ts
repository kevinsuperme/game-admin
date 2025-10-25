// 可访问性相关类型定义
import type { Ref, ComputedRef } from 'vue';

// 可访问性等级
export type AccessibilityLevel = 'A' | 'AA' | 'AAA';

// 可访问性标准
export interface AccessibilityStandard {
  level: AccessibilityLevel;
  guidelines: {
    perceivable: boolean;
    operable: boolean;
    understandable: boolean;
    robust: boolean;
  };
  features: {
    keyboardNavigation: boolean;
    screenReaderSupport: boolean;
    highContrastMode: boolean;
    reducedMotion: boolean;
    focusManagement: boolean;
    ariaLabels: boolean;
    semanticHtml: boolean;
    colorContrast: boolean;
    textResizing: boolean;
  };
}

// 可访问性配置
export interface AccessibilityConfig {
  enabled: boolean;
  level: AccessibilityLevel;
  features: {
    keyboardNavigation: boolean;
    screenReaderSupport: boolean;
    highContrastMode: boolean;
    reducedMotion: boolean;
    focusManagement: boolean;
    ariaLabels: boolean;
    semanticHtml: boolean;
    colorContrast: boolean;
    textResizing: boolean;
  };
  shortcuts: Record<string, string>;
  announcements: {
    pageLoad: boolean;
    navigation: boolean;
    errors: boolean;
    success: boolean;
    warnings: boolean;
  };
}

// 默认可访问性配置
export const defaultAccessibilityConfig: AccessibilityConfig = {
  enabled: true,
  level: 'AA',
  features: {
    keyboardNavigation: true,
    screenReaderSupport: true,
    highContrastMode: true,
    reducedMotion: true,
    focusManagement: true,
    ariaLabels: true,
    semanticHtml: true,
    colorContrast: true,
    textResizing: true,
  },
  shortcuts: {
    'skipToContent': 'Alt+S',
    'mainNavigation': 'Alt+M',
    'search': 'Alt+/',
    'help': 'Alt+H',
    'toggleHighContrast': 'Alt+C',
    'toggleReducedMotion': 'Alt+R',
    'increaseFontSize': 'Alt+Plus',
    'decreaseFontSize': 'Alt+-',
    'resetFontSize': 'Alt+0',
  },
  announcements: {
    pageLoad: true,
    navigation: true,
    errors: true,
    success: true,
    warnings: true,
  },
};

// ARIA属性类型
export interface AriaAttributes {
  role?: string;
  ariaLabel?: string;
  ariaLabelledby?: string;
  ariaDescribedby?: string;
  ariaExpanded?: boolean;
  ariaSelected?: boolean;
  ariaChecked?: boolean;
  ariaPressed?: boolean;
  ariaHidden?: boolean;
  ariaDisabled?: boolean;
  ariaRequired?: boolean;
  ariaInvalid?: boolean;
  ariaBusy?: boolean;
  ariaLive?: 'off' | 'polite' | 'assertive';
  ariaAtomic?: boolean;
  ariaRelevant?: string;
  ariaDropeffect?: string;
  ariaGrabbed?: boolean;
  ariaActivedescendant?: string;
  ariaColcount?: number;
  ariaColindex?: number;
  ariaColspan?: number;
  ariaControls?: string;
  ariaFlowto?: string;
  ariaHaspopup?: boolean | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
  ariaLevel?: number;
  ariaMultiline?: boolean;
  ariaMultiselectable?: boolean;
  ariaOrientation?: 'horizontal' | 'vertical';
  ariaOwns?: string;
  ariaPosinset?: number;
  ariaReadonly?: boolean;
  ariaRelevant?: string;
  ariaRequired?: boolean;
  ariaRowcount?: number;
  ariaRowindex?: number;
  ariaRowspan?: number;
  ariaSetsize?: number;
  ariaSort?: 'none' | 'ascending' | 'descending' | 'other';
  ariaValuemax?: number;
  ariaValuemin?: number;
  ariaValuenow?: number;
  ariaValuetext?: string;
}

// 焦点管理类型
export interface FocusManagement {
  trapFocus: boolean;
  restoreFocus: boolean;
  initialFocus?: string | HTMLElement;
  finalFocus?: string | HTMLElement;
  preventScroll?: boolean;
}

// 键盘导航类型
export interface KeyboardNavigation {
  enabled: boolean;
  shortcuts: Record<string, (event: KeyboardEvent) => void>;
  trapFocus: boolean;
  restoreFocus: boolean;
  initialFocus?: string | HTMLElement;
  finalFocus?: string | HTMLElement;
}

// 屏幕阅读器支持类型
export interface ScreenReaderSupport {
  enabled: boolean;
  announcements: {
    pageLoad: boolean;
    navigation: boolean;
    errors: boolean;
    success: boolean;
    warnings: boolean;
  };
  liveRegions: {
    polite: string[];
    assertive: string[];
    off: string[];
  };
}

// 高对比度模式类型
export interface HighContrastMode {
  enabled: boolean;
  theme: {
    background: string;
    foreground: string;
    primary: string;
    secondary: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    border: string;
    focus: string;
  };
}

// 减少动画模式类型
export interface ReducedMotionMode {
  enabled: boolean;
  respectPrefersReducedMotion: boolean;
  animations: {
    enabled: boolean;
    duration: number;
    easing: string;
  };
  transitions: {
    enabled: boolean;
    duration: number;
    easing: string;
  };
}

// 文本大小调整类型
export interface TextResizing {
  enabled: boolean;
  minFontSize: number;
  maxFontSize: number;
  step: number;
  currentSize: number;
  defaultSize: number;
}

// 可访问性工具函数类型
export interface AccessibilityUtils {
  // ARIA属性生成
  generateAriaAttributes: (props: any) => AriaAttributes;
  
  // 焦点管理
  trapFocus: (element: HTMLElement) => () => void;
  restoreFocus: (element: HTMLElement) => void;
  setFocus: (element: HTMLElement | string) => void;
  
  // 键盘导航
  handleKeyboardNavigation: (event: KeyboardEvent, handlers: Record<string, (event: KeyboardEvent) => void>) => void;
  
  // 屏幕阅读器公告
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
  
  // 高对比度模式
  toggleHighContrast: () => void;
  isHighContrastMode: () => boolean;
  
  // 减少动画模式
  toggleReducedMotion: () => void;
  isReducedMotionMode: () => boolean;
  
  // 文本大小调整
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  resetFontSize: () => void;
  getFontSize: () => number;
  setFontSize: (size: number) => void;
  
  // 可访问性检查
  checkColorContrast: (foreground: string, background: string) => { ratio: number; level: 'AA' | 'AAA' | 'fail' };
  checkKeyboardAccessibility: (element: HTMLElement) => boolean;
  checkScreenReaderAccessibility: (element: HTMLElement) => boolean;
}

// 可访问性组合式函数类型
export interface UseAccessibilityReturn {
  // 配置
  config: Ref<AccessibilityConfig>;
  updateConfig: (newConfig: Partial<AccessibilityConfig>) => void;
  
  // 功能
  isHighContrastMode: ComputedRef<boolean>;
  isReducedMotionMode: ComputedRef<boolean>;
  currentFontSize: ComputedRef<number>;
  
  // 方法
  toggleHighContrast: () => void;
  toggleReducedMotion: () => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  resetFontSize: () => void;
  setFontSize: (size: number) => void;
  
  // ARIA属性
  getAriaAttributes: (props: any) => AriaAttributes;
  
  // 焦点管理
  trapFocus: (element: HTMLElement) => () => void;
  restoreFocus: (element: HTMLElement) => void;
  setFocus: (element: HTMLElement | string) => void;
  
  // 屏幕阅读器
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
  
  // 键盘导航
  addKeyboardShortcut: (key: string, handler: (event: KeyboardEvent) => void) => void;
  removeKeyboardShortcut: (key: string) => void;
  
  // 可访问性检查
  checkColorContrast: (foreground: string, background: string) => { ratio: number; level: 'AA' | 'AAA' | 'fail' };
  checkKeyboardAccessibility: (element: HTMLElement) => boolean;
  checkScreenReaderAccessibility: (element: HTMLElement) => boolean;
}

// 可访问性相关常量
export const ACCESSIBILITY_STORAGE_KEY = 'app-accessibility-config';
export const ACCESSIBILITY_CLASS_PREFIX = 'a11y-';
export const HIGH_CONTRAST_CLASS = 'high-contrast';
export const REDUCED_MOTION_CLASS = 'reduced-motion';
export const FONT_SIZE_STORAGE_KEY = 'app-font-size';

// 可访问性相关类型导出
export type {
  AccessibilityLevel,
  AccessibilityStandard,
  AccessibilityConfig,
  AriaAttributes,
  FocusManagement,
  KeyboardNavigation,
  ScreenReaderSupport,
  HighContrastMode,
  ReducedMotionMode,
  TextResizing,
  AccessibilityUtils,
  UseAccessibilityReturn,
};