import { Layout } from '../utils/layout'
import type { RouteRecordRaw } from 'vue-router'


const routes: RouteRecordRaw = {
  path: '/permission_example',
  component: Layout,
  name: 'permissionExample',
  meta: {
    title: '权限验证',
    icon: 'i-ri:shield-keyhole-line',
  },
  children: [
    {
      path: '',
      name: 'permissionExampleIndex',
      component: () => import('@/views/permission_example/index.vue'),
      meta: {
        title: '权限验证',
        menu: false,
        breadcrumb: false,
        activeMenu: '/permission_example',
      },
    },
    {
      path: 'test',
      name: 'permissionExampleTest',
      component: () => import('@/views/permission_example/test.vue'),
      meta: {
        title: '测试页面',
        auth: ['permission.browse'],
        menu: false,
        breadcrumb: false,
        activeMenu: '/permission_example',
      },
    },
  ],
}

export default routes
