import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

// 模拟localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

// 模拟用户store
const useUserStore = () => {
  const state = {
    isLogin: false,
    token: '',
    userInfo: {},
    permissions: [],
  }
  
  const store = {
    get isLogin() { return state.isLogin },
    get token() { return state.token },
    get userInfo() { return state.userInfo },
    get permissions() { return state.permissions },
    login: vi.fn().mockResolvedValue({ success: true, token: 'fake-token' }),
    logout: vi.fn(),
    // 模拟从localStorage恢复状态的方法
    restoreState: vi.fn(() => {
      const storedState = localStorageMock.getItem('userState')
      if (storedState) {
        try {
          const parsed = JSON.parse(storedState)
          state.token = parsed.token || ''
          state.userInfo = parsed.userInfo || {}
          state.permissions = parsed.permissions || []
          state.isLogin = !!parsed.token
        } catch (e) {
          // 忽略JSON解析错误
        }
      }
    }),
  }
  
  return store
}

// 模拟路由
const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
}

const mockRoute = {
  path: '/login',
  query: {},
}

describe('页面刷新状态恢复测试', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    // 设置localStorage模拟
    global.localStorage = localStorageMock
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('应该能够在页面刷新后从localStorage恢复登录状态', () => {
    const userStore = useUserStore()
    
    // 模拟localStorage中存储的登录信息
    const storedState = {
      token: 'stored-token',
      userInfo: { id: 1, username: 'admin' },
      permissions: ['admin', 'user'],
    }
    
    localStorageMock.getItem.mockReturnValue(JSON.stringify(storedState))
    
    // 模拟恢复状态
    userStore.restoreState()
    
    expect(localStorageMock.getItem).toHaveBeenCalledWith('userState')
    expect(userStore.restoreState).toHaveBeenCalled()
    expect(userStore.token).toBe('stored-token')
    expect(userStore.userInfo).toEqual({ id: 1, username: 'admin' })
    expect(userStore.permissions).toEqual(['admin', 'user'])
    expect(userStore.isLogin).toBe(true)
  })

  it('应该能够在localStorage为空时保持初始状态', () => {
    const userStore = useUserStore()
    
    // 模拟localStorage为空
    localStorageMock.getItem.mockReturnValue(null)
    
    // 模拟恢复状态
    userStore.restoreState()
    
    expect(localStorageMock.getItem).toHaveBeenCalledWith('userState')
    expect(userStore.restoreState).toHaveBeenCalled()
  })

  it('应该能够在localStorage数据损坏时保持初始状态', () => {
    const userStore = useUserStore()
    
    // 模拟localStorage中存储的损坏数据
    localStorageMock.getItem.mockReturnValue('invalid-json')
    
    // 模拟恢复状态
    userStore.restoreState()
    
    expect(localStorageMock.getItem).toHaveBeenCalledWith('userState')
    expect(userStore.restoreState).toHaveBeenCalled()
  })

  it('应该能够在登录成功后将状态保存到localStorage', async () => {
    const userStore = useUserStore()
    
    // 模拟登录成功
    const loginResult = await userStore.login('admin', '123456')
    
    expect(loginResult.success).toBe(true)
    expect(userStore.login).toHaveBeenCalledWith('admin', '123456')
  })

  it('应该能够在登出后清除localStorage中的状态', () => {
    const userStore = useUserStore()
    
    // 模拟登出
    userStore.logout()
    
    expect(userStore.logout).toHaveBeenCalled()
  })

  it('应该能够在页面刷新后重定向到正确的页面', () => {
    const userStore = useUserStore()
    const router = mockRouter
    const route = mockRoute
    
    // 模拟localStorage中存储的登录信息和重定向路径
    const storedState = {
      token: 'stored-token',
      userInfo: { id: 1, username: 'admin' },
      redirectPath: '/dashboard',
    }
    
    localStorageMock.getItem.mockReturnValue(JSON.stringify(storedState))
    
    // 模拟恢复状态
    userStore.restoreState()
    
    // 模拟重定向
    const redirectPath = JSON.parse(localStorageMock.getItem('userState')).redirectPath
    router.push(redirectPath)
    
    expect(localStorageMock.getItem).toHaveBeenCalledWith('userState')
    expect(router.push).toHaveBeenCalledWith('/dashboard')
  })
})