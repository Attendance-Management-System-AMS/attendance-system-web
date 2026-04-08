<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import DataTable from '@/components/ui/DataTable.vue'

const today = new Date()
const currentMonth = ref(today.getMonth())
const currentYear = ref(today.getFullYear())

const monthLabel = computed(() =>
  new Intl.DateTimeFormat('vi-VN', { month: 'long', year: 'numeric' }).format(
    new Date(currentYear.value, currentMonth.value, 1),
  ),
)

const prevMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else currentMonth.value--
}
const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else currentMonth.value++
}

const columns = [
  { key: 'date', label: 'Ngày' },
  { key: 'shift', label: 'Ca làm việc' },
  { key: 'checkIn', label: 'Giờ vào' },
  { key: 'checkOut', label: 'Giờ ra' },
  { key: 'status', label: 'Trạng thái' },
]

const mockLogs = [
  { date: '01/04', dayLabel: 'Thứ 3', shift: 'Ca hành chính', checkIn: '07:58', checkOut: '17:05', status: 'present' },
  { date: '02/04', dayLabel: 'Thứ 4', shift: 'Ca hành chính', checkIn: '08:18', checkOut: '17:00', status: 'late', lateMinutes: 18 },
  { date: '03/04', dayLabel: 'Thứ 5', shift: 'Ca hành chính', checkIn: '08:01', checkOut: '17:30', status: 'present' },
  { date: '04/04', dayLabel: 'Thứ 6', shift: 'Ca hành chính', checkIn: '07:55', checkOut: null, status: 'incomplete' },
  { date: '08/04', dayLabel: 'Thứ 3', shift: 'Ca hành chính', checkIn: null, checkOut: null, status: 'absent' },
  { date: '09/04', dayLabel: 'Thứ 4', shift: 'Ca hành chính', checkIn: '08:05', checkOut: '17:10', status: 'present' },
]

const summary = computed(() => {
  return {
    present: mockLogs.filter((l) => l.status === 'present').length,
    late: mockLogs.filter((l) => l.status === 'late').length,
    absent: mockLogs.filter((l) => l.status === 'absent').length,
    incomplete: mockLogs.filter((l) => l.status === 'incomplete').length,
  }
})

const getStatusBadge = (status: string, lateMinutes?: number) => {
  switch (status) {
    case 'present': return { label: 'Đúng giờ', class: 'bg-emerald-50 text-emerald-600 border-none' }
    case 'late': return { label: `Muộn (${lateMinutes}p)`, class: 'bg-amber-50 text-amber-600 border-none' }
    case 'absent': return { label: 'Vắng mặt', class: 'bg-rose-50 text-rose-600 border-none' }
    default: return { label: 'Thiếu dữ liệu', class: 'bg-slate-100 text-slate-500 border-none' }
  }
}
</script>

<template>
  <div class="space-y-4 lg:space-y-6">
    <!-- Header - Responsive -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6">
      <div>
        <h1 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Bảng công</h1>
        <p class="text-[9px] sm:text-xs uppercase font-bold tracking-widest text-slate-400 mt-1">Lịch sử & Thống kê chi tiết</p>
      </div>

      <div class="flex items-center gap-1 rounded-md border border-border bg-card p-0.5 sm:p-1 shadow-sm self-start sm:self-auto">
        <Button variant="ghost" size="icon" @click="prevMonth" class="h-7 w-7 sm:h-9 sm:w-9">
          <ChevronLeft class="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </Button>
        <div class="px-2 sm:px-4 text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-700 min-w-[100px] sm:min-w-[140px] text-center">
          {{ monthLabel }}
        </div>
        <Button variant="ghost" size="icon" @click="nextMonth" class="h-7 w-7 sm:h-9 sm:w-9">
          <ChevronRight class="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </Button>
      </div>
    </div>

    <!-- Summary Cards - Square & Responsive -->
    <div class="grid grid-cols-4 gap-2 lg:gap-6">
      <Card class="border-none bg-indigo-50/50 dark:bg-indigo-950/20 shadow-none rounded-md aspect-square sm:aspect-auto">
        <CardContent class="p-1.5 sm:p-6 lg:p-8 flex flex-col items-center justify-center h-full text-center">
          <div class="mb-1 sm:mb-4 text-indigo-600">
            <CheckCircle2 class="h-5 w-5 sm:h-10 sm:w-10" />
          </div>
          <div>
            <p class="text-[7px] sm:text-[11px] font-bold text-indigo-600/70 uppercase tracking-tighter sm:tracking-widest leading-none mb-0.5 sm:mb-2">Đúng giờ</p>
            <p class="text-sm sm:text-3xl font-black text-slate-900 dark:text-white">{{ summary.present }}</p>
          </div>
        </CardContent>
      </Card>

      <Card class="border-none bg-amber-50/50 dark:bg-amber-950/20 shadow-none rounded-md aspect-square sm:aspect-auto">
        <CardContent class="p-1.5 sm:p-6 lg:p-8 flex flex-col items-center justify-center h-full text-center">
          <div class="mb-1 sm:mb-4 text-amber-600">
            <Clock class="h-5 w-5 sm:h-10 sm:w-10" />
          </div>
          <div>
            <p class="text-[7px] sm:text-[11px] font-bold text-amber-600/70 uppercase tracking-tighter sm:tracking-widest leading-none mb-0.5 sm:mb-2">Muộn</p>
            <p class="text-sm sm:text-3xl font-black text-slate-900 dark:text-white">{{ summary.late }}</p>
          </div>
        </CardContent>
      </Card>

      <Card class="border-none bg-rose-50/50 dark:bg-rose-950/20 shadow-none rounded-md aspect-square sm:aspect-auto">
        <CardContent class="p-1.5 sm:p-6 lg:p-8 flex flex-col items-center justify-center h-full text-center">
          <div class="mb-1 sm:mb-4 text-rose-600">
            <XCircle class="h-5 w-5 sm:h-10 sm:w-10" />
          </div>
          <div>
            <p class="text-[7px] sm:text-[11px] font-bold text-rose-600/70 uppercase tracking-tighter sm:tracking-widest leading-none mb-0.5 sm:mb-2">Vắng</p>
            <p class="text-sm sm:text-3xl font-black text-slate-900 dark:text-white">{{ summary.absent }}</p>
          </div>
        </CardContent>
      </Card>

      <Card class="border-none bg-slate-100/50 dark:bg-slate-800/50 shadow-none rounded-md aspect-square sm:aspect-auto">
        <CardContent class="p-1.5 sm:p-6 lg:p-8 flex flex-col items-center justify-center h-full text-center">
          <div class="mb-1 sm:mb-4 text-slate-600">
            <HelpCircle class="h-5 w-5 sm:h-10 sm:w-10" />
          </div>
          <div>
            <p class="text-[7px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-tighter sm:tracking-widest leading-none mb-0.5 sm:mb-2">Thiếu</p>
            <p class="text-sm sm:text-3xl font-black text-slate-900 dark:text-white">{{ summary.incomplete }}</p>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Attendance Table - Responsive -->
    <Card class="shadow-none border-border rounded-md sm:rounded-xl">
      <CardHeader class="py-2.5 px-3 sm:py-5 sm:px-6 bg-slate-50/50 dark:bg-slate-900/50 border-b">
         <div class="flex items-center justify-between">
            <CardTitle class="text-[11px] sm:text-sm font-black uppercase tracking-widest">Chi tiết chấm công tháng {{ currentMonth + 1 }}</CardTitle>
            <Badge class="text-[9px] sm:text-[11px] font-bold bg-white dark:bg-slate-950 border-slate-200 text-slate-500 px-2 sm:px-3 h-5 sm:h-6">22 ngày công</Badge>
         </div>
      </CardHeader>
      <div class="overflow-x-auto">
        <DataTable :columns="columns" :rows="mockLogs" class="sm:text-sm">
          <template #cell-date="{ row }">
            <div class="flex flex-col py-1 sm:py-2">
              <span class="text-xs sm:text-sm font-black text-slate-700 dark:text-slate-200 leading-none">{{ row.date }}</span>
              <span class="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase leading-none mt-1">{{ row.dayLabel }}</span>
            </div>
          </template>

          <template #cell-shift="{ value }">
            <span class="text-[11px] font-bold text-slate-500 whitespace-nowrap">{{ value }}</span>
          </template>

          <template #cell-checkIn="{ value }">
            <code class="text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-slate-600">
              {{ value || '—' }}
            </code>
          </template>

          <template #cell-checkOut="{ value }">
            <code class="text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-slate-600">
              {{ value || '—' }}
            </code>
          </template>

          <template #cell-status="{ row }">
            <Badge :class="getStatusBadge(row.status, row.lateMinutes).class" class="font-bold uppercase text-[8px] h-4 px-1.5 whitespace-nowrap">
               {{ getStatusBadge(row.status, row.lateMinutes).label }}
            </Badge>
          </template>
        </DataTable>
      </div>
    </Card>
  </div>
</template>
