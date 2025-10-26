/**
 * Token安全管理服务
 * 
 * 核心安全策略:
 * 1. 优先使用内存存储(防止XSS攻击)
 * 2. 提供sessionStorage作为备份(页面刷新恢复)
 * 3. 支持Token自动刷新机制
 * 4. Token过期自动清理
 * 
 * 未来升级路径:
 * - 后端实现httpOnly Cookie后,可完全移除前端Token存储
 */

interface TokenData {
  token: string
  refreshToken?: string
  expiresAt?: number // Unix timestamp
}

class TokenService {
  private static instance: TokenService
  private tokenData: TokenData | null = null
  private refreshTimer: number | null = null
  private readonly STORAGE_KEY = 'auth_session'
  
  // 配置项
  private readonly config = {
    useSessionStorage: true, // 是否使用sessionStorage备份
    autoRefresh: true, // 是否启用自动刷新
    refreshBeforeExpiry: 5 * 60 * 1000, // 提前5分钟刷新
  }

  private constructor() {
    this.loadFromSessionStorage()
    this.setupAutoRefresh()
  }

  public static getInstance(): TokenService {
    if (!TokenService.instance) {
      TokenService.instance = new TokenService()
    }
    return TokenService.instance
  }

  /**
   * 设置Token数据
   */
  public setToken(data: TokenData): void {
    this.tokenData = data
    
    // 备份到sessionStorage(用于页面刷新恢复)
    if (this.config.useSessionStorage) {
      try {
        sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(data))
      } catch (error) {
        console.warn('[TokenService] Failed to backup token to sessionStorage:', error)
      }
    }

    // 设置自动刷新
    this.setupAutoRefresh()
  }

  /**
   * 获取访问Token
   */
  public getAccessToken(): string | null {
    // 检查Token是否过期
    if (this.tokenData && this.isTokenExpired()) {
      console.warn('[TokenService] Token has expired')
      this.clearToken()
      return null
    }
    
    return this.tokenData?.token || null
  }

  /**
   * 获取刷新Token
   */
  public getRefreshToken(): string | null {
    return this.tokenData?.refreshToken || null
  }

  /**
   * 清除Token
   */
  public clearToken(): void {
    this.tokenData = null
    
    // 清除定时器
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
      this.refreshTimer = null
    }

    // 清除sessionStorage
    try {
      sessionStorage.removeItem(this.STORAGE_KEY)
    } catch (error) {
      console.warn('[TokenService] Failed to clear sessionStorage:', error)
    }
  }

  /**
   * 检查是否有有效Token
   */
  public hasValidToken(): boolean {
    return this.getAccessToken() !== null
  }

  /**
   * 获取Token过期时间
   */
  public getExpiresAt(): number | null {
    return this.tokenData?.expiresAt || null
  }

  /**
   * 检查Token是否即将过期
   */
  public isTokenExpiringSoon(): boolean {
    const expiresAt = this.tokenData?.expiresAt
    if (!expiresAt) return false
    
    const now = Date.now()
    return expiresAt - now <= this.config.refreshBeforeExpiry
  }

  /**
   * 从sessionStorage恢复Token(页面刷新时)
   */
  private loadFromSessionStorage(): void {
    if (!this.config.useSessionStorage) return

    try {
      const stored = sessionStorage.getItem(this.STORAGE_KEY)
      if (stored) {
        const data = JSON.parse(stored) as TokenData
        
        // 验证Token是否过期
        if (data.expiresAt && data.expiresAt < Date.now()) {
          console.warn('[TokenService] Stored token has expired, clearing...')
          this.clearToken()
        } else {
          this.tokenData = data
          console.info('[TokenService] Token restored from sessionStorage')
        }
      }
    } catch (error) {
      console.warn('[TokenService] Failed to load token from sessionStorage:', error)
      this.clearToken()
    }
  }

  /**
   * 检查Token是否已过期
   */
  private isTokenExpired(): boolean {
    const expiresAt = this.tokenData?.expiresAt
    if (!expiresAt) return false
    
    return Date.now() >= expiresAt
  }

  /**
   * 设置自动刷新定时器
   */
  private setupAutoRefresh(): void {
    // 清除现有定时器
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
      this.refreshTimer = null
    }

    if (!this.config.autoRefresh || !this.tokenData?.expiresAt) return

    const now = Date.now()
    const expiresAt = this.tokenData.expiresAt
    const refreshAt = expiresAt - this.config.refreshBeforeExpiry

    // 如果已经到了刷新时间,立即触发刷新事件
    if (now >= refreshAt) {
      this.emitRefreshNeeded()
      return
    }

    // 设置定时器
    const delay = refreshAt - now
    this.refreshTimer = window.setTimeout(() => {
      this.emitRefreshNeeded()
    }, delay)

    console.info(`[TokenService] Auto-refresh scheduled in ${Math.round(delay / 1000)}s`)
  }

  /**
   * 触发Token刷新事件
   */
  private emitRefreshNeeded(): void {
    console.info('[TokenService] Token refresh needed')
    
    // 触发自定义事件,通知应用需要刷新Token
    window.dispatchEvent(new CustomEvent('token:refresh-needed', {
      detail: {
        refreshToken: this.tokenData?.refreshToken,
      },
    }))
  }

  /**
   * 更新Token过期时间
   */
  public updateExpiry(expiresAt: number): void {
    if (this.tokenData) {
      this.tokenData.expiresAt = expiresAt
      
      // 更新sessionStorage
      if (this.config.useSessionStorage) {
        try {
          sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.tokenData))
        } catch (error) {
          console.warn('[TokenService] Failed to update sessionStorage:', error)
        }
      }

      // 重新设置自动刷新
      this.setupAutoRefresh()
    }
  }

  /**
   * 调试:获取当前状态
   */
  public getDebugInfo() {
    return {
      hasToken: !!this.tokenData,
      expiresAt: this.tokenData?.expiresAt,
      isExpired: this.isTokenExpired(),
      isExpiringSoon: this.isTokenExpiringSoon(),
      hasRefreshToken: !!this.tokenData?.refreshToken,
      autoRefreshEnabled: this.config.autoRefresh,
    }
  }
}

// 导出单例实例
export const tokenService = TokenService.getInstance()

// 类型导出
export type { TokenData }