import { computed, ref } from 'vue';
import { useAuthStore } from '../stores/authStore';
import type { LoginCredentials, PasswordChangeData } from '../types';
import { useRouter } from 'vue-router';

export function useAuth() {
  const authStore = useAuthStore();
  const router = useRouter();
  
  // 登录状态
  const isAuthenticated = computed(() => authStore.isLoggedIn);
  const isLoading = computed(() => authStore.isLoading);
  const error = computed(() => authStore.error);
  const user = computed(() => authStore.user);
  const permissions = computed(() => authStore.permissions);
  
  // 登录方法
  const login = async (credentials: LoginCredentials, redirectPath?: string) => {
    try {
      await authStore.login(credentials);
      
      // 登录成功后跳转
      if (redirectPath) {
        await router.push(redirectPath);
      } else {
        await router.push({ name: 'home' });
      }
      
      return { success: true };
    } catch (err: any) {
      return { 
        success: false, 
        error: err.message,
        code: err.code
      };
    }
  };
  
  // 登出方法
  const logout = async (redirect = true) => {
    try {
      await authStore.logout();
      
      if (redirect) {
        await router.push({ 
          name: 'login',
          query: { redirect: router.currentRoute.value.fullPath }
        });
      }
      
      return { success: true };
    } catch (err: any) {
      return { 
        success: false, 
        error: err.message 
      };
    }
  };
  
  // 检查权限
  const hasPermission = (permission: string) => {
    return authStore.hasPermission(permission);
  };
  
  const hasAnyPermission = (permissions: string[]) => {
    return authStore.hasAnyPermission(permissions);
  };
  
  const hasAllPermissions = (permissions: string[]) => {
    return authStore.hasAllPermissions(permissions);
  };
  
  // 修改密码
  const changePassword = async (data: PasswordChangeData) => {
    try {
      await authStore.changePassword(data);
      return { success: true };
    } catch (err: any) {
      return { 
        success: false, 
        error: err.message 
      };
    }
  };
  
  // 刷新令牌
  const refreshToken = async () => {
    try {
      await authStore.refreshAuthToken();
      return { success: true };
    } catch (err: any) {
      return { 
        success: false, 
        error: err.message 
      };
    }
  };
  
  // 清除错误
  const clearError = () => {
    authStore.clearError();
  };
  
  // 初始化认证状态
  const initializeAuth = () => {
    authStore.initializeAuth();
  };
  
  return {
    // 状态
    isAuthenticated,
    isLoading,
    error,
    user,
    permissions,
    
    // 方法
    login,
    logout,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    changePassword,
    refreshToken,
    clearError,
    initializeAuth,
  };
}

// 权限检查组合式函数
export function usePermissionCheck() {
  const authStore = useAuthStore();
  
  // 检查单个权限
  const checkPermission = (permission: string | string[]): boolean => {
    if (Array.isArray(permission)) {
      return authStore.hasAnyPermission(permission);
    }
    return authStore.hasPermission(permission);
  };
  
  // 检查所有权限
  const checkAllPermissions = (permissions: string[]): boolean => {
    return authStore.hasAllPermissions(permissions);
  };
  
  // 权限装饰器，用于组件中
  const withPermission = (permission: string | string[], callback: () => void) => {
    return () => {
      if (checkPermission(permission)) {
        callback();
      } else {
        console.warn('Permission denied:', permission);
      }
    };
  };
  
  return {
    checkPermission,
    checkAllPermissions,
    withPermission,
  };
}

// 认证状态监听组合式函数
export function useAuthListener() {
  const authStore = useAuthStore();
  const router = useRouter();

  // 监听认证状态变化
  const onAuthStateChanged = (callback: (isAuthenticated: boolean) => void) => {
    watch(
      () => authStore.isLoggedIn,
      (isAuth) => {
        callback(isAuth);
      },
      { immediate: true }
    );
  };
  
  // 处理认证过期
  const handleAuthExpiration = async () => {
    try {
      await authStore.refreshAuthToken();
    } catch (error) {
      // 刷新失败，跳转到登录页
      await authStore.logout();
      await router.push({ 
        name: 'login',
        query: { 
          reason: 'token_expired',
          redirect: router.currentRoute.value.fullPath 
        }
      });
    }
  };
  
  return {
    onAuthStateChanged,
    handleAuthExpiration,
  };
}