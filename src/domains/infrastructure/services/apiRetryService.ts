// API重试和降级服务
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import type { AxiosInstance } from 'axios';
import { httpClient } from '../http';
import logService from '../logging';

// 重试配置
export interface RetryConfig {
  maxRetries?: number;
  retryDelay?: number;
  retryCondition?: (error: any) => boolean;
  onRetry?: (error: any, retryCount: number) => void;
  exponentialBackoff?: boolean;
  maxRetryDelay?: number;
}

// 降级配置
export interface FallbackConfig {
  fallbackData?: any;
  fallbackUrl?: string;
  fallbackHandler?: (error: any, originalRequest: any) => Promise<any>;
  shouldFallback?: (error: any) => boolean;
}

// 请求配置
export interface RequestConfig {
  retry?: RetryConfig;
  fallback?: FallbackConfig;
  enableRetry?: boolean;
  enableFallback?: boolean;
  [key: string]: any; // 允许其他Axios配置属性
}

// 默认重试配置
const defaultRetryConfig: Required<RetryConfig> = {
  maxRetries: 3,
  retryDelay: 1000,
  retryCondition: (error) => {
    // 默认重试条件：网络错误、超时、5xx服务器错误
    return (
      !error.response ||
      error.code === 'ECONNABORTED' ||
      error.message.includes('timeout') ||
      (error.response.status >= 500 && error.response.status < 600)
    );
  },
  onRetry: (error, retryCount) => {
    logService.warn(`API请求重试 (${retryCount})`, { error: error.message }, 'ApiRetryService');
  },
  exponentialBackoff: true,
  maxRetryDelay: 10000,
};

// 默认降级配置
const defaultFallbackConfig: Required<FallbackConfig> = {
  fallbackData: null,
  fallbackUrl: '',
  fallbackHandler: async (error, originalRequest) => {
    // 默认降级处理：返回空数据
    logService.warn('API请求降级处理', { 
      error: error.message, 
      url: originalRequest.url 
    }, 'ApiRetryService');
    
    return { data: {} };
  },
  shouldFallback: (error) => {
    // 默认降级条件：所有错误都尝试降级
    return true;
  },
};

// API重试和降级服务
class ApiRetryService {
  private httpClient = httpClient;
  private requestCache: Map<string, any> = new Map();
  private cacheEnabled: boolean = true;
  private cacheMaxAge: number = 5 * 60 * 1000; // 5分钟缓存

  constructor() {
    // httpClient已在属性初始化中赋值
  }

  /**
   * 发送请求（带重试和降级）
   * @param config 请求配置
   * @returns Promise
   */
  async request<T = any>(config: RequestConfig): Promise<AxiosResponse<T>> {
    const {
      retry = {},
      fallback = {},
      enableRetry = true,
      enableFallback = true,
      ...axiosConfig
    } = config;

    // 合并重试配置
    const retryConfig = { ...defaultRetryConfig, ...retry };
    
    // 合并降级配置
    const fallbackConfig = { ...defaultFallbackConfig, ...fallback };

    // 检查缓存
    if (this.cacheEnabled && axiosConfig.method?.toLowerCase() === 'get') {
      const cacheKey = this.getCacheKey(axiosConfig);
      const cachedData = this.getFromCache(cacheKey);
      
      if (cachedData) {
        logService.debug('使用缓存数据', { url: axiosConfig.url }, 'ApiRetryService');
        return { data: cachedData, status: 200, statusText: 'OK', headers: {}, config: axiosConfig };
      }
    }

    try {
      // 如果启用重试，使用重试逻辑
      if (enableRetry) {
        return await this.requestWithRetry<T>(axiosConfig, retryConfig);
      } else {
        return await this.httpClient.request<T>(axiosConfig);
      }
    } catch (error: any) {
      logService.error('API请求失败', { 
        error: error.message, 
        url: axiosConfig.url,
        status: error.response?.status,
        statusText: error.response?.statusText,
      }, 'ApiRetryService');

      // 如果启用降级，尝试降级处理
      if (enableFallback && fallbackConfig.shouldFallback(error)) {
        try {
          const fallbackResult = await this.handleFallback<T>(error, axiosConfig, fallbackConfig);
          
          // 如果是GET请求，缓存降级结果
          if (this.cacheEnabled && axiosConfig.method?.toLowerCase() === 'get') {
            const cacheKey = this.getCacheKey(axiosConfig);
            this.setCache(cacheKey, fallbackResult.data);
          }
          
          return fallbackResult;
        } catch (fallbackError: any) {
          logService.error('降级处理失败', { 
            error: fallbackError.message, 
            originalUrl: axiosConfig.url 
          }, 'ApiRetryService');
          
          // 降级也失败了，抛出原始错误
          throw error;
        }
      }
      
      // 不启用降级或降级条件不满足，抛出原始错误
      throw error;
    }
  }

  /**
   * 带重试的请求
   * @param config Axios请求配置
   * @param retryConfig 重试配置
   * @returns Promise
   */
  private async requestWithRetry<T = any>(
    config: AxiosRequestConfig, 
    retryConfig: Required<RetryConfig>
  ): Promise<AxiosResponse<T>> {
    let lastError: any;
    
    for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
      try {
        const response = await this.httpClient.request<T>(config);
        
        // 如果是GET请求且成功，缓存结果
        if (this.cacheEnabled && config.method?.toLowerCase() === 'get') {
          const cacheKey = this.getCacheKey(config);
          this.setCache(cacheKey, response.data);
        }
        
        return response;
      } catch (error: any) {
        lastError = error;
        
        // 如果是最后一次尝试，或者错误不满足重试条件，直接抛出错误
        if (attempt === retryConfig.maxRetries || !retryConfig.retryCondition(error)) {
          throw error;
        }
        
        // 计算重试延迟
        const delay = this.calculateRetryDelay(attempt, retryConfig);
        
        // 执行重试回调
        if (retryConfig.onRetry) {
          retryConfig.onRetry(error, attempt + 1);
        }
        
        // 等待重试延迟
        await this.delay(delay);
      }
    }
    
    throw lastError;
  }

  /**
   * 计算重试延迟
   * @param attempt 当前尝试次数（从0开始）
   * @param retryConfig 重试配置
   * @returns 延迟时间（毫秒）
   */
  private calculateRetryDelay(attempt: number, retryConfig: Required<RetryConfig>): number {
    if (!retryConfig.exponentialBackoff) {
      return retryConfig.retryDelay;
    }
    
    // 指数退避算法：delay = baseDelay * (2 ^ attempt) + jitter
    const exponentialDelay = retryConfig.retryDelay * Math.pow(2, attempt);
    
    // 添加随机抖动（±25%）
    const jitter = exponentialDelay * 0.25 * (Math.random() * 2 - 1);
    
    // 确保不超过最大延迟
    return Math.min(exponentialDelay + jitter, retryConfig.maxRetryDelay);
  }

  /**
   * 处理降级
   * @param error 错误对象
   * @param originalRequest 原始请求配置
   * @param fallbackConfig 降级配置
   * @returns Promise
   */
  private async handleFallback<T = any>(
    error: any, 
    originalRequest: any, 
    fallbackConfig: Required<FallbackConfig>
  ): Promise<any> {
    // 如果有降级数据，直接返回
    if (fallbackConfig.fallbackData !== null) {
      return { 
        data: fallbackConfig.fallbackData, 
        status: 200, 
        statusText: 'OK', 
        headers: {}, 
        config: originalRequest 
      };
    }
    
    // 如果有降级URL，尝试请求降级URL
    if (fallbackConfig.fallbackUrl) {
      try {
        const fallbackRequest = { ...originalRequest, url: fallbackConfig.fallbackUrl };
        return await this.httpClient.request<T>(fallbackRequest);
      } catch (fallbackError: any) {
        logService.warn('降级URL请求失败', { 
          error: fallbackError.message, 
          fallbackUrl: fallbackConfig.fallbackUrl 
        }, 'ApiRetryService');
        
        // 继续尝试降级处理器
      }
    }
    
    // 如果有自定义降级处理器，使用它
    if (fallbackConfig.fallbackHandler) {
      return await fallbackConfig.fallbackHandler(error, originalRequest);
    }
    
    // 没有可用的降级方式，抛出错误
    throw error;
  }

  /**
   * 生成缓存键
   */
  private getCacheKey(config: any): string {
    const { method, url, params, data } = config;
    return `${method}:${url}:${JSON.stringify(params)}:${JSON.stringify(data)}`;
  }

  /**
   * 从缓存获取数据
   * @param key 缓存键
   * @returns 缓存数据或null
   */
  private getFromCache(key: string): any {
    const cached = this.requestCache.get(key);
    
    if (!cached) {
      return null;
    }
    
    // 检查是否过期
    if (Date.now() - cached.timestamp > this.cacheMaxAge) {
      this.requestCache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  /**
   * 设置缓存
   * @param key 缓存键
   * @param data 缓存数据
   */
  private setCache(key: string, data: any): void {
    this.requestCache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * 清除缓存
   * @param key 缓存键（可选，不提供则清除所有缓存）
   */
  clearCache(key?: string): void {
    if (key) {
      this.requestCache.delete(key);
    } else {
      this.requestCache.clear();
    }
  }

  /**
   * 启用/禁用缓存
   * @param enabled 是否启用缓存
   */
  setCacheEnabled(enabled: boolean): void {
    this.cacheEnabled = enabled;
  }

  /**
   * 设置缓存最大存活时间
   * @param maxAge 最大存活时间（毫秒）
   */
  setCacheMaxAge(maxAge: number): void {
    this.cacheMaxAge = maxAge;
  }

  /**
   * 延迟函数
   * @param ms 延迟时间（毫秒）
   * @returns Promise
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * GET请求
   * @param url 请求URL
   * @param config 请求配置
   * @returns Promise
   */
  get<T = any>(url: string, config?: RequestConfig): Promise<any> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  /**
   * POST请求
   * @param url 请求URL
   * @param data 请求数据
   * @param config 请求配置
   * @returns Promise
   */
  post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<any> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  /**
   * PUT请求
   * @param url 请求URL
   * @param data 请求数据
   * @param config 请求配置
   * @returns Promise
   */
  put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<any> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  /**
   * DELETE请求
   * @param url 请求URL
   * @param config 请求配置
   * @returns Promise
   */
  delete<T = any>(url: string, config?: RequestConfig): Promise<any> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }

  /**
   * PATCH请求
   * @param url 请求URL
   * @param data 请求数据
   * @param config 请求配置
   * @returns Promise
   */
  patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<any> {
    return this.request<T>({ ...config, method: 'PATCH', url, data });
  }

  /**
   * 获取缓存统计信息
   * @returns 缓存统计信息
   */
  getCacheStats(): {
    size: number;
    maxSize: number;
    enabled: boolean;
    maxAge: number;
  } {
    return {
      size: this.requestCache.size,
      maxSize: 100, // 假设最大缓存大小为100
      enabled: this.cacheEnabled,
      maxAge: this.cacheMaxAge,
    };
  }
}

// 创建API重试服务实例
const apiRetryService = new ApiRetryService();

// 导出服务实例和类型
export default apiRetryService;
export { RequestConfig, RetryConfig, FallbackConfig };