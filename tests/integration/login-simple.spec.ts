import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import LoginSimple from '@/views/login-simple.vue'

describe('登录页面简单测试', () => {
  let wrapper: any

  beforeEach(() => {
    // 重置模拟函数
    vi.clearAllMocks()
    
    // 创建 Pinia 实例
    const pinia = createPinia()
    
    // 挂载组件
    wrapper = mount(LoginSimple, {
      global: {
        plugins: [pinia],
        stubs: {
          'router-link': true,
        },
      },
    })
  })

  it('应该正确渲染登录表单', () => {
    expect(wrapper.find('h2').text()).toBe('登录测试页面')
    expect(wrapper.find('#account').exists()).toBe(true)
    expect(wrapper.find('#password').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
  })

  it('应该能够输入用户名和密码', async () => {
    const accountInput = wrapper.find('#account')
    const passwordInput = wrapper.find('#password')
    
    await accountInput.setValue('testuser')
    await passwordInput.setValue('testpassword')
    
    expect(accountInput.element.value).toBe('testuser')
    expect(passwordInput.element.value).toBe('testpassword')
  })

  it('应该能够提交表单', async () => {
    const accountInput = wrapper.find('#account')
    const passwordInput = wrapper.find('#password')
    const form = wrapper.find('form')
    
    await accountInput.setValue('testuser')
    await passwordInput.setValue('testpassword')
    
    await form.trigger('submit')
    
    // 验证路由跳转是否被调用
    expect(wrapper.vm.$router.push).toHaveBeenCalledWith('/')
  })

  it('应该能够点击注册链接', async () => {
    const registerLink = wrapper.find('.form-links a:first-child')
    
    await registerLink.trigger('click')
    
    // 这里只是简单验证点击不会导致错误
    expect(registerLink.exists()).toBe(true)
  })

  it('应该能够点击忘记密码链接', async () => {
    const resetLink = wrapper.find('.form-links a:last-child')
    
    await resetLink.trigger('click')
    
    // 这里只是简单验证点击不会导致错误
    expect(resetLink.exists()).toBe(true)
  })
})