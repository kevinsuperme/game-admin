/**
 * 路由布局辅助函数
 * 用于动态导入主布局组件
 */
export function Layout() {
  return import('@/layouts/index.vue')
}
