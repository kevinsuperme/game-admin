// 通用工具函数集合

// 日期时间工具
export const dateUtils = {
  /**
   * 格式化日期
   * @param date 日期对象或时间戳
   * @param format 格式字符串，默认为 'YYYY-MM-DD HH:mm:ss'
   * @returns 格式化后的日期字符串
   */
  format(date: Date | number | string, format = 'YYYY-MM-DD HH:mm:ss'): string {
    const d = new Date(date);
    
    if (isNaN(d.getTime())) {
      return '';
    }
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    
    return format
      .replace('YYYY', String(year))
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  },

  /**
   * 获取相对时间描述
   * @param date 日期对象或时间戳
   * @returns 相对时间描述，如 '刚刚', '5分钟前', '2小时前' 等
   */
  getRelativeTime(date: Date | number | string): string {
    const now = new Date();
    const target = new Date(date);
    const diff = now.getTime() - target.getTime();
    
    // 计算时间差
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(months / 12);
    
    if (years > 0) {
      return `${years}年前`;
    } else if (months > 0) {
      return `${months}个月前`;
    } else if (days > 0) {
      return `${days}天前`;
    } else if (hours > 0) {
      return `${hours}小时前`;
    } else if (minutes > 0) {
      return `${minutes}分钟前`;
    } else if (seconds > 0) {
      return `${seconds}秒前`;
    } else {
      return '刚刚';
    }
  },

  /**
   * 判断是否为同一天
   * @param date1 第一个日期
   * @param date2 第二个日期
   * @returns 是否为同一天
   */
  isSameDay(date1: Date | number | string, date2: Date | number | string): boolean {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  },

  /**
   * 获取日期范围
   * @param type 范围类型：'today', 'yesterday', 'thisWeek', 'lastWeek', 'thisMonth', 'lastMonth', 'thisYear', 'lastYear'
   * @returns 日期范围对象，包含 start 和 end
   */
  getDateRange(type: string): { start: Date; end: Date } {
    const now = new Date();
    const start = new Date();
    const end = new Date();
    
    switch (type) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'yesterday':
        start.setDate(now.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        end.setDate(now.getDate() - 1);
        end.setHours(23, 59, 59, 999);
        break;
      case 'thisWeek':
        const dayOfWeek = now.getDay();
        start.setDate(now.getDate() - dayOfWeek);
        start.setHours(0, 0, 0, 0);
        end.setDate(now.getDate() + (6 - dayOfWeek));
        end.setHours(23, 59, 59, 999);
        break;
      case 'lastWeek':
        const lastWeekDay = now.getDay();
        start.setDate(now.getDate() - lastWeekDay - 7);
        start.setHours(0, 0, 0, 0);
        end.setDate(now.getDate() - lastWeekDay - 1);
        end.setHours(23, 59, 59, 999);
        break;
      case 'thisMonth':
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(now.getMonth() + 1, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'lastMonth':
        start.setMonth(now.getMonth() - 1, 1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(now.getMonth(), 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'thisYear':
        start.setMonth(0, 1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(11, 31);
        end.setHours(23, 59, 59, 999);
        break;
      case 'lastYear':
        start.setFullYear(now.getFullYear() - 1, 0, 1);
        start.setHours(0, 0, 0, 0);
        end.setFullYear(now.getFullYear() - 1, 11, 31);
        end.setHours(23, 59, 59, 999);
        break;
      default:
        throw new Error(`Unsupported date range type: ${type}`);
    }
    
    return { start, end };
  },
};

// 字符串工具
export const stringUtils = {
  /**
   * 首字母大写
   * @param str 字符串
   * @returns 首字母大写的字符串
   */
  capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  /**
   * 驼峰命名转换
   * @param str 字符串
   * @returns 驼峰命名的字符串
   */
  camelCase(str: string): string {
    return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
  },

  /**
   * 短横线命名转换
   * @param str 字符串
   * @returns 短横线命名的字符串
   */
  kebabCase(str: string): string {
    return str.replace(/([A-Z])/g, '-$1').toLowerCase();
  },

  /**
   * 下划线命名转换
   * @param str 字符串
   * @returns 下划线命名的字符串
   */
  snakeCase(str: string): string {
    return str.replace(/([A-Z])/g, '_$1').toLowerCase();
  },

  /**
   * 生成随机字符串
   * @param length 字符串长度
   * @param charset 字符集
   * @returns 随机字符串
   */
  random(length = 8, charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'): string {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return result;
  },

  /**
   * 截断字符串
   * @param str 字符串
   * @param maxLength 最大长度
   * @param suffix 后缀
   * @returns 截断后的字符串
   */
  truncate(str: string, maxLength: number, suffix = '...'): string {
    if (str.length <= maxLength) {
      return str;
    }
    return str.substring(0, maxLength - suffix.length) + suffix;
  },

  /**
   * 转换为HTML实体
   * @param str 字符串
   * @returns 转换后的字符串
   */
  escapeHtml(str: string): string {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  /**
   * 从HTML实体转换回来
   * @param str 字符串
   * @returns 转换后的字符串
   */
  unescapeHtml(str: string): string {
    const div = document.createElement('div');
    div.innerHTML = str;
    return div.textContent || div.innerText || '';
  },
};

// 数字工具
export const numberUtils = {
  /**
   * 格式化数字
   * @param num 数字
   * @param decimals 小数位数
   * @param thousandsSeparator 千位分隔符
   * @returns 格式化后的数字字符串
   */
  format(num: number, decimals = 2, thousandsSeparator = ','): string {
    const parts = num.toFixed(decimals).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);
    return parts.join('.');
  },

  /**
   * 格式化文件大小
   * @param bytes 字节数
   * @param decimals 小数位数
   * @returns 格式化后的文件大小字符串
   */
  formatFileSize(bytes: number, decimals = 2): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
  },

  /**
   * 生成随机数字
   * @param min 最小值
   * @param max 最大值
   * @param decimals 小数位数
   * @returns 随机数字
   */
  random(min = 0, max = 100, decimals = 0): number {
    const random = Math.random() * (max - min) + min;
    return decimals > 0 ? parseFloat(random.toFixed(decimals)) : Math.floor(random);
  },

  /**
   * 限制数字在指定范围内
   * @param num 数字
   * @param min 最小值
   * @param max 最大值
   * @returns 限制后的数字
   */
  clamp(num: number, min: number, max: number): number {
    return Math.min(Math.max(num, min), max);
  },
};

// 对象工具
export const objectUtils = {
  /**
   * 深拷贝对象
   * @param obj 要拷贝的对象
   * @returns 拷贝后的对象
   */
  deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    
    if (obj instanceof Date) {
      return new Date(obj.getTime()) as unknown as T;
    }
    
    if (obj instanceof Array) {
      return obj.map(item => objectUtils.deepClone(item)) as unknown as T;
    }
    
    if (typeof obj === 'object') {
      const clonedObj = {} as T;
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          clonedObj[key] = objectUtils.deepClone(obj[key]);
        }
      }
      return clonedObj;
    }
    
    return obj;
  },

  /**
   * 合并对象
   * @param target 目标对象
   * @param sources 源对象数组
   * @returns 合并后的对象
   */
  merge<T extends object>(target: T, ...sources: Partial<T>[]): T {
    if (!sources.length) return target;
    const source = sources.shift();
    
    if (source) {
      for (const key in source) {
        if (source.hasOwnProperty(key)) {
          if (
            typeof source[key] === 'object' &&
            source[key] !== null &&
            !Array.isArray(source[key])
          ) {
            if (!target[key]) {
              target[key] = {} as any;
            }
            objectUtils.merge(target[key] as any, source[key] as any);
          } else {
            target[key] = source[key] as any;
          }
        }
      }
    }
    
    return objectUtils.merge(target, ...sources);
  },

  /**
   * 获取对象属性值（支持点号路径）
   * @param obj 对象
   * @param path 属性路径
   * @param defaultValue 默认值
   * @returns 属性值
   */
  get(obj: any, path: string, defaultValue?: any): any {
    const keys = path.split('.');
    let result = obj;
    
    for (const key of keys) {
      if (result === null || result === undefined || !result.hasOwnProperty(key)) {
        return defaultValue;
      }
      result = result[key];
    }
    
    return result;
  },

  /**
   * 设置对象属性值（支持点号路径）
   * @param obj 对象
   * @param path 属性路径
   * @param value 属性值
   */
  set(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    let current = obj;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }
    
    current[keys[keys.length - 1]] = value;
  },

  /**
   * 检查对象是否为空
   * @param obj 对象
   * @returns 是否为空
   */
  isEmpty(obj: any): boolean {
    if (obj == null) return true;
    if (Array.isArray(obj) || typeof obj === 'string') return obj.length === 0;
    if (typeof obj === 'object') return Object.keys(obj).length === 0;
    return false;
  },
};

// 数组工具
export const arrayUtils = {
  /**
   * 数组去重
   * @param arr 数组
   * @param key 可选的键名，用于对象数组去重
   * @returns 去重后的数组
   */
  unique<T>(arr: T[], key?: keyof T): T[] {
    if (key) {
      const seen = new Set();
      return arr.filter(item => {
        const value = item[key];
        if (seen.has(value)) {
          return false;
        }
        seen.add(value);
        return true;
      });
    }
    return [...new Set(arr)];
  },

  /**
   * 数组分块
   * @param arr 数组
   * @param size 块大小
   * @returns 分块后的二维数组
   */
  chunk<T>(arr: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  },

  /**
   * 数组扁平化
   * @param arr 数组
   * @param depth 扁平化深度，默认为1
   * @returns 扁平化后的数组
   */
  flatten<T>(arr: any[], depth = 1): T[] {
    return depth > 0 ? arr.reduce((acc, val) => acc.concat(Array.isArray(val) ? arrayUtils.flatten(val, depth - 1) : val), []) : arr.slice();
  },

  /**
   * 数组随机排序
   * @param arr 数组
   * @returns 随机排序后的数组
   */
  shuffle<T>(arr: T[]): T[] {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  },

  /**
   * 数组求和
   * @param arr 数组
   * @param key 可选的键名，用于对象数组求和
   * @returns 总和
   */
  sum(arr: number[], key?: string): number {
    if (key) {
      return arr.reduce((sum, item) => sum + (item as any)[key], 0);
    }
    return arr.reduce((sum, item) => sum + item, 0);
  },

  /**
   * 数组求平均值
   * @param arr 数组
   * @param key 可选的键名，用于对象数组求平均值
   * @returns 平均值
   */
  average(arr: number[], key?: string): number {
    if (arr.length === 0) return 0;
    return arrayUtils.sum(arr, key) / arr.length;
  },
};

// URL工具
export const urlUtils = {
  /**
   * 获取URL参数
   * @param url 可选的URL，默认为当前页面URL
   * @returns 参数对象
   */
  getParams(url?: string): Record<string, string> {
    const urlString = url || window.location.href;
    const urlObj = new URL(urlString);
    const params: Record<string, string> = {};
    
    urlObj.searchParams.forEach((value, key) => {
      params[key] = value;
    });
    
    return params;
  },

  /**
   * 设置URL参数
   * @param params 参数对象
   * @param url 可选的URL，默认为当前页面URL
   * @returns 新的URL
   */
  setParams(params: Record<string, string>, url?: string): string {
    const urlString = url || window.location.href;
    const urlObj = new URL(urlString);
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        urlObj.searchParams.set(key, params[key]);
      } else {
        urlObj.searchParams.delete(key);
      }
    });
    
    return urlObj.toString();
  },

  /**
   * 获取URL路径
   * @param url 可选的URL，默认为当前页面URL
   * @returns 路径部分
   */
  getPath(url?: string): string {
    const urlString = url || window.location.href;
    const urlObj = new URL(urlString);
    return urlObj.pathname;
  },

  /**
   * 获取URL域名
   * @param url 可选的URL，默认为当前页面URL
   * @returns 域名部分
   */
  getDomain(url?: string): string {
    const urlString = url || window.location.href;
    const urlObj = new URL(urlString);
    return urlObj.hostname;
  },
};

// 浏览器工具
export const browserUtils = {
  /**
   * 获取浏览器信息
   * @returns 浏览器信息对象
   */
  getBrowserInfo(): {
    name: string;
    version: string;
    os: string;
    isMobile: boolean;
  } {
    const userAgent = navigator.userAgent;
    let name = 'Unknown';
    let version = 'Unknown';
    let os = 'Unknown';
    
    // 检测浏览器名称和版本
    if (userAgent.indexOf('Firefox') > -1) {
      name = 'Firefox';
      version = userAgent.match(/Firefox\/(\d+)/)?.[1] || 'Unknown';
    } else if (userAgent.indexOf('Chrome') > -1) {
      name = 'Chrome';
      version = userAgent.match(/Chrome\/(\d+)/)?.[1] || 'Unknown';
    } else if (userAgent.indexOf('Safari') > -1) {
      name = 'Safari';
      version = userAgent.match(/Version\/(\d+)/)?.[1] || 'Unknown';
    } else if (userAgent.indexOf('Edge') > -1) {
      name = 'Edge';
      version = userAgent.match(/Edge\/(\d+)/)?.[1] || 'Unknown';
    }
    
    // 检测操作系统
    if (userAgent.indexOf('Windows') > -1) {
      os = 'Windows';
    } else if (userAgent.indexOf('Mac') > -1) {
      os = 'macOS';
    } else if (userAgent.indexOf('Linux') > -1) {
      os = 'Linux';
    } else if (userAgent.indexOf('Android') > -1) {
      os = 'Android';
    } else if (userAgent.indexOf('iOS') > -1) {
      os = 'iOS';
    }
    
    // 检测是否为移动设备
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    
    return {
      name,
      version,
      os,
      isMobile,
    };
  },

  /**
   * 复制文本到剪贴板
   * @param text 要复制的文本
   * @returns 是否成功
   */
  async copyToClipboard(text: string): Promise<boolean> {
    try {
      if (navigator.clipboard) {
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
      console.error('Failed to copy text to clipboard:', error);
      return false;
    }
  },

  /**
   * 下载文件
   * @param url 文件URL
   * @param filename 文件名
   */
  downloadFile(url: string, filename?: string): void {
    const link = document.createElement('a');
    link.href = url;
    if (filename) {
      link.download = filename;
    }
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  /**
   * 打开新窗口
   * @param url URL
   * @param target 目标，默认为 '_blank'
   * @param features 窗口特性
   * @returns 窗口对象
   */
  openWindow(url: string, target = '_blank', features?: string): Window | null {
    return window.open(url, target, features);
  },

  /**
   * 检查是否为全屏模式
   * @returns 是否为全屏模式
   */
  isFullscreen(): boolean {
    return !!(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement
    );
  },

  /**
   * 进入全屏模式
   * @param element 要全屏的元素，默认为document.documentElement
   */
  enterFullscreen(element = document.documentElement): Promise<void> {
    if (element.requestFullscreen) {
      return element.requestFullscreen();
    } else if ((element as any).webkitRequestFullscreen) {
      return (element as any).webkitRequestFullscreen();
    } else if ((element as any).mozRequestFullScreen) {
      return (element as any).mozRequestFullScreen();
    } else if ((element as any).msRequestFullscreen) {
      return (element as any).msRequestFullscreen();
    } else {
      return Promise.reject(new Error('Fullscreen not supported'));
    }
  },

  /**
   * 退出全屏模式
   */
  exitFullscreen(): Promise<void> {
    if (document.exitFullscreen) {
      return document.exitFullscreen();
    } else if ((document as any).webkitExitFullscreen) {
      return (document as any).webkitExitFullscreen();
    } else if ((document as any).mozCancelFullScreen) {
      return (document as any).mozCancelFullScreen();
    } else if ((document as any).msExitFullscreen) {
      return (document as any).msExitFullscreen();
    } else {
      return Promise.reject(new Error('Fullscreen not supported'));
    }
  },
};

// 验证工具
export const validationUtils = {
  /**
   * 验证邮箱
   * @param email 邮箱地址
   * @returns 是否有效
   */
  isEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },

  /**
   * 验证手机号
   * @param phone 手机号
   * @returns 是否有效
   */
  isPhone(phone: string): boolean {
    const regex = /^1[3-9]\d{9}$/;
    return regex.test(phone);
  },

  /**
   * 验证身份证号
   * @param idCard 身份证号
   * @returns 是否有效
   */
  isIdCard(idCard: string): boolean {
    const regex = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
    return regex.test(idCard);
  },

  /**
   * 验证URL
   * @param url URL
   * @returns 是否有效
   */
  isUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * 验证IP地址
   * @param ip IP地址
   * @returns 是否有效
   */
  isIp(ip: string): boolean {
    const regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return regex.test(ip);
  },

  /**
   * 验证密码强度
   * @param password 密码
   * @returns 密码强度等级：0-弱，1-中，2-强
   */
  getPasswordStrength(password: string): 0 | 1 | 2 {
    let strength = 0;
    
    // 长度检查
    if (password.length >= 8) strength++;
    
    // 包含数字
    if (/\d/.test(password)) strength++;
    
    // 包含小写字母
    if (/[a-z]/.test(password)) strength++;
    
    // 包含大写字母
    if (/[A-Z]/.test(password)) strength++;
    
    // 包含特殊字符
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength++;
    
    if (strength <= 2) return 0; // 弱
    if (strength <= 4) return 1; // 中
    return 2; // 强
  },
};

// 防抖和节流
export const debounceUtils = {
  /**
   * 防抖函数
   * @param func 要防抖的函数
   * @param wait 等待时间（毫秒）
   * @returns 防抖后的函数
   */
  debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout>;
    
    return function(this: any, ...args: Parameters<T>) {
      const context = this;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
  },

  /**
   * 节流函数
   * @param func 要节流的函数
   * @param wait 等待时间（毫秒）
   * @returns 节流后的函数
   */
  throttle<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
    let lastTime = 0;
    
    return function(this: any, ...args: Parameters<T>) {
      const context = this;
      const now = Date.now();
      
      if (now - lastTime >= wait) {
        lastTime = now;
        func.apply(context, args);
      }
    };
  },
};

// 导出所有工具
export default {
  date: dateUtils,
  string: stringUtils,
  number: numberUtils,
  object: objectUtils,
  array: arrayUtils,
  url: urlUtils,
  browser: browserUtils,
  validation: validationUtils,
  debounce: debounceUtils,
};