// 主题功能集成测试文件
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';
import ThemeSettingsPage from '@/views/theme_settings.vue';
import ThemeService from '@/domains/infrastructure/services/themeService';
import useTheme from '@/domains/infrastructure/composables/useTheme';

// Mock ThemeService
vi.mock('@/domains/infrastructure/services/themeService', () => ({
  default: vi.fn().mockImplementation(() => ({
    init: vi.fn(),
    getTheme: vi.fn().mockReturnValue('light'),
    setTheme: vi.fn(),
    toggleTheme: vi.fn(),
    getColorScheme: vi.fn().mockReturnValue('default'),
    setColorScheme: vi.fn(),
    getAvailableColorSchemes: vi.fn().mockReturnValue([
      { name: '默认', value: 'default' },
      { name: '蓝色', value: 'blue' },
      { name: '绿色', value: 'green' },
    ]),
    addThemeChangeListener: vi.fn(),
    removeThemeChangeListener: vi.fn(),
  })),
}));

// Mock useSettingsStore
vi.mock('@/store/modules/settings', () => ({
  default: () => ({
    settings: {
      app: {
        enableDynamicTitle: true,
      },
      mainSidebar: {
        enable: true,
      },
      subSidebar: {
        enable: true,
      },
      topbar: {
        enable: true,
        mode: 'fixed',
      },
      tabbar: {
        enable: true,
      },
      footer: {
        enable: true,
      },
      copyright: {
        enable: true,
      },
      layout: {
        mode: 'default',
      },
    },
    setSettings: vi.fn(),
  }),
}));

// Mock router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: { template: '<div>Home</div>' },
    },
    {
      path: '/theme-settings',
      component: ThemeSettingsPage,
    },
  ],
});

describe('Theme Integration', () => {
  let wrapper: any;
  let themeService: any;
  let pinia: any;

  beforeEach(() => {
    // 创建新的Pinia实例
    pinia = createPinia();
    setActivePinia(pinia);
    
    // 创建新的ThemeService实例
    themeService = new ThemeService();
    
    // 挂载组件
    wrapper = mount(ThemeSettingsPage, {
      global: {
        plugins: [pinia, router],
        stubs: {
          'el-form': true,
          'el-form-item': true,
          'el-radio-group': true,
          'el-radio': true,
          'el-select': true,
          'el-option': true,
          'el-switch': true,
          'el-divider': true,
          'el-alert': true,
          'el-button': true,
          'el-slider': true,
          'el-tooltip': true,
          'el-icon': true,
          'el-color-picker': true,
          'ThemeSettings': true,
          'ThemeToggle': true,
          'ResponsiveContainer': true,
        },
      },
    });
  });

  it('should render theme settings page correctly', () => {
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('.theme-settings-page').exists()).toBe(true);
  });

  it('should integrate theme service with useTheme composable', () => {
    const { theme, colorScheme, setTheme, setColorScheme, toggleTheme } = useTheme();
    
    expect(theme.value).toBe('light');
    expect(colorScheme.value).toBe('default');
    
    setTheme('dark');
    expect(themeService.setTheme).toHaveBeenCalledWith('dark');
    
    setColorScheme('blue');
    expect(themeService.setColorScheme).toHaveBeenCalledWith('blue');
    
    toggleTheme();
    expect(themeService.toggleTheme).toHaveBeenCalled();
  });

  it('should apply theme classes to document body', () => {
    const bodyClassListAddSpy = vi.spyOn(document.body.classList, 'add');
    const bodyClassListRemoveSpy = vi.spyOn(document.body.classList, 'remove');
    
    // 初始化主题
    const { setTheme } = useTheme();
    setTheme('dark');
    
    expect(bodyClassListRemoveSpy).toHaveBeenCalledWith('light-theme');
    expect(bodyClassListAddSpy).toHaveBeenCalledWith('dark-theme');
  });

  it('should apply color scheme classes to document body', () => {
    const bodyClassListAddSpy = vi.spyOn(document.body.classList, 'add');
    const bodyClassListRemoveSpy = vi.spyOn(document.body.classList, 'remove');
    
    // 初始化颜色方案
    const { setColorScheme } = useTheme();
    setColorScheme('blue');
    
    expect(bodyClassListRemoveSpy).toHaveBeenCalledWith('color-scheme-default');
    expect(bodyClassListAddSpy).toHaveBeenCalledWith('color-scheme-blue');
  });

  it('should dispatch theme change events', () => {
    const dispatchEventSpy = vi.spyOn(document, 'dispatchEvent');
    
    // 设置主题
    const { setTheme } = useTheme();
    setTheme('dark');
    
    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'themechange',
        detail: { theme: 'dark' }
      })
    );
  });

  it('should dispatch color scheme change events', () => {
    const dispatchEventSpy = vi.spyOn(document, 'dispatchEvent');
    
    // 设置颜色方案
    const { setColorScheme } = useTheme();
    setColorScheme('blue');
    
    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'colorschemechange',
        detail: { colorScheme: 'blue' }
      })
    );
  });

  it('should persist theme settings in localStorage', () => {
    const localStorageSetItemSpy = vi.spyOn(localStorage, 'setItem');
    
    // 设置主题
    const { setTheme, setColorScheme } = useTheme();
    setTheme('dark');
    setColorScheme('blue');
    
    expect(localStorageSetItemSpy).toHaveBeenCalledWith('theme', 'dark');
    expect(localStorageSetItemSpy).toHaveBeenCalledWith('colorScheme', 'blue');
  });

  it('should load theme settings from localStorage on initialization', () => {
    const localStorageGetItemSpy = vi.spyOn(localStorage, 'getItem');
    
    // 初始化主题服务
    const themeService = new ThemeService();
    themeService.init();
    
    expect(localStorageGetItemSpy).toHaveBeenCalledWith('theme');
    expect(localStorageGetItemSpy).toHaveBeenCalledWith('colorScheme');
  });

  it('should respond to system theme changes', () => {
    // Mock matchMedia
    const mockMatchMedia = vi.fn().mockImplementation(query => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia,
    });
    
    // 获取系统主题
    const themeService = new ThemeService();
    const systemTheme = themeService.getSystemTheme();
    
    expect(systemTheme).toBe('dark');
    expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
  });

  it('should integrate with responsive layout components', () => {
    // 验证响应式布局容器是否正确集成
    const responsiveContainer = wrapper.findComponent({ name: 'ResponsiveContainer' });
    expect(responsiveContainer.exists()).toBe(true);
    
    // 验证主题切换按钮是否正确集成
    const themeToggle = wrapper.findComponent({ name: 'ThemeToggle' });
    expect(themeToggle.exists()).toBe(true);
  });

  it('should handle theme changes across different components', async () => {
    // 模拟主题变更事件
    const mockEvent = { detail: { theme: 'dark' } };
    
    // 触发主题变更事件
    document.dispatchEvent(new CustomEvent('themechange', { detail: { theme: 'dark' } }));
    
    // 验证主题状态是否已更新
    const { theme } = useTheme();
    expect(theme.value).toBe('dark');
  });

  it('should handle color scheme changes across different components', async () => {
    // 模拟颜色方案变更事件
    const mockEvent = { detail: { colorScheme: 'blue' } };
    
    // 触发颜色方案变更事件
    document.dispatchEvent(new CustomEvent('colorschemechange', { detail: { colorScheme: 'blue' } }));
    
    // 验证颜色方案状态是否已更新
    const { colorScheme } = useTheme();
    expect(colorScheme.value).toBe('blue');
  });
});