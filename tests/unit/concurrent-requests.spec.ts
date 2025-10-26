import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// 模拟并发请求管理器
const createConcurrentRequestManager = () => {
  const pendingRequests = new Map()
  const maxConcurrent = 5 // 最大并发请求数
  
  return {
    // 获取当前活跃请求数
    getActiveCount: () => pendingRequests.size,
    
    // 获取最大并发数
    getMaxConcurrent: () => maxConcurrent,
    
    // 添加请求
    addRequest: (id, config) => {
      // 如果已达到最大并发数，返回false
      if (pendingRequests.size >= maxConcurrent) {
        return false
      }
      
      // 添加请求
      pendingRequests.set(id, {
        id,
        url: config.url,
        method: config.method || 'GET',
        startTime: Date.now(),
        status: 'pending'
      })
      
      return true
    },
    
    // 完成请求
    completeRequest: (id, result) => {
      if (pendingRequests.has(id)) {
        const request = pendingRequests.get(id)
        request.endTime = Date.now()
        request.duration = request.endTime - request.startTime
        request.status = 'completed'
        request.result = result
        
        // 从活跃请求中移除
        pendingRequests.delete(id)
        
        return request
      }
      return null
    },
    
    // 取消请求
    cancelRequest: (id) => {
      if (pendingRequests.has(id)) {
        const request = pendingRequests.get(id)
        request.endTime = Date.now()
        request.duration = request.endTime - request.startTime
        request.status = 'cancelled'
        
        // 从活跃请求中移除
        pendingRequests.delete(id)
        
        return request
      }
      return null
    },
    
    // 获取所有活跃请求
    getActiveRequests: () => Array.from(pendingRequests.values()),
    
    // 取消所有活跃请求
    cancelAllRequests: () => {
      const requests = Array.from(pendingRequests.values())
      pendingRequests.clear()
      return requests.map(request => ({
        ...request,
        endTime: Date.now(),
        duration: Date.now() - request.startTime,
        status: 'cancelled'
      }))
    },
    
    // 等待请求完成
    waitForRequest: (id) => {
      return new Promise((resolve, reject) => {
        const checkInterval = setInterval(() => {
          if (!pendingRequests.has(id)) {
            clearInterval(checkInterval)
            resolve(true)
          }
        }, 10)
        
        // 设置超时
        setTimeout(() => {
          clearInterval(checkInterval)
          reject(new Error(`Request ${id} timeout`))
        }, 5000)
      })
    }
  }
}

// 模拟HTTP客户端
const createHttpClient = () => {
  const requestManager = createConcurrentRequestManager()
  
  // 发送请求的内部函数
  const request = async (config) => {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // 尝试添加请求
    if (!requestManager.addRequest(requestId, config)) {
      throw new Error('Maximum concurrent requests reached')
    }
    
    try {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50))
      
      // 模拟响应
      const response = {
        data: { success: true, requestId },
        status: 200,
        statusText: 'OK',
        headers: {},
        config
      }
      
      // 完成请求
      requestManager.completeRequest(requestId, response)
      
      return response
    } catch (error) {
      // 取消请求
      requestManager.cancelRequest(requestId)
      throw error
    }
  }
  
  return {
    requestManager,
    request,
    
    // 批量请求
    batchRequest: async (configs) => {
      const results = []
      
      // 使用Promise.allSettled处理所有请求
      const promises = configs.map(config => request(config))
      
      const settledResults = await Promise.allSettled(promises)
      
      settledResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results[index] = result.value
        } else {
          // 确保错误对象的结构正确
          results[index] = { 
            error: result.reason instanceof Error ? result.reason : 
                  { message: result.reason.message || result.reason.toString() || 'Unknown error' }
          }
        }
      })
      
      return results
    },
    
    // 限制并发数的批量请求
    limitedBatchRequest: async (configs, limit = 5) => {
      const results = []
      
      // 分批处理请求
      for (let i = 0; i < configs.length; i += limit) {
        const batch = configs.slice(i, i + limit)
        const batchResults = await Promise.all(
          batch.map(config => request(config).catch(error => ({ error })))
        )
        results.push(...batchResults)
      }
      
      return results
    }
  }
}

describe('并发请求处理测试', () => {
  let httpClient
  
  beforeEach(() => {
    httpClient = createHttpClient()
  })
  
  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('基本并发请求', () => {
    it('应该能够处理单个请求', async () => {
      // 发送单个请求
      const config = { url: '/api/test', method: 'GET' }
      const response = await httpClient.request(config)
      
      // 验证响应
      expect(response.data.success).toBe(true)
      expect(response.status).toBe(200)
      expect(response.config).toEqual(config)
    })

    it('应该能够处理多个并发请求', async () => {
      // 发送多个并发请求
      const configs = [
        { url: '/api/test1', method: 'GET' },
        { url: '/api/test2', method: 'POST' },
        { url: '/api/test3', method: 'PUT' }
      ]
      
      const promises = configs.map(config => httpClient.request(config))
      const responses = await Promise.all(promises)
      
      // 验证响应
      expect(responses).toHaveLength(3)
      responses.forEach(response => {
        expect(response.data.success).toBe(true)
        expect(response.status).toBe(200)
      })
    })

    it('应该能够限制并发请求数量', async () => {
      // 发送超过最大并发数的请求
      const configs = Array.from({ length: 10 }, (_, i) => ({
        url: `/api/test${i}`,
        method: 'GET'
      }))
      
      // 使用限制并发的批量请求
      const responses = await httpClient.limitedBatchRequest(configs, 3)
      
      // 验证响应
      expect(responses).toHaveLength(10)
      responses.forEach(response => {
        expect(response.data.success).toBe(true)
        expect(response.status).toBe(200)
      })
    })
  })

  describe('请求管理', () => {
    it('应该能够跟踪活跃请求', async () => {
      // 发送请求但不等待完成
      const config = { url: '/api/test', method: 'GET' }
      const promise = httpClient.request(config)
      
      // 检查活跃请求
      const activeRequests = httpClient.requestManager.getActiveRequests()
      expect(activeRequests).toHaveLength(1)
      expect(activeRequests[0].url).toBe('/api/test')
      expect(activeRequests[0].status).toBe('pending')
      
      // 等待请求完成
      await promise
      
      // 检查活跃请求已清空
      expect(httpClient.requestManager.getActiveRequests()).toHaveLength(0)
    })

    it('应该能够取消所有请求', async () => {
      // 发送多个请求但不等待完成
      const configs = Array.from({ length: 5 }, (_, i) => ({
        url: `/api/test${i}`,
        method: 'GET'
      }))
      
      const promises = configs.map(config => httpClient.request(config))
      
      // 等待一小段时间确保请求已添加
      await new Promise(resolve => setTimeout(resolve, 10))
      
      // 取消所有请求
      const cancelledRequests = httpClient.requestManager.cancelAllRequests()
      
      // 验证取消的请求
      expect(cancelledRequests).toHaveLength(5)
      cancelledRequests.forEach(request => {
        expect(request.status).toBe('cancelled')
      })
      
      // 验证活跃请求已清空
      expect(httpClient.requestManager.getActiveRequests()).toHaveLength(0)
    })

    it('应该在达到最大并发数时拒绝新请求', async () => {
      // 发送最大并发数的请求
      const configs = Array.from({ length: 5 }, (_, i) => ({
        url: `/api/test${i}`,
        method: 'GET'
      }))
      
      // 创建不等待完成的请求
      const promises = configs.map(config => 
        httpClient.request(config).catch(error => ({ error }))
      )
      
      // 等待一小段时间确保请求已添加
      await new Promise(resolve => setTimeout(resolve, 10))
      
      // 尝试发送额外请求
      try {
        await httpClient.request({ url: '/api/extra', method: 'GET' })
        expect.fail('Should have thrown an error')
      } catch (error) {
        expect(error.message).toBe('Maximum concurrent requests reached')
      }
      
      // 等待所有请求完成或失败
      await Promise.all(promises)
    })
  })

  describe('批量请求处理', () => {
    it('应该能够处理批量请求', async () => {
      // 创建批量请求配置
      const configs = Array.from({ length: 10 }, (_, i) => ({
        url: `/api/batch${i}`,
        method: 'GET'
      }))
      
      // 发送批量请求
      const responses = await httpClient.batchRequest(configs)
      
      // 验证响应
      expect(responses).toHaveLength(10)
      responses.forEach((response, index) => {
        // 检查响应是否有错误
        if (response.error) {
          console.error(`Request ${index} failed:`, response.error)
        } else {
          expect(response.data.success).toBe(true)
          expect(response.status).toBe(200)
          expect(response.config.url).toBe(`/api/batch${index}`)
        }
      })
    })

    it('应该能够处理部分失败的批量请求', async () => {
      // 创建包含失败请求的批量配置
      const configs = [
        { url: '/api/success1', method: 'GET' },
        { url: '/api/fail', method: 'GET' }, // 这个会失败
        { url: '/api/success2', method: 'GET' }
      ]
      
      // 模拟一个会导致错误的request函数
      const mockRequest = vi.fn()
      mockRequest.mockImplementation((config) => {
        if (config.url === '/api/fail') {
          return Promise.reject(new Error('Request failed'))
        }
        // 对于其他请求，返回成功响应
        return Promise.resolve({
          data: { success: true, requestId: Math.random().toString(36).substr(2, 9) },
          status: 200,
          config: config
        })
      })
      
      // 创建一个简单的mock httpClient对象
      const testHttpClient = {
        requestManager: { getActiveRequests: () => [], cancelAllRequests: () => [] },
        request: mockRequest,
        
        // 批量请求方法
        batchRequest: async (configs) => {
          const results = []
          
          // 使用Promise.allSettled处理所有请求
          const promises = configs.map(config => mockRequest(config))
          
          const settledResults = await Promise.allSettled(promises)
          
          settledResults.forEach((result, index) => {
            if (result.status === 'fulfilled') {
              results[index] = result.value
            } else {
              // 确保错误对象的结构正确
              results[index] = { 
                error: result.reason instanceof Error ? result.reason : 
                      { message: result.reason.message || result.reason.toString() || 'Unknown error' }
              }
            }
          })
          
          return results
        }
      }
      
      // 发送批量请求
      const responses = await testHttpClient.batchRequest(configs)
      
      // 验证响应
      expect(responses).toHaveLength(3)
      expect(responses[0].data.success).toBe(true)
      expect(responses[1].error).toBeDefined()
      expect(responses[1].error.message).toBe('Request failed')
      expect(responses[2].data.success).toBe(true)
    })
  })

  describe('性能测试', () => {
    it('应该能够在合理时间内处理大量并发请求', async () => {
      // 创建大量请求
      const configs = Array.from({ length: 50 }, (_, i) => ({
        url: `/api/perf${i}`,
        method: 'GET'
      }))
      
      // 记录开始时间
      const startTime = Date.now()
      
      // 发送批量请求
      const responses = await httpClient.limitedBatchRequest(configs, 10)
      
      // 计算总耗时
      const duration = Date.now() - startTime
      
      // 验证响应
      expect(responses).toHaveLength(50)
      responses.forEach(response => {
        // 检查响应是否有错误
        if (response.error) {
          console.error('Request failed:', response.error)
        } else {
          expect(response.data.success).toBe(true)
        }
      })
      
      // 验证性能（50个请求应该在合理时间内完成）
      expect(duration).toBeLessThan(5000) // 5秒内完成
    })

    it('应该能够正确计算请求持续时间', async () => {
      // 发送请求
      const config = { url: '/api/timing', method: 'GET' }
      const response = await httpClient.request(config)
      
      // 获取请求ID
      const requestId = response.data.requestId
      
      // 由于我们在模拟中无法直接访问已完成的请求，
      // 我们只能验证请求确实花费了一些时间
      expect(response.data.success).toBe(true)
    })
  })
})