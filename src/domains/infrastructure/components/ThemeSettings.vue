// 主题设置组件
<template>
  <div class="theme-settings">
    <el-drawer
      v-model="visible"
      title="主题设置"
      direction="rtl"
      size="320px"
    >
      <div class="theme-settings-content">
        <!-- 主题模式 -->
        <div class="setting-section">
          <h3 class="setting-title">主题模式</h3>
          <div class="setting-options">
            <div
              v-for="mode in themeModes"
              :key="mode.value"
              class="option-item"
              :class="{ active: themeConfig.mode === mode.value }"
              @click="handleSetThemeMode(mode.value)"
            >
              <div class="option-icon">
                <el-icon>
                  <component :is="mode.icon" />
                </el-icon>
              </div>
              <div class="option-label">{{ mode.label }}</div>
            </div>
          </div>
        </div>

        <!-- 颜色方案 -->
        <div class="setting-section">
          <h3 class="setting-title">颜色方案</h3>
          <div class="color-schemes">
            <div
              v-for="scheme in availableColorSchemes"
              :key="scheme.value"
              class="color-scheme-item"
              :class="{ active: themeConfig.colorScheme === scheme.value }"
              @click="handleSetColorScheme(scheme.value)"
            >
              <div
                class="color-preview"
                :style="{ backgroundColor: scheme.primaryColor }"
              ></div>
              <div class="color-label">{{ scheme.label }}</div>
            </div>
          </div>
        </div>

        <!-- 字体大小 -->
        <div class="setting-section">
          <h3 class="setting-title">字体大小</h3>
          <el-radio-group v-model="themeConfig.fontSize" @change="handleSetFontSize">
            <el-radio-button label="small">小</el-radio-button>
            <el-radio-button label="medium">中</el-radio-button>
            <el-radio-button label="large">大</el-radio-button>
          </el-radio-group>
        </div>

        <!-- 圆角 -->
        <div class="setting-section">
          <h3 class="setting-title">圆角大小</h3>
          <el-radio-group v-model="themeConfig.borderRadius" @change="handleSetBorderRadius">
            <el-radio-button label="none">无</el-radio-button>
            <el-radio-button label="small">小</el-radio-button>
            <el-radio-button label="medium">中</el-radio-button>
            <el-radio-button label="large">大</el-radio-button>
          </el-radio-group>
        </div>

        <!-- 布局设置 -->
        <div class="setting-section">
          <h3 class="setting-title">布局设置</h3>
          <div class="setting-options">
            <div class="option-item">
              <span>紧凑模式</span>
              <el-switch
                v-model="themeConfig.compactMode"
                @change="handleSetCompactMode"
              />
            </div>
            <div class="option-item">
              <span>侧边栏折叠</span>
              <el-switch
                v-model="themeConfig.sidebarCollapsed"
                @change="handleSetSidebarCollapsed"
              />
            </div>
          </div>
        </div>

        <!-- 动画设置 -->
        <div class="setting-section">
          <h3 class="setting-title">动画设置</h3>
          <div class="setting-options">
            <div class="option-item">
              <span>启用动画</span>
              <el-switch
                v-model="themeConfig.animationsEnabled"
                @change="handleSetAnimationsEnabled"
              />
            </div>
          </div>
        </div>

        <!-- 可访问性 -->
        <div class="setting-section">
          <h3 class="setting-title">可访问性</h3>
          <div class="setting-options">
            <div class="option-item">
              <span>高对比度</span>
              <el-switch
                v-model="themeConfig.highContrast"
                @change="handleSetHighContrast"
              />
            </div>
            <div class="option-item">
              <span>减少动画</span>
              <el-switch
                v-model="themeConfig.reducedMotion"
                @change="handleSetReducedMotion"
              />
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="setting-actions">
          <el-button @click="handleResetTheme">重置为默认</el-button>
          <el-button type="primary" @click="handleClose">确定</el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { Sunny, Moon, Monitor } from '@element-plus/icons-vue';
import { useTheme } from '../composables/useTheme';
import type { ThemeMode } from '@/domains/shared/types/theme';

// 定义组件属性
interface Props {
  modelValue: boolean;
}

// 定义组件事件
interface Emits {
  (e: 'update:modelValue', value: boolean): void;
}

// 使用组合式函数
const themeResult = useTheme() || {};

// 从themeResult中安全地解构所需属性，提供默认值
const {
  themeConfig = ref({
    mode: 'light',
    colorScheme: 'default',
    primaryColor: '#409EFF',
    fontSize: 'medium',
    borderRadius: 'medium',
    sidebarCollapsed: false,
    compactMode: false,
    animationsEnabled: true,
    highContrast: false,
    reducedMotion: false,
  }),
  systemTheme = ref('light'),
  setThemeMode = () => {},
  setFontSize = () => {},
  setBorderRadius = () => {},
  setCompactMode = () => {},
  setSidebarCollapsed = () => {},
  setAnimationsEnabled = () => {},
  setHighContrast = () => {},
  setReducedMotion = () => {},
  resetTheme = () => {},
} = themeResult;

// 组件属性和事件
const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
});

const emit = defineEmits<Emits>();

// 抽屉可见性
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

// 主题模式选项
const themeModes = [
  { value: 'light' as ThemeMode, label: '浅色', icon: Sunny },
  { value: 'dark' as ThemeMode, label: '深色', icon: Moon },
  { value: 'auto' as ThemeMode, label: '跟随系统', icon: Monitor },
];

// 可用的颜色方案
const availableColorSchemes = [
  { value: 'default', label: '默认', primaryColor: '#409EFF' },
  { value: 'blue', label: '蓝色', primaryColor: '#409EFF' },
  { value: 'green', label: '绿色', primaryColor: '#67C23A' },
  { value: 'purple', label: '紫色', primaryColor: '#9C27B0' },
  { value: 'orange', label: '橙色', primaryColor: '#FF9800' },
  { value: 'red', label: '红色', primaryColor: '#F56C6C' },
];

// 设置主题模式
const handleSetThemeMode = (mode: ThemeMode) => {
  setThemeMode(mode);
};

// 设置颜色方案
const handleSetColorScheme = (scheme: string) => {
  // 颜色方案功能待实现
  ElMessage({
    message: '颜色方案功能即将推出' as any,
    type: 'info' as any,
  });
};

// 设置字体大小
const handleSetFontSize = (size: string | number | boolean | undefined) => {
  if (typeof size === 'string' && ['small', 'medium', 'large'].includes(size)) {
    setFontSize(size as 'small' | 'medium' | 'large');
  }
};

// 设置圆角
const handleSetBorderRadius = (radius: string | number | boolean | undefined) => {
  if (typeof radius === 'string' && ['none', 'small', 'medium', 'large'].includes(radius)) {
    setBorderRadius(radius as 'none' | 'small' | 'medium' | 'large');
  }
};

// 设置紧凑模式
const handleSetCompactMode = (enabled: string | number | boolean) => {
  setCompactMode(Boolean(enabled));
};

// 设置侧边栏折叠
const handleSetSidebarCollapsed = (collapsed: string | number | boolean) => {
  setSidebarCollapsed(Boolean(collapsed));
};

// 设置动画启用
const handleSetAnimationsEnabled = (enabled: string | number | boolean) => {
  setAnimationsEnabled(Boolean(enabled));
};

// 设置高对比度
const handleSetHighContrast = (enabled: string | number | boolean) => {
  setHighContrast(Boolean(enabled));
};

// 设置减少动画
const handleSetReducedMotion = (enabled: string | number | boolean) => {
  setReducedMotion(Boolean(enabled));
};

// 重置主题
const handleResetTheme = () => {
  resetTheme();
  ElMessage({
    message: '主题已重置为默认设置' as any,
    type: 'success' as any,
  });
};

// 关闭抽屉
const handleClose = () => {
  visible.value = false;
};
</script>

<style scoped>
.theme-settings-content {
  padding: 0 16px;
}

.setting-section {
  margin-bottom: 24px;
}

.setting-title {
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.setting-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  cursor: pointer;
  transition: all 0.3s;
}

.option-item:hover {
  color: var(--el-color-primary);
}

.option-item.active {
  color: var(--el-color-primary);
}

.option-icon {
  margin-right: 8px;
}

.option-label {
  flex: 1;
}

.color-schemes {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.color-scheme-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.color-scheme-item:hover {
  background-color: var(--el-fill-color-light);
}

.color-scheme-item.active {
  border-color: var(--el-color-primary);
}

.color-preview {
  width: 24px;
  height: 24px;
  margin-bottom: 4px;
  border-radius: 50%;
}

.color-label {
  font-size: 12px;
  color: var(--el-text-color-regular);
}

.setting-actions {
  display: flex;
  justify-content: space-between;
  padding-top: 16px;
  margin-top: 24px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.setting-actions .el-button {
  flex: 1;
  margin: 0 6px;
}

.setting-actions .el-button:first-child {
  margin-left: 0;
}

.setting-actions .el-button:last-child {
  margin-right: 0;
}
</style>