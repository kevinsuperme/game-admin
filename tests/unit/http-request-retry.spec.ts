import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// 模拟 fetch 全局函数
global.fetch = vi.fn();

type RetryConfig = {
  maxRetries: number;
  retryDelay: number;
  retryableStatuses: number[];
  retryableMethods: string[];
  exponentialBackoff: boolean;
};

interface RequestOptions extends RequestInit {
  retryConfig?: Partial<RetryConfig>;
}

class RetryableHttpClient {
  private defaultRetryConfig: RetryConfig = {
    maxRetries: 3,
    retryDelay: 100,
    retryableStatuses: [408, 429, 500, 502, 503, 504],
    retryableMethods: ['GET', 'HEAD', 'OPTIONS', 'PUT', 'DELETE'],
    exponentialBackoff: true
  };

  private requestCount: number = 0;
  private retryCount: number = 0;

  constructor(config?: Partial<RetryConfig>) {
    if (config) {
      this.defaultRetryConfig = { ...this.defaultRetryConfig, ...config };
    }
  }

  async request<T>(url: string, options: RequestOptions = {}): Promise<T> {
    const retryConfig: RetryConfig = {
      ...this.defaultRetryConfig,
      ...options.retryConfig
    };

    let attempts = 0;
    let lastError: Error | null = null;

    while (attempts <= retryConfig.maxRetries) {
      attempts++;
      
      try {
        // 每次尝试（包括初始请求）都增加请求计数
        this.requestCount++;
        
        const response = await this.executeRequest<T>(url, options);
        return response;
      } catch (error: any) {
        lastError = error;

        // 如果达到最大重试次数或不应该重试，直接抛出错误
        if (attempts > retryConfig.maxRetries || !this.shouldRetry(error, options, retryConfig)) {
          throw error;
        }
        
        // 每次重试都增加重试计数
        this.retryCount++;
        
        // 计算重试延迟
        const delay = retryConfig.exponentialBackoff
          ? retryConfig.retryDelay * Math.pow(2, attempts - 1)
          : retryConfig.retryDelay;
        
        // 等待重试延迟
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    // 如果达到最大重试次数仍然失败，抛出最后一个错误
    throw lastError;
  }

  private async executeRequest<T>(url: string, options: RequestOptions): Promise<T> {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const error = new Error(`HTTP error! Status: ${response.status}`);
      (error as any).status = response.status;
      throw error;
    }
    
    try {
      return await response.json();
    } catch (e) {
      // JSON解析错误不需要重试，直接抛出
      const error = new Error('Failed to parse JSON response');
      (error as any).shouldNotRetry = true;
      throw error;
    }
  }

  private shouldRetry(error: any, options: RequestOptions, config: RetryConfig): boolean {
    // 如果标记了不应重试，则直接返回false
    if (error.shouldNotRetry) {
      return false;
    }
    
    const method = options.method?.toUpperCase() || 'GET';
    
    // 检查方法是否可重试
    if (!config.retryableMethods.includes(method)) {
      return false;
    }
    
    // 检查状态码是否可重试
    if (error.status && config.retryableStatuses.includes(error.status)) {
      return true;
    }
    
    // 检查是否是网络错误（fetch API 在网络错误时会抛出 TypeError）
    return error instanceof TypeError;
  }

  // 获取统计信息的方法
  getStats() {
    return {
      requestCount: this.requestCount,
      retryCount: this.retryCount
    };
  }

  // 重置统计信息
  resetStats() {
    this.requestCount = 0;
    this.retryCount = 0;
  }
}

describe('HTTP请求重试机制测试', () => {
  let client: RetryableHttpClient;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new RetryableHttpClient();
    client.resetStats();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('基本重试功能', () => {
    it('应该能够在网络错误时自动重试', async () => {
      // 模拟网络错误，然后成功
      (global.fetch as vi.Mock).mockRejectedValueOnce(new TypeError('Failed to fetch'))
        .mockRejectedValueOnce(new TypeError('Failed to fetch'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: 'success' })
        } as Response);

      const result = await client.request('https://api.example.com/data');
      
      expect(global.fetch).toHaveBeenCalledTimes(3);
      expect(result).toEqual({ data: 'success' });
      expect(client.getStats()).toEqual({
        requestCount: 3,
        retryCount: 2
      });
    });

    it('应该在HTTP错误状态码时重试', async () => {
      // 模拟500错误，然后成功
      (global.fetch as vi.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 500
        } as Response)
        .mockResolvedValueOnce({
          ok: false,
          status: 500
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: 'success' })
        } as Response);

      const result = await client.request('https://api.example.com/data');
      
      expect(global.fetch).toHaveBeenCalledTimes(3);
      expect(result).toEqual({ data: 'success' });
      expect(client.getStats()).toEqual({
        requestCount: 3,
        retryCount: 2
      });
    });

    it('应该在达到最大重试次数后抛出最后一个错误', async () => {
      // 模拟三次网络错误
      (global.fetch as vi.Mock)
        .mockRejectedValue(new TypeError('Failed to fetch'));

      await expect(
        client.request('https://api.example.com/data')
      ).rejects.toThrow('Failed to fetch');
      
      expect(global.fetch).toHaveBeenCalledTimes(4); // 1次初始请求 + 3次重试
      expect(client.getStats()).toEqual({
        requestCount: 4,
        retryCount: 3
      });
    });
  });

  describe('重试策略配置', () => {
    it('应该支持自定义最大重试次数', async () => {
      const customClient = new RetryableHttpClient({ maxRetries: 5 });
      
      // 模拟多次网络错误
      (global.fetch as vi.Mock)
        .mockRejectedValue(new TypeError('Failed to fetch'));

      await expect(
        customClient.request('https://api.example.com/data')
      ).rejects.toThrow('Failed to fetch');
      
      expect(global.fetch).toHaveBeenCalledTimes(6); // 1次初始请求 + 5次重试
    });

    it('应该支持配置可重试的HTTP状态码', async () => {
      const customClient = new RetryableHttpClient({
        retryableStatuses: [429]
      });
      
      // 模拟404错误（不在可重试列表中）
      (global.fetch as vi.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 404
        } as Response);

      await expect(
        customClient.request('https://api.example.com/data')
      ).rejects.toThrow('HTTP error! Status: 404');
      
      expect(global.fetch).toHaveBeenCalledTimes(1); // 不应该重试
    });

    it('应该支持配置可重试的HTTP方法', async () => {
      const customClient = new RetryableHttpClient({
        retryableMethods: ['GET']
      });
      
      // 模拟POST请求失败
      (global.fetch as vi.Mock)
        .mockRejectedValueOnce(new TypeError('Failed to fetch'));

      await expect(
        customClient.request('https://api.example.com/data', { method: 'POST' })
      ).rejects.toThrow('Failed to fetch');
      
      expect(global.fetch).toHaveBeenCalledTimes(1); // 不应该重试POST请求
    });

    it('应该支持请求级别的重试配置覆盖', async () => {
      // 为特定请求配置不同的重试策略
      (global.fetch as vi.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 500
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: 'success' })
        } as Response);

      const result = await client.request('https://api.example.com/data', {
        retryConfig: {
          maxRetries: 1,
          retryDelay: 50
        }
      });
      
      expect(global.fetch).toHaveBeenCalledTimes(2); // 1次初始请求 + 1次重试
      expect(result).toEqual({ data: 'success' });
    });
  });

  describe('重试延迟机制', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });
    
    afterEach(() => {
      vi.useRealTimers();
    });
    
    it('应该支持固定延迟重试', async () => {
      const customClient = new RetryableHttpClient({
        maxRetries: 2,
        retryDelay: 50,
        exponentialBackoff: false
      });
      
      // 重置统计信息
      customClient.resetStats();
      
      (global.fetch as vi.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 500
        } as Response)
        .mockResolvedValueOnce({
          ok: false,
          status: 500
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: 'success' })
        } as Response);

      const promise = customClient.request('https://api.example.com/data');
      
      // 第一次请求失败后，等待第一次延迟
      vi.advanceTimersByTime(50);
      
      // 第二次请求失败后，等待第二次延迟
      vi.advanceTimersByTime(50);
      
      const result = await promise;
      
      expect(result).toEqual({ data: 'success' });
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('应该支持指数退避延迟', async () => {
      const customClient = new RetryableHttpClient({
        maxRetries: 2,
        retryDelay: 50,
        exponentialBackoff: true
      });
      
      // 重置统计信息
      customClient.resetStats();
      
      (global.fetch as vi.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 500
        } as Response)
        .mockResolvedValueOnce({
          ok: false,
          status: 500
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: 'success' })
        } as Response);

      const promise = customClient.request('https://api.example.com/data');
      
      // 第一次重试应该等待 50ms
      vi.advanceTimersByTime(50);
      
      // 第二次重试应该等待 100ms (50 * 2^1)
      vi.advanceTimersByTime(100);
      
      const result = await promise;
      
      expect(result).toEqual({ data: 'success' });
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });
  });

  describe('特殊场景处理', () => {
    it('不应该重试非幂等操作（默认配置）', async () => {
      // 重置统计信息
      client.resetStats();
      
      // 模拟POST请求失败
      (global.fetch as vi.Mock)
        .mockRejectedValueOnce(new TypeError('Failed to fetch'));

      await expect(
        client.request('https://api.example.com/data', { method: 'POST' })
      ).rejects.toThrow('Failed to fetch');
      
      expect(global.fetch).toHaveBeenCalledTimes(1); // 默认情况下不重试POST
    });

    it('应该在配置允许的情况下重试非幂等操作', async () => {
      const customClient = new RetryableHttpClient({
        retryableMethods: ['GET', 'POST', 'PUT', 'DELETE']
      });
      
      // 重置统计信息
      customClient.resetStats();
      
      // 模拟POST请求失败后成功
      (global.fetch as vi.Mock)
        .mockRejectedValueOnce(new TypeError('Failed to fetch'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: 'created' })
        } as Response);

      const result = await customClient.request('https://api.example.com/data', { method: 'POST' });
      
      expect(global.fetch).toHaveBeenCalledTimes(2); // 重试了POST请求
      expect(result).toEqual({ data: 'created' });
    });

    it('不应该重试非重试状态码的HTTP错误', async () => {
      // 重置统计信息
      client.resetStats();
      
      // 模拟400错误（通常不应该重试）
      (global.fetch as vi.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 400
        } as Response);

      await expect(
        client.request('https://api.example.com/data')
      ).rejects.toThrow('HTTP error! Status: 400');
      
      expect(global.fetch).toHaveBeenCalledTimes(1); // 不应该重试
    });

    it('应该正确处理JSON解析错误（不重试）', async () => {
      // 重置统计信息
      client.resetStats();
      
      // 模拟响应但JSON解析失败
      (global.fetch as vi.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => {
            throw new Error('Invalid JSON');
          }
        } as Response);

      await expect(
        client.request('https://api.example.com/data')
      ).rejects.toThrow('Failed to parse JSON response');
      
      expect(global.fetch).toHaveBeenCalledTimes(1); // 不应该重试JSON解析错误
    });

    it('应该在重试过程中成功时立即返回结果', async () => {
      const customClient = new RetryableHttpClient();
      
      // 重置统计信息
      customClient.resetStats();
      
      // 重置fetch mock
      vi.clearAllMocks();
      
      // 模拟第一次失败，第二次成功
      (global.fetch as vi.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 500
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: 'success' })
        } as Response);

      const result = await customClient.request('https://api.example.com/data');
      
      expect(global.fetch).toHaveBeenCalledTimes(2); // 只重试了一次
      expect(result).toEqual({ data: 'success' });
    });
  });

  describe('统计信息', () => {
    it('应该正确跟踪请求和重试计数', async () => {
      // 创建新的客户端实例，避免之前测试的影响
      const customClient = new RetryableHttpClient();
      
      // 重置统计信息
      customClient.resetStats();
      
      // 重置fetch mock
      vi.clearAllMocks();
      
      // 模拟一次成功请求
      (global.fetch as vi.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: 'success' })
        } as Response);

      await customClient.request('https://api.example.com/data');
      
      // 检查实际结果
      const stats = customClient.getStats();
      console.log('实际统计信息:', stats);
      
      // 验证统计信息 - 每次请求都会增加计数
      expect(stats.requestCount).toBe(1);
      expect(stats.retryCount).toBe(0);

      // 重置统计
      customClient.resetStats();
      
      expect(customClient.getStats()).toEqual({
        requestCount: 0,
        retryCount: 0
      });
    });
    
    it('应该正确跟踪多次请求和重试计数', async () => {
      // 创建新的客户端实例，避免之前测试的影响
      const customClient = new RetryableHttpClient();
      
      // 重置统计信息
      customClient.resetStats();
      
      // 重置fetch mock
      vi.clearAllMocks();
      
      // 模拟第一次请求成功
      (global.fetch as vi.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: 'success1' })
        } as Response);

      // 第一次请求
      await customClient.request('https://api.example.com/data1');
      
      // 检查第一次请求后的统计
      const stats1 = customClient.getStats();
      console.log('第一次请求后统计:', stats1);
      
      expect(stats1.requestCount).toBe(1);
      expect(stats1.retryCount).toBe(0);

      // 不重置统计信息，继续累积计数
      
      // 重置fetch mock
      vi.clearAllMocks();
      
      // 模拟第二次请求失败一次后成功
      (global.fetch as vi.Mock)
        .mockRejectedValueOnce(new TypeError('Failed to fetch'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: 'success2' })
        } as Response);

      // 第二次请求（使用同一个客户端）
      await customClient.request('https://api.example.com/data2');
      
      // 检查第二次请求后的统计
      const stats2 = customClient.getStats();
      console.log('第二次请求后统计:', stats2);
      
      // 验证统计信息 - 累积计数
      expect(stats2.requestCount).toBe(3); // 1 + 2
      expect(stats2.retryCount).toBe(1);
    });
    
    it('应该正确跟踪重试计数（简单测试）', async () => {
      // 创建新的客户端实例，避免之前测试的影响
      const customClient = new RetryableHttpClient();
      
      // 重置统计信息
      customClient.resetStats();
      
      // 重置fetch mock
      vi.clearAllMocks();
      
      // 模拟请求失败一次后成功
      (global.fetch as vi.Mock)
        .mockRejectedValueOnce(new TypeError('Failed to fetch'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: 'success' })
        } as Response);

      // 发起请求
      await customClient.request('https://api.example.com/data');
      
      // 检查实际结果
      const stats = customClient.getStats();
      console.log('简单测试统计:', stats);
      
      // 验证统计信息
      expect(stats.requestCount).toBe(2);
      expect(stats.retryCount).toBe(1);
    });
  });
});