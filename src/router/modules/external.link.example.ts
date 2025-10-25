import type { RouteRecordRaw } from 'vue-router'

function Layout() {
  return import('@/layouts/index.vue')
}

const routes: RouteRecordRaw = {
  path: '/link',
  component: Layout,
  name: 'externalLinkExample',
  meta: {
    title: '外链',
    icon: 'i-ri:external-link-fill',
  },
  children: [
    {
      path: 'gitee',
      redirect: '',
      name: 'linkExampleWindowGitee',
      meta: {
        title: 'Gitee 仓库',
        link: 'https://gitee.com/super-admin/basic',
      },
    },
    {
      path: 'github',
      redirect: '',
      name: 'linkExampleWindowGithub',
      meta: {
        title: 'Github 仓库',
        link: 'https://github.com/super-admin/basic',
      },
    },
  ],
}

export default routes
