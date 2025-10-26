import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { tokenService } from '../TokenService'

describe('TokenService', () => {
  beforeEach(() => {
    tokenService.clearToken()
    sessionStorage.clear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('基础功能', () => {
    it('应该能存储和读取 access token', () => {
      const tokenData = {
        token: 'test-access-token',
        refreshToken: 'test-refresh-token',
      }

      tokenService.setToken(tokenData)

      expect(tokenService.getAccessToken()).toBe('test-access-token')
      expect(tokenService.getRefreshToken()).toBe('test-refresh-token')
    })

    it('应该能正确判断 token 有效性', () => {
      expect(tokenService.hasValidToken()).toBe(false)

      tokenService.setToken({
        token: 'test-token',
        expiresAt: Date.now() + 3600000,
      })

      expect(tokenService.hasValidToken()).toBe(true)
    })

    it('应该能清除 token', () => {
      tokenService.setToken({ token: 'test-token' })
      expect(tokenService.hasValidToken()).toBe(true)

      tokenService.clearToken()
      
      expect(tokenService.hasValidToken()).toBe(false)
      expect(tokenService.getAccessToken()).toBeNull()
    })
  })

  describe('过期处理', () => {
    it('应该自动清除已过期的 token', () => {
      tokenService.setToken({
        token: 'expired-token',
        expiresAt: Date.now() - 1000,
      })

      expect(tokenService.hasValidToken()).toBe(false)
      expect(tokenService.getAccessToken()).toBeNull()
    })

    it('应该能检测即将过期的 token', () => {
      tokenService.setToken({
        token: 'expiring-token',
        expiresAt: Date.now() + 4 * 60 * 1000,
      })

      expect(tokenService.isTokenExpiringSoon()).toBe(true)
    })
  })

  describe('SessionStorage 集成', () => {
    it('应该将 token 备份到 sessionStorage', () => {
      tokenService.setToken({
        token: 'test-token',
        refreshToken: 'test-refresh',
      })

      const stored = sessionStorage.getItem('auth_session')
      expect(stored).not.toBeNull()
      
      const parsed = JSON.parse(stored!)
      expect(parsed.token).toBe('test-token')
    })

    it('清除 token 时应该同时清除 sessionStorage', () => {
      tokenService.setToken({ token: 'test-token' })
      expect(sessionStorage.getItem('auth_session')).not.toBeNull()

      tokenService.clearToken()
      
      expect(sessionStorage.getItem('auth_session')).toBeNull()
    })
  })
})