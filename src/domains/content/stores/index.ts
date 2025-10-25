// 内容域状态管理
// 提供内容管理相关的状态管理

import { defineStore } from 'pinia';
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
import {
  contentService,
  categoryService,
  tagService,
  commentService,
  mediaService,
  templateService,
  workflowService,
  reviewService,
  contentManagementService,
} from '../services';

// 内容状态管理
export const useContentStore = defineStore('content', {
  state: () => ({
    // 内容列表
    contents: [] as Content[],
    content: null as Content | null,
    contentTotal: 0,
    contentLoading: false,
    
    // 内容搜索结果
    searchResults: [] as ContentSearchResult[],
    searchLoading: false,
    
    // 内容版本
    contentVersions: [] as ContentVersion[],
    contentVersion: null as ContentVersion | null,
    versionsLoading: false,
    
    // 内容协作
    collaborations: [] as ContentCollaboration[],
    collaborationsLoading: false,
    
    // 内容订阅
    subscriptions: [] as ContentSubscription[],
    subscriptionsLoading: false,
    
    // 内容分析
    analytics: [] as ContentAnalytics[],
    analyticsLoading: false,
    
    // 内容统计
    stats: null as ContentStats | null,
    statsLoading: false,
    
    // 内容导入导出
    importResult: null as { success: number; failed: number; errors: string[] } | null,
    importLoading: false,
    exportLoading: false,
  }),
  
  getters: {
    // 获取已发布的内容
    publishedContents: (state) => state.contents.filter(content => content.status === 'published'),
    
    // 获取草稿内容
    draftContents: (state) => state.contents.filter(content => content.status === 'draft'),
    
    // 获取已归档内容
    archivedContents: (state) => state.contents.filter(content => content.status === 'archived'),
    
    // 获取已删除内容
    trashedContents: (state) => state.contents.filter(content => content.status === 'trash'),
    
    // 获取定时发布内容
    scheduledContents: (state) => state.contents.filter(content => content.status === 'scheduled'),
    
    // 获取待审核内容
    pendingContents: (state) => state.contents.filter(content => content.status === 'pending'),
    
    // 获取内容分类ID列表
    contentCategoryIds: (state) => state.contents.map(content => content.categoryId).filter(Boolean),
    
    // 获取内容标签ID列表
    contentTagIds: (state) => {
      const tagIds: string[] = [];
      state.contents.forEach(content => {
        if (content.tagIds) {
          tagIds.push(...content.tagIds);
        }
      });
      return [...new Set(tagIds)];
    },
    
    // 获取内容作者ID列表
    contentAuthorIds: (state) => [...new Set(state.contents.map(content => content.authorId).filter(Boolean))],
    
    // 获取搜索关键词
    searchKeywords: (state) => {
      const keywords: string[] = [];
      state.searchResults.forEach(result => {
        if (result.keywords) {
          keywords.push(...result.keywords);
        }
      });
      return [...new Set(keywords)];
    },
    
    // 获取内容版本数量
    versionCount: (state) => state.contentVersions.length,
    
    // 获取最新版本
    latestVersion: (state) => {
      if (state.contentVersions.length === 0) return null;
      return state.contentVersions.reduce((latest, version) => 
        version.version > latest.version ? version : latest
      );
    },
    
    // 获取协作用户ID列表
    collaboratorIds: (state) => [...new Set(state.collaborations.map(collab => collab.userId))],
    
    // 获取订阅用户ID列表
    subscriberIds: (state) => [...new Set(state.subscriptions.map(sub => sub.userId))],
    
    // 获取分析数据日期范围
    analyticsDateRange: (state) => {
      if (state.analytics.length === 0) return null;
      const dates = state.analytics.map(item => item.date);
      return {
        start: new Date(Math.min(...dates.map(date => new Date(date).getTime()))),
        end: new Date(Math.max(...dates.map(date => new Date(date).getTime()))),
      };
    },
  },
  
  actions: {
    // 获取内容列表
    async fetchContents(query: ContentQuery = {}) {
      this.contentLoading = true;
      try {
        const result = await contentService.getContents(query);
        this.contents = result.contents;
        this.contentTotal = result.total;
      } catch (error) {
        console.error('Failed to fetch contents:', error);
        throw error;
      } finally {
        this.contentLoading = false;
      }
    },
    
    // 获取内容详情
    async fetchContentById(id: string) {
      this.contentLoading = true;
      try {
        this.content = await contentService.getContentById(id);
      } catch (error) {
        console.error('Failed to fetch content:', error);
        throw error;
      } finally {
        this.contentLoading = false;
      }
    },
    
    // 创建内容
    async createContent(data: CreateContentData) {
      this.contentLoading = true;
      try {
        const newContent = await contentService.createContent(data);
        this.contents.unshift(newContent);
        this.content = newContent;
        this.contentTotal += 1;
        return newContent;
      } catch (error) {
        console.error('Failed to create content:', error);
        throw error;
      } finally {
        this.contentLoading = false;
      }
    },
    
    // 更新内容
    async updateContent(data: UpdateContentData) {
      this.contentLoading = true;
      try {
        const updatedContent = await contentService.updateContent(data);
        const index = this.contents.findIndex(content => content.id === updatedContent.id);
        if (index !== -1) {
          this.contents[index] = updatedContent;
        }
        if (this.content && this.content.id === updatedContent.id) {
          this.content = updatedContent;
        }
        return updatedContent;
      } catch (error) {
        console.error('Failed to update content:', error);
        throw error;
      } finally {
        this.contentLoading = false;
      }
    },
    
    // 删除内容
    async deleteContent(id: string) {
      this.contentLoading = true;
      try {
        await contentService.deleteContent(id);
        this.contents = this.contents.filter(content => content.id !== id);
        this.contentTotal -= 1;
        if (this.content && this.content.id === id) {
          this.content = null;
        }
      } catch (error) {
        console.error('Failed to delete content:', error);
        throw error;
      } finally {
        this.contentLoading = false;
      }
    },
    
    // 复制内容
    async duplicateContent(id: string) {
      this.contentLoading = true;
      try {
        const duplicatedContent = await contentService.duplicateContent(id);
        this.contents.unshift(duplicatedContent);
        this.contentTotal += 1;
        return duplicatedContent;
      } catch (error) {
        console.error('Failed to duplicate content:', error);
        throw error;
      } finally {
        this.contentLoading = false;
      }
    },
    
    // 发布内容
    async publishContent(id: string) {
      this.contentLoading = true;
      try {
        const publishedContent = await contentService.publishContent(id);
        const index = this.contents.findIndex(content => content.id === publishedContent.id);
        if (index !== -1) {
          this.contents[index] = publishedContent;
        }
        if (this.content && this.content.id === publishedContent.id) {
          this.content = publishedContent;
        }
        return publishedContent;
      } catch (error) {
        console.error('Failed to publish content:', error);
        throw error;
      } finally {
        this.contentLoading = false;
      }
    },
    
    // 取消发布内容
    async unpublishContent(id: string) {
      this.contentLoading = true;
      try {
        const unpublishedContent = await contentService.unpublishContent(id);
        const index = this.contents.findIndex(content => content.id === unpublishedContent.id);
        if (index !== -1) {
          this.contents[index] = unpublishedContent;
        }
        if (this.content && this.content.id === unpublishedContent.id) {
          this.content = unpublishedContent;
        }
        return unpublishedContent;
      } catch (error) {
        console.error('Failed to unpublish content:', error);
        throw error;
      } finally {
        this.contentLoading = false;
      }
    },
    
    // 定时发布内容
    async scheduleContent(id: string, scheduledAt: string) {
      this.contentLoading = true;
      try {
        const scheduledContent = await contentService.scheduleContent(id, scheduledAt);
        const index = this.contents.findIndex(content => content.id === scheduledContent.id);
        if (index !== -1) {
          this.contents[index] = scheduledContent;
        }
        if (this.content && this.content.id === scheduledContent.id) {
          this.content = scheduledContent;
        }
        return scheduledContent;
      } catch (error) {
        console.error('Failed to schedule content:', error);
        throw error;
      } finally {
        this.contentLoading = false;
      }
    },
    
    // 归档内容
    async archiveContent(id: string) {
      this.contentLoading = true;
      try {
        const archivedContent = await contentService.archiveContent(id);
        const index = this.contents.findIndex(content => content.id === archivedContent.id);
        if (index !== -1) {
          this.contents[index] = archivedContent;
        }
        if (this.content && this.content.id === archivedContent.id) {
          this.content = archivedContent;
        }
        return archivedContent;
      } catch (error) {
        console.error('Failed to archive content:', error);
        throw error;
      } finally {
        this.contentLoading = false;
      }
    },
    
    // 删除到回收站
    async trashContent(id: string) {
      this.contentLoading = true;
      try {
        const trashedContent = await contentService.trashContent(id);
        const index = this.contents.findIndex(content => content.id === trashedContent.id);
        if (index !== -1) {
          this.contents[index] = trashedContent;
        }
        if (this.content && this.content.id === trashedContent.id) {
          this.content = trashedContent;
        }
        return trashedContent;
      } catch (error) {
        console.error('Failed to trash content:', error);
        throw error;
      } finally {
        this.contentLoading = false;
      }
    },
    
    // 从回收站恢复内容
    async restoreContent(id: string) {
      this.contentLoading = true;
      try {
        const restoredContent = await contentService.restoreContent(id);
        const index = this.contents.findIndex(content => content.id === restoredContent.id);
        if (index !== -1) {
          this.contents[index] = restoredContent;
        }
        if (this.content && this.content.id === restoredContent.id) {
          this.content = restoredContent;
        }
        return restoredContent;
      } catch (error) {
        console.error('Failed to restore content:', error);
        throw error;
      } finally {
        this.contentLoading = false;
      }
    },
    
    // 搜索内容
    async searchContents(query: string, filters: ContentQuery = {}) {
      this.searchLoading = true;
      try {
        this.searchResults = await contentService.searchContents(query, filters);
      } catch (error) {
        console.error('Failed to search contents:', error);
        throw error;
      } finally {
        this.searchLoading = false;
      }
    },
    
    // 导入内容
    async importContent(importData: ContentImport) {
      this.importLoading = true;
      try {
        this.importResult = await contentService.importContent(importData);
        return this.importResult;
      } catch (error) {
        console.error('Failed to import content:', error);
        throw error;
      } finally {
        this.importLoading = false;
      }
    },
    
    // 导出内容
    async exportContent(exportData: ContentExport) {
      this.exportLoading = true;
      try {
        return await contentService.exportContent(exportData);
      } catch (error) {
        console.error('Failed to export content:', error);
        throw error;
      } finally {
        this.exportLoading = false;
      }
    },
    
    // 获取内容版本列表
    async fetchContentVersions(contentId: string) {
      this.versionsLoading = true;
      try {
        this.contentVersions = await contentService.getContentVersions(contentId);
      } catch (error) {
        console.error('Failed to fetch content versions:', error);
        throw error;
      } finally {
        this.versionsLoading = false;
      }
    },
    
    // 获取内容版本详情
    async fetchContentVersion(contentId: string, version: number) {
      this.versionsLoading = true;
      try {
        this.contentVersion = await contentService.getContentVersion(contentId, version);
      } catch (error) {
        console.error('Failed to fetch content version:', error);
        throw error;
      } finally {
        this.versionsLoading = false;
      }
    },
    
    // 创建内容版本
    async createContentVersion(contentId: string, changeLog?: string) {
      this.versionsLoading = true;
      try {
        const newVersion = await contentService.createContentVersion(contentId, changeLog);
        this.contentVersions.unshift(newVersion);
        return newVersion;
      } catch (error) {
        console.error('Failed to create content version:', error);
        throw error;
      } finally {
        this.versionsLoading = false;
      }
    },
    
    // 恢复内容版本
    async restoreContentVersion(contentId: string, version: number) {
      this.versionsLoading = true;
      try {
        const restoredContent = await contentService.restoreContentVersion(contentId, version);
        const index = this.contents.findIndex(content => content.id === restoredContent.id);
        if (index !== -1) {
          this.contents[index] = restoredContent;
        }
        if (this.content && this.content.id === restoredContent.id) {
          this.content = restoredContent;
        }
        return restoredContent;
      } catch (error) {
        console.error('Failed to restore content version:', error);
        throw error;
      } finally {
        this.versionsLoading = false;
      }
    },
    
    // 获取内容协作列表
    async fetchContentCollaborations(contentId: string) {
      this.collaborationsLoading = true;
      try {
        this.collaborations = await contentService.getContentCollaborations(contentId);
      } catch (error) {
        console.error('Failed to fetch content collaborations:', error);
        throw error;
      } finally {
        this.collaborationsLoading = false;
      }
    },
    
    // 添加内容协作
    async addContentCollaboration(contentId: string, userId: string, role: string) {
      this.collaborationsLoading = true;
      try {
        const collaboration = await contentService.addContentCollaboration(contentId, userId, role);
        this.collaborations.push(collaboration);
        return collaboration;
      } catch (error) {
        console.error('Failed to add content collaboration:', error);
        throw error;
      } finally {
        this.collaborationsLoading = false;
      }
    },
    
    // 更新内容协作
    async updateContentCollaboration(id: string, role: string) {
      this.collaborationsLoading = true;
      try {
        const collaboration = await contentService.updateContentCollaboration(id, role);
        const index = this.collaborations.findIndex(collab => collab.id === collaboration.id);
        if (index !== -1) {
          this.collaborations[index] = collaboration;
        }
        return collaboration;
      } catch (error) {
        console.error('Failed to update content collaboration:', error);
        throw error;
      } finally {
        this.collaborationsLoading = false;
      }
    },
    
    // 删除内容协作
    async removeContentCollaboration(id: string) {
      this.collaborationsLoading = true;
      try {
        await contentService.removeContentCollaboration(id);
        this.collaborations = this.collaborations.filter(collab => collab.id !== id);
      } catch (error) {
        console.error('Failed to remove content collaboration:', error);
        throw error;
      } finally {
        this.collaborationsLoading = false;
      }
    },
    
    // 订阅内容
    async subscribeToContent(subscription: Omit<ContentSubscription, 'id' | 'createdAt' | 'updatedAt'>) {
      this.subscriptionsLoading = true;
      try {
        const newSubscription = await contentService.subscribeToContent(subscription);
        this.subscriptions.push(newSubscription);
        return newSubscription;
      } catch (error) {
        console.error('Failed to subscribe to content:', error);
        throw error;
      } finally {
        this.subscriptionsLoading = false;
      }
    },
    
    // 取消订阅内容
    async unsubscribeFromContent(id: string) {
      this.subscriptionsLoading = true;
      try {
        await contentService.unsubscribeFromContent(id);
        this.subscriptions = this.subscriptions.filter(sub => sub.id !== id);
      } catch (error) {
        console.error('Failed to unsubscribe from content:', error);
        throw error;
      } finally {
        this.subscriptionsLoading = false;
      }
    },
    
    // 获取内容订阅列表
    async fetchContentSubscriptions(userId: string) {
      this.subscriptionsLoading = true;
      try {
        this.subscriptions = await contentService.getContentSubscriptions(userId);
      } catch (error) {
        console.error('Failed to fetch content subscriptions:', error);
        throw error;
      } finally {
        this.subscriptionsLoading = false;
      }
    },
    
    // 获取内容分析数据
    async fetchContentAnalytics(contentId: string, dateFrom?: string, dateTo?: string) {
      this.analyticsLoading = true;
      try {
        this.analytics = await contentService.getContentAnalytics(contentId, dateFrom, dateTo);
      } catch (error) {
        console.error('Failed to fetch content analytics:', error);
        throw error;
      } finally {
        this.analyticsLoading = false;
      }
    },
    
    // 获取内容统计数据
    async fetchContentStats(query: ContentQuery = {}) {
      this.statsLoading = true;
      try {
        this.stats = await contentService.getContentStats(query);
      } catch (error) {
        console.error('Failed to fetch content stats:', error);
        throw error;
      } finally {
        this.statsLoading = false;
      }
    },
    
    // 批量更新内容
    async batchUpdateContents(ids: string[], data: Partial<UpdateContentData>) {
      this.contentLoading = true;
      try {
        const updatedContents = await contentService.batchUpdateContents(ids, data);
        updatedContents.forEach(updatedContent => {
          const index = this.contents.findIndex(content => content.id === updatedContent.id);
          if (index !== -1) {
            this.contents[index] = updatedContent;
          }
        });
        return updatedContents;
      } catch (error) {
        console.error('Failed to batch update contents:', error);
        throw error;
      } finally {
        this.contentLoading = false;
      }
    },
    
    // 批量删除内容
    async batchDeleteContents(ids: string[]) {
      this.contentLoading = true;
      try {
        await contentService.batchDeleteContents(ids);
        this.contents = this.contents.filter(content => !ids.includes(content.id));
        this.contentTotal -= ids.length;
      } catch (error) {
        console.error('Failed to batch delete contents:', error);
        throw error;
      } finally {
        this.contentLoading = false;
      }
    },
    
    // 批量发布内容
    async batchPublishContents(ids: string[]) {
      this.contentLoading = true;
      try {
        const publishedContents = await contentService.batchPublishContents(ids);
        publishedContents.forEach(publishedContent => {
          const index = this.contents.findIndex(content => content.id === publishedContent.id);
          if (index !== -1) {
            this.contents[index] = publishedContent;
          }
        });
        return publishedContents;
      } catch (error) {
        console.error('Failed to batch publish contents:', error);
        throw error;
      } finally {
        this.contentLoading = false;
      }
    },
    
    // 批量取消发布内容
    async batchUnpublishContents(ids: string[]) {
      this.contentLoading = true;
      try {
        const unpublishedContents = await contentService.batchUnpublishContents(ids);
        unpublishedContents.forEach(unpublishedContent => {
          const index = this.contents.findIndex(content => content.id === unpublishedContent.id);
          if (index !== -1) {
            this.contents[index] = unpublishedContent;
          }
        });
        return unpublishedContents;
      } catch (error) {
        console.error('Failed to batch unpublish contents:', error);
        throw error;
      } finally {
        this.contentLoading = false;
      }
    },
    
    // 批量归档内容
    async batchArchiveContents(ids: string[]) {
      this.contentLoading = true;
      try {
        const archivedContents = await contentService.batchArchiveContents(ids);
        archivedContents.forEach(archivedContent => {
          const index = this.contents.findIndex(content => content.id === archivedContent.id);
          if (index !== -1) {
            this.contents[index] = archivedContent;
          }
        });
        return archivedContents;
      } catch (error) {
        console.error('Failed to batch archive contents:', error);
        throw error;
      } finally {
        this.contentLoading = false;
      }
    },
    
    // 批量删除到回收站
    async batchTrashContents(ids: string[]) {
      this.contentLoading = true;
      try {
        const trashedContents = await contentService.batchTrashContents(ids);
        trashedContents.forEach(trashedContent => {
          const index = this.contents.findIndex(content => content.id === trashedContent.id);
          if (index !== -1) {
            this.contents[index] = trashedContent;
          }
        });
        return trashedContents;
      } catch (error) {
        console.error('Failed to batch trash contents:', error);
        throw error;
      } finally {
        this.contentLoading = false;
      }
    },
    
    // 批量从回收站恢复内容
    async batchRestoreContents(ids: string[]) {
      this.contentLoading = true;
      try {
        const restoredContents = await contentService.batchRestoreContents(ids);
        restoredContents.forEach(restoredContent => {
          const index = this.contents.findIndex(content => content.id === restoredContent.id);
          if (index !== -1) {
            this.contents[index] = restoredContent;
          }
        });
        return restoredContents;
      } catch (error) {
        console.error('Failed to batch restore contents:', error);
        throw error;
      } finally {
        this.contentLoading = false;
      }
    },
    
    // 重置状态
    resetContentState() {
      this.contents = [];
      this.content = null;
      this.contentTotal = 0;
      this.contentLoading = false;
      this.searchResults = [];
      this.searchLoading = false;
      this.contentVersions = [];
      this.contentVersion = null;
      this.versionsLoading = false;
      this.collaborations = [];
      this.collaborationsLoading = false;
      this.subscriptions = [];
      this.subscriptionsLoading = false;
      this.analytics = [];
      this.analyticsLoading = false;
      this.stats = null;
      this.statsLoading = false;
      this.importResult = null;
      this.importLoading = false;
      this.exportLoading = false;
    },
  },
});

// 分类状态管理
export const useCategoryStore = defineStore('category', {
  state: () => ({
    categories: [] as Category[],
    category: null as Category | null,
    categoryTree: [] as Category[],
    loading: false,
  }),
  
  getters: {
    // 获取顶级分类
    topCategories: (state) => state.categories.filter(category => !category.parentId),
    
    // 获取子分类
    childCategories: (state) => {
      const getChildCategories = (parentId: string): Category[] => {
        return state.categories.filter(category => category.parentId === parentId);
      };
      return getChildCategories;
    },
    
    // 获取分类路径
    categoryPath: (state) => {
      const getCategoryPath = (categoryId: string): Category[] => {
        const path: Category[] = [];
        let currentCategory = state.categories.find(cat => cat.id === categoryId);
        
        while (currentCategory) {
          path.unshift(currentCategory);
          if (currentCategory.parentId) {
            currentCategory = state.categories.find(cat => cat.id === currentCategory!.parentId);
          } else {
            currentCategory = null;
          }
        }
        
        return path;
      };
      return getCategoryPath;
    },
    
    // 获取分类选项
    categoryOptions: (state) => {
      const getCategoryOptions = (parentId?: string, level = 0): Array<{ label: string; value: string; level: number }> => {
        const options: Array<{ label: string; value: string; level: number }> = [];
        const children = state.categories.filter(category => category.parentId === parentId);
        
        children.forEach(category => {
          options.push({
            label: category.name,
            value: category.id,
            level,
          });
          
          const childOptions = getCategoryOptions(category.id, level + 1);
          options.push(...childOptions);
        });
        
        return options;
      };
      return getCategoryOptions;
    },
  },
  
  actions: {
    // 获取分类列表
    async fetchCategories() {
      this.loading = true;
      try {
        this.categories = await categoryService.getCategories();
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 获取分类详情
    async fetchCategoryById(id: string) {
      this.loading = true;
      try {
        this.category = await categoryService.getCategoryById(id);
      } catch (error) {
        console.error('Failed to fetch category:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 通过slug获取分类
    async fetchCategoryBySlug(slug: string) {
      this.loading = true;
      try {
        this.category = await categoryService.getCategoryBySlug(slug);
      } catch (error) {
        console.error('Failed to fetch category by slug:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 创建分类
    async createCategory(data: Omit<Category, 'id' | 'contentCount' | 'createdAt' | 'updatedAt'>) {
      this.loading = true;
      try {
        const newCategory = await categoryService.createCategory(data);
        this.categories.push(newCategory);
        return newCategory;
      } catch (error) {
        console.error('Failed to create category:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 更新分类
    async updateCategory(id: string, data: Partial<Category>) {
      this.loading = true;
      try {
        const updatedCategory = await categoryService.updateCategory(id, data);
        const index = this.categories.findIndex(category => category.id === updatedCategory.id);
        if (index !== -1) {
          this.categories[index] = updatedCategory;
        }
        if (this.category && this.category.id === updatedCategory.id) {
          this.category = updatedCategory;
        }
        return updatedCategory;
      } catch (error) {
        console.error('Failed to update category:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 删除分类
    async deleteCategory(id: string) {
      this.loading = true;
      try {
        await categoryService.deleteCategory(id);
        this.categories = this.categories.filter(category => category.id !== id);
        if (this.category && this.category.id === id) {
          this.category = null;
        }
      } catch (error) {
        console.error('Failed to delete category:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 获取分类树
    async fetchCategoryTree() {
      this.loading = true;
      try {
        this.categoryTree = await categoryService.getCategoryTree();
      } catch (error) {
        console.error('Failed to fetch category tree:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 重新排序分类
    async reorderCategories(categories: { id: string; order: number; parentId?: string }[]) {
      this.loading = true;
      try {
        const reorderedCategories = await categoryService.reorderCategories(categories);
        this.categories = reorderedCategories;
        return reorderedCategories;
      } catch (error) {
        console.error('Failed to reorder categories:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 重置状态
    resetCategoryState() {
      this.categories = [];
      this.category = null;
      this.categoryTree = [];
      this.loading = false;
    },
  },
});

// 标签状态管理
export const useTagStore = defineStore('tag', {
  state: () => ({
    tags: [] as Tag[],
    tag: null as Tag | null,
    popularTags: [] as Tag[],
    searchResults: [] as Tag[],
    loading: false,
  }),
  
  getters: {
    // 获取标签选项
    tagOptions: (state) => state.tags.map(tag => ({ label: tag.name, value: tag.id })),
    
    // 获取热门标签选项
    popularTagOptions: (state) => state.popularTags.map(tag => ({ label: tag.name, value: tag.id })),
    
    // 获取搜索结果选项
    searchTagOptions: (state) => state.searchResults.map(tag => ({ label: tag.name, value: tag.id })),
  },
  
  actions: {
    // 获取标签列表
    async fetchTags() {
      this.loading = true;
      try {
        this.tags = await tagService.getTags();
      } catch (error) {
        console.error('Failed to fetch tags:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 获取标签详情
    async fetchTagById(id: string) {
      this.loading = true;
      try {
        this.tag = await tagService.getTagById(id);
      } catch (error) {
        console.error('Failed to fetch tag:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 通过slug获取标签
    async fetchTagBySlug(slug: string) {
      this.loading = true;
      try {
        this.tag = await tagService.getTagBySlug(slug);
      } catch (error) {
        console.error('Failed to fetch tag by slug:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 创建标签
    async createTag(data: Omit<Tag, 'id' | 'contentCount' | 'createdAt' | 'updatedAt'>) {
      this.loading = true;
      try {
        const newTag = await tagService.createTag(data);
        this.tags.push(newTag);
        return newTag;
      } catch (error) {
        console.error('Failed to create tag:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 更新标签
    async updateTag(id: string, data: Partial<Tag>) {
      this.loading = true;
      try {
        const updatedTag = await tagService.updateTag(id, data);
        const index = this.tags.findIndex(tag => tag.id === updatedTag.id);
        if (index !== -1) {
          this.tags[index] = updatedTag;
        }
        if (this.tag && this.tag.id === updatedTag.id) {
          this.tag = updatedTag;
        }
        return updatedTag;
      } catch (error) {
        console.error('Failed to update tag:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 删除标签
    async deleteTag(id: string) {
      this.loading = true;
      try {
        await tagService.deleteTag(id);
        this.tags = this.tags.filter(tag => tag.id !== id);
        if (this.tag && this.tag.id === id) {
          this.tag = null;
        }
      } catch (error) {
        console.error('Failed to delete tag:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 获取热门标签
    async fetchPopularTags(limit: number = 10) {
      this.loading = true;
      try {
        this.popularTags = await tagService.getPopularTags(limit);
      } catch (error) {
        console.error('Failed to fetch popular tags:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 搜索标签
    async searchTags(query: string) {
      this.loading = true;
      try {
        this.searchResults = await tagService.searchTags(query);
      } catch (error) {
        console.error('Failed to search tags:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 重置状态
    resetTagState() {
      this.tags = [];
      this.tag = null;
      this.popularTags = [];
      this.searchResults = [];
      this.loading = false;
    },
  },
});

// 评论状态管理
export const useCommentStore = defineStore('comment', {
  state: () => ({
    comments: [] as Comment[],
    comment: null as Comment | null,
    commentReplies: [] as Comment[],
    loading: false,
  }),
  
  getters: {
    // 获取已审核评论
    approvedComments: (state) => state.comments.filter(comment => comment.status === 'approved'),
    
    // 获取待审核评论
    pendingComments: (state) => state.comments.filter(comment => comment.status === 'pending'),
    
    // 获取已拒绝评论
    rejectedComments: (state) => state.comments.filter(comment => comment.status === 'rejected'),
    
    // 获取垃圾评论
    spamComments: (state) => state.comments.filter(comment => comment.status === 'spam'),
    
    // 获取顶级评论
    topLevelComments: (state) => state.comments.filter(comment => !comment.parentId),
    
    // 获取评论回复
    commentRepliesMap: (state) => {
      const repliesMap: Record<string, Comment[]> = {};
      state.comments.forEach(comment => {
        if (comment.parentId) {
          if (!repliesMap[comment.parentId]) {
            repliesMap[comment.parentId] = [];
          }
          repliesMap[comment.parentId].push(comment);
        }
      });
      return repliesMap;
    },
  },
  
  actions: {
    // 获取评论列表
    async fetchComments(contentId?: string, status?: string) {
      this.loading = true;
      try {
        this.comments = await commentService.getComments(contentId, status);
      } catch (error) {
        console.error('Failed to fetch comments:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 获取评论详情
    async fetchCommentById(id: string) {
      this.loading = true;
      try {
        this.comment = await commentService.getCommentById(id);
      } catch (error) {
        console.error('Failed to fetch comment:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 创建评论
    async createComment(data: Omit<Comment, 'id' | 'createdAt' | 'updatedAt' | 'likes' | 'replies'>) {
      this.loading = true;
      try {
        const newComment = await commentService.createComment(data);
        this.comments.unshift(newComment);
        return newComment;
      } catch (error) {
        console.error('Failed to create comment:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 更新评论
    async updateComment(id: string, data: Partial<Comment>) {
      this.loading = true;
      try {
        const updatedComment = await commentService.updateComment(id, data);
        const index = this.comments.findIndex(comment => comment.id === updatedComment.id);
        if (index !== -1) {
          this.comments[index] = updatedComment;
        }
        if (this.comment && this.comment.id === updatedComment.id) {
          this.comment = updatedComment;
        }
        return updatedComment;
      } catch (error) {
        console.error('Failed to update comment:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 删除评论
    async deleteComment(id: string) {
      this.loading = true;
      try {
        await commentService.deleteComment(id);
        this.comments = this.comments.filter(comment => comment.id !== id);
        if (this.comment && this.comment.id === id) {
          this.comment = null;
        }
      } catch (error) {
        console.error('Failed to delete comment:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 审核通过评论
    async approveComment(id: string) {
      this.loading = true;
      try {
        const approvedComment = await commentService.approveComment(id);
        const index = this.comments.findIndex(comment => comment.id === approvedComment.id);
        if (index !== -1) {
          this.comments[index] = approvedComment;
        }
        if (this.comment && this.comment.id === approvedComment.id) {
          this.comment = approvedComment;
        }
        return approvedComment;
      } catch (error) {
        console.error('Failed to approve comment:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 审核拒绝评论
    async rejectComment(id: string) {
      this.loading = true;
      try {
        const rejectedComment = await commentService.rejectComment(id);
        const index = this.comments.findIndex(comment => comment.id === rejectedComment.id);
        if (index !== -1) {
          this.comments[index] = rejectedComment;
        }
        if (this.comment && this.comment.id === rejectedComment.id) {
          this.comment = rejectedComment;
        }
        return rejectedComment;
      } catch (error) {
        console.error('Failed to reject comment:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 标记为垃圾评论
    async markAsSpam(id: string) {
      this.loading = true;
      try {
        const spamComment = await commentService.markAsSpam(id);
        const index = this.comments.findIndex(comment => comment.id === spamComment.id);
        if (index !== -1) {
          this.comments[index] = spamComment;
        }
        if (this.comment && this.comment.id === spamComment.id) {
          this.comment = spamComment;
        }
        return spamComment;
      } catch (error) {
        console.error('Failed to mark comment as spam:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 获取评论回复
    async fetchCommentReplies(commentId: string) {
      this.loading = true;
      try {
        this.commentReplies = await commentService.getCommentReplies(commentId);
      } catch (error) {
        console.error('Failed to fetch comment replies:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 点赞评论
    async likeComment(id: string) {
      this.loading = true;
      try {
        const likedComment = await commentService.likeComment(id);
        const index = this.comments.findIndex(comment => comment.id === likedComment.id);
        if (index !== -1) {
          this.comments[index] = likedComment;
        }
        if (this.comment && this.comment.id === likedComment.id) {
          this.comment = likedComment;
        }
        return likedComment;
      } catch (error) {
        console.error('Failed to like comment:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 取消点赞评论
    async unlikeComment(id: string) {
      this.loading = true;
      try {
        const unlikedComment = await commentService.unlikeComment(id);
        const index = this.comments.findIndex(comment => comment.id === unlikedComment.id);
        if (index !== -1) {
          this.comments[index] = unlikedComment;
        }
        if (this.comment && this.comment.id === unlikedComment.id) {
          this.comment = unlikedComment;
        }
        return unlikedComment;
      } catch (error) {
        console.error('Failed to unlike comment:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 批量审核通过评论
    async batchApproveComments(ids: string[]) {
      this.loading = true;
      try {
        const approvedComments = await commentService.batchApproveComments(ids);
        approvedComments.forEach(approvedComment => {
          const index = this.comments.findIndex(comment => comment.id === approvedComment.id);
          if (index !== -1) {
            this.comments[index] = approvedComment;
          }
        });
        return approvedComments;
      } catch (error) {
        console.error('Failed to batch approve comments:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 批量审核拒绝评论
    async batchRejectComments(ids: string[]) {
      this.loading = true;
      try {
        const rejectedComments = await commentService.batchRejectComments(ids);
        rejectedComments.forEach(rejectedComment => {
          const index = this.comments.findIndex(comment => comment.id === rejectedComment.id);
          if (index !== -1) {
            this.comments[index] = rejectedComment;
          }
        });
        return rejectedComments;
      } catch (error) {
        console.error('Failed to batch reject comments:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 批量删除评论
    async batchDeleteComments(ids: string[]) {
      this.loading = true;
      try {
        await commentService.batchDeleteComments(ids);
        this.comments = this.comments.filter(comment => !ids.includes(comment.id));
      } catch (error) {
        console.error('Failed to batch delete comments:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 重置状态
    resetCommentState() {
      this.comments = [];
      this.comment = null;
      this.commentReplies = [];
      this.loading = false;
    },
  },
});

// 媒体状态管理
export const useMediaStore = defineStore('media', {
  state: () => ({
    media: [] as Media[],
    mediaItem: null as Media | null,
    mediaTotal: 0,
    mediaFolders: [] as MediaFolder[],
    mediaFolder: null as MediaFolder | null,
    searchResults: [] as Media[],
    loading: false,
  }),
  
  getters: {
    // 获取图片媒体
    imageMedia: (state) => state.media.filter(item => item.type.startsWith('image/')),
    
    // 获取视频媒体
    videoMedia: (state) => state.media.filter(item => item.type.startsWith('video/')),
    
    // 获取音频媒体
    audioMedia: (state) => state.media.filter(item => item.type.startsWith('audio/')),
    
    // 获取文档媒体
    documentMedia: (state) => state.media.filter(item => item.type.startsWith('application/') || item.type.startsWith('text/')),
    
    // 获取顶级媒体文件夹
    topMediaFolders: (state) => state.mediaFolders.filter(folder => !folder.parentId),
    
    // 获取子媒体文件夹
    childMediaFolders: (state) => {
      const getChildFolders = (parentId: string): MediaFolder[] => {
        return state.mediaFolders.filter(folder => folder.parentId === parentId);
      };
      return getChildFolders;
    },
    
    // 获取媒体文件夹路径
    mediaFolderPath: (state) => {
      const getFolderPath = (folderId: string): MediaFolder[] => {
        const path: MediaFolder[] = [];
        let currentFolder = state.mediaFolders.find(folder => folder.id === folderId);
        
        while (currentFolder) {
          path.unshift(currentFolder);
          if (currentFolder.parentId) {
            currentFolder = state.mediaFolders.find(folder => folder.id === currentFolder!.parentId);
          } else {
            currentFolder = null;
          }
        }
        
        return path;
      };
      return getFolderPath;
    },
    
    // 获取媒体文件夹选项
    mediaFolderOptions: (state) => {
      const getFolderOptions = (parentId?: string, level = 0): Array<{ label: string; value: string; level: number }> => {
        const options: Array<{ label: string; value: string; level: number }> = [];
        const children = state.mediaFolders.filter(folder => folder.parentId === parentId);
        
        children.forEach(folder => {
          options.push({
            label: folder.name,
            value: folder.id,
            level,
          });
          
          const childOptions = getFolderOptions(folder.id, level + 1);
          options.push(...childOptions);
        });
        
        return options;
      };
      return getFolderOptions;
    },
  },
  
  actions: {
    // 获取媒体列表
    async fetchMedia(folderId?: string, query: { page?: number; pageSize?: number; search?: string; type?: string } = {}) {
      this.loading = true;
      try {
        const result = await mediaService.getMedia(folderId, query);
        this.media = result.media;
        this.mediaTotal = result.total;
      } catch (error) {
        console.error('Failed to fetch media:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 获取媒体详情
    async fetchMediaById(id: string) {
      this.loading = true;
      try {
        this.mediaItem = await mediaService.getMediaById(id);
      } catch (error) {
        console.error('Failed to fetch media:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 上传媒体
    async uploadMedia(file: File, folderId?: string, metadata?: Record<string, any>) {
      this.loading = true;
      try {
        const newMedia = await mediaService.uploadMedia(file, folderId, metadata);
        this.media.unshift(newMedia);
        this.mediaTotal += 1;
        return newMedia;
      } catch (error) {
        console.error('Failed to upload media:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 更新媒体
    async updateMedia(id: string, data: Partial<Media>) {
      this.loading = true;
      try {
        const updatedMedia = await mediaService.updateMedia(id, data);
        const index = this.media.findIndex(item => item.id === updatedMedia.id);
        if (index !== -1) {
          this.media[index] = updatedMedia;
        }
        if (this.mediaItem && this.mediaItem.id === updatedMedia.id) {
          this.mediaItem = updatedMedia;
        }
        return updatedMedia;
      } catch (error) {
        console.error('Failed to update media:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 删除媒体
    async deleteMedia(id: string) {
      this.loading = true;
      try {
        await mediaService.deleteMedia(id);
        this.media = this.media.filter(item => item.id !== id);
        this.mediaTotal -= 1;
        if (this.mediaItem && this.mediaItem.id === id) {
          this.mediaItem = null;
        }
      } catch (error) {
        console.error('Failed to delete media:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 移动媒体
    async moveMedia(id: string, folderId?: string) {
      this.loading = true;
      try {
        const movedMedia = await mediaService.moveMedia(id, folderId);
        const index = this.media.findIndex(item => item.id === movedMedia.id);
        if (index !== -1) {
          this.media[index] = movedMedia;
        }
        if (this.mediaItem && this.mediaItem.id === movedMedia.id) {
          this.mediaItem = movedMedia;
        }
        return movedMedia;
      } catch (error) {
        console.error('Failed to move media:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 复制媒体
    async copyMedia(id: string, folderId?: string) {
      this.loading = true;
      try {
        const copiedMedia = await mediaService.copyMedia(id, folderId);
        this.media.unshift(copiedMedia);
        this.mediaTotal += 1;
        return copiedMedia;
      } catch (error) {
        console.error('Failed to copy media:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 获取媒体文件夹列表
    async fetchMediaFolders() {
      this.loading = true;
      try {
        this.mediaFolders = await mediaService.getMediaFolders();
      } catch (error) {
        console.error('Failed to fetch media folders:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 获取媒体文件夹详情
    async fetchMediaFolderById(id: string) {
      this.loading = true;
      try {
        this.mediaFolder = await mediaService.getMediaFolderById(id);
      } catch (error) {
        console.error('Failed to fetch media folder:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 创建媒体文件夹
    async createMediaFolder(data: Omit<MediaFolder, 'id' | 'mediaCount' | 'createdAt' | 'updatedAt'>) {
      this.loading = true;
      try {
        const newFolder = await mediaService.createMediaFolder(data);
        this.mediaFolders.push(newFolder);
        return newFolder;
      } catch (error) {
        console.error('Failed to create media folder:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 更新媒体文件夹
    async updateMediaFolder(id: string, data: Partial<MediaFolder>) {
      this.loading = true;
      try {
        const updatedFolder = await mediaService.updateMediaFolder(id, data);
        const index = this.mediaFolders.findIndex(folder => folder.id === updatedFolder.id);
        if (index !== -1) {
          this.mediaFolders[index] = updatedFolder;
        }
        if (this.mediaFolder && this.mediaFolder.id === updatedFolder.id) {
          this.mediaFolder = updatedFolder;
        }
        return updatedFolder;
      } catch (error) {
        console.error('Failed to update media folder:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 删除媒体文件夹
    async deleteMediaFolder(id: string) {
      this.loading = true;
      try {
        await mediaService.deleteMediaFolder(id);
        this.mediaFolders = this.mediaFolders.filter(folder => folder.id !== id);
        if (this.mediaFolder && this.mediaFolder.id === id) {
          this.mediaFolder = null;
        }
      } catch (error) {
        console.error('Failed to delete media folder:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 移动媒体文件夹
    async moveMediaFolder(id: string, parentId?: string) {
      this.loading = true;
      try {
        const movedFolder = await mediaService.moveMediaFolder(id, parentId);
        const index = this.mediaFolders.findIndex(folder => folder.id === movedFolder.id);
        if (index !== -1) {
          this.mediaFolders[index] = movedFolder;
        }
        if (this.mediaFolder && this.mediaFolder.id === movedFolder.id) {
          this.mediaFolder = movedFolder;
        }
        return movedFolder;
      } catch (error) {
        console.error('Failed to move media folder:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 搜索媒体
    async searchMedia(query: string, filters: { type?: string; folderId?: string } = {}) {
      this.loading = true;
      try {
        this.searchResults = await mediaService.searchMedia(query, filters);
      } catch (error) {
        console.error('Failed to search media:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 批量删除媒体
    async batchDeleteMedia(ids: string[]) {
      this.loading = true;
      try {
        await mediaService.batchDeleteMedia(ids);
        this.media = this.media.filter(item => !ids.includes(item.id));
        this.mediaTotal -= ids.length;
      } catch (error) {
        console.error('Failed to batch delete media:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 批量移动媒体
    async batchMoveMedia(ids: string[], folderId?: string) {
      this.loading = true;
      try {
        const movedMedia = await mediaService.batchMoveMedia(ids, folderId);
        movedMedia.forEach(item => {
          const index = this.media.findIndex(media => media.id === item.id);
          if (index !== -1) {
            this.media[index] = item;
          }
        });
        return movedMedia;
      } catch (error) {
        console.error('Failed to batch move media:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 批量更新媒体
    async batchUpdateMedia(ids: string[], data: Partial<Media>) {
      this.loading = true;
      try {
        const updatedMedia = await mediaService.batchUpdateMedia(ids, data);
        updatedMedia.forEach(item => {
          const index = this.media.findIndex(media => media.id === item.id);
          if (index !== -1) {
            this.media[index] = item;
          }
        });
        return updatedMedia;
      } catch (error) {
        console.error('Failed to batch update media:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 重置状态
    resetMediaState() {
      this.media = [];
      this.mediaItem = null;
      this.mediaTotal = 0;
      this.mediaFolders = [];
      this.mediaFolder = null;
      this.searchResults = [];
      this.loading = false;
    },
  },
});

// 内容管理状态管理
export const useContentManagementStore = defineStore('contentManagement', {
  state: () => ({
    dashboardStats: null as {
      content: ContentStats;
      recentActivity: any[];
      scheduledContent: Content[];
      pendingReviews: ContentReview[];
    } | null,
    loading: false,
  }),
  
  actions: {
    // 获取仪表板统计数据
    async fetchDashboardStats() {
      this.loading = true;
      try {
        this.dashboardStats = await contentManagementService.getDashboardStats();
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 清理回收站
    async cleanupTrash() {
      this.loading = true;
      try {
        return await contentManagementService.cleanupTrash();
      } catch (error) {
        console.error('Failed to cleanup trash:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 清理旧版本
    async cleanupOldRevisions(days: number = 30) {
      this.loading = true;
      try {
        return await contentManagementService.cleanupOldRevisions(days);
      } catch (error) {
        console.error('Failed to cleanup old revisions:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 清理孤立媒体
    async cleanupOrphanedMedia() {
      this.loading = true;
      try {
        return await contentManagementService.cleanupOrphanedMedia();
      } catch (error) {
        console.error('Failed to cleanup orphaned media:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 优化图片
    async optimizeImages() {
      this.loading = true;
      try {
        return await contentManagementService.optimizeImages();
      } catch (error) {
        console.error('Failed to optimize images:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 生成缩略图
    async generateThumbnails() {
      this.loading = true;
      try {
        return await contentManagementService.generateThumbnails();
      } catch (error) {
        console.error('Failed to generate thumbnails:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 备份内容
    async backupContent() {
      this.loading = true;
      try {
        return await contentManagementService.backupContent();
      } catch (error) {
        console.error('Failed to backup content:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 恢复内容
    async restoreContent(backup: Blob) {
      this.loading = true;
      try {
        return await contentManagementService.restoreContent(backup);
      } catch (error) {
        console.error('Failed to restore content:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 重置状态
    resetContentManagementState() {
      this.dashboardStats = null;
      this.loading = false;
    },
  },
});