<script setup lang="ts">
import { ref } from 'vue'
import { Download, Filter } from 'lucide-vue-next'
import PageHeader from '@/components/ui/PageHeader.vue'
import FilterSelect from '@/components/ui/FilterSelect.vue'

const filterMonth = ref('03')
const filterYear = ref('2026')
const filterDept = ref('')

const months = [
  { label: 'Tháng 1', value: '01' },
  { label: 'Tháng 2', value: '02' },
  { label: 'Tháng 3', value: '03' },
  { label: 'Tháng 4', value: '04' },
  { label: 'Tháng 5', value: '05' },
  { label: 'Tháng 6', value: '06' },
  { label: 'Tháng 7', value: '07' },
  { label: 'Tháng 8', value: '08' },
  { label: 'Tháng 9', value: '09' },
  { label: 'Tháng 10', value: '10' },
  { label: 'Tháng 11', value: '11' },
  { label: 'Tháng 12', value: '12' },
]

const years = [
  { label: '2024', value: '2024' },
  { label: '2025', value: '2025' },
  { label: '2026', value: '2026' },
]

const departments = [
  { label: 'Nhân sự', value: 'hr' },
  { label: 'Công nghệ', value: 'it' },
  { label: 'Tài chính', value: 'finance' },
  { label: 'Kinh doanh', value: 'sales' },
]

interface TimesheetRow {
  id: string
  name: string
  empCode: string
  dept: string
  initials: string
  standard: number
  actual: number
  leave: number
  absent: number
  overtime: number
}

const rows: TimesheetRow[] = [
  { id: 'ts-001', name: 'Trần Minh Anh', empCode: 'NV001', dept: 'Nhân sự', initials: 'MA', standard: 23, actual: 23, leave: 0, absent: 0, overtime: 4 },
  { id: 'ts-002', name: 'Nguyễn Đức Dũng', empCode: 'NV002', dept: 'Công nghệ', initials: 'ND', standard: 23, actual: 21, leave: 1, absent: 1, overtime: 8 },
  { id: 'ts-003', name: 'Lê Hoài Nam', empCode: 'NV003', dept: 'Tài chính', initials: 'HN', standard: 23, actual: 22, leave: 1, absent: 0, overtime: 0 },
  { id: 'ts-004', name: 'Phạm Thị Thủy', empCode: 'NV004', dept: 'Kinh doanh', initials: 'PT', standard: 23, actual: 20, leave: 3, absent: 0, overtime: 0 },
  { id: 'ts-005', name: 'Ngô Phương Linh', empCode: 'NV005', dept: 'Vận hành', initials: 'PL', standard: 23, actual: 23, leave: 0, absent: 0, overtime: 12 },
  { id: 'ts-006', name: 'Võ Minh Khoa', empCode: 'NV006', dept: 'IT', initials: 'MK', standard: 23, actual: 18, leave: 2, absent: 3, overtime: 0 },
  { id: 'ts-007', name: 'Đỗ Thị Hằng', empCode: 'NV007', dept: 'Nhân sự', initials: 'TH', standard: 23, actual: 22, leave: 0, absent: 1, overtime: 2 },
  { id: 'ts-008', name: 'Bùi Quốc Tuấn', empCode: 'NV008', dept: 'Tài chính', initials: 'QT', standard: 23, actual: 21, leave: 2, absent: 0, overtime: 0 },
]

const getAttendanceRate = (row: TimesheetRow) => Math.round((row.actual / row.standard) * 100)

const getRateColor = (rate: number) => {
  if (rate >= 95) return 'text-emerald-600'
  if (rate >= 80) return 'text-amber-600'
  return 'text-rose-600'
}

const getRateBarColor = (rate: number) => {
  if (rate >= 95) return 'bg-emerald-500'
  if (rate >= 80) return 'bg-amber-500'
  return 'bg-rose-500'
}

const avatarColors = [
  'bg-indigo-100 text-indigo-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
]
const getAvatarColor = (idx: number) => avatarColors[idx % avatarColors.length]
</script>

<template>
  <div class="space-y-6">
    <PageHeader title="Bảng công tháng 3/2026" description="Tổng hợp công làm việc toàn bộ nhân viên">
      <template #actions>
        <button
          class="flex items-center gap-2 h-10 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors dark:shadow-none"
        >
          <Download class="h-4 w-4" />
          Xuất Excel
        </button>
      </template>
    </PageHeader>

    <!-- Summary cards -->
    <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Ngày công chuẩn</p>
        <p class="mt-2 text-2xl font-black text-slate-900 dark:text-white">23</p>
        <p class="text-xs text-slate-400">Tháng 3/2026</p>
      </div>
      <div class="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 shadow-sm dark:border-emerald-900 dark:bg-emerald-950/50">
        <p class="text-[11px] font-bold uppercase tracking-wider text-emerald-500">Tỷ lệ TB</p>
        <p class="mt-2 text-2xl font-black text-emerald-700 dark:text-emerald-400">94.2%</p>
        <p class="text-xs text-emerald-600">Đạt yêu cầu</p>
      </div>
      <div class="rounded-2xl border border-amber-100 bg-amber-50 p-4 shadow-sm dark:border-amber-900 dark:bg-amber-950/50">
        <p class="text-[11px] font-bold uppercase tracking-wider text-amber-500">Tổng nghỉ phép</p>
        <p class="mt-2 text-2xl font-black text-amber-700 dark:text-amber-400">12 ngày</p>
        <p class="text-xs text-amber-600">8 người nghỉ</p>
      </div>
      <div class="rounded-2xl border border-rose-100 bg-rose-50 p-4 shadow-sm dark:border-rose-900 dark:bg-rose-950/50">
        <p class="text-[11px] font-bold uppercase tracking-wider text-rose-500">Tổng vắng mặt</p>
        <p class="mt-2 text-2xl font-black text-rose-700 dark:text-rose-400">5 ngày</p>
        <p class="text-xs text-rose-600">3 người vắng</p>
      </div>
    </div>

    <!-- Filter bar -->
    <div class="flex items-center gap-3 flex-wrap">
      <div class="flex items-center gap-1.5 text-sm font-medium text-slate-500">
        <Filter class="h-4 w-4" />
        Lọc theo:
      </div>
      <FilterSelect v-model="filterMonth" label="Tháng" :options="months" />
      <FilterSelect v-model="filterYear" label="Năm" :options="years" />
      <FilterSelect v-model="filterDept" label="Phòng ban" :options="departments" />
    </div>

    <!-- Timesheet table -->
    <div class="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-slate-100 bg-slate-50/50 dark:border-slate-800">
              <th class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Nhân viên</th>
              <th class="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-slate-400">Ngày chuẩn</th>
              <th class="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-slate-400">Thực tế</th>
              <th class="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-slate-400">Nghỉ phép</th>
              <th class="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-slate-400">Vắng</th>
              <th class="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-slate-400">Làm thêm (h)</th>
              <th class="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-slate-400 min-w-[140px]">Tỷ lệ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr
              v-for="(row, idx) in rows"
              :key="row.id"
              class="hover:bg-slate-50/50 transition-colors dark:hover:bg-slate-800/50"
            >
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <div :class="['flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold', getAvatarColor(idx)]">
                    {{ row.initials }}
                  </div>
                  <div>
                    <p class="text-sm font-medium text-slate-900 dark:text-white">{{ row.name }}</p>
                    <p class="text-xs text-slate-400 font-mono">{{ row.empCode }} · {{ row.dept }}</p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3 text-center text-sm font-mono font-bold text-slate-700 dark:text-slate-300">{{ row.standard }}</td>
              <td class="px-4 py-3 text-center text-sm font-mono font-bold text-slate-900 dark:text-white">{{ row.actual }}</td>
              <td class="px-4 py-3 text-center">
                <span :class="['text-sm font-mono font-bold', row.leave > 0 ? 'text-amber-600' : 'text-slate-400']">
                  {{ row.leave }}
                </span>
              </td>
              <td class="px-4 py-3 text-center">
                <span :class="['text-sm font-mono font-bold', row.absent > 0 ? 'text-rose-600' : 'text-slate-400']">
                  {{ row.absent }}
                </span>
              </td>
              <td class="px-4 py-3 text-center">
                <span :class="['text-sm font-mono font-bold', row.overtime > 0 ? 'text-indigo-600' : 'text-slate-400']">
                  {{ row.overtime > 0 ? `+${row.overtime}h` : '--' }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <div class="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      :class="['h-full rounded-full transition-all', getRateBarColor(getAttendanceRate(row))]"
                      :style="{ width: `${getAttendanceRate(row)}%` }"
                    ></div>
                  </div>
                  <span :class="['text-xs font-bold min-w-[36px] text-right', getRateColor(getAttendanceRate(row))]">
                    {{ getAttendanceRate(row) }}%
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
