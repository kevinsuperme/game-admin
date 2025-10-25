// 主题设置页面
<template>
  <div class="theme-settings-page">
    <ResponsiveContainer
      breakpoint="all"
      direction="column"
      spacing="large"
      padding="large"
    >
      <div class="page-header">
        <h1 class="page-title">主题设置</h1>
        <p class="page-description">自定义应用的外观和感觉，包括颜色主题、字体大小、布局选项等</p>
      </div>

      <div class="settings-content">
        <ResponsiveContainer
          breakpoint="desktop"
          direction="row"
          spacing="medium"
          align="stretch"
        >
          <!-- 左侧设置面板 -->
          <div class="settings-panel">
            <ThemeSettings />
          </div>

          <!-- 右侧预览面板 -->
          <div class="preview-panel">
            <div class="preview-header">
              <h3>预览</h3>
              <ThemeToggle />
            </div>
            <div class="preview-content">
              <div class="preview-card">
                <h4>卡片示例</h4>
                <p>这是一个示例卡片，用于预览主题效果。</p>
                <div class="preview-buttons">
                  <el-button type="primary">主要按钮</el-button>
                  <el-button>默认按钮</el-button>
                  <el-button type="success">成功按钮</el-button>
                </div>
              </div>
              <div class="preview-form">
                <h4>表单示例</h4>
                <el-form :model="form" label-width="80px">
                  <el-form-item label="输入框">
                    <el-input v-model="form.input" placeholder="请输入内容" />
                  </el-form-item>
                  <el-form-item label="选择器">
                    <el-select v-model="form.select" placeholder="请选择">
                      <el-option label="选项1" value="1" />
                      <el-option label="选项2" value="2" />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="开关">
                    <el-switch v-model="form.switch" />
                  </el-form-item>
                </el-form>
              </div>
            </div>
          </div>
        </ResponsiveContainer>

        <!-- 移动端预览 -->
        <ResponsiveContainer
          breakpoint="mobile"
          direction="column"
          spacing="medium"
        >
          <div class="mobile-preview">
            <div class="mobile-preview-header">
              <h3>移动端预览</h3>
              <ThemeToggle size="small" />
            </div>
            <div class="mobile-preview-content">
              <div class="mobile-preview-card">
                <h4>移动端卡片</h4>
                <p>这是移动端卡片预览。</p>
                <div class="mobile-preview-buttons">
                  <el-button size="small" type="primary">按钮</el-button>
                  <el-button size="small">按钮</el-button>
                </div>
              </div>
            </div>
          </div>
        </ResponsiveContainer>
      </div>
    </ResponsiveContainer>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import ThemeSettings from '@/domains/infrastructure/components/ThemeSettings.vue';
import ThemeToggle from '@/domains/infrastructure/components/ThemeToggle.vue';
import ResponsiveContainer from '@/domains/infrastructure/components/ResponsiveContainer.vue';

// 页面元数据
defineOptions({
  name: 'ThemeSettingsPage',
});

// 表单数据
const form = reactive({
  input: '',
  select: '',
  switch: false,
});
</script>

<style scoped>
.theme-settings-page {
  min-height: 100vh;
  padding: 20px;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--g-color-text-primary);
}

.page-description {
  font-size: 16px;
  color: var(--g-color-text-secondary);
  margin: 0;
}

.settings-content {
  width: 100%;
}

.settings-panel {
  flex: 1;
  min-width: 300px;
}

.preview-panel {
  flex: 1;
  min-width: 300px;
  background-color: var(--g-color-bg-secondary);
  border-radius: 8px;
  padding: 16px;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--g-color-border);
}

.preview-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--g-color-text-primary);
}

.preview-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.preview-card,
.preview-form {
  background-color: var(--g-color-bg-primary);
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.preview-card h4,
.preview-form h4 {
  margin-top: 0;
  margin-bottom: 12px;
  font-size: 16px;
  font-weight: 600;
  color: var(--g-color-text-primary);
}

.preview-card p {
  margin-bottom: 16px;
  color: var(--g-color-text-secondary);
}

.preview-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.mobile-preview {
  background-color: var(--g-color-bg-secondary);
  border-radius: 8px;
  padding: 16px;
}

.mobile-preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--g-color-border);
}

.mobile-preview-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--g-color-text-primary);
}

.mobile-preview-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.mobile-preview-card {
  background-color: var(--g-color-bg-primary);
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.mobile-preview-card h4 {
  margin-top: 0;
  margin-bottom: 12px;
  font-size: 16px;
  font-weight: 600;
  color: var(--g-color-text-primary);
}

.mobile-preview-card p {
  margin-bottom: 16px;
  color: var(--g-color-text-secondary);
}

.mobile-preview-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* 响应式调整 */
@media (max-width: 767px) {
  .theme-settings-page {
    padding: 12px;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .page-description {
    font-size: 14px;
  }
}
</style>