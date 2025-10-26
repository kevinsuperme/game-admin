import type { App, DirectiveBinding } from 'vue'
import { watch } from 'vue'
import useAuth from './composables/useAuth'

export default function directive(app: App) {
  app.directive('auth', (el: HTMLElement, binding: DirectiveBinding) => {
    watch(() => binding.modifiers.all ? useAuth().authAll(binding.value) : useAuth().auth(binding.value), (val) => {
      el.style.display = val ? '' : 'none'
    }, {
      immediate: true,
    })
  })
}
