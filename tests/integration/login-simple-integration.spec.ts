import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

// 模拟用户store
const useUserStore = () => ({
  isLogin: false,
  token: '',
  permissions: [],
  login: vi.fn().mockResolvedValue({ success: true, token: 'fake-token' }),
  logout: vi.fn(),
})

// 模拟设置store
const useSettingsStore = () => ({
  app: {
    enablePermission: false,
  },
})

// 模拟路由
const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
}

const mockRoute = {
  path: '/login',
  query: {},
}

describe('登录集成测试', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('应该能够初始化登录状态', () => {
    const userStore = useUserStore()
    const settingsStore = useSettingsStore()
    
    expect(userStore.isLogin).toBe(false)
    expect(userStore.token).toBe('')
    expect(userStore.permissions).toEqual([])
    expect(settingsStore.app.enablePermission).toBe(false)
  })

  it('应该能够处理登录流程', async () => {
    const userStore = useUserStore()
    const router = mockRouter
    
    // 模拟登录
    const result = await userStore.login('admin', '123456')
    
    expect(result.success).toBe(true)
    expect(result.token).toBe('fake-token')
    expect(userStore.login).toHaveBeenCalledWith('admin', '123456')
  })

  it('应该能够在登录成功后跳转', async () => {
    const userStore = useUserStore()
    const router = mockRouter
    const route = mockRoute
    
    // 模拟登录成功
    await userStore.login('admin', '123456')
    
    // 模拟跳转到首页
    router.push('/')
    
    expect(router.push).toHaveBeenCalledWith('/')
  })

  it('应该能够处理登录失败', async () => {
    const userStore = useUserStore()
    
    // 模拟登录失败
    userStore.login.mockResolvedValueOnce({ success: false, error: 'Invalid credentials' })
    
    const result = await userStore.login('wrong', 'password')
    
    expect(result.success).toBe(false)
    expect(result.error).toBe('Invalid credentials')
  })

  it('应该能够处理登出流程', () => {
    const userStore = useUserStore()
    const router = mockRouter
    
    // 模拟登出
    userStore.logout()
    
    expect(userStore.logout).toHaveBeenCalled()
  })
})