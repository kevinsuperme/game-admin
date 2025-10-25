// 响应式布局容器组件测试文件
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ResponsiveContainer from '../ResponsiveContainer.vue';

describe('ResponsiveContainer', () => {
  let wrapper: any;

  beforeEach(() => {
    // 重置窗口大小
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    
    // 挂载组件
    wrapper = mount(ResponsiveContainer, {
      props: {
        breakpoint: 'desktop',
        direction: 'row',
        spacing: 'medium',
        padding: 'large',
      },
      slots: {
        default: '<div class="test-content">Test Content</div>',
      },
    });
  });

  it('should render correctly', () => {
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('.responsive-container').exists()).toBe(true);
    expect(wrapper.find('.test-content').exists()).toBe(true);
  });

  it('should apply default props when not provided', () => {
    wrapper = mount(ResponsiveContainer, {
      slots: {
        default: '<div class="test-content">Test Content</div>',
      },
    });
    
    expect(wrapper.vm.breakpoint).toBe('all');
    expect(wrapper.vm.direction).toBe('row');
    expect(wrapper.vm.spacing).toBe('medium');
    expect(wrapper.vm.padding).toBe('medium');
  });

  describe('breakpoint classes', () => {
    it('should apply all breakpoint class when breakpoint is all', async () => {
      await wrapper.setProps({ breakpoint: 'all' });
      expect(wrapper.find('.responsive-container.breakpoint-all').exists()).toBe(true);
    });

    it('should apply desktop breakpoint class when breakpoint is desktop', async () => {
      await wrapper.setProps({ breakpoint: 'desktop' });
      expect(wrapper.find('.responsive-container.breakpoint-desktop').exists()).toBe(true);
    });

    it('should apply tablet breakpoint class when breakpoint is tablet', async () => {
      await wrapper.setProps({ breakpoint: 'tablet' });
      expect(wrapper.find('.responsive-container.breakpoint-tablet').exists()).toBe(true);
    });

    it('should apply mobile breakpoint class when breakpoint is mobile', async () => {
      await wrapper.setProps({ breakpoint: 'mobile' });
      expect(wrapper.find('.responsive-container.breakpoint-mobile').exists()).toBe(true);
    });
  });

  describe('direction classes', () => {
    it('should apply row direction class when direction is row', async () => {
      await wrapper.setProps({ direction: 'row' });
      expect(wrapper.find('.responsive-container.direction-row').exists()).toBe(true);
    });

    it('should apply column direction class when direction is column', async () => {
      await wrapper.setProps({ direction: 'column' });
      expect(wrapper.find('.responsive-container.direction-column').exists()).toBe(true);
    });
  });

  describe('spacing classes', () => {
    it('should apply none spacing class when spacing is none', async () => {
      await wrapper.setProps({ spacing: 'none' });
      expect(wrapper.find('.responsive-container.spacing-none').exists()).toBe(true);
    });

    it('should apply small spacing class when spacing is small', async () => {
      await wrapper.setProps({ spacing: 'small' });
      expect(wrapper.find('.responsive-container.spacing-small').exists()).toBe(true);
    });

    it('should apply medium spacing class when spacing is medium', async () => {
      await wrapper.setProps({ spacing: 'medium' });
      expect(wrapper.find('.responsive-container.spacing-medium').exists()).toBe(true);
    });

    it('should apply large spacing class when spacing is large', async () => {
      await wrapper.setProps({ spacing: 'large' });
      expect(wrapper.find('.responsive-container.spacing-large').exists()).toBe(true);
    });
  });

  describe('padding classes', () => {
    it('should apply none padding class when padding is none', async () => {
      await wrapper.setProps({ padding: 'none' });
      expect(wrapper.find('.responsive-container.padding-none').exists()).toBe(true);
    });

    it('should apply small padding class when padding is small', async () => {
      await wrapper.setProps({ padding: 'small' });
      expect(wrapper.find('.responsive-container.padding-small').exists()).toBe(true);
    });

    it('should apply medium padding class when padding is medium', async () => {
      await wrapper.setProps({ padding: 'medium' });
      expect(wrapper.find('.responsive-container.padding-medium').exists()).toBe(true);
    });

    it('should apply large padding class when padding is large', async () => {
      await wrapper.setProps({ padding: 'large' });
      expect(wrapper.find('.responsive-container.padding-large').exists()).toBe(true);
    });
  });

  describe('align classes', () => {
    it('should apply start align class when align is start', async () => {
      await wrapper.setProps({ align: 'start' });
      expect(wrapper.find('.responsive-container.align-start').exists()).toBe(true);
    });

    it('should apply center align class when align is center', async () => {
      await wrapper.setProps({ align: 'center' });
      expect(wrapper.find('.responsive-container.align-center').exists()).toBe(true);
    });

    it('should apply end align class when align is end', async () => {
      await wrapper.setProps({ align: 'end' });
      expect(wrapper.find('.responsive-container.align-end').exists()).toBe(true);
    });

    it('should apply stretch align class when align is stretch', async () => {
      await wrapper.setProps({ align: 'stretch' });
      expect(wrapper.vm.containerClasses).toContain('align-stretch');
      expect(wrapper.find('.responsive-container.align-stretch').exists()).toBe(true);
    });
  });

  describe('responsive behavior', () => {
    it('should be visible when window width matches breakpoint', async () => {
      // 桌面端断点为1200px，设置窗口宽度为1200px
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      });
      
      // 手动更新窗口宽度
      wrapper.vm.updateWindowWidth();
      
      await wrapper.setProps({ breakpoint: 'desktop' });
      expect(wrapper.vm.isVisible).toBe(true);
    });

    it('should be hidden when window width does not match breakpoint', async () => {
      // 桌面端断点为1200px，设置窗口宽度为768px
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });
      
      // 手动更新窗口宽度
      wrapper.vm.updateWindowWidth();
      
      await wrapper.setProps({ breakpoint: 'desktop' });
      expect(wrapper.vm.isVisible).toBe(false);
    });

    it('should update visibility when window is resized', async () => {
      // 设置初始窗口宽度为1200px（桌面端）
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      });
      
      // 手动更新窗口宽度
      wrapper.vm.updateWindowWidth();
      
      // 初始为桌面端，可见
      await wrapper.setProps({ breakpoint: 'desktop' });
      expect(wrapper.vm.isVisible).toBe(true);
      
      // 模拟窗口大小变化到移动端
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 480,
      });
      
      // 手动更新窗口宽度
      wrapper.vm.updateWindowWidth();
      
      // 等待Vue更新
      await wrapper.vm.$nextTick();
      
      // 桌面端组件在移动端应该不可见
      expect(wrapper.vm.isVisible).toBe(false);
    });
  });

  describe('computed styles', () => {
    it('should compute correct container classes', async () => {
      await wrapper.setProps({
        breakpoint: 'mobile',
        direction: 'column',
        spacing: 'large',
        padding: 'medium',
        align: 'center',
      });
      
      const classes = wrapper.vm.containerClasses;
      console.log('Breakpoint prop:', wrapper.vm.breakpoint);
      console.log('Container classes:', classes);
      
      expect(classes).toContain('responsive-container');
      expect(classes).toContain('breakpoint-mobile');
      expect(classes).toContain('direction-column');
      expect(classes).toContain('spacing-large');
      expect(classes).toContain('padding-medium');
      expect(classes).toContain('align-center');
    });

    it('should compute correct container styles', () => {
      wrapper.setProps({
        direction: 'column',
        spacing: 'large',
      });
      
      const styles = wrapper.vm.containerStyle;
      
      expect(styles.display).toBe(wrapper.vm.isVisible ? 'flex' : 'none');
      expect(styles.gap).toBe('1rem');
    });
  });

  describe('cleanup', () => {
    it('should remove resize event listener when component is unmounted', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      
      wrapper.unmount();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    });
  });
});