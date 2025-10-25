// 模态框相关组合式函数
import { ref, reactive, computed, watch, nextTick } from 'vue';
import type { Ref, ComputedRef } from 'vue';

// 模态框大小
export type ModalSize = 'small' | 'medium' | 'large' | 'full';

// 模态框项
export interface ModalItem {
  id: string;
  title?: string;
  content?: any;
  size?: ModalSize;
  closable?: boolean;
  maskClosable?: boolean;
  showFooter?: boolean;
  okText?: string;
  cancelText?: string;
  okButtonProps?: Record<string, any>;
  cancelButtonProps?: Record<string, any>;
  className?: string;
  zIndex?: number;
  centered?: boolean;
  width?: string | number;
  height?: string | number;
  onOk?: () => boolean | Promise<boolean>;
  onCancel?: () => boolean | Promise<boolean>;
  onClose?: () => void;
  afterClose?: () => void;
  component?: any;
  props?: Record<string, any>;
  events?: Record<string, Function>;
  createdAt: number;
}

// 模态框配置
export interface ModalConfig {
  maxCount?: number;
  zIndex?: number;
  getContainer?: () => HTMLElement;
}

// 默认模态框配置
export const defaultModalConfig: ModalConfig = {
  maxCount: 3,
  zIndex: 1000,
};

// 模态框组合式函数
export function useModal(config: ModalConfig = {}) {
  // 合并配置
  const modalConfig = { ...defaultModalConfig, ...config };
  
  // 模态框列表
  const modals = ref<ModalItem[]>([]);
  
  // 模态框计数
  const count = computed(() => modals.value.length);
  
  // 是否有模态框
  const hasModals = computed(() => count.value > 0);
  
  // 生成唯一ID
  const generateId = (): string => {
    return `modal_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  };
  
  // 添加模态框
  const addModal = (modal: Omit<ModalItem, 'id' | 'createdAt'>): string => {
    const id = generateId();
    const newModal: ModalItem = {
      id,
      createdAt: Date.now(),
      size: 'medium',
      closable: true,
      maskClosable: true,
      showFooter: true,
      okText: '确定',
      cancelText: '取消',
      centered: true,
      ...modal,
    };
    
    // 检查最大数量限制
    if (modalConfig.maxCount && modals.value.length >= modalConfig.maxCount) {
      // 移除最早的模态框
      const oldestModal = modals.value.reduce((oldest, current) => 
        current.createdAt < oldest.createdAt ? current : oldest
      );
      removeModal(oldestModal.id);
    }
    
    // 添加新模态框
    modals.value.push(newModal);
    
    return id;
  };
  
  // 移除模态框
  const removeModal = (id: string): boolean => {
    const index = modals.value.findIndex(m => m.id === id);
    if (index !== -1) {
      const modal = modals.value[index];
      
      // 调用关闭回调
      if (modal.onClose) {
        modal.onClose();
      }
      
      // 从列表中移除
      modals.value.splice(index, 1);
      
      // 调用关闭后回调
      if (modal.afterClose) {
        nextTick(() => {
          modal.afterClose?.();
        });
      }
      
      return true;
    }
    return false;
  };
  
  // 清空所有模态框
  const clearAllModals = (): void => {
    // 调用所有模态框的关闭回调
    modals.value.forEach(modal => {
      if (modal.onClose) {
        modal.onClose();
      }
    });
    
    modals.value = [];
  };
  
  // 确认模态框
  const confirm = async (id: string): Promise<boolean> => {
    const modal = modals.value.find(m => m.id === id);
    if (!modal) return false;
    
    try {
      // 调用确认回调
      if (modal.onOk) {
        const result = await modal.onOk();
        if (result === false) {
          return false;
        }
      }
      
      // 移除模态框
      removeModal(id);
      return true;
    } catch (error) {
      console.error('模态框确认错误:', error);
      return false;
    }
  };
  
  // 取消模态框
  const cancel = async (id: string): Promise<boolean> => {
    const modal = modals.value.find(m => m.id === id);
    if (!modal) return false;
    
    try {
      // 调用取消回调
      if (modal.onCancel) {
        const result = await modal.onCancel();
        if (result === false) {
          return false;
        }
      }
      
      // 移除模态框
      removeModal(id);
      return true;
    } catch (error) {
      console.error('模态框取消错误:', error);
      return false;
    }
  };
  
  // 更新模态框
  const updateModal = (id: string, updates: Partial<ModalItem>): boolean => {
    const index = modals.value.findIndex(m => m.id === id);
    if (index !== -1) {
      modals.value[index] = { ...modals.value[index], ...updates };
      return true;
    }
    return false;
  };
  
  // 获取模态框
  const getModal = (id: string): ModalItem | undefined => {
    return modals.value.find(m => m.id === id);
  };
  
  // 获取最顶层的模态框
  const getTopModal = (): ModalItem | undefined => {
    if (modals.value.length === 0) return undefined;
    return modals.value[modals.value.length - 1];
  };
  
  // 创建确认对话框
  const createConfirm = (options: {
    title?: string;
    content?: string;
    okText?: string;
    cancelText?: string;
    onOk?: () => boolean | Promise<boolean>;
    onCancel?: () => boolean | Promise<boolean>;
  }): string => {
    return addModal({
      title: options.title || '确认',
      content: options.content || '确定要执行此操作吗？',
      okText: options.okText || '确定',
      cancelText: options.cancelText || '取消',
      size: 'small',
      onOk: options.onOk,
      onCancel: options.onCancel,
    });
  };
  
  // 创建信息对话框
  const createInfo = (options: {
    title?: string;
    content?: string;
    okText?: string;
    onOk?: () => boolean | Promise<boolean>;
  }): string => {
    return addModal({
      title: options.title || '提示',
      content: options.content || '',
      okText: options.okText || '确定',
      size: 'small',
      showFooter: true,
      cancelButtonProps: { style: { display: 'none' } },
      onOk: options.onOk,
    });
  };
  
  // 创建成功对话框
  const createSuccess = (options: {
    title?: string;
    content?: string;
    okText?: string;
    onOk?: () => boolean | Promise<boolean>;
  }): string => {
    return addModal({
      title: options.title || '成功',
      content: options.content || '操作成功',
      okText: options.okText || '确定',
      size: 'small',
      showFooter: true,
      cancelButtonProps: { style: { display: 'none' } },
      onOk: options.onOk,
    });
  };
  
  // 创建错误对话框
  const createError = (options: {
    title?: string;
    content?: string;
    okText?: string;
    onOk?: () => boolean | Promise<boolean>;
  }): string => {
    return addModal({
      title: options.title || '错误',
      content: options.content || '操作失败',
      okText: options.okText || '确定',
      size: 'small',
      showFooter: true,
      cancelButtonProps: { style: { display: 'none' } },
      onOk: options.onOk,
    });
  };
  
  // 创建警告对话框
  const createWarning = (options: {
    title?: string;
    content?: string;
    okText?: string;
    onOk?: () => boolean | Promise<boolean>;
  }): string => {
    return addModal({
      title: options.title || '警告',
      content: options.content || '',
      okText: options.okText || '确定',
      size: 'small',
      showFooter: true,
      cancelButtonProps: { style: { display: 'none' } },
      onOk: options.onOk,
    });
  };
  
  // 更新模态框配置
  const updateConfig = (newConfig: Partial<ModalConfig>): void => {
    Object.assign(modalConfig, newConfig);
  };
  
  return {
    // 响应式数据
    modals: modals as Ref<ModalItem[]>,
    count: count as ComputedRef<number>,
    hasModals: hasModals as ComputedRef<boolean>,
    
    // 方法
    addModal,
    removeModal,
    clearAllModals,
    confirm,
    cancel,
    updateModal,
    getModal,
    getTopModal,
    createConfirm,
    createInfo,
    createSuccess,
    createError,
    createWarning,
    updateConfig,
  };
}

// 全局模态框管理器
class ModalManager {
  private static instance: ModalManager;
  private modalStore: ReturnType<typeof useModal>;
  
  private constructor() {
    this.modalStore = useModal();
  }
  
  public static getInstance(): ModalManager {
    if (!ModalManager.instance) {
      ModalManager.instance = new ModalManager();
    }
    return ModalManager.instance;
  }
  
  public getStore() {
    return this.modalStore;
  }
  
  // 便捷方法
  public confirm(options: {
    title?: string;
    content?: string;
    okText?: string;
    cancelText?: string;
    onOk?: () => boolean | Promise<boolean>;
    onCancel?: () => boolean | Promise<boolean>;
  }): string {
    return this.modalStore.createConfirm(options);
  }
  
  public info(options: {
    title?: string;
    content?: string;
    okText?: string;
    onOk?: () => boolean | Promise<boolean>;
  }): string {
    return this.modalStore.createInfo(options);
  }
  
  public success(options: {
    title?: string;
    content?: string;
    okText?: string;
    onOk?: () => boolean | Promise<boolean>;
  }): string {
    return this.modalStore.createSuccess(options);
  }
  
  public error(options: {
    title?: string;
    content?: string;
    okText?: string;
    onOk?: () => boolean | Promise<boolean>;
  }): string {
    return this.modalStore.createError(options);
  }
  
  public warning(options: {
    title?: string;
    content?: string;
    okText?: string;
    onOk?: () => boolean | Promise<boolean>;
  }): string {
    return this.modalStore.createWarning(options);
  }
  
  public clear(): void {
    this.modalStore.clearAllModals();
  }
}

// 导出全局模态框管理器实例
export const modalManager = ModalManager.getInstance();

// 导出类型
export type {
  ModalSize,
  ModalItem,
  ModalConfig,
};