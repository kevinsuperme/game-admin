import type { AuthService, AuthResult, LoginCredentials, PasswordChangeData } from '../types';
import { api } from '@/api';
import type { AuthErrorCode } from '../types';

class AuthServiceImpl implements AuthService {
  private baseURL = '/mock/';

  async login(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      const response = await api.post('user/login', credentials, {
        baseURL: this.baseURL,
      });
      
      return {
        user: {
          id: response.data.id || '1',
          account: response.data.account,
          avatar: response.data.avatar,
          permissions: response.data.permissions || [],
          roles: response.data.roles || [],
        },
        token: response.data.token,
        refreshToken: response.data.refreshToken,
        expiresIn: response.data.expiresIn,
      };
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async logout(): Promise<void> {
    try {
      await api.post('user/logout', {}, {
        baseURL: this.baseURL,
      });
    } catch (error: any) {
      // 即使请求失败，也清除本地状态
      console.warn('Logout API call failed:', error);
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthResult> {
    try {
      const response = await api.post('user/refresh-token', { refreshToken }, {
        baseURL: this.baseURL,
      });
      
      return {
        user: {
          id: response.data.id || '1',
          account: response.data.account,
          avatar: response.data.avatar,
          permissions: response.data.permissions || [],
          roles: response.data.roles || [],
        },
        token: response.data.token,
        refreshToken: response.data.refreshToken,
        expiresIn: response.data.expiresIn,
      };
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getPermissions(): Promise<string[]> {
    try {
      const response = await api.get('user/permission', {
        baseURL: this.baseURL,
      });
      
      return response.data.permissions || [];
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async changePassword(data: PasswordChangeData): Promise<void> {
    try {
      await api.post('user/password/edit', data, {
        baseURL: this.baseURL,
      });
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): { code: AuthErrorCode; message: string } {
    // 根据错误类型和状态码映射到业务错误码
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      switch (status) {
        case 401:
          return { code: 'INVALID_CREDENTIALS', message: data?.message || '用户名或密码错误' };
        case 403:
          return { code: 'PERMISSION_DENIED', message: data?.message || '权限不足' };
        default:
          return { code: 'UNKNOWN_ERROR', message: data?.message || '未知错误' };
      }
    } else if (error.request) {
      return { code: 'NETWORK_ERROR', message: '网络连接失败，请检查网络设置' };
    } else {
      return { code: 'UNKNOWN_ERROR', message: error.message || '未知错误' };
    }
  }
}

export const authService = new AuthServiceImpl();