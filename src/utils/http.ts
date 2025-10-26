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