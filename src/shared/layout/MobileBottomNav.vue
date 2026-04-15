<script setup lang="ts">
import { computed, type Component } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { Home, Timer, ClipboardList } from 'lucide-vue-next'
import { useAuth } from '@/modules/auth/composables/useAuth'

const route = useRoute()
const { isEmployee } = useAuth()
void isEmployee // suppress lint if needed, or just remove it if really unused

interface NavItem {
  label: string
  to: string
  icon: Component
}

const navItems = computed<NavItem[]>(() => {
  const baseItems = [
    { label: 'Bảng tin', to: '/my/dashboard', icon: Home },
    { label: 'Bảng công', to: '/my/attendance', icon: Timer },
    { label: 'Đơn từ', to: '/my/requests', icon: ClipboardList },
  ]
  return baseItems
})

const isActive = (path: string) => route.path === path
</script>

<template>
  <nav class="fixed bottom-0 left-0 right-0 z-50 lg:hidden border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-[0_-1px_10px_rgba(0,0,0,0.05)]">
    <div class="flex h-16 w-full items-center justify-around px-2">
      <template v-for="item in navItems" :key="item.to">
        <RouterLink
          :to="item.to"
          :class="[
            'flex flex-col items-center justify-center gap-1 transition-all duration-200 flex-1 h-full relative',
            isActive(item.to) ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400',
          ]"
        >
          <!-- Active Indicator Top -->
          <div v-if="isActive(item.to)" class="absolute top-0 left-1/4 right-1/4 h-0.5 bg-indigo-600 rounded-b-full"></div>
          
          <component :is="item.icon" :class="['h-5 w-5', isActive(item.to) ? 'scale-110' : 'opacity-80']" />
          <span class="text-[10px] font-black uppercase tracking-tight">{{ item.label }}</span>
        </RouterLink>
      </template>
    </div>
  </nav>
</template>

<style scoped>
/* Không cần style phức tạp, Tailwind đã xử lý hầu hết */
</style>
