// 认证域服务

import type { 
  LoginCredentials, 
  AuthResult, 
  AuthState, 
  PasswordChangeData,
  AuthService,
  AuthError
} from '../types';
import { httpClient } from '../../infrastructure/http';
import { tokenManager, type TokenData, type UserInfo } from '@/utils/token-manager';
import { HTTP_STATUS } from '../../shared/constants';

// 认证服务实现
export class AuthServiceImpl implements AuthService {
  /**
   * 用户登录
   * @param credentials 登录凭证
   * @returns 认证结果
   */
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      const response = await httpClient.post<AuthResult>('/auth/login', credentials);
      const { user, token, refreshToken, expiresIn } = response.data;
      
      // 使用TokenManager存储认证信息
      tokenManager.setToken({ 
        token, 
        refreshToken, 
        expiresIn 
      } as TokenData);
      
      tokenManager.setUser(user as UserInfo);
      
      return response.data;
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * 用户登出
   */
  async logout(): Promise<void> {
    try {
      // 通知服务器登出
      await httpClient.post('/auth/logout');
    } catch (error) {
      // 即使服务器登出失败，也要清除本地数据
      console.error('服务器登出失败:', error);
    } finally {
      // 使用TokenManager清除本地认证数据
      tokenManager.clearAll();
    }
  }

  /**
   * 刷新令牌
   * @param refreshToken 刷新令牌
   * @returns 认证结果
   */
  async refreshToken(refreshToken?: string): Promise<AuthResult> {
    try {
      const tokenToUse = refreshToken || tokenManager.getRefreshToken();
      
      if (!tokenToUse) {
        throw new Error('没有可用的刷新令牌');
      }
      
      const response = await httpClient.post<AuthResult>('/auth/refresh', {
        refreshToken: tokenToUse
      });
      
      const { user, token, refreshToken: newRefreshToken, expiresIn } = response.data;
      
      // 使用TokenManager更新存储的认证信息
      tokenManager.setToken({ 
        token, 
        refreshToken: newRefreshToken, 
        expiresIn 
      } as TokenData);
      
      tokenManager.setUser(user as UserInfo);
      
      return response.data;
    } catch (error: any) {
      // 刷新令牌失败，清除认证数据
      tokenManager.clearAll();
      throw this.handleAuthError(error);
    }
  }

  /**
   * 获取用户权限
   * @returns 权限列表
   */
  async getPermissions(): Promise<string[]> {
    try {
      const response = await httpClient.get<string[]>('/auth/permissions');
      return response.data;
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * 修改密码
   * @param data 密码修改数据
   */
  async changePassword(data: PasswordChangeData): Promise<void> {
    try {
      await httpClient.post('/auth/change-password', data);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * 获取当前用户信息
   * @returns 用户信息
   */
  async getCurrentUser(): Promise<any> {
    try {
      const response = await httpClient.get('/auth/me');
      return response.data;
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * 更新用户信息
   * @param data 用户信息
   * @returns 更新后的用户信息
   */
  async updateProfile(data: Partial<any>): Promise<any> {
    try {
      const response = await httpClient.put('/auth/profile', data);
      
      // 使用TokenManager更新本地存储的用户信息
      const currentUser = tokenManager.getUser();
      if (currentUser) {
        const updatedUser = { ...currentUser, ...response.data };
        tokenManager.setUser(updatedUser);
      }
      
      return response.data;
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * 注册新用户
   * @param data 注册数据
   * @returns 注册结果
   */
  async register(data: any): Promise<AuthResult> {
    try {
      const response = await httpClient.post<AuthResult>('/auth/register', data);
      const { user, token, refreshToken, expiresIn } = response.data;
      
      // 使用TokenManager存储认证信息
      tokenManager.setToken({ 
        token, 
        refreshToken, 
        expiresIn 
      } as TokenData);
      
      tokenManager.setUser(user as UserInfo);
      
      return response.data;
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * 忘记密码
   * @param email 邮箱
   */
  async forgotPassword(email: string): Promise<void> {
    try {
      await httpClient.post('/auth/forgot-password', { email });
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * 重置密码
   * @param data 重置密码数据
   */
  async resetPassword(data: any): Promise<void> {
    try {
      await httpClient.post('/auth/reset-password', data);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * 验证令牌是否有效
   * @returns 是否有效
   */
  async validateToken(): Promise<boolean> {
    try {
      // 先检查本地token是否过期
      if (tokenManager.isTokenExpired()) {
        return false;
      }
      
      // 再向服务器验证
      await httpClient.get('/auth/validate');
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 获取当前认证状态
   * @returns 认证状态
   */
  getAuthState(): AuthState {
    const authState = tokenManager.getAuthState();
    
    return {
      isAuthenticated: authState.isAuthenticated,
      user: authState.user,
      token: authState.token,
      refreshToken: authState.refreshToken,
      permissions: authState.user?.permissions || [],
      isLoading: false,
      error: null,
    };
  }

  /**
   * 获取存储的令牌
   * @returns 令牌
   */
  getToken(): string | null {
    return tokenManager.getToken();
  }

  /**
   * 获取存储的刷新令牌
   * @returns 刷新令牌
   */
  getRefreshToken(): string | null {
    return tokenManager.getRefreshToken();
  }

  /**
   * 获取存储的用户信息
   * @returns 用户信息
   */
  getUser(): any | null {
    return tokenManager.getUser();
  }

  /**
   * 处理认证错误
   * @param error 错误对象
   * @returns 认证错误
   */
  private handleAuthError(error: any): AuthError {
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case HTTP_STATUS.UNAUTHORIZED:
          if (data.code === 'TOKEN_EXPIRED') {
            return {
              code: 'TOKEN_EXPIRED',
              message: '登录已过期，请重新登录',
              details: data,
            };
          } else if (data.code === 'TOKEN_INVALID') {
            return {
              code: 'TOKEN_INVALID',
              message: '无效的登录凭证',
              details: data,
            };
          } else {
            return {
              code: 'INVALID_CREDENTIALS',
              message: data.message || '用户名或密码错误',
              details: data,
            };
          }
        
        case HTTP_STATUS.FORBIDDEN:
          return {
            code: 'PERMISSION_DENIED',
            message: data.message || '没有权限访问',
            details: data,
          };
        
        default:
          return {
            code: 'UNKNOWN_ERROR',
            message: data.message || '认证失败',
            details: data,
          };
      }
    } else if (error.request) {
      return {
        code: 'NETWORK_ERROR',
        message: '网络连接失败，请检查网络设置',
        details: error,
      };
    } else {
      return {
        code: 'UNKNOWN_ERROR',
        message: error.message || '未知错误',
        details: error,
      };
    }
  }
}

// 创建认证服务实例
export const authService = new AuthServiceImpl();