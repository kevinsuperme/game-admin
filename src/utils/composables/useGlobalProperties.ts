import type { ComponentInternalInstance } from 'vue'

export default function useGlobalProperties() {
  const instance = getCurrentInstance()
  if (!instance?.appContext) {
    throw new Error('useGlobalProperties() must be called within component setup()')
  }
  return instance.appContext.config.globalProperties
}
