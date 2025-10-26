// 用户域入口文件
// 提供用户相关的类型、服务、状态管理和工具函数的统一导出

// 类型定义
export type {
  User,
  UserProfile,
  UserPreferences,
  NotificationSettings,
  PrivacySettings,
  UpdateUserProfileData,
  UpdateUserPreferencesData,
  UserState,
  UserActivity,
  UserStats,
} from './types';

// 服务层
export { userService, UserServiceImpl, userManagementService, UserManagementServiceImpl } from './services';

// 状态管理
export { useUserStore, useUserManagementStore } from './stores';

// 工具函数
export {
  getUserDisplayName,
  getUserAvatar,
  getUserGenderText,
  getUserStatusText,
  getUserStatusColor,
  getUserThemeText,
  getUserActivityTypeText,
  formatUserCreateTime,
  formatUserLastLoginTime,
  isUserOnline,
  getUserOnlineStatusText,
  getUserOnlineStatusColor,
  generateUserDefaultAvatar,
  validateUsername,
  validateEmail,
  validatePhone,
  validatePassword,
  generateRandomPassword,
  hasUserPermission,
  hasUserRole,
  isUserAdmin,
  filterUsers,
  sortUsers,
  formatUserRoles,
  formatUserPermissions,
  getUserAge,
  formatUserBirthday,
} from './utils';

// 常量
export const USER_DOMAIN_NAME = 'user';
export const USER_ROUTES = [
  { path: '/user/profile', name: 'UserProfile', component: 'UserProfile' },
  { path: '/user/preferences', name: 'UserPreferences', component: 'UserPreferences' },
  { path: '/user/activities', name: 'UserActivities', component: 'UserActivities' },
  { path: '/user/stats', name: 'UserStats', component: 'UserStats' },
] as const;

// 用户状态枚举
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  DELETED = 'deleted',
}

// 性别枚举
export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

// 主题枚举
export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  AUTO = 'auto',
}

// 活动类型枚举
export enum ActivityType {
  LOGIN = 'login',
  LOGOUT = 'logout',
  UPDATE_PROFILE = 'update_profile',
  CHANGE_PASSWORD = 'change_password',
  UPDATE_PREFERENCES = 'update_preferences',
}

// 默认配置
export const USER_CONFIG = {
  // 头像上传大小限制（MB）
  avatarMaxSize: 5,
  // 活动记录默认数量
  defaultActivityLimit: 10,
  // 用户偏好设置持久化键名
  preferencesPersistKey: 'super-admin-user-preferences',
  // 用户资料页面路径
  profilePath: '/user/profile',
  // 用户偏好设置页面路径
  preferencesPath: '/user/preferences',
} as const;