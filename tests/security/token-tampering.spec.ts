import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

// 模拟localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

// 模拟crypto库用于JWT验证
const mockCrypto = {
  // 模拟JWT验证
  verifyJWT: vi.fn().mockImplementation((token, secret) => {
    try {
      // 简化的JWT验证逻辑
      const parts = token.split('.')
      if (parts.length !== 3) {
        return { valid: false, error: 'Invalid token format' }
      }
      
      // 解析头部
      const header = JSON.parse(atob(parts[0]))
      
      // 检查头部算法
      if (header.alg !== 'HS256') {
        return { valid: false, error: 'Invalid signature' }
      }
      
      // 解析载荷
      const payload = JSON.parse(atob(parts[1]))
      
      // 检查过期时间
      if (payload.exp && Date.now() / 1000 > payload.exp) {
        return { valid: false, error: 'Token expired' }
      }
      
      // 检查签发时间
      if (payload.nbf && Date.now() / 1000 < payload.nbf) {
        return { valid: false, error: 'Token not yet valid' }
      }
      
      // 模拟签名验证（在实际应用中，这里会使用真正的加密算法）
      const signature = parts[2]
      const expectedSignature = 'valid-signature' // 模拟期望的签名
      
      if (signature !== expectedSignature) {
        return { valid: false, error: 'Invalid signature' }
      }
      
      return { valid: true, payload }
    } catch (error) {
      return { valid: false, error: 'Failed to parse token' }
    }
  }),
  
  // 模拟JWT生成
  generateJWT: vi.fn().mockImplementation((payload, secret, expiresIn) => {
    const header = { alg: 'HS256', typ: 'JWT' }
    const now = Math.floor(Date.now() / 1000)
    const tokenPayload = {
      ...payload,
      iat: now,
      exp: now + (expiresIn || 3600)
    }
    
    // 模拟JWT生成（在实际应用中，这里会使用真正的加密算法）
    const encodedHeader = btoa(JSON.stringify(header))
    const encodedPayload = btoa(JSON.stringify(tokenPayload))
    const signature = 'valid-signature' // 模拟签名
    
    return `${encodedHeader}.${encodedPayload}.${signature}`
  }),
  
  // 模拟哈希函数
  hash: vi.fn().mockImplementation((data) => {
    // 简化的哈希函数模拟
    return `hashed-${data}`
  }),
  
  // 模拟比较函数
  compare: vi.fn().mockImplementation((data, hash) => {
    // 简化的比较函数模拟
    return hash === `hashed-${data}`
  })
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
    user: null,
  }
  
  const store = {
    get isLogin() { return state.isLogin },
    get token() { return state.token },
    get refreshToken() { return state.refreshToken },
    get tokenExpireTime() { return state.tokenExpireTime },
    get user() { return state.user },
    
    set isLogin(value) { state.isLogin = value },
    set token(value) { state.token = value },
    set refreshToken(value) { state.refreshToken = value },
    set tokenExpireTime(value) { state.tokenExpireTime = value },
    set user(value) { state.user = value },
    
    login: vi.fn().mockImplementation(async (credentials) => {
      try {
        const response = await mockHttp.post('/auth/login', credentials)
        
        if (response.data.success) {
          const { token, refreshToken, user, expiresIn } = response.data
          
          // 验证token有效性
          const tokenValidation = mockCrypto.verifyJWT(token, 'secret-key')
          
          if (!tokenValidation.valid) {
            return { success: false, error: 'Invalid token received from server' }
          }
          
          state.token = token
          state.refreshToken = refreshToken
          state.tokenExpireTime = Date.now() + expiresIn * 1000
          state.user = user
          state.isLogin = true
          
          // 保存到localStorage
          localStorageMock.setItem('userState', JSON.stringify({
            token: state.token,
            refreshToken: state.refreshToken,
            tokenExpireTime: state.tokenExpireTime,
            user: state.user
          }))
          
          return { success: true, user: state.user }
        } else {
          return { success: false, error: response.data.error }
        }
      } catch (error) {
        return { success: false, error: 'Network error' }
      }
    }),
    
    logout: vi.fn().mockImplementation(() => {
      state.token = ''
      state.refreshToken = ''
      state.tokenExpireTime = 0
      state.user = null
      state.isLogin = false
      
      // 清除localStorage
      localStorageMock.removeItem('userState')
    }),
    
    // 验证当前token是否有效
    validateToken: vi.fn().mockImplementation(() => {
      if (!state.token) {
        return { valid: false, error: 'No token provided' }
      }
      
      const validation = mockCrypto.verifyJWT(state.token, 'secret-key')
      
      if (!validation.valid) {
        // 如果token无效，清除登录状态和token
        state.token = ''
        state.isLogin = false
      }
      
      return validation
    }),
    
    // 刷新token
    refreshAccessToken: vi.fn().mockImplementation(async () => {
      try {
        const response = await mockHttp.post('/auth/refresh', {
          refreshToken: state.refreshToken
        })
        
        if (response.data.success) {
          const { token, expiresIn } = response.data
          
          // 验证新token的有效性
          const tokenValidation = mockCrypto.verifyJWT(token, 'secret-key')
          
          if (!tokenValidation.valid) {
            return { success: false, error: 'Invalid token received from server' }
          }
          
          state.token = token
          state.tokenExpireTime = Date.now() + expiresIn * 1000
          
          // 更新localStorage
          const storedState = JSON.parse(localStorageMock.getItem('userState') || '{}')
          localStorageMock.setItem('userState', JSON.stringify({
            ...storedState,
            token: state.token,
            tokenExpireTime: state.tokenExpireTime
          }))
          
          return { success: true, token: state.token }
        } else {
          return { success: false, error: response.data.error }
        }
      } catch (error) {
        return { success: false, error: 'Network error' }
      }
    }),
    
    // 从localStorage恢复状态
    restoreState: vi.fn().mockImplementation(() => {
      const storedState = localStorageMock.getItem('userState')
      if (storedState) {
        try {
          const parsed = JSON.parse(storedState)
          state.token = parsed.token || ''
          state.refreshToken = parsed.refreshToken || ''
          state.tokenExpireTime = parsed.tokenExpireTime || 0
          state.user = parsed.user || null
          
          // 验证token有效性
          if (state.token) {
            const validation = mockCrypto.verifyJWT(state.token, 'secret-key')
            state.isLogin = validation.valid
            
            // 如果token无效，清除token
            if (!validation.valid) {
              state.token = ''
            }
          } else {
            state.isLogin = false
          }
        } catch (e) {
          // 如果解析失败，清除状态
          store.logout()
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
        return async (config) => {
          // 如果用户已登录，添加Authorization头
          if (userStore.isLogin) {
            // 验证token有效性
            const validation = userStore.validateToken()
            
            if (!validation.valid) {
              userStore.logout()
              return Promise.reject(new Error('Invalid token'))
            }
            
            config.headers.Authorization = `Bearer ${userStore.token}`
          }
          
          return onFulfilled ? onFulfilled(config) : config
        }
      })
    },
    
    response: {
      use: vi.fn().mockImplementation((onFulfilled, onRejected) => {
        return async (response) => {
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
          
          return onFulfilled ? onFulfilled(response) : response
        }
      })
    }
  }
}

describe('Token篡改测试', () => {
  let userStore
  let interceptor
  
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    // 设置localStorage模拟
    global.localStorage = localStorageMock
    // 使用Object.defineProperty来设置crypto模拟
    Object.defineProperty(global, 'crypto', {
      value: mockCrypto,
      writable: true
    })
    
    userStore = useUserStore()
    interceptor = createHttpInterceptor(userStore)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Token验证', () => {
    it('应该能够验证有效的token', () => {
      // 生成有效的token
      const validToken = mockCrypto.generateJWT(
        { userId: '123', username: 'testuser' },
        'secret-key',
        3600
      )
      
      // 设置token
      userStore.token = validToken
      userStore.isLogin = true
      
      // 验证token
      const validation = userStore.validateToken()
      
      expect(validation.valid).toBe(true)
      expect(validation.payload.userId).toBe('123')
      expect(validation.payload.username).toBe('testuser')
    })

    it('应该能够拒绝格式错误的token', () => {
      // 设置格式错误的token
      userStore.token = 'invalid-token-format'
      userStore.isLogin = true
      
      // 验证token
      const validation = userStore.validateToken()
      
      expect(validation.valid).toBe(false)
      expect(validation.error).toBe('Invalid token format')
      expect(userStore.isLogin).toBe(false) // 应该自动登出
    })

    it('应该能够拒绝过期的token', () => {
      // 生成过期的token
      const expiredToken = mockCrypto.generateJWT(
        { userId: '123', username: 'testuser' },
        'secret-key',
        -1 // 负数表示已过期
      )
      
      // 设置过期的token
      userStore.token = expiredToken
      userStore.isLogin = true
      
      // 验证token
      const validation = userStore.validateToken()
      
      expect(validation.valid).toBe(false)
      expect(validation.error).toBe('Token expired')
      expect(userStore.isLogin).toBe(false) // 应该自动登出
    })

    it('应该能够拒绝签名错误的token', () => {
      // 创建一个签名错误的token
      const parts = mockCrypto.generateJWT(
        { userId: '123', username: 'testuser' },
        'secret-key',
        3600
      ).split('.')
      
      const tamperedToken = `${parts[0]}.${parts[1]}.invalid-signature`
      
      // 设置签名错误的token
      userStore.token = tamperedToken
      userStore.isLogin = true
      
      // 验证token
      const validation = userStore.validateToken()
      
      expect(validation.valid).toBe(false)
      expect(validation.error).toBe('Invalid signature')
      expect(userStore.isLogin).toBe(false) // 应该自动登出
    })
  })

  describe('Token篡改检测', () => {
    it('应该能够检测被篡改的载荷', () => {
      // 创建一个有效的token
      const validToken = mockCrypto.generateJWT(
        { userId: '123', username: 'testuser' },
        'secret-key',
        3600
      )
      
      // 篡改载荷
      const parts = validToken.split('.')
      const payload = JSON.parse(atob(parts[1]))
      payload.userId = '456' // 篡改用户ID
      payload.isAdmin = true // 添加管理员权限
      
      const tamperedToken = `${parts[0]}.${btoa(JSON.stringify(payload))}.invalid-signature`
      
      // 设置被篡改的token
      userStore.token = tamperedToken
      userStore.isLogin = true
      
      // 验证token
      const validation = userStore.validateToken()
      
      expect(validation.valid).toBe(false)
      expect(validation.error).toBe('Invalid signature')
      expect(userStore.isLogin).toBe(false) // 应该自动登出
    })

    it('应该能够检测被篡改的头部', () => {
      // 创建一个有效的token
      const validToken = mockCrypto.generateJWT(
        { userId: '123', username: 'testuser' },
        'secret-key',
        3600
      )
      
      // 篡改头部
      const parts = validToken.split('.')
      const header = JSON.parse(atob(parts[0]))
      header.alg = 'none' // 篡改算法
      
      const tamperedToken = `${btoa(JSON.stringify(header))}.${parts[1]}.${parts[2]}`
      
      // 设置被篡改的token
      userStore.token = tamperedToken
      userStore.isLogin = true
      
      // 验证token
      const validation = userStore.validateToken()
      
      expect(validation.valid).toBe(false)
      expect(validation.error).toBe('Invalid signature')
      expect(userStore.isLogin).toBe(false) // 应该自动登出
    })
  })

  describe('登录过程中的Token验证', () => {
    it('应该能够拒绝服务器返回的无效token', async () => {
      // 模拟服务器返回无效token
      mockHttp.post.mockResolvedValue({
        data: {
          success: true,
          token: 'invalid-token-format',
          refreshToken: 'refresh-token',
          user: { id: '123', username: 'testuser' },
          expiresIn: 3600
        }
      })
      
      // 尝试登录
      const result = await userStore.login({
        username: 'testuser',
        password: 'password'
      })
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid token received from server')
      expect(userStore.isLogin).toBe(false)
    })

    it('应该能够接受服务器返回的有效token', async () => {
      // 生成有效的token
      const validToken = mockCrypto.generateJWT(
        { userId: '123', username: 'testuser' },
        'secret-key',
        3600
      )
      
      // 模拟服务器返回有效token
      mockHttp.post.mockResolvedValue({
        data: {
          success: true,
          token: validToken,
          refreshToken: 'refresh-token',
          user: { id: '123', username: 'testuser' },
          expiresIn: 3600
        }
      })
      
      // 尝试登录
      const result = await userStore.login({
        username: 'testuser',
        password: 'password'
      })
      
      expect(result.success).toBe(true)
      expect(userStore.isLogin).toBe(true)
      expect(userStore.token).toBe(validToken)
    })
  })

  describe('Token刷新过程中的验证', () => {
    it('应该能够拒绝刷新时返回的无效token', async () => {
      // 设置初始登录状态
      userStore.isLogin = true
      userStore.refreshToken = 'valid-refresh-token'
      
      // 模拟刷新token返回无效token
      mockHttp.post.mockResolvedValue({
        data: {
          success: true,
          token: 'invalid-token-format',
          expiresIn: 3600
        }
      })
      
      // 尝试刷新token
      const result = await userStore.refreshAccessToken()
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid token received from server')
    })

    it('应该能够接受刷新时返回的有效token', async () => {
      // 生成有效的token
      const validToken = mockCrypto.generateJWT(
        { userId: '123', username: 'testuser' },
        'secret-key',
        3600
      )
      
      // 设置初始登录状态
      userStore.isLogin = true
      userStore.refreshToken = 'valid-refresh-token'
      
      // 模拟刷新token返回有效token
      mockHttp.post.mockResolvedValue({
        data: {
          success: true,
          token: validToken,
          expiresIn: 3600
        }
      })
      
      // 尝试刷新token
      const result = await userStore.refreshAccessToken()
      
      expect(result.success).toBe(true)
      expect(userStore.token).toBe(validToken)
    })
  })

  describe('HTTP请求拦截器中的Token验证', () => {
    it('应该能够在请求拦截器中验证token', async () => {
      // 设置登录状态和有效token
      const validToken = mockCrypto.generateJWT(
        { userId: '123', username: 'testuser' },
        'secret-key',
        3600
      )
      
      userStore.isLogin = true
      userStore.token = validToken
      
      // 模拟请求配置
      const config = {
        url: '/api/protected/data',
        method: 'GET',
        headers: {}
      }
      
      // 调用请求拦截器
      const result = await interceptor.request.use()(config)
      
      expect(result.headers.Authorization).toBe(`Bearer ${validToken}`)
    })

    it('应该能够在请求拦截器中拒绝无效token', async () => {
      // 设置登录状态和无效token
      userStore.isLogin = true
      userStore.token = 'invalid-token-format'
      
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
        expect(error.message).toBe('Invalid token')
        expect(userStore.isLogin).toBe(false) // 应该自动登出
      }
    })
  })

  describe('localStorage恢复时的Token验证', () => {
    it('应该能够恢复有效的token', () => {
      // 生成有效的token
      const validToken = mockCrypto.generateJWT(
        { userId: '123', username: 'testuser' },
        'secret-key',
        3600
      )
      
      // 模拟localStorage中的状态
      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        token: validToken,
        refreshToken: 'refresh-token',
        tokenExpireTime: Date.now() + 3600000,
        user: { id: '123', username: 'testuser' }
      }))
      
      // 恢复状态
      userStore.restoreState()
      
      expect(userStore.isLogin).toBe(true)
      expect(userStore.token).toBe(validToken)
    })

    it('应该能够拒绝localStorage中的无效token', () => {
      // 模拟localStorage中的无效状态
      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        token: 'invalid-token-format',
        refreshToken: 'refresh-token',
        tokenExpireTime: Date.now() + 3600000,
        user: { id: '123', username: 'testuser' }
      }))
      
      // 恢复状态
      userStore.restoreState()
      
      expect(userStore.isLogin).toBe(false)
      expect(userStore.token).toBe('')
    })

    it('应该能够处理localStorage中的损坏数据', () => {
      // 模拟localStorage中的损坏数据
      localStorageMock.getItem.mockReturnValue('invalid-json')
      
      // 恢复状态
      userStore.restoreState()
      
      expect(userStore.isLogin).toBe(false)
      expect(userStore.token).toBe('')
    })
  })
})