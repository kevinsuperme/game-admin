import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

// 模拟localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

// 模拟HTTP请求
const mockHttp = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  request: vi.fn(),
}

// 模拟用户store
const useUserStore = () => {
  const state = {
    isLogin: false,
    token: '',
    refreshToken: '',
    tokenExpireTime: 0,
  }
  
  const store = {
    get isLogin() { return state.isLogin },
    get token() { return state.token },
    get refreshToken() { return state.refreshToken },
    get tokenExpireTime() { return state.tokenExpireTime },
    
    set isLogin(value) { state.isLogin = value },
    set token(value) { state.token = value },
    set refreshToken(value) { state.refreshToken = value },
    set tokenExpireTime(value) { state.tokenExpireTime = value },
    
    login: vi.fn().mockResolvedValue({ 
      success: true, 
      token: 'fake-token',
      refreshToken: 'fake-refresh-token',
      expiresIn: 3600 // 1小时过期
    }),
    
    logout: vi.fn(),
    
    // 模拟刷新token的方法
    refreshAccessToken: vi.fn().mockImplementation(async () => {
      try {
        const response = await mockHttp.post('/auth/refresh', {
          refreshToken: state.refreshToken
        })
        
        if (response.data.success) {
          state.token = response.data.token
          state.tokenExpireTime = Date.now() + response.data.expiresIn * 1000
          
          // 更新localStorage
          localStorageMock.setItem('userState', JSON.stringify({
            token: state.token,
            refreshToken: state.refreshToken,
            tokenExpireTime: state.tokenExpireTime
          }))
          
          return { success: true, token: state.token }
        } else {
          return { success: false, error: 'Refresh token failed' }
        }
      } catch (error) {
        return { success: false, error: 'Network error' }
      }
    }),
    
    // 检查token是否过期
    isTokenExpired: vi.fn().mockImplementation(() => {
      return Date.now() >= state.tokenExpireTime
    }),
    
    // 模拟从localStorage恢复状态的方法
    restoreState: vi.fn(() => {
      const storedState = localStorageMock.getItem('userState')
      if (storedState) {
        try {
          const parsed = JSON.parse(storedState)
          state.token = parsed.token || ''
          state.refreshToken = parsed.refreshToken || ''
          state.tokenExpireTime = parsed.tokenExpireTime || 0
          state.isLogin = !!parsed.token
        } catch (e) {
          // 忽略JSON解析错误
        }
      }
    }),
  }
  
  return store
}

// 模拟HTTP拦截器
const createHttpInterceptor = (userStore) => {
  return {
    request: {
      use: vi.fn().mockImplementation((onFulfilled, onRejected) => {
        // 模拟请求拦截器，检查token是否过期
        return async (config) => {
          // 添加请求时间戳
          config.metadata = { startTime: Date.now() }
          
          // 如果用户已登录，添加Authorization头
          if (userStore.isLogin) {
            // 检查token是否过期
            if (userStore.isTokenExpired()) {
              try {
                const refreshResult = await userStore.refreshAccessToken()
                if (refreshResult.success) {
                  config.headers.Authorization = `Bearer ${refreshResult.token}`
                } else {
                  // 刷新失败，跳转到登录页
                  userStore.logout()
                  return Promise.reject(new Error('Token refresh failed'))
                }
              } catch (error) {
                userStore.logout()
                return Promise.reject(new Error('Token refresh failed'))
              }
            } else {
              config.headers.Authorization = `Bearer ${userStore.token}`
            }
          }
          
          // 添加请求ID用于追踪
          config.headers['X-Request-ID'] = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          
          return onFulfilled ? onFulfilled(config) : config
        }
      })
    },
    
    response: {
      use: vi.fn().mockImplementation((onFulfilled, onRejected) => {
        // 模拟响应拦截器，处理401错误
        return async (response) => {
          // 计算请求耗时
          if (response.config && response.config.metadata) {
            response.metadata = {
              duration: Date.now() - response.config.metadata.startTime
            }
          }
          
          // 处理401错误
          if (response.status === 401) {
            try {
              const refreshResult = await userStore.refreshAccessToken()
              if (refreshResult.success) {
                // 重新发送原请求
                response.config.headers.Authorization = `Bearer ${refreshResult.token}`
                return mockHttp.request(response.config)
              } else {
                // 刷新失败，跳转到登录页
                userStore.logout()
                return Promise.reject(new Error('Token refresh failed'))
              }
            } catch (error) {
              userStore.logout()
              return Promise.reject(new Error('Token refresh failed'))
            }
          }
          
          // 处理其他错误状态码
          if (response.status >= 400) {
            const error = new Error(`HTTP Error: ${response.status}`)
            error.response = response
            return Promise.reject(error)
          }
          
          return onFulfilled ? onFulfilled(response) : response
        }
      })
    }
  }
}

describe('HTTP拦截器集成测试', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    // 设置localStorage模拟
    global.localStorage = localStorageMock
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('应该能够在未登录状态下发送请求', async () => {
    const userStore = useUserStore()
    const interceptor = createHttpInterceptor(userStore)
    
    // 模拟未登录状态
    userStore.isLogin = false
    
    // 模拟请求配置
    const config = {
      url: '/api/public/data',
      method: 'GET',
      headers: {}
    }
    
    // 调用请求拦截器
    const result = await interceptor.request.use()(config)
    
    expect(result.headers.Authorization).toBeUndefined()
    expect(result.headers['X-Request-ID']).toBeDefined()
    expect(result.metadata).toBeDefined()
    expect(result.metadata.startTime).toBeDefined()
  })

  it('应该能够在已登录状态下添加Authorization头', async () => {
    const userStore = useUserStore()
    const interceptor = createHttpInterceptor(userStore)
    
    // 设置登录状态和有效的token
    userStore.isLogin = true
    userStore.token = 'valid-token'
    userStore.tokenExpireTime = Date.now() + 3600000 // 1小时后过期
    
    // 模拟请求配置
    const config = {
      url: '/api/protected/data',
      method: 'GET',
      headers: {}
    }
    
    // 调用请求拦截器
    const result = await interceptor.request.use()(config)
    
    expect(result.headers.Authorization).toBe('Bearer valid-token')
    expect(result.headers['X-Request-ID']).toBeDefined()
    expect(result.metadata).toBeDefined()
  })

  it('应该能够在token过期时自动刷新token', async () => {
    const userStore = useUserStore()
    const interceptor = createHttpInterceptor(userStore)
    
    // 设置登录状态和过期的token
    userStore.isLogin = true
    userStore.token = 'expired-token'
    userStore.refreshToken = 'valid-refresh-token'
    userStore.tokenExpireTime = Date.now() - 1000 // 已过期
    
    // 模拟刷新token的API响应
    mockHttp.post.mockResolvedValue({
      data: {
        success: true,
        token: 'new-token',
        expiresIn: 3600
      }
    })
    
    // 模拟请求配置
    const config = {
      url: '/api/protected/data',
      method: 'GET',
      headers: {}
    }
    
    // 调用请求拦截器
    const result = await interceptor.request.use()(config)
    
    expect(result.headers.Authorization).toBe('Bearer new-token')
    expect(userStore.token).toBe('new-token')
    expect(mockHttp.post).toHaveBeenCalledWith('/auth/refresh', {
      refreshToken: 'valid-refresh-token'
    })
  })

  it('应该能够在响应拦截器中计算请求耗时', async () => {
    const userStore = useUserStore()
    const interceptor = createHttpInterceptor(userStore)
    
    // 模拟响应
    const response = {
      status: 200,
      data: { result: 'success' },
      config: {
        metadata: { startTime: Date.now() - 100 } // 100ms前开始请求
      }
    }
    
    // 调用响应拦截器
    const result = await interceptor.response.use()(response)
    
    expect(result.metadata).toBeDefined()
    expect(result.metadata.duration).toBeGreaterThan(90) // 至少90ms
    expect(result.metadata.duration).toBeLessThan(200) // 小于200ms
  })

  it('应该能够在响应拦截器中处理401错误', async () => {
    const userStore = useUserStore()
    const interceptor = createHttpInterceptor(userStore)
    
    // 设置登录状态
    userStore.isLogin = true
    userStore.refreshToken = 'valid-refresh-token'
    
    // 模拟刷新token的API响应
    mockHttp.post.mockResolvedValue({
      data: {
        success: true,
        token: 'new-token',
        expiresIn: 3600
      }
    })
    
    // 模拟重新发送请求的响应
    mockHttp.request.mockResolvedValue({
      status: 200,
      data: { result: 'success' }
    })
    
    // 模拟401响应
    const response = {
      status: 401,
      config: {
        headers: {},
        url: '/api/protected/data'
      }
    }
    
    // 调用响应拦截器
    const result = await interceptor.response.use()(response)
    
    expect(result.status).toBe(200)
    expect(result.data.result).toBe('success')
    expect(userStore.token).toBe('new-token')
    expect(mockHttp.post).toHaveBeenCalledWith('/auth/refresh', {
      refreshToken: 'valid-refresh-token'
    })
  })

  it('应该能够在响应拦截器中处理其他HTTP错误', async () => {
    const userStore = useUserStore()
    const interceptor = createHttpInterceptor(userStore)
    
    // 模拟404响应
    const response = {
      status: 404,
      data: { error: 'Not Found' }
    }
    
    // 调用响应拦截器并捕获错误
    try {
      await interceptor.response.use()(response)
      // 如果没有抛出错误，测试失败
      expect(true).toBe(false)
    } catch (error) {
      expect(error.message).toBe('HTTP Error: 404')
      expect(error.response).toBe(response)
    }
  })

  it('应该能够在刷新token失败时跳转到登录页', async () => {
    const userStore = useUserStore()
    const interceptor = createHttpInterceptor(userStore)
    
    // 设置登录状态
    userStore.isLogin = true
    userStore.refreshToken = 'invalid-refresh-token'
    
    // 模拟刷新token的API失败响应
    mockHttp.post.mockResolvedValue({
      data: {
        success: false,
        error: 'Invalid refresh token'
      }
    })
    
    // 模拟401响应
    const response = {
      status: 401,
      config: {
        headers: {},
        url: '/api/protected/data'
      }
    }
    
    // 调用响应拦截器并捕获错误
    try {
      await interceptor.response.use()(response)
      // 如果没有抛出错误，测试失败
      expect(true).toBe(false)
    } catch (error) {
      expect(error.message).toBe('Token refresh failed')
      expect(userStore.logout).toHaveBeenCalled()
    }
  })

  it('应该能够在请求拦截器中处理刷新token失败', async () => {
    const userStore = useUserStore()
    const interceptor = createHttpInterceptor(userStore)
    
    // 设置登录状态和过期的token
    userStore.isLogin = true
    userStore.token = 'expired-token'
    userStore.refreshToken = 'invalid-refresh-token'
    userStore.tokenExpireTime = Date.now() - 1000 // 已过期
    
    // 模拟刷新token的API失败响应
    mockHttp.post.mockResolvedValue({
      data: {
        success: false,
        error: 'Invalid refresh token'
      }
    })
    
    // 模拟请求配置
    const config = {
      url: '/api/protected/data',
      method: 'GET',
      headers: {}
    }
    
    // 调用请求拦截器并捕获错误
    try {
      await interceptor.request.use()(config)
      // 如果没有抛出错误，测试失败
      expect(true).toBe(false)
    } catch (error) {
      expect(error.message).toBe('Token refresh failed')
      expect(userStore.logout).toHaveBeenCalled()
    }
  })
})