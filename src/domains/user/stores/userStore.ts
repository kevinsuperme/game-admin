// 用户域状态管理
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { 
  UserProfile, 
  UserPreferences, 
  UserState, 
  UpdateUserProfileData, 
  UpdateUserPreferencesData,
  UserActivity,
  UserStats
} from '../types';
import { UserServiceImpl } from '../services/userService';

// 创建用户服务实例
const userService = new UserServiceImpl();

export const useUserStore = defineStore('user', () => {
  // 状态
  const profile = ref<UserProfile | null>(null);
  const preferences = ref<UserPreferences | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const activities = ref<UserActivity[]>([]);
  const stats = ref<UserStats | null>(null);

  // 计算属性
  const isAuthenticated = computed(() => !!profile.value);
  const userDisplayName = computed(() => 
    profile.value?.nickname || profile.value?.username || '未知用户'
  );
  const userAvatar = computed(() => profile.value?.avatar || '');
  const userTheme = computed(() => preferences.value?.theme || 'light');
  const userLanguage = computed(() => preferences.value?.language || 'zh-CN');

  // 获取用户资料
  const fetchProfile = async () => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const result = await userService.getProfile();
      if (result.success && result.data) {
        profile.value = result.data;
      } else {
        error.value = result.error || '获取用户资料失败';
      }
    } catch (err) {
      error.value = '获取用户资料时发生错误';
      console.error('获取用户资料失败:', err);
    } finally {
      isLoading.value = false;
    }
  };

  // 更新用户资料
  const updateProfile = async (data: UpdateUserProfileData) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const result = await userService.updateProfile(data);
      if (result.success && result.data) {
        profile.value = result.data;
        return { success: true };
      } else {
        error.value = result.error || '更新用户资料失败';
        return { success: false, error: error.value };
      }
    } catch (err) {
      error.value = '更新用户资料时发生错误';
      console.error('更新用户资料失败:', err);
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  };

  // 获取用户偏好设置
  const fetchPreferences = async () => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const result = await userService.getPreferences();
      if (result.success && result.data) {
        preferences.value = result.data;
      } else {
        error.value = result.error || '获取用户偏好设置失败';
      }
    } catch (err) {
      error.value = '获取用户偏好设置时发生错误';
      console.error('获取用户偏好设置失败:', err);
    } finally {
      isLoading.value = false;
    }
  };

  // 更新用户偏好设置
  const updatePreferences = async (data: UpdateUserPreferencesData) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const result = await userService.updatePreferences(data);
      if (result.success && result.data) {
        preferences.value = { ...preferences.value, ...result.data };
        return { success: true };
      } else {
        error.value = result.error || '更新用户偏好设置失败';
        return { success: false, error: error.value };
      }
    } catch (err) {
      error.value = '更新用户偏好设置时发生错误';
      console.error('更新用户偏好设置失败:', err);
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  };

  // 上传头像
  const uploadAvatar = async (file: File) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const result = await userService.uploadAvatar(file);
      if (result.success && result.url) {
        if (profile.value) {
          profile.value.avatar = result.url;
        }
        return { success: true, url: result.url };
      } else {
        error.value = result.error || '上传头像失败';
        return { success: false, error: error.value };
      }
    } catch (err) {
      error.value = '上传头像时发生错误';
      console.error('上传头像失败:', err);
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  };

  // 获取用户活动记录
  const fetchActivities = async (limit: number = 10) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const result = await userService.getActivities(limit);
      if (result.success && result.data) {
        activities.value = result.data;
      } else {
        error.value = result.error || '获取用户活动记录失败';
      }
    } catch (err) {
      error.value = '获取用户活动记录时发生错误';
      console.error('获取用户活动记录失败:', err);
    } finally {
      isLoading.value = false;
    }
  };

  // 获取用户统计信息
  const fetchStats = async () => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const result = await userService.getStats();
      if (result.success && result.data) {
        stats.value = result.data;
      } else {
        error.value = result.error || '获取用户统计信息失败';
      }
    } catch (err) {
      error.value = '获取用户统计信息时发生错误';
      console.error('获取用户统计信息失败:', err);
    } finally {
      isLoading.value = false;
    }
  };

  // 删除账户
  const deleteAccount = async (password: string) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const result = await userService.deleteAccount(password);
      if (result.success) {
        // 清除所有用户数据
        profile.value = null;
        preferences.value = null;
        activities.value = [];
        stats.value = null;
        return { success: true };
      } else {
        error.value = result.error || '删除账户失败';
        return { success: false, error: error.value };
      }
    } catch (err) {
      error.value = '删除账户时发生错误';
      console.error('删除账户失败:', err);
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  };

  // 清除错误
  const clearError = () => {
    error.value = null;
  };

  // 重置状态
  const resetState = () => {
    profile.value = null;
    preferences.value = null;
    isLoading.value = false;
    error.value = null;
    activities.value = [];
    stats.value = null;
  };

  // 初始化用户数据
  const initializeUserData = async () => {
    await Promise.all([
      fetchProfile(),
      fetchPreferences(),
    ]);
  };

  return {
    // 状态
    profile,
    preferences,
    isLoading,
    error,
    activities,
    stats,
    
    // 计算属性
    isAuthenticated,
    userDisplayName,
    userAvatar,
    userTheme,
    userLanguage,
    
    // 方法
    fetchProfile,
    updateProfile,
    fetchPreferences,
    updatePreferences,
    uploadAvatar,
    fetchActivities,
    fetchStats,
    deleteAccount,
    clearError,
    resetState,
    initializeUserData,
  };
});

// 导出store实例，方便在其他地方直接使用
export const userStore = useUserStore();