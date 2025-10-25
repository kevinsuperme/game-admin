/**
 * API 层域
 * 提供统一的 API 调用接口和类型定义
 */

/**
 * API 响应基础结构
 */
export interface ApiResponse<T = any> {
  code: number;
  data: T;
  message: string;
  timestamp?: number;
}

/**
 * 分页参数
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * 分页响应
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * 文件上传参数
 */
export interface UploadParams {
  file: File;
  onProgress?: (progress: number) => void;
  folder?: string;
}

/**
 * 文件信息
 */
export interface FileInfo {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
  folder?: string;
}

/**
 * 搜索参数
 */
export interface SearchParams extends PaginationParams {
  keyword: string;
  filters?: Record<string, any>;
}

/**
 * 批量操作参数
 */
export interface BatchOperationParams {
  ids: string[];
  action: string;
  data?: Record<string, any>;
}

/**
 * 导出参数
 */
export interface ExportParams {
  format: 'csv' | 'excel' | 'pdf';
  filters?: Record<string, any>;
  fields?: string[];
}

/**
 * 统计数据
 */
export interface Statistics {
  [key: string]: number | string | Statistics;
}

/**
 * API 错误
 */
export class ApiError extends Error {
  constructor(
    public code: number,
    message: string,
    public data?: any,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * API 客户端接口
 */
export interface ApiClient {
  // HTTP 方法
  get<T = any>(url: string, params?: Record<string, any>): Promise<ApiResponse<T>>;
  post<T = any>(url: string, data?: Record<string, any>): Promise<ApiResponse<T>>;
  put<T = any>(url: string, data?: Record<string, any>): Promise<ApiResponse<T>>;
  patch<T = any>(url: string, data?: Record<string, any>): Promise<ApiResponse<T>>;
  delete<T = any>(url: string, params?: Record<string, any>): Promise<ApiResponse<T>>;

  // 文件上传
  upload(params: UploadParams): Promise<ApiResponse<FileInfo>>;

  // 批量上传
  uploadBatch(files: File[], folder?: string): Promise<ApiResponse<FileInfo[]>>;

  // 文件下载
  download(url: string, filename?: string): Promise<void>;

  // 请求拦截器
  addRequestInterceptor(
    onFulfilled?: (config: any) => any,
    onRejected?: (error: any) => any,
  ): number;

  // 响应拦截器
  addResponseInterceptor(
    onFulfilled?: (response: any) => any,
    onRejected?: (error: any) => any,
  ): number;

  // 移除拦截器
  removeInterceptor(type: 'request' | 'response', id: number): void;
}

/**
 * 资源 API 基础接口
 */
export interface ResourceApi<T, CreateDTO = Partial<T>, UpdateDTO = Partial<T>> {
  // 列表查询
  list(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<T>>>;

  // 详情查询
  get(id: string): Promise<ApiResponse<T>>;

  // 创建
  create(data: CreateDTO): Promise<ApiResponse<T>>;

  // 更新
  update(id: string, data: UpdateDTO): Promise<ApiResponse<T>>;

  // 删除
  delete(id: string): Promise<ApiResponse<null>>;

  // 批量删除
  batchDelete(ids: string[]): Promise<ApiResponse<null>>;

  // 搜索
  search(params: SearchParams): Promise<ApiResponse<PaginatedResponse<T>>>;

  // 导出
  export(params: ExportParams): Promise<Blob>;

  // 统计
  statistics(params?: Record<string, any>): Promise<ApiResponse<Statistics>>;
}

/**
 * 用户 API 接口
 */
export interface UserApi extends ResourceApi<any> {
  // 获取当前用户信息
  getCurrentUser(): Promise<ApiResponse<any>>;

  // 更新当前用户信息
  updateCurrentUser(data: any): Promise<ApiResponse<any>>;

  // 修改密码
  changePassword(oldPassword: string, newPassword: string): Promise<ApiResponse<null>>;

  // 上传头像
  uploadAvatar(file: File): Promise<ApiResponse<string>>;

  // 获取用户权限
  getPermissions(userId?: string): Promise<ApiResponse<string[]>>;

  // 获取用户角色
  getRoles(userId?: string): Promise<ApiResponse<any[]>>;
}

/**
 * 认证 API 接口
 */
export interface AuthApi {
  // 登录
  login(credentials: any): Promise<ApiResponse<any>>;

  // 登出
  logout(): Promise<ApiResponse<null>>;

  // 刷新令牌
  refreshToken(refreshToken: string): Promise<ApiResponse<any>>;

  // 注册
  register(data: any): Promise<ApiResponse<any>>;

  // 忘记密码
  forgotPassword(email: string): Promise<ApiResponse<null>>;

  // 重置密码
  resetPassword(token: string, newPassword: string): Promise<ApiResponse<null>>;

  // 验证令牌
  verifyToken(token: string): Promise<ApiResponse<boolean>>;

  // 发送验证码
  sendVerificationCode(email: string): Promise<ApiResponse<null>>;

  // 验证验证码
  verifyCode(email: string, code: string): Promise<ApiResponse<boolean>>;
}

/**
 * 文件 API 接口
 */
export interface FileApi {
  // 上传文件
  upload(params: UploadParams): Promise<ApiResponse<FileInfo>>;

  // 批量上传
  uploadBatch(files: File[], folder?: string): Promise<ApiResponse<FileInfo[]>>;

  // 下载文件
  download(id: string): Promise<Blob>;

  // 删除文件
  delete(id: string): Promise<ApiResponse<null>>;

  // 批量删除
  batchDelete(ids: string[]): Promise<ApiResponse<null>>;

  // 获取文件列表
  list(params?: PaginationParams & { folder?: string }): Promise<ApiResponse<PaginatedResponse<FileInfo>>>;

  // 创建文件夹
  createFolder(name: string, parent?: string): Promise<ApiResponse<{
    id: string;
    name: string;
    parent?: string;
  }>>;

  // 获取文件夹列表
  getFolders(parent?: string): Promise<ApiResponse<Array<{
    id: string;
    name: string;
    parent?: string;
    createdAt: string;
  }>>>;

  // 删除文件夹
  deleteFolder(id: string): Promise<ApiResponse<null>>;
}

/**
 * 通知 API 接口
 */
export interface NotificationApi {
  // 获取通知列表
  list(params?: PaginationParams & { read?: boolean }): Promise<ApiResponse<PaginatedResponse<any>>>;

  // 标记为已读
  markAsRead(ids: string[]): Promise<ApiResponse<null>>;

  // 标记全部为已读
  markAllAsRead(): Promise<ApiResponse<null>>;

  // 删除通知
  delete(ids: string[]): Promise<ApiResponse<null>>;

  // 获取未读数量
  getUnreadCount(): Promise<ApiResponse<number>>;

  // 订阅通知
  subscribe(topics: string[]): Promise<ApiResponse<null>>;

  // 取消订阅
  unsubscribe(topics: string[]): Promise<ApiResponse<null>>;
}

/**
 * 系统 API 接口
 */
export interface SystemApi {
  // 获取系统信息
  getInfo(): Promise<ApiResponse<any>>;

  // 获取系统配置
  getConfig(): Promise<ApiResponse<Record<string, any>>>;

  // 更新系统配置
  updateConfig(config: Record<string, any>): Promise<ApiResponse<null>>;

  // 健康检查
  health(): Promise<ApiResponse<{ status: string; checks: Record<string, any> }>>;

  // 获取日志
  getLogs(params?: PaginationParams & { level?: string; start?: string; end?: string }): Promise<ApiResponse<PaginatedResponse<any>>>;

  // 清理缓存
  clearCache(keys?: string[]): Promise<ApiResponse<null>>;

  // 系统备份
  backup(): Promise<Blob>;

  // 系统还原
  restore(file: File): Promise<ApiResponse<null>>;
}

/**
 * API 工厂接口
 */
export interface ApiFactory {
  createUserApi(): UserApi;
  createAuthApi(): AuthApi;
  createFileApi(): FileApi;
  createNotificationApi(): NotificationApi;
  createSystemApi(): SystemApi;
  createResourceApi<T>(resource: string): ResourceApi<T>;
}

/**
 * 默认导出
 */
export default {
  ApiError,
};