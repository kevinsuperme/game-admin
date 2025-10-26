/**
 * Token管理器 - 统一管理令牌的存储、读取、删除和过期检测
 * 
 * 功能:
 * - 访问令牌(Access Token)管理
 * - 刷新令牌(Refresh Token)管理
 * - 令牌过期检测
 * - 自动清理过期令牌
 * - 用户信息管理
 */

import { STORAGE_KEYS } from '@/domains/shared/constants';

/**
 * Token数据接口
 */
export interface TokenData {
  token: string;
  refreshToken?: string;
  expiresAt?: number; // 过期时间戳(毫秒)
  expiresIn?: number; // 过期时长(秒)
}

/**
 * 用户信息接口
 */
export interface UserInfo {
  id: string | number;
  username: string;
  email?: string;
  roles?: string[];
  permissions?: string[];
  [key: string]: any;
}

/**
 * Token管理器类
 */
class TokenManager {
  private readonly TOKEN_KEY = STORAGE_KEYS.TOKEN;
  private readonly REFRESH_TOKEN_KEY = STORAGE_KEYS.REFRESH_TOKEN || 'super-admin-refresh-token';
  private readonly USER_KEY = STORAGE_KEYS.USER_INFO;
  private readonly EXPIRES_AT_KEY = 'super-admin-token-expires-at';
  
  // Token过期提前量(毫秒) - 提前5分钟认为token即将过期
  private readonly EXPIRY_BUFFER = 5 * 60 * 1000;
  
  /**
   * 保存Token数据
   * @param data Token数据
   */
  setToken(data: TokenData): void {
    const { token, refreshToken, expiresIn, expiresAt } = data;
    
    // 保存访问令牌
    localStorage.setItem(this.TOKEN_KEY, token);
    
    // 保存刷新令牌
    if (refreshToken) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    }
    
    // 计算并保存过期时间
    if (expiresIn) {
      const expiresAtTimestamp = Date.now() + expiresIn * 1000;
      localStorage.setItem(this.EXPIRES_AT_KEY, expiresAtTimestamp.toString());
    } else if (expiresAt) {
      localStorage.setItem(this.EXPIRES_AT_KEY, expiresAt.toString());
    }
  }
  
  /**
   * 获取访问令牌
   * @returns 访问令牌或null
   */
  getToken(): string | null {
    const token = localStorage.getItem(this.TOKEN_KEY);
    
    // 如果token存在但已过期,自动清除
    if (token && this.isTokenExpired()) {
      this.clearToken();
      return null;
    }
    
    return token;
  }
  
  /**
   * 获取刷新令牌
   * @returns 刷新令牌或null
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }
  
  /**
   * 检查Token是否存在
   * @returns 是否存在有效token
   */
  hasToken(): boolean {
    return !!this.getToken();
  }
  
  /**
   * 检查Token是否过期
   * @returns 是否已过期
   */
  isTokenExpired(): boolean {
    const expiresAt = localStorage.getItem(this.EXPIRES_AT_KEY);
    
    if (!expiresAt) {
      return false; // 如果没有设置过期时间,认为未过期
    }
    
    const expiresAtTimestamp = parseInt(expiresAt, 10);
    return Date.now() >= expiresAtTimestamp;
  }
  
  /**
   * 检查Token是否即将过期(提前5分钟)
   * @returns 是否即将过期
   */
  isTokenExpiringSoon(): boolean {
    const expiresAt = localStorage.getItem(this.EXPIRES_AT_KEY);
    
    if (!expiresAt) {
      return false;
    }
    
    const expiresAtTimestamp = parseInt(expiresAt, 10);
    return Date.now() >= (expiresAtTimestamp - this.EXPIRY_BUFFER);
  }
  
  /**
   * 获取Token剩余有效时间(毫秒)
   * @returns 剩余时间(毫秒),如果已过期返回0
   */
  getTokenRemainingTime(): number {
    const expiresAt = localStorage.getItem(this.EXPIRES_AT_KEY);
    
    if (!expiresAt) {
      return Infinity; // 如果没有设置过期时间,返回无限大
    }
    
    const expiresAtTimestamp = parseInt(expiresAt, 10);
    const remaining = expiresAtTimestamp - Date.now();
    
    return Math.max(0, remaining);
  }
  
  /**
   * 清除Token数据
   */
  clearToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.EXPIRES_AT_KEY);
  }
  
  /**
   * 保存用户信息
   * @param user 用户信息
   */
  setUser(user: UserInfo): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }
  
  /**
   * 获取用户信息
   * @returns 用户信息或null
   */
  getUser(): UserInfo | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    
    if (!userStr) {
      return null;
    }
    
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('解析用户信息失败:', error);
      return null;
    }
  }
  
  /**
   * 清除用户信息
   */
  clearUser(): void {
    localStorage.removeItem(this.USER_KEY);
  }
  
  /**
   * 清除所有认证数据
   */
  clearAll(): void {
    this.clearToken();
    this.clearUser();
  }
  
  /**
   * 更新访问令牌(保持刷新令牌不变)
   * @param token 新的访问令牌
   * @param expiresIn 过期时长(秒)
   */
  updateAccessToken(token: string, expiresIn?: number): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    
    if (expiresIn) {
      const expiresAtTimestamp = Date.now() + expiresIn * 1000;
      localStorage.setItem(this.EXPIRES_AT_KEY, expiresAtTimestamp.toString());
    }
  }
  
  /**
   * 获取完整的认证状态
   * @returns 认证状态对象
   */
  getAuthState(): {
    isAuthenticated: boolean;
    token: string | null;
    refreshToken: string | null;
    user: UserInfo | null;
    isExpired: boolean;
    isExpiringSoon: boolean;
    remainingTime: number;
  } {
    const token = this.getToken();
    const refreshToken = this.getRefreshToken();
    const user = this.getUser();
    
    return {
      isAuthenticated: !!token && !!user,
      token,
      refreshToken,
      user,
      isExpired: this.isTokenExpired(),
      isExpiringSoon: this.isTokenExpiringSoon(),
      remainingTime: this.getTokenRemainingTime(),
    };
  }
  
  /**
   * 调试信息 - 输出当前Token状态
   */
  debug(): void {
    const state = this.getAuthState();
    const remainingMinutes = Math.floor(state.remainingTime / 1000 / 60);
    
    console.group('🔐 Token Manager Debug Info');
    console.log('认证状态:', state.isAuthenticated ? '✅ 已认证' : '❌ 未认证');
    console.log('Token:', state.token ? `${state.token.substring(0, 20)}...` : 'null');
    console.log('刷新Token:', state.refreshToken ? `${state.refreshToken.substring(0, 20)}...` : 'null');
    console.log('用户:', state.user?.username || 'null');
    console.log('过期状态:', state.isExpired ? '❌ 已过期' : '✅ 有效');
    console.log('即将过期:', state.isExpiringSoon ? '⚠️ 是' : '✅ 否');
    console.log('剩余时间:', remainingMinutes === Infinity ? '∞' : `${remainingMinutes}分钟`);
    console.groupEnd();
  }
}

// 导出单例实例
export const tokenManager = new TokenManager();

// 默认导出
export default tokenManager;