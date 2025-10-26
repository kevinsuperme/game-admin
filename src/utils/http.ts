// HTTP 请求工具
import type { ApiResponse, RequestConfig } from '@/types/api'
import { tokenManager } from './token-manager'
import { useAuthStore } from '@/domains/auth/stores'

interface ExtendedRequestConfig extends RequestConfig {
  method?: string
  url?: string
  data?: any
  responseType?: string
  skipAuth?: boolean // 跳过自动添加token
  skipRefresh?: boolean // 跳过自动刷新token
}

// 拦截器类型
interface RequestInterceptor {
  onFulfilled?: (config: ExtendedRequestConfig) => ExtendedRequestConfig | Promise<ExtendedRequestConfig>
  onRejected?: (error: any) => any
}

interface ResponseInterceptor {
  onFulfilled?: (response: Response) => Response | Promise<Response>
  onRejected?: (error: any) => any
}

class HttpClient {
  private baseURL: string
  private requestInterceptors: RequestInterceptor[] = []
  private responseInterceptors: ResponseInterceptor[] = []
  private refreshingPromise: Promise<void> | null = null

  constructor(baseURL: string = '/api') {
    this.baseURL = baseURL
    this.setupDefaultInterceptors()
  }

  /**
   * 设置默认拦截器
   */
  private setupDefaultInterceptors() {
    // 请求拦截器: 自动添加token
    this.addRequestInterceptor({
      onFulfilled: async (config) => {
        if (!config.skipAuth) {
          const token = tokenManager.getToken()
          if (token) {
            config.headers = {
              ...config.headers,
              'Authorization': `Bearer ${token}`
            }
          }
        }
        return config
      },
      onRejected: (error) => {
        return Promise.reject(error)
      }
    })

    // 响应拦截器: 处理401错误和token刷新
    this.addResponseInterceptor({
      onFulfilled: (response) => response,
      onRejected: async (error) => {
        const originalRequest = error.config

        // 如果是401错误且不是刷新token的请求
        if (error.status === 401 && !originalRequest?.skipRefresh) {
          try {
            // 如果正在刷新token,等待刷新完成
            if (this.refreshingPromise) {
              await this.refreshingPromise
              // 重试原始请求
              return this.retryRequest(originalRequest)
            }

            // 开始刷新token
            this.refreshingPromise = this.refreshToken()
            await this.refreshingPromise
            this.refreshingPromise = null

            // 重试原始请求
            return this.retryRequest(originalRequest)
          } catch (refreshError) {
            // Token刷新失败,清除认证信息并跳转登录
            this.handleAuthFailure()
            return Promise.reject(refreshError)
          }
        }

        // 如果是403错误,可能是权限不足
        if (error.status === 403) {
          console.warn('[HTTP] 权限不足:', error)
          // 可以在这里触发权限不足的提示
        }

        return Promise.reject(error)
      }
    })
  }

  /**
   * 刷新token
   */
  private async refreshToken(): Promise<void> {
    const refreshToken = tokenManager.getRefreshToken()
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    try {
      // 调用刷新token API
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken })
      })

      if (!response.ok) {
        throw new Error('Token refresh failed')
      }

      const data = await response.json()
      
      // 更新token
      tokenManager.setToken({
        token: data.data.token,
        refreshToken: data.data.refreshToken,
        expiresIn: data.data.expiresIn
      })
      
      // 同步到store
      const authStore = useAuthStore()
      if (authStore.syncStateFromTokenManager) {
        authStore.syncStateFromTokenManager()
      }
    } catch (error) {
      console.error('[HTTP] Token refresh failed:', error)
      throw error
    }
  }

  /**
   * 重试请求
   */
  private async retryRequest(config: ExtendedRequestConfig): Promise<any> {
    // 更新token
    const token = tokenManager.getToken()
    if (token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`
      }
    }

    // 重新发起请求
    return this.request(
      config.method || 'GET',
      config.url || '',
      config.data,
      { ...config, skipRefresh: true } // 避免无限重试
    )
  }

  /**
   * 处理认证失败
   */
  private handleAuthFailure() {
    const authStore = useAuthStore()
    authStore.logout()
    
    // 如果不在登录页面,跳转到登录页
    if (window.location.pathname !== '/login') {
      window.location.href = '/login'
    }
  }

  /**
   * 添加请求拦截器
   */
  addRequestInterceptor(interceptor: RequestInterceptor) {
    this.requestInterceptors.push(interceptor)
  }

  /**
   * 添加响应拦截器
   */
  addResponseInterceptor(interceptor: ResponseInterceptor) {
    this.responseInterceptors.push(interceptor)
  }

  // GET 请求
  async get<T = any>(url: string, config?: ExtendedRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('GET', url, undefined, config)
  }

  // POST 请求
  async post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('POST', url, data, config)
  }

  // PUT 请求
  async put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', url, data, config)
  }

  // DELETE 请求
  async delete<T = any>(url: string, config?: ExtendedRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', url, config?.data, config)
  }

  // PATCH 请求
  async patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', url, data, config)
  }

  /**
   * 通用请求方法
   */
  private async request<T = any>(
    method: string,
    url: string,
    data?: any,
    config?: ExtendedRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      // 构建请求配置
      let requestConfig: ExtendedRequestConfig = {
        method,
        url,
        data,
        headers: {
          'Content-Type': 'application/json',
          ...config?.headers
        },
        ...config
      }

      // 执行请求拦截器
      for (const interceptor of this.requestInterceptors) {
        if (interceptor.onFulfilled) {
          requestConfig = await interceptor.onFulfilled(requestConfig)
        }
      }

      // 构建完整URL
      const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`

      // 发起请求
      const fetchConfig: RequestInit = {
        method: requestConfig.method,
        headers: requestConfig.headers as HeadersInit
      }

      if (data && method !== 'GET') {
        fetchConfig.body = JSON.stringify(data)
      }

      let response = await fetch(fullUrl, fetchConfig)

      // 执行响应拦截器
      for (const interceptor of this.responseInterceptors) {
        if (interceptor.onFulfilled) {
          response = await interceptor.onFulfilled(response)
        }
      }

      // 检查响应状态
      if (!response.ok) {
        const error: any = new Error(`HTTP error! Status: ${response.status}`)
        error.status = response.status
        error.config = requestConfig
        throw error
      }

      // 解析响应
      const result = await response.json()

      return {
        code: result.code || 200,
        message: result.message || 'Success',
        data: result.data as T,
        success: result.success !== false
      }
    } catch (error: any) {
      // 执行响应拦截器的错误处理
      for (const interceptor of this.responseInterceptors) {
        if (interceptor.onRejected) {
          return await interceptor.onRejected(error)
        }
      }
      throw error
    }
  }
}

// 创建HTTP客户端实例
export const http = new HttpClient()

// 重试配置接口
export interface RetryConfig {
  maxRetries: number
  retryDelay: number
  retryableStatuses: number[]
  retryableMethods: string[]
  exponentialBackoff: boolean
}

// 请求选项接口
export interface RequestOptions extends RequestInit {
  retryConfig?: Partial<RetryConfig>
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
  }

  private requestCount: number = 0
  private retryCount: number = 0

  constructor(config?: Partial<RetryConfig>) {
    if (config) {
      this.defaultRetryConfig = { ...this.defaultRetryConfig, ...config }
    }
  }

  async request<T>(url: string, options: RequestOptions = {}): Promise<T> {
    const retryConfig: RetryConfig = {
      ...this.defaultRetryConfig,
      ...options.retryConfig
    }

    let attempts = 0
    let lastError: Error | null = null

    while (attempts <= retryConfig.maxRetries) {
      attempts++
      
      try {
        // 每次尝试(包括初始请求)都增加请求计数
        this.requestCount++
        
        const response = await this.executeRequest<T>(url, options)
        return response
      } catch (error: any) {
        lastError = error

        // 如果达到最大重试次数或不应该重试,直接抛出错误
        if (attempts > retryConfig.maxRetries || !this.shouldRetry(error, options, retryConfig)) {
          throw error
        }
        
        // 每次重试都增加重试计数
        this.retryCount++
        
        // 计算重试延迟
        const delay = retryConfig.exponentialBackoff
          ? retryConfig.retryDelay * Math.pow(2, attempts - 1)
          : retryConfig.retryDelay
        
        // 等待重试延迟
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    
    // 如果达到最大重试次数仍然失败,抛出最后一个错误
    throw lastError
  }

  private async executeRequest<T>(url: string, options: RequestOptions): Promise<T> {
    const response = await fetch(url, options)
    
    if (!response.ok) {
      const error = new Error(`HTTP error! Status: ${response.status}`)
      ;(error as any).status = response.status
      throw error
    }
    
    try {
      return await response.json()
    } catch (e) {
      // JSON解析错误不需要重试,直接抛出
      const error = new Error('Failed to parse JSON response')
      ;(error as any).shouldNotRetry = true
      throw error
    }
  }

  private shouldRetry(error: any, options: RequestOptions, config: RetryConfig): boolean {
    // 如果标记了不应重试,则直接返回false
    if (error.shouldNotRetry) {
      return false
    }
    
    const method = options.method?.toUpperCase() || 'GET'
    
    // 检查方法是否可重试
    if (!config.retryableMethods.includes(method)) {
      return false
    }
    
    // 检查状态码是否可重试
    if (error.status && config.retryableStatuses.includes(error.status)) {
      return true
    }
    
    // 检查是否是网络错误(fetch API 在网络错误时会抛出 TypeError)
    return error instanceof TypeError
  }

  // 获取统计信息的方法
  getStats() {
    return {
      requestCount: this.requestCount,
      retryCount: this.retryCount
    }
  }

  // 重置统计信息
  resetStats() {
    this.requestCount = 0
    this.retryCount = 0
  }
}