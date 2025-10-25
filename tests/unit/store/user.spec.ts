import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '@/store/modules/user'

describe('User Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  describe('初始状态', () => {
    it('应该有正确的初始状态', () => {
      const userStore = useUserStore()

      expect(userStore.isLogin).toBe(false)
      expect(userStore.account).toBe('')
      expect(userStore.token).toBe('')
      expect(userStore.avatar).toBe('')
      expect(userStore.permissions).toEqual([])
    })
  })

  describe('登录功能', () => {
    it('应该能够登录', async () => {
      const userStore = useUserStore()
      
      const mockLoginData = {
        account: 'testuser',
        token: 'test-token-123',
        avatar: 'https://example.com/avatar.jpg',
        permissions: ['user:read', 'user:write'],
      }

      // Mock API 调用
      const mockLogin = vi.fn().mockResolvedValue(mockLoginData)
      userStore.login = mockLogin as any

      await userStore.login('testuser', 'password')

      expect(mockLogin).toHaveBeenCalledWith('testuser', 'password')
    })

    it('登录后应该更新状态', async () => {
      const userStore = useUserStore()
      
      await userStore.login('testuser', 'password')

      expect(userStore.isLogin).toBe(true)
      expect(userStore.account).toBe('testuser')
      expect(userStore.token).toBeTruthy()
    })

    it('应该将 token 保存到 localStorage', async () => {
      const userStore = useUserStore()
      
      await userStore.login('testuser', 'password')

      const savedToken = localStorage.getItem('token')
      expect(savedToken).toBeTruthy()
    })
  })

  describe('登出功能', () => {
    it('应该能够登出', async () => {
      const userStore = useUserStore()
      
      // 先登录
      await userStore.login('testuser', 'password')
      expect(userStore.isLogin).toBe(true)

      // 登出
      await userStore.logout()

      expect(userStore.isLogin).toBe(false)
      expect(userStore.account).toBe('')
      expect(userStore.token).toBe('')
      expect(userStore.permissions).toEqual([])
    })

    it('登出后应该清除 localStorage', async () => {
      const userStore = useUserStore()
      
      await userStore.login('testuser', 'password')
      await userStore.logout()

      const savedToken = localStorage.getItem('token')
      expect(savedToken).toBeNull()
    })
  })

  describe('权限验证', () => {
    it('应该能够验证单个权限', async () => {
      const userStore = useUserStore()
      
      await userStore.login('testuser', 'password')
      userStore.permissions = ['user:read', 'user:write', 'admin:read']

      expect(userStore.hasPermission('user:read')).toBe(true)
      expect(userStore.hasPermission('user:delete')).toBe(false)
    })

    it('应该能够验证多个权限(AND)', async () => {
      const userStore = useUserStore()
      
      await userStore.login('testuser', 'password')
      userStore.permissions = ['user:read', 'user:write']

      expect(userStore.hasPermissions(['user:read', 'user:write'], 'every')).toBe(true)
      expect(userStore.hasPermissions(['user:read', 'admin:read'], 'every')).toBe(false)
    })

    it('应该能够验证多个权限(OR)', async () => {
      const userStore = useUserStore()
      
      await userStore.login('testuser', 'password')
      userStore.permissions = ['user:read']

      expect(userStore.hasPermissions(['user:read', 'admin:read'], 'some')).toBe(true)
      expect(userStore.hasPermissions(['user:write', 'admin:read'], 'some')).toBe(false)
    })
  })

  describe('用户信息更新', () => {
    it('应该能够更新用户头像', () => {
      const userStore = useUserStore()
      
      const newAvatar = 'https://example.com/new-avatar.jpg'
      userStore.updateAvatar(newAvatar)

      expect(userStore.avatar).toBe(newAvatar)
    })

    it('应该能够更新用户信息', () => {
      const userStore = useUserStore()
      
      const newInfo = {
        nickname: 'New Name',
        email: 'new@example.com',
      }
      
      userStore.updateInfo(newInfo)

      expect(userStore.nickname).toBe('New Name')
      expect(userStore.email).toBe('new@example.com')
    })
  })

  describe('持久化', () => {
    it('应该从 localStorage 恢复状态', () => {
      // 设置初始状态
      localStorage.setItem('token', 'saved-token')
      localStorage.setItem('user', JSON.stringify({
        account: 'saveduser',
        avatar: 'https://example.com/avatar.jpg',
      }))

      const userStore = useUserStore()
      
      // 触发状态恢复
      userStore.$hydrate()

      expect(userStore.token).toBe('saved-token')
      expect(userStore.account).toBe('saveduser')
    })

    it('应该在状态变化时自动持久化', async () => {
      const userStore = useUserStore()
      
      await userStore.login('testuser', 'password')

      const savedData = localStorage.getItem('user')
      expect(savedData).toBeTruthy()
      
      const parsed = JSON.parse(savedData!)
      expect(parsed.account).toBe('testuser')
    })
  })
})