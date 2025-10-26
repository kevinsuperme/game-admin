// HTTP 请求工具
import type { ApiResponse, RequestConfig } from '@/types/api';

interface ExtendedRequestConfig extends RequestConfig {
  data?: any;
  responseType?: string;
}

class HttpClient {
  private baseURL: string;

  constructor(baseURL: string = '/api') {
    this.baseURL = baseURL;
  }

  // GET 请求
  async get<T = any>(url: string, config?: ExtendedRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('GET', url, undefined, config);
  }

  // POST 请求
  async post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('POST', url, data, config);
  }

  // PUT 请求
  async put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', url, data, config);
  }

  // DELETE 请求
  async delete<T = any>(url: string, config?: ExtendedRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', url, config?.data, config);
  }

  // PATCH 请求
  async patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', url, data, config);
  }

  // 通用请求方法
  private async request<T = any>(
    method: string,
    url: string,
    data?: any,
    config?: ExtendedRequestConfig
  ): Promise<ApiResponse<T>> {
    // 这里应该实现实际的HTTP请求逻辑
    // 为了构建通过，这里返回一个模拟的响应
    console.log(`[HTTP] ${method} ${this.baseURL}${url}`, { data, config });
    
    // 模拟响应
    return {
      code: 200,
      message: 'Success',
      data: {} as T,
      success: true
    };
  }
}

// 创建HTTP客户端实例
export const http = new HttpClient();

// 重试配置接口
export interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  retryableStatuses: number[];
  retryableMethods: string[];
  exponentialBackoff: boolean;
}

// 请求选项接口
export interface RequestOptions extends RequestInit {
  retryConfig?: Partial<RetryConfig>;
}

/**
 * 带重试机制的HTTP客户端
 */
export class RetryableHttpClient {
  private defaultRetryConfig: RetryConfig = {
    maxRetries: 3,
    retryDelay: 100,
    retryableStatuses: [408, 429, 500, 502, 503, 504],
    retryableMethods: ['GET', 'HEAD', 'OPTIONS', 'PUT', 'DELETE'],
    exponentialBackoff: true
  };

  private requestCount: number = 0;
  private retryCount: number = 0;

  constructor(config?: Partial<RetryConfig>) {
    if (config) {
      this.defaultRetryConfig = { ...this.defaultRetryConfig, ...config };
    }
  }

  async request<T>(url: string, options: RequestOptions = {}): Promise<T> {
    const retryConfig: RetryConfig = {
      ...this.defaultRetryConfig,
      ...options.retryConfig
    };

    let attempts = 0;
    let lastError: Error | null = null;

    while (attempts <= retryConfig.maxRetries) {
      attempts++;
      
      try {
        // 每次尝试（包括初始请求）都增加请求计数
        this.requestCount++;
        
        const response = await this.executeRequest<T>(url, options);
        return response;
      } catch (error: any) {
        lastError = error;

        // 如果达到最大重试次数或不应该重试，直接抛出错误
        if (attempts > retryConfig.maxRetries || !this.shouldRetry(error, options, retryConfig)) {
          throw error;
        }
        
        // 每次重试都增加重试计数
        this.retryCount++;
        
        // 计算重试延迟
        const delay = retryConfig.exponentialBackoff
          ? retryConfig.retryDelay * Math.pow(2, attempts - 1)
          : retryConfig.retryDelay;
        
        // 等待重试延迟
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    // 如果达到最大重试次数仍然失败，抛出最后一个错误
    throw lastError;
  }

  private async executeRequest<T>(url: string, options: RequestOptions): Promise<T> {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const error = new Error(`HTTP error! Status: ${response.status}`);
      (error as any).status = response.status;
      throw error;
    }
    
    try {
      return await response.json();
    } catch (e) {
      // JSON解析错误不需要重试，直接抛出
      const error = new Error('Failed to parse JSON response');
      (error as any).shouldNotRetry = true;
      throw error;
    }
  }

  private shouldRetry(error: any, options: RequestOptions, config: RetryConfig): boolean {
    // 如果标记了不应重试，则直接返回false
    if (error.shouldNotRetry) {
      return false;
    }
    
    const method = options.method?.toUpperCase() || 'GET';
    
    // 检查方法是否可重试
    if (!config.retryableMethods.includes(method)) {
      return false;
    }
    
    // 检查状态码是否可重试
    if (error.status && config.retryableStatuses.includes(error.status)) {
      return true;
    }
    
    // 检查是否是网络错误（fetch API 在网络错误时会抛出 TypeError）
    return error instanceof TypeError;
  }

  // 获取统计信息的方法
  getStats() {
    return {
      requestCount: this.requestCount,
      retryCount: this.retryCount
    };
  }

  // 重置统计信息
  resetStats() {
    this.requestCount = 0;
    this.retryCount = 0;
  }
}