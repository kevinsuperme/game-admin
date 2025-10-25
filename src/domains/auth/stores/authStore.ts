import { defineStore } from 'pinia';
import type { AuthState, User, LoginCredentials, PasswordChangeData } from '../types';
import { authService } from '../services/authService';
import type { AuthErrorCode } from '../types';

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    isAuthenticated: false,
    user: null,
    token: localStorage.getItem('token') || null,
    refreshToken: localStorage.getItem('refreshToken') || null,
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
        
        // 持久化存储
        localStorage.setItem('token', result.token);
        if (result.refreshToken) {
          localStorage.setItem('refreshToken', result.refreshToken);
        }
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
        
        // 更新持久化存储
        localStorage.setItem('token', result.token);
        if (result.refreshToken) {
          localStorage.setItem('refreshToken', result.refreshToken);
        }
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
      
      // 清除持久化存储
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('permissions');
    },

    initializeAuth(): void {
      if (this.token) {
        this.isAuthenticated = true;
        // 这里可以添加令牌验证逻辑
      }
    },

    setError(error: { code: AuthErrorCode; message: string }): void {
      this.error = error.message;
    },

    clearError(): void {
      this.error = null;
    },
  },
});