<template>
  <div class="auth-login-form">
    <form @submit.prevent="handleSubmit" class="login-form">
      <div class="form-header">
        <h2 class="form-title">用户登录</h2>
        <p class="form-subtitle">请输入您的账号和密码</p>
      </div>
      
      <div class="form-body">
        <div class="form-field">
          <label for="account" class="field-label">账号</label>
          <div class="field-input-wrapper">
            <FaIcon name="i-ri:user-line" class="field-icon" />
            <FaInput
              id="account"
              v-model="formData.account"
              type="text"
              placeholder="请输入账号"
              :disabled="isLoading"
              :error="errors.account"
              class="field-input"
            />
          </div>
          <div v-if="errors.account" class="field-error">{{ errors.account }}</div>
        </div>
        
        <div class="form-field">
          <label for="password" class="field-label">密码</label>
          <div class="field-input-wrapper">
            <FaIcon name="i-ri:lock-line" class="field-icon" />
            <FaInput
              id="password"
              v-model="formData.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="请输入密码"
              :disabled="isLoading"
              :error="errors.password"
              class="field-input"
            />
            <button
              type="button"
              class="password-toggle"
              @click="showPassword = !showPassword"
              :disabled="isLoading"
            >
              <FaIcon :name="showPassword ? 'i-ri:eye-off-line' : 'i-ri:eye-line'" />
            </button>
          </div>
          <div v-if="errors.password" class="field-error">{{ errors.password }}</div>
        </div>
        
        <div v-if="errorMessage" class="form-error">
          <FaIcon name="i-ri:error-warning-line" />
          {{ errorMessage }}
        </div>
      </div>
      
      <div class="form-footer">
        <FaButton
          type="submit"
          :loading="isLoading"
          :disabled="!isValidForm"
          class="submit-button"
          block
        >
          登录
        </FaButton>
        
        <div class="form-links">
          <router-link to="/auth/forgot-password" class="link">
            忘记密码？
          </router-link>
          <router-link to="/auth/register" class="link">
            注册账号
          </router-link>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue';
import { useAuth } from '../composables/useAuth';
import type { LoginCredentials } from '../types';

interface Props {
  redirectPath?: string;
  autoFocus?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  autoFocus: true,
});

const emit = defineEmits<{
  success: [];
  error: [error: string];
  loadingChange: [isLoading: boolean];
}>();

const { login, isLoading, error, clearError } = useAuth();

// 表单数据
const formData = reactive<LoginCredentials>({
  account: '',
  password: '',
});

// 表单状态
const showPassword = ref(false);
const errors = reactive<Record<string, string>>({});

// 计算属性
const errorMessage = computed(() => error.value);
const isValidForm = computed(() => {
  return formData.account.trim() !== '' && 
         formData.password.trim() !== '' && 
         !errors.account && 
         !errors.password;
});

// 表单验证
const validateForm = (): boolean => {
  let isValid = true;
  
  // 清除之前的错误
  Object.keys(errors).forEach(key => delete errors[key]);
  
  // 验证账号
  if (!formData.account.trim()) {
    errors.account = '请输入账号';
    isValid = false;
  } else if (formData.account.length < 3) {
    errors.account = '账号长度不能少于3个字符';
    isValid = false;
  }
  
  // 验证密码
  if (!formData.password.trim()) {
    errors.password = '请输入密码';
    isValid = false;
  } else if (formData.password.length < 6) {
    errors.password = '密码长度不能少于6个字符';
    isValid = false;
  }
  
  return isValid;
};

// 处理提交
const handleSubmit = async () => {
  if (!validateForm()) {
    return;
  }
  
  clearError();
  
  const result = await login(formData, props.redirectPath);
  
  if (result.success) {
    emit('success');
  } else {
    emit('error', result.error || '登录失败');
  }
};

// 监听加载状态变化
watch(isLoading, (newValue) => {
  emit('loadingChange', newValue);
});

// 自动聚焦
if (props.autoFocus) {
  nextTick(() => {
    const accountInput = document.getElementById('account') as HTMLInputElement;
    if (accountInput) {
      accountInput.focus();
    }
  });
}
</script>

<style scoped>
.auth-login-form {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.login-form {
  background: var(--fa-bg-color);
  border-radius: var(--fa-border-radius);
  box-shadow: var(--fa-shadow);
  padding: 2rem;
}

.form-header {
  text-align: center;
  margin-bottom: 2rem;
}

.form-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--fa-text-color);
  margin: 0 0 0.5rem;
}

.form-subtitle {
  color: var(--fa-text-color-secondary);
  margin: 0;
}

.form-body {
  margin-bottom: 1.5rem;
}

.form-field {
  margin-bottom: 1.5rem;
}

.field-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--fa-text-color);
}

.field-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.field-icon {
  position: absolute;
  left: 0.75rem;
  color: var(--fa-text-color-secondary);
  z-index: 1;
}

.field-input {
  padding-left: 2.5rem;
  padding-right: 2.5rem;
  width: 100%;
}

.password-toggle {
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  color: var(--fa-text-color-secondary);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.password-toggle:hover {
  background-color: var(--fa-bg-color-hover);
}

.field-error {
  color: var(--fa-color-danger);
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.form-error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--fa-color-danger);
  background-color: var(--fa-color-danger-light);
  padding: 0.75rem;
  border-radius: var(--fa-border-radius);
  margin-bottom: 1rem;
}

.form-footer {
  margin-top: 1.5rem;
}

.submit-button {
  margin-bottom: 1rem;
}

.form-links {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
}

.link {
  color: var(--fa-color-primary);
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
}
</style>