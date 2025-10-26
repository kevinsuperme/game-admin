import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// 创建支持请求取消功能的HTTP客户端
function createCancelableHttpClient() {
  // 存储所有活跃的请求控制器
  const activeControllers = new Map<string, AbortController>();
  // 请求计数
  let requestCount = 0;
  
  // 生成请求ID
  const generateRequestId = (url: string, options: Record<string, any> = {}): string => {
    const method = (options.method || 'GET').toUpperCase();
    return `${method}:${url}:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;
  };
  
  // 执行HTTP请求
  const executeRequest = async (
    url: string, 
    options: Record<string, any> = {},
    signal?: AbortSignal
  ): Promise<any> => {
    requestCount++;
    
    // 模拟请求延迟
    const delay = Math.floor(Math.random() * 100) + 50;
    
    return new Promise((resolve, reject) => {
      // 如果信号已经被中止，立即拒绝
      if (signal?.aborted) {
        const error = new Error('Aborted');
        error.name = 'AbortError';
        return reject(error);
      }
      
      // 设置中止处理
      if (signal) {
        const abortHandler = () => {
          clearTimeout(timer);
          const error = new Error('Aborted');
          error.name = 'AbortError';
          reject(error);
        };
        signal.addEventListener('abort', abortHandler, { once: true });
        
        // 清理函数
        const clearAbortListener = () => {
          signal.removeEventListener('abort', abortHandler);
        };
        
        const timer = setTimeout(() => {
          clearAbortListener();
          resolve({
            ok: true,
            status: 200,
            json: async () => ({
              data: `Response from ${url}`,
              timestamp: Date.now(),
              method: options.method || 'GET'
            }),
            headers: {
              get: (header: string) => {
                if (header.toLowerCase() === 'content-type') {
                  return 'application/json';
                }
                return null;
              }
            },
            text: async () => JSON.stringify({
              data: `Response from ${url}`,
              timestamp: Date.now(),
              method: options.method || 'GET'
            })
          });
        }, delay);
      } else {
        // 没有信号的情况
        setTimeout(() => {
          resolve({
            ok: true,
            status: 200,
            json: async () => ({
              data: `Response from ${url}`,
              timestamp: Date.now(),
              method: options.method || 'GET'
            }),
            headers: {
              get: (header: string) => {
                if (header.toLowerCase() === 'content-type') {
                  return 'application/json';
                }
                return null;
              }
            },
            text: async () => JSON.stringify({
              data: `Response from ${url}`,
              timestamp: Date.now(),
              method: options.method || 'GET'
            })
          });
        }, delay);
      }
    });
  };
  
  // 带取消功能的请求方法
  const request = async (
    url: string, 
    options: Record<string, any> = {}
  ): Promise<any> => {
    // 生成请求ID
    const requestId = generateRequestId(url, options);
    
    // 创建中止控制器
    const controller = new AbortController();
    const signal = controller.signal;
    
    // 存储控制器
    activeControllers.set(requestId, controller);
    
    try {
      // 执行请求
      const response = await executeRequest(url, options, signal);
      
      // 请求成功后从活跃请求中移除
      activeControllers.delete(requestId);
      
      return response;
    } catch (error) {
      // 请求失败或被取消后从活跃请求中移除
      activeControllers.delete(requestId);
      throw error;
    }
  };
  
  // 取消所有请求
  const cancelAllRequests = (): number => {
    let canceledCount = 0;
    
    for (const [requestId, controller] of activeControllers.entries()) {
      try {
        controller.abort();
        canceledCount++;
        activeControllers.delete(requestId);
      } catch (error) {
        console.warn(`Failed to cancel request ${requestId}:`, error);
      }
    }
    
    return canceledCount;
  };
  
  // 获取活跃请求数量
  const getActiveRequestCount = (): number => {
    return activeControllers.size;
  };
  
  // 模拟延迟函数
  const sleep = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };
  
  return {
    request,
    cancelAllRequests,
    getActiveRequestCount,
    sleep,
    requestCount: () => requestCount
  };
}

describe('HTTP请求取消测试', () => {
  let client: ReturnType<typeof createCancelableHttpClient>;
  
  beforeEach(() => {
    client = createCancelableHttpClient();
  });
  
  afterEach(() => {
    // 清理所有请求
    client.cancelAllRequests();
    vi.clearAllMocks();
  });
  
  describe('基本取消功能', () => {
    it('应该能够取消所有活跃请求', async () => {
      // 启动多个请求
      const promises = [
        client.request('https://api.example.com/request1'),
        client.request('https://api.example.com/request2'),
        client.request('https://api.example.com/request3')
      ];
      
      // 等待一小段时间确保请求已启动
      await client.sleep(10);
      
      // 验证有活跃请求
      expect(client.getActiveRequestCount()).toBeGreaterThan(0);
      
      // 取消所有请求
      const canceledCount = client.cancelAllRequests();
      
      // 验证所有请求都被取消
      expect(canceledCount).toBe(promises.length);
      expect(client.getActiveRequestCount()).toBe(0);
      
      // 验证请求被拒绝（使用Promise.allSettled来避免测试中断）
      const results = await Promise.allSettled(promises);
      for (const result of results) {
        expect(result.status).toBe('rejected');
        expect(result.reason?.name).toBe('AbortError');
      }
    });
    
    it('取消请求后应该抛出正确的错误类型', async () => {
      // 启动请求
      const promise = client.request('https://api.example.com/cancel-test');
      
      // 等待请求启动
      await client.sleep(10);
      
      // 取消请求
      client.cancelAllRequests();
      
      // 验证抛出AbortError
      await expect(promise).rejects.toThrow();
      await expect(promise).rejects.toHaveProperty('name', 'AbortError');
    });
    
    it('不应该影响已完成的请求', async () => {
      // 启动一个请求并等待完成
      const completedRequest = client.request('https://api.example.com/completed');
      await completedRequest; // 等待请求完成
      
      // 启动另一个请求
      const pendingRequest = client.request('https://api.example.com/pending');
      await client.sleep(10);
      
      // 取消所有请求
      const canceledCount = client.cancelAllRequests();
      
      // 验证只有一个请求被取消
      expect(canceledCount).toBe(1);
      
      // 验证第一个请求成功，第二个请求被拒绝
      expect(await completedRequest).toBeDefined();
      await expect(pendingRequest).rejects.toThrow();
      await expect(pendingRequest).rejects.toHaveProperty('name', 'AbortError');
    });
  });
  
  describe('请求状态管理', () => {
    it('应该正确跟踪活跃请求数量', async () => {
      // 初始状态应该为0
      expect(client.getActiveRequestCount()).toBe(0);
      
      // 启动一个请求
      const promise = client.request('https://api.example.com/status');
      await client.sleep(10);
      
      // 验证活跃请求数量为1
      expect(client.getActiveRequestCount()).toBe(1);
      
      // 等待请求完成
      await promise;
      
      // 验证活跃请求数量回到0
      expect(client.getActiveRequestCount()).toBe(0);
    });
    
    it('应该在请求失败时清理活跃请求记录', async () => {
      // 模拟一个会立即被取消的请求
      const promise = client.request('https://api.example.com/immediate-cancel');
      
      // 立即取消
      await client.sleep(1);
      client.cancelAllRequests();
      
      // 等待请求被拒绝
      await expect(promise).rejects.toThrow();
      await expect(promise).rejects.toHaveProperty('name', 'AbortError');
      
      // 验证活跃请求数量为0
      expect(client.getActiveRequestCount()).toBe(0);
    });
    
    it('应该能够正确处理多次取消操作', async () => {
      // 启动请求
      const promise = client.request('https://api.example.com/multiple-cancel');
      await client.sleep(10);
      
      // 第一次取消
      const firstCancelCount = client.cancelAllRequests();
      expect(firstCancelCount).toBe(1);
      
      // 第二次取消应该没有效果
      const secondCancelCount = client.cancelAllRequests();
      expect(secondCancelCount).toBe(0);
      
      // 验证请求被拒绝
      await expect(promise).rejects.toThrow();
      await expect(promise).rejects.toHaveProperty('name', 'AbortError');
    });
  });
  
  describe('性能和并发处理', () => {
    it('应该能够高效处理大量并发请求的取消', async () => {
      // 启动20个并发请求
      const promises = [];
      for (let i = 0; i < 20; i++) {
        promises.push(client.request(`https://api.example.com/batch-${i}`));
      }
      
      // 等待所有请求启动
      await client.sleep(20);
      
      // 验证活跃请求数量
      expect(client.getActiveRequestCount()).toBe(20);
      
      // 取消所有请求
      const canceledCount = client.cancelAllRequests();
      
      // 验证所有请求都被取消
      expect(canceledCount).toBe(20);
      expect(client.getActiveRequestCount()).toBe(0);
      
      // 验证所有请求都被拒绝（使用Promise.allSettled来避免测试中断）
      const results = await Promise.allSettled(promises);
      for (const result of results) {
        expect(result.status).toBe('rejected');
        expect(result.reason?.name).toBe('AbortError');
      }
    });
    
    it('应该正确处理请求计数', async () => {
      // 启动并取消一个请求
      const promise = client.request('https://api.example.com/count1');
      await client.sleep(10);
      client.cancelAllRequests();
      
      // 等待请求被拒绝
      await expect(promise).rejects.toThrow();
      await expect(promise).rejects.toHaveProperty('name', 'AbortError');
      
      // 启动并完成一个请求
      await client.request('https://api.example.com/count2');
      
      // 验证请求计数为2（无论成功还是失败都计数）
      expect(client.requestCount()).toBe(2);
    });
  });
  
  describe('特殊场景处理', () => {
    it('应该处理空请求列表的情况', () => {
      // 没有活跃请求时调用取消
      const canceledCount = client.cancelAllRequests();
      
      // 验证没有请求被取消
      expect(canceledCount).toBe(0);
      expect(client.getActiveRequestCount()).toBe(0);
    });
    
    it('应该在取消后仍然可以发起新请求', async () => {
      // 取消所有请求（初始为空）
      client.cancelAllRequests();
      
      // 发起新请求
      const newRequest = client.request('https://api.example.com/new-after-cancel');
      
      // 验证请求可以成功完成
      const response = await newRequest;
      expect(response).toBeDefined();
      expect(response.ok).toBe(true);
      
      // 验证活跃请求数量回到0
      expect(client.getActiveRequestCount()).toBe(0);
    });
    
    it('应该能够处理快速连续的请求和取消', async () => {
      // 快速启动和取消多个请求
      for (let i = 0; i < 5; i++) {
        const promise = client.request(`https://api.example.com/rapid-${i}`);
        await client.sleep(5);
        
        if (i % 2 === 0) {
          // 取消偶数索引的请求
          client.cancelAllRequests();
          await expect(promise).rejects.toThrow();
          await expect(promise).rejects.toHaveProperty('name', 'AbortError');
        } else {
          // 让奇数索引的请求完成
          await promise;
        }
      }
      
      // 验证最终没有活跃请求
      expect(client.getActiveRequestCount()).toBe(0);
    });
  });
});