import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'

describe('HTTP请求响应时间性能测试', () => {
  // 模拟HTTP请求函数和性能测量
  let mockFetch: any
  let performanceClient: any
  let originalPerformance: any

  beforeEach(() => {
    // 保存原始performance对象
    originalPerformance = global.performance
    
    // 模拟performance对象用于测量时间
    global.performance = {
      now: vi.fn(),
      mark: vi.fn(),
      measure: vi.fn(),
      getEntriesByName: vi.fn(),
      clearMarks: vi.fn(),
      clearMeasures: vi.fn()
    }

    // 重置所有模拟
    vi.clearAllMocks()

    // 模拟fetch函数
    mockFetch = vi.fn()
    
    // 创建性能测量客户端
    performanceClient = createPerformanceClient({
      fetchFn: mockFetch,
      performance: global.performance
    })
  })

  afterEach(() => {
    // 恢复原始performance对象
    global.performance = originalPerformance
  })

  /**
   * 创建带性能测量功能的HTTP客户端
   * @param options 配置选项
   * @returns 性能测量客户端实例
   */
  function createPerformanceClient(options = {}) {
    const defaultOptions = {
      fetchFn: window.fetch,
      performance: window.performance,
      requestTimeout: 30000, // 30秒超时
      slowRequestThreshold: 1000, // 1秒作为慢请求阈值
      trackDetailedMetrics: true, // 是否跟踪详细指标
      maxConcurrentRequests: 10 // 最大并发请求数
    }

    const config = { ...defaultOptions, ...options }
    const metricsStore: any[] = []
    let activeRequests = 0

    /**
     * 发送请求并测量性能
     * @param url 请求URL
     * @param options 请求选项
     * @param identifier 可选的请求标识符
     * @returns 响应对象
     */
    async function sendRequest(url: string, options = {}, identifier?: string) {
      // 检查并发请求限制
      if (activeRequests >= config.maxConcurrentRequests) {
        throw new Error(`Concurrent request limit exceeded: ${config.maxConcurrentRequests}`)
      }

      // 生成请求ID
      const requestId = identifier || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // 开始时间
      const startTime = config.performance.now()
      
      // 标记开始
      if (config.trackDetailedMetrics) {
        config.performance.mark(`${requestId}_start`)
      }

      activeRequests++
      
      try {
        // 发送请求
        const response = await Promise.race([
          config.fetchFn(url, options),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), config.requestTimeout)
          )
        ])

        // 结束时间
        const endTime = config.performance.now()
        
        // 标记结束
        if (config.trackDetailedMetrics) {
          config.performance.mark(`${requestId}_end`)
          config.performance.measure(requestId, `${requestId}_start`, `${requestId}_end`)
        }

        // 计算响应时间
        const responseTime = endTime - startTime
        const isSlowRequest = responseTime > config.slowRequestThreshold

        // 存储性能指标
        const metrics = {
          requestId,
          url,
          method: options.method || 'GET',
          startTime: Math.floor(startTime),
          endTime: Math.floor(endTime),
          responseTime: Math.round(responseTime),
          isSlowRequest,
          status: response.status || null,
          timestamp: new Date().toISOString()
        }

        metricsStore.push(metrics)

        // 返回增强的响应对象
        return {
          ...response,
          performance: {
            responseTime,
            isSlowRequest,
            requestId
          }
        }
      } catch (error) {
        // 错误时也记录性能
        const endTime = config.performance.now()
        const responseTime = endTime - startTime

        // 存储错误指标
        const errorMetrics = {
          requestId,
          url,
          method: options.method || 'GET',
          startTime: Math.floor(startTime),
          endTime: Math.floor(endTime),
          responseTime: Math.round(responseTime),
          isError: true,
          error: error.message,
          timestamp: new Date().toISOString()
        }

        metricsStore.push(errorMetrics)
        throw error
      } finally {
        // 清理标记
        if (config.trackDetailedMetrics) {
          config.performance.clearMarks(`${requestId}_start`)
          config.performance.clearMarks(`${requestId}_end`)
        }
        activeRequests--
      }
    }

    return {
      // 发送GET请求
      async get(url: string, options = {}, identifier?: string) {
        return sendRequest(url, { ...options, method: 'GET' }, identifier)
      },

      // 发送POST请求
      async post(url: string, data?: any, options = {}, identifier?: string) {
        return sendRequest(url, {
          ...options,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...options.headers
          },
          body: JSON.stringify(data)
        }, identifier)
      },

      // 获取所有性能指标
      getMetrics() {
        return [...metricsStore]
      },

      // 获取特定请求的指标
      getMetricsById(requestId: string) {
        return metricsStore.find(metrics => metrics.requestId === requestId)
      },

      // 获取慢请求
      getSlowRequests() {
        return metricsStore.filter(metrics => metrics.isSlowRequest)
      },

      // 获取错误请求
      getErrorRequests() {
        return metricsStore.filter(metrics => metrics.isError)
      },

      // 计算平均响应时间
      getAverageResponseTime() {
        const validMetrics = metricsStore.filter(m => !m.isError)
        if (validMetrics.length === 0) return 0
        
        const totalTime = validMetrics.reduce((sum, metrics) => sum + metrics.responseTime, 0)
        return Math.round(totalTime / validMetrics.length)
      },

      // 计算响应时间百分位数
      getResponseTimePercentile(percentile: number) {
        const validMetrics = metricsStore.filter(m => !m.isError)
        if (validMetrics.length === 0) return 0
        
        const sortedTimes = validMetrics.map(m => m.responseTime).sort((a, b) => a - b)
        const index = Math.ceil((percentile / 100) * sortedTimes.length) - 1
        return sortedTimes[Math.max(0, index)]
      },

      // 重置指标存储
      resetMetrics() {
        metricsStore.length = 0
      },

      // 获取当前活动请求数
      getActiveRequests() {
        return activeRequests
      },

      // 更新配置
      updateConfig(newConfig: any) {
        Object.assign(config, newConfig)
      },

      // 获取配置
      getConfig() {
        return { ...config }
      }
    }
  }

  describe('基本响应时间测量', () => {
    it('应该正确测量请求的响应时间', async () => {
      // 模拟时间测量
      global.performance.now.mockReturnValueOnce(1000) // 开始时间

      // 模拟成功响应
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK'
      })

      // 模拟结束时间（模拟500ms响应时间）
      global.performance.now.mockReturnValueOnce(1500) // 结束时间

      // 发送请求
      const response = await performanceClient.get('https://api.example.com/data')

      // 验证响应包含性能指标
      expect(response.performance).toBeDefined()
      expect(response.performance.responseTime).toBe(500)
      expect(response.performance.isSlowRequest).toBe(false)
      expect(response.performance.requestId).toBeDefined()

      // 验证指标存储
      const metrics = performanceClient.getMetrics()
      expect(metrics.length).toBe(1)
      expect(metrics[0].responseTime).toBe(500)
      expect(metrics[0].url).toBe('https://api.example.com/data')
      expect(metrics[0].method).toBe('GET')
    })

    it('应该能够通过标识符跟踪特定请求', async () => {
      // 模拟时间
      global.performance.now.mockReturnValueOnce(1000)
      global.performance.now.mockReturnValueOnce(1200)

      // 模拟响应
      mockFetch.mockResolvedValueOnce({ status: 200 })

      // 带标识符发送请求
      const requestId = 'test-request-001'
      await performanceClient.get('https://api.example.com/data', {}, requestId)

      // 通过ID获取指标
      const metrics = performanceClient.getMetricsById(requestId)
      expect(metrics).toBeDefined()
      expect(metrics.requestId).toBe(requestId)
      expect(metrics.responseTime).toBe(200)
    })

    it('应该能够测量POST请求的响应时间', async () => {
      // 模拟时间
      global.performance.now.mockReturnValueOnce(1000)
      global.performance.now.mockReturnValueOnce(1300)

      // 模拟响应
      mockFetch.mockResolvedValueOnce({ status: 201 })

      // 发送POST请求
      const response = await performanceClient.post(
        'https://api.example.com/data',
        { name: 'test' }
      )

      // 验证性能指标
      expect(response.performance.responseTime).toBe(300)
      
      // 验证指标存储
      const metrics = performanceClient.getMetrics()
      expect(metrics[0].method).toBe('POST')
      expect(metrics[0].status).toBe(201)
    })
  })

  describe('慢请求检测', () => {
    it('应该正确识别慢请求', async () => {
      // 配置慢请求阈值为500ms
      performanceClient.updateConfig({ slowRequestThreshold: 500 })

      // 模拟600ms响应时间
      global.performance.now.mockReturnValueOnce(1000)
      global.performance.now.mockReturnValueOnce(1600)

      mockFetch.mockResolvedValueOnce({ status: 200 })

      // 发送请求
      const response = await performanceClient.get('https://api.example.com/slow-endpoint')

      // 验证慢请求标记
      expect(response.performance.isSlowRequest).toBe(true)
      
      // 验证慢请求获取
      const slowRequests = performanceClient.getSlowRequests()
      expect(slowRequests.length).toBe(1)
      expect(slowRequests[0].responseTime).toBe(600)
    })

    it('应该能够自定义慢请求阈值', async () => {
      // 配置更低的慢请求阈值
      performanceClient.updateConfig({ slowRequestThreshold: 200 })

      // 模拟250ms响应时间
      global.performance.now.mockReturnValueOnce(1000)
      global.performance.now.mockReturnValueOnce(1250)

      mockFetch.mockResolvedValueOnce({ status: 200 })

      // 发送请求
      const response = await performanceClient.get('https://api.example.com/endpoint')

      // 验证这被标记为慢请求
      expect(response.performance.isSlowRequest).toBe(true)
      
      // 修改阈值使其不再是慢请求
      performanceClient.updateConfig({ slowRequestThreshold: 300 })
      
      // 重新发送请求
      global.performance.now.mockReturnValueOnce(1500)
      global.performance.now.mockReturnValueOnce(1750)
      mockFetch.mockResolvedValueOnce({ status: 200 })
      
      const response2 = await performanceClient.get('https://api.example.com/endpoint')
      
      // 这次不应该被标记为慢请求
      expect(response2.performance.isSlowRequest).toBe(false)
    })
  })

  describe('统计指标计算', () => {
    beforeEach(async () => {
      // 模拟多个请求的响应时间
      const responseTimes = [100, 200, 300, 400, 500]
      
      for (let i = 0; i < responseTimes.length; i++) {
        const startTime = 1000 + i * 1000
        const endTime = startTime + responseTimes[i]
        
        global.performance.now.mockReturnValueOnce(startTime)
        mockFetch.mockResolvedValueOnce({ status: 200 })
        global.performance.now.mockReturnValueOnce(endTime)
        
        await performanceClient.get(`https://api.example.com/endpoint-${i}`)
      }
      
      // 添加一个错误请求
      global.performance.now.mockReturnValueOnce(6000)
      mockFetch.mockRejectedValueOnce(new Error('Network error'))
      global.performance.now.mockReturnValueOnce(6100)
      
      try {
        await performanceClient.get('https://api.example.com/error-endpoint')
      } catch (error) {
        // 预期会抛出错误
      }
    })

    it('应该正确计算平均响应时间', () => {
      // 有效请求的平均时间：(100 + 200 + 300 + 400 + 500) / 5 = 300
      const avgTime = performanceClient.getAverageResponseTime()
      expect(avgTime).toBe(300)
    })

    it('应该正确计算响应时间百分位数', () => {
      // 排序后的响应时间：[100, 200, 300, 400, 500]
      
      // 50% 百分位数 (中位数) 应该是 300
      expect(performanceClient.getResponseTimePercentile(50)).toBe(300)
      
      // 90% 百分位数应该是 500
      expect(performanceClient.getResponseTimePercentile(90)).toBe(500)
      
      // 10% 百分位数应该是 100
      expect(performanceClient.getResponseTimePercentile(10)).toBe(100)
    })

    it('应该能够获取错误请求', () => {
      const errorRequests = performanceClient.getErrorRequests()
      expect(errorRequests.length).toBe(1)
      expect(errorRequests[0].isError).toBe(true)
      expect(errorRequests[0].error).toBe('Network error')
    })

    it('应该能够重置所有指标', () => {
      expect(performanceClient.getMetrics().length).toBe(6) // 5个成功 + 1个错误
      
      performanceClient.resetMetrics()
      expect(performanceClient.getMetrics().length).toBe(0)
      expect(performanceClient.getAverageResponseTime()).toBe(0)
    })
  })

  describe('并发请求控制', () => {
    it('应该限制并发请求数量', async () => {
      // 设置较低的并发限制
      performanceClient.updateConfig({ maxConcurrentRequests: 2 })
      
      // 模拟时间
      global.performance.now.mockReturnValue(1000)
      
      // 创建模拟响应，返回Promise但不resolve，保持请求活跃
      const pendingPromise = new Promise(() => {}) // 永远不会resolve
      mockFetch.mockReturnValue(pendingPromise)
      
      // 发送两个请求，应该都成功
      const promise1 = performanceClient.get('https://api.example.com/endpoint1')
      const promise2 = performanceClient.get('https://api.example.com/endpoint2')
      
      // 验证活跃请求数
      expect(performanceClient.getActiveRequests()).toBe(2)
      
      // 尝试发送第三个请求，应该失败
      await expect(performanceClient.get('https://api.example.com/endpoint3'))
        .rejects.toThrow('Concurrent request limit exceeded: 2')
      
      // 注意：我们没有等待promise1和promise2完成，因为它们是故意不resolve的
    })

    it('应该能够更新并发请求限制', () => {
      // 默认限制
      expect(performanceClient.getConfig().maxConcurrentRequests).toBe(10)
      
      // 更新限制
      performanceClient.updateConfig({ maxConcurrentRequests: 5 })
      expect(performanceClient.getConfig().maxConcurrentRequests).toBe(5)
    })
  })

  describe('请求超时处理', () => {
    it('应该在请求超时时抛出错误', async () => {
      // 设置短超时
      performanceClient.updateConfig({ requestTimeout: 50 })
      
      // 模拟时间
      global.performance.now.mockReturnValue(1000)
      
      // 模拟永远挂起的请求
      const pendingPromise = new Promise(() => {}) // 永远不会resolve
      mockFetch.mockReturnValue(pendingPromise)
      
      // 等待超时
      await expect(performanceClient.get('https://api.example.com/endpoint'))
        .rejects.toThrow('Request timeout')
    })

    it('应该为超时请求记录性能指标', async () => {
      // 设置短超时
      performanceClient.updateConfig({ requestTimeout: 50 })
      
      // 模拟时间
      global.performance.now.mockReturnValueOnce(1000) // 开始
      
      // 模拟永远挂起的请求
      const pendingPromise = new Promise(() => {}) // 永远不会resolve
      mockFetch.mockReturnValue(pendingPromise)
      
      try {
        await performanceClient.get('https://api.example.com/endpoint')
      } catch (error) {
        // 预期会抛出错误
        const metrics = performanceClient.getErrorRequests()
        expect(metrics.length).toBe(1)
        expect(metrics[0].error).toBe('Request timeout')
      }
    })
  })

  describe('特殊场景处理', () => {
    it('应该正确处理错误响应', async () => {
      // 模拟时间
      global.performance.now.mockReturnValueOnce(1000)
      global.performance.now.mockReturnValueOnce(1200)
      
      // 模拟错误响应
      mockFetch.mockRejectedValueOnce(new Error('Network error'))
      
      // 发送请求
      await expect(performanceClient.get('https://api.example.com/error'))
        .rejects.toThrow('Network error')
      
      // 验证错误指标
      const errorMetrics = performanceClient.getErrorRequests()
      expect(errorMetrics.length).toBe(1)
      expect(errorMetrics[0].isError).toBe(true)
      expect(errorMetrics[0].error).toBe('Network error')
      expect(errorMetrics[0].responseTime).toBe(200)
    })

    it('应该能够处理带自定义选项的请求', async () => {
      // 模拟时间
      global.performance.now.mockReturnValueOnce(1000)
      global.performance.now.mockReturnValueOnce(1300)
      
      // 模拟响应
      mockFetch.mockResolvedValueOnce({ status: 200 })
      
      // 带自定义选项的请求
      const customOptions = {
        headers: {
          'Authorization': 'Bearer token123',
          'X-Custom-Header': 'test-value'
        },
        mode: 'cors'
      }
      
      const response = await performanceClient.get(
        'https://api.example.com/protected',
        customOptions
      )
      
      // 验证性能指标
      expect(response.performance.responseTime).toBe(300)
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/protected',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer token123',
            'X-Custom-Header': 'test-value'
          }),
          mode: 'cors'
        })
      )
    })

    it('应该能够禁用详细指标跟踪', async () => {
      // 创建禁用详细跟踪的客户端
      const simpleClient = createPerformanceClient({
        fetchFn: mockFetch,
        performance: global.performance,
        trackDetailedMetrics: false
      })
      
      // 模拟时间
      global.performance.now.mockReturnValueOnce(1000)
      global.performance.now.mockReturnValueOnce(1100)
      
      // 模拟响应
      mockFetch.mockResolvedValueOnce({ status: 200 })
      
      // 发送请求
      await simpleClient.get('https://api.example.com/data')
      
      // 验证没有调用mark和measure方法
      expect(global.performance.mark).not.toHaveBeenCalled()
      expect(global.performance.measure).not.toHaveBeenCalled()
      
      // 但仍应该有基本指标
      const metrics = simpleClient.getMetrics()
      expect(metrics.length).toBe(1)
      expect(metrics[0].responseTime).toBe(100)
    })
  })
})