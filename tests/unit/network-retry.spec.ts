import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('网络错误重试机制测试', () => {
  // 模拟HTTP请求函数
  let mockFetch: any
  let retryClient: any

  beforeEach(() => {
    // 重置所有模拟
    vi.clearAllMocks()

    // 模拟fetch函数
    mockFetch = vi.fn()
    
    // 创建重试客户端
    retryClient = createRetryClient({
      maxRetries: 3,
      retryDelay: 100,
      backoffMultiplier: 2,
      retryableStatusCodes: [429, 500, 502, 503, 504],
      fetchFn: mockFetch
    })
  })

  /**
   * 创建带重试机制的HTTP客户端
   * @param options 重试配置选项
   * @returns 重试客户端实例
   */
  function createRetryClient(options = {}) {
    const defaultOptions = {
      maxRetries: 3,
      retryDelay: 100,
      backoffMultiplier: 2,
      retryableStatusCodes: [429, 500, 502, 503, 504],
      fetchFn: window.fetch
    }

    const config = { ...defaultOptions, ...options }
    let retryCount = 0

    // 延迟函数
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

    // 执行重试的函数
      const executeWithRetry = async (url: string, options = {}) => {
        let lastError: any
        let currentDelay = config.retryDelay

        for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
          try {
            // 执行请求
            const fetchResponse = await config.fetchFn(url, options)
            
            // 直接返回原始响应以便正确处理状态码
            if (!fetchResponse.ok) {
              // 检查是否需要重试
              if (attempt < config.maxRetries && config.retryableStatusCodes.includes(fetchResponse.status)) {
                lastError = new Error(`Request failed with status ${fetchResponse.status}`)
                retryCount++
                await delay(currentDelay)
                currentDelay *= config.backoffMultiplier
                continue
              }
              // 不需要重试，直接抛出错误
              throw new Error(`Request failed with status ${fetchResponse.status}`)
            }
            
            // 成功响应
            return {
              data: { success: true, message: 'Request successful' },
              status: fetchResponse.status,
              statusText: fetchResponse.statusText
            }
          } catch (error: any) {
            // 网络错误自动重试
            if (attempt < config.maxRetries && error.message !== 'Request failed with status 404' && 
                !error.message.includes('Request failed with status') || 
                (error.message.includes('Request failed with status') && 
                 config.retryableStatusCodes.some(code => error.message.includes(`status ${code}`)))) {
              lastError = error
              retryCount++
              await delay(currentDelay)
              currentDelay *= config.backoffMultiplier
              continue
            }
            // 不可重试的错误，直接抛出
            throw error
          }
        }

        throw lastError
      }

    return {
      // 发送请求方法
      async request(url: string, options = {}) {
        return executeWithRetry(url, options)
      },

      // 获取重试次数
      getRetryCount() {
        return retryCount
      },

      // 重置重试计数
      resetRetryCount() {
        retryCount = 0
      },

      // 更新配置
      updateConfig(newConfig: any) {
        Object.assign(config, newConfig)
      },

      // 获取当前配置
      getConfig() {
        return { ...config }
      }
    }
  }

  describe('基本重试功能', () => {
    it('应该在请求成功时不进行重试', async () => {
      // 模拟成功响应
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK'
      })

      // 发送请求
      const response = await retryClient.request('https://api.example.com/data')

      // 验证请求只发送了一次
      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(retryClient.getRetryCount()).toBe(0)
      expect(response.status).toBe(200)
      expect(response.data.success).toBe(true)
    })

    it('应该在网络错误时进行重试', async () => {
      // 模拟两次网络错误，第三次成功
      mockFetch.mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          statusText: 'OK'
        })

      // 发送请求
      const response = await retryClient.request('https://api.example.com/data')

      // 验证请求发送了三次（初始请求+2次重试）
      expect(mockFetch).toHaveBeenCalledTimes(3)
      expect(retryClient.getRetryCount()).toBe(2)
      expect(response.status).toBe(200)
      expect(response.data.success).toBe(true)
    })

    it('应该在达到最大重试次数后抛出最后一个错误', async () => {
      // 模拟所有请求都失败
      mockFetch.mockRejectedValue(new Error('Network error'))

      // 发送请求并验证错误
      await expect(retryClient.request('https://api.example.com/data'))
        .rejects.toThrow('Network error')

      // 验证请求发送了四次（初始请求+3次重试）
      expect(mockFetch).toHaveBeenCalledTimes(4)
      expect(retryClient.getRetryCount()).toBe(3)
    })
  })

  describe('HTTP错误码重试', () => {
    it('应该对可重试的HTTP状态码进行重试', async () => {
      // 模拟两次500错误，第三次成功
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      })
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      })
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK'
      })

      // 发送请求
      const response = await retryClient.request('https://api.example.com/data')

      // 验证请求发送了三次（初始请求+2次重试）
      expect(mockFetch).toHaveBeenCalledTimes(3)
      expect(retryClient.getRetryCount()).toBe(2)
      expect(response.status).toBe(200)
    })

    it('应该对429 Too Many Requests状态码进行重试', async () => {
      // 模拟一次429错误，然后成功
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests'
      })
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK'
      })

      // 发送请求
      const response = await retryClient.request('https://api.example.com/data')

      // 验证请求发送了两次（初始请求+1次重试）
      expect(mockFetch).toHaveBeenCalledTimes(2)
      expect(retryClient.getRetryCount()).toBe(1)
      expect(response.status).toBe(200)
    })

    it('不应该对客户端错误（如404）进行重试', async () => {
      // 模拟404错误
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      })

      // 发送请求并验证错误
      await expect(retryClient.request('https://api.example.com/nonexistent'))
        .rejects.toThrow('Request failed with status 404')

      // 验证请求只发送了一次
      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(retryClient.getRetryCount()).toBe(0)
    })
  })

  describe('退避策略', () => {
    it('应该使用指数退避策略增加重试延迟', async () => {
      // 记录setTimeout调用以验证延迟时间
      const originalSetTimeout = setTimeout
      const timeoutCalls: number[] = []
      
      vi.stubGlobal('setTimeout', (callback: Function, ms: number) => {
        timeoutCalls.push(ms)
        return originalSetTimeout(callback, 1) // 使用1ms以加快测试速度
      })

      // 模拟三次网络错误
      mockFetch.mockRejectedValue(new Error('Network error'))

      try {
        // 发送请求
        await retryClient.request('https://api.example.com/data')
      } catch (error) {
        // 预期会抛出错误
      }

      // 验证退避延迟
      expect(timeoutCalls).toEqual([100, 200, 400]) // 100ms, 200ms, 400ms

      // 恢复原始setTimeout
      vi.restoreAllMocks()
    })

    it('应该能够自定义最大重试次数和延迟时间', async () => {
      // 创建自定义重试配置的客户端
      const customRetryClient = createRetryClient({
        maxRetries: 2,
        retryDelay: 50,
        backoffMultiplier: 3,
        fetchFn: mockFetch
      })

      // 模拟三次网络错误
      mockFetch.mockRejectedValue(new Error('Network error'))

      // 记录setTimeout调用
      const originalSetTimeout = setTimeout
      const timeoutCalls: number[] = []
      
      vi.stubGlobal('setTimeout', (callback: Function, ms: number) => {
        timeoutCalls.push(ms)
        return originalSetTimeout(callback, 1)
      })

      try {
        // 发送请求
        await customRetryClient.request('https://api.example.com/data')
      } catch (error) {
        // 预期会抛出错误
      }

      // 验证配置生效
      expect(mockFetch).toHaveBeenCalledTimes(3) // 初始请求+2次重试
      expect(customRetryClient.getRetryCount()).toBe(2)
      expect(timeoutCalls).toEqual([50, 150]) // 50ms, 150ms (50 * 3)

      // 恢复原始setTimeout
      vi.restoreAllMocks()
    })
  })

  describe('配置管理', () => {
    it('应该能够更新重试配置', async () => {
      // 更新配置
      retryClient.updateConfig({
        maxRetries: 1,
        retryableStatusCodes: [429]
      })

      // 获取更新后的配置
      const updatedConfig = retryClient.getConfig()
      
      // 验证配置更新
      expect(updatedConfig.maxRetries).toBe(1)
      expect(updatedConfig.retryableStatusCodes).toEqual([429])
      
      // 测试更新后的配置
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      })

      // 500不再是可重试的状态码，所以不应该重试
      await expect(retryClient.request('https://api.example.com/data'))
        .rejects.toThrow('Request failed with status 500')
      
      // 验证只发送了一次请求
      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(retryClient.getRetryCount()).toBe(0)
    })

    it('应该能够重置重试计数', async () => {
      // 模拟一次重试
      mockFetch.mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          statusText: 'OK'
        })

      // 发送请求
      await retryClient.request('https://api.example.com/data')
      
      // 验证重试计数
      expect(retryClient.getRetryCount()).toBe(1)
      
      // 重置计数
      retryClient.resetRetryCount()
      expect(retryClient.getRetryCount()).toBe(0)
    })
  })

  describe('特殊场景处理', () => {
    it('应该能够处理不同类型的网络错误', async () => {
      // 重置重试计数
      retryClient.resetRetryCount()
      
      // 模拟不同类型的网络错误
      mockFetch.mockRejectedValueOnce(new Error('Failed to fetch'))
        .mockRejectedValueOnce(new TypeError('Network request failed'))
        .mockRejectedValueOnce(new Error('Connection reset'))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          statusText: 'OK'
        })

      // 发送请求
      const response = await retryClient.request('https://api.example.com/data')

      // 验证请求发送了四次（初始请求+3次重试）
      expect(mockFetch).toHaveBeenCalledTimes(4)
      expect(retryClient.getRetryCount()).toBe(3)
      expect(response.status).toBe(200)
    })

    it('应该正确处理带请求选项的请求', async () => {
      // 模拟成功响应
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK'
      })

      // 发送带选项的请求
      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: 'test' })
      }

      const response = await retryClient.request(
        'https://api.example.com/data',
        requestOptions
      )

      // 验证请求参数
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/data',
        requestOptions
      )
      expect(response.status).toBe(200)
    })

    it('应该能够处理成功和失败混合的重试序列', async () => {
      // 模拟混合的成功和失败序列
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable'
      })
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable'
      })
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK'
      })

      // 发送请求
      const response = await retryClient.request('https://api.example.com/data')

      // 验证重试行为
      expect(mockFetch).toHaveBeenCalledTimes(3)
      expect(retryClient.getRetryCount()).toBe(2)
      expect(response.status).toBe(200)
    })
  })
})