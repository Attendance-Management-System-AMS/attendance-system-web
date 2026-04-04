<script setup lang="ts">
import { Check, Minus } from 'lucide-vue-next'

const moduleKeys = ['dashboard', 'attendance', 'employees', 'leaves', 'reports', 'settings'] as const

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
    desc: 'Toàn quyền cấu hình và dữ liệu',
    modules: {
      dashboard: true,
      attendance: true,
      employees: true,
      leaves: true,
      reports: true,
      settings: true,
    },
  },
  {
    role: 'Quản lý',
    desc: 'Duyệt đơn, xem báo cáo phòng ban',
    modules: {
      dashboard: true,
      attendance: true,
      employees: true,
      leaves: 'partial',
      reports: true,
      settings: false,
    },
  },
  {
    role: 'Nhân viên',
    desc: 'Chấm công và xem lịch cá nhân',
    modules: {
      dashboard: true,
      attendance: true,
      employees: false,
      leaves: 'partial',
      reports: false,
      settings: false,
    },
  },
]

function cellIcon(v: boolean | 'partial') {
  if (v === true) return 'check'
  if (v === 'partial') return 'partial'
  return 'none'
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      title="Phân quyền"
      description="Ma trận quyền theo vai trò (xem trước — cấu hình API thực tế sẽ gắn sau)"
    />

    <div
      class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div class="overflow-x-auto">
        <table class="w-full min-w-160 text-sm">
          <thead>
            <tr class="border-b border-slate-200 bg-linear-to-r from-slate-50 to-indigo-50/50 dark:border-slate-800 dark:from-slate-900 dark:to-indigo-950/30">
              <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Vai trò</th>
              <th
                v-for="key in moduleKeys"
                :key="key"
                class="px-2 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500"
              >
                {{ moduleLabels[key] }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr v-for="row in rows" :key="row.role" class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
              <td class="px-4 py-4">
                <p class="font-semibold text-slate-900 dark:text-white">{{ row.role }}</p>
                <p class="text-xs text-slate-500">{{ row.desc }}</p>
              </td>
              <td v-for="key in moduleKeys" :key="key" class="px-2 py-4 text-center">
                <span
                  v-if="cellIcon(row.modules[key]) === 'check'"
                  class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
                >
                  <Check class="h-4 w-4" />
                </span>
                <span
                  v-else-if="cellIcon(row.modules[key]) === 'partial'"
                  class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300"
                  title="Một phần"
                >
                  <Minus class="h-4 w-4" />
                </span>
                <span v-else class="text-slate-300 dark:text-slate-600">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <p class="text-center text-xs text-slate-400">
      Chỉnh sửa vai trò chi tiết sẽ kết nối tới API sau khi backend phân quyền xong.
    </p>
  </div>
</template>
