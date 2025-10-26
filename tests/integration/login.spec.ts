import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import { nextTick } from 'vue'
import LoginSimple from '@/views/login-simple.vue'
import LoginForm from '@/components/AccountForm/LoginForm.vue'
import { useAuthStore } from '@/domains/auth/stores/authStore'
import { tokenService } from '@/domains/shared/services/TokenService'

// Mock auth service
vi.mock('@/domains/auth/services/authService', () => ({
  authService: {
    login: vi.fn(),
    logout: vi.fn(),
    refreshToken: vi.fn(),
    getPermissions: vi.fn(),
    changePassword: vi.fn(),
  },
}))

// Import the mocked service
import { authService } from '@/domains/auth/services/authService'
const mockAuthService = vi.mocked(authService)

// Mock settings store
vi.mock('@/store/modules/settings', () => ({
  useSettingsStore: () => ({
    settings: {
      app: {
        colorScheme: 'light',
        theme: {
          mode: 'light',
          color: 'blue'
        },
        enablePermission: false
      }
    },
    updateSettings: vi.fn(),
    setTitle: vi.fn(),
    setIsReloading: vi.fn()
  })
}))

// Mock user store
vi.mock('@/store/modules/user', () => ({
  useUserStore: () => ({
    permissions: [],
    isLogin: false,
    account: '',
    token: '',
    avatar: '',
    login: vi.fn(),
    logout: vi.fn()
  })
}))

// Mock useAuth
vi.mock('@/utils/composables/useAuth', () => ({
  default: () => ({
    auth: vi.fn(() => true),
    authAll: vi.fn(() => true)
  })
}))

// Mock router
const mockPush = vi.fn()
const mockRoute = {
  path: '/login',
  query: { redirect: '/dashboard' },
}
const mockRouter = {
  push: mockPush,
  replace: vi.fn(),
  go: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  currentRoute: { value: { path: '/login', query: { redirect: '/dashboard' } } }
}

// Mock Vue Router
vi.mock('vue-router', () => ({
  createRouter: vi.fn(() => mockRouter),
  createWebHistory: vi.fn(),
  useRouter: () => mockRouter,
  useRoute: () => mockRoute,
}))

describe('登录流程集成测试', () => {
  let wrapper: any
  let authStore: any

  beforeEach(async () => {
    // 创建新的 Pinia 实例
    const pinia = createPinia()
    setActivePinia(pinia)
    
    // 获取 authStore 实例
    authStore = useAuthStore()
    
    // 清除 token
    tokenService.clearToken()
    
    // 清除所有 mock
    vi.clearAllMocks()
    
    // 设置默认的登录成功响应
    mockAuthService.login.mockResolvedValue({
      user: {
        id: '1',
        account: 'testuser',
        avatar: 'test-avatar.png',
        permissions: ['user:read', 'user:write'],
        roles: ['user'],
      },
      token: 'test-token',
      refreshToken: 'test-refresh-token',
      expiresIn: 3600,
    })
    
    // 挂载组件
    wrapper = mount(LoginSimple, {
      global: {
        plugins: [pinia, mockRouter],
        mocks: {
          $route: mockRoute,
        },
        stubs: {
          'route': true,
          'ColorScheme': true,
        },
      },
    })
    
    await nextTick()
  })

  afterEach(() => {
    wrapper?.unmount()
    tokenService.clearToken()
  })

  it('应该正确渲染登录页面', () => {
    expect(wrapper.find('.login-box').exists()).toBe(true)
    expect(wrapper.find('.login-banner').exists()).toBe(true)
    expect(wrapper.find('.login-form').exists()).toBe(true)
    expect(wrapper.findComponent(LoginForm).exists()).toBe(true)
  })

  it('应该能够切换表单类型', async () => {
    // 默认应该是登录表单
    expect(wrapper.findComponent(LoginForm).exists()).toBe(true)
    
    // 切换到注册表单
    wrapper.vm.formType.value = 'register'
    await nextTick()
    
    // 应该显示注册表单
    expect(wrapper.findComponent({ name: 'RegisterForm' }).exists()).toBe(true)
    
    // 切换到重置密码表单
    wrapper.vm.formType.value = 'resetPassword'
    await nextTick()
    
    // 应该显示重置密码表单
    expect(wrapper.findComponent({ name: 'ResetPasswordForm' }).exists()).toBe(true)
  })

  it('应该能够成功登录', async () => {
    const loginForm = wrapper.findComponent(LoginForm)
    
    // 触发登录事件
    await loginForm.vm.$emit('on-login', 'testuser')
    
    // 验证 authService.login 被调用
    expect(mockAuthService.login).toHaveBeenCalled()
    
    // 验证 token 被保存
    expect(tokenService.getAccessToken()).toBe('test-token')
    expect(tokenService.getRefreshToken()).toBe('test-refresh-token')
    
    // 验证 authStore 状态被更新
    expect(authStore.isAuthenticated).toBe(true)
    expect(authStore.user?.account).toBe('testuser')
  })

  it('登录失败应该显示错误信息', async () => {
    // 设置登录失败
    const errorMessage = '用户名或密码错误'
    mockAuthService.login.mockRejectedValue(new Error(errorMessage))
    
    const loginForm = wrapper.findComponent(LoginForm)
    
    // 尝试触发登录事件
    try {
      await loginForm.vm.$emit('on-login', 'testuser')
    } catch (error) {
      // 预期会抛出错误
    }
    
    // 验证 authStore 状态未被更新
    expect(authStore.isAuthenticated).toBe(false)
    expect(authStore.user).toBeNull()
  })

  it('登录成功后应该跳转到重定向页面', async () => {
    const loginForm = wrapper.findComponent(LoginForm)
    
    // 触发登录事件
    await loginForm.vm.$emit('on-login', 'testuser')
    
    // 验证路由跳转
    expect(mockRouter.currentRoute.value.path).toBe('/dashboard')
  })

  it('没有重定向路径时应该跳转到首页', async () => {
    // 修改 mock route，移除 redirect
    mockRoute.query = {}
    
    // 重新挂载组件
    wrapper = mount(LoginTest, {
      global: {
        plugins: [createPinia(), mockRouter],
        mocks: {
          $route: mockRoute,
        },
        stubs: {
          'route': true,
          'ColorScheme': true,
        },
      },
    })
    
    await nextTick()
    
    const loginForm = wrapper.findComponent(LoginForm)
    
    // 触发登录事件
    await loginForm.vm.$emit('on-login', 'testuser')
    
    // 验证路由跳转到首页
    expect(mockRouter.currentRoute.value.path).toBe('/')
  })

  it('应该能够从表单切换到注册表单', async () => {
    const loginForm = wrapper.findComponent(LoginForm)
    
    // 触发切换到注册表单事件
    await loginForm.vm.$emit('on-register', 'testuser')
    
    // 验证表单类型已切换
    expect(wrapper.vm.formType.value).toBe('register')
    expect(wrapper.vm.account.value).toBe('testuser')
  })

  it('应该能够从表单切换到重置密码表单', async () => {
    const loginForm = wrapper.findComponent(LoginForm)
    
    // 触发切换到重置密码表单事件
    await loginForm.vm.$emit('on-reset-password', 'testuser')
    
    // 验证表单类型已切换
    expect(wrapper.vm.formType.value).toBe('resetPassword')
    expect(wrapper.vm.account.value).toBe('testuser')
  })
})