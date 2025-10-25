import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import FaButton from '@/ui/components/FaButton/index.vue'

describe('FaButton', () => {
  describe('渲染', () => {
    it('应该正确渲染按钮', () => {
      const wrapper = mount(FaButton, {
        slots: {
          default: 'Click me',
        },
      })

      expect(wrapper.text()).toBe('Click me')
      expect(wrapper.find('button').exists()).toBe(true)
    })

    it('应该支持自定义类名', () => {
      const wrapper = mount(FaButton, {
        props: {
          class: 'custom-class',
        },
      })

      expect(wrapper.classes()).toContain('custom-class')
    })
  })

  describe('变体', () => {
    it('应该支持不同的变体', () => {
      const variants = ['default', 'primary', 'secondary', 'outline', 'ghost']
      
      variants.forEach(variant => {
        const wrapper = mount(FaButton, {
          props: {
            variant: variant as any,
          },
        })

        expect(wrapper.attributes('data-variant')).toBe(variant)
      })
    })

    it('应该支持不同的尺寸', () => {
      const sizes = ['sm', 'md', 'lg']
      
      sizes.forEach(size => {
        const wrapper = mount(FaButton, {
          props: {
            size: size as any,
          },
        })

        expect(wrapper.attributes('data-size')).toBe(size)
      })
    })
  })

  describe('状态', () => {
    it('应该支持禁用状态', () => {
      const wrapper = mount(FaButton, {
        props: {
          disabled: true,
        },
      })

      expect(wrapper.find('button').attributes('disabled')).toBeDefined()
    })

    it('应该支持加载状态', () => {
      const wrapper = mount(FaButton, {
        props: {
          loading: true,
        },
      })

      expect(wrapper.find('.loading-icon').exists()).toBe(true)
      expect(wrapper.find('button').attributes('disabled')).toBeDefined()
    })
  })

  describe('事件', () => {
    it('应该触发点击事件', async () => {
      const wrapper = mount(FaButton)
      
      await wrapper.find('button').trigger('click')
      
      expect(wrapper.emitted('click')).toBeTruthy()
      expect(wrapper.emitted('click')?.[0]).toBeTruthy()
    })

    it('禁用时不应该触发点击事件', async () => {
      const wrapper = mount(FaButton, {
        props: {
          disabled: true,
        },
      })
      
      await wrapper.find('button').trigger('click')
      
      expect(wrapper.emitted('click')).toBeFalsy()
    })

    it('加载时不应该触发点击事件', async () => {
      const wrapper = mount(FaButton, {
        props: {
          loading: true,
        },
      })
      
      await wrapper.find('button').trigger('click')
      
      expect(wrapper.emitted('click')).toBeFalsy()
    })
  })

  describe('图标', () => {
    it('应该支持前置图标', () => {
      const wrapper = mount(FaButton, {
        slots: {
          icon: '<span class="test-icon">Icon</span>',
        },
      })

      expect(wrapper.find('.test-icon').exists()).toBe(true)
    })

    it('应该支持仅图标模式', () => {
      const wrapper = mount(FaButton, {
        props: {
          iconOnly: true,
        },
        slots: {
          icon: '<span class="test-icon">Icon</span>',
        },
      })

      expect(wrapper.classes()).toContain('icon-only')
    })
  })

  describe('无障碍', () => {
    it('应该有正确的 ARIA 属性', () => {
      const wrapper = mount(FaButton, {
        props: {
          disabled: true,
        },
      })

      expect(wrapper.find('button').attributes('aria-disabled')).toBe('true')
    })

    it('应该支持自定义 aria-label', () => {
      const wrapper = mount(FaButton, {
        props: {
          ariaLabel: 'Custom label',
        },
      })

      expect(wrapper.find('button').attributes('aria-label')).toBe('Custom label')
    })
  })
})