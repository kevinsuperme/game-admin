// 主题切换按钮组件
<template>
  <div class="theme-toggle">
    <el-tooltip
      :content="tooltipContent"
      placement="bottom"
      :disabled="!showTooltip"
    >
      <el-button
        :icon="iconComponent"
        circle
        @click="toggleThemeMode"
        :size="(size as any)"
        :type="(type as any)"
      />
    </el-tooltip>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Sunny, Moon } from '@element-plus/icons-vue';
import { useThemeToggle } from '../composables/useTheme';

// 定义组件属性
interface Props {
  size?: 'large' | 'default' | 'small';
  type?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'text';
  showTooltip?: boolean;
}

// 使用组合式函数
const { isDark, toggleThemeMode } = useThemeToggle();

// 组件属性
const props = withDefaults(defineProps<Props>(), {
  size: 'default',
  type: 'default',
  showTooltip: true,
});

// 计算属性
const iconComponent = computed(() => {
  if (isDark.value) {
    return Moon;
  }
  return Sunny;
});

const tooltipContent = computed(() => {
  return isDark.value ? '切换到浅色主题' : '切换到深色主题';
});
</script>

<style scoped>
.theme-toggle {
  display: inline-block;
}
</style>