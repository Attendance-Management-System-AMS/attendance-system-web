<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { Home, CalendarDays, Timer, User, ClipboardList, ScanFace } from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'

const route = useRoute()
const { isEmployee } = useAuth()

const navItems = computed(() => {
  if (isEmployee.value) {
    return [
      { label: 'Bảng tin', to: '/my/dashboard', icon: Home },
      { label: 'Bảng công', to: '/my/attendance', icon: Timer },
      { label: 'Đơn từ', to: '/my/requests', icon: ClipboardList },
    ]
  }

  // Mặc định cho Admin/HR trên Mobile nếu muốn dùng
  return [
    { label: 'Dashboard', to: '/dashboard', icon: Home },
    { label: 'Nhân sự', to: '/employees', icon: User },
    { label: 'Kiosk', to: '/kiosk', icon: ScanFace, isAction: true },
    { label: 'Lịch', to: '/schedule', icon: CalendarDays },
    { label: 'Cài đặt', to: '/settings', icon: User },
  ]
})

const isActive = (path: string) => route.path === path
</script>

<template>
  <nav class="fixed bottom-0 left-0 right-0 z-50 lg:hidden px-4 pb-6 pt-2">
    <!-- Glassmorphism Container -->
    <div
      class="mx-auto flex h-16 max-w-md items-center justify-around rounded-xl border border-white/20 bg-white/80 px-2 shadow-2xl shadow-indigo-200/50 backdrop-blur-xl dark:border-slate-800/50 dark:bg-slate-900/80 dark:shadow-none"
    >
      <template v-for="item in navItems" :key="item.to">
        <!-- Nút hành động chính (Ở giữa) -->
        <RouterLink
          v-if="item.isAction"
          :to="item.to"
          class="relative -top-6 flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/40 transition-transform active:scale-90"
        >
          <component :is="item.icon" class="h-7 w-7" />
        </RouterLink>

        <!-- Nút menu bình thường -->
        <RouterLink
          v-else
          :to="item.to"
          :class="[
            'flex flex-col items-center justify-center gap-1 transition-colors',
            isActive(item.to) ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400',
          ]"
        >
          <component :is="item.icon" :class="['h-5 w-5', isActive(item.to) && 'animate-pulse']" />
          <span class="text-[10px] font-bold">{{ item.label }}</span>
          <span
            v-if="isActive(item.to)"
            class="h-1 w-1 rounded-full bg-indigo-600 dark:bg-indigo-400"
          ></span>
        </RouterLink>
      </template>
    </div>
  </nav>
</template>

<style scoped>
/* Thêm một chút đổ bóng mịn hơn cho bottom nav */
nav {
  background: linear-gradient(0deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0) 100%);
}
@media (prefers-color-scheme: dark) {
  nav {
    background: linear-gradient(0deg, rgba(15, 23, 42, 0.8) 0%, rgba(15, 23, 42, 0) 100%);
  }
}
</style>
