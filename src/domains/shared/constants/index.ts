// 共享域常量定义

// HTTP状态码
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

// 请求方法
export const HTTP_METHOD = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
  HEAD: 'HEAD',
  OPTIONS: 'OPTIONS',
} as const;

// 内容类型
export const CONTENT_TYPE = {
  JSON: 'application/json',
  FORM_DATA: 'multipart/form-data',
  URL_ENCODED: 'application/x-www-form-urlencoded',
  TEXT: 'text/plain',
  HTML: 'text/html',
  XML: 'application/xml',
} as const;

// 分页默认配置
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  DEFAULT_PAGE: 1,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;

// 表格配置
export const TABLE = {
  DEFAULT_PAGE_SIZE: 10,
  DEFAULT_PAGE: 1,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  SELECTION_TYPE: {
    NONE: 'none',
    SINGLE: 'single',
    MULTIPLE: 'multiple',
  },
  SORT_DIRECTION: {
    ASC: 'asc',
    DESC: 'desc',
  },
} as const;

// 表单配置
export const FORM = {
  VALIDATE_TRIGGER: {
    CHANGE: 'change',
    BLUR: 'blur',
    SUBMIT: 'submit',
  },
  LAYOUT: {
    HORIZONTAL: 'horizontal',
    VERTICAL: 'vertical',
    INLINE: 'inline',
  },
  SIZE: {
    SMALL: 'small',
    MEDIUM: 'medium',
    LARGE: 'large',
  },
} as const;

// 通知配置
export const NOTIFICATION = {
  TYPE: {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info',
  },
  POSITION: {
    TOP_RIGHT: 'top-right',
    TOP_LEFT: 'top-left',
    TOP_CENTER: 'top-center',
    BOTTOM_RIGHT: 'bottom-right',
    BOTTOM_LEFT: 'bottom-left',
    BOTTOM_CENTER: 'bottom-center',
  },
  DURATION: {
    NONE: 0,
    SHORT: 3000,
    MEDIUM: 4500,
    LONG: 6000,
  },
} as const;

// 模态框配置
export const MODAL = {
  SIZE: {
    SMALL: 'small',
    MEDIUM: 'medium',
    LARGE: 'large',
    FULL: 'full',
  },
  DEFAULT_WIDTH: {
    SMALL: 520,
    MEDIUM: 720,
    LARGE: 1000,
  },
} as const;

// 主题配置
export const THEME = {
  MODE: {
    LIGHT: 'light',
    DARK: 'dark',
    AUTO: 'auto',
  },
  STORAGE_KEY: 'super-admin-theme',
  CLASS_PREFIX: 'theme-',
} as const;

// 响应式断点
export const BREAKPOINTS = {
  XS: 0,
  SM: 576,
  MD: 768,
  LG: 992,
  XL: 1200,
  XXL: 1400,
} as const;

// 设备类型
export const DEVICE = {
  MOBILE: 'mobile',
  TABLET: 'tablet',
  DESKTOP: 'desktop',
} as const;

// 浏览器类型
export const BROWSER = {
  CHROME: 'chrome',
  FIREFOX: 'firefox',
  SAFARI: 'safari',
  EDGE: 'edge',
  IE: 'ie',
} as const;

// 操作系统类型
export const OS = {
  WINDOWS: 'windows',
  MACOS: 'macos',
  LINUX: 'linux',
  IOS: 'ios',
  ANDROID: 'android',
} as const;

// 存储键名
export const STORAGE_KEYS = {
  TOKEN: 'super-admin-token',
  USER_INFO: 'super-admin-user-info',
  PERMISSIONS: 'super-admin-permissions',
  THEME: 'super-admin-theme',
  LANGUAGE: 'super-admin-language',
  SIDEBAR_COLLAPSED: 'super-admin-sidebar-collapsed',
  TABS: 'super-admin-tabs',
} as const;

// 路由名称
export const ROUTE_NAMES = {
  DASHBOARD: 'Dashboard',
  LOGIN: 'Login',
  REGISTER: 'Register',
  FORGOT_PASSWORD: 'ForgotPassword',
  PROFILE: 'Profile',
  SETTINGS: 'Settings',
  ERROR_403: 'Error403',
  ERROR_404: 'Error404',
  ERROR_500: 'Error500',
} as const;

// 权限标识
export const PERMISSIONS = {
  VIEW: 'view',
  CREATE: 'create',
  EDIT: 'edit',
  DELETE: 'delete',
  EXPORT: 'export',
  IMPORT: 'import',
  ADMIN: 'admin',
} as const;

// 日志级别
export const LOG_LEVEL = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
} as const;

// 日期格式
export const DATE_FORMAT = {
  DATE: 'YYYY-MM-DD',
  TIME: 'HH:mm:ss',
  DATETIME: 'YYYY-MM-DD HH:mm:ss',
  TIMESTAMP: 'YYYY-MM-DD HH:mm:ss.SSS',
} as const;

// 文件类型
export const FILE_TYPE = {
  IMAGE: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'],
  DOCUMENT: ['doc', 'docx', 'pdf', 'txt', 'rtf'],
  SPREADSHEET: ['xls', 'xlsx', 'csv'],
  PRESENTATION: ['ppt', 'pptx'],
  ARCHIVE: ['zip', 'rar', '7z', 'tar', 'gz'],
  VIDEO: ['mp4', 'avi', 'mkv', 'mov', 'wmv'],
  AUDIO: ['mp3', 'wav', 'flac', 'aac'],
} as const;

// 文件大小限制（字节）
export const FILE_SIZE_LIMIT = {
  IMAGE: 5 * 1024 * 1024, // 5MB
  DOCUMENT: 10 * 1024 * 1024, // 10MB
  VIDEO: 100 * 1024 * 1024, // 100MB
  DEFAULT: 10 * 1024 * 1024, // 10MB
} as const;

// 正则表达式
export const REGEX = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PHONE: /^1[3-9]\d{9}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  USERNAME: /^[a-zA-Z0-9_-]{4,16}$/,
  URL: /^https?:\/\/[^\s/$.?#].[^\s]*$/,
  IP: /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  ID_CARD: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/,
  CHINESE: /^[\u4e00-\u9fa5]+$/,
  NUMBER: /^\d+$/,
  DECIMAL: /^\d+(\.\d+)?$/,
} as const;

// 键盘按键码
export const KEY_CODES = {
  ENTER: 13,
  ESC: 27,
  SPACE: 32,
  TAB: 9,
  BACKSPACE: 8,
  DELETE: 46,
  ARROW_UP: 38,
  ARROW_DOWN: 40,
  ARROW_LEFT: 37,
  ARROW_RIGHT: 39,
  F1: 112,
  F2: 113,
  F3: 114,
  F4: 115,
  F5: 116,
  F6: 117,
  F7: 118,
  F8: 119,
  F9: 120,
  F10: 121,
  F11: 122,
  F12: 123,
} as const;

// 动画持续时间（毫秒）
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

// 防抖和节流默认配置
export const DEBOUNCE_THROTTLE = {
  DEFAULT_DELAY: 300,
  SEARCH_DELAY: 500,
  RESIZE_DELAY: 100,
  SCROLL_DELAY: 16,
} as const;

// API版本
export const API_VERSION = {
  V1: 'v1',
  V2: 'v2',
} as const;

// 环境类型
export const ENV_TYPE = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  TEST: 'test',
} as const;

// 缓存时间（秒）
export const CACHE_TIME = {
  SHORT: 60, // 1分钟
  MEDIUM: 300, // 5分钟
  LONG: 1800, // 30分钟
  VERY_LONG: 3600, // 1小时
} as const;