// 共享域工具函数

import type { AnyObject } from '../types';

/**
 * 深拷贝
 * @param obj 要拷贝的对象
 * @returns 拷贝后的对象
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as unknown as T;
  }

  if (typeof obj === 'object') {
    const clonedObj = {} as T;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }

  return obj;
}

/**
 * 防抖函数
 * @param func 要防抖的函数
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return function(this: any, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

/**
 * 节流函数
 * @param func 要节流的函数
 * @param delay 延迟时间（毫秒）
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCallTime = 0;
  
  return function(this: any, ...args: Parameters<T>) {
    const now = new Date().getTime();
    if (now - lastCallTime < delay) {
      return;
    }
    lastCallTime = now;
    return func.apply(this, args);
  };
}

/**
 * 生成唯一ID
 * @param prefix 前缀
 * @returns 唯一ID
 */
export function generateId(prefix = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @param decimals 小数位数
 * @returns 格式化后的文件大小
 */
export function formatFileSize(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * 格式化数字
 * @param num 数字
 * @param decimals 小数位数
 * @param separator 千位分隔符
 * @returns 格式化后的数字
 */
export function formatNumber(num: number, decimals = 2, separator = ','): string {
  if (isNaN(num)) return '0';
  
  const parts = num.toFixed(decimals).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  
  return parts.join('.');
}

/**
 * 格式化货币
 * @param amount 金额
 * @param currency 货币符号
 * @param decimals 小数位数
 * @returns 格式化后的货币
 */
export function formatCurrency(amount: number, currency = '¥', decimals = 2): string {
  return `${currency}${formatNumber(amount, decimals)}`;
}

/**
 * 格式化百分比
 * @param value 值
 * @param decimals 小数位数
 * @returns 格式化后的百分比
 */
export function formatPercentage(value: number, decimals = 2): string {
  return `${formatNumber(value * 100, decimals)}%`;
}

/**
 * 获取URL参数
 * @param url URL字符串
 * @returns 参数对象
 */
export function getUrlParams(url?: string): Record<string, string> {
  const urlString = url || window.location.href;
  const urlObj = new URL(urlString);
  const params: Record<string, string> = {};
  
  urlObj.searchParams.forEach((value, key) => {
    params[key] = value;
  });
  
  return params;
}

/**
 * 构建URL
 * @param base 基础URL
 * @param params 参数对象
 * @returns 构建后的URL
 */
export function buildUrl(base: string, params: Record<string, any>): string {
  const url = new URL(base);
  
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null) {
      url.searchParams.set(key, String(params[key]));
    }
  });
  
  return url.toString();
}

/**
 * 下载文件
 * @param url 文件URL
 * @param filename 文件名
 */
export function downloadFile(url: string, filename?: string): void {
  const link = document.createElement('a');
  link.href = url;
  
  if (filename) {
    link.download = filename;
  }
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * 复制文本到剪贴板
 * @param text 要复制的文本
 * @returns 是否复制成功
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // 降级方案
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const result = document.execCommand('copy');
      document.body.removeChild(textArea);
      return result;
    }
  } catch (error) {
    console.error('复制到剪贴板失败:', error);
    return false;
  }
}

/**
 * 获取文件扩展名
 * @param filename 文件名
 * @returns 文件扩展名
 */
export function getFileExtension(filename: string): string {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
}

/**
 * 检查是否为移动设备
 * @returns 是否为移动设备
 */
export function isMobile(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * 检查是否为触摸设备
 * @returns 是否为触摸设备
 */
export function isTouchDevice(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * 获取浏览器信息
 * @returns 浏览器信息
 */
export function getBrowserInfo(): { name: string; version: string } {
  const ua = navigator.userAgent;
  let browserName = 'Unknown';
  let browserVersion = 'Unknown';
  
  if (ua.indexOf('Chrome') > -1) {
    browserName = 'Chrome';
    browserVersion = ua.match(/Chrome\/(\d+)/)?.[1] || 'Unknown';
  } else if (ua.indexOf('Firefox') > -1) {
    browserName = 'Firefox';
    browserVersion = ua.match(/Firefox\/(\d+)/)?.[1] || 'Unknown';
  } else if (ua.indexOf('Safari') > -1) {
    browserName = 'Safari';
    browserVersion = ua.match(/Version\/(\d+)/)?.[1] || 'Unknown';
  } else if (ua.indexOf('Edge') > -1) {
    browserName = 'Edge';
    browserVersion = ua.match(/Edge\/(\d+)/)?.[1] || 'Unknown';
  } else if (ua.indexOf('MSIE') > -1) {
    browserName = 'Internet Explorer';
    browserVersion = ua.match(/MSIE (\d+)/)?.[1] || 'Unknown';
  }
  
  return { name: browserName, version: browserVersion };
}

/**
 * 获取操作系统信息
 * @returns 操作系统信息
 */
export function getOSInfo(): { name: string; version: string } {
  const ua = navigator.userAgent;
  let osName = 'Unknown';
  let osVersion = 'Unknown';
  
  if (ua.indexOf('Windows') > -1) {
    osName = 'Windows';
    osVersion = ua.match(/Windows NT (\d+\.\d+)/)?.[1] || 'Unknown';
  } else if (ua.indexOf('Mac') > -1) {
    osName = 'macOS';
    osVersion = ua.match(/Mac OS X (\d+[._]\d+)/)?.[1]?.replace('_', '.') || 'Unknown';
  } else if (ua.indexOf('Linux') > -1) {
    osName = 'Linux';
  } else if (ua.indexOf('Android') > -1) {
    osName = 'Android';
    osVersion = ua.match(/Android (\d+\.\d+)/)?.[1] || 'Unknown';
  } else if (ua.indexOf('iOS') > -1 || ua.indexOf('iPhone') > -1 || ua.indexOf('iPad') > -1) {
    osName = 'iOS';
    osVersion = ua.match(/OS (\d+[._]\d+)/)?.[1]?.replace('_', '.') || 'Unknown';
  }
  
  return { name: osName, version: osVersion };
}

/**
 * 获取设备像素比
 * @returns 设备像素比
 */
export function getDevicePixelRatio(): number {
  return window.devicePixelRatio || 1;
}

/**
 * 获取视口尺寸
 * @returns 视口尺寸
 */
export function getViewportSize(): { width: number; height: number } {
  return {
    width: window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
    height: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,
  };
}

/**
 * 滚动到指定位置
 * @param options 滚动选项
 */
export function scrollTo(options: ScrollToOptions = { top: 0, left: 0, behavior: 'smooth' }): void {
  window.scrollTo(options);
}

/**
 * 滚动到指定元素
 * @param element 元素或选择器
 * @param offset 偏移量
 * @param behavior 滚动行为
 */
export function scrollToElement(
  element: string | Element,
  offset = 0,
  behavior: ScrollBehavior = 'smooth'
): void {
  const el = typeof element === 'string' ? document.querySelector(element) : element;
  
  if (el) {
    const top = el.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top, behavior });
  }
}

/**
 * 获取元素相对于视口的位置
 * @param element 元素
 * @returns 元素位置信息
 */
export function getElementRect(element: Element): DOMRect {
  return element.getBoundingClientRect();
}

/**
 * 检查元素是否在视口中
 * @param element 元素
 * @param threshold 阈值（0-1）
 * @returns 是否在视口中
 */
export function isElementInViewport(element: Element, threshold = 0): boolean {
  const rect = element.getBoundingClientRect();
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;
  const windowWidth = window.innerWidth || document.documentElement.clientWidth;
  
  const verticalThreshold = rect.height * threshold;
  const horizontalThreshold = rect.width * threshold;
  
  return (
    rect.top >= -verticalThreshold &&
    rect.left >= -horizontalThreshold &&
    rect.bottom <= windowHeight + verticalThreshold &&
    rect.right <= windowWidth + horizontalThreshold
  );
}

/**
 * 获取随机颜色
 * @returns 随机颜色
 */
export function getRandomColor(): string {
  return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
}

/**
 * 颜色转换：十六进制转RGB
 * @param hex 十六进制颜色
 * @returns RGB颜色
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * 颜色转换：RGB转十六进制
 * @param r 红色值
 * @param g 绿色值
 * @param b 蓝色值
 * @returns 十六进制颜色
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

/**
 * 获取颜色对比度
 * @param color1 颜色1
 * @param color2 颜色2
 * @returns 对比度
 */
export function getColorContrast(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return 0;
  
  const l1 = (0.299 * rgb1.r + 0.587 * rgb1.g + 0.114 * rgb1.b) / 255;
  const l2 = (0.299 * rgb2.r + 0.587 * rgb2.g + 0.114 * rgb2.b) / 255;
  
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

/**
 * 获取文本颜色（根据背景色自动选择黑色或白色）
 * @param backgroundColor 背景色
 * @returns 文本颜色
 */
export function getTextColor(backgroundColor: string): string {
  const rgb = hexToRgb(backgroundColor);
  
  if (!rgb) return '#000000';
  
  // 计算亮度
  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  
  return brightness > 128 ? '#000000' : '#ffffff';
}

/**
 * 数组去重
 * @param array 数组
 * @param key 对象数组去重时的键名
 * @returns 去重后的数组
 */
export function uniqueArray<T>(array: T[], key?: keyof T): T[] {
  if (!key) {
    return [...new Set(array)];
  }
  
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
}

/**
 * 数组分组
 * @param array 数组
 * @param key 分组键或分组函数
 * @returns 分组后的对象
 */
export function groupArray<T, K extends keyof T | ((item: T) => string)>(
  array: T[],
  key: K
): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const groupKey = typeof key === 'function' ? key(item) : String(item[key as keyof T]);
    
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

/**
 * 数组排序
 * @param array 数组
 * @param key 排序键或排序函数
 * @param direction 排序方向
 * @returns 排序后的数组
 */
export function sortArray<T>(
  array: T[],
  key: keyof T | ((a: T, b: T) => number),
  direction: 'asc' | 'desc' = 'asc'
): T[] {
  return [...array].sort((a, b) => {
    let compareResult = 0;
    
    if (typeof key === 'function') {
      compareResult = key(a, b);
    } else {
      const valueA = a[key];
      const valueB = b[key];
      
      if (valueA < valueB) {
        compareResult = -1;
      } else if (valueA > valueB) {
        compareResult = 1;
      }
    }
    
    return direction === 'desc' ? -compareResult : compareResult;
  });
}

/**
 * 数组分页
 * @param array 数组
 * @param page 页码
 * @param pageSize 每页数量
 * @returns 分页结果
 */
export function paginateArray<T>(
  array: T[],
  page: number,
  pageSize: number
): { data: T[]; total: number; page: number; pageSize: number; totalPages: number } {
  const total = array.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const data = array.slice(startIndex, endIndex);
  
  return {
    data,
    total,
    page,
    pageSize,
    totalPages,
  };
}

/**
 * 对象键值对转换
 * @param obj 对象
 * @returns 键值对数组
 */
export function objectToEntries<T>(obj: Record<string, T>): Array<[string, T]> {
  return Object.entries(obj);
}

/**
 * 键值对数组转对象
 * @param entries 键值对数组
 * @returns 对象
 */
export function entriesToObject<T>(entries: Array<[string, T]>): Record<string, T> {
  return Object.fromEntries(entries);
}

/**
 * 对象键名转换
 * @param obj 对象
 * @param transformer 转换函数
 * @returns 转换后的对象
 */
export function transformKeys<T extends AnyObject, R extends AnyObject>(
  obj: T,
  transformer: (key: string) => string
): R {
  return Object.keys(obj).reduce((result, key) => {
    const newKey = transformer(key);
    result[newKey as keyof R] = obj[key] as R[keyof R];
    return result;
  }, {} as R);
}

/**
 * 对象过滤
 * @param obj 对象
 * @param predicate 过滤函数
 * @returns 过滤后的对象
 */
export function filterObject<T extends AnyObject>(
  obj: T,
  predicate: (value: T[keyof T], key: keyof T) => boolean
): Partial<T> {
  return Object.keys(obj).reduce((result, key) => {
    if (predicate(obj[key], key as keyof T)) {
      result[key] = obj[key];
    }
    return result;
  }, {} as Partial<T>);
}

/**
 * 对象映射
 * @param obj 对象
 * @param mapper 映射函数
 * @returns 映射后的对象
 */
export function mapObject<T extends AnyObject, R>(
  obj: T,
  mapper: (value: T[keyof T], key: keyof T) => R
): Record<keyof T, R> {
  return Object.keys(obj).reduce((result, key) => {
    result[key as keyof T] = mapper(obj[key], key as keyof T);
    return result;
  }, {} as Record<keyof T, R>);
}

/**
 * 检查对象是否为空
 * @param obj 对象
 * @returns 是否为空
 */
export function isEmpty(obj: any): boolean {
  if (obj == null) return true;
  if (Array.isArray(obj) || typeof obj === 'string') return obj.length === 0;
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  return false;
}

/**
 * 检查值是否为空（null、undefined、空字符串、空数组、空对象）
 * @param value 值
 * @returns 是否为空
 */
export function isNil(value: any): boolean {
  return value === null || value === undefined;
}

/**
 * 检查值是否为有效的数字
 * @param value 值
 * @returns 是否为有效的数字
 */
export function isNumber(value: any): value is number {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * 检查值是否为字符串
 * @param value 值
 * @returns 是否为字符串
 */
export function isString(value: any): value is string {
  return typeof value === 'string';
}

/**
 * 检查值是否为布尔值
 * @param value 值
 * @returns 是否为布尔值
 */
export function isBoolean(value: any): value is boolean {
  return typeof value === 'boolean';
}

/**
 * 检查值是否为函数
 * @param value 值
 * @returns 是否为函数
 */
export function isFunction(value: any): value is Function {
  return typeof value === 'function';
}

/**
 * 检查值是否为对象
 * @param value 值
 * @returns 是否为对象
 */
export function isObject(value: any): value is Record<string, any> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * 检查值是否为数组
 * @param value 值
 * @returns 是否为数组
 */
export function isArray(value: any): value is any[] {
  return Array.isArray(value);
}

/**
 * 检查值是否为日期
 * @param value 值
 * @returns 是否为日期
 */
export function isDate(value: any): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

/**
 * 检查值是否为Promise
 * @param value 值
 * @returns 是否为Promise
 */
export function isPromise(value: any): value is Promise<any> {
  return value instanceof Promise || (value && typeof value.then === 'function');
}

/**
 * 检查值是否为错误对象
 * @param value 值
 * @returns 是否为错误对象
 */
export function isError(value: any): value is Error {
  return value instanceof Error;
}

/**
 * 检查邮箱格式是否正确
 * @param email 邮箱
 * @returns 是否正确
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

/**
 * 检查手机号格式是否正确
 * @param phone 手机号
 * @returns 是否正确
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
}

/**
 * 检查URL格式是否正确
 * @param url URL
 * @returns 是否正确
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * 检查身份证号格式是否正确
 * @param idCard 身份证号
 * @returns 是否正确
 */
export function isValidIdCard(idCard: string): boolean {
  const idCardRegex = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
  return idCardRegex.test(idCard);
}

/**
 * 检查密码强度
 * @param password 密码
 * @returns 密码强度（0-4）
 */
export function checkPasswordStrength(password: string): number {
  let strength = 0;
  
  // 长度检查
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  
  // 包含数字
  if (/\d/.test(password)) strength++;
  
  // 包含小写字母
  if (/[a-z]/.test(password)) strength++;
  
  // 包含大写字母
  if (/[A-Z]/.test(password)) strength++;
  
  // 包含特殊字符
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength++;
  
  return Math.min(strength, 4);
}

/**
 * 生成随机字符串
 * @param length 长度
 * @param charset 字符集
 * @returns 随机字符串
 */
export function generateRandomString(
  length = 8,
  charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
}

/**
 * 生成随机数字
 * @param min 最小值
 * @param max 最大值
 * @returns 随机数字
 */
export function generateRandomNumber(min = 0, max = 100): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 生成UUID
 * @returns UUID
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * 延迟执行
 * @param ms 延迟时间（毫秒）
 * @returns Promise
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 重试函数
 * @param fn 要重试的函数
 * @param maxRetries 最大重试次数
 * @param delay 重试间隔（毫秒）
 * @returns Promise
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (i < maxRetries) {
        await delay(delayMs);
      }
    }
  }
  
  throw lastError!;
}

/**
 * 超时Promise
 * @param promise Promise
 * @param timeoutMs 超时时间（毫秒）
 * @param errorMessage 超时错误信息
 * @returns Promise
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage = 'Operation timed out'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs);
    }),
  ]);
}

/**
 * 缓存函数结果
 * @param fn 要缓存的函数
 * @param getKey 获取缓存键的函数
 * @returns 缓存后的函数
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  getKey?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>) => {
    const key = getKey ? getKey(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

/**
 * 创建事件发射器
 * @returns 事件发射器
 */
export function createEventEmitter<T extends Record<string, any[]>>() {
  const listeners = new Map<keyof T, Array<(...args: any[]) => void>>();
  
  return {
    on<K extends keyof T>(event: K, listener: (...args: T[K]) => void) {
      if (!listeners.has(event)) {
        listeners.set(event, []);
      }
      listeners.get(event)!.push(listener);
      
      return () => {
        const eventListeners = listeners.get(event);
        if (eventListeners) {
          const index = eventListeners.indexOf(listener);
          if (index > -1) {
            eventListeners.splice(index, 1);
          }
        }
      };
    },
    
    emit<K extends keyof T>(event: K, ...args: T[K]) {
      const eventListeners = listeners.get(event);
      if (eventListeners) {
        eventListeners.forEach(listener => {
          listener(...args);
        });
      }
    },
    
    off<K extends keyof T>(event: K, listener?: (...args: T[K]) => void) {
      if (!listener) {
        listeners.delete(event);
        return;
      }
      
      const eventListeners = listeners.get(event);
      if (eventListeners) {
        const index = eventListeners.indexOf(listener);
        if (index > -1) {
          eventListeners.splice(index, 1);
        }
      }
    },
    
    once<K extends keyof T>(event: K, listener: (...args: T[K]) => void) {
      const onceListener = (...args: T[K]) => {
        listener(...args);
        this.off(event, onceListener);
      };
      
      this.on(event, onceListener);
    },
  };
}