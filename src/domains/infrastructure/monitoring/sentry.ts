import * as Sentry from '@sentry/vue'
import type { Router } from 'vue-router'
import type { App } from 'vue'

export interface SentryConfig {
  dsn: string
  environment: string
  release?: string
  tracesSampleRate?: number
  replaysSessionSampleRate?: number
  replaysOnErrorSampleRate?: number
  enabled?: boolean
}

/**
 * 初始化 Sentry 错误监控
 */
export function initSentry(
  app: App,
  router: Router,
  config: SentryConfig,
) {
  if (!config.enabled || !config.dsn) {
    console.warn('Sentry is disabled or DSN is not provided')
    return
  }

  Sentry.init({
    app,
    dsn: config.dsn,
    environment: config.environment,
    release: config.release || `fantastic-admin@${import.meta.env.VITE_APP_VERSION}`,
    
    // 性能监控
    integrations: [
      Sentry.browserTracingIntegration({ router }),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    
    // 采样率配置
    tracesSampleRate: config.tracesSampleRate ?? 1.0,
    replaysSessionSampleRate: config.replaysSessionSampleRate ?? 0.1,
    replaysOnErrorSampleRate: config.replaysOnErrorSampleRate ?? 1.0,
    
    // 错误过滤
    beforeSend(event, hint) {
      // 过滤开发环境错误
      if (config.environment === 'development') {
        console.error('Sentry Error:', hint.originalException || hint.syntheticException)
        return null
      }
      
      // 过滤特定错误
      const error = hint.originalException
      if (error && typeof error === 'object' && 'message' in error) {
        const message = String(error.message)
        
        // 过滤网络错误
        if (message.includes('Network Error') || message.includes('timeout')) {
          return null
        }
        
        // 过滤取消的请求
        if (message.includes('Cancel') || message.includes('abort')) {
          return null
        }
      }
      
      return event
    },
    
    // 面包屑配置
    beforeBreadcrumb(breadcrumb) {
      // 过滤敏感信息
      if (breadcrumb.category === 'console') {
        return null
      }
      
      if (breadcrumb.category === 'xhr' || breadcrumb.category === 'fetch') {
        // 移除敏感请求头
        if (breadcrumb.data) {
          delete breadcrumb.data.authorization
          delete breadcrumb.data.cookie
        }
      }
      
      return breadcrumb
    },
  })

  // 设置用户上下文
  const setUser = (user: { id: string; email?: string; username?: string }) => {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.username,
    })
  }

  // 清除用户上下文
  const clearUser = () => {
    Sentry.setUser(null)
  }

  // 添加自定义标签
  const setTag = (key: string, value: string) => {
    Sentry.setTag(key, value)
  }

  // 添加自定义上下文
  const setContext = (name: string, context: Record<string, any>) => {
    Sentry.setContext(name, context)
  }

  // 手动捕获异常
  const captureException = (error: Error, context?: Record<string, any>) => {
    Sentry.captureException(error, {
      contexts: context ? { custom: context } : undefined,
    })
  }

  // 手动捕获消息
  const captureMessage = (message: string, level: Sentry.SeverityLevel = 'info') => {
    Sentry.captureMessage(message, level)
  }

  // 添加面包屑
  const addBreadcrumb = (breadcrumb: Sentry.Breadcrumb) => {
    Sentry.addBreadcrumb(breadcrumb)
  }

  return {
    setUser,
    clearUser,
    setTag,
    setContext,
    captureException,
    captureMessage,
    addBreadcrumb,
  }
}

/**
 * 性能监控辅助函数
 */
export function startTransaction(name: string, op: string) {
  return Sentry.startTransaction({
    name,
    op,
  })
}

/**
 * 为 Promise 添加性能追踪
 */
export function traceAsyncOperation<T>(
  name: string,
  operation: () => Promise<T>,
): Promise<T> {
  const transaction = startTransaction(name, 'async.operation')
  
  return operation()
    .then((result) => {
      transaction.setStatus('ok')
      return result
    })
    .catch((error) => {
      transaction.setStatus('internal_error')
      throw error
    })
    .finally(() => {
      transaction.finish()
    })
}