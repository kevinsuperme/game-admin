// 认证域状态管理

import { defineStore } from 'pinia';
import { ref, computed, readonly } from 'vue';
import type { AuthState, User, LoginCredentials, PasswordChangeData } from '../types';
import { authService } from '../services';
import { tokenManager } from '@/utils/token-manager';

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const refreshToken = ref<string | null>(null);
  const permissions = ref<string[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // 计算属性
  const isAuthenticated = computed(() => !!token.value && !!user.value);
  const authState = computed<AuthState>(() => ({
    isAuthenticated: isAuthenticated.value,
    user: user.value,
    token: token.value,
    refreshToken: refreshToken.value,
    permissions: permissions.value,
    isLoading: isLoading.value,
    error: error.value,
  }));

  /**
   * 从TokenManager同步状态到Store
   */
  const syncStateFromTokenManager = () => {
    const state = tokenManager.getAuthState();
    user.value = state.user;
    token.value = state.token;
    refreshToken.value = state.refreshToken;
    permissions.value = state.user?.permissions || [];
  };

  /**
   * 初始化认证状态
   */
  const initAuth = async () => {
    try {
      // 从TokenManager获取当前认证状态
      syncStateFromTokenManager();
      
      // 如果有令牌,验证令牌是否有效
      if (token.value) {
        // 检查token是否过期
        if (tokenManager.isTokenExpired()) {
          // 如果过期且有refreshToken,尝试刷新
          if (refreshToken.value) {
            try {
              await refreshAuthToken();
              return;
            } catch (err) {
              // 刷新失败,登出
              await logout();
              return;
            }
          } else {
            // 没有refreshToken,直接登出
            await logout();
            return;
          }
        }
        
        // Token未过期,验证有效性
        const isValid = await authService.validateToken();
        if (!isValid) {
          await logout();
        } else {
          // 获取最新的用户信息和权限
          await fetchCurrentUser();
        }
      }
    } catch (err) {
      console.error('初始化认证状态失败:', err);
      await logout();
    }
  };

  /**
   * 用户登录
   * @param credentials 登录凭证
   * @returns 登录结果
   */
  const login = async (credentials: LoginCredentials) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const result = await authService.login(credentials);
      
      // AuthService已经通过TokenManager存储了数据
      // 只需要同步到Store即可
      syncStateFromTokenManager();
      
      return result;
    } catch (err: any) {
      error.value = err.message || '登录失败';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * 用户登出
   */
  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('登出失败:', err);
    } finally {
      // AuthService已经通过TokenManager清除了数据
      // 清除Store状态
      user.value = null;
      token.value = null;
      refreshToken.value = null;
      permissions.value = [];
      error.value = null;
    }
  };

  /**
   * 刷新令牌
   * @param customRefreshToken 自定义刷新令牌
   * @returns 刷新结果
   */
  const refreshAuthToken = async (customRefreshToken?: string) => {
    try {
      const result = await authService.refreshToken(customRefreshToken);
      
      // AuthService已经通过TokenManager更新了数据
      // 同步到Store
      syncStateFromTokenManager();
      
      return result;
    } catch (err: any) {
      error.value = err.message || '令牌刷新失败';
      // 刷新失败,清除认证状态
      await logout();
      throw err;
    }
  };

  /**
   * 获取当前用户信息
   */
  const fetchCurrentUser = async () => {
    if (!token.value) return;
    
    try {
      const currentUser = await authService.getCurrentUser();
      user.value = currentUser;
      permissions.value = currentUser.permissions || [];
      
      // 更新TokenManager中的用户信息
      tokenManager.setUser(currentUser);
    } catch (err: any) {
      console.error('获取用户信息失败:', err);
      error.value = err.message || '获取用户信息失败';
      
      // 如果是令牌错误,尝试刷新令牌
      if (err.code === 'TOKEN_EXPIRED' && refreshToken.value) {
        try {
          await refreshAuthToken();
        } catch (refreshErr) {
          // 刷新也失败,登出
          await logout();
        }
      }
    }
  };

  /**
   * 更新用户信息
   * @param data 用户信息
   */
  const updateProfile = async (data: Partial<User>) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const updatedUser = await authService.updateProfile(data);
      
      // AuthService已经通过TokenManager更新了用户信息
      // 同步到Store
      user.value = { ...user.value, ...updatedUser };
      
      return updatedUser;
    } catch (err: any) {
      error.value = err.message || '更新用户信息失败';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * 修改密码
   * @param data 密码修改数据
   */
  const changePassword = async (data: PasswordChangeData) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      await authService.changePassword(data);
    } catch (err: any) {
      error.value = err.message || '修改密码失败';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * 检查用户是否有指定权限
   * @param permission 权限标识
   * @returns 是否有权限
   */
  const hasPermission = (permission: string): boolean => {
    return permissions.value.includes(permission);
  };

  /**
   * 检查用户是否有任意一个指定权限
   * @param perms 权限列表
   * @returns 是否有任意权限
   */
  const hasAnyPermission = (perms: string[]): boolean => {
    return perms.some(perm => permissions.value.includes(perm));
  };

  /**
   * 检查用户是否有所有指定权限
   * @param perms 权限列表
   * @returns 是否有所有权限
   */
  const hasAllPermissions = (perms: string[]): boolean => {
    return perms.every(perm => permissions.value.includes(perm));
  };

  /**
   * 检查用户是否有指定角色
   * @param role 角色标识
   * @returns 是否有角色
   */
  const hasRole = (role: string): boolean => {
    return user.value?.roles?.includes(role) || false;
  };

  /**
   * 检查用户是否有任意一个指定角色
   * @param roles 角色列表
   * @returns 是否有任意角色
   */
  const hasAnyRole = (roles: string[]): boolean => {
    return roles.some(role => user.value?.roles?.includes(role));
  };

  /**
   * 检查用户是否有所有指定角色
   * @param roles 角色列表
   * @returns 是否有所有角色
   */
  const hasAllRoles = (roles: string[]): boolean => {
    return roles.every(role => user.value?.roles?.includes(role));
  };

  /**
   * 清除错误
   */
  const clearError = () => {
    error.value = null;
  };

  /**
   * 设置加载状态
   * @param loading 是否加载中
   */
  const setLoading = (loading: boolean) => {
    isLoading.value = loading;
  };

  return {
    // 状态
    user: readonly(user),
    token: readonly(token),
    refreshToken: readonly(refreshToken),
    permissions: readonly(permissions),
    isLoading: readonly(isLoading),
    error: readonly(error),
    
    // 计算属性
    isAuthenticated,
    authState,
    
    // 方法
    syncStateFromTokenManager, // 添加这个方法到导出列表
    initAuth,
    login,
    logout,
    refreshAuthToken,
    fetchCurrentUser,
    updateProfile,
    changePassword,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    clearError,
    setLoading,
  };
});