<script setup lang="ts">
import PageHeader from '@/shared/ui/PageHeader.vue'
import { Check, Minus, ShieldCheck, Lock } from 'lucide-vue-next'
import { Card, CardContent } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'

const moduleKeys = [
  'dashboard',
  'attendance',
  'employees',
  'leaves',
  'reports',
  'settings',
] as const

type ModuleKey = (typeof moduleKeys)[number]

interface RoleRow {
  role: string
  desc: string
  modules: Record<ModuleKey, boolean | 'partial'>
}
const moduleLabels: Record<(typeof moduleKeys)[number], string> = {
  dashboard: 'Tổng quan',
  attendance: 'Chấm công',
  employees: 'Nhân sự',
  leaves: 'Nghỉ phép',
  reports: 'Báo cáo',
  settings: 'Cài đặt',
}

const rows: RoleRow[] = [
  {
    role: 'Quản trị viên',
    desc: 'Toàn quyền cấu hình và dữ liệu hệ thống',
    modules: { dashboard: true, attendance: true, employees: true, leaves: true, reports: true, settings: true },
  },
  {
    role: 'Quản lý',
    desc: 'Duyệt đơn, xem báo cáo phòng ban và nhân viên',
    modules: { dashboard: true, attendance: true, employees: true, leaves: 'partial', reports: true, settings: false },
  },
  {
    role: 'Nhân viên',
    desc: 'Chấm công, gửi đơn từ và xem lịch cá nhân',
    modules: { dashboard: true, attendance: true, employees: false, leaves: 'partial', reports: false, settings: false },
  },
]

function getPermissionState(v: boolean | 'partial') {
  if (v === true) return 'full'
  if (v === 'partial') return 'partial'
  return 'none'
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
            title="Phân quyền"
            description="Ma trận phân quyền hệ thống theo vai trò người dùng"
        />
        <Button disabled class="gap-2">
            <Lock class="h-4 w-4" />
            Chỉ đọc
        </Button>
    </div>

    <Card class="overflow-hidden border-border shadow-none">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b bg-surface/50 dark:bg-card/50">
              <th class="px-6 py-4 text-left text-[10px] font-semibold  tracking-normal text-tertiary-text min-w-[200px]">
                Vai trò & Mô tả
              </th>
              <th
                v-for="key in moduleKeys"
                :key="key"
                class="px-3 py-4 text-center text-[10px] font-semibold  tracking-normal text-tertiary-text"
              >
                {{ moduleLabels[key] }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border dark:divide-border">
            <tr
              v-for="row in rows"
              :key="row.role"
              class="hover:bg-primary/10/10 dark:hover:bg-primary/10/10 transition-colors"
            >
              <td class="px-6 py-5">
                <div class="flex items-center gap-3">
                    <div class="h-8 w-8 rounded-lg bg-primary/10 dark:bg-primary/10 flex items-center justify-center text-primary">
                        <ShieldCheck class="h-4 w-4" />
                    </div>
                    <div>
                        <p class="font-semibold text-primary-text dark:text-primary-text leading-tight">{{ row.role }}</p>
                        <p class="text-[11px] font-medium text-tertiary-text mt-0.5">{{ row.desc }}</p>
                    </div>
                </div>
              </td>
              <td v-for="key in moduleKeys" :key="key" class="px-3 py-5 text-center">
                <div class="flex justify-center">
                    <span
                    v-if="getPermissionState(row.modules[key]) === 'full'"
                    class="h-7 w-7 flex items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-900/50"
                    >
                    <Check class="h-3.5 w-3.5" />
                    </span>
                    <span
                    v-else-if="getPermissionState(row.modules[key]) === 'partial'"
                    class="h-7 w-7 flex items-center justify-center rounded-full bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-950/30 dark:border-amber-900/50"
                    title="Quyền hạn chế"
                    >
                    <Minus class="h-3.5 w-3.5" />
                    </span>
                    <span v-else class="h-7 w-7 flex items-center justify-center rounded-full bg-surface text-tertiary-text dark:bg-card dark:text-primary-text">
                        <Check class="h-3.5 w-3.5 opacity-0" />
                    </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>

    <Card class="border-amber-100 bg-amber-50/30 dark:bg-amber-950/10 shadow-none">
       <CardContent class="py-4 flex gap-3 items-center">
          <Lock class="h-4 w-4 text-amber-500" />
          <p class="text-[11px] font-bold text-amber-700 dark:text-amber-400">
            Ma trận này phản ánh chính sách quyền hiện tại trong hệ thống. Thay đổi quyền cần cập nhật đồng bộ ở backend và router frontend.
          </p>
       </CardContent>
    </Card>
  </div>
</template>
