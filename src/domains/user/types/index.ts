// 用户域类型定义
import type { User } from '@/domains/auth/types';

// 重新导出User类型
export type { User } from '@/domains/auth/types';

// 用户基本信息
export interface UserProfile extends User {
  avatar?: string;
  bio?: string;
  phone?: string;
  address?: string;
  birthday?: string;
  gender?: 'male' | 'female' | 'other';
  preferences?: UserPreferences;
  nickname?: string;
  realName?: string;
  username?: string;
}

// 用户偏好设置
export interface UserPreferences {
  language: string;
  theme: 'light' | 'dark' | 'auto';
  timezone: string;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
}

// 通知设置
export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  marketing: boolean;
  security: boolean;
}

// 隐私设置
export interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  showEmail: boolean;
  showPhone: boolean;
  allowFriendRequests: boolean;
  allowSearchByEmail: boolean;
  allowSearchByPhone: boolean;
}

// 用户更新数据
export interface UpdateUserProfileData {
  avatar?: string;
  bio?: string;
  phone?: string;
  address?: string;
  birthday?: string;
  gender?: 'male' | 'female' | 'other';
}

// 用户偏好更新数据
export interface UpdateUserPreferencesData {
  language?: string;
  theme?: 'light' | 'dark' | 'auto';
  timezone?: string;
  notifications?: Partial<NotificationSettings>;
  privacy?: Partial<PrivacySettings>;
}

// 用户状态
export interface UserState {
  profile: UserProfile | null;
  preferences: UserPreferences | null;
  isLoading: boolean;
  error: string | null;
}

// 用户活动
export interface UserActivity {
  id: string;
  type: 'login' | 'logout' | 'update_profile' | 'change_password' | 'update_preferences';
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
}

// 用户统计信息
export interface UserStats {
  loginCount: number;
  lastLoginAt: string;
  accountCreatedAt: string;
  profileUpdatedAt: string;
  passwordUpdatedAt: string;
}