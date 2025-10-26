import { defineStore } from 'pinia';
import type { AuthState, User, LoginCredentials, PasswordChangeData } from '../types';
import { authService } from '../services/authService';
import type { AuthErrorCode } from '../types';
import { tokenService } from '@/domains/shared/services/TokenService';

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    isAuthenticated: false,
    user: null,
    token: tokenService.getAccessToken(),
    refreshToken: tokenService.getRefreshToken(),
    permissions: JSON.parse(localStorage.getItem('permissions') || '[]'),
    isLoading: false,
    error: null,
  }),

  getters: {
    isLoggedIn: (state) => state.isAuthenticated && !!state.token,
    hasPermission: (state) => (permission: string) => {
      return state.permissions.includes(permission);
    },
    hasAnyPermission: (state) => (permissions: string[]) => {
      return permissions.some(permission => state.permissions.includes(permission));
    },
    hasAllPermissions: (state) => (permissions: string[]) => {
      return permissions.every(permission => state.permissions.includes(permission));
    },
    userDisplayName: (state) => {
      return state.user?.account || '未知用户';
    },
  },

  actions: {
    async login(credentials: LoginCredentials): Promise<void> {
      this.isLoading = true;
      this.error = null;
      
      try {
        const result = await authService.login(credentials);
        
        this.isAuthenticated = true;
        this.user = result.user;
        this.token = result.token;
        this.refreshToken = result.refreshToken || null;
        this.permissions = result.user.permissions;
        
        // 使用TokenService管理Token
        tokenService.setToken({
          token: result.token,
          refreshToken: result.refreshToken,
          expiresAt: result.expiresAt ? new Date(result.expiresAt).getTime() : undefined,
        });
        
        // 持久化权限
        localStorage.setItem('permissions', JSON.stringify(result.user.permissions));
      } catch (error: any) {
        this.error = error.message;
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async logout(): Promise<void> {
      this.isLoading = true;
      
      try {
        if (this.token) {
          await authService.logout();
        }
      } catch (error) {
        console.warn('Logout API call failed:', error);
      } finally {
        this.clearAuthState();
        this.isLoading = false;
      }
    },

    async refreshAuthToken(): Promise<void> {
      if (!this.refreshToken) {
        throw new Error('No refresh token available');
      }
      
      this.isLoading = true;
      
      try {
        const result = await authService.refreshToken(this.refreshToken);
        
        this.token = result.token;
        this.refreshToken = result.refreshToken || null;
        this.permissions = result.user.permissions;
        
        // 使用TokenService更新Token
        tokenService.setToken({
          token: result.token,
          refreshToken: result.refreshToken,
          expiresAt: result.expiresAt ? new Date(result.expiresAt).getTime() : undefined,
        });
        
        // 更新持久化权限
        localStorage.setItem('permissions', JSON.stringify(result.user.permissions));
      } catch (error: any) {
        // 刷新令牌失败，清除认证状态
        this.clearAuthState();
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchPermissions(): Promise<void> {
      if (!this.token) {
        return;
      }
      
      try {
        const permissions = await authService.getPermissions();
        this.permissions = permissions;
        localStorage.setItem('permissions', JSON.stringify(permissions));
      } catch (error: any) {
        this.error = error.message;
        throw error;
      }
    },

    async changePassword(data: PasswordChangeData): Promise<void> {
      this.isLoading = true;
      this.error = null;
      
      try {
        await authService.changePassword(data);
      } catch (error: any) {
        this.error = error.message;
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    clearAuthState(): void {
      this.isAuthenticated = false;
      this.user = null;
      this.token = null;
      this.refreshToken = null;
      this.permissions = [];
      this.error = null;
      
      // 使用TokenService清除Token
      tokenService.clearToken();
      
      // 清除持久化权限
      localStorage.removeItem('permissions');
    },

    initializeAuth(): void {
      // 从TokenService恢复Token状态
      const token = tokenService.getAccessToken();
      if (token) {
        this.token = token;
        this.refreshToken = tokenService.getRefreshToken();
        this.isAuthenticated = true;
        
        // 监听Token刷新事件
        this.setupTokenRefreshListener();
      }
    },
    
    setupTokenRefreshListener(): void {
      // 监听TokenService发出的刷新事件
      window.addEventListener('token:refresh-needed', async () => {
        try {
          await this.refreshAuthToken();
        } catch (error) {
          console.error('[AuthStore] Auto token refresh failed:', error);
          // 刷新失败,清除认证状态
          this.clearAuthState();
        }
      });
    },

    setError(error: { code: AuthErrorCode; message: string }): void {
      this.error = error.message;
    },

    clearError(): void {
      this.error = null;
    },
  },
});