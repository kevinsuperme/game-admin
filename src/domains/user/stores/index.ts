// 用户域状态管理
import { defineStore } from 'pinia';
import type {
  User,
  UserProfile,
  UserPreferences,
  UpdateUserProfileData,
  UpdateUserPreferencesData,
  UserActivity,
  UserStats,
  UserState
} from '../types';
import { userService, userManagementService } from '../services';

// 用户状态管理
export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    profile: null,
    preferences: null,
    isLoading: false,
    error: null
  }),

  getters: {
    // 是否已登录
    isLoggedIn: (state) => !!state.profile,
    
    // 用户显示名称
    displayName: (state) => {
      if (!state.profile) return '';
      return state.profile.nickname || state.profile.username || state.profile.email || '';
    },
    
    // 用户头像
    avatar: (state) => {
      return state.profile?.avatar || '';
    },
    
    // 用户角色
    roles: (state) => {
      return state.profile?.roles || [];
    },
    
    // 用户权限
    permissions: (state) => {
      return state.profile?.permissions || [];
    },
    
    // 是否有指定权限
    hasPermission: (state) => (permission: string) => {
      return state.profile?.permissions?.includes(permission) || false;
    },
    
    // 是否有指定角色
    hasRole: (state) => (role: string) => {
      return state.profile?.roles?.includes(role) || false;
    },
    
    // 是否是管理员
    isAdmin: (state) => {
      return state.profile?.roles?.includes('admin') || false;
    }
  },

  actions: {
    // 设置加载状态
    setLoading(loading: boolean) {
      this.isLoading = loading;
    },
    
    // 设置错误信息
    setError(error: string | null) {
      this.error = error;
    },
    
    // 获取用户资料
    async fetchUserProfile() {
      this.setLoading(true);
      this.setError(null);
      
      try {
        const { data } = await userService.getUserProfile();
        this.profile = data;
      } catch (error) {
        this.setError(error instanceof Error ? error.message : '获取用户资料失败');
        throw error;
      } finally {
        this.setLoading(false);
      }
    },
    
    // 更新用户资料
    async updateUserProfile(data: UpdateUserProfileData) {
      this.setLoading(true);
      this.setError(null);
      
      try {
        const { data: profile } = await userService.updateUserProfile(data);
        this.profile = profile;
        return profile;
      } catch (error) {
        this.setError(error instanceof Error ? error.message : '更新用户资料失败');
        throw error;
      } finally {
        this.setLoading(false);
      }
    },
    
    // 获取用户偏好设置
    async fetchUserPreferences() {
      this.setLoading(true);
      this.setError(null);
      
      try {
        const { data } = await userService.getUserPreferences();
        this.preferences = data;
      } catch (error) {
        this.setError(error instanceof Error ? error.message : '获取用户偏好设置失败');
        throw error;
      } finally {
        this.setLoading(false);
      }
    },
    
    // 更新用户偏好设置
    async updateUserPreferences(data: UpdateUserPreferencesData) {
      this.setLoading(true);
      this.setError(null);
      
      try {
        const { data: preferences } = await userService.updateUserPreferences(data);
        this.preferences = preferences;
        return preferences;
      } catch (error) {
        this.setError(error instanceof Error ? error.message : '更新用户偏好设置失败');
        throw error;
      } finally {
        this.setLoading(false);
      }
    },
    
    // 上传头像
    async uploadAvatar(file: File) {
      this.setLoading(true);
      this.setError(null);
      
      try {
        const { data } = await userService.uploadAvatar(file);
        if (this.profile) {
          this.profile.avatar = data.url;
        }
        return data.url;
      } catch (error) {
        this.setError(error instanceof Error ? error.message : '上传头像失败');
        throw error;
      } finally {
        this.setLoading(false);
      }
    },
    
    // 重置状态
    resetState() {
      this.profile = null;
      this.preferences = null;
      this.isLoading = false;
      this.error = null;
    }
  }
});

// 用户管理状态管理
export const useUserManagementStore = defineStore('userManagement', {
  state: () => ({
    users: [] as User[],
    currentUser: null as User | null,
    loading: false,
    error: null as string | null,
    total: 0,
    page: 1,
    pageSize: 10,
    activities: [] as UserActivity[],
    stats: null as UserStats | null
  }),

  getters: {
    // 获取用户选项列表
    userOptions: (state) => {
      return state.users.map(user => ({
        label: user.nickname || user.username || user.email,
        value: user.id
      }));
    },
    
    // 获取当前用户索引
    currentUserIndex: (state) => {
      if (!state.currentUser) return -1;
      return state.users.findIndex(user => user.id === state.currentUser?.id);
    }
  },

  actions: {
    // 设置加载状态
    setLoading(loading: boolean) {
      this.loading = loading;
    },
    
    // 设置错误信息
    setError(error: string | null) {
      this.error = error;
    },
    
    // 获取用户列表
    async fetchUsers(params?: {
      page?: number;
      pageSize?: number;
      keyword?: string;
      status?: string;
      role?: string;
      department?: string;
    }) {
      this.setLoading(true);
      this.setError(null);
      
      try {
        const { data } = await userManagementService.getUsers({
          page: params?.page || this.page,
          pageSize: params?.pageSize || this.pageSize,
          ...params
        });
        
        this.users = data.items;
        this.total = data.total;
        this.page = params?.page || this.page;
        this.pageSize = params?.pageSize || this.pageSize;
      } catch (error) {
        this.setError(error instanceof Error ? error.message : '获取用户列表失败');
        throw error;
      } finally {
        this.setLoading(false);
      }
    },
    
    // 获取用户详情
    async fetchUserById(id: string) {
      this.setLoading(true);
      this.setError(null);
      
      try {
        const { data } = await userManagementService.getUserById(id);
        this.currentUser = data;
        return data;
      } catch (error) {
        this.setError(error instanceof Error ? error.message : '获取用户详情失败');
        throw error;
      } finally {
        this.setLoading(false);
      }
    },
    
    // 创建用户
    async createUser(data: {
      username: string;
      email: string;
      password: string;
      name?: string;
      phone?: string;
      department?: string;
      role?: string;
    }) {
      this.setLoading(true);
      this.setError(null);
      
      try {
        const { data: user } = await userManagementService.createUser(data);
        this.users.unshift(user);
        this.total += 1;
        return user;
      } catch (error) {
        this.setError(error instanceof Error ? error.message : '创建用户失败');
        throw error;
      } finally {
        this.setLoading(false);
      }
    },
    
    // 更新用户
    async updateUser(id: string, data: {
      username?: string;
      email?: string;
      name?: string;
      phone?: string;
      department?: string;
      role?: string;
      status?: string;
    }) {
      this.setLoading(true);
      this.setError(null);
      
      try {
        const { data: user } = await userManagementService.updateUser(id, data);
        
        // 更新列表中的用户
        const index = this.users.findIndex(u => u.id === id);
        if (index !== -1) {
          this.users[index] = user;
        }
        
        // 更新当前用户
        if (this.currentUser?.id === id) {
          this.currentUser = user;
        }
        
        return user;
      } catch (error) {
        this.setError(error instanceof Error ? error.message : '更新用户失败');
        throw error;
      } finally {
        this.setLoading(false);
      }
    },
    
    // 删除用户
    async deleteUser(id: string) {
      this.setLoading(true);
      this.setError(null);
      
      try {
        await userManagementService.deleteUser(id);
        
        // 从列表中移除用户
        const index = this.users.findIndex(u => u.id === id);
        if (index !== -1) {
          this.users.splice(index, 1);
          this.total -= 1;
        }
        
        // 清空当前用户
        if (this.currentUser?.id === id) {
          this.currentUser = null;
        }
      } catch (error) {
        this.setError(error instanceof Error ? error.message : '删除用户失败');
        throw error;
      } finally {
        this.setLoading(false);
      }
    },
    
    // 批量删除用户
    async batchDeleteUsers(ids: string[]) {
      this.setLoading(true);
      this.setError(null);
      
      try {
        await userManagementService.batchDeleteUsers(ids);
        
        // 从列表中移除用户
        this.users = this.users.filter(user => !ids.includes(user.id));
        this.total -= ids.length;
        
        // 清空当前用户
        if (this.currentUser && ids.includes(this.currentUser.id)) {
          this.currentUser = null;
        }
      } catch (error) {
        this.setError(error instanceof Error ? error.message : '批量删除用户失败');
        throw error;
      } finally {
        this.setLoading(false);
      }
    },
    
    // 重置密码
    async resetPassword(id: string, password: string) {
      this.setLoading(true);
      this.setError(null);
      
      try {
        await userManagementService.resetPassword(id, password);
      } catch (error) {
        this.setError(error instanceof Error ? error.message : '重置密码失败');
        throw error;
      } finally {
        this.setLoading(false);
      }
    },
    
    // 更新用户状态
    async updateUserStatus(id: string, status: string) {
      this.setLoading(true);
      this.setError(null);
      
      try {
        const { data: user } = await userManagementService.updateUserStatus(id, status);
        
        // 更新列表中的用户
        const index = this.users.findIndex(u => u.id === id);
        if (index !== -1) {
          this.users[index] = user;
        }
        
        // 更新当前用户
        if (this.currentUser?.id === id) {
          this.currentUser = user;
        }
        
        return user;
      } catch (error) {
        this.setError(error instanceof Error ? error.message : '更新用户状态失败');
        throw error;
      } finally {
        this.setLoading(false);
      }
    },
    
    // 导出用户
    async exportUsers(params?: {
      keyword?: string;
      status?: string;
      role?: string;
      department?: string;
    }) {
      this.setLoading(true);
      this.setError(null);
      
      try {
        const { data } = await userManagementService.exportUsers(params);
        
        // 创建下载链接
        const url = window.URL.createObjectURL(new Blob([data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `users_${new Date().getTime()}.xlsx`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        this.setError(error instanceof Error ? error.message : '导出用户失败');
        throw error;
      } finally {
        this.setLoading(false);
      }
    },
    
    // 导入用户
    async importUsers(file: File) {
      this.setLoading(true);
      this.setError(null);
      
      try {
        const { data } = await userManagementService.importUsers(file);
        
        // 重新获取用户列表
        await this.fetchUsers();
        
        return data;
      } catch (error) {
        this.setError(error instanceof Error ? error.message : '导入用户失败');
        throw error;
      } finally {
        this.setLoading(false);
      }
    },
    
    // 获取用户活动
    async fetchUserActivities(params?: { page?: number; pageSize?: number }) {
      this.setLoading(true);
      this.setError(null);
      
      try {
        const { data } = await userService.getUserActivities(params);
        this.activities = data.items;
        return data;
      } catch (error) {
        this.setError(error instanceof Error ? error.message : '获取用户活动失败');
        throw error;
      } finally {
        this.setLoading(false);
      }
    },
    
    // 获取用户统计
    async fetchUserStats() {
      this.setLoading(true);
      this.setError(null);
      
      try {
        const { data } = await userService.getUserStats();
        this.stats = data;
        return data;
      } catch (error) {
        this.setError(error instanceof Error ? error.message : '获取用户统计失败');
        throw error;
      } finally {
        this.setLoading(false);
      }
    },
    
    // 设置分页
    setPage(page: number) {
      this.page = page;
    },
    
    // 设置每页数量
    setPageSize(pageSize: number) {
      this.pageSize = pageSize;
    },
    
    // 重置状态
    resetState() {
      this.users = [];
      this.currentUser = null;
      this.loading = false;
      this.error = null;
      this.total = 0;
      this.page = 1;
      this.pageSize = 10;
      this.activities = [];
      this.stats = null;
    }
  }
});