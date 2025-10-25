// 用户域服务实现
import type {
  User,
  UserProfile,
  UserPreferences,
  UpdateUserProfileData,
  UpdateUserPreferencesData,
  UserActivity,
  UserStats
} from '../types';
import type { ApiResponse } from '@/types/api';
import { http } from '@/utils/http';

// 用户服务接口
export interface UserService {
  // 用户资料管理
  getUserProfile(): Promise<ApiResponse<UserProfile>>;
  updateUserProfile(data: UpdateUserProfileData): Promise<ApiResponse<UserProfile>>;
  
  // 用户偏好设置
  getUserPreferences(): Promise<ApiResponse<UserPreferences>>;
  updateUserPreferences(data: UpdateUserPreferencesData): Promise<ApiResponse<UserPreferences>>;
  
  // 用户活动
  getUserActivities(params?: { page?: number; pageSize?: number }): Promise<ApiResponse<{ items: UserActivity[]; total: number }>>;
  
  // 用户统计
  getUserStats(): Promise<ApiResponse<UserStats>>;
  
  // 头像上传
  uploadAvatar(file: File): Promise<ApiResponse<{ url: string }>>;
}

// 用户服务实现类
export class UserServiceImpl implements UserService {
  private baseURL = '/api/user';

  // 用户资料管理
  async getUserProfile(): Promise<ApiResponse<UserProfile>> {
    return http.get(`${this.baseURL}/profile`);
  }

  async updateUserProfile(data: UpdateUserProfileData): Promise<ApiResponse<UserProfile>> {
    return http.put(`${this.baseURL}/profile`, data);
  }

  // 用户偏好设置
  async getUserPreferences(): Promise<ApiResponse<UserPreferences>> {
    return http.get(`${this.baseURL}/preferences`);
  }

  async updateUserPreferences(data: UpdateUserPreferencesData): Promise<ApiResponse<UserPreferences>> {
    return http.put(`${this.baseURL}/preferences`, data);
  }

  // 用户活动
  async getUserActivities(params?: { page?: number; pageSize?: number }): Promise<ApiResponse<{ items: UserActivity[]; total: number }>> {
    return http.get(`${this.baseURL}/activities`, { params });
  }

  // 用户统计
  async getUserStats(): Promise<ApiResponse<UserStats>> {
    return http.get(`${this.baseURL}/stats`);
  }

  // 头像上传
  async uploadAvatar(file: File): Promise<ApiResponse<{ url: string }>> {
    const formData = new FormData();
    formData.append('avatar', file);
    return http.post(`${this.baseURL}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
}

// 创建用户服务实例
export const userService = new UserServiceImpl();

// 用户管理服务接口
export interface UserManagementService {
  // 用户列表
  getUsers(params?: {
    page?: number;
    pageSize?: number;
    keyword?: string;
    status?: string;
    role?: string;
    department?: string;
  }): Promise<ApiResponse<{ items: User[]; total: number }>>;
  
  // 用户详情
  getUserById(id: string): Promise<ApiResponse<User>>;
  
  // 创建用户
  createUser(data: {
    username: string;
    email: string;
    password: string;
    name?: string;
    phone?: string;
    department?: string;
    role?: string;
  }): Promise<ApiResponse<User>>;
  
  // 更新用户
  updateUser(id: string, data: {
    username?: string;
    email?: string;
    name?: string;
    phone?: string;
    department?: string;
    role?: string;
    status?: string;
  }): Promise<ApiResponse<User>>;
  
  // 删除用户
  deleteUser(id: string): Promise<ApiResponse<void>>;
  
  // 批量删除用户
  batchDeleteUsers(ids: string[]): Promise<ApiResponse<void>>;
  
  // 重置密码
  resetPassword(id: string, password: string): Promise<ApiResponse<void>>;
  
  // 更新用户状态
  updateUserStatus(id: string, status: string): Promise<ApiResponse<User>>;
  
  // 导出用户
  exportUsers(params?: {
    keyword?: string;
    status?: string;
    role?: string;
    department?: string;
  }): Promise<ApiResponse<Blob>>;
  
  // 导入用户
  importUsers(file: File): Promise<ApiResponse<{
    success: number;
    failed: number;
    errors: Array<{ row: number; message: string }>;
  }>>;
}

// 用户管理服务实现类
export class UserManagementServiceImpl implements UserManagementService {
  private baseURL = '/api/admin/users';

  // 用户列表
  async getUsers(params?: {
    page?: number;
    pageSize?: number;
    keyword?: string;
    status?: string;
    role?: string;
    department?: string;
  }): Promise<ApiResponse<{ items: User[]; total: number }>> {
    return http.get(this.baseURL, { params });
  }

  // 用户详情
  async getUserById(id: string): Promise<ApiResponse<User>> {
    return http.get(`${this.baseURL}/${id}`);
  }

  // 创建用户
  async createUser(data: {
    username: string;
    email: string;
    password: string;
    name?: string;
    phone?: string;
    department?: string;
    role?: string;
  }): Promise<ApiResponse<User>> {
    return http.post(this.baseURL, data);
  }

  // 更新用户
  async updateUser(id: string, data: {
    username?: string;
    email?: string;
    name?: string;
    phone?: string;
    department?: string;
    role?: string;
    status?: string;
  }): Promise<ApiResponse<User>> {
    return http.put(`${this.baseURL}/${id}`, data);
  }

  // 删除用户
  async deleteUser(id: string): Promise<ApiResponse<void>> {
    return http.delete(`${this.baseURL}/${id}`);
  }

  // 批量删除用户
  async batchDeleteUsers(ids: string[]): Promise<ApiResponse<void>> {
    return http.delete(`${this.baseURL}/batch`, { data: { ids } });
  }

  // 重置密码
  async resetPassword(id: string, password: string): Promise<ApiResponse<void>> {
    return http.post(`${this.baseURL}/${id}/reset-password`, { password });
  }

  // 更新用户状态
  async updateUserStatus(id: string, status: string): Promise<ApiResponse<User>> {
    return http.patch(`${this.baseURL}/${id}/status`, { status });
  }

  // 导出用户
  async exportUsers(params?: {
    keyword?: string;
    status?: string;
    role?: string;
    department?: string;
  }): Promise<ApiResponse<Blob>> {
    return http.get(`${this.baseURL}/export`, {
      params,
      responseType: 'blob'
    });
  }

  // 导入用户
  async importUsers(file: File): Promise<ApiResponse<{
    success: number;
    failed: number;
    errors: Array<{ row: number; message: string }>;
  }>> {
    const formData = new FormData();
    formData.append('file', file);
    return http.post(`${this.baseURL}/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
}

// 创建用户管理服务实例
export const userManagementService = new UserManagementServiceImpl();