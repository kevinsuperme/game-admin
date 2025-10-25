// HTTP客户端实现
import axios from 'axios';
import type { AxiosInstance } from 'axios';
import type { ApiResponse } from '@/domains/shared/types';

// 创建axios实例
const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
httpClient.interceptors.request.use(
  (config) => {
    // 添加认证token
    const token = localStorage.getItem('super-admin-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 添加请求ID
    config.headers['X-Request-ID'] = generateRequestId();
    
    // 记录请求日志
    if (import.meta.env.DEV) {
      console.log(`[HTTP Request] ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data,
      });
    }
    
    return config;
  },
  (error) => {
    console.error('[HTTP Request Error]', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
httpClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    // 记录响应日志
    if (import.meta.env.DEV) {
      console.log(`[HTTP Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
    }
    
    // 处理业务错误
    if (response.data && !response.data.success) {
      return Promise.reject(new Error(response.data.error || '请求失败'));
    }
    
    return response;
  },
  async (error: AxiosError<ApiResponse>) => {
    // 记录错误日志
    if (import.meta.env.DEV) {
      console.error(`[HTTP Response Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
    }
    
    // 处理401未授权错误
    if (error.response?.status === 401) {
      // 清除本地token
      localStorage.removeItem('super-admin-token');
      
      // 重定向到登录页面
      window.location.href = '/login';
      return Promise.reject(error);
    }
    
    // 处理403禁止访问错误
    if (error.response?.status === 403) {
      // 可以显示权限不足的提示
      console.error('权限不足');
      return Promise.reject(error);
    }
    
    // 处理网络错误
    if (!error.response) {
      return Promise.reject(new Error('网络错误，请检查网络连接'));
    }
    
    // 处理其他HTTP错误
    const errorMessage = error.response.data?.error || error.message || '请求失败';
    return Promise.reject(new Error(errorMessage));
  }
);

// 生成请求ID
function generateRequestId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 封装GET请求
export function get<T = any>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> {
  return httpClient.get(url, { params, ...config }).then(res => res.data);
}

// 封装POST请求
export function post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  return httpClient.post(url, data, config).then(res => res.data);
}

// 封装PUT请求
export function put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  return httpClient.put(url, data, config).then(res => res.data);
}

// 封装DELETE请求
export function del<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
  return httpClient.delete(url, config).then(res => res.data);
}

// 封装文件上传
export function upload<T = any>(url: string, file: File, onProgress?: (progress: number) => void): Promise<T> {
  const formData = new FormData();
  formData.append('file', file);
  
  return httpClient.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(progress);
      }
    },
  }).then(res => res.data);
}

// 封装批量上传
export function uploadMultiple<T = any>(
  url: string, 
  files: File[], 
  onProgress?: (progress: number) => void
): Promise<T> {
  const formData = new FormData();
  files.forEach((file, index) => {
    formData.append(`files[${index}]`, file);
  });
  
  return httpClient.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(progress);
      }
    },
  }).then(res => res.data);
}

// 封装下载请求
export function download(url: string, filename?: string, params?: any): Promise<void> {
  return httpClient.get(url, {
    params,
    responseType: 'blob',
  }).then((response) => {
    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || getFilenameFromResponse(response);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  });
}

// 从响应头获取文件名
function getFilenameFromResponse(response: AxiosResponse): string {
  const contentDisposition = response.headers['content-disposition'];
  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(/filename="(.+)"/);
    if (filenameMatch && filenameMatch[1]) {
      return filenameMatch[1];
    }
  }
  return 'download';
}

// 设置默认baseURL
export function setBaseURL(baseURL: string): void {
  httpClient.defaults.baseURL = baseURL;
}

// 设置默认headers
export function setHeaders(headers: Record<string, string>): void {
  Object.assign(httpClient.defaults.headers, headers);
}

// 设置认证token
export function setAuthToken(token: string): void {
  httpClient.defaults.headers.Authorization = `Bearer ${token}`;
}

// 清除认证token
export function clearAuthToken(): void {
  delete httpClient.defaults.headers.Authorization;
}

// 取消请求
export function createCancelToken() {
  return axios.CancelToken.source();
}

// 检查是否为取消请求的错误
export function isCancel(error: any): boolean {
  return axios.isCancel(error);
}

// 导出httpClient实例
export { httpClient };
export default httpClient;