<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Bell, Menu } from 'lucide-vue-next'
import { useAuth } from '@/modules/auth/composables/useAuth'

const props = defineProps<{
  showMenu?: boolean
}>()

const emit = defineEmits<{
  (e: 'menu-click'): void
}>()

const route = useRoute()
const { user } = useAuth()

const pageTitle = computed(() => route.meta.title || 'Ứng dụng')

const userInitials = computed(() => {
  if (!user.value?.fullName) return '??'
  return user.value.fullName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(-2)
})
</script>

<template>
  <header
    class="sticky top-0 z-40 border-b border-border bg-card/90 text-card-foreground backdrop-blur-md lg:hidden"
  >
    <div class="flex h-14 items-center justify-between px-4 pt-[env(safe-area-inset-top)]">
      <!-- Left: Simple Avatar or Menu Button -->
      <div class="flex items-center">
        <button
          v-if="props.showMenu"
          @click="emit('menu-click')"
          class="mr-3 flex h-9 w-9 items-center justify-center rounded-lg text-secondary-text transition-colors hover:bg-elevated hover:text-primary-text"
        >
          <Menu class="h-6 w-6" />
        </button>
        
        <div
          v-else
          class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-xs font-semibold text-primary"
        >
          {{ userInitials }}
        </div>
      </div>

      <!-- Center: Title -->
      <h2 class="text-sm font-semibold tracking-normal text-primary-text">
        {{ pageTitle }}
      </h2>

      <!-- Right: Search/Notification -->
      <div class="flex items-center gap-1">
        <button
          class="relative flex h-9 w-9 items-center justify-center rounded-lg text-secondary-text transition-colors hover:bg-elevated hover:text-primary-text"
        >
          <Bell class="h-5 w-5" />
          <span
            class="absolute right-2 top-2 flex h-2 w-2 rounded-full bg-rose-500 ring-2 ring-card"
          ></span>
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
header {
  /* Hỗ trợ khoảng đệm phía trên cho các dòng máy có Notch */
  padding-top: env(safe-area-inset-top);
}
</style>
