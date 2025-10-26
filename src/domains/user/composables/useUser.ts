// 用户域组合式函数
import { computed } from 'vue';
import { useUserStore } from '../stores/userStore';
import type { 
  UserProfile, 
  UpdateUserProfileData, 
  UpdateUserPreferencesData,
  UserActivity,
  UserStats
} from '../types';

// 用户资料管理组合式函数
export function useUserProfile() {
  const userStore = useUserStore();
  
  // 计算属性
  const profile = computed(() => userStore.profile);
  const isLoading = computed(() => userStore.isLoading);
  const error = computed(() => userStore.error);
  const isAuthenticated = computed(() => userStore.isAuthenticated);
  const userDisplayName = computed(() => userStore.userDisplayName);
  const userAvatar = computed(() => userStore.userAvatar);
  
  // 方法
  const fetchProfile = () => userStore.fetchProfile();
  const updateProfile = (data: UpdateUserProfileData) => userStore.updateProfile(data);
  const uploadAvatar = (file: File) => userStore.uploadAvatar(file);
  const clearError = () => userStore.clearError();
  
  return {
    // 状态
    profile,
    isLoading,
    error,
    isAuthenticated,
    userDisplayName,
    userAvatar,
    
    // 方法
    fetchProfile,
    updateProfile,
    uploadAvatar,
    clearError,
  };
}

// 用户偏好设置组合式函数
export function useUserPreferences() {
  const userStore = useUserStore();
  
  // 计算属性
  const preferences = computed(() => userStore.preferences);
  const isLoading = computed(() => userStore.isLoading);
  const error = computed(() => userStore.error);
  const userTheme = computed(() => userStore.userTheme);
  const userLanguage = computed(() => userStore.userLanguage);
  
  // 方法
  const fetchPreferences = () => userStore.fetchPreferences();
  const updatePreferences = (data: UpdateUserPreferencesData) => userStore.updatePreferences(data);
  const clearError = () => userStore.clearError();
  
  // 便捷方法
  const updateTheme = (theme: 'light' | 'dark' | 'auto') => {
    return updatePreferences({ theme });
  };
  
  const updateLanguage = (language: string) => {
    return updatePreferences({ language });
  };
  
  const updateNotificationSettings = (settings: any) => {
    return updatePreferences({ notifications: settings });
  };
  
  const updatePrivacySettings = (settings: any) => {
    return updatePreferences({ privacy: settings });
  };
  
  return {
    // 状态
    preferences,
    isLoading,
    error,
    userTheme,
    userLanguage,
    
    // 方法
    fetchPreferences,
    updatePreferences,
    updateTheme,
    updateLanguage,
    updateNotificationSettings,
    updatePrivacySettings,
    clearError,
  };
}

// 用户活动记录组合式函数
export function useUserActivities() {
  const userStore = useUserStore();
  
  // 计算属性
  const activities = computed(() => userStore.activities);
  const isLoading = computed(() => userStore.isLoading);
  const error = computed(() => userStore.error);
  
  // 方法
  const fetchActivities = (limit?: number) => userStore.fetchActivities(limit);
  const clearError = () => userStore.clearError();
  
  // 过滤活动
  const getActivitiesByType = (type: string) => {
    return computed(() => 
      activities.value.filter(activity => activity.type === type)
    );
  };
  
  // 获取最近活动
  const getRecentActivities = (count: number = 5) => {
    return computed(() => 
      activities.value.slice(0, count)
    );
  };
  
  return {
    // 状态
    activities,
    isLoading,
    error,
    
    // 方法
    fetchActivities,
    getActivitiesByType,
    getRecentActivities,
    clearError,
  };
}

// 用户统计信息组合式函数
export function useUserStats() {
  const userStore = useUserStore();
  
  // 计算属性
  const stats = computed(() => userStore.stats);
  const isLoading = computed(() => userStore.isLoading);
  const error = computed(() => userStore.error);
  
  // 方法
  const fetchStats = () => userStore.fetchStats();
  const clearError = () => userStore.clearError();
  
  // 格式化统计信息
  const formattedStats = computed(() => {
    if (!stats.value) return null;
    
    return {
      loginCount: stats.value.loginCount,
      lastLoginAt: new Date(stats.value.lastLoginAt).toLocaleString(),
      accountCreatedAt: new Date(stats.value.accountCreatedAt).toLocaleDateString(),
      profileUpdatedAt: new Date(stats.value.profileUpdatedAt).toLocaleDateString(),
      passwordUpdatedAt: new Date(stats.value.passwordUpdatedAt).toLocaleDateString(),
    };
  });
  
  return {
    // 状态
    stats,
    formattedStats,
    isLoading,
    error,
    
    // 方法
    fetchStats,
    clearError,
  };
}

// 用户账户管理组合式函数
export function useUserAccount() {
  const userStore = useUserStore();
  
  // 计算属性
  const isLoading = computed(() => userStore.isLoading);
  const error = computed(() => userStore.error);
  
  // 方法
  const deleteAccount = (password: string) => userStore.deleteAccount(password);
  const clearError = () => userStore.clearError();
  
  return {
    // 状态
    isLoading,
    error,
    
    // 方法
    deleteAccount,
    clearError,
  };
}

// 综合用户管理组合式函数
export function useUser() {
  const userStore = useUserStore();
  const userProfile = useUserProfile();
  const userPreferences = useUserPreferences();
  const userActivities = useUserActivities();
  const userStats = useUserStats();
  const userAccount = useUserAccount();
  
  // 初始化用户数据
  const initializeUserData = async () => {
    await Promise.all([
      userProfile.fetchProfile(),
      userPreferences.fetchPreferences(),
    ]);
  };
  
  // 重置用户状态
  const resetUserState = () => {
    userStore.resetState();
  };
  
  return {
    // 子组合式函数
    profile: userProfile,
    preferences: userPreferences,
    activities: userActivities,
    stats: userStats,
    account: userAccount,
    
    // 综合方法
    initializeUserData,
    resetUserState,
  };
}