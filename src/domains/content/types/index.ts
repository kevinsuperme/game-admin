// 内容域类型定义
// 定义内容管理相关的类型和接口

// 基础内容类型
export interface Content {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  type: ContentType;
  status: ContentStatus;
  visibility: ContentVisibility;
  authorId: string;
  authorName: string;
  categoryId?: string;
  categoryName?: string;
  tags: string[];
  featuredImage?: string;
  images?: string[];
  attachments?: string[];
  publishedAt?: string;
  scheduledAt?: string;
  createdAt: string;
  updatedAt: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string[];
    ogImage?: string;
    canonicalUrl?: string;
  };
  settings?: {
    allowComments: boolean;
    allowLikes: boolean;
    allowShares: boolean;
    password?: string;
    expirationDate?: string;
  };
  analytics?: {
    readTime: number;
    bounceRate: number;
    avgTimeOnPage: number;
    conversionRate: number;
  };
}

// 内容类型
export type ContentType = 
  | 'article'
  | 'page'
  | 'blog'
  | 'news'
  | 'tutorial'
  | 'documentation'
  | 'announcement'
  | 'product'
  | 'event'
  | 'video'
  | 'gallery'
  | 'custom';

// 内容状态
export type ContentStatus = 
  | 'draft'
  | 'review'
  | 'published'
  | 'scheduled'
  | 'archived'
  | 'trashed';

// 内容可见性
export type ContentVisibility = 
  | 'public'
  | 'private'
  | 'password'
  | 'members'
  | 'roles';

// 内容分类
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  parentName?: string;
  icon?: string;
  color?: string;
  image?: string;
  contentCount: number;
  createdAt: string;
  updatedAt: string;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string[];
  };
}

// 内容标签
export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  contentCount: number;
  createdAt: string;
  updatedAt: string;
}

// 内容评论
export interface Comment {
  id: string;
  contentId: string;
  parentId?: string;
  authorId: string;
  authorName: string;
  authorEmail?: string;
  authorAvatar?: string;
  authorIp?: string;
  content: string;
  status: CommentStatus;
  createdAt: string;
  updatedAt: string;
  likes: number;
  replies: number;
  repliesList?: Comment[];
}

// 评论状态
export type CommentStatus = 
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'spam'
  | 'trashed';

// 内容媒体
export interface Media {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  duration?: number;
  path: string;
  url: string;
  thumbnailUrl?: string;
  alt?: string;
  caption?: string;
  description?: string;
  authorId: string;
  authorName: string;
  folderId?: string;
  folderName?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// 媒体文件夹
export interface MediaFolder {
  id: string;
  name: string;
  parentId?: string;
  parentName?: string;
  path: string;
  mediaCount: number;
  createdAt: string;
  updatedAt: string;
}

// 内容版本
export interface ContentVersion {
  id: string;
  contentId: string;
  version: number;
  title: string;
  content: string;
  excerpt?: string;
  authorId: string;
  authorName: string;
  changeLog?: string;
  createdAt: string;
}

// 内容模板
export interface ContentTemplate {
  id: string;
  name: string;
  description?: string;
  type: ContentType;
  thumbnail?: string;
  content: string;
  fields: TemplateField[];
  authorId: string;
  authorName: string;
  isDefault: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

// 模板字段
export interface TemplateField {
  id: string;
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  defaultValue?: any;
  options?: FieldOption[];
  validation?: FieldValidation;
  placeholder?: string;
  description?: string;
}

// 字段类型
export type FieldType = 
  | 'text'
  | 'textarea'
  | 'richtext'
  | 'number'
  | 'email'
  | 'url'
  | 'date'
  | 'datetime'
  | 'time'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'radio'
  | 'file'
  | 'image'
  | 'video'
  | 'color'
  | 'range'
  | 'toggle'
  | 'repeater'
  | 'group';

// 字段选项
export interface FieldOption {
  label: string;
  value: any;
}

// 字段验证
export interface FieldValidation {
  min?: number;
  max?: number;
  pattern?: string;
  message?: string;
}

// 内容表单数据
export interface CreateContentData {
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  type: ContentType;
  status: ContentStatus;
  visibility: ContentVisibility;
  categoryId?: string;
  tags: string[];
  featuredImage?: string;
  images?: string[];
  attachments?: string[];
  publishedAt?: string;
  scheduledAt?: string;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string[];
    ogImage?: string;
    canonicalUrl?: string;
  };
  settings?: {
    allowComments: boolean;
    allowLikes: boolean;
    allowShares: boolean;
    password?: string;
    expirationDate?: string;
  };
}

export interface UpdateContentData extends Partial<CreateContentData> {
  id: string;
}

// 内容查询参数
export interface ContentQuery {
  page?: number;
  pageSize?: number;
  type?: ContentType;
  status?: ContentStatus;
  visibility?: ContentVisibility;
  authorId?: string;
  categoryId?: string;
  tags?: string[];
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  dateFrom?: string;
  dateTo?: string;
  featured?: boolean;
}

// 内容统计
export interface ContentStats {
  total: number;
  published: number;
  draft: number;
  scheduled: number;
  archived: number;
  trashed: number;
  byType: Record<ContentType, number>;
  byStatus: Record<ContentStatus, number>;
  byCategory: Record<string, number>;
  byAuthor: Record<string, number>;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  avgReadTime: number;
  topContent: Content[];
}

// 内容搜索结果
export interface ContentSearchResult {
  content: Content;
  highlights: {
    title?: string;
    excerpt?: string;
    content?: string;
  };
  score: number;
}

// 内容导入导出
export interface ContentImport {
  file: File;
  type: 'csv' | 'xlsx' | 'json' | 'xml';
  options: {
    mapping: Record<string, string>;
    skipFirstRow: boolean;
    updateExisting: boolean;
    createCategories: boolean;
    createTags: boolean;
  };
}

export interface ContentExport {
  type: 'csv' | 'xlsx' | 'json' | 'xml';
  filters: ContentQuery;
  fields: string[];
  options: {
    includeMedia: boolean;
    includeComments: boolean;
    includeAnalytics: boolean;
  };
}

// 内容工作流
export interface ContentWorkflow {
  id: string;
  name: string;
  description?: string;
  steps: WorkflowStep[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowStep {
  id: string;
  name: string;
  description?: string;
  type: 'manual' | 'automatic';
  assignee?: string;
  assigneeRole?: string;
  conditions?: WorkflowCondition[];
  actions?: WorkflowAction[];
  order: number;
}

export interface WorkflowCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than';
  value: any;
}

export interface WorkflowAction {
  type: 'update_status' | 'send_notification' | 'assign_user' | 'add_tag' | 'remove_tag' | 'schedule_publish';
  value: any;
}

// 内容审核
export interface ContentReview {
  id: string;
  contentId: string;
  reviewerId: string;
  reviewerName: string;
  status: 'pending' | 'approved' | 'rejected' | 'needs_changes';
  feedback?: string;
  changes?: ContentChange[];
  createdAt: string;
  updatedAt: string;
}

export interface ContentChange {
  field: string;
  oldValue: any;
  newValue: any;
  reason?: string;
}

// 内容协作
export interface ContentCollaboration {
  id: string;
  contentId: string;
  userId: string;
  userName: string;
  role: 'owner' | 'editor' | 'reviewer' | 'commenter';
  permissions: string[];
  invitedAt: string;
  acceptedAt?: string;
  lastActiveAt?: string;
}

// 内容订阅
export interface ContentSubscription {
  id: string;
  userId: string;
  contentId?: string;
  categoryId?: string;
  tagId?: string;
  authorId?: string;
  type: 'content' | 'category' | 'tag' | 'author';
  notifications: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

// 内容分析
export interface ContentAnalytics {
  id: string;
  contentId: string;
  date: string;
  views: number;
  uniqueViews: number;
  avgTimeOnPage: number;
  bounceRate: number;
  exitRate: number;
  conversions: number;
  conversionRate: number;
  shares: number;
  likes: number;
  comments: number;
  downloads: number;
  referrers: Record<string, number>;
  devices: Record<string, number>;
  browsers: Record<string, number>;
  locations: Record<string, number>;
}

// 内容状态管理
export interface ContentState {
  contents: Content[];
  currentContent: Content | null;
  categories: Category[];
  tags: Tag[];
  comments: Comment[];
  media: Media[];
  mediaFolders: MediaFolder[];
  templates: ContentTemplate[];
  versions: ContentVersion[];
  stats: ContentStats | null;
  loading: boolean;
  error: string | null;
  query: ContentQuery;
  total: number;
}