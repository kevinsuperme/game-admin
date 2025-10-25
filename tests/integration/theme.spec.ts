import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ThemeToggle from '@/domains/infrastructure/components/ThemeToggle.vue'
import { useSettingsStore } from '@/store/modules/settings'

describe('主题系统集成测试', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    document.documentElement.removeAttribute('class')
  })

  describe('主题切换', () => {
    it('应该能够在亮色和暗色主题之间切换', async () => {
      const wrapper = mount(ThemeToggle)
      const settingsStore = useSettingsStore()

      // 初始状态应该是亮色主题
      expect(settingsStore.settings.app.theme.mode).toBe('light')
      expect(document.documentElement.classList.contains('dark')).toBe(false)

      // 切换到暗色主题
      await wrapper.find('button').trigger('click')
      
      expect(settingsStore.settings.app.theme.mode).toBe('dark')
      expect(document.documentElement.classList.contains('dark')).toBe(true)

      // 再次切换回亮色主题
      await wrapper.find('button').trigger('click')
      
      expect(settingsStore.settings.app.theme.mode).toBe('light')
      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })

    it('应该保存主题设置到 localStorage', async () => {
      const wrapper = mount(ThemeToggle)
      
      await wrapper.find('button').trigger('click')
      
      const savedSettings = localStorage.getItem('settings')
      expect(savedSettings).toBeTruthy()
      
      const parsed = JSON.parse(savedSettings!)
      expect(parsed.app.theme.mode).toBe('dark')
    })

    it('应该从 localStorage 恢复主题设置', () => {
      // 预先设置 localStorage
      localStorage.setItem('settings', JSON.stringify({
        app: {
          theme: {
            mode: 'dark',
          },
        },
      }))

      // 重新创建 store
      setActivePinia(createPinia())
      const settingsStore = useSettingsStore()
      
      expect(settingsStore.settings.app.theme.mode).toBe('dark')
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })
  })

  describe('主题色切换', () => {
    it('应该能够切换主题色', () => {
      const settingsStore = useSettingsStore()
      
      settingsStore.updateThemeColor('blue')
      
      expect(settingsStore.settings.app.theme.color).toBe('blue')
      expect(document.documentElement.style.getPropertyValue('--theme-color')).toBeTruthy()
    })

    it('应该支持自定义主题色', () => {
      const settingsStore = useSettingsStore()
      
      const customColor = '#FF5733'
      settingsStore.updateThemeColor(customColor)
      
      expect(settingsStore.settings.app.theme.color).toBe(customColor)
    })
  })

  describe('系统主题跟随', () => {
    it('应该能够跟随系统主题', () => {
      const settingsStore = useSettingsStore()
      
      // Mock matchMedia
      const mockMatchMedia = (matches: boolean) => ({
        matches,
        media: '(prefers-color-scheme: dark)',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })

      // 系统为暗色模式
      window.matchMedia = vi.fn().mockImplementation(() => mockMatchMedia(true))
      
      settingsStore.setThemeMode('auto')
      
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })
  })

  describe('主题持久化', () => {
    it('应该在页面刷新后保持主题设置', () => {
      const settingsStore = useSettingsStore()
      
      // 设置暗色主题和蓝色主题色
      settingsStore.setThemeMode('dark')
      settingsStore.updateThemeColor('blue')
      
      // 模拟页面刷新
      const savedSettings = localStorage.getItem('settings')
      
      // 清空并重新初始化
      setActivePinia(createPinia())
      const newSettingsStore = useSettingsStore()
      
      // 从 localStorage 恢复
      if (savedSettings) {
        newSettingsStore.$patch(JSON.parse(savedSettings))
      }
      
      expect(newSettingsStore.settings.app.theme.mode).toBe('dark')
      expect(newSettingsStore.settings.app.theme.color).toBe('blue')
    })
  })
})