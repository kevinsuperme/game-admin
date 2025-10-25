// UI组件相关类型定义
import type { Ref, ComputedRef } from 'vue';

// 组件尺寸
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// 组件变体
export type ComponentVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';

// 组件状态
export type ComponentState = 'default' | 'hover' | 'active' | 'focus' | 'disabled' | 'loading';

// 按钮组件类型
export interface ButtonProps {
  type?: 'button' | 'submit' | 'reset';
  variant?: ComponentVariant;
  size?: ComponentSize;
  disabled?: boolean;
  loading?: boolean;
  block?: boolean;
  rounded?: boolean;
  outlined?: boolean;
  text?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
  href?: string;
  target?: '_blank' | '_self' | '_parent' | '_top';
  to?: string;
  replace?: boolean;
  append?: boolean;
  exact?: boolean;
  activeClass?: string;
  exactActiveClass?: string;
  class?: string;
  style?: string | Record<string, any>;
}

// 输入框组件类型
export interface InputProps {
  type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search';
  value?: string | number;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  size?: ComponentSize;
  variant?: ComponentVariant;
  clearable?: boolean;
  showPassword?: boolean;
  maxlength?: number;
  minlength?: number;
  max?: number | string;
  min?: number | string;
  step?: number | string;
  autocomplete?: string;
  autofocus?: boolean;
  name?: string;
  id?: string;
  class?: string;
  style?: string | Record<string, any>;
}

// 选择框组件类型
export interface SelectProps {
  value?: any;
  options?: Array<{
    label: string;
    value: any;
    disabled?: boolean;
    group?: string;
  }>;
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
  filterable?: boolean;
  multiple?: boolean;
  size?: ComponentSize;
  variant?: ComponentVariant;
  loading?: boolean;
  remote?: boolean;
  remoteMethod?: (query: string) => void;
  loadingText?: string;
  noMatchText?: string;
  noDataText?: string;
  popperClass?: string;
  reserveKeyword?: boolean;
  defaultFirstOption?: boolean;
  teleported?: boolean;
  persistent?: boolean;
  automaticDropdown?: boolean;
  fitInputWidth?: boolean;
  suffixIcon?: string;
  prefixIcon?: string;
  tagType?: 'success' | 'info' | 'warning' | 'danger';
  validateEvent?: boolean;
  placement?: string;
  class?: string;
  style?: string | Record<string, any>;
}

// 复选框组件类型
export interface CheckboxProps {
  modelValue?: boolean | string | number;
  label?: string;
  trueLabel?: string | number;
  falseLabel?: string | number;
  disabled?: boolean;
  border?: boolean;
  size?: ComponentSize;
  name?: string;
  checked?: boolean;
  indeterminate?: boolean;
  validateEvent?: boolean;
  id?: string;
  controls?: string;
  class?: string;
  style?: string | Record<string, any>;
}

// 单选框组件类型
export interface RadioProps {
  modelValue?: boolean | string | number;
  label?: string;
  disabled?: boolean;
  name?: string;
  border?: boolean;
  size?: ComponentSize;
  value?: string | number | boolean;
  class?: string;
  style?: string | Record<string, any>;
}

// 开关组件类型
export interface SwitchProps {
  modelValue?: boolean;
  disabled?: boolean;
  loading?: boolean;
  size?: ComponentSize;
  activeIconClass?: string;
  inactiveIconClass?: string;
  activeText?: string;
  inactiveText?: string;
  activeValue?: boolean | string | number;
  inactiveValue?: boolean | string | number;
  activeColor?: string;
  inactiveColor?: string;
  name?: string;
  validateEvent?: boolean;
  id?: string;
  beforeChange?: (value: boolean) => boolean | Promise<boolean>;
  class?: string;
  style?: string | Record<string, any>;
}

// 滑块组件类型
export interface SliderProps {
  modelValue?: number;
  min?: number;
  max?: number;
  disabled?: boolean;
  step?: number;
  showInput?: boolean;
  showInputControls?: boolean;
  inputSize?: ComponentSize;
  showStops?: boolean;
  showTooltip?: boolean;
  formatTooltip?: (value: number) => string;
  range?: boolean;
  vertical?: boolean;
  height?: string;
  label?: string;
  debounce?: number;
  tooltipClass?: string;
  marks?: Record<number, string>;
  class?: string;
  style?: string | Record<string, any>;
}

// 日期选择器组件类型
export interface DatePickerProps {
  modelValue?: string | number | Date | Array<string | number | Date>;
  type?: 'year' | 'month' | 'date' | 'dates' | 'week' | 'datetime' | 'datetimerange' | 'daterange';
  placeholder?: string;
  startPlaceholder?: string;
  endPlaceholder?: string;
  format?: string;
  valueFormat?: string;
  readonly?: boolean;
  disabled?: boolean;
  editable?: boolean;
  clearable?: boolean;
  size?: ComponentSize;
  prefixIcon?: string;
  clearIcon?: string;
  class?: string;
  style?: string | Record<string, any>;
  validateEvent?: boolean;
  id?: string;
  popperClass?: string;
  rangeSeparator?: string;
  defaultValue?: string | number | Date | Array<string | number | Date>;
  defaultTime?: Date | Array<Date>;
  name?: string;
  unlinkPanels?: boolean;
  shortcuts?: Array<{
    text: string;
    value: Date | Function;
  }>;
  disabledDate?: (date: Date) => boolean;
  cellClassName?: (date: Date) => string;
  teleported?: boolean;
  appendToBody?: boolean;
}

// 时间选择器组件类型
export interface TimePickerProps {
  modelValue?: Date;
  isRange?: boolean;
  disabled?: boolean;
  editable?: boolean;
  clearable?: boolean;
  size?: ComponentSize;
  placeholder?: string;
  startPlaceholder?: string;
  endPlaceholder?: string;
  isRange?: boolean;
  arrowControl?: boolean;
  format?: string;
  valueFormat?: string;
  readonly?: boolean;
  disabledHours?: () => number[];
  disabledMinutes?: (hour: number) => number[];
  disabledSeconds?: (hour: number, minute: number) => number[];
  class?: string;
  style?: string | Record<string, any>;
  popperClass?: string;
  rangeSeparator?: string;
  prefixIcon?: string;
  clearIcon?: string;
  validateEvent?: boolean;
  id?: string;
  name?: string;
  teleported?: boolean;
  appendToBody?: boolean;
}

// 表格组件类型
export interface TableProps {
  data?: Array<Record<string, any>>;
  height?: string | number;
  maxHeight?: string | number;
  fit?: boolean;
  stripe?: boolean;
  border?: boolean;
  size?: ComponentSize;
  showHeader?: boolean;
  highlightCurrentRow?: boolean;
  currentRowKey?: string | number;
  rowClassName?: string | ((data: { row: Record<string, any>; rowIndex: number }) => string);
  rowStyle?: object | ((data: { row: Record<string, any>; rowIndex: number }) => object);
  cellClassName?: string | ((data: { row: Record<string, any>; column: any; rowIndex: number; columnIndex: number }) => string);
  cellStyle?: object | ((data: { row: Record<string, any>; column: any; rowIndex: number; columnIndex: number }) => object);
  headerRowClassName?: string | ((data: { row: Record<string, any>; rowIndex: number }) => string);
  headerRowStyle?: object | ((data: { row: Record<string, any>; rowIndex: number }) => object);
  headerCellClassName?: string | ((data: { row: Record<string, any>; column: any; rowIndex: number; columnIndex: number }) => string);
  headerCellStyle?: object | ((data: { row: Record<string, any>; column: any; rowIndex: number; columnIndex: number }) => object);
  rowKey?: string | ((row: Record<string, any>) => string);
  emptyText?: string;
  defaultExpandAll?: boolean;
  expandRowKeys?: Array<string | number>;
  defaultSort?: { prop: string; order: 'ascending' | 'descending' };
  tooltipEffect?: 'dark' | 'light';
  showSummary?: boolean;
  sumText?: string;
  summaryMethod?: (param: { columns: any[]; data: Record<string, any>[] }) => string[];
  spanMethod?: (param: { row: Record<string, any>; column: any; rowIndex: number; columnIndex: number }) => number[] | { rowspan: number; colspan: number };
  selectOnIndeterminate?: boolean;
  indent?: number;
  lazy?: boolean;
  load?: (row: Record<string, any>, treeNode: any, resolve: (data: Record<string, any>[]) => void) => void;
  treeProps?: { hasChildren?: string; children?: string };
  class?: string;
  style?: string | Record<string, any>;
}

// 分页组件类型
export interface PaginationProps {
  small?: boolean;
  background?: boolean;
  pageSize?: number;
  total?: number;
  pageCount?: number;
  pagerCount?: number;
  currentPage?: number;
  layout?: string;
  pageSizes?: number[];
  popperClass?: string;
  prevText?: string;
  nextText?: string;
  disabled?: boolean;
  hideOnSinglePage?: boolean;
  class?: string;
  style?: string | Record<string, any>;
}

// 标签页组件类型
export interface TabsProps {
  type?: 'card' | 'border-card';
  closable?: boolean;
  addable?: boolean;
  editable?: boolean;
  modelValue?: string;
  tabPosition?: 'top' | 'right' | 'bottom' | 'left';
  stretch?: boolean;
  beforeLeave?: (activeName: string, oldActiveName: string) => boolean | Promise<boolean>;
  class?: string;
  style?: string | Record<string, any>;
}

// 对话框组件类型
export interface DialogProps {
  modelValue?: boolean;
  title?: string;
  width?: string;
  fullscreen?: boolean;
  top?: string;
  modal?: boolean;
  modalClass?: string;
  appendToBody?: boolean;
  lockScroll?: boolean;
  customClass?: string;
  closeOnClickModal?: boolean;
  closeOnPressEscape?: boolean;
  showClose?: boolean;
  beforeClose?: (done: () => void) => void;
  center?: boolean;
  destroyOnClose?: boolean;
  alignCenter?: boolean;
  class?: string;
  style?: string | Record<string, any>;
}

// 抽屉组件类型
export interface DrawerProps {
  modelValue?: boolean;
  direction?: 'rtl' | 'ltr' | 'ttb' | 'btt';
  size?: number | string;
  title?: string;
  withHeader?: boolean;
  modal?: boolean;
  modalClass?: string;
  appendToBody?: boolean;
  lockScroll?: boolean;
  customClass?: string;
  closeOnClickModal?: boolean;
  closeOnPressEscape?: boolean;
  showClose?: boolean;
  beforeClose?: (done: () => void) => void;
  class?: string;
  style?: string | Record<string, any>;
}

// 消息提示组件类型
export interface MessageProps {
  message?: string;
  type?: 'success' | 'warning' | 'info' | 'error';
  icon?: string;
  customClass?: string;
  duration?: number;
  showClose?: boolean;
  center?: boolean;
  dangerouslyUseHTMLString?: boolean;
  onClose?: () => void;
  offset?: number;
  grouping?: boolean;
}

// 通知组件类型
export interface NotificationProps {
  title?: string;
  message?: string;
  type?: 'success' | 'warning' | 'info' | 'error';
  icon?: string;
  customClass?: string;
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  showClose?: boolean;
  dangerouslyUseHTMLString?: boolean;
  onClose?: () => void;
  onClick?: () => void;
  offset?: number;
}

// 加载组件类型
export interface LoadingProps {
  lock?: boolean;
  text?: string;
  spinner?: string;
  background?: string;
  customClass?: string;
  fullscreen?: boolean;
  target?: string | HTMLElement;
  body?: boolean;
}

// 进度条组件类型
export interface ProgressProps {
  percentage?: number;
  type?: 'line' | 'circle' | 'dashboard';
  strokeWidth?: number;
  status?: 'success' | 'exception' | 'warning';
  textInside?: boolean;
  width?: number;
  showText?: boolean;
  color?: string | Function | Array<{ color: string; percentage: number }>;
  format?: (percentage: number) => string;
  strokeLinecap?: 'butt' | 'round' | 'square';
  striped?: boolean;
  stripedFlow?: boolean;
  class?: string;
  style?: string | Record<string, any>;
}

// 标签组件类型
export interface TagProps {
  type?: 'primary' | 'success' | 'info' | 'warning' | 'danger';
  closable?: boolean;
  disableTransitions?: boolean;
  hit?: boolean;
  color?: string;
  size?: ComponentSize;
  effect?: 'dark' | 'light' | 'plain';
  round?: boolean;
  class?: string;
  style?: string | Record<string, any>;
}

// 徽章组件类型
export interface BadgeProps {
  value?: string | number;
  max?: number;
  isDot?: boolean;
  hidden?: boolean;
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  class?: string;
  style?: string | Record<string, any>;
}

// 头像组件类型
export interface AvatarProps {
  size?: number | 'large' | 'default' | 'small';
  shape?: 'circle' | 'square';
  src?: string;
  alt?: string;
  srcSet?: string;
  fit?: 'fill' | 'contain' | 'cover' | 'none' | 'scale-down';
  icon?: string;
  class?: string;
  style?: string | Record<string, any>;
}

// 图片组件类型
export interface ImageProps {
  src?: string;
  fit?: 'fill' | 'contain' | 'cover' | 'none' | 'scale-down';
  alt?: string;
  lazy?: boolean;
  scrollContainer?: string | HTMLElement;
  previewSrcList?: string[];
  zIndex?: number;
  initialIndex?: number;
  hideOnClickModal?: boolean;
  previewTeleported?: boolean;
  class?: string;
  style?: string | Record<string, any>;
}

// 卡片组件类型
export interface CardProps {
  header?: string;
  bodyStyle?: string | Record<string, any>;
  shadow?: 'always' | 'hover' | 'never';
  class?: string;
  style?: string | Record<string, any>;
}

// 走马灯组件类型
export interface CarouselProps {
  height?: string;
  initialIndex?: number;
  trigger?: 'click' | 'hover';
  autoplay?: boolean;
  interval?: number;
  indicatorPosition?: 'outside' | 'none';
  arrow?: 'always' | 'hover' | 'never';
  type?: 'card' | '';
  loop?: boolean;
  direction?: 'vertical' | 'horizontal';
  pauseOnHover?: boolean;
  class?: string;
  style?: string | Record<string, any>;
}

// 折叠面板组件类型
export interface CollapseProps {
  accordion?: boolean;
  modelValue?: string | Array<string>;
  class?: string;
  style?: string | Record<string, any>;
}

// 时间线组件类型
export interface TimelineProps {
  reverse?: boolean;
  class?: string;
  style?: string | Record<string, any>;
}

// 空状态组件类型
export interface EmptyProps {
  image?: string;
  imageSize?: number | [number, number];
  description?: string;
  class?: string;
  style?: string | Record<string, any>;
}

// 结果组件类型
export interface ResultProps {
  type?: 'success' | 'warning' | 'info' | 'error';
  title?: string;
  subTitle?: string;
  icon?: string;
  class?: string;
  style?: string | Record<string, any>;
}

// 骨架屏组件类型
export interface SkeletonProps {
  animated?: boolean;
  count?: number;
  throttle?: number;
  loading?: boolean;
  class?: string;
  style?: string | Record<string, any>;
}

// 回到顶部组件类型
export interface BacktopProps {
  target?: string;
  visibilityHeight?: number;
  right?: number;
  bottom?: number;
  class?: string;
  style?: string | Record<string, any>;
}

// 页面容器组件类型
export interface PageContainerProps {
  title?: string;
  subTitle?: string;
  breadcrumb?: Array<{ path: string; name: string }>;
  extra?: string;
  footer?: string;
  affix?: boolean;
  fixedHeader?: boolean;
  class?: string;
  style?: string | Record<string, any>;
}

// 表单容器组件类型
export interface FormContainerProps {
  title?: string;
  subTitle?: string;
  layout?: 'horizontal' | 'vertical' | 'inline';
  labelCol?: number | { span: number; offset?: number };
  wrapperCol?: number | { span: number; offset?: number };
  colon?: boolean;
  hideRequiredMark?: boolean;
  size?: ComponentSize;
  class?: string;
  style?: string | Record<string, any>;
}

// 搜索表单组件类型
export interface SearchFormProps {
  modelValue?: Record<string, any>;
  fields?: Array<{
    name: string;
    label: string;
    type: 'input' | 'select' | 'date' | 'daterange' | 'number' | 'radio' | 'checkbox';
    placeholder?: string;
    options?: Array<{ label: string; value: any }>;
    props?: Record<string, any>;
  }>;
  showReset?: boolean;
  showCollapse?: boolean;
  collapsed?: boolean;
  searchButtonText?: string;
  resetButtonText?: string;
  expandButtonText?: string;
  collapseButtonText?: string;
  class?: string;
  style?: string | Record<string, any>;
}

// 操作按钮组组件类型
export interface ActionButtonsProps {
  actions?: Array<{
    type?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
    text: string;
    icon?: string;
    disabled?: boolean;
    loading?: boolean;
    permission?: string;
    onClick?: () => void;
  }>;
  align?: 'left' | 'center' | 'right';
  size?: ComponentSize;
  class?: string;
  style?: string | Record<string, any>;
}

// 数据表格组件类型
export interface DataTableProps {
  data?: Array<Record<string, any>>;
  columns?: Array<{
    prop: string;
    label: string;
    width?: string | number;
    minWidth?: string | number;
    fixed?: boolean | 'left' | 'right';
    sortable?: boolean | 'custom';
    sortMethod?: (a: any, b: any) => number;
    sortBy?: string | string[] | ((row: Record<string, any>) => string | string[]);
    resizable?: boolean;
    formatter?: (row: Record<string, any>, column: any, cellValue: any, index: number) => string;
    className?: string;
    labelClassName?: string;
    renderHeader?: (param: { column: any; $index: number }) => any;
    align?: 'left' | 'center' | 'right';
    headerAlign?: 'left' | 'center' | 'right';
    showOverflowTooltip?: boolean;
    type?: 'selection' | 'index' | 'expand';
    index?: number;
    selectable?: (row: Record<string, any>, index: number) => boolean;
    reserveSelection?: boolean;
    filters?: Array<{ text: string; value: any }>;
    filterPlacement?: string;
    filterMultiple?: boolean;
    filterMethod?: (value: any, row: Record<string, any>, column: any) => boolean;
    filteredValue?: any[];
  }>;
  loading?: boolean;
  height?: string | number;
  maxHeight?: string | number;
  stripe?: boolean;
  border?: boolean;
  size?: ComponentSize;
  fit?: boolean;
  showHeader?: boolean;
  highlightCurrentRow?: boolean;
  currentRowKey?: string | number;
  rowClassName?: string | ((data: { row: Record<string, any>; rowIndex: number }) => string);
  rowStyle?: object | ((data: { row: Record<string, any>; rowIndex: number }) => object);
  cellClassName?: string | ((data: { row: Record<string, any>; column: any; rowIndex: number; columnIndex: number }) => string);
  cellStyle?: object | ((data: { row: Record<string, any>; column: any; rowIndex: number; columnIndex: number }) => object);
  headerRowClassName?: string | ((data: { row: Record<string, any>; rowIndex: number }) => string);
  headerRowStyle?: object | ((data: { row: Record<string, any>; rowIndex: number }) => object);
  headerCellClassName?: string | ((data: { row: Record<string, any>; column: any; rowIndex: number; columnIndex: number }) => string);
  headerCellStyle?: object | ((data: { row: Record<string, any>; column: any; rowIndex: number; columnIndex: number }) => object);
  rowKey?: string | ((row: Record<string, any>) => string);
  emptyText?: string;
  defaultExpandAll?: boolean;
  expandRowKeys?: Array<string | number>;
  defaultSort?: { prop: string; order: 'ascending' | 'descending' };
  tooltipEffect?: 'dark' | 'light';
  showSummary?: boolean;
  sumText?: string;
  summaryMethod?: (param: { columns: any[]; data: Record<string, any>[] }) => string[];
  spanMethod?: (param: { row: Record<string, any>; column: any; rowIndex: number; columnIndex: number }) => number[] | { rowspan: number; colspan: number };
  selectOnIndeterminate?: boolean;
  indent?: number;
  lazy?: boolean;
  load?: (row: Record<string, any>, treeNode: any, resolve: (data: Record<string, any>[]) => void) => void;
  treeProps?: { hasChildren?: string; children?: string };
  showSelection?: boolean;
  showIndex?: boolean;
  showActions?: boolean;
  actions?: Array<{
    type?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
    text: string;
    icon?: string;
    disabled?: boolean;
    loading?: boolean;
    permission?: string;
    onClick?: (row: Record<string, any>, index: number) => void;
  }>;
  pagination?: {
    small?: boolean;
    background?: boolean;
    pageSize?: number;
    total?: number;
    pageCount?: number;
    pagerCount?: number;
    currentPage?: number;
    layout?: string;
    pageSizes?: number[];
    popperClass?: string;
    prevText?: string;
    nextText?: string;
    disabled?: boolean;
    hideOnSinglePage?: boolean;
  };
  class?: string;
  style?: string | Record<string, any>;
}

// 组件相关类型导出
export type {
  ButtonProps,
  InputProps,
  SelectProps,
  CheckboxProps,
  RadioProps,
  SwitchProps,
  SliderProps,
  DatePickerProps,
  TimePickerProps,
  TableProps,
  PaginationProps,
  TabsProps,
  DialogProps,
  DrawerProps,
  MessageProps,
  NotificationProps,
  LoadingProps,
  ProgressProps,
  TagProps,
  BadgeProps,
  AvatarProps,
  ImageProps,
  CardProps,
  CarouselProps,
  CollapseProps,
  TimelineProps,
  EmptyProps,
  ResultProps,
  SkeletonProps,
  BacktopProps,
  PageContainerProps,
  FormContainerProps,
  SearchFormProps,
  ActionButtonsProps,
  DataTableProps,
  ComponentSize,
  ComponentVariant,
  ComponentState,
};