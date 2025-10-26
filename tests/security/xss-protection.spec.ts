import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// 模拟DOM环境
const mockDocument = {
  createElement: vi.fn().mockImplementation((tagName) => {
    const element = {
      tagName: tagName.toUpperCase(),
      innerHTML: '',
      textContent: '',
      setAttribute: vi.fn(),
      getAttribute: vi.fn(),
      appendChild: vi.fn(),
      removeChild: vi.fn(),
      querySelector: vi.fn(),
      querySelectorAll: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      style: {},
      classList: {
        add: vi.fn(),
        remove: vi.fn(),
        contains: vi.fn(),
      },
      dataset: {},
      id: '',
      className: '',
      value: '',
      checked: false,
      disabled: false,
      hidden: false,
      focus: vi.fn(),
      blur: vi.fn(),
      click: vi.fn(),
    }
    
    if (tagName === 'div') {
      element.querySelector = vi.fn().mockReturnValue(null)
      element.querySelectorAll = vi.fn().mockReturnValue([])
    }
    
    return element
  }),
  getElementById: vi.fn(),
  querySelector: vi.fn(),
  querySelectorAll: vi.fn(),
  body: {
    appendChild: vi.fn(),
    removeChild: vi.fn(),
  },
  head: {
    appendChild: vi.fn(),
    removeChild: vi.fn(),
  },
  title: '',
  cookie: '',
}

// 模拟window对象
const mockWindow = {
  location: {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    pathname: '/',
    search: '',
    hash: '',
  },
  history: {
    pushState: vi.fn(),
    replaceState: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  },
  localStorage: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  sessionStorage: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  alert: vi.fn(),
  confirm: vi.fn(),
  prompt: vi.fn(),
  open: vi.fn(),
  close: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  setTimeout: vi.fn().mockImplementation((fn, delay) => {
    return setTimeout(fn, delay)
  }),
  clearTimeout: vi.fn(),
  setInterval: vi.fn(),
  clearInterval: vi.fn(),
  requestAnimationFrame: vi.fn(),
  cancelAnimationFrame: vi.fn(),
  scrollX: 0,
  scrollY: 0,
  innerWidth: 1024,
  innerHeight: 768,
}

// 模拟DOMPurify库（用于XSS防护）
const mockDOMPurify = {
  sanitize: vi.fn().mockImplementation((dirty) => {
    // 模拟DOMPurify的清理功能
    if (typeof dirty === 'string') {
      // 移除script标签和事件处理器
      return dirty
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/on\w+="[^"]*"/gi, '')
        .replace(/on\w+='[^']*'/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/vbscript:/gi, '')
        .replace(/data:/gi, '')
    }
    return dirty
  }),
  addHook: vi.fn(),
  removeHook: vi.fn(),
  setConfig: vi.fn(),
  clearConfig: vi.fn(),
  version: '2.4.0',
  isSupported: vi.fn().mockReturnValue(true),
}

// 模拟XSS防护工具函数
const createXSSProtection = () => {
  return {
    // 清理HTML内容
    sanitizeHTML: (html) => {
      return mockDOMPurify.sanitize(html)
    },
    
    // 转义HTML特殊字符
    escapeHTML: (str) => {
      if (typeof str !== 'string') return str
      
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
        .replace(/\//g, '&#x2F;')
    },
    
    // 清理URL参数
    sanitizeURL: (url) => {
      if (typeof url !== 'string') return url
      
      // 移除javascript:和vbscript:协议
      return url.replace(/^(javascript|vbscript|data):/i, '')
    },
    
    // 验证和清理CSS
    sanitizeCSS: (css) => {
      if (typeof css !== 'string') return css
      
      // 移除javascript表达式
      return css.replace(/javascript:/gi, '')
        .replace(/expression\s*\(/gi, '')
        .replace(/behavior\s*:/gi, '')
    },
    
    // 检查是否包含XSS攻击模式
    containsXSS: (str) => {
      if (typeof str !== 'string') return false
      
      const xssPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /javascript:/gi,
        /vbscript:/gi,
        /on\w+\s*=/gi,
        /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
        /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
        /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
        /<link\b[^<]*(?:(?!<\/link>)<[^<]*)*<\/link>/gi,
        /<meta\b[^<]*(?:(?!<\/meta>)<[^<]*)*<\/meta>/gi,
      ]
      
      return xssPatterns.some(pattern => pattern.test(str))
    },
    
    // 安全地设置元素的innerHTML
    safeSetInnerHTML: (element, html) => {
      element.innerHTML = mockDOMPurify.sanitize(html)
    },
    
    // 安全地创建元素
    safeCreateElement: (tagName, attributes, textContent) => {
      const element = mockDocument.createElement(tagName)
      
      if (attributes) {
        Object.keys(attributes).forEach(key => {
          // 跳过事件处理器属性
          if (key.startsWith('on')) return
          
          // 清理属性值
          const value = attributes[key]
          if (key === 'href' || key === 'src') {
            element.setAttribute(key, mockDOMPurify.sanitize(value))
          } else if (key === 'style') {
            element.setAttribute(key, mockDOMPurify.sanitize(value))
          } else {
            element.setAttribute(key, value)
          }
        })
      }
      
      if (textContent) {
        element.textContent = textContent
      }
      
      return element
    }
  }
}

describe('XSS防护测试', () => {
  let xssProtection
  
  beforeEach(() => {
    vi.clearAllMocks()
    xssProtection = createXSSProtection()
    // 设置全局变量
    global.document = mockDocument
    global.window = mockWindow
    global.DOMPurify = mockDOMPurify
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('HTML内容清理', () => {
    it('应该能够移除script标签', () => {
      const maliciousHTML = '<div><script>alert("XSS")</script><p>Safe content</p></div>'
      const sanitized = xssProtection.sanitizeHTML(maliciousHTML)
      
      expect(sanitized).not.toContain('<script>')
      expect(sanitized).not.toContain('alert("XSS")')
      expect(sanitized).toContain('<p>Safe content</p>')
    })

    it('应该能够移除事件处理器', () => {
      const maliciousHTML = '<div onclick="alert(\'XSS\')" onmouseover="maliciousCode()">Click me</div>'
      const sanitized = xssProtection.sanitizeHTML(maliciousHTML)
      
      expect(sanitized).not.toContain('onclick=')
      expect(sanitized).not.toContain('onmouseover=')
    })

    it('应该能够移除javascript协议', () => {
      const maliciousHTML = '<a href="javascript:alert(\'XSS\')">Click me</a>'
      const sanitized = xssProtection.sanitizeHTML(maliciousHTML)
      
      expect(sanitized).not.toContain('javascript:')
    })
  })

  describe('HTML转义', () => {
    it('应该能够转义HTML特殊字符', () => {
      const input = '<script>alert("XSS")</script>'
      const escaped = xssProtection.escapeHTML(input)
      
      expect(escaped).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;')
    })

    it('应该能够处理空值和非字符串值', () => {
      expect(xssProtection.escapeHTML(null)).toBe(null)
      expect(xssProtection.escapeHTML(undefined)).toBe(undefined)
      expect(xssProtection.escapeHTML(123)).toBe(123)
      expect(xssProtection.escapeHTML(true)).toBe(true)
    })

    it('应该能够转义所有特殊字符', () => {
      const input = '& < > " \' /'
      const escaped = xssProtection.escapeHTML(input)
      
      expect(escaped).toBe('&amp; &lt; &gt; &quot; &#039; &#x2F;')
    })
  })

  describe('URL清理', () => {
    it('应该能够移除危险协议', () => {
      expect(xssProtection.sanitizeURL('javascript:alert("XSS")')).toBe('alert("XSS")')
      expect(xssProtection.sanitizeURL('vbscript:msgbox("XSS")')).toBe('msgbox("XSS")')
      expect(xssProtection.sanitizeURL('data:text/html,<script>alert("XSS")</script>')).toBe('text/html,<script>alert("XSS")</script>')
    })

    it('应该保留安全协议', () => {
      expect(xssProtection.sanitizeURL('https://example.com')).toBe('https://example.com')
      expect(xssProtection.sanitizeURL('http://example.com')).toBe('http://example.com')
      expect(xssProtection.sanitizeURL('ftp://example.com')).toBe('ftp://example.com')
    })

    it('应该处理非字符串值', () => {
      expect(xssProtection.sanitizeURL(null)).toBe(null)
      expect(xssProtection.sanitizeURL(undefined)).toBe(undefined)
      expect(xssProtection.sanitizeURL(123)).toBe(123)
    })
  })

  describe('CSS清理', () => {
    it('应该能够移除javascript表达式', () => {
      const maliciousCSS = 'background: url(javascript:alert("XSS"));'
      const sanitized = xssProtection.sanitizeCSS(maliciousCSS)
      
      expect(sanitized).not.toContain('javascript:')
    })

    it('应该能够移除CSS表达式', () => {
      const maliciousCSS = 'width: expression(alert("XSS"));'
      const sanitized = xssProtection.sanitizeCSS(maliciousCSS)
      
      expect(sanitized).not.toContain('expression(')
    })

    it('应该能够移除behavior属性', () => {
      const maliciousCSS = 'behavior: url(script.htc);'
      const sanitized = xssProtection.sanitizeCSS(maliciousCSS)
      
      expect(sanitized).not.toContain('behavior:')
    })
  })

  describe('XSS检测', () => {
    it('应该能够检测script标签', () => {
      expect(xssProtection.containsXSS('<script>alert("XSS")</script>')).toBe(true)
      expect(xssProtection.containsXSS('<SCRIPT SRC="evil.js"></SCRIPT>')).toBe(true)
    })

    it('应该能够检测javascript协议', () => {
      expect(xssProtection.containsXSS('javascript:alert("XSS")')).toBe(true)
      expect(xssProtection.containsXSS('JAVASCRIPT:alert("XSS")')).toBe(true)
    })

    it('应该能够检测事件处理器', () => {
      expect(xssProtection.containsXSS('onclick="alert(\'XSS\')"')).toBe(true)
      expect(xssProtection.containsXSS('onmouseover="maliciousCode()"')).toBe(true)
    })

    it('应该能够检测iframe标签', () => {
      expect(xssProtection.containsXSS('<iframe src="javascript:alert(\'XSS\')"></iframe>')).toBe(true)
    })

    it('应该能够检测安全内容', () => {
      expect(xssProtection.containsXSS('<div>Safe content</div>')).toBe(false)
      expect(xssProtection.containsXSS('<p>This is a paragraph</p>')).toBe(false)
    })

    it('应该能够处理非字符串值', () => {
      expect(xssProtection.containsXSS(null)).toBe(false)
      expect(xssProtection.containsXSS(undefined)).toBe(false)
      expect(xssProtection.containsXSS(123)).toBe(false)
    })
  })

  describe('安全的DOM操作', () => {
    it('应该能够安全地设置innerHTML', () => {
      const element = mockDocument.createElement('div')
      const maliciousHTML = '<script>alert("XSS")</script><p>Safe content</p>'
      
      xssProtection.safeSetInnerHTML(element, maliciousHTML)
      
      expect(element.innerHTML).not.toContain('<script>')
      expect(element.innerHTML).toContain('<p>Safe content</p>')
    })

    it('应该能够安全地创建元素', () => {
      const attributes = {
        href: 'javascript:alert("XSS")',
        onclick: 'alert("XSS")',
        class: 'safe-class',
        id: 'safe-id'
      }
      
      const element = xssProtection.safeCreateElement('a', attributes, 'Safe text')
      
      expect(element.tagName).toBe('A')
      expect(element.textContent).toBe('Safe text')
      expect(element.setAttribute).toHaveBeenCalledWith('class', 'safe-class')
      expect(element.setAttribute).toHaveBeenCalledWith('id', 'safe-id')
      // 不应该设置事件处理器
      expect(element.setAttribute).not.toHaveBeenCalledWith('onclick', 'alert("XSS")')
      // href应该被清理
      expect(element.setAttribute).toHaveBeenCalledWith('href', 'alert("XSS")')
    })

    it('应该能够处理没有属性和文本的元素', () => {
      const element = xssProtection.safeCreateElement('div')
      
      expect(element.tagName).toBe('DIV')
      expect(element.textContent).toBe('')
    })
  })

  describe('复杂XSS攻击场景', () => {
    it('应该能够处理编码的XSS攻击', () => {
      const encodedXSS = '<div>&lt;script&gt;alert("XSS")&lt;/script&gt;</div>'
      const decoded = xssProtection.escapeHTML(encodedXSS)
      
      // 原始字符串已经包含HTML实体，再次转义会转义这些实体
      expect(decoded).toContain('&amp;lt;script&amp;gt;')
    })

    it('应该能够处理混合大小写的XSS攻击', () => {
      const mixedCaseXSS = '<ScRiPt>alert("XSS")</ScRiPt>'
      const sanitized = xssProtection.sanitizeHTML(mixedCaseXSS)
      
      expect(sanitized).not.toContain('<script>')
    })

    it('应该能够处理嵌套的XSS攻击', () => {
      const nestedXSS = '<div><div><script>alert("XSS")</script></div></div>'
      const sanitized = xssProtection.sanitizeHTML(nestedXSS)
      
      expect(sanitized).not.toContain('<script>')
    })

    it('应该能够处理基于属性的XSS攻击', () => {
      const attributeXSS = '<img src="x" onerror="alert(\'XSS\')">'
      const sanitized = xssProtection.sanitizeHTML(attributeXSS)
      
      expect(sanitized).not.toContain('onerror=')
    })

    it('应该能够处理基于样式的XSS攻击', () => {
      const styleXSS = '<div style="background: url(javascript:alert(\'XSS\'));">Content</div>'
      const sanitized = xssProtection.sanitizeHTML(styleXSS)
      
      expect(sanitized).not.toContain('javascript:')
    })
  })
})