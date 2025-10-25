<script setup lang="ts">
import { ua } from '@/utils/ua'
import Provider from './ui/provider/index.vue'
import { useTheme } from './domains/infrastructure/composables/useTheme'

const route = useRoute()

const settingsStore = useSettingsStore()
const { auth } = useAuth()

// 使用主题服务
const { theme, isDark, colorScheme } = useTheme()

document.body.setAttribute('data-os', ua.getOS().name || '')

const isAuth = computed(() => {
  return route.matched.every((item) => {
    return auth(item.meta.auth ?? '')
  })
})

// 设置网页 title
watch([
  () => settingsStore.settings.app.enableDynamicTitle,
  () => settingsStore.title,
], () => {
  if (settingsStore.settings.app.enableDynamicTitle && settingsStore.title) {
    const title = typeof settingsStore.title === 'function' ? settingsStore.title() : settingsStore.title
    document.title = `${title} - ${import.meta.env.VITE_APP_TITLE}`
  }
  else {
    document.title = import.meta.env.VITE_APP_TITLE
  }
}, {
  immediate: true,
  deep: true,
})

// 应用主题类名到body
watchEffect(() => {
  // 应用主题模式
  document.body.classList.toggle('theme-dark', isDark.value)
  document.body.classList.toggle('theme-light', !isDark.value)
  
  // 应用颜色方案
  document.body.setAttribute('data-color-scheme', colorScheme.value)
  
  // 应用主题类名
  document.body.setAttribute('data-theme', theme.value)
})

onMounted(() => {
  settingsStore.setMode(document.documentElement.clientWidth)
  window.addEventListener('resize', () => {
    settingsStore.setMode(document.documentElement.clientWidth)
  })
})
</script>

<template>
  <Provider>
    <RouterView v-slot="{ Component }">
      <component :is="Component" v-if="isAuth" />
      <FaNotAllowed v-else />
    </RouterView>
    <FaBackToTop />
    <FaToast />
    <FaNotification />
    <FaSystemInfo />
  </Provider>
</template>
