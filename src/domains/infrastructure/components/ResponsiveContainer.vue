<template>
  <component
    :is="tag"
    :class="containerClasses"
    :style="containerStyle"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';

/**
 * 间距大小
 */
type SpacingSize = 'none' | 'small' | 'medium' | 'large';

// 组件属性
const props = withDefaults(defineProps<{
  tag?: string;
  breakpoint?: 'all' | 'desktop' | 'tablet' | 'mobile';
  direction?: 'row' | 'column';
  spacing?: 'none' | 'small' | 'medium' | 'large';
  padding?: 'none' | 'small' | 'medium' | 'large';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around';
}>(), {
  tag: 'div',
  breakpoint: 'all',
  direction: 'row',
  spacing: 'medium',
  padding: 'medium',
  align: 'start',
  justify: 'start',
});

/**
 * 间距映射
 */
const spacingMap: Record<SpacingSize, string> = {
  none: '0',
  small: '0.5rem',
  medium: '1rem',
  large: '1.5rem',
};

// 响应式行为
const windowWidth = ref(window.innerWidth);

// 断点阈值
const breakpoints = {
  mobile: 768,
  tablet: 1024,
  desktop: 1200,
};

// 检查当前窗口宽度是否匹配断点
const matchesBreakpoint = computed(() => {
  if (props.breakpoint === 'all') {
    return true;
  }
  
  return windowWidth.value >= breakpoints[props.breakpoint];
});

// 组件是否可见
const isVisible = computed(() => {
  return matchesBreakpoint.value;
});

// 更新窗口宽度
const updateWindowWidth = () => {
  windowWidth.value = window.innerWidth;
};

// 添加和移除resize事件监听器
onMounted(() => {
  window.addEventListener('resize', updateWindowWidth);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateWindowWidth);
});

/**
 * 容器类名
 */
const containerClasses = computed(() => {
  const classes = ['responsive-container'];

  // 断点类
  if (props.breakpoint) {
    classes.push(`breakpoint-${props.breakpoint}`);
  }

  // 方向类
  if (props.direction) {
    classes.push(`direction-${props.direction}`);
  }

  // 对齐类
  if (props.align) {
    classes.push(`align-${props.align}`);
  }

  // 间距类
  if (props.spacing) {
    classes.push(`spacing-${props.spacing}`);
  }

  // 内边距类
  if (props.padding) {
    classes.push(`padding-${props.padding}`);
  }

  return classes;
});

/**
 * 容器样式
 */
const containerStyle = computed(() => {
  const styles: Record<string, string> = {};

  // 如果组件不可见，设置display为none
  if (!isVisible.value) {
    styles.display = 'none';
  }

  // 间距
  if (props.spacing && props.spacing !== 'none') {
    styles.gap = spacingMap[props.spacing];
  }

  // 内边距
  if (props.padding && props.padding !== 'none') {
    styles.padding = spacingMap[props.padding];
  }

  return styles;
});
</script>

<style scoped>
.responsive-container {
  box-sizing: border-box;
}
</style>