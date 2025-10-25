// 共享域类型定义

// 日志相关类型
export type { LogLevel, LogEntry } from './logging';

// API响应通用类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: number;
}

// 分页相关类型
export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginationData<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 排序相关类型
export interface SortParams {
  field: string;
  order: 'asc' | 'desc';
}

// 过滤相关类型
export interface FilterParams {
  [key: string]: any;
}

// 查询参数类型
export interface QueryParams extends PaginationParams {
  sort?: SortParams;
  filter?: FilterParams;
  search?: string;
}

// 错误类型
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp?: string;
  stack?: string;
}

// 加载状态类型
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// 表单相关类型
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'checkbox' | 'radio' | 'textarea' | 'date';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: Array<{ label: string; value: any }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: RegExp;
    custom?: (value: any) => boolean | string;
  };
}

// 表单验证结果类型
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// 通知类型
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
  actions?: Array<{
    label: string;
    action: () => void;
    primary?: boolean;
  }>;
}

// 模态框类型
export interface ModalOptions {
  title: string;
  content: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
}

// 主题相关类型
export interface ThemeConfig {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  warning: string;
  success: string;
  info: string;
}

// 语言相关类型
export interface LocaleConfig {
  code: string;
  name: string;
  flag: string;
  messages: Record<string, string>;
}

// 路由元信息类型
export interface RouteMeta {
  title?: string;
  requiresAuth?: boolean;
  roles?: string[];
  permissions?: string[];
  keepAlive?: boolean;
  hidden?: boolean;
  icon?: string;
  breadcrumb?: boolean;
  affix?: boolean;
  noCache?: boolean;
}

// 菜单项类型
export interface MenuItem {
  id: string;
  title: string;
  path?: string;
  icon?: string;
  badge?: string | number;
  children?: MenuItem[];
  disabled?: boolean;
  hidden?: boolean;
  external?: boolean;
  target?: '_blank' | '_self';
}

// 文件上传相关类型
export interface UploadFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress?: number;
  error?: string;
}

// 表格列定义类型
export interface TableColumn<T = any> {
  key: keyof T;
  title: string;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  filterable?: boolean;
  fixed?: 'left' | 'right';
  render?: (value: any, record: T, index: number) => any;
}

// 图表数据类型
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface ChartData {
  title?: string;
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'area';
  data: ChartDataPoint[];
  options?: Record<string, any>;
}