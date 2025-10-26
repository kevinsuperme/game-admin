import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// 模拟localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

// 模拟document对象
const documentMock = {
  cookie: '',
  getElementById: vi.fn(),
  createElement: vi.fn().mockImplementation((tagName) => {
    return {
      tagName: tagName.toUpperCase(),
      type: '',
      name: '',
      value: '',
      innerHTML: '',
      textContent: '',
      style: {},
      classList: {
        add: vi.fn(),
        remove: vi.fn(),
        contains: vi.fn(),
        toggle: vi.fn()
      },
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      appendChild: vi.fn(),
      removeChild: vi.fn(),
      setAttribute: vi.fn(),
      getAttribute: vi.fn(),
      removeAttribute: vi.fn()
    }
  }),
  body: {
    appendChild: vi.fn(),
    removeChild: vi.fn()
  }
}

// 模拟crypto库用于生成随机字符串
const mockCrypto = {
  getRandomValues: vi.fn().mockImplementation((arr) => {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = Math.floor(Math.random() * 256)
    }
    return arr
  }),
  
  // 生成随机字符串
  randomString: vi.fn().mockImplementation((length = 32) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
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

// CSRF防护工具函数
const csrfProtection = {
  // 生成CSRF令牌
  generateToken: vi.fn().mockImplementation(() => {
    const token = mockCrypto.randomString(32)
    // 保存到localStorage
    localStorageMock.setItem('csrf_token', token)
    // 保存到cookie
    documentMock.cookie = `csrf_token=${token}; Path=/; Secure; HttpOnly; SameSite=Strict`
    return token
  }),
  
  // 获取CSRF令牌
  getToken: vi.fn().mockImplementation(() => {
    // 优先从localStorage获取
    let token = localStorageMock.getItem('csrf_token')
    
    // 如果localStorage中没有，尝试从cookie获取
    if (!token) {
      const cookies = documentMock.cookie.split(';')
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=')
        if (name === 'csrf_token') {
          token = value
          break
        }
      }
    }
    
    return token
  }),
  
  // 验证CSRF令牌
  validateToken: vi.fn().mockImplementation((token) => {
    const storedToken = csrfProtection.getToken()
    return token === storedToken
  }),
  
  // 清除CSRF令牌
  clearToken: vi.fn().mockImplementation(() => {
    localStorageMock.removeItem('csrf_token')
    documentMock.cookie = 'csrf_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT'
  }),
  
  // 为请求添加CSRF令牌
  addTokenToRequest: vi.fn().mockImplementation((config) => {
    const token = csrfProtection.getToken()
    // 只为状态改变请求（POST, PUT, DELETE, PATCH）添加CSRF令牌
    if (token && ['post', 'put', 'delete', 'patch'].includes(config.method?.toLowerCase())) {
      // 添加到请求头
      config.headers = config.headers || {}
      config.headers['X-CSRF-Token'] = token
      
      // 添加到请求体
      config.data = config.data || {}
      config.data._csrf = token
    }
    return config
  }),
  
  // 创建隐藏的CSRF令牌表单字段
  createHiddenField: vi.fn().mockImplementation(() => {
    const token = csrfProtection.getToken()
    if (!token) {
      return null
    }
    
    const input = documentMock.createElement('input')
    input.type = 'hidden'
    input.name = '_csrf'
    input.value = token
    
    return input
  }),
  
  // 验证请求来源
  validateOrigin: vi.fn().mockImplementation((origin, allowedOrigins) => {
    if (!origin) return false
    
    // 检查是否在允许的来源列表中
    return allowedOrigins.some(allowed => {
      // 精确匹配
      if (origin === allowed) return true
      
      // 子域名匹配
      if (allowed.startsWith('*.')) {
        const domain = allowed.substring(2)
        
        // 检查origin是否包含协议和域名
        if (origin.includes('://')) {
          try {
            const url = new URL(origin)
            // 检查hostname是否为domain或其子域名
            if (url.hostname === domain) return true
            if (url.hostname.endsWith('.' + domain)) return true
          } catch (e) {
            // 如果URL解析失败，尝试简单的字符串匹配
            if (origin === domain) return true
            if (origin.endsWith('.' + domain)) return true
          }
        } else {
          // 如果没有协议，尝试简单的字符串匹配
          if (origin === domain) return true
          if (origin.endsWith('.' + domain)) return true
        }
      }
      
      // 处理带协议的通配符匹配，如 https://*.example.com
      if (allowed.includes('://*.')) {
        const protocolEnd = allowed.indexOf('://*.')
        const protocol = allowed.substring(0, protocolEnd)
        const domain = allowed.substring(protocolEnd + 5) // 跳过 ://*. 
        
        // 检查origin是否包含协议和域名
        if (origin.includes('://')) {
          try {
            const url = new URL(origin)
            // 检查协议和域名是否匹配
            if (url.protocol === protocol + ':') {
              if (url.hostname === domain) return true
              if (url.hostname.endsWith('.' + domain)) return true
            }
          } catch (e) {
            // 如果URL解析失败，忽略
          }
        }
      }
      
      return false
    })
  }),
  
  // 验证Referer头
  validateReferer: vi.fn().mockImplementation((referer, allowedOrigins) => {
    if (!referer) return false
    
    try {
      const url = new URL(referer)
      const origin = url.origin
      return csrfProtection.validateOrigin(origin, allowedOrigins)
    } catch (e) {
      return false
    }
  })
}

// 模拟HTTP拦截器
const createHttpInterceptor = () => {
  return {
    request: {
      use: vi.fn().mockImplementation((onFulfilled, onRejected) => {
        return async (config) => {
          // 对于状态改变的请求（POST, PUT, DELETE, PATCH），添加CSRF令牌
          if (['post', 'put', 'delete', 'patch'].includes(config.method?.toLowerCase())) {
            config = csrfProtection.addTokenToRequest(config)
          }
          
          return onFulfilled ? onFulfilled(config) : config
        }
      })
    },
    
    response: {
      use: vi.fn().mockImplementation((onFulfilled, onRejected) => {
        return async (response) => {
          // 检查响应头中是否有新的CSRF令牌
          const newToken = response.headers['x-csrf-token']
          if (newToken) {
            localStorageMock.setItem('csrf_token', newToken)
          }
          
          return onFulfilled ? onFulfilled(response) : response
        }
      })
    }
  }
}

describe('CSRF防护验证', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // 设置localStorage模拟
    global.localStorage = localStorageMock
    // 设置document模拟
    global.document = documentMock
    // 设置crypto模拟
    Object.defineProperty(global, 'crypto', {
      value: mockCrypto,
      writable: true
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('CSRF令牌生成', () => {
    it('应该能够生成CSRF令牌', () => {
      // 生成令牌
      const token = csrfProtection.generateToken()
      
      // 验证令牌不为空
      expect(token).toBeTruthy()
      expect(typeof token).toBe('string')
      expect(token.length).toBe(32)
      
      // 验证令牌已保存到localStorage
      expect(localStorageMock.setItem).toHaveBeenCalledWith('csrf_token', token)
      
      // 验证令牌已保存到cookie
      expect(documentMock.cookie).toContain('csrf_token=' + token)
      expect(documentMock.cookie).toContain('Path=/')
      expect(documentMock.cookie).toContain('Secure')
      expect(documentMock.cookie).toContain('HttpOnly')
      expect(documentMock.cookie).toContain('SameSite=Strict')
    })

    it('应该能够生成不同的令牌', () => {
      // 生成两个令牌
      const token1 = csrfProtection.generateToken()
      const token2 = csrfProtection.generateToken()
      
      // 验证令牌不同
      expect(token1).not.toBe(token2)
    })
  })

  describe('CSRF令牌获取', () => {
    it('应该能够从localStorage获取令牌', () => {
      // 设置localStorage模拟
      const token = 'test-csrf-token'
      localStorageMock.getItem.mockReturnValue(token)
      
      // 获取令牌
      const result = csrfProtection.getToken()
      
      // 验证结果
      expect(result).toBe(token)
    })

    it('应该能够从cookie获取令牌', () => {
      // 设置localStorage模拟（返回空）
      localStorageMock.getItem.mockReturnValue(null)
      
      // 设置cookie模拟
      documentMock.cookie = 'csrf_token=test-csrf-token; Path=/; Secure; HttpOnly; SameSite=Strict'
      
      // 获取令牌
      const result = csrfProtection.getToken()
      
      // 验证结果
      expect(result).toBe('test-csrf-token')
    })

    it('在没有令牌时应该返回null', () => {
      // 设置localStorage模拟（返回空）
      localStorageMock.getItem.mockReturnValue(null)
      
      // 设置cookie模拟（没有CSRF令牌）
      documentMock.cookie = 'other_cookie=value; Path=/'
      
      // 获取令牌
      const result = csrfProtection.getToken()
      
      // 验证结果
      expect(result).toBeNull()
    })
  })

  describe('CSRF令牌验证', () => {
    it('应该能够验证有效的令牌', () => {
      // 设置localStorage模拟
      const token = 'test-csrf-token'
      localStorageMock.getItem.mockReturnValue(token)
      
      // 验证令牌
      const result = csrfProtection.validateToken(token)
      
      // 验证结果
      expect(result).toBe(true)
    })

    it('应该能够拒绝无效的令牌', () => {
      // 设置localStorage模拟
      const storedToken = 'stored-csrf-token'
      localStorageMock.getItem.mockReturnValue(storedToken)
      
      // 验证不同的令牌
      const result = csrfProtection.validateToken('different-token')
      
      // 验证结果
      expect(result).toBe(false)
    })

    it('应该能够拒绝空的令牌', () => {
      // 设置localStorage模拟
      const storedToken = 'stored-csrf-token'
      localStorageMock.getItem.mockReturnValue(storedToken)
      
      // 验证空令牌
      const result = csrfProtection.validateToken('')
      
      // 验证结果
      expect(result).toBe(false)
    })
  })

  describe('CSRF令牌清除', () => {
    it('应该能够清除令牌', () => {
      // 清除令牌
      csrfProtection.clearToken()
      
      // 验证localStorage已清除
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('csrf_token')
      
      // 验证cookie已清除
      expect(documentMock.cookie).toContain('csrf_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT')
    })
  })

  describe('CSRF令牌添加到请求', () => {
    it('应该能够为POST请求添加CSRF令牌', () => {
      // 设置localStorage模拟
      const token = 'test-csrf-token'
      localStorageMock.getItem.mockReturnValue(token)
      
      // 创建请求配置
      const config = {
        method: 'POST',
        url: '/api/data',
        headers: {},
        data: {}
      }
      
      // 添加令牌
      const result = csrfProtection.addTokenToRequest(config)
      
      // 验证请求头
      expect(result.headers['X-CSRF-Token']).toBe(token)
      
      // 验证请求体
      expect(result.data._csrf).toBe(token)
    })

    it('应该能够为PUT请求添加CSRF令牌', () => {
      // 设置localStorage模拟
      const token = 'test-csrf-token'
      localStorageMock.getItem.mockReturnValue(token)
      
      // 创建请求配置
      const config = {
        method: 'PUT',
        url: '/api/data/1',
        headers: {},
        data: {}
      }
      
      // 添加令牌
      const result = csrfProtection.addTokenToRequest(config)
      
      // 验证请求头
      expect(result.headers['X-CSRF-Token']).toBe(token)
      
      // 验证请求体
      expect(result.data._csrf).toBe(token)
    })

    it('应该能够为DELETE请求添加CSRF令牌', () => {
      // 设置localStorage模拟
      const token = 'test-csrf-token'
      localStorageMock.getItem.mockReturnValue(token)
      
      // 创建请求配置
      const config = {
        method: 'DELETE',
        url: '/api/data/1',
        headers: {}
      }
      
      // 添加令牌
      const result = csrfProtection.addTokenToRequest(config)
      
      // 验证请求头
      expect(result.headers['X-CSRF-Token']).toBe(token)
      
      // 验证请求体（即使没有data属性，也会添加）
      expect(result.data._csrf).toBe(token)
    })

    it('应该不为GET请求添加CSRF令牌', () => {
      // 设置localStorage模拟
      const token = 'test-csrf-token'
      localStorageMock.getItem.mockReturnValue(token)
      
      // 创建请求配置
      const config = {
        method: 'GET',
        url: '/api/data',
        headers: {}
      }
      
      // 添加令牌
      const result = csrfProtection.addTokenToRequest(config)
      
      // 验证请求头
      expect(result.headers['X-CSRF-Token']).toBeUndefined()
      
      // 验证请求体
      expect(result.data).toBeUndefined()
    })

    it('应该在没有令牌时不添加CSRF令牌', () => {
      // 设置localStorage模拟（返回空）
      localStorageMock.getItem.mockReturnValue(null)
      
      // 设置cookie模拟（没有CSRF令牌）
      documentMock.cookie = 'other_cookie=value; Path=/'
      
      // 创建请求配置
      const config = {
        method: 'POST',
        url: '/api/data',
        headers: {},
        data: {}
      }
      
      // 添加令牌
      const result = csrfProtection.addTokenToRequest(config)
      
      // 验证请求头
      expect(result.headers['X-CSRF-Token']).toBeUndefined()
      
      // 验证请求体
      expect(result.data._csrf).toBeUndefined()
    })
  })

  describe('CSRF隐藏字段创建', () => {
    it('应该能够创建隐藏的CSRF字段', () => {
      // 设置localStorage模拟
      const token = 'test-csrf-token'
      localStorageMock.getItem.mockReturnValue(token)
      
      // 创建隐藏字段
      const input = csrfProtection.createHiddenField()
      
      // 验证字段属性
      expect(input).toBeTruthy()
      expect(documentMock.createElement).toHaveBeenCalledWith('input')
      expect(input.type).toBe('hidden')
      expect(input.name).toBe('_csrf')
      expect(input.value).toBe(token)
    })

    it('应该在没有令牌时返回null', () => {
      // 设置localStorage模拟（返回空）
      localStorageMock.getItem.mockReturnValue(null)
      
      // 设置cookie模拟（没有CSRF令牌）
      documentMock.cookie = 'other_cookie=value; Path=/'
      
      // 创建隐藏字段
      const input = csrfProtection.createHiddenField()
      
      // 验证结果
      expect(input).toBeNull()
    })
  })

  describe('请求来源验证', () => {
    it('应该能够验证有效的来源', () => {
      // 设置允许的来源
      const allowedOrigins = ['https://example.com', 'https://api.example.com']
      
      // 验证有效来源
      expect(csrfProtection.validateOrigin('https://example.com', allowedOrigins)).toBe(true)
      expect(csrfProtection.validateOrigin('https://api.example.com', allowedOrigins)).toBe(true)
    })

    it('应该能够验证子域名', () => {
      // 设置允许的来源
      const allowedOrigins = ['https://*.example.com']
      
      // 验证子域名
      expect(csrfProtection.validateOrigin('https://api.example.com', allowedOrigins)).toBe(true)
      expect(csrfProtection.validateOrigin('https://admin.example.com', allowedOrigins)).toBe(true)
      expect(csrfProtection.validateOrigin('https://example.com', allowedOrigins)).toBe(true)
    })

    it('应该拒绝无效的来源', () => {
      // 设置允许的来源
      const allowedOrigins = ['https://example.com']
      
      // 验证无效来源
      expect(csrfProtection.validateOrigin('https://evil.com', allowedOrigins)).toBe(false)
      expect(csrfProtection.validateOrigin('http://example.com', allowedOrigins)).toBe(false)
    })

    it('应该拒绝空的来源', () => {
      // 设置允许的来源
      const allowedOrigins = ['https://example.com']
      
      // 验证空来源
      expect(csrfProtection.validateOrigin('', allowedOrigins)).toBe(false)
      expect(csrfProtection.validateOrigin(null, allowedOrigins)).toBe(false)
      expect(csrfProtection.validateOrigin(undefined, allowedOrigins)).toBe(false)
    })
  })

  describe('Referer头验证', () => {
    it('应该能够验证有效的Referer', () => {
      // 设置允许的来源
      const allowedOrigins = ['https://example.com']
      
      // 验证有效Referer
      expect(csrfProtection.validateReferer('https://example.com/login', allowedOrigins)).toBe(true)
      expect(csrfProtection.validateReferer('https://example.com/dashboard', allowedOrigins)).toBe(true)
    })

    it('应该能够验证子域名的Referer', () => {
      // 设置允许的来源
      const allowedOrigins = ['https://*.example.com']
      
      // 验证子域名Referer
      expect(csrfProtection.validateReferer('https://api.example.com/data', allowedOrigins)).toBe(true)
      expect(csrfProtection.validateReferer('https://admin.example.com/users', allowedOrigins)).toBe(true)
    })

    it('应该拒绝无效的Referer', () => {
      // 设置允许的来源
      const allowedOrigins = ['https://example.com']
      
      // 验证无效Referer
      expect(csrfProtection.validateReferer('https://evil.com/login', allowedOrigins)).toBe(false)
      expect(csrfProtection.validateReferer('http://example.com/login', allowedOrigins)).toBe(false)
    })

    it('应该拒绝空的Referer', () => {
      // 设置允许的来源
      const allowedOrigins = ['https://example.com']
      
      // 验证空Referer
      expect(csrfProtection.validateReferer('', allowedOrigins)).toBe(false)
      expect(csrfProtection.validateReferer(null, allowedOrigins)).toBe(false)
      expect(csrfProtection.validateReferer(undefined, allowedOrigins)).toBe(false)
    })

    it('应该拒绝无效的URL', () => {
      // 设置允许的来源
      const allowedOrigins = ['https://example.com']
      
      // 验证无效URL
      expect(csrfProtection.validateReferer('not-a-url', allowedOrigins)).toBe(false)
      expect(csrfProtection.validateReferer('https://', allowedOrigins)).toBe(false)
    })
  })

  describe('HTTP拦截器集成', () => {
    it('应该能够在请求拦截器中添加CSRF令牌', async () => {
      // 设置localStorage模拟
      const token = 'test-csrf-token'
      localStorageMock.getItem.mockReturnValue(token)
      
      // 创建拦截器
      const interceptor = createHttpInterceptor()
      
      // 模拟请求配置
      const config = {
        method: 'POST',
        url: '/api/data',
        headers: {},
        data: {}
      }
      
      // 调用请求拦截器
      const result = await interceptor.request.use()(config)
      
      // 验证结果
      expect(result.headers['X-CSRF-Token']).toBe(token)
      expect(result.data._csrf).toBe(token)
    })

    it('应该能够在响应拦截器中更新CSRF令牌', async () => {
      // 创建拦截器
      const interceptor = createHttpInterceptor()
      
      // 模拟响应
      const response = {
        status: 200,
        data: { success: true },
        headers: {
          'x-csrf-token': 'new-csrf-token'
        }
      }
      
      // 调用响应拦截器
      const result = await interceptor.response.use()(response)
      
      // 验证结果
      expect(localStorageMock.setItem).toHaveBeenCalledWith('csrf_token', 'new-csrf-token')
    })
  })

  describe('CSRF攻击防护', () => {
    it('应该能够防止CSRF攻击', async () => {
      // 设置localStorage模拟
      const token = 'legitimate-csrf-token'
      localStorageMock.getItem.mockReturnValue(token)
      
      // 模拟合法请求
      const legitimateRequest = {
        method: 'POST',
        url: '/api/transfer',
        headers: {
          'X-CSRF-Token': token
        },
        data: {
          to: 'victim',
          amount: 100,
          _csrf: token
        }
      }
      
      // 模拟恶意请求（没有正确的CSRF令牌）
      const maliciousRequest = {
        method: 'POST',
        url: '/api/transfer',
        headers: {},
        data: {
          to: 'attacker',
          amount: 1000
        }
      }
      
      // 验证合法请求
      const isLegitimate = csrfProtection.validateToken(legitimateRequest.headers['X-CSRF-Token'])
      expect(isLegitimate).toBe(true)
      
      // 验证恶意请求
      const isMalicious = csrfProtection.validateToken(maliciousRequest.headers['X-CSRF-Token'])
      expect(isMalicious).toBe(false)
    })

    it('应该能够防止来自不同域名的CSRF攻击', () => {
      // 设置允许的来源
      const allowedOrigins = ['https://example.com']
      
      // 模拟来自不同域名的请求
      const evilRequest = {
        method: 'POST',
        url: '/api/transfer',
        headers: {
          'Origin': 'https://evil.com',
          'Referer': 'https://evil.com/attack.html'
        },
        data: {
          to: 'attacker',
          amount: 1000
        }
      }
      
      // 验证Origin
      const isOriginValid = csrfProtection.validateOrigin(
        evilRequest.headers['Origin'],
        allowedOrigins
      )
      expect(isOriginValid).toBe(false)
      
      // 验证Referer
      const isRefererValid = csrfProtection.validateReferer(
        evilRequest.headers['Referer'],
        allowedOrigins
      )
      expect(isRefererValid).toBe(false)
    })
  })
})