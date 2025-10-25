// 认证域入口文件
// 提供认证相关的类型、服务、状态管理和工具函数的统一导出

// 类型定义
export type {
  User,
  LoginCredentials,
  AuthResult,
  AuthState,
  PasswordChangeData,
  AuthError,
  AuthErrorCode,
} from './types';

// 服务层
export { authService, AuthServiceImpl } from './services';
export type { AuthService } from './services';

// 状态管理
export { useAuthStore } from './stores';

// 工具函数
export {
  getUserDisplayName,
  getUserAvatar,
  isAdmin,
  isSuperAdmin,
  generatePermissionTree,
  formatUserRoles,
  checkPasswordStrength,
  getPasswordStrengthTip,
  validateUsername,
  validatePassword,
} from './utils';

// 常量
export const AUTH_DOMAIN_NAME = 'auth';
export const AUTH_ROUTES = [
  { path: '/login', name: 'Login', component: 'LoginForm' },
  { path: '/logout', name: 'Logout', component: null },
] as const;

// 认证状态枚举
export enum AuthStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  AUTHENTICATED = 'authenticated',
  UNAUTHENTICATED = 'unauthenticated',
  ERROR = 'error',
}

// 权限级别枚举
export enum PermissionLevel {
  NONE = 0,
  READ = 1,
  WRITE = 2,
  ADMIN = 3,
  SUPER_ADMIN = 4,
}

// 默认配置
export const AUTH_CONFIG = {
  // 令牌刷新阈值（分钟）
  tokenRefreshThreshold: 5,
  // 权限检查间隔（毫秒）
  permissionCheckInterval: 60000,
  // 登录状态持久化键名
  persistKey: 'fantastic-admin-auth',
  // 默认重定向路径
  defaultRedirectPath: '/',
  // 登录页面路径
  loginPath: '/login',
  // 权限不足重定向路径
  forbiddenPath: '/403',
} as const;