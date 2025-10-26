export default function useMainPage() {
  const router = useRouter()

  const settingsStore = useSettingsStore()

  async function reload() {
    settingsStore.setIsReloading(true)
    try {
      await router.push({ name: 'reload' })
      await new Promise(resolve => setTimeout(resolve, 100))
    } catch (error) {
      console.error('[useMainPage] Reload failed:', error)
    } finally {
      settingsStore.setIsReloading(false)
    }
  }

  return {
    reload,
  }
}
