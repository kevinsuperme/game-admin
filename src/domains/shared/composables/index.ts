// 共享域组合式函数入口文件

// 主题相关
export { useTheme, themeUtils } from './useTheme';
export type { Theme, ThemeConfig, ThemeMode } from './useTheme';

// 响应式相关
export {
  useBreakpoints,
  useMediaQuery,
  useDeviceOrientation,
  useDevicePixelRatio,
  useViewport,
  useElementVisibility,
  useElementSize,
  useScrollLock,
  defaultBreakpoints,
} from './useResponsive';
export type { Breakpoints } from './useResponsive';

// 表单相关
export { useForm, useFormField } from './useForm';
export type {
  ValidationRule,
  FormFieldConfig,
  FormState,
  ValidationResult,
} from './useForm';

// 通知相关
export { useNotification, notificationManager } from './useNotification';
export type {
  NotificationType,
  NotificationPosition,
  NotificationItem,
  NotificationConfig,
} from './useNotification';

// 模态框相关
export { useModal, modalManager } from './useModal';
export type {
  ModalSize,
  ModalItem,
  ModalConfig,
} from './useModal';