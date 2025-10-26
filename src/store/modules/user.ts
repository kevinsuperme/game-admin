import apiUser from '@/api/modules/user'
import router from '@/router'
import { tokenService } from '@/domains/shared/services/TokenService'

export const useUserStore = defineStore(
  // 唯一ID
  'user',
  () => {
    const settingsStore = useSettingsStore()
    const routeStore = useRouteStore()
    const menuStore = useMenuStore()
    const tabbarStore = useTabbarStore()

    const account = ref(localStorage.account ?? '')
    const token = ref(tokenService.getAccessToken() ?? '')
    const avatar = ref(localStorage.avatar ?? '')
    const permissions = ref<string[]>([])
    const isLogin = computed(() => {
      return tokenService.hasValidToken()
    })

    // 登录
    async function login(data: {
      account: string
      password: string
    }) {
      const res = await apiUser.login(data)
      
      // 使用TokenService管理Token
      tokenService.setToken({
        token: res.data.token,
        refreshToken: res.data.refreshToken,
        expiresAt: res.data.expiresAt ? new Date(res.data.expiresAt).getTime() : undefined,
      })
      
      // 持久化用户信息
      localStorage.setItem('account', res.data.account)
      localStorage.setItem('avatar', res.data.avatar)
      
      account.value = res.data.account
      token.value = res.data.token
      avatar.value = res.data.avatar
    }

    // 手动登出
    function logout(redirect = router.currentRoute.value.fullPath) {
      // 使用TokenService清除Token
      tokenService.clearToken()
      token.value = ''
      
      router.push({
        name: 'login',
        query: {
          ...(redirect !== settingsStore.settings.home.fullPath && router.currentRoute.value.name !== 'login' && { redirect }),
        },
      }).then(logoutCleanStatus)
    }
    
    // 请求登出
    function requestLogout() {
      // 使用TokenService清除Token
      tokenService.clearToken()
      token.value = ''
      
      router.push({
        name: 'login',
        query: {
          ...(
            router.currentRoute.value.fullPath !== settingsStore.settings.home.fullPath
            && router.currentRoute.value.name !== 'login'
            && {
              redirect: router.currentRoute.value.fullPath,
            }
          ),
        },
      }).then(logoutCleanStatus)
    }
    // 登出后清除状态
    function logoutCleanStatus() {
      localStorage.removeItem('account')
      localStorage.removeItem('avatar')
      account.value = ''
      avatar.value = ''
      permissions.value = []
      settingsStore.updateSettings({}, true)
      tabbarStore.clean()
      routeStore.removeRoutes()
      menuStore.setActived(0)
    }

    // 获取权限
    async function getPermissions() {
      const res = await apiUser.permission()
      permissions.value = res.data.permissions
    }
    // 修改密码
    async function editPassword(data: {
      password: string
      newPassword: string
    }) {
      await apiUser.passwordEdit(data)
    }

    return {
      account,
      token,
      avatar,
      permissions,
      isLogin,
      login,
      logout,
      requestLogout,
      getPermissions,
      editPassword,
    }
  },
)
