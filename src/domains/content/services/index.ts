// 内容域服务
// 提供内容管理相关的服务

import type {
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
} from '../types';

// 内容服务接口
export interface ContentService {
  // 内容管理
  getContents(query?: ContentQuery): Promise<{ contents: Content[]; total: number }>;
  getContentById(id: string): Promise<Content | null>;
  createContent(data: CreateContentData): Promise<Content>;
  updateContent(data: UpdateContentData): Promise<Content>;
  deleteContent(id: string): Promise<boolean>;
  duplicateContent(id: string): Promise<Content>;
  publishContent(id: string): Promise<Content>;
  unpublishContent(id: string): Promise<Content>;
  scheduleContent(id: string, scheduledAt: string): Promise<Content>;
  archiveContent(id: string): Promise<Content>;
  trashContent(id: string): Promise<Content>;
  restoreContent(id: string): Promise<Content>;
  
  // 内容搜索
  searchContents(query: string, filters?: ContentQuery): Promise<ContentSearchResult[]>;
  
  // 内容导入导出
  importContent(importData: ContentImport): Promise<{ success: number; failed: number; errors: string[] }>;
  exportContent(exportData: ContentExport): Promise<Blob>;
  
  // 内容版本管理
  getContentVersions(contentId: string): Promise<ContentVersion[]>;
  getContentVersion(contentId: string, version: number): Promise<ContentVersion | null>;
  createContentVersion(contentId: string, changeLog?: string): Promise<ContentVersion>;
  restoreContentVersion(contentId: string, version: number): Promise<Content>;
  
  // 内容协作
  getContentCollaborations(contentId: string): Promise<ContentCollaboration[]>;
  addContentCollaboration(contentId: string, userId: string, role: string): Promise<ContentCollaboration>;
  updateContentCollaboration(id: string, role: string): Promise<ContentCollaboration>;
  removeContentCollaboration(id: string): Promise<boolean>;
  
  // 内容订阅
  subscribeToContent(subscription: Omit<ContentSubscription, 'id' | 'createdAt' | 'updatedAt'>): Promise<ContentSubscription>;
  unsubscribeFromContent(id: string): Promise<boolean>;
  getContentSubscriptions(userId: string): Promise<ContentSubscription[]>;
  
  // 内容分析
  getContentAnalytics(contentId: string, dateFrom?: string, dateTo?: string): Promise<ContentAnalytics[]>;
  getContentStats(query?: ContentQuery): Promise<ContentStats>;
  
  // 批量操作
  batchUpdateContents(ids: string[], data: Partial<UpdateContentData>): Promise<Content[]>;
  batchDeleteContents(ids: string[]): Promise<boolean>;
  batchPublishContents(ids: string[]): Promise<Content[]>;
  batchUnpublishContents(ids: string[]): Promise<Content[]>;
  batchArchiveContents(ids: string[]): Promise<Content[]>;
  batchTrashContents(ids: string[]): Promise<Content[]>;
  batchRestoreContents(ids: string[]): Promise<Content[]>;
}

// 分类服务接口
export interface CategoryService {
  getCategories(): Promise<Category[]>;
  getCategoryById(id: string): Promise<Category | null>;
  getCategoryBySlug(slug: string): Promise<Category | null>;
  createCategory(data: Omit<Category, 'id' | 'contentCount' | 'createdAt' | 'updatedAt'>): Promise<Category>;
  updateCategory(id: string, data: Partial<Category>): Promise<Category>;
  deleteCategory(id: string): Promise<boolean>;
  getCategoryTree(): Promise<Category[]>;
  reorderCategories(categories: { id: string; order: number; parentId?: string }[]): Promise<Category[]>;
}

// 标签服务接口
export interface TagService {
  getTags(): Promise<Tag[]>;
  getTagById(id: string): Promise<Tag | null>;
  getTagBySlug(slug: string): Promise<Tag | null>;
  createTag(data: Omit<Tag, 'id' | 'contentCount' | 'createdAt' | 'updatedAt'>): Promise<Tag>;
  updateTag(id: string, data: Partial<Tag>): Promise<Tag>;
  deleteTag(id: string): Promise<boolean>;
  getPopularTags(limit?: number): Promise<Tag[]>;
  searchTags(query: string): Promise<Tag[]>;
}

// 评论服务接口
export interface CommentService {
  getComments(contentId?: string, status?: string): Promise<Comment[]>;
  getCommentById(id: string): Promise<Comment | null>;
  createComment(data: Omit<Comment, 'id' | 'createdAt' | 'updatedAt' | 'likes' | 'replies'>): Promise<Comment>;
  updateComment(id: string, data: Partial<Comment>): Promise<Comment>;
  deleteComment(id: string): Promise<boolean>;
  approveComment(id: string): Promise<Comment>;
  rejectComment(id: string): Promise<Comment>;
  markAsSpam(id: string): Promise<Comment>;
  getCommentReplies(commentId: string): Promise<Comment[]>;
  likeComment(id: string): Promise<Comment>;
  unlikeComment(id: string): Promise<Comment>;
  batchApproveComments(ids: string[]): Promise<Comment[]>;
  batchRejectComments(ids: string[]): Promise<Comment[]>;
  batchDeleteComments(ids: string[]): Promise<boolean>;
}

// 媒体服务接口
export interface MediaService {
  getMedia(folderId?: string, query?: { page?: number; pageSize?: number; search?: string; type?: string }): Promise<{ media: Media[]; total: number }>;
  getMediaById(id: string): Promise<Media | null>;
  uploadMedia(file: File, folderId?: string, metadata?: Record<string, any>): Promise<Media>;
  updateMedia(id: string, data: Partial<Media>): Promise<Media>;
  deleteMedia(id: string): Promise<boolean>;
  moveMedia(id: string, folderId?: string): Promise<Media>;
  copyMedia(id: string, folderId?: string): Promise<Media>;
  
  // 媒体文件夹
  getMediaFolders(): Promise<MediaFolder[]>;
  getMediaFolderById(id: string): Promise<MediaFolder | null>;
  createMediaFolder(data: Omit<MediaFolder, 'id' | 'mediaCount' | 'createdAt' | 'updatedAt'>): Promise<MediaFolder>;
  updateMediaFolder(id: string, data: Partial<MediaFolder>): Promise<MediaFolder>;
  deleteMediaFolder(id: string): Promise<boolean>;
  moveMediaFolder(id: string, parentId?: string): Promise<MediaFolder>;
  
  // 媒体搜索
  searchMedia(query: string, filters?: { type?: string; folderId?: string }): Promise<Media[]>;
  
  // 批量操作
  batchDeleteMedia(ids: string[]): Promise<boolean>;
  batchMoveMedia(ids: string[], folderId?: string): Promise<Media[]>;
  batchUpdateMedia(ids: string[], data: Partial<Media>): Promise<Media[]>;
}

// 模板服务接口
export interface TemplateService {
  getTemplates(type?: string): Promise<ContentTemplate[]>;
  getTemplateById(id: string): Promise<ContentTemplate | null>;
  createTemplate(data: Omit<ContentTemplate, 'id' | 'usageCount' | 'createdAt' | 'updatedAt'>): Promise<ContentTemplate>;
  updateTemplate(id: string, data: Partial<ContentTemplate>): Promise<ContentTemplate>;
  deleteTemplate(id: string): Promise<boolean>;
  duplicateTemplate(id: string): Promise<ContentTemplate>;
  useTemplate(id: string, contentData: Partial<CreateContentData>): Promise<Content>;
  getPopularTemplates(limit?: number): Promise<ContentTemplate[]>;
}

// 工作流服务接口
export interface WorkflowService {
  getWorkflows(): Promise<ContentWorkflow[]>;
  getWorkflowById(id: string): Promise<ContentWorkflow | null>;
  createWorkflow(data: Omit<ContentWorkflow, 'id' | 'createdAt' | 'updatedAt'>): Promise<ContentWorkflow>;
  updateWorkflow(id: string, data: Partial<ContentWorkflow>): Promise<ContentWorkflow>;
  deleteWorkflow(id: string): Promise<boolean>;
  activateWorkflow(id: string): Promise<ContentWorkflow>;
  deactivateWorkflow(id: string): Promise<ContentWorkflow>;
  executeWorkflow(id: string, contentId: string): Promise<Content>;
  getWorkflowExecutions(workflowId: string): Promise<any[]>;
}

// 审核服务接口
export interface ReviewService {
  getReviews(contentId?: string, status?: string): Promise<ContentReview[]>;
  getReviewById(id: string): Promise<ContentReview | null>;
  createReview(data: Omit<ContentReview, 'id' | 'createdAt' | 'updatedAt'>): Promise<ContentReview>;
  updateReview(id: string, data: Partial<ContentReview>): Promise<ContentReview>;
  deleteReview(id: string): Promise<boolean>;
  approveReview(id: string): Promise<ContentReview>;
  rejectReview(id: string, feedback?: string): Promise<ContentReview>;
  requestChanges(id: string, changes?: ContentChange[]): Promise<ContentReview>;
  getPendingReviews(reviewerId?: string): Promise<ContentReview[]>;
}

// 内容管理服务接口
export interface ContentManagementService {
  // 内容管理
  contentService: ContentService;
  categoryService: CategoryService;
  tagService: TagService;
  commentService: CommentService;
  mediaService: MediaService;
  templateService: TemplateService;
  workflowService: WorkflowService;
  reviewService: ReviewService;
  
  // 内容统计
  getDashboardStats(): Promise<{
    content: ContentStats;
    recentActivity: any[];
    scheduledContent: Content[];
    pendingReviews: ContentReview[];
  }>;
  
  // 内容清理
  cleanupTrash(): Promise<{ deleted: number }>;
  cleanupOldRevisions(days?: number): Promise<{ deleted: number }>;
  cleanupOrphanedMedia(): Promise<{ deleted: number }>;
  
  // 内容优化
  optimizeImages(): Promise<{ optimized: number; savedSpace: number }>;
  generateThumbnails(): Promise<{ generated: number }>;
  
  // 内容备份
  backupContent(): Promise<Blob>;
  restoreContent(backup: Blob): Promise<{ success: number; failed: number; errors: string[] }>;
}

// 内容服务实现
export class ContentServiceImpl implements ContentService {
  private apiBaseUrl = '/api/content';

  async getContents(query: ContentQuery = {}): Promise<{ contents: Content[]; total: number }> {
    const params = new URLSearchParams();
    
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v.toString()));
        } else {
          params.append(key, value.toString());
        }
      }
    });
    
    const response = await fetch(`${this.apiBaseUrl}?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch contents');
    return response.json();
  }

  async getContentById(id: string): Promise<Content | null> {
    const response = await fetch(`${this.apiBaseUrl}/${id}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch content');
    }
    return response.json();
  }

  async createContent(data: CreateContentData): Promise<Content> {
    const response = await fetch(this.apiBaseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create content');
    return response.json();
  }

  async updateContent(data: UpdateContentData): Promise<Content> {
    const { id, ...updateData } = data;
    const response = await fetch(`${this.apiBaseUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });
    if (!response.ok) throw new Error('Failed to update content');
    return response.json();
  }

  async deleteContent(id: string): Promise<boolean> {
    const response = await fetch(`${this.apiBaseUrl}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete content');
    return true;
  }

  async duplicateContent(id: string): Promise<Content> {
    const response = await fetch(`${this.apiBaseUrl}/${id}/duplicate`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to duplicate content');
    return response.json();
  }

  async publishContent(id: string): Promise<Content> {
    const response = await fetch(`${this.apiBaseUrl}/${id}/publish`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to publish content');
    return response.json();
  }

  async unpublishContent(id: string): Promise<Content> {
    const response = await fetch(`${this.apiBaseUrl}/${id}/unpublish`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to unpublish content');
    return response.json();
  }

  async scheduleContent(id: string, scheduledAt: string): Promise<Content> {
    const response = await fetch(`${this.apiBaseUrl}/${id}/schedule`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ scheduledAt }),
    });
    if (!response.ok) throw new Error('Failed to schedule content');
    return response.json();
  }

  async archiveContent(id: string): Promise<Content> {
    const response = await fetch(`${this.apiBaseUrl}/${id}/archive`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to archive content');
    return response.json();
  }

  async trashContent(id: string): Promise<Content> {
    const response = await fetch(`${this.apiBaseUrl}/${id}/trash`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to trash content');
    return response.json();
  }

  async restoreContent(id: string): Promise<Content> {
    const response = await fetch(`${this.apiBaseUrl}/${id}/restore`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to restore content');
    return response.json();
  }

  async searchContents(query: string, filters: ContentQuery = {}): Promise<ContentSearchResult[]> {
    const params = new URLSearchParams();
    params.append('q', query);
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v.toString()));
        } else {
          params.append(key, value.toString());
        }
      }
    });
    
    const response = await fetch(`${this.apiBaseUrl}/search?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to search contents');
    return response.json();
  }

  async importContent(importData: ContentImport): Promise<{ success: number; failed: number; errors: string[] }> {
    const formData = new FormData();
    formData.append('file', importData.file);
    formData.append('type', importData.type);
    formData.append('options', JSON.stringify(importData.options));
    
    const response = await fetch(`${this.apiBaseUrl}/import`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to import content');
    return response.json();
  }

  async exportContent(exportData: ContentExport): Promise<Blob> {
    const response = await fetch(`${this.apiBaseUrl}/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(exportData),
    });
    if (!response.ok) throw new Error('Failed to export content');
    return response.blob();
  }

  async getContentVersions(contentId: string): Promise<ContentVersion[]> {
    const response = await fetch(`${this.apiBaseUrl}/${contentId}/versions`);
    if (!response.ok) throw new Error('Failed to fetch content versions');
    return response.json();
  }

  async getContentVersion(contentId: string, version: number): Promise<ContentVersion | null> {
    const response = await fetch(`${this.apiBaseUrl}/${contentId}/versions/${version}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch content version');
    }
    return response.json();
  }

  async createContentVersion(contentId: string, changeLog?: string): Promise<ContentVersion> {
    const response = await fetch(`${this.apiBaseUrl}/${contentId}/versions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ changeLog }),
    });
    if (!response.ok) throw new Error('Failed to create content version');
    return response.json();
  }

  async restoreContentVersion(contentId: string, version: number): Promise<Content> {
    const response = await fetch(`${this.apiBaseUrl}/${contentId}/versions/${version}/restore`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to restore content version');
    return response.json();
  }

  async getContentCollaborations(contentId: string): Promise<ContentCollaboration[]> {
    const response = await fetch(`${this.apiBaseUrl}/${contentId}/collaborations`);
    if (!response.ok) throw new Error('Failed to fetch content collaborations');
    return response.json();
  }

  async addContentCollaboration(contentId: string, userId: string, role: string): Promise<ContentCollaboration> {
    const response = await fetch(`${this.apiBaseUrl}/${contentId}/collaborations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, role }),
    });
    if (!response.ok) throw new Error('Failed to add content collaboration');
    return response.json();
  }

  async updateContentCollaboration(id: string, role: string): Promise<ContentCollaboration> {
    const response = await fetch(`${this.apiBaseUrl}/collaborations/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role }),
    });
    if (!response.ok) throw new Error('Failed to update content collaboration');
    return response.json();
  }

  async removeContentCollaboration(id: string): Promise<boolean> {
    const response = await fetch(`${this.apiBaseUrl}/collaborations/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to remove content collaboration');
    return true;
  }

  async subscribeToContent(subscription: Omit<ContentSubscription, 'id' | 'createdAt' | 'updatedAt'>): Promise<ContentSubscription> {
    const response = await fetch(`${this.apiBaseUrl}/subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscription),
    });
    if (!response.ok) throw new Error('Failed to subscribe to content');
    return response.json();
  }

  async unsubscribeFromContent(id: string): Promise<boolean> {
    const response = await fetch(`${this.apiBaseUrl}/subscriptions/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to unsubscribe from content');
    return true;
  }

  async getContentSubscriptions(userId: string): Promise<ContentSubscription[]> {
    const response = await fetch(`${this.apiBaseUrl}/subscriptions?userId=${userId}`);
    if (!response.ok) throw new Error('Failed to fetch content subscriptions');
    return response.json();
  }

  async getContentAnalytics(contentId: string, dateFrom?: string, dateTo?: string): Promise<ContentAnalytics[]> {
    const params = new URLSearchParams();
    if (dateFrom) params.append('dateFrom', dateFrom);
    if (dateTo) params.append('dateTo', dateTo);
    
    const response = await fetch(`${this.apiBaseUrl}/${contentId}/analytics?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch content analytics');
    return response.json();
  }

  async getContentStats(query: ContentQuery = {}): Promise<ContentStats> {
    const params = new URLSearchParams();
    
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v.toString()));
        } else {
          params.append(key, value.toString());
        }
      }
    });
    
    const response = await fetch(`${this.apiBaseUrl}/stats?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch content stats');
    return response.json();
  }

  async batchUpdateContents(ids: string[], data: Partial<UpdateContentData>): Promise<Content[]> {
    const response = await fetch(`${this.apiBaseUrl}/batch`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids, data }),
    });
    if (!response.ok) throw new Error('Failed to batch update contents');
    return response.json();
  }

  async batchDeleteContents(ids: string[]): Promise<boolean> {
    const response = await fetch(`${this.apiBaseUrl}/batch`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids }),
    });
    if (!response.ok) throw new Error('Failed to batch delete contents');
    return true;
  }

  async batchPublishContents(ids: string[]): Promise<Content[]> {
    const response = await fetch(`${this.apiBaseUrl}/batch/publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids }),
    });
    if (!response.ok) throw new Error('Failed to batch publish contents');
    return response.json();
  }

  async batchUnpublishContents(ids: string[]): Promise<Content[]> {
    const response = await fetch(`${this.apiBaseUrl}/batch/unpublish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids }),
    });
    if (!response.ok) throw new Error('Failed to batch unpublish contents');
    return response.json();
  }

  async batchArchiveContents(ids: string[]): Promise<Content[]> {
    const response = await fetch(`${this.apiBaseUrl}/batch/archive`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids }),
    });
    if (!response.ok) throw new Error('Failed to batch archive contents');
    return response.json();
  }

  async batchTrashContents(ids: string[]): Promise<Content[]> {
    const response = await fetch(`${this.apiBaseUrl}/batch/trash`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids }),
    });
    if (!response.ok) throw new Error('Failed to batch trash contents');
    return response.json();
  }

  async batchRestoreContents(ids: string[]): Promise<Content[]> {
    const response = await fetch(`${this.apiBaseUrl}/batch/restore`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids }),
    });
    if (!response.ok) throw new Error('Failed to batch restore contents');
    return response.json();
  }
}

// 分类服务实现
export class CategoryServiceImpl implements CategoryService {
  private apiBaseUrl = '/api/content/categories';

  async getCategories(): Promise<Category[]> {
    const response = await fetch(this.apiBaseUrl);
    if (!response.ok) throw new Error('Failed to fetch categories');
    return response.json();
  }

  async getCategoryById(id: string): Promise<Category | null> {
    const response = await fetch(`${this.apiBaseUrl}/${id}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch category');
    }
    return response.json();
  }

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    const response = await fetch(`${this.apiBaseUrl}/slug/${slug}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch category by slug');
    }
    return response.json();
  }

  async createCategory(data: Omit<Category, 'id' | 'contentCount' | 'createdAt' | 'updatedAt'>): Promise<Category> {
    const response = await fetch(this.apiBaseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create category');
    return response.json();
  }

  async updateCategory(id: string, data: Partial<Category>): Promise<Category> {
    const response = await fetch(`${this.apiBaseUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update category');
    return response.json();
  }

  async deleteCategory(id: string): Promise<boolean> {
    const response = await fetch(`${this.apiBaseUrl}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete category');
    return true;
  }

  async getCategoryTree(): Promise<Category[]> {
    const response = await fetch(`${this.apiBaseUrl}/tree`);
    if (!response.ok) throw new Error('Failed to fetch category tree');
    return response.json();
  }

  async reorderCategories(categories: { id: string; order: number; parentId?: string }[]): Promise<Category[]> {
    const response = await fetch(`${this.apiBaseUrl}/reorder`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ categories }),
    });
    if (!response.ok) throw new Error('Failed to reorder categories');
    return response.json();
  }
}

// 标签服务实现
export class TagServiceImpl implements TagService {
  private apiBaseUrl = '/api/content/tags';

  async getTags(): Promise<Tag[]> {
    const response = await fetch(this.apiBaseUrl);
    if (!response.ok) throw new Error('Failed to fetch tags');
    return response.json();
  }

  async getTagById(id: string): Promise<Tag | null> {
    const response = await fetch(`${this.apiBaseUrl}/${id}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch tag');
    }
    return response.json();
  }

  async getTagBySlug(slug: string): Promise<Tag | null> {
    const response = await fetch(`${this.apiBaseUrl}/slug/${slug}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch tag by slug');
    }
    return response.json();
  }

  async createTag(data: Omit<Tag, 'id' | 'contentCount' | 'createdAt' | 'updatedAt'>): Promise<Tag> {
    const response = await fetch(this.apiBaseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create tag');
    return response.json();
  }

  async updateTag(id: string, data: Partial<Tag>): Promise<Tag> {
    const response = await fetch(`${this.apiBaseUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update tag');
    return response.json();
  }

  async deleteTag(id: string): Promise<boolean> {
    const response = await fetch(`${this.apiBaseUrl}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete tag');
    return true;
  }

  async getPopularTags(limit: number = 10): Promise<Tag[]> {
    const response = await fetch(`${this.apiBaseUrl}/popular?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch popular tags');
    return response.json();
  }

  async searchTags(query: string): Promise<Tag[]> {
    const response = await fetch(`${this.apiBaseUrl}/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Failed to search tags');
    return response.json();
  }
}

// 评论服务实现
export class CommentServiceImpl implements CommentService {
  private apiBaseUrl = '/api/content/comments';

  async getComments(contentId?: string, status?: string): Promise<Comment[]> {
    const params = new URLSearchParams();
    if (contentId) params.append('contentId', contentId);
    if (status) params.append('status', status);
    
    const response = await fetch(`${this.apiBaseUrl}?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch comments');
    return response.json();
  }

  async getCommentById(id: string): Promise<Comment | null> {
    const response = await fetch(`${this.apiBaseUrl}/${id}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch comment');
    }
    return response.json();
  }

  async createComment(data: Omit<Comment, 'id' | 'createdAt' | 'updatedAt' | 'likes' | 'replies'>): Promise<Comment> {
    const response = await fetch(this.apiBaseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create comment');
    return response.json();
  }

  async updateComment(id: string, data: Partial<Comment>): Promise<Comment> {
    const response = await fetch(`${this.apiBaseUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update comment');
    return response.json();
  }

  async deleteComment(id: string): Promise<boolean> {
    const response = await fetch(`${this.apiBaseUrl}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete comment');
    return true;
  }

  async approveComment(id: string): Promise<Comment> {
    const response = await fetch(`${this.apiBaseUrl}/${id}/approve`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to approve comment');
    return response.json();
  }

  async rejectComment(id: string): Promise<Comment> {
    const response = await fetch(`${this.apiBaseUrl}/${id}/reject`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to reject comment');
    return response.json();
  }

  async markAsSpam(id: string): Promise<Comment> {
    const response = await fetch(`${this.apiBaseUrl}/${id}/spam`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to mark comment as spam');
    return response.json();
  }

  async getCommentReplies(commentId: string): Promise<Comment[]> {
    const response = await fetch(`${this.apiBaseUrl}/${commentId}/replies`);
    if (!response.ok) throw new Error('Failed to fetch comment replies');
    return response.json();
  }

  async likeComment(id: string): Promise<Comment> {
    const response = await fetch(`${this.apiBaseUrl}/${id}/like`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to like comment');
    return response.json();
  }

  async unlikeComment(id: string): Promise<Comment> {
    const response = await fetch(`${this.apiBaseUrl}/${id}/unlike`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to unlike comment');
    return response.json();
  }

  async batchApproveComments(ids: string[]): Promise<Comment[]> {
    const response = await fetch(`${this.apiBaseUrl}/batch/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids }),
    });
    if (!response.ok) throw new Error('Failed to batch approve comments');
    return response.json();
  }

  async batchRejectComments(ids: string[]): Promise<Comment[]> {
    const response = await fetch(`${this.apiBaseUrl}/batch/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids }),
    });
    if (!response.ok) throw new Error('Failed to batch reject comments');
    return response.json();
  }

  async batchDeleteComments(ids: string[]): Promise<boolean> {
    const response = await fetch(`${this.apiBaseUrl}/batch`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids }),
    });
    if (!response.ok) throw new Error('Failed to batch delete comments');
    return true;
  }
}

// 媒体服务实现
export class MediaServiceImpl implements MediaService {
  private apiBaseUrl = '/api/content/media';

  async getMedia(folderId?: string, query: { page?: number; pageSize?: number; search?: string; type?: string } = {}): Promise<{ media: Media[]; total: number }> {
    const params = new URLSearchParams();
    
    if (folderId) params.append('folderId', folderId);
    
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    
    const response = await fetch(`${this.apiBaseUrl}?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch media');
    return response.json();
  }

  async getMediaById(id: string): Promise<Media | null> {
    const response = await fetch(`${this.apiBaseUrl}/${id}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch media');
    }
    return response.json();
  }

  async uploadMedia(file: File, folderId?: string, metadata?: Record<string, any>): Promise<Media> {
    const formData = new FormData();
    formData.append('file', file);
    if (folderId) formData.append('folderId', folderId);
    if (metadata) formData.append('metadata', JSON.stringify(metadata));
    
    const response = await fetch(`${this.apiBaseUrl}/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to upload media');
    return response.json();
  }

  async updateMedia(id: string, data: Partial<Media>): Promise<Media> {
    const response = await fetch(`${this.apiBaseUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update media');
    return response.json();
  }

  async deleteMedia(id: string): Promise<boolean> {
    const response = await fetch(`${this.apiBaseUrl}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete media');
    return true;
  }

  async moveMedia(id: string, folderId?: string): Promise<Media> {
    const response = await fetch(`${this.apiBaseUrl}/${id}/move`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ folderId }),
    });
    if (!response.ok) throw new Error('Failed to move media');
    return response.json();
  }

  async copyMedia(id: string, folderId?: string): Promise<Media> {
    const response = await fetch(`${this.apiBaseUrl}/${id}/copy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ folderId }),
    });
    if (!response.ok) throw new Error('Failed to copy media');
    return response.json();
  }

  async getMediaFolders(): Promise<MediaFolder[]> {
    const response = await fetch(`${this.apiBaseUrl}/folders`);
    if (!response.ok) throw new Error('Failed to fetch media folders');
    return response.json();
  }

  async getMediaFolderById(id: string): Promise<MediaFolder | null> {
    const response = await fetch(`${this.apiBaseUrl}/folders/${id}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch media folder');
    }
    return response.json();
  }

  async createMediaFolder(data: Omit<MediaFolder, 'id' | 'mediaCount' | 'createdAt' | 'updatedAt'>): Promise<MediaFolder> {
    const response = await fetch(`${this.apiBaseUrl}/folders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create media folder');
    return response.json();
  }

  async updateMediaFolder(id: string, data: Partial<MediaFolder>): Promise<MediaFolder> {
    const response = await fetch(`${this.apiBaseUrl}/folders/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update media folder');
    return response.json();
  }

  async deleteMediaFolder(id: string): Promise<boolean> {
    const response = await fetch(`${this.apiBaseUrl}/folders/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete media folder');
    return true;
  }

  async moveMediaFolder(id: string, parentId?: string): Promise<MediaFolder> {
    const response = await fetch(`${this.apiBaseUrl}/folders/${id}/move`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ parentId }),
    });
    if (!response.ok) throw new Error('Failed to move media folder');
    return response.json();
  }

  async searchMedia(query: string, filters: { type?: string; folderId?: string } = {}): Promise<Media[]> {
    const params = new URLSearchParams();
    params.append('q', query);
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value);
      }
    });
    
    const response = await fetch(`${this.apiBaseUrl}/search?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to search media');
    return response.json();
  }

  async batchDeleteMedia(ids: string[]): Promise<boolean> {
    const response = await fetch(`${this.apiBaseUrl}/batch`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids }),
    });
    if (!response.ok) throw new Error('Failed to batch delete media');
    return true;
  }

  async batchMoveMedia(ids: string[], folderId?: string): Promise<Media[]> {
    const response = await fetch(`${this.apiBaseUrl}/batch/move`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids, folderId }),
    });
    if (!response.ok) throw new Error('Failed to batch move media');
    return response.json();
  }

  async batchUpdateMedia(ids: string[], data: Partial<Media>): Promise<Media[]> {
    const response = await fetch(`${this.apiBaseUrl}/batch`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids, data }),
    });
    if (!response.ok) throw new Error('Failed to batch update media');
    return response.json();
  }
}

// 模板服务实现
export class TemplateServiceImpl implements TemplateService {
  private apiBaseUrl = '/api/content/templates';

  async getTemplates(type?: string): Promise<ContentTemplate[]> {
    const params = type ? `?type=${type}` : '';
    const response = await fetch(`${this.apiBaseUrl}${params}`);
    if (!response.ok) throw new Error('Failed to fetch templates');
    return response.json();
  }

  async getTemplateById(id: string): Promise<ContentTemplate | null> {
    const response = await fetch(`${this.apiBaseUrl}/${id}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch template');
    }
    return response.json();
  }

  async createTemplate(data: Omit<ContentTemplate, 'id' | 'usageCount' | 'createdAt' | 'updatedAt'>): Promise<ContentTemplate> {
    const response = await fetch(this.apiBaseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create template');
    return response.json();
  }

  async updateTemplate(id: string, data: Partial<ContentTemplate>): Promise<ContentTemplate> {
    const response = await fetch(`${this.apiBaseUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update template');
    return response.json();
  }

  async deleteTemplate(id: string): Promise<boolean> {
    const response = await fetch(`${this.apiBaseUrl}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete template');
    return true;
  }

  async duplicateTemplate(id: string): Promise<ContentTemplate> {
    const response = await fetch(`${this.apiBaseUrl}/${id}/duplicate`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to duplicate template');
    return response.json();
  }

  async useTemplate(id: string, contentData: Partial<CreateContentData>): Promise<Content> {
    const response = await fetch(`${this.apiBaseUrl}/${id}/use`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contentData),
    });
    if (!response.ok) throw new Error('Failed to use template');
    return response.json();
  }

  async getPopularTemplates(limit: number = 10): Promise<ContentTemplate[]> {
    const response = await fetch(`${this.apiBaseUrl}/popular?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch popular templates');
    return response.json();
  }
}

// 工作流服务实现
export class WorkflowServiceImpl implements WorkflowService {
  private apiBaseUrl = '/api/content/workflows';

  async getWorkflows(): Promise<ContentWorkflow[]> {
    const response = await fetch(this.apiBaseUrl);
    if (!response.ok) throw new Error('Failed to fetch workflows');
    return response.json();
  }

  async getWorkflowById(id: string): Promise<ContentWorkflow | null> {
    const response = await fetch(`${this.apiBaseUrl}/${id}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch workflow');
    }
    return response.json();
  }

  async createWorkflow(data: Omit<ContentWorkflow, 'id' | 'createdAt' | 'updatedAt'>): Promise<ContentWorkflow> {
    const response = await fetch(this.apiBaseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create workflow');
    return response.json();
  }

  async updateWorkflow(id: string, data: Partial<ContentWorkflow>): Promise<ContentWorkflow> {
    const response = await fetch(`${this.apiBaseUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update workflow');
    return response.json();
  }

  async deleteWorkflow(id: string): Promise<boolean> {
    const response = await fetch(`${this.apiBaseUrl}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete workflow');
    return true;
  }

  async activateWorkflow(id: string): Promise<ContentWorkflow> {
    const response = await fetch(`${this.apiBaseUrl}/${id}/activate`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to activate workflow');
    return response.json();
  }

  async deactivateWorkflow(id: string): Promise<ContentWorkflow> {
    const response = await fetch(`${this.apiBaseUrl}/${id}/deactivate`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to deactivate workflow');
    return response.json();
  }

  async executeWorkflow(id: string, contentId: string): Promise<Content> {
    const response = await fetch(`${this.apiBaseUrl}/${id}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ contentId }),
    });
    if (!response.ok) throw new Error('Failed to execute workflow');
    return response.json();
  }

  async getWorkflowExecutions(workflowId: string): Promise<any[]> {
    const response = await fetch(`${this.apiBaseUrl}/${workflowId}/executions`);
    if (!response.ok) throw new Error('Failed to fetch workflow executions');
    return response.json();
  }
}

// 审核服务实现
export class ReviewServiceImpl implements ReviewService {
  private apiBaseUrl = '/api/content/reviews';

  async getReviews(contentId?: string, status?: string): Promise<ContentReview[]> {
    const params = new URLSearchParams();
    if (contentId) params.append('contentId', contentId);
    if (status) params.append('status', status);
    
    const response = await fetch(`${this.apiBaseUrl}?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch reviews');
    return response.json();
  }

  async getReviewById(id: string): Promise<ContentReview | null> {
    const response = await fetch(`${this.apiBaseUrl}/${id}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch review');
    }
    return response.json();
  }

  async createReview(data: Omit<ContentReview, 'id' | 'createdAt' | 'updatedAt'>): Promise<ContentReview> {
    const response = await fetch(this.apiBaseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create review');
    return response.json();
  }

  async updateReview(id: string, data: Partial<ContentReview>): Promise<ContentReview> {
    const response = await fetch(`${this.apiBaseUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update review');
    return response.json();
  }

  async deleteReview(id: string): Promise<boolean> {
    const response = await fetch(`${this.apiBaseUrl}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete review');
    return true;
  }

  async approveReview(id: string): Promise<ContentReview> {
    const response = await fetch(`${this.apiBaseUrl}/${id}/approve`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to approve review');
    return response.json();
  }

  async rejectReview(id: string, feedback?: string): Promise<ContentReview> {
    const response = await fetch(`${this.apiBaseUrl}/${id}/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ feedback }),
    });
    if (!response.ok) throw new Error('Failed to reject review');
    return response.json();
  }

  async requestChanges(id: string, changes?: ContentChange[]): Promise<ContentReview> {
    const response = await fetch(`${this.apiBaseUrl}/${id}/changes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ changes }),
    });
    if (!response.ok) throw new Error('Failed to request changes');
    return response.json();
  }

  async getPendingReviews(reviewerId?: string): Promise<ContentReview[]> {
    const params = reviewerId ? `?reviewerId=${reviewerId}` : '';
    const response = await fetch(`${this.apiBaseUrl}/pending${params}`);
    if (!response.ok) throw new Error('Failed to fetch pending reviews');
    return response.json();
  }
}

// 内容管理服务实现
export class ContentManagementServiceImpl implements ContentManagementService {
  contentService = new ContentServiceImpl();
  categoryService = new CategoryServiceImpl();
  tagService = new TagServiceImpl();
  commentService = new CommentServiceImpl();
  mediaService = new MediaServiceImpl();
  templateService = new TemplateServiceImpl();
  workflowService = new WorkflowServiceImpl();
  reviewService = new ReviewServiceImpl();

  async getDashboardStats(): Promise<{
    content: ContentStats;
    recentActivity: any[];
    scheduledContent: Content[];
    pendingReviews: ContentReview[];
  }> {
    const response = await fetch('/api/content/dashboard');
    if (!response.ok) throw new Error('Failed to fetch dashboard stats');
    return response.json();
  }

  async cleanupTrash(): Promise<{ deleted: number }> {
    const response = await fetch('/api/content/cleanup/trash', {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to cleanup trash');
    return response.json();
  }

  async cleanupOldRevisions(days: number = 30): Promise<{ deleted: number }> {
    const response = await fetch(`/api/content/cleanup/revisions?days=${days}`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to cleanup old revisions');
    return response.json();
  }

  async cleanupOrphanedMedia(): Promise<{ deleted: number }> {
    const response = await fetch('/api/content/cleanup/media', {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to cleanup orphaned media');
    return response.json();
  }

  async optimizeImages(): Promise<{ optimized: number; savedSpace: number }> {
    const response = await fetch('/api/content/optimize/images', {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to optimize images');
    return response.json();
  }

  async generateThumbnails(): Promise<{ generated: number }> {
    const response = await fetch('/api/content/optimize/thumbnails', {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to generate thumbnails');
    return response.json();
  }

  async backupContent(): Promise<Blob> {
    const response = await fetch('/api/content/backup', {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to backup content');
    return response.blob();
  }

  async restoreContent(backup: Blob): Promise<{ success: number; failed: number; errors: string[] }> {
    const formData = new FormData();
    formData.append('backup', backup);
    
    const response = await fetch('/api/content/restore', {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to restore content');
    return response.json();
  }
}

// 创建服务实例
export const contentService = new ContentServiceImpl();
export const categoryService = new CategoryServiceImpl();
export const tagService = new TagServiceImpl();
export const commentService = new CommentServiceImpl();
export const mediaService = new MediaServiceImpl();
export const templateService = new TemplateServiceImpl();
export const workflowService = new WorkflowServiceImpl();
export const reviewService = new ReviewServiceImpl();
export const contentManagementService = new ContentManagementServiceImpl();