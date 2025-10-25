// 存储服务实现
import type { StorageItem } from '@/domains/shared/types';

// 存储键前缀
const STORAGE_PREFIX = 'fantastic-admin-';

// 默认过期时间（毫秒）
const DEFAULT_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7天

// 存储类型
type StorageType = 'local' | 'session';

// 存储服务类
class StorageService {
  /**
   * 设置存储项
   * @param key 存储键
   * @param value 存储值
   * @param expiry 过期时间（毫秒），不传则使用默认值
   * @param type 存储类型，默认为localStorage
   */
  setItem<T = any>(key: string, value: T, expiry?: number, type: StorageType = 'local'): void {
    const storage = this.getStorage(type);
    const prefixedKey = this.getPrefixedKey(key);
    
    const item: StorageItem<T> = {
      value,
      timestamp: Date.now(),
      expiry: expiry || DEFAULT_EXPIRY,
    };
    
    try {
      storage.setItem(prefixedKey, JSON.stringify(item));
    } catch (error) {
      console.error(`[Storage] Failed to set item: ${key}`, error);
      // 存储空间不足时，尝试清理过期项
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        this.clearExpired(type);
        // 重试一次
        try {
          storage.setItem(prefixedKey, JSON.stringify(item));
        } catch (retryError) {
          console.error(`[Storage] Retry failed for item: ${key}`, retryError);
        }
      }
    }
  }

  /**
   * 获取存储项
   * @param key 存储键
   * @param type 存储类型，默认为localStorage
   * @returns 存储值，如果不存在或已过期则返回null
   */
  getItem<T = any>(key: string, type: StorageType = 'local'): T | null {
    const storage = this.getStorage(type);
    const prefixedKey = this.getPrefixedKey(key);
    
    try {
      const itemStr = storage.getItem(prefixedKey);
      if (!itemStr) {
        return null;
      }
      
      const item: StorageItem<T> = JSON.parse(itemStr);
      
      // 检查是否过期
      if (this.isExpired(item)) {
        this.removeItem(key, type);
        return null;
      }
      
      return item.value;
    } catch (error) {
      console.error(`[Storage] Failed to get item: ${key}`, error);
      return null;
    }
  }

  /**
   * 删除存储项
   * @param key 存储键
   * @param type 存储类型，默认为localStorage
   */
  removeItem(key: string, type: StorageType = 'local'): void {
    const storage = this.getStorage(type);
    const prefixedKey = this.getPrefixedKey(key);
    
    try {
      storage.removeItem(prefixedKey);
    } catch (error) {
      console.error(`[Storage] Failed to remove item: ${key}`, error);
    }
  }

  /**
   * 检查存储项是否存在且未过期
   * @param key 存储键
   * @param type 存储类型，默认为localStorage
   * @returns 是否存在且未过期
   */
  hasItem(key: string, type: StorageType = 'local'): boolean {
    return this.getItem(key, type) !== null;
  }

  /**
   * 获取存储项剩余过期时间（毫秒）
   * @param key 存储键
   * @param type 存储类型，默认为localStorage
   * @returns 剩余过期时间，如果不存在或已过期则返回0
   */
  getItemExpiry(key: string, type: StorageType = 'local'): number {
    const storage = this.getStorage(type);
    const prefixedKey = this.getPrefixedKey(key);
    
    try {
      const itemStr = storage.getItem(prefixedKey);
      if (!itemStr) {
        return 0;
      }
      
      const item: StorageItem = JSON.parse(itemStr);
      
      // 检查是否过期
      if (this.isExpired(item)) {
        this.removeItem(key, type);
        return 0;
      }
      
      return item.timestamp + item.expiry - Date.now();
    } catch (error) {
      console.error(`[Storage] Failed to get item expiry: ${key}`, error);
      return 0;
    }
  }

  /**
   * 清空所有存储项
   * @param type 存储类型，默认为localStorage
   */
  clear(type: StorageType = 'local'): void {
    const storage = this.getStorage(type);
    
    try {
      // 只清空带有前缀的项
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key && key.startsWith(STORAGE_PREFIX)) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => storage.removeItem(key));
    } catch (error) {
      console.error(`[Storage] Failed to clear storage`, error);
    }
  }

  /**
   * 清理所有过期的存储项
   * @param type 存储类型，默认为localStorage
   */
  clearExpired(type: StorageType = 'local'): void {
    const storage = this.getStorage(type);
    
    try {
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key && key.startsWith(STORAGE_PREFIX)) {
          try {
            const itemStr = storage.getItem(key);
            if (itemStr) {
              const item: StorageItem = JSON.parse(itemStr);
              if (this.isExpired(item)) {
                keysToRemove.push(key);
              }
            }
          } catch (error) {
            // 如果解析失败，也删除该项
            keysToRemove.push(key);
          }
        }
      }
      
      keysToRemove.forEach(key => storage.removeItem(key));
    } catch (error) {
      console.error(`[Storage] Failed to clear expired items`, error);
    }
  }

  /**
   * 获取所有存储键（不带前缀）
   * @param type 存储类型，默认为localStorage
   * @returns 存储键数组
   */
  getKeys(type: StorageType = 'local'): string[] {
    const storage = this.getStorage(type);
    const keys: string[] = [];
    
    try {
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key && key.startsWith(STORAGE_PREFIX)) {
          keys.push(key.substring(STORAGE_PREFIX.length));
        }
      }
    } catch (error) {
      console.error(`[Storage] Failed to get keys`, error);
    }
    
    return keys;
  }

  /**
   * 获取存储大小（估算）
   * @param type 存储类型，默认为localStorage
   * @returns 存储大小（字节）
   */
  getSize(type: StorageType = 'local'): number {
    const storage = this.getStorage(type);
    let size = 0;
    
    try {
      for (let key in storage) {
        if (storage.hasOwnProperty(key)) {
          size += storage[key].length + key.length;
        }
      }
    } catch (error) {
      console.error(`[Storage] Failed to get storage size`, error);
    }
    
    return size;
  }

  /**
   * 获取存储对象
   * @param type 存储类型
   * @returns 存储对象
   */
  private getStorage(type: StorageType): Storage {
    return type === 'session' ? window.sessionStorage : window.localStorage;
  }

  /**
   * 获取带前缀的存储键
   * @param key 原始键
   * @returns 带前缀的键
   */
  private getPrefixedKey(key: string): string {
    return `${STORAGE_PREFIX}${key}`;
  }

  /**
   * 检查存储项是否过期
   * @param item 存储项
   * @returns 是否过期
   */
  private isExpired(item: StorageItem): boolean {
    return Date.now() > item.timestamp + item.expiry;
  }
}

// 创建存储服务实例
const storageService = new StorageService();

export default storageService;