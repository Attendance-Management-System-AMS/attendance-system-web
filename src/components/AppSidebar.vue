<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import { CalendarCheck, ClipboardList, LayoutDashboard, Settings, Users } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

const route = useRoute()

const menuItems = [
  {
    label: 'Tổng quan',
    to: '/',
    icon: LayoutDashboard,
  },
  {
    label: 'Nhân sự',
    to: '/nhan-su',
    icon: Users,
  },
  {
    label: 'Chấm công',
    to: '/cham-cong',
    icon: CalendarCheck,
  },
  {
    label: 'Báo cáo',
    to: '/bao-cao',
    icon: ClipboardList,
  },
  {
    label: 'Cài đặt',
    to: '/cai-dat',
    icon: Settings,
  },
]

const isActive = (path: string) => route.path === path
</script>

<template>
  <aside
    class="fixed inset-y-0 left-0 w-64 border-r border-slate-200 bg-white/90 px-4 py-6 backdrop-blur"
  >
    <div class="flex h-full flex-col">
      <div class="flex items-center gap-3 px-2">
        <div
          class="flex size-11 items-center justify-center rounded-xl bg-slate-900 text-lg font-semibold text-white"
        >
          A
        </div>
        <div>
          <p class="text-sm font-semibold text-slate-900">Hệ thống Chấm công</p>
          <p class="text-xs text-slate-500">Attendance Management</p>
        </div>
      </div>

      <Separator class="my-6" />

      <nav class="space-y-1">
        <RouterLink
          v-for="item in menuItems"
          :key="item.label"
          :to="item.to"
          :class="
            cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900',
              isActive(item.to) && 'bg-slate-900 text-white hover:bg-slate-900 hover:text-white',
            )
          "
        >
          <component :is="item.icon" class="size-4" />
          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>

      <div class="mt-auto rounded-2xl bg-slate-900 px-4 py-4 text-slate-100">
        <p class="text-sm font-semibold">Phiên bản Enterprise</p>
        <p class="text-xs text-slate-300">Cập nhật 07/02/2026</p>
        <Button variant="secondary" class="mt-3 w-full bg-white text-slate-900 hover:bg-slate-100">
          Nâng cấp
        </Button>
      </div>
    </div>
  </aside>
</template>
