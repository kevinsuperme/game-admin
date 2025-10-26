/**
 * HTTP拦截器测试
 * 测试请求/响应拦截器、token自动添加和刷新机制
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { http } from '@/utils/http';
import { tokenManager } from '@/utils/token-manager';

// Mock fetch API
global.fetch = vi.fn();

// Mock tokenManager
vi.mock('@/utils/token-manager', () => ({
  tokenManager: {
    getToken: vi.fn(),
    getRefreshToken: vi.fn(),
    setToken: vi.fn(),
    isTokenExpired: vi.fn(),
    getAuthState: vi.fn()
  }
}));

// Mock AuthStore
vi.mock('@/domains/auth/stores', () => ({
  useAuthStore: vi.fn(() => ({
    syncStateFromTokenManager: vi.fn(),
    logout: vi.fn()
  }))
}));

describe('HTTP拦截器测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockReset();
  });

  describe('请求拦截器 - 自动添加Token', () => {
    it('应该在请求头中自动添加token', async () => {
      const mockToken = 'test-token-123';
      vi.mocked(tokenManager.getToken).mockReturnValue(mockToken);

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          code: 200,
          message: 'Success',
          data: { result: 'ok' }
        })
      });

      await http.get('/test');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`
          })
        })
      );
    });

    it('当skipAuth为true时,不应该添加token', async () => {
      const mockToken = 'test-token-123';
      vi.mocked(tokenManager.getToken).mockReturnValue(mockToken);

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          code: 200,
          message: 'Success',
          data: { result: 'ok' }
        })
      });

      await http.get('/test', { skipAuth: true });

      const callArgs = (global.fetch as any).mock.calls[0];
      const headers = callArgs[1].headers;
      expect(headers.Authorization).toBeUndefined();
    });

    it('当token不存在时,不应该添加Authorization头', async () => {
      vi.mocked(tokenManager.getToken).mockReturnValue(null);

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          code: 200,
          message: 'Success',
          data: { result: 'ok' }
        })
      });

      await http.get('/test');

      const callArgs = (global.fetch as any).mock.calls[0];
      const headers = callArgs[1].headers;
      expect(headers.Authorization).toBeUndefined();
    });
  });

  describe('响应拦截器 - 401错误处理', () => {
    it('当收到401错误时,应该尝试刷新token', async () => {
      const oldToken = 'old-token';
      const newToken = 'new-token';
      const refreshToken = 'refresh-token';

      vi.mocked(tokenManager.getToken)
        .mockReturnValueOnce(oldToken)  // 第一次请求
        .mockReturnValueOnce(newToken); // 重试时
      
      vi.mocked(tokenManager.getRefreshToken).mockReturnValue(refreshToken);

      // 第一次请求返回401
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({
          code: 401,
          message: 'Unauthorized'
        })
      });

      // 刷新token的请求
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          code: 200,
          data: {
            token: newToken,
            refreshToken: refreshToken,
            expiresIn: 3600
          }
        })
      });

      // 重试的请求
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          code: 200,
          message: 'Success',
          data: { result: 'ok' }
        })
      });

      const result = await http.get('/test');

      // 验证刷新token被调用
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/refresh'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ refreshToken })
        })
      );

      // 验证tokenManager.setToken被调用
      expect(tokenManager.setToken).toHaveBeenCalledWith({
        token: newToken,
        refreshToken: refreshToken,
        expiresIn: 3600
      });

      // 验证请求被重试
      expect(global.fetch).toHaveBeenCalledTimes(3); // 原始请求 + 刷新 + 重试
      expect(result.code).toBe(200);
    });

    it('当token刷新失败时,应该清除认证信息并跳转登录页', async () => {
      const oldToken = 'old-token';
      const refreshToken = 'refresh-token';

      vi.mocked(tokenManager.getToken).mockReturnValue(oldToken);
      vi.mocked(tokenManager.getRefreshToken).mockReturnValue(refreshToken);

      // 模拟window.location
      delete (window as any).location;
      (window as any).location = { href: '', pathname: '/dashboard' };

      // 第一次请求返回401
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({
          code: 401,
          message: 'Unauthorized'
        })
      });

      // 刷新token失败
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({
          code: 401,
          message: 'Invalid refresh token'
        })
      });

      await expect(http.get('/test')).rejects.toThrow();

      // 验证跳转到登录页
      expect(window.location.href).toBe('/login');
    });
  });

  describe('响应拦截器 - 403错误处理', () => {
    it('当收到403错误时,应该记录警告但不刷新token', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      vi.mocked(tokenManager.getToken).mockReturnValue('test-token');

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({
          code: 403,
          message: 'Forbidden'
        })
      });

      await expect(http.get('/test')).rejects.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('权限不足'),
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Token刷新防抖', () => {
    it('多个并发请求遇到401时,应该只刷新一次token', async () => {
      const oldToken = 'old-token';
      const newToken = 'new-token';
      const refreshToken = 'refresh-token';

      vi.mocked(tokenManager.getToken)
        .mockReturnValue(oldToken);
      
      vi.mocked(tokenManager.getRefreshToken).mockReturnValue(refreshToken);

      // 所有初始请求都返回401
      (global.fetch as any)
        .mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({}) })
        .mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({}) })
        .mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({}) });

      // 刷新token请求(应该只调用一次)
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          code: 200,
          data: { token: newToken, refreshToken, expiresIn: 3600 }
        })
      });

      // 重试请求都成功
      (global.fetch as any)
        .mockResolvedValue({
          ok: true,
          json: async () => ({ code: 200, data: { result: 'ok' } })
        });

      // 同时发起3个请求
      await Promise.all([
        http.get('/test1'),
        http.get('/test2'),
        http.get('/test3')
      ]);

      // 验证刷新token只被调用一次
      const refreshCalls = (global.fetch as any).mock.calls.filter(
        (call: any[]) => call[0].includes('/auth/refresh')
      );
      expect(refreshCalls).toHaveLength(1);
    });
  });

  describe('自定义拦截器', () => {
    it('应该支持添加自定义请求拦截器', async () => {
      const customHeader = 'X-Custom-Header';
      const customValue = 'custom-value';

      http.addRequestInterceptor({
        onFulfilled: (config) => {
          config.headers = {
            ...config.headers,
            [customHeader]: customValue
          };
          return config;
        }
      });

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ code: 200, data: {} })
      });

      await http.get('/test');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            [customHeader]: customValue
          })
        })
      );
    });

    it('应该支持添加自定义响应拦截器', async () => {
      const mockHandler = vi.fn((response) => response);

      http.addResponseInterceptor({
        onFulfilled: mockHandler
      });

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ code: 200, data: {} })
      });

      await http.get('/test');

      expect(mockHandler).toHaveBeenCalled();
    });
  });

  describe('请求重试避免循环', () => {
    it('重试请求时应该设置skipRefresh标志,避免无限重试', async () => {
      const oldToken = 'old-token';
      const newToken = 'new-token';
      const refreshToken = 'refresh-token';

      vi.mocked(tokenManager.getToken)
        .mockReturnValueOnce(oldToken)
        .mockReturnValueOnce(newToken);
      
      vi.mocked(tokenManager.getRefreshToken).mockReturnValue(refreshToken);

      // 原始请求401
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401
      });

      // 刷新token成功
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          code: 200,
          data: { token: newToken, refreshToken, expiresIn: 3600 }
        })
      });

      // 重试也返回401(但不应该再次刷新)
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401
      });

      await expect(http.get('/test')).rejects.toThrow();

      // 验证刷新只被调用一次
      const refreshCalls = (global.fetch as any).mock.calls.filter(
        (call: any[]) => call[0].includes('/auth/refresh')
      );
      expect(refreshCalls).toHaveLength(1);
    });
  });
});