# 主题功能开发文档

## 概述

本文档描述了在Fantastic-admin项目中实现的主题功能，包括主题切换、颜色方案选择、响应式布局和主题设置页面等功能。

## 功能特性

### 1. 主题切换

- 支持浅色和深色主题切换
- 自动检测系统主题偏好
- 主题状态持久化存储
- 全局主题状态同步

### 2. 颜色方案

- 提供多种预设颜色方案
- 支持自定义颜色方案
- 颜色方案状态持久化存储
- 全局颜色方案状态同步

### 3. 响应式布局

- 支持多种断点适配（桌面、平板、手机）
- 灵活的布局方向和间距控制
- 响应式组件封装
- 移动端优化

### 4. 主题设置页面

- 完整的主题设置界面
- 实时预览主题效果
- 布局选项配置
- 移动端适配

## 文件结构

```
src/
├── domains/
│   └── infrastructure/
│       ├── components/
│       │   ├── ThemeToggle.vue          # 主题切换按钮组件
│       │   ├── ThemeSettings.vue        # 主题设置组件
│       │   ├── ResponsiveContainer.vue   # 响应式布局容器组件
│       │   └── __tests__/               # 组件测试文件
│       │       ├── ThemeToggle.test.ts
│       │       ├── ThemeSettings.test.ts
│       │       └── ResponsiveContainer.test.ts
│       ├── composables/
│       │   └── useTheme.ts              # 主题组合式函数
│       ├── services/
│       │   ├── themeService.ts          # 主题服务
│       │   └── __tests__/
│       │           └── themeService.test.ts
│       ├── styles/
│       │   └── theme.css                # 主题样式
│       └── __tests__/
│           └── theme.integration.test.ts # 主题功能集成测试
├── layouts/
│   ├── components/
│   │   ├── Header/
│   │   │   └── index.vue               # 头部组件（已集成主题切换按钮）
│   │   └── Topbar/
│   │       └── Toolbar/
│   │           └── rightSide.vue       # 工具栏右侧组件（已集成主题切换按钮）
├── router/
│   ├── modules/
│   │   └── theme_settings.example.ts    # 主题设置路由模块
│   └── routes.ts                       # 路由配置（已添加主题设置路由）
├── views/
│   └── theme_settings.vue              # 主题设置页面
├── App.vue                             # 根组件（已集成主题服务）
└── main.ts                             # 应用入口（已引入主题服务和样式）
```

## 使用方法

### 1. 主题切换按钮

在组件中使用主题切换按钮：

```vue
<template>
  <div>
    <ThemeToggle />
  </div>
</template>

<script setup>
import ThemeToggle from '@/domains/infrastructure/components/ThemeToggle.vue';
</script>
```

### 2. 主题设置组件

在页面中使用主题设置组件：

```vue
<template>
  <div>
    <ThemeSettings />
  </div>
</template>

<script setup>
import ThemeSettings from '@/domains/infrastructure/components/ThemeSettings.vue';
</script>
```

### 3. 响应式布局容器

使用响应式布局容器：

```vue
<template>
  <ResponsiveContainer
    breakpoint="desktop"
    direction="row"
    spacing="medium"
    padding="large"
    align="center"
  >
    <div>内容1</div>
    <div>内容2</div>
  </ResponsiveContainer>
</template>

<script setup>
import ResponsiveContainer from '@/domains/infrastructure/components/ResponsiveContainer.vue';
</script>
```

### 4. 主题组合式函数

在组件中使用主题组合式函数：

```vue
<script setup>
import { useTheme } from '@/domains/infrastructure/composables/useTheme';

const { theme, colorScheme, setTheme, setColorScheme, toggleTheme } = useTheme();

// 设置主题
setTheme('dark');

// 设置颜色方案
setColorScheme('blue');

// 切换主题
toggleTheme();
</script>
```

### 5. 主题服务

直接使用主题服务：

```typescript
import ThemeService from '@/domains/infrastructure/services/themeService';

const themeService = new ThemeService();
themeService.init();

// 设置主题
themeService.setTheme('dark');

// 设置颜色方案
themeService.setColorScheme('blue');

// 切换主题
themeService.toggleTheme();

// 获取当前主题
const currentTheme = themeService.getTheme();

// 获取当前颜色方案
const currentColorScheme = themeService.getColorScheme();

// 获取可用颜色方案
const availableSchemes = themeService.getAvailableColorSchemes();

// 添加主题变更监听器
themeService.addThemeChangeListener((event) => {
  console.log('主题已变更:', event.detail.theme);
});

// 移除主题变更监听器
themeService.removeThemeChangeListener(listener);
```

## 自定义主题

### 1. 添加新的颜色方案

在 `theme.css` 中添加新的颜色方案：

```css
:root {
  --color-scheme-purple-primary: #6366f1;
  --color-scheme-purple-secondary: #8b5cf6;
  --color-scheme-purple-accent: #a78bfa;
  /* 其他紫色主题颜色变量 */
}

.color-scheme-purple {
  --g-color-primary: var(--color-scheme-purple-primary);
  --g-color-secondary: var(--color-scheme-purple-secondary);
  --g-color-accent: var(--color-scheme-purple-accent);
  /* 其他紫色主题颜色映射 */
}
```

在 `themeService.ts` 中添加新的颜色方案：

```typescript
getAvailableColorSchemes() {
  return [
    { name: '默认', value: 'default' },
    { name: '蓝色', value: 'blue' },
    { name: '绿色', value: 'green' },
    { name: '紫色', value: 'purple' }, // 新增紫色主题
  ];
}
```

### 2. 自定义主题变量

在 `theme.css` 中自定义主题变量：

```css
:root {
  /* 自定义颜色变量 */
  --g-color-custom: #your-color-value;
  
  /* 自定义间距变量 */
  --g-spacing-custom: 12px;
  
  /* 自定义字体变量 */
  --g-font-size-custom: 18px;
}
```

### 3. 添加新的断点

在 `ResponsiveContainer.vue` 中添加新的断点：

```typescript
breakpoints: {
  mobile: '(max-width: 767px)',
  tablet: '(min-width: 768px) and (max-width: 1023px)',
  desktop: '(min-width: 1024px)',
  wide: '(min-width: 1440px)', // 新增宽屏断点
}
```

## 测试

### 运行测试

```bash
# 运行所有主题相关测试
npm run test -- --run src/domains/infrastructure/__tests__

# 运行特定测试文件
npm run test -- --run src/domains/infrastructure/services/__tests__/themeService.test.ts

# 运行测试并生成覆盖率报告
npm run test:coverage -- src/domains/infrastructure
```

### 测试覆盖范围

- 主题服务功能测试
- 主题切换组件测试
- 主题设置组件测试
- 响应式布局容器测试
- 主题功能集成测试

## 注意事项

1. 主题变更会触发全局事件，可以在任何组件中监听这些事件
2. 主题状态会自动持久化到 localStorage
3. 响应式布局容器会根据窗口大小自动显示/隐藏
4. 主题设置页面提供了完整的主题配置界面
5. 所有主题相关的样式都使用 CSS 变量，便于自定义和扩展

## 未来扩展

1. 添加更多预设颜色方案
2. 支持自定义颜色选择器
3. 添加主题动画过渡效果
4. 支持主题导入/导出功能
5. 添加主题市场功能