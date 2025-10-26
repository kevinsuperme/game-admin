import { Layout } from '../utils/layout'
import type { RouteRecordRaw } from 'vue-router'


const routes: RouteRecordRaw = {
  path: '/jsx_example',
  component: Layout,
  name: 'jsxExample',
  meta: {
    title: 'JSX',
    icon: 'i-file-icons:jsx',
  },
  children: [
    {
      path: '',
      name: 'jsxExampleIndex',
      component: () => import('@/views/jsx_example/index.vue'),
      meta: {
        title: 'JSX',
        menu: false,
        breadcrumb: false,
        activeMenu: '/jsx_example',
      },
    },
  ],
}

export default routes
