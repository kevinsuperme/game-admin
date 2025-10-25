// 内容域入口文件
// 提供内容相关的类型、服务、状态管理和工具函数的统一导出

// 域名称
export const CONTENT_DOMAIN_NAME = 'content';

// 路由配置
export const CONTENT_ROUTES = [
  {
    path: '/content',
    name: 'Content',
    component: () => import('./views/ContentLayout.vue'),
    meta: {
      title: '内容管理',
      icon: 'document-text',
      requiresAuth: true,
    },
    children: [
      {
        path: 'articles',
        name: 'ContentArticles',
        component: () => import('./views/ContentArticles.vue'),
        meta: {
          title: '文章管理',
          icon: 'article',
          requiresAuth: true,
        },
      },
      {
        path: 'articles/create',
        name: 'ContentArticleCreate',
        component: () => import('./views/ContentArticleCreate.vue'),
        meta: {
          title: '创建文章',
          icon: 'plus',
          requiresAuth: true,
          hidden: true,
        },
      },
      {
        path: 'articles/:id',
        name: 'ContentArticleDetail',
        component: () => import('./views/ContentArticleDetail.vue'),
        meta: {
          title: '文章详情',
          requiresAuth: true,
          hidden: true,
        },
      },
      {
        path: 'articles/:id/edit',
        name: 'ContentArticleEdit',
        component: () => import('./views/ContentArticleEdit.vue'),
        meta: {
          title: '编辑文章',
          requiresAuth: true,
          hidden: true,
        },
      },
      {
        path: 'pages',
        name: 'ContentPages',
        component: () => import('./views/ContentPages.vue'),
        meta: {
          title: '页面管理',
          icon: 'document',
          requiresAuth: true,
        },
      },
      {
        path: 'pages/create',
        name: 'ContentPageCreate',
        component: () => import('./views/ContentPageCreate.vue'),
        meta: {
          title: '创建页面',
          icon: 'plus',
          requiresAuth: true,
          hidden: true,
        },
      },
      {
        path: 'pages/:id',
        name: 'ContentPageDetail',
        component: () => import('./views/ContentPageDetail.vue'),
        meta: {
          title: '页面详情',
          requiresAuth: true,
          hidden: true,
        },
      },
      {
        path: 'pages/:id/edit',
        name: 'ContentPageEdit',
        component: () => import('./views/ContentPageEdit.vue'),
        meta: {
          title: '编辑页面',
          requiresAuth: true,
          hidden: true,
        },
      },
      {
        path: 'categories',
        name: 'ContentCategories',
        component: () => import('./views/ContentCategories.vue'),
        meta: {
          title: '分类管理',
          icon: 'folder',
          requiresAuth: true,
        },
      },
      {
        path: 'tags',
        name: 'ContentTags',
        component: () => import('./views/ContentTags.vue'),
        meta: {
          title: '标签管理',
          icon: 'tag',
          requiresAuth: true,
        },
      },
      {
        path: 'comments',
        name: 'ContentComments',
        component: () => import('./views/ContentComments.vue'),
        meta: {
          title: '评论管理',
          icon: 'chat',
          requiresAuth: true,
        },
      },
      {
        path: 'media',
        name: 'ContentMedia',
        component: () => import('./views/ContentMedia.vue'),
        meta: {
          title: '媒体管理',
          icon: 'photo',
          requiresAuth: true,
        },
      },
      {
        path: 'templates',
        name: 'ContentTemplates',
        component: () => import('./views/ContentTemplates.vue'),
        meta: {
          title: '模板管理',
          icon: 'layout',
          requiresAuth: true,
        },
      },
      {
        path: 'workflows',
        name: 'ContentWorkflows',
        component: () => import('./views/ContentWorkflows.vue'),
        meta: {
          title: '工作流管理',
          icon: 'git-branch',
          requiresAuth: true,
        },
      },
      {
        path: 'reviews',
        name: 'ContentReviews',
        component: () => import('./views/ContentReviews.vue'),
        meta: {
          title: '审核管理',
          icon: 'check-circle',
          requiresAuth: true,
        },
      },
      {
        path: 'analytics',
        name: 'ContentAnalytics',
        component: () => import('./views/ContentAnalytics.vue'),
        meta: {
          title: '内容分析',
          icon: 'chart',
          requiresAuth: true,
        },
      },
      {
        path: 'settings',
        name: 'ContentSettings',
        component: () => import('./views/ContentSettings.vue'),
        meta: {
          title: '内容设置',
          icon: 'cog',
          requiresAuth: true,
        },
      },
    ],
  },
];

// 内容类型枚举
export enum ContentType {
  ARTICLE = 'article',
  PAGE = 'page',
  POST = 'post',
  NEWS = 'news',
  TUTORIAL = 'tutorial',
  DOCUMENTATION = 'documentation',
  FAQ = 'faq',
  BLOG = 'blog',
}

// 内容状态枚举
export enum ContentStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  PENDING = 'pending',
  SCHEDULED = 'scheduled',
  ARCHIVED = 'archived',
  TRASH = 'trash',
}

// 评论状态枚举
export enum CommentStatus {
  APPROVED = 'approved',
  PENDING = 'pending',
  REJECTED = 'rejected',
  SPAM = 'spam',
}

// 媒体类型枚举
export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
  ARCHIVE = 'archive',
}

// 工作流状态枚举
export enum WorkflowStatus {
  DRAFT = 'draft',
  IN_REVIEW = 'in_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PUBLISHED = 'published',
}

// 审核状态枚举
export enum ReviewStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CHANGES_REQUESTED = 'changes_requested',
}

// 内容权限枚举
export enum ContentPermission {
  VIEW = 'view',
  CREATE = 'create',
  EDIT = 'edit',
  DELETE = 'delete',
  PUBLISH = 'publish',
  MANAGE = 'manage',
  COMMENT = 'comment',
  REVIEW = 'review',
}

// 内容操作枚举
export enum ContentAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  PUBLISH = 'publish',
  UNPUBLISH = 'unpublish',
  ARCHIVE = 'archive',
  RESTORE = 'restore',
  DUPLICATE = 'duplicate',
  SCHEDULE = 'schedule',
  APPROVE = 'approve',
  REJECT = 'reject',
  LIKE = 'like',
  UNLIKE = 'unlike',
  COMMENT = 'comment',
  SHARE = 'share',
  EXPORT = 'export',
  IMPORT = 'import',
}

// 内容排序枚举
export enum ContentSort {
  CREATED_AT_DESC = 'createdAt_desc',
  CREATED_AT_ASC = 'createdAt_asc',
  UPDATED_AT_DESC = 'updatedAt_desc',
  UPDATED_AT_ASC = 'updatedAt_asc',
  PUBLISHED_AT_DESC = 'publishedAt_desc',
  PUBLISHED_AT_ASC = 'publishedAt_asc',
  TITLE_ASC = 'title_asc',
  TITLE_DESC = 'title_desc',
  VIEWS_DESC = 'views_desc',
  VIEWS_ASC = 'views_asc',
  LIKES_DESC = 'likes_desc',
  LIKES_ASC = 'likes_asc',
  COMMENTS_DESC = 'comments_desc',
  COMMENTS_ASC = 'comments_asc',
}

// 内容过滤枚举
export enum ContentFilter {
  ALL = 'all',
  PUBLISHED = 'published',
  DRAFT = 'draft',
  PENDING = 'pending',
  SCHEDULED = 'scheduled',
  ARCHIVED = 'archived',
  TRASH = 'trash',
  FEATURED = 'featured',
  STICKY = 'sticky',
  AUTHOR = 'author',
  CATEGORY = 'category',
  TAG = 'tag',
  DATE_RANGE = 'date_range',
}

// 内容搜索类型枚举
export enum ContentSearchType {
  TITLE = 'title',
  CONTENT = 'content',
  EXCERPT = 'excerpt',
  AUTHOR = 'author',
  CATEGORY = 'category',
  TAG = 'tag',
  ALL = 'all',
}

// 内容导入格式枚举
export enum ContentImportFormat {
  JSON = 'json',
  CSV = 'csv',
  XML = 'xml',
  WORDPRESS = 'wordpress',
  MARKDOWN = 'markdown',
}

// 内容导出格式枚举
export enum ContentExportFormat {
  JSON = 'json',
  CSV = 'csv',
  XML = 'xml',
  PDF = 'pdf',
  WORD = 'word',
  MARKDOWN = 'markdown',
}

// 内容通知类型枚举
export enum ContentNotificationType {
  PUBLISHED = 'published',
  UPDATED = 'updated',
  COMMENTED = 'commented',
  MENTIONED = 'mentioned',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SCHEDULED = 'scheduled',
}

// 内容协作角色枚举
export enum ContentCollaborationRole {
  OWNER = 'owner',
  EDITOR = 'editor',
  CONTRIBUTOR = 'contributor',
  REVIEWER = 'reviewer',
  VIEWER = 'viewer',
}

// 内容订阅类型枚举
export enum ContentSubscriptionType {
  CONTENT = 'content',
  CATEGORY = 'category',
  TAG = 'tag',
  AUTHOR = 'author',
  COMMENT = 'comment',
}

// 内容分析指标枚举
export enum ContentAnalyticsMetric {
  VIEWS = 'views',
  UNIQUE_VIEWS = 'unique_views',
  LIKES = 'likes',
  COMMENTS = 'comments',
  SHARES = 'shares',
  DOWNLOADS = 'downloads',
  CONVERSIONS = 'conversions',
  BOUNCE_RATE = 'bounce_rate',
  TIME_ON_PAGE = 'time_on_page',
  READ_PROGRESS = 'read_progress',
}

// 内容分析时间范围枚举
export enum ContentAnalyticsTimeRange {
  TODAY = 'today',
  YESTERDAY = 'yesterday',
  LAST_7_DAYS = 'last_7_days',
  LAST_30_DAYS = 'last_30_days',
  LAST_90_DAYS = 'last_90_days',
  LAST_YEAR = 'last_year',
  CUSTOM = 'custom',
}

// 内容配置
export const CONTENT_CONFIG = {
  // 默认分页大小
  defaultPageSize: 20,
  
  // 最大分页大小
  maxPageSize: 100,
  
  // 默认排序
  defaultSort: ContentSort.CREATED_AT_DESC,
  
  // 支持的内容类型
  supportedContentTypes: Object.values(ContentType),
  
  // 支持的媒体类型
  supportedMediaTypes: Object.values(MediaType),
  
  // 支持的导入格式
  supportedImportFormats: Object.values(ContentImportFormat),
  
  // 支持的导出格式
  supportedExportFormats: Object.values(ContentExportFormat),
  
  // 支持的分析指标
  supportedAnalyticsMetrics: Object.values(ContentAnalyticsMetric),
  
  // 支持的分析时间范围
  supportedAnalyticsTimeRanges: Object.values(ContentAnalyticsTimeRange),
  
  // 图片上传限制
  imageUploadLimit: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  },
  
  // 视频上传限制
  videoUploadLimit: {
    maxSize: 100 * 1024 * 1024, // 100MB
    allowedTypes: ['video/mp4', 'video/webm', 'video/ogg'],
  },
  
  // 音频上传限制
  audioUploadLimit: {
    maxSize: 20 * 1024 * 1024, // 20MB
    allowedTypes: ['audio/mp3', 'audio/wav', 'audio/ogg'],
  },
  
  // 文档上传限制
  documentUploadLimit: {
    maxSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'text/csv',
    ],
  },
  
  // 内容编辑器配置
  editorConfig: {
    toolbar: [
      'bold',
      'italic',
      'underline',
      'strikethrough',
      'heading',
      'quote',
      'code',
      'link',
      'image',
      'video',
      'table',
      'list',
      'orderedList',
      'checkList',
      'indent',
      'outdent',
      'alignLeft',
      'alignCenter',
      'alignRight',
      'alignJustify',
      'undo',
      'redo',
      'fullscreen',
    ],
    height: 400,
    placeholder: '请输入内容...',
    autoSave: true,
    autoSaveInterval: 30000, // 30秒
  },
  
  // 评论配置
  commentConfig: {
    maxLength: 1000,
    allowHtml: false,
    autoApprove: false,
    requireAuth: true,
    enableReplies: true,
    enableLikes: true,
    enableReports: true,
  },
  
  // 工作流配置
  workflowConfig: {
    enableApproval: true,
    enableScheduledPublish: true,
    enableVersionControl: true,
    enableCollaboration: true,
    maxVersions: 50,
  },
  
  // 分析配置
  analyticsConfig: {
    enableTracking: true,
    enableHeatmap: true,
    enableScrollTracking: true,
    enableClickTracking: true,
    enableConversionTracking: true,
    trackingInterval: 5000, // 5秒
  },
};

// 导出类型定义
export type {
  Content,
  Category,
  Tag,
  Comment,
  Media,
  MediaFolder,
  ContentVersion,
  ContentTemplate,
  CreateContentData,
  UpdateContentData,
  ContentQuery,
  ContentStats,
  ContentSearchResult,
  ContentImport,
  ContentExport,
  ContentWorkflow,
  ContentReview,
  ContentCollaboration,
  ContentSubscription,
  ContentAnalytics,
} from './types';

// 导出服务
export {
  contentService,
  ContentService,
  ContentServiceImpl,
  categoryService,
  CategoryService,
  CategoryServiceImpl,
  tagService,
  TagService,
  TagServiceImpl,
  commentService,
  CommentService,
  CommentServiceImpl,
  mediaService,
  MediaService,
  MediaServiceImpl,
  templateService,
  TemplateService,
  TemplateServiceImpl,
  workflowService,
  WorkflowService,
  WorkflowServiceImpl,
  reviewService,
  ReviewService,
  ReviewServiceImpl,
  contentManagementService,
  ContentManagementService,
  ContentManagementServiceImpl,
} from './services';

// 导出状态管理
export {
  useContentStore,
  useCategoryStore,
  useTagStore,
  useCommentStore,
  useMediaStore,
  useContentManagementStore,
} from './stores';

// 导出工具函数
export {
  // 内容工具函数
  createContentSlug,
  generateContentExcerpt,
  formatContentDate,
  calculateReadingTime,
  getContentWordCount,
  getContentStatusColor,
  getContentStatusText,
  getContentTypeName,
  canUserEditContent,
  canUserDeleteContent,
  canUserPublishContent,
  canUserCommentContent,
  canUserReviewContent,
  validateContentData,
  sanitizeContentHtml,
  extractContentImages,
  extractContentLinks,
  optimizeContentForSEO,
  generateContentMeta,
  createContentSchema,
  
  // 分类工具函数
  createCategorySlug,
  getCategoryPath,
  getCategoryBreadcrumbs,
  getCategoryTree,
  getCategoryOptions,
  canUserEditCategory,
  canUserDeleteCategory,
  validateCategoryData,
  
  // 标签工具函数
  createTagSlug,
  getPopularTags,
  getTagOptions,
  canUserEditTag,
  canUserDeleteTag,
  validateTagData,
  
  // 评论工具函数
  createCommentHtml,
  formatCommentDate,
  canUserEditComment,
  canUserDeleteComment,
  canUserApproveComment,
  validateCommentData,
  sanitizeCommentHtml,
  
  // 媒体工具函数
  getMediaUrl,
  getMediaThumbnailUrl,
  getMediaDimensions,
  getMediaSize,
  getMediaDuration,
  getMediaIcon,
  getMediaType,
  canUserEditMedia,
  canUserDeleteMedia,
  validateMediaData,
  optimizeMediaImage,
  generateMediaThumbnail,
  
  // 模板工具函数
  renderTemplate,
  parseTemplateVariables,
  validateTemplateData,
  getTemplateOptions,
  canUserEditTemplate,
  canUserDeleteTemplate,
  
  // 工作流工具函数
  createWorkflowStep,
  getNextWorkflowStep,
  canUserApproveContent,
  canUserRejectContent,
  getWorkflowStatusColor,
  getWorkflowStatusText,
  
  // 审核工具函数
  createReviewComment,
  getReviewStatusColor,
  getReviewStatusText,
  canUserReviewContent,
  validateReviewData,
  
  // 分析工具函数
  calculateEngagementRate,
  calculateBounceRate,
  calculateConversionRate,
  getTopPerformingContent,
  getContentTrends,
  generateContentReport,
  
  // 搜索工具函数
  searchContent,
  searchCategories,
  searchTags,
  searchComments,
  searchMedia,
  buildSearchQuery,
  parseSearchQuery,
  
  // 导入导出工具函数
  importContentFromJson,
  importContentFromCsv,
  importContentFromXml,
  exportContentToJson,
  exportContentToCsv,
  exportContentToXml,
  exportContentToPdf,
  validateImportData,
  
  // 通知工具函数
  sendContentNotification,
  sendCommentNotification,
  sendReviewNotification,
  sendWorkflowNotification,
  createNotificationTemplate,
  
  // 协作工具函数
  addContentCollaborator,
  removeContentCollaborator,
  updateCollaboratorRole,
  getCollaboratorPermissions,
  canUserCollaborateOnContent,
  
  // 订阅工具函数
  subscribeToContent,
  unsubscribeFromContent,
  getSubscribedContent,
  sendSubscriptionNotification,
  
  // 备份工具函数
  backupContent,
  restoreContent,
  validateBackupData,
  scheduleContentBackup,
  
  // 清理工具函数
  cleanupTrash,
  cleanupOldRevisions,
  cleanupOrphanedMedia,
  optimizeImages,
  generateThumbnails,
  
  // SEO工具函数
  generateContentSitemap,
  generateContentRobots,
  generateContentCanonical,
  generateContentOpenGraph,
  generateContentTwitterCard,
  analyzeContentSEO,
  optimizeContentSEO,
  
  // 安全工具函数
  sanitizeContentInput,
  validateContentPermissions,
  checkContentAccess,
  logContentActivity,
  
  // 性能工具函数
  cacheContent,
  clearContentCache,
  preloadContent,
  lazyLoadContentImages,
  optimizeContentLoading,
  
  // 工具函数
  debounce,
  throttle,
  deepClone,
  deepMerge,
  formatDate,
  formatFileSize,
  formatNumber,
  generateId,
  isValidUrl,
  isValidEmail,
  truncateText,
  capitalizeFirstLetter,
  camelCaseToKebabCase,
  kebabCaseToCamelCase,
  removeHtmlTags,
  escapeHtml,
  unescapeHtml,
} from './utils';