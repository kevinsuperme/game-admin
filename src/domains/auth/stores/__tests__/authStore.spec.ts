import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../authStore'
import { tokenService } from '@/domains/shared/services/TokenService'
import type { User, AuthResult } from '../../types'

// Mock authService
vi.mock('../../services/authService', () => ({
  authService: {
    login: vi.fn(),
    logout: vi.fn(),
    refreshToken: vi.fn(),
    getPermissions: vi.fn(),
    changePassword: vi.fn(),
  },
}))

import { authService } from '../../services/authService'
const mockAuthService = authService as any

describe('AuthStore', () => {
  let authStore: ReturnType<typeof useAuthStore>
  const mockUser: User = {
    id: '1',
    account: 'testuser',
    avatar: 'test-avatar.png',
    permissions: ['user:read', 'user:write'],
    roles: ['user'],
  }

  const mockAuthResult: AuthResult = {
    user: mockUser,
    token: 'test-token',
    refreshToken: 'test-refresh-token',
    expiresIn: 3600,
  }

  beforeEach(() => {
    setActivePinia(createPinia())
    authStore = useAuthStore()
    tokenService.clearToken()
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    tokenService.clearToken()
    localStorage.clear()
  })

  describe('登录流程', () => {
    it('成功登录应该保存 token 和用户信息', async () => {
      mockAuthService.login.mockResolvedValue(mockAuthResult)

      await authStore.login({ account: 'testuser', password: 'password' })

      expect(authStore.isAuthenticated).toBe(true)
      expect(authStore.user).toEqual(mockUser)
      expect(authStore.token).toBe('test-token')
      expect(authStore.refreshToken).toBe('test-refresh-token')
      expect(authStore.permissions).toEqual(['user:read', 'user:write'])
      expect(tokenService.getAccessToken()).toBe('test-token')
      expect(tokenService.getRefreshToken()).toBe('test-refresh-token')
      expect(localStorage.getItem('permissions')).toBe(JSON.stringify(['user:read', 'user:write']))
    })

    it('登录失败应该设置错误信息', async () => {
      const error = new Error('用户名或密码错误')
      mockAuthService.login.mockRejectedValue(error)

      await expect(authStore.login({ account: 'testuser', password: 'wrong' })).rejects.toThrow(error)
      expect(authStore.isAuthenticated).toBe(false)
      expect(authStore.user).toBeNull()
      expect(authStore.error).toBe('用户名或密码错误')
    })

    it('登录过程中应该设置加载状态', async () => {
      let resolveLogin: (value: AuthResult) => void
      const loginPromise = new Promise<AuthResult>((resolve) => {
        resolveLogin = resolve
      })
      mockAuthService.login.mockReturnValue(loginPromise)

      const loginProcess = authStore.login({ account: 'testuser', password: 'password' })
      expect(authStore.isLoading).toBe(true)

      resolveLogin!(mockAuthResult)
      await loginProcess

      expect(authStore.isLoading).toBe(false)
    })
  })

  describe('登出流程', () => {
    it('应该清除所有认证状态', async () => {
      // 先设置已登录状态
      tokenService.setToken({ 
        token: 'test-token',
        refreshToken: 'test-refresh-token',
        expiresAt: Date.now() + 3600000,
      })
      localStorage.setItem('permissions', JSON.stringify(['user:read']))
      
      authStore.$patch({
        isAuthenticated: true,
        user: mockUser,
        token: 'test-token',
        refreshToken: 'test-refresh-token',
        permissions: ['user:read'],
      })

      mockAuthService.logout.mockResolvedValue(undefined)
      await authStore.logout()

      expect(authStore.isAuthenticated).toBe(false)
      expect(authStore.user).toBeNull()
      expect(authStore.token).toBeNull()
      expect(authStore.refreshToken).toBeNull()
      expect(authStore.permissions).toEqual([])
      expect(tokenService.getAccessToken()).toBeNull()
      expect(localStorage.getItem('permissions')).toBeNull()
    })

    it('即使API调用失败也应该清除本地状态', async () => {
      // 先设置已登录状态
      tokenService.setToken({ token: 'test-token' })
      authStore.$patch({
        isAuthenticated: true,
        user: mockUser,
        token: 'test-token',
      })

      mockAuthService.logout.mockRejectedValue(new Error('网络错误'))
      
      // 即使API失败，本地状态也应该被清除
      await authStore.logout()
      expect(authStore.isAuthenticated).toBe(false)
      expect(tokenService.getAccessToken()).toBeNull()
    })
  })

  describe('Token刷新', () => {
    it('应该能刷新token', async () => {
      // 先设置初始token
      tokenService.setToken({ 
        token: 'old-token',
        refreshToken: 'old-refresh-token',
        expiresAt: Date.now() - 1000, // 已过期
      })
      
      authStore.$patch({
        isAuthenticated: true,
        token: 'old-token',
        refreshToken: 'old-refresh-token',
      })

      const newAuthResult = {
        ...mockAuthResult,
        token: 'new-token',
        refreshToken: 'new-refresh-token',
      }
      mockAuthService.refreshToken.mockResolvedValue(newAuthResult)

      await authStore.refreshAuthToken()

      expect(authStore.token).toBe('new-token')
      expect(authStore.refreshToken).toBe('new-refresh-token')
      expect(tokenService.getAccessToken()).toBe('new-token')
      expect(tokenService.getRefreshToken()).toBe('new-refresh-token')
    })

    it('刷新失败应该清除认证状态', async () => {
      tokenService.setToken({ 
        token: 'old-token',
        refreshToken: 'old-refresh-token',
        expiresAt: Date.now() + 3600000,
      })
      authStore.$patch({
        isAuthenticated: true,
        token: 'old-token',
        refreshToken: 'old-refresh-token',
      })

      mockAuthService.refreshToken.mockRejectedValue(new Error('刷新失败'))

      await expect(authStore.refreshAuthToken()).rejects.toThrow('刷新失败')
      expect(authStore.isAuthenticated).toBe(false)
      expect(tokenService.getAccessToken()).toBeNull()
    })
  })

  describe('权限检查', () => {
    it('应该正确检查单个权限', () => {
      authStore.$patch({
        permissions: ['user:read', 'user:write'],
      })

      expect(authStore.hasPermission('user:read')).toBe(true)
      expect(authStore.hasPermission('user:delete')).toBe(false)
    })

    it('应该正确检查多个权限中的任意一个', () => {
      authStore.$patch({
        permissions: ['user:read', 'user:write'],
      })

      expect(authStore.hasAnyPermission(['user:delete', 'user:read'])).toBe(true)
      expect(authStore.hasAnyPermission(['user:delete', 'admin:read'])).toBe(false)
    })

    it('应该正确检查是否拥有所有权限', () => {
      authStore.$patch({
        permissions: ['user:read', 'user:write'],
      })

      expect(authStore.hasAllPermissions(['user:read', 'user:write'])).toBe(true)
      expect(authStore.hasAllPermissions(['user:read', 'user:delete'])).toBe(false)
    })
  })

  describe('认证状态初始化', () => {
    it('应该从TokenService恢复token状态', () => {
      tokenService.setToken({ 
        token: 'existing-token',
        refreshToken: 'existing-refresh-token',
      })

      authStore.initializeAuth()

      expect(authStore.token).toBe('existing-token')
      expect(authStore.refreshToken).toBe('existing-refresh-token')
      expect(authStore.isAuthenticated).toBe(true)
    })

    it('没有token时应该保持未认证状态', () => {
      authStore.initializeAuth()

      expect(authStore.token).toBeNull()
      expect(authStore.refreshToken).toBeNull()
      expect(authStore.isAuthenticated).toBe(false)
    })
  })

  describe('修改密码', () => {
    it('应该能成功修改密码', async () => {
      mockAuthService.changePassword.mockResolvedValue(undefined)

      await authStore.changePassword({
        password: 'old-password',
        newPassword: 'new-password',
      })

      expect(mockAuthService.changePassword).toHaveBeenCalledWith({
        password: 'old-password',
        newPassword: 'new-password',
      })
    })

    it('修改密码失败应该设置错误信息', async () => {
      const error = new Error('原密码错误')
      mockAuthService.changePassword.mockRejectedValue(error)

      await expect(authStore.changePassword({
        password: 'wrong-password',
        newPassword: 'new-password',
      })).rejects.toThrow(error)
      expect(authStore.error).toBe('原密码错误')
    })
  })

  describe('获取权限', () => {
    it('应该能获取用户权限', async () => {
      const permissions = ['user:read', 'user:write', 'admin:read']
      mockAuthService.getPermissions.mockResolvedValue(permissions)

      // 先设置token
      tokenService.setToken({ token: 'test-token' })
      authStore.$patch({ token: 'test-token' })

      await authStore.fetchPermissions()

      expect(authStore.permissions).toEqual(permissions)
      expect(localStorage.getItem('permissions')).toBe(JSON.stringify(permissions))
    })

    it('没有token时不应该获取权限', async () => {
      await authStore.fetchPermissions()

      expect(mockAuthService.getPermissions).not.toHaveBeenCalled()
    })

    it('获取权限失败应该设置错误信息', async () => {
      tokenService.setToken({ token: 'test-token' })
      authStore.$patch({ token: 'test-token' })

      const error = new Error('获取权限失败')
      mockAuthService.getPermissions.mockRejectedValue(error)

      await expect(authStore.fetchPermissions()).rejects.toThrow(error)
      expect(authStore.error).toBe('获取权限失败')
    })
  })

  describe('计算属性', () => {
    it('isLoggedIn应该正确计算登录状态', () => {
      authStore.$patch({
        isAuthenticated: false,
        token: null,
      })
      expect(authStore.isLoggedIn).toBe(false)

      authStore.$patch({
        isAuthenticated: true,
        token: 'test-token',
      })
      expect(authStore.isLoggedIn).toBe(true)

      authStore.$patch({
        isAuthenticated: true,
        token: null,
      })
      expect(authStore.isLoggedIn).toBe(false)
    })

    it('userDisplayName应该返回正确的显示名称', () => {
      authStore.$patch({
        user: { ...mockUser, account: 'testuser' },
      })
      expect(authStore.userDisplayName).toBe('testuser')

      authStore.$patch({
        user: null,
      })
      expect(authStore.userDisplayName).toBe('未知用户')
    })
  })
})