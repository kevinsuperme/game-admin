import { Layout } from '../utils/layout'
// 主题设置模块路由
import type { RouteRecordRaw } from 'vue-router'

const ThemeSettingsExample: RouteRecordRaw = {
  path: '/theme-settings',
  name: 'themeSettings',
  component: () => import('@/views/theme_settings.vue'),
  meta: {
    title: '主题设置',
    icon: 'i-carbon:palette',
  },
}

export default ThemeSettingsExample