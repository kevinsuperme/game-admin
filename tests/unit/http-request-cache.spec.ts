import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// 缓存项接口
interface CacheItem {
  data: any;
  timestamp: number;
  expiry: number;
  metadata?: Record<string, any>;
}

// 缓存配置接口
interface CacheConfig {
  defaultTtl: number; // 默认缓存时间（毫秒）
  maxCacheSize: number; // 最大缓存项数量
  enabled: boolean; // 是否启用缓存
}

// 创建带缓存功能的HTTP客户端
function createCachingHttpClient(config: Partial<CacheConfig> = {}) {
  // 默认配置
  const defaultConfig: CacheConfig = {
    defaultTtl: 5000, // 5秒
    maxCacheSize: 100,
    enabled: true
  };
  
  // 合并配置
  const cacheConfig = { ...defaultConfig, ...config };
  
  // 缓存存储
  const cache = new Map<string, CacheItem>();
  // 请求计数（用于测试）
  let requestCount = 0;
  
  // 生成缓存键
  const generateCacheKey = (url: string, options: Record<string, any> = {}): string => {
    // 对于GET请求，使用URL和查询参数作为缓存键
    if (!options.method || options.method.toUpperCase() === 'GET') {
      return url;
    }
    
    // 对于其他请求，包含方法和请求体（如果有）
    const method = (options.method || 'GET').toUpperCase();
    const body = options.body ? JSON.stringify(options.body) : '';
    
    // 简单的哈希函数来处理长字符串
    const hashBody = body ? `-${Array.from(body).reduce((acc, char) => acc + char.charCodeAt(0), 0)}` : '';
    
    return `${method}:${url}${hashBody}`;
  };
  
  // 检查缓存是否过期
  const isCacheExpired = (item: CacheItem): boolean => {
    return Date.now() > item.expiry;
  };
  
  // 清理过期缓存
  const cleanupExpiredCache = (): void => {
    const now = Date.now();
    for (const [key, item] of cache.entries()) {
      if (now > item.expiry) {
        cache.delete(key);
      }
    }
  };
  
  // 清理最旧的缓存项（当超过最大大小时）
  const cleanupOldestCache = (): void => {
    if (cache.size <= cacheConfig.maxCacheSize) {
      return;
    }
    
    // 按时间戳排序并删除最旧的项
    const oldestKey = Array.from(cache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0];
    
    cache.delete(oldestKey);
  };
  
  // 执行HTTP请求
  const executeRequest = async (url: string, options: Record<string, any> = {}): Promise<any> => {
    requestCount++;
    
    // 模拟请求延迟
    await new Promise(resolve => setTimeout(resolve, Math.random() * 50));
    
    // 模拟返回数据
    return {
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
      // 添加一个方法来获取原始响应文本（用于测试）
      text: async () => JSON.stringify({
        data: `Response from ${url}`,
        timestamp: Date.now(),
        method: options.method || 'GET'
      })
    };
  };
  
  // 带缓存的请求方法
  const request = async (
    url: string, 
    options: Record<string, any> = {},
    ttl?: number
  ): Promise<any> => {
    // 如果缓存未启用，直接执行请求
    if (!cacheConfig.enabled) {
      return executeRequest(url, options);
    }
    
    // 生成缓存键
    const cacheKey = generateCacheKey(url, options);
    
    // 清理过期缓存
    cleanupExpiredCache();
    
    // 检查缓存中是否有有效数据
    const cachedItem = cache.get(cacheKey);
    if (cachedItem && !isCacheExpired(cachedItem)) {
      // 返回缓存的数据，但模拟完整的响应对象
      return {
        ok: true,
        status: 200,
        json: async () => cachedItem.data,
        headers: {
          get: (header: string) => {
            if (header.toLowerCase() === 'x-from-cache') {
              return 'true';
            }
            if (header.toLowerCase() === 'content-type') {
              return 'application/json';
            }
            return null;
          }
        },
        text: async () => JSON.stringify(cachedItem.data)
      };
    }
    
    // 执行请求
    const response = await executeRequest(url, options);
    
    // 只缓存成功的GET请求（可以根据需要调整）
    const method = (options.method || 'GET').toUpperCase();
    if (method === 'GET' && response.ok) {
      try {
        // 尝试获取响应数据
        const responseData = await response.json();
        
        // 计算过期时间
        const expiryTime = Date.now() + (ttl || cacheConfig.defaultTtl);
        
        // 存储到缓存 - 创建完整的缓存项
        const cacheItem: CacheItem = {
          data: responseData,
          timestamp: Date.now(),
          expiry: expiryTime,
          metadata: {
            url,
            method,
            options: { ...options }
          }
        };
        
        // 强制设置缓存
        cache.set(cacheKey, cacheItem);
        
        // 清理最旧的缓存项（如果需要）
        cleanupOldestCache();
      } catch (error) {
        // 如果解析JSON失败，不缓存
        console.warn('Failed to cache response due to JSON parsing error', error);
      }
    }
    
    // 重新克隆响应，因为原始响应可能已经被读取
    return {
      ...response,
      json: async () => {
        // 对于已缓存的请求，直接返回缓存数据
        const cached = cache.get(cacheKey);
        return cached ? cached.data : response.json();
      }
    };
  };
  
  // 获取缓存统计
  const getCacheStats = () => {
    const now = Date.now();
    const expiredCount = Array.from(cache.values()).filter(item => now > item.expiry).length;
    
    return {
      size: cache.size,
      expiredCount,
      validCount: cache.size - expiredCount,
      maxSize: cacheConfig.maxCacheSize,
      enabled: cacheConfig.enabled,
      defaultTtl: cacheConfig.defaultTtl,
      requestCount
    };
  };
  
  // 清除特定缓存项
  const clearCacheItem = (url: string, options: Record<string, any> = {}): boolean => {
    const cacheKey = generateCacheKey(url, options);
    return cache.delete(cacheKey);
  };
  
  // 清除所有缓存
  const clearAllCache = (): void => {
    cache.clear();
  };
  
  // 禁用/启用缓存
  const setCacheEnabled = (enabled: boolean): void => {
    cacheConfig.enabled = enabled;
  };
  
  // 更新缓存配置
  const updateCacheConfig = (newConfig: Partial<CacheConfig>): void => {
    Object.assign(cacheConfig, newConfig);
  };
  
  // 获取缓存项（用于测试）
  const getCacheItem = (url: string, options: Record<string, any> = {}): CacheItem | undefined => {
    const cacheKey = generateCacheKey(url, options);
    return cache.get(cacheKey);
  };
  
  return {
    request,
    getCacheStats,
    clearCacheItem,
    clearAllCache,
    setCacheEnabled,
    updateCacheConfig,
    getCacheItem,
    generateCacheKey
  };
}

describe('HTTP请求缓存测试', () => {
  let client: ReturnType<typeof createCachingHttpClient>;
  
  beforeEach(() => {
    client = createCachingHttpClient();
  });
  
  afterEach(() => {
    client.clearAllCache();
    vi.clearAllMocks();
  });
  
  describe('基本缓存功能', () => {
    it('应该能够缓存GET请求的响应', async () => {
      // 第一次请求
      const response1 = await client.request('https://api.example.com/users');
      const data1 = await response1.json();
      
      // 第二次请求（应该命中缓存）
      const response2 = await client.request('https://api.example.com/users');
      const data2 = await response2.json();
      
      // 验证两次请求返回相同的数据
      expect(data1).toEqual(data2);
      
      // 验证缓存统计
      const stats = client.getCacheStats();
      expect(stats.validCount).toBe(1);
    });
    
    it('应该能够通过缓存头识别缓存响应', async () => {
      // 第一次请求
      const response1 = await client.request('https://api.example.com/test-cache');
      
      // 验证不是缓存响应
      expect(response1.headers.get('x-from-cache')).toBeNull();
      
      // 第二次请求（应该命中缓存）
      const response2 = await client.request('https://api.example.com/test-cache');
      
      // 验证是缓存响应
      expect(response2.headers.get('x-from-cache')).toBe('true');
    });
    
    it('不同URL的请求应该分别缓存', async () => {
      // 第一个URL
      await client.request('https://api.example.com/url1');
      
      // 第二个URL
      await client.request('https://api.example.com/url2');
      
      // 验证两个缓存项都存在
      const stats = client.getCacheStats();
      expect(stats.validCount).toBe(2);
      
      // 验证可以获取到各自的缓存项
      const cache1 = client.getCacheItem('https://api.example.com/url1');
      const cache2 = client.getCacheItem('https://api.example.com/url2');
      
      expect(cache1).toBeDefined();
      expect(cache2).toBeDefined();
      expect(cache1?.data.data).toContain('url1');
      expect(cache2?.data.data).toContain('url2');
    });
  });
  
  describe('缓存过期和TTL', () => {
    it('应该尊重默认的TTL设置', async () => {
      // 创建一个TTL很短的客户端
      const shortTtlClient = createCachingHttpClient({ defaultTtl: 100 });
      
      // 第一次请求
      await shortTtlClient.request('https://api.example.com/short-ttl');
      
      // 验证缓存已创建
      let stats = shortTtlClient.getCacheStats();
      expect(stats.validCount).toBe(1);
      
      // 等待缓存过期
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // 再次请求
      await shortTtlClient.request('https://api.example.com/short-ttl');
      
      // 验证缓存已过期并重新请求
      stats = shortTtlClient.getCacheStats();
      // 缓存计数应该还是1，但请求计数应该是2
      expect(stats.requestCount).toBe(2);
    });
    
    it('应该支持每个请求自定义TTL', async () => {
      // 创建一个默认TTL较长的客户端
      const clientWithLongDefault = createCachingHttpClient({ defaultTtl: 10000 });
      
      // 使用自定义TTL的请求
      await clientWithLongDefault.request('https://api.example.com/custom-ttl', {}, 50);
      
      // 验证缓存已创建
      let stats = clientWithLongDefault.getCacheStats();
      expect(stats.validCount).toBe(1);
      
      // 等待自定义TTL过期
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 再次请求
      await clientWithLongDefault.request('https://api.example.com/custom-ttl');
      
      // 验证缓存已过期并重新请求
      stats = clientWithLongDefault.getCacheStats();
      expect(stats.requestCount).toBe(2);
    });
    
    it('应该自动清理过期的缓存项', async () => {
      // 创建一个TTL很短的客户端
      const clientWithShortTtl = createCachingHttpClient({ defaultTtl: 50 });
      
      // 创建缓存
      await clientWithShortTtl.request('https://api.example.com/expire1');
      await clientWithShortTtl.request('https://api.example.com/expire2');
      
      // 验证两个缓存项
      let stats = clientWithShortTtl.getCacheStats();
      expect(stats.validCount).toBe(2);
      
      // 等待缓存过期
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 执行新请求触发清理
      await clientWithShortTtl.request('https://api.example.com/new-request');
      
      // 验证过期缓存已清理
      stats = clientWithShortTtl.getCacheStats();
      expect(stats.validCount).toBe(1); // 只有新请求的缓存有效
    });
  });
  
  describe('缓存键生成', () => {
    it('应该为GET请求生成正确的缓存键', () => {
      const url = 'https://api.example.com/users?page=1&limit=10';
      const cacheKey = client.generateCacheKey(url);
      
      // 对于GET请求，缓存键应该就是URL
      expect(cacheKey).toBe(url);
    });
    
    it('应该为非GET请求生成包含方法的缓存键', () => {
      const url = 'https://api.example.com/users';
      const options = { method: 'POST' };
      const cacheKey = client.generateCacheKey(url, options);
      
      // 验证缓存键包含方法
      expect(cacheKey).toContain('POST:');
      expect(cacheKey).toContain(url);
    });
    
    it('应该为带请求体的请求生成包含请求体的缓存键', () => {
      const url = 'https://api.example.com/users';
      const options1 = { 
        method: 'POST', 
        body: JSON.stringify({ name: 'John', age: 30 })
      };
      const options2 = { 
        method: 'POST', 
        body: JSON.stringify({ name: 'Jane', age: 25 })
      };
      
      const cacheKey1 = client.generateCacheKey(url, options1);
      const cacheKey2 = client.generateCacheKey(url, options2);
      
      // 不同的请求体应该生成不同的缓存键
      expect(cacheKey1).not.toBe(cacheKey2);
    });
  });
  
  describe('缓存策略', () => {
    it('不应该缓存非GET请求', async () => {
      // 发送POST请求
      await client.request('https://api.example.com/users', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test' })
      });
      
      // 验证没有缓存
      const stats = client.getCacheStats();
      expect(stats.validCount).toBe(0);
    });
    
    it('应该限制缓存大小', async () => {
      // 创建一个小容量缓存
      const smallCacheClient = createCachingHttpClient({ maxCacheSize: 3 });
      
      // 创建超出容量的缓存项
      for (let i = 0; i < 5; i++) {
        await smallCacheClient.request(`https://api.example.com/cache-limit-${i}`);
      }
      
      // 验证缓存大小被限制
      const stats = smallCacheClient.getCacheStats();
      expect(stats.size).toBe(3);
    });
    
    it('当缓存满时应该删除最旧的缓存项', async () => {
      // 创建一个小容量缓存
      const smallCacheClient = createCachingHttpClient({ maxCacheSize: 2 });
      
      // 创建缓存项
      await smallCacheClient.request('https://api.example.com/first');
      await smallCacheClient.request('https://api.example.com/second');
      
      // 验证两个缓存项都存在
      expect(smallCacheClient.getCacheItem('https://api.example.com/first')).toBeDefined();
      expect(smallCacheClient.getCacheItem('https://api.example.com/second')).toBeDefined();
      
      // 添加第三个，应该淘汰第一个
      await smallCacheClient.request('https://api.example.com/third');
      
      // 验证第一个被淘汰
      expect(smallCacheClient.getCacheItem('https://api.example.com/first')).toBeUndefined();
      expect(smallCacheClient.getCacheItem('https://api.example.com/second')).toBeDefined();
      expect(smallCacheClient.getCacheItem('https://api.example.com/third')).toBeDefined();
    });
  });
  
  describe('缓存管理功能', () => {
    it('应该能够清除特定的缓存项', async () => {
      // 创建多个缓存项
      await client.request('https://api.example.com/clear1');
      await client.request('https://api.example.com/clear2');
      
      // 清除一个缓存项
      const cleared = client.clearCacheItem('https://api.example.com/clear1');
      
      // 验证清除成功
      expect(cleared).toBe(true);
      
      // 验证缓存项状态
      expect(client.getCacheItem('https://api.example.com/clear1')).toBeUndefined();
      expect(client.getCacheItem('https://api.example.com/clear2')).toBeDefined();
    });
    
    it('应该能够清除所有缓存', async () => {
      // 创建多个缓存项
      await client.request('https://api.example.com/all1');
      await client.request('https://api.example.com/all2');
      await client.request('https://api.example.com/all3');
      
      // 清除所有缓存
      client.clearAllCache();
      
      // 验证所有缓存都被清除
      const stats = client.getCacheStats();
      expect(stats.size).toBe(0);
    });
    
    it('应该能够禁用和启用缓存', async () => {
      // 启用缓存时的请求
      await client.request('https://api.example.com/toggle');
      
      // 验证缓存已创建
      let stats = client.getCacheStats();
      expect(stats.validCount).toBe(1);
      
      // 禁用缓存
      client.setCacheEnabled(false);
      
      // 再次请求（不应该使用缓存）
      await client.request('https://api.example.com/toggle');
      
      // 验证请求计数增加但缓存计数不变
      stats = client.getCacheStats();
      expect(stats.requestCount).toBe(2);
      expect(stats.validCount).toBe(1);
      
      // 重新启用缓存
      client.setCacheEnabled(true);
      
      // 再次请求（应该使用缓存）
      await client.request('https://api.example.com/toggle');
      
      // 验证请求计数不再增加
      stats = client.getCacheStats();
      expect(stats.requestCount).toBe(2); // 请求计数不增加，因为使用了缓存
    });
    
    it('应该能够更新缓存配置', async () => {
      // 更新配置
      client.updateCacheConfig({ defaultTtl: 50, maxCacheSize: 5 });
      
      // 创建缓存
      await client.request('https://api.example.com/config-update');
      
      // 验证缓存已创建
      let stats = client.getCacheStats();
      expect(stats.validCount).toBe(1);
      
      // 等待缓存过期
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 再次请求
      await client.request('https://api.example.com/config-update');
      
      // 验证缓存已过期并重新请求
      stats = client.getCacheStats();
      expect(stats.requestCount).toBe(2);
    });
  });
  
  describe('特殊场景处理', () => {
    it('应该正确处理URL查询参数', async () => {
      // 不同查询参数的相同URL应该分别缓存
      await client.request('https://api.example.com/search?q=term1');
      await client.request('https://api.example.com/search?q=term2');
      
      // 验证两个缓存项
      const stats = client.getCacheStats();
      expect(stats.validCount).toBe(2);
      
      // 验证缓存键是不同的
      const cache1 = client.getCacheItem('https://api.example.com/search?q=term1');
      const cache2 = client.getCacheItem('https://api.example.com/search?q=term2');
      
      expect(cache1).toBeDefined();
      expect(cache2).toBeDefined();
      expect(cache1?.data.data).toContain('search');
      expect(cache2?.data.data).toContain('search');
    });
    
    it('应该处理正常的JSON响应缓存', async () => {
      // 正常的请求应该被缓存
      await client.request('https://api.example.com/valid-json');
      
      const stats = client.getCacheStats();
      expect(stats.validCount).toBe(1);
    });
    
    it('缓存应该包含元数据信息', async () => {
      // 创建缓存
      await client.request('https://api.example.com/metadata', {
        headers: { 'X-Custom': 'value' }
      });
      
      // 获取缓存项
      const cacheItem = client.getCacheItem('https://api.example.com/metadata');
      
      // 验证缓存项存在
      expect(cacheItem).toBeDefined();
      // 验证元数据存在
      expect(cacheItem!.metadata).toBeDefined();
      expect(cacheItem!.metadata!.url).toBe('https://api.example.com/metadata');
      expect(cacheItem!.metadata!.method).toBe('GET');
    });
  });
});