<template>
  <div class="login-test-container">
    <h2>登录测试页面</h2>
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="account">用户名:</label>
        <input id="account" v-model="account" type="text" required>
      </div>
      <div class="form-group">
        <label for="password">密码:</label>
        <input id="password" v-model="password" type="password" required>
      </div>
      <button type="submit">登录</button>
    </form>
    <div class="form-links">
      <a href="#" @click.prevent="switchToRegister">注册新账号</a>
      <a href="#" @click.prevent="switchToResetPassword">忘记密码</a>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'LoginTest',
})

const route = useRoute()
const router = useRouter()

const account = ref<string>('')
const password = ref<string>('')

const handleLogin = () => {
  // 模拟登录成功
  router.push(route.query.redirect?.toString() || '/')
}

const switchToRegister = () => {
  // 切换到注册表单
  console.log('切换到注册表单')
}

const switchToResetPassword = () => {
  // 切换到重置密码表单
  console.log('切换到重置密码表单')
}
</script>

<style scoped>
.login-test-container {
  max-width: 400px;
  padding: 20px;
  margin: 0 auto;
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 8px;
}

h2 {
  margin-bottom: 20px;
  text-align: center;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input {
  box-sizing: border-box;
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  width: 100%;
  padding: 10px;
  color: white;
  cursor: pointer;
  background-color: #4caf50;
  border: none;
  border-radius: 4px;
}

button:hover {
  background-color: #45a049;
}

.form-links {
  margin-top: 15px;
  text-align: center;
}

.form-links a {
  margin: 0 10px;
  color: #007bff;
  text-decoration: none;
}

.form-links a:hover {
  text-decoration: underline;
}
</style>