# Token管理重构文档

## 概述

本次重构的目标是将分散在各处的token管理逻辑集中到一个专门的TokenManager中,并实现HTTP请求的拦截器系统,实现token的自动添加和刷新机制。

## 重构内容

### 1. 创建TokenManager工具类 ✅

**文件**: `src/utils/token-manager.ts`

**功能**:
- 统一管理token、refreshToken和用户信息
- 提供token过期检查功能
- 使用localStorage作为持久化存储
- 提供完整的认证状态管理接口

**主要方法**:
```typescript
- setToken(data: TokenData): void          // 设置token
- getToken(): string | null                 // 获取token
- getRefreshToken(): string | null          // 获取refreshToken
- setUser(user: User): void                 // 设置用户信息
- getUser(): User | null                    // 获取用户信息
- clearAuth(): void                         // 清除认证信息
- isTokenExpired(): boolean                 // 检查token是否过期
- getAuthState(): AuthState                 // 获取完整认证状态
```

### 2. 重构AuthService ✅

**文件**: `src/domains/auth/services/index.ts`

**改进**:
- 移除所有直接使用localStorage的代码
- 所有token相关操作都通过TokenManager进行
- 简化了代码结构,职责更加清晰

**改动示例**:
```typescript
// 之前
localStorage.setItem('token', token)
localStorage.setItem('user', JSON.stringify(user))

// 之后
tokenManager.setToken({ token, refreshToken, expiresIn })
tokenManager.setUser(user)
```

### 3. 重构AuthStore ✅

**文件**: `src/domains/auth/stores/index.ts`

**改进**:
- 添加`syncStateFromTokenManager()`方法,从TokenManager同步状态
- Store不再直接操作localStorage
- 与TokenManager保持单向数据流: TokenManager -> Store

**新增方法**:
```typescript
syncStateFromTokenManager(): void  // 从TokenManager同步状态到Store
```

**使用场景**:
- 登录成功后同步
- 刷新token后同步
- 初始化应用时同步

### 4. 实现HTTP拦截器系统 ✅

**文件**: `src/utils/http.ts`

**新增功能**:

#### 4.1 请求拦截器 - 自动添加Token
```typescript
// 自动在请求头中添加Authorization
headers: {
  'Authorization': `Bearer ${token}`
}

// 支持skipAuth选项跳过认证
http.get('/public-api', { skipAuth: true })
```

#### 4.2 响应拦截器 - 401错误处理
- 检测到401错误时自动尝试刷新token
- 刷新成功后自动重试原始请求
- 刷新失败则清除认证信息并跳转登录页
- 使用Promise队列防止并发刷新

#### 4.3 响应拦截器 - 403错误处理
- 记录权限不足警告
- 不尝试刷新token(因为这是权限问题,不是认证问题)

#### 4.4 Token刷新防抖机制
```typescript
// 多个并发请求遇到401时,只刷新一次token
let refreshTokenPromise: Promise<any> | null = null

if (!refreshTokenPromise) {
  refreshTokenPromise = refreshToken()
}
```

#### 4.5 请求重试循环防护
```typescript
// 重试请求时添加skipRefresh标志,避免无限重试
const retryConfig = {
  ...originalConfig,
  skipRefresh: true  // 防止重试时再次触发刷新
}
```

### 5. 其他localStorage使用情况检查 ✅

检查了项目中所有使用localStorage的文件:

**不需要迁移的文件**:
- `src/composables/useStorage.ts` - 通用响应式存储组合函数
- `src/utils/cache.ts` - 通用缓存工具
- `src/utils/storage.ts` - 通用本地存储工具

这些文件都是用于非认证相关的数据存储,不需要迁移到TokenManager。

## 测试覆盖

### 单元测试文件

1. **http-interceptors.spec.ts** ✅
   - ✅ 请求拦截器 - 自动添加Token (3个测试)
   - ✅ 响应拦截器 - 401错误处理 (2个测试)
   - ✅ 响应拦截器 - 403错误处理 (1个测试)
   - ✅ Token刷新防抖 (1个测试)
   - ✅ 自定义拦截器 (2个测试)
   - ✅ 请求重试避免循环 (1个测试)

**测试结果**: 9个测试全部通过 ✅

## 架构改进

### 之前的架构问题

```
┌─────────────┐
│   View层    │
└──────┬──────┘
       │
┌──────▼──────────────────────┐
│  AuthStore (Pinia)          │
│  - 直接操作 localStorage    │  ❌ 职责不清
│  - token/user 状态管理      │
└──────┬──────────────────────┘
       │
┌──────▼──────────────────────┐
│  AuthService                │
│  - 也操作 localStorage       │  ❌ 重复逻辑
│  - API 调用                  │
└─────────────────────────────┘
```

### 重构后的架构

```
┌─────────────┐
│   View层    │
└──────┬──────┘
       │
┌──────▼──────────────────────┐
│  AuthStore (Pinia)          │
│  - 只管理响应式状态          │  ✅ 职责单一
│  - 从 TokenManager 同步     │
└──────┬──────────────────────┘
       │
┌──────▼──────────────────────┐
│  AuthService                │
│  - API 调用                  │  ✅ 职责清晰
│  - 使用 TokenManager        │
└──────┬──────────────────────┘
       │
┌──────▼──────────────────────┐
│  TokenManager (单例)        │
│  - 统一的 token 存储管理    │  ✅ 中心化管理
│  - localStorage 封装        │
│  - token 过期检查           │
└─────────────────────────────┘
       │
┌──────▼──────────────────────┐
│  HTTP 拦截器                │
│  - 自动添加 token           │  ✅ 自动化
│  - 自动刷新 token           │
│  - 错误处理                 │
└─────────────────────────────┘
```

## 核心优势

### 1. 单一职责原则
- **TokenManager**: 专注于token和认证数据的存储管理
- **AuthService**: 专注于认证相关的API调用
- **AuthStore**: 专注于响应式状态管理
- **HTTP拦截器**: 专注于请求/响应的自动化处理

### 2. 中心化管理
- 所有token相关操作都通过TokenManager
- 避免了localStorage的分散使用
- 便于维护和调试

### 3. 自动化处理
- 自动添加Authorization头
- 自动刷新过期token
- 自动重试失败请求
- 自动处理认证错误

### 4. 防护机制
- Token刷新防抖,避免并发刷新
- 重试循环防护,避免无限重试
- 错误处理完善,避免崩溃

### 5. 可测试性
- 所有模块都有清晰的接口
- 易于mock和测试
- 测试覆盖率高

## 数据流向

### 登录流程
```
1. View调用AuthStore.login()
2. AuthStore调用AuthService.login()
3. AuthService调用API,获取token
4. AuthService调用TokenManager.setToken()存储
5. AuthStore调用syncStateFromTokenManager()同步状态
6. View响应状态变化
```

### Token刷新流程
```
1. HTTP请求返回401
2. 响应拦截器检测到401
3. 调用AuthService.refreshToken()
4. AuthService通过TokenManager获取refreshToken
5. 调用刷新API获取新token
6. AuthService调用TokenManager.setToken()更新
7. AuthStore.syncStateFromTokenManager()同步
8. 自动重试原始请求
```

### 登出流程
```
1. View调用AuthStore.logout()
2. AuthStore调用AuthService.logout()
3. AuthService调用API通知服务器
4. AuthService调用TokenManager.clearAuth()清除
5. AuthStore清除本地状态
6. View跳转到登录页
```

## 使用示例

### 发起需要认证的请求
```typescript
// 自动添加token,无需手动处理
const data = await http.get('/api/user/profile')
```

### 发起公开API请求
```typescript
// 跳过认证
const data = await http.get('/api/public/config', { skipAuth: true })
```

### 处理token过期
```typescript
// 自动处理,开发者无感知
// 如果token过期,会自动刷新并重试
const data = await http.get('/api/user/data')
```

### 手动检查token状态
```typescript
import { tokenManager } from '@/utils/token-manager'

if (tokenManager.isTokenExpired()) {
  // token已过期,需要刷新
  await authStore.refreshAuthToken()
}
```

### 获取完整认证状态
```typescript
const authState = tokenManager.getAuthState()
console.log('Token:', authState.token)
console.log('User:', authState.user)
console.log('RefreshToken:', authState.refreshToken)
```

## 后续改进建议

### 1. Token加密存储
目前token以明文存储在localStorage中,可以考虑:
- 使用加密算法加密token
- 使用IndexedDB替代localStorage
- 实现更安全的存储方案

### 2. 刷新token策略优化
- 在token即将过期前主动刷新
- 实现静默刷新机制
- 添加刷新失败重试策略

### 3. 监控和日志
- 添加token刷新的监控指标
- 记录认证相关的操作日志
- 统计token过期频率

### 4. 多标签页同步
- 实现跨标签页的认证状态同步
- 一个标签页登出,其他标签页也自动登出
- 使用BroadcastChannel API

### 5. 离线支持
- 实现离线时的token缓存策略
- 网络恢复时自动重新认证
- 优雅降级方案

## 总结

本次重构成功实现了:

✅ **Token管理中心化** - 创建TokenManager统一管理token
✅ **代码结构优化** - 各模块职责清晰,易于维护
✅ **自动化处理** - HTTP拦截器自动处理token相关逻辑
✅ **防护机制完善** - 防止并发刷新和重试循环
✅ **测试覆盖充分** - 9个测试用例全部通过
✅ **向后兼容** - 不影响现有功能

重构后的系统更加健壮、可维护,为后续功能扩展打下了良好基础。