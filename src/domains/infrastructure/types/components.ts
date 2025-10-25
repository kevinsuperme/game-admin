/**
 * 基础设施层组件类型定义
 */

/**
 * Flex 方向类型
 */
export type FlexDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse';

/**
 * Flex 对齐方式
 */
export type FlexAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';

/**
 * Flex 主轴对齐方式
 */
export type FlexJustify = 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';

/**
 * 间距大小
 */
export type SpacingSize = 'none' | 'small' | 'medium' | 'large';

/**
 * 最大宽度设置
 */
export type MaxWidth = 'none' | 'small' | 'medium' | 'large' | 'full';

/**
 * 响应式配置
 */
export interface ResponsiveConfig {
  /** 移动端配置 */
  mobile?: FlexDirection;
  /** 平板配置 */
  tablet?: FlexDirection;
  /** 桌面配置 */
  desktop?: FlexDirection;
}

/**
 * 响应式容器属性
 */
export interface ResponsiveContainerProps {
  /** HTML 标签名 */
  tag?: string;
  /** Flex 方向 */
  direction?: FlexDirection;
  /** 对齐方式 */
  align?: FlexAlign;
  /** 主轴对齐方式 */
  justify?: FlexJustify;
  /** 子元素间距 */
  spacing?: SpacingSize;
  /** 是否换行 */
  wrap?: boolean;
  /** 最大宽度 */
  maxWidth?: MaxWidth;
  /** 内边距 */
  padding?: SpacingSize;
  /** 外边距 */
  margin?: SpacingSize;
  /** 是否占满宽度 */
  fullWidth?: boolean;
  /** 是否占满高度 */
  fullHeight?: boolean;
  /** 响应式配置 */
  responsive?: ResponsiveConfig;
}