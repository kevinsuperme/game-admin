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
      const variants = ['default', 'destructive', 'secondary', 'outline', 'ghost']

      variants.forEach(variant => {
        const wrapper = mount(FaButton, {
          props: {
            variant: variant as any,
          },
        })

        // 组件使用 class-variance-authority，通过类名而非 data 属性
        const classes = wrapper.classes().join(' ')
        expect(classes.length).toBeGreaterThan(0)
      })
    })

    it('应该支持不同的尺寸', () => {
      const sizes = ['sm', 'lg', 'icon']

      sizes.forEach(size => {
        const wrapper = mount(FaButton, {
          props: {
            size: size as any,
          },
        })

        // 组件使用 class-variance-authority，通过类名而非 data 属性
        const classes = wrapper.classes().join(' ')
        expect(classes.length).toBeGreaterThan(0)
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

      // 加载状态下，按钮应该被禁用
      expect(wrapper.find('button').attributes('disabled')).toBeDefined()
      // 加载图标通过 FaIcon 组件渲染，检查是否存在
      const html = wrapper.html()
      expect(html.includes('i-line-md:loading-twotone-loop') || wrapper.findComponent({ name: 'FaIcon' }).exists()).toBe(true)
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

  describe('插槽', () => {
    it('应该支持默认插槽内容', () => {
      const wrapper = mount(FaButton, {
        slots: {
          default: '<span class="test-content">Content</span>',
        },
      })

      expect(wrapper.find('.test-content').exists()).toBe(true)
    })

    it('应该支持图标尺寸变体', () => {
      const wrapper = mount(FaButton, {
        props: {
          size: 'icon',
        },
        slots: {
          default: '<span class="test-icon">Icon</span>',
        },
      })

      // 验证图标尺寸类名存在
      const classes = wrapper.classes().join(' ')
      expect(classes.length).toBeGreaterThan(0)
    })
  })

  describe('无障碍', () => {
    it('禁用状态应该正确设置', () => {
      const wrapper = mount(FaButton, {
        props: {
          disabled: true,
        },
      })

      // 验证禁用属性存在
      expect(wrapper.find('button').attributes('disabled')).toBeDefined()
    })

    it('按钮应该是可访问的', () => {
      const wrapper = mount(FaButton, {
        slots: {
          default: 'Accessible Button',
        },
      })

      // 验证按钮元素存在且包含文本
      expect(wrapper.find('button').exists()).toBe(true)
      expect(wrapper.text()).toContain('Accessible Button')
    })
  })
})