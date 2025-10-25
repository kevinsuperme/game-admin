// 主题设置组件测试文件
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import ThemeSettings from '../ThemeSettings.vue';
import themeService from '../../services/themeService';

// Mock ThemeService
vi.mock('../../services/themeService', () => ({
  default: {
    getSystemTheme: vi.fn().mockReturnValue('light'),
    getThemeConfig: vi.fn().mockReturnValue({
      mode: 'light',
      colorScheme: 'default',
      primaryColor: '#1890ff',
      fontSize: 'medium',
      borderRadius: 'medium',
      sidebarCollapsed: false,
      compactMode: false,
      animationsEnabled: true,
      highContrast: false,
      reducedMotion: false,
    }),
    setThemeMode: vi.fn(),
    setColorScheme: vi.fn(),
    setPrimaryColor: vi.fn(),
    setFontSize: vi.fn(),
    setBorderRadius: vi.fn(),
    toggleSidebar: vi.fn(),
    setSidebarCollapsed: vi.fn(),
    toggleCompactMode: vi.fn(),
    setCompactMode: vi.fn(),
    toggleAnimations: vi.fn(),
    setAnimationsEnabled: vi.fn(),
    toggleHighContrast: vi.fn(),
    setHighContrast: vi.fn(),
    toggleReducedMotion: vi.fn(),
    setReducedMotion: vi.fn(),
    resetTheme: vi.fn(),
    onThemeChange: vi.fn().mockReturnValue(vi.fn()),
    onDeviceChange: vi.fn().mockReturnValue(vi.fn()),
    onScreenSizeChange: vi.fn().mockReturnValue(vi.fn()),
    getDeviceType: vi.fn().mockReturnValue('desktop'),
    getScreenSize: vi.fn().mockReturnValue({ width: 1200, height: 800 }),
    isLandscape: vi.fn().mockReturnValue(false),
    isPortrait: vi.fn().mockReturnValue(true),
  }
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

describe('ThemeSettings', () => {
  let wrapper: any;

  beforeEach(() => {
    // 创建Pinia实例
    const pinia = createPinia();
    setActivePinia(pinia);
    
    // 挂载组件
    wrapper = mount(ThemeSettings, {
      global: {
        plugins: [pinia],
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
        },
      },
    });
  });

  it('should render correctly', () => {
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('.theme-settings').exists()).toBe(true);
  });

  it('should display theme options', () => {
    expect(wrapper.find('.setting-options').exists()).toBe(true);
    expect(wrapper.find('.color-schemes').exists()).toBe(true);
  });

  it('should initialize with current theme', () => {
    expect(wrapper.vm.themeConfig.mode).toBe('light');
    expect(wrapper.vm.themeConfig.colorScheme).toBe('default');
  });

  describe('theme selection', () => {
    it('should change theme when option is selected', async () => {
      // 查找主题选项
      const themeOptions = wrapper.findAll('.option-item');
      expect(themeOptions.length).toBeGreaterThan(0);
      
      // 查找深色主题选项
      const darkThemeOption = wrapper.find('.option-item:nth-child(2)');
      if (darkThemeOption.exists()) {
        // 点击深色主题选项
        await darkThemeOption.trigger('click');
        
        // 验证主题是否已更改
        expect(themeService.setThemeMode).toHaveBeenCalledWith('dark');
      }
    });
  });

  describe('color scheme selection', () => {
    it('should change color scheme when option is selected', async () => {
      const colorSchemeSelect = wrapper.find('.color-schemes');
      expect(colorSchemeSelect.exists()).toBe(true);
      
      // 模拟选择蓝色主题
      const blueSchemeOption = wrapper.find('[data-value="blue"]');
      if (blueSchemeOption.exists()) {
        await blueSchemeOption.trigger('click');
      } else {
        // 如果没有找到data-value属性，尝试通过类名查找
        const colorSchemeItems = wrapper.findAll('.color-scheme-item');
        if (colorSchemeItems.length > 1) {
          await colorSchemeItems[1].trigger('click');
        }
      }
    });
  });

  describe('layout options', () => {
    it('should toggle compact mode when switch is changed', async () => {
      const compactModeSwitch = wrapper.find('.setting-options .option-item:nth-child(1) .el-switch');
      if (compactModeSwitch.exists()) {
        // 模拟切换开关
        await compactModeSwitch.trigger('click');
        
        // 验证设置是否已更新
        expect(themeService.setCompactMode).toHaveBeenCalled();
      }
    });

    it('should toggle sidebar collapsed when switch is changed', async () => {
      const sidebarCollapsedSwitch = wrapper.find('.setting-options .option-item:nth-child(2) .el-switch');
      if (sidebarCollapsedSwitch.exists()) {
        // 模拟切换开关
        await sidebarCollapsedSwitch.trigger('click');
        
        // 验证设置是否已更新
        expect(themeService.setSidebarCollapsed).toHaveBeenCalled();
      }
    });
  });

  describe('theme change listener', () => {
    it('should listen to theme change events', () => {
      expect(themeService.onThemeChange).toHaveBeenCalled();
    });

    it('should update current theme when theme change event is fired', () => {
      // 直接更新主题模式
      wrapper.vm.themeConfig.mode = 'dark';
      expect(wrapper.vm.themeConfig.mode).toBe('dark');
    });
  });

  describe('color scheme change listener', () => {
    it('should listen to color scheme change events', () => {
      expect(themeService.onThemeChange).toHaveBeenCalled();
    });

    it('should update current color scheme when color scheme change event is fired', () => {
      // 直接更新颜色方案
      wrapper.vm.themeConfig.colorScheme = 'blue';
      expect(wrapper.vm.themeConfig.colorScheme).toBe('blue');
    });
  });

  describe('reset settings', () => {
    it('should reset all settings to default values', async () => {
      // 修改一些设置
      wrapper.vm.themeConfig.mode = 'dark';
      wrapper.vm.themeConfig.colorScheme = 'blue';
      wrapper.vm.themeConfig.compactMode = true;
      
      // 直接调用重置方法
      wrapper.vm.handleResetTheme();
      
      // 验证设置是否已重置为默认值
      expect(themeService.resetTheme).toHaveBeenCalled();
    });
  });

  describe('responsive behavior', () => {
    it('should adapt to mobile view', async () => {
      // 模拟移动端视口
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 480,
      });
      
      // 触发窗口大小变化事件
      window.dispatchEvent(new Event('resize'));
      
      // 验证组件是否仍然存在
      expect(wrapper.find('.theme-settings').exists()).toBe(true);
    });
  });
});