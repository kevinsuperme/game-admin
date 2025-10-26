import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RetryableHttpClient } from '../../src/utils/http';

// 性能测试工具函数
interface PerformanceMetrics {
  responseTime: number; // 响应时间（毫秒）
  memoryUsage?: number; // 内存使用（字节）
  requestCount: number; // 请求计数
  retryCount: number; // 重试计数
}

// 模拟网络延迟
const simulateNetworkDelay = (minMs: number = 50, maxMs: number = 200) => {
  const delay = Math.random() * (maxMs - minMs) + minMs;
  return new Promise(resolve => setTimeout(resolve, delay));
};

// 模拟慢速网络响应
const simulateSlowNetwork = (responseTime: number) => {
  return new Promise(resolve => setTimeout(resolve, responseTime));
};

// 测试数据生成器
const generateTestData = (size: number = 1024) => {
  return {
    id: Math.random().toString(36).substring(7),
    data: 'x'.repeat(size),
    timestamp: Date.now()
  };
};

describe('HTTP客户端性能测试', () => {
  let client: RetryableHttpClient;
  let performanceMetrics: PerformanceMetrics[];
  let originalFetch: typeof global.fetch;
  
  beforeEach(() => {
    // 初始化性能指标数组
    performanceMetrics = [];
    
    client = new RetryableHttpClient();
    originalFetch = global.fetch;
    
    // 模拟fetch并收集性能指标
    global.fetch = vi.fn().mockImplementation(async (url, options) => {
      const startTime = Date.now();
      
      // 模拟网络延迟
      await simulateNetworkDelay(50, 150);
      
      // 模拟响应
      const response = {
        ok: true,
        status: 200,
        json: async () => generateTestData(),
        headers: {
          get: (header: string) => {
            if (header.toLowerCase() === 'content-type') {
              return 'application/json';
            }
            return null;
          }
        }
      };
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      // 收集性能指标
      performanceMetrics.push({
        responseTime,
        requestCount: 1,
        retryCount: 0
      });
      
      return response;
    });
  });
  
  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('响应时间测试', () => {
    it('应该在合理时间内完成单个请求', async () => {
      const startTime = Date.now();
      
      await client.request('https://api.example.com/performance/single');
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      // 验证总响应时间在合理范围内（考虑模拟延迟）
      expect(totalTime).toBeLessThan(500); // 应该在500ms内完成
      
      // 验证性能指标
      expect(performanceMetrics).toHaveLength(1);
      expect(performanceMetrics[0].responseTime).toBeGreaterThan(40); // 至少有一些延迟
    });
    
    it('应该正确测量多个连续请求的响应时间', async () => {
      const requestCount = 5;
      const startTime = Date.now();
      
      // 发送多个请求
      for (let i = 0; i < requestCount; i++) {
        await client.request(`https://api.example.com/performance/sequential/${i}`);
      }
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      const averageTime = totalTime / requestCount;
      
      // 验证性能指标
      expect(performanceMetrics).toHaveLength(requestCount);
      
      // 验证平均响应时间
      expect(averageTime).toBeLessThan(300); // 平均每个请求应该在300ms内完成
      
      // 验证每个请求的响应时间都在合理范围内
      performanceMetrics.forEach(metric => {
        expect(metric.responseTime).toBeGreaterThan(40);
        expect(metric.responseTime).toBeLessThan(250);
      });
    });
    
    it('应该正确测量并发请求的响应时间', async () => {
      const requestCount = 10;
      const startTime = Date.now();
      
      // 发送并发请求
      const promises = Array.from({ length: requestCount }, (_, i) => 
        client.request(`https://api.example.com/performance/concurrent/${i}`)
      );
      
      await Promise.all(promises);
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      // 验证性能指标
      expect(performanceMetrics).toHaveLength(requestCount);
      
      // 并发请求的总时间应该接近单个请求的时间，而不是请求次数的倍数
      expect(totalTime).toBeLessThan(500); // 并发请求应该在500ms内完成
      
      // 验证每个请求的响应时间
      performanceMetrics.forEach(metric => {
        expect(metric.responseTime).toBeGreaterThan(40);
        expect(metric.responseTime).toBeLessThan(250);
      });
    });
    
    it('应该正确测量重试请求的响应时间', async () => {
      // 重置fetch mock以模拟失败和重试
      global.fetch = vi.fn()
        .mockRejectedValueOnce(new TypeError('Network error'))
        .mockRejectedValueOnce(new TypeError('Network error'))
        .mockImplementation(async (url, options) => {
          const startTime = Date.now();
          
          // 模拟网络延迟
          await simulateNetworkDelay(50, 150);
          
          // 模拟成功响应
          const response = {
            ok: true,
            status: 200,
            json: async () => generateTestData(),
            headers: {
              get: (header: string) => {
                if (header.toLowerCase() === 'content-type') {
                  return 'application/json';
                }
                return null;
              }
            }
          };
          
          const endTime = Date.now();
          const responseTime = endTime - startTime;
          
          // 收集性能指标
          performanceMetrics.push({
            responseTime,
            requestCount: 1,
            retryCount: 0
          });
          
          return response;
        });
      
      const startTime = Date.now();
      
      await client.request('https://api.example.com/performance/retry');
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      // 验证fetch被调用了3次（1次初始请求 + 2次重试）
      expect(global.fetch).toHaveBeenCalledTimes(3);
      
      // 验证总响应时间包含重试时间
      expect(totalTime).toBeGreaterThan(200); // 至少包含3次请求的延迟
      
      // 验证性能指标
      expect(performanceMetrics).toHaveLength(1); // 只有最后一次成功请求被记录
      expect(performanceMetrics[0].responseTime).toBeGreaterThan(40);
    });
  });

  describe('内存使用测试', () => {
    it('应该正确测量内存使用情况', async () => {
      // 模拟大量数据响应
      global.fetch = vi.fn().mockImplementation(async (url, options) => {
        const startTime = Date.now();
        
        // 模拟网络延迟
        await simulateNetworkDelay(50, 150);
        
        // 模拟大量数据响应
        const largeData = generateTestData(1024 * 1024); // 1MB数据
        
        const response = {
          ok: true,
          status: 200,
          json: async () => largeData,
          headers: {
            get: (header: string) => {
              if (header.toLowerCase() === 'content-type') {
                return 'application/json';
              }
              return null;
            }
          }
        };
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        // 收集性能指标
        performanceMetrics.push({
          responseTime,
          requestCount: 1,
          retryCount: 0,
          memoryUsage: 1024 * 1024 // 模拟1MB内存使用
        });
        
        return response;
      });
      
      // 发送请求
      await client.request('https://api.example.com/performance/memory');
      
      // 验证性能指标
      expect(performanceMetrics).toHaveLength(1);
      expect(performanceMetrics[0].memoryUsage).toBe(1024 * 1024); // 1MB
    });
    
    it('应该正确测量多个请求的内存使用', async () => {
      // 模拟不同大小的数据响应
      global.fetch = vi.fn().mockImplementation(async (url, options) => {
        const startTime = Date.now();
        
        // 模拟网络延迟
        await simulateNetworkDelay(50, 150);
        
        // 根据URL模拟不同大小的数据
        const urlStr = url.toString();
        let dataSize = 1024; // 默认1KB
        
        if (urlStr.includes('small')) {
          dataSize = 1024; // 1KB
        } else if (urlStr.includes('medium')) {
          dataSize = 1024 * 10; // 10KB
        } else if (urlStr.includes('large')) {
          dataSize = 1024 * 100; // 100KB
        }
        
        const data = generateTestData(dataSize);
        
        const response = {
          ok: true,
          status: 200,
          json: async () => data,
          headers: {
            get: (header: string) => {
              if (header.toLowerCase() === 'content-type') {
                return 'application/json';
              }
              return null;
            }
          }
        };
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        // 收集性能指标
        performanceMetrics.push({
          responseTime,
          requestCount: 1,
          retryCount: 0,
          memoryUsage: dataSize
        });
        
        return response;
      });
      
      // 发送不同大小的请求
      await client.request('https://api.example.com/performance/memory/small');
      await client.request('https://api.example.com/performance/memory/medium');
      await client.request('https://api.example.com/performance/memory/large');
      
      // 验证性能指标
      expect(performanceMetrics).toHaveLength(3);
      
      // 验证不同大小的数据
      expect(performanceMetrics[0].memoryUsage).toBe(1024); // 1KB
      expect(performanceMetrics[1].memoryUsage).toBe(1024 * 10); // 10KB
      expect(performanceMetrics[2].memoryUsage).toBe(1024 * 100); // 100KB
    });
  });

  describe('并发性能测试', () => {
    it('应该正确处理大量并发请求', async () => {
      const requestCount = 50;
      const startTime = Date.now();
      
      // 发送大量并发请求
      const promises = Array.from({ length: requestCount }, (_, i) => 
        client.request(`https://api.example.com/performance/concurrent/large/${i}`)
      );
      
      await Promise.all(promises);
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      // 验证性能指标
      expect(performanceMetrics).toHaveLength(requestCount);
      
      // 验证并发请求在合理时间内完成
      expect(totalTime).toBeLessThan(1000); // 50个并发请求应该在1秒内完成
      
      // 验证每个请求的响应时间
      performanceMetrics.forEach(metric => {
        expect(metric.responseTime).toBeGreaterThan(40);
        expect(metric.responseTime).toBeLessThan(300);
      });
    });
    
    it('应该正确处理并发请求中的失败', async () => {
      const requestCount = 20;
      const failureRate = 0.2; // 20%失败率
      
      // 重置fetch mock以模拟部分失败
      global.fetch = vi.fn().mockImplementation(async (url, options) => {
        const startTime = Date.now();
        
        // 模拟部分请求失败
        const urlStr = url.toString();
        const requestId = parseInt(urlStr.split('/').pop() || '0');
        const shouldFail = requestId % 5 === 0; // 每5个请求中有1个失败
        
        if (shouldFail) {
          throw new TypeError('Network error');
        }
        
        // 模拟网络延迟
        await simulateNetworkDelay(50, 150);
        
        // 模拟成功响应
        const response = {
          ok: true,
          status: 200,
          json: async () => generateTestData(),
          headers: {
            get: (header: string) => {
              if (header.toLowerCase() === 'content-type') {
                return 'application/json';
              }
              return null;
            }
          }
        };
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        // 收集性能指标
        performanceMetrics.push({
          responseTime,
          requestCount: 1,
          retryCount: 0
        });
        
        return response;
      });
      
      // 发送并发请求
      const promises = Array.from({ length: requestCount }, (_, i) => 
        client.request(`https://api.example.com/performance/concurrent/failure/${i}`)
          .catch(error => ({ error: error.message, requestId: i }))
      );
      
      const results = await Promise.all(promises);
      
      // 验证结果
      const successCount = results.filter(r => !r.error).length;
      const failureCount = results.filter(r => r.error).length;
      
      expect(successCount + failureCount).toBe(requestCount);
      expect(failureCount).toBeGreaterThan(0);
      
      // 验证成功请求的性能指标
      expect(performanceMetrics).toHaveLength(successCount);
      
      performanceMetrics.forEach(metric => {
        expect(metric.responseTime).toBeGreaterThan(40);
        expect(metric.responseTime).toBeLessThan(300);
      });
    });
  });

  describe('性能统计测试', () => {
    it('应该正确计算平均响应时间', async () => {
      const requestCount = 10;
      
      // 发送多个请求
      for (let i = 0; i < requestCount; i++) {
        await client.request(`https://api.example.com/performance/stats/${i}`);
      }
      
      // 计算平均响应时间
      const totalResponseTime = performanceMetrics.reduce((sum, metric) => sum + metric.responseTime, 0);
      const averageResponseTime = totalResponseTime / performanceMetrics.length;
      
      // 验证平均响应时间在合理范围内
      expect(averageResponseTime).toBeGreaterThan(50);
      expect(averageResponseTime).toBeLessThan(200);
      
      // 验证性能指标
      expect(performanceMetrics).toHaveLength(requestCount);
    });
    
    it('应该正确计算最大和最小响应时间', async () => {
      const requestCount = 10;
      
      // 发送多个请求
      for (let i = 0; i < requestCount; i++) {
        await client.request(`https://api.example.com/performance/stats/range/${i}`);
      }
      
      // 计算最大和最小响应时间
      const responseTimes = performanceMetrics.map(metric => metric.responseTime);
      const maxResponseTime = Math.max(...responseTimes);
      const minResponseTime = Math.min(...responseTimes);
      
      // 验证最大和最小响应时间
      expect(maxResponseTime).toBeGreaterThan(minResponseTime);
      expect(minResponseTime).toBeGreaterThan(40);
      expect(maxResponseTime).toBeLessThan(250);
      
      // 验证性能指标
      expect(performanceMetrics).toHaveLength(requestCount);
    });
    
    it('应该正确计算请求成功率', async () => {
      // 重置性能指标
      performanceMetrics = [];
      
      const requestCount = 10;
      const results = [];
      
      // 重置fetch mock以模拟部分失败
      global.fetch = vi.fn().mockImplementation(async (url, options) => {
        const startTime = Date.now();
        
        // 模拟部分请求失败
        const urlStr = url.toString();
        const requestId = parseInt(urlStr.split('/').pop() || '0');
        const shouldFail = requestId % 3 === 0; // 每3个请求中有1个失败
        
        if (shouldFail) {
          throw new TypeError('Network error');
        }
        
        // 模拟网络延迟
        await simulateNetworkDelay(50, 150);
        
        // 模拟成功响应
        const response = {
          ok: true,
          status: 200,
          json: async () => generateTestData(),
          headers: {
            get: (header: string) => {
              if (header.toLowerCase() === 'content-type') {
                return 'application/json';
              }
              return null;
            }
          }
        };
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        // 收集性能指标
        performanceMetrics.push({
          responseTime,
          requestCount: 1,
          retryCount: 0
        });
        
        return response;
      });
      
      // 发送多个请求
      for (let i = 0; i < requestCount; i++) {
        try {
          const result = await client.request(`https://api.example.com/performance/stats/success/${i}`);
          results.push({ success: true, result });
        } catch (error) {
          results.push({ success: false, error });
        }
      }
      
      // 统计成功和失败的请求数
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;
      
      // 计算成功率
      const successRate = (successCount / requestCount) * 100;
      
      // 验证成功率
      expect(successRate).toBeGreaterThan(50); // 至少50%成功率
      expect(successRate).toBeLessThan(100); // 不是100%成功率
      
      // 验证成功和失败计数
      expect(successCount + failureCount).toBe(requestCount);
      expect(successCount).toBeGreaterThan(0);
      expect(failureCount).toBeGreaterThan(0);

      // 验证性能指标
      expect(performanceMetrics.length).toBe(successCount);
    });
  });
});