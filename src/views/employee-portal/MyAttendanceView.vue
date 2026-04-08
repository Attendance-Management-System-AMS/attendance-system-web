<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  XCircle,
  AlertCircle,
  HelpCircle,
} from 'lucide-vue-next'
import { RouterLink } from 'vue-router'

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

type AttendanceStatus = 'present' | 'late' | 'absent' | 'incomplete' | 'off' | 'holiday'

interface DayLog {
  date: string
  dayLabel: string
  shift: string
  shiftTime: string
  checkIn: string | null
  checkOut: string | null
  status: AttendanceStatus
  lateMinutes?: number
}

const mockLogs: DayLog[] = [
  {
    date: '01/04',
    dayLabel: 'T3',
    shift: 'Ca hành chính',
    shiftTime: '08:00-17:00',
    checkIn: '07:58',
    checkOut: '17:05',
    status: 'present',
  },
  {
    date: '02/04',
    dayLabel: 'T4',
    shift: 'Ca hành chính',
    shiftTime: '08:00-17:00',
    checkIn: '08:18',
    checkOut: '17:00',
    status: 'late',
    lateMinutes: 18,
  },
  {
    date: '03/04',
    dayLabel: 'T5',
    shift: 'Ca hành chính',
    shiftTime: '08:00-17:00',
    checkIn: '08:01',
    checkOut: '17:30',
    status: 'present',
  },
  {
    date: '04/04',
    dayLabel: 'T6',
    shift: 'Ca hành chính',
    shiftTime: '08:00-17:00',
    checkIn: '07:55',
    checkOut: null,
    status: 'incomplete',
  },
  {
    date: '05/04',
    dayLabel: 'T7',
    shift: '—',
    shiftTime: '—',
    checkIn: null,
    checkOut: null,
    status: 'off',
  },
  {
    date: '06/04',
    dayLabel: 'CN',
    shift: '—',
    shiftTime: '—',
    checkIn: null,
    checkOut: null,
    status: 'off',
  },
  {
    date: '07/04',
    dayLabel: 'T2',
    shift: 'Ca hành chính',
    shiftTime: '08:00-17:00',
    checkIn: '08:00',
    checkOut: '17:00',
    status: 'present',
  },
  {
    date: '08/04',
    dayLabel: 'T3',
    shift: 'Ca hành chính',
    shiftTime: '08:00-17:00',
    checkIn: null,
    checkOut: null,
    status: 'absent',
  },
  {
    date: '09/04',
    dayLabel: 'T4',
    shift: 'Ca hành chính',
    shiftTime: '08:00-17:00',
    checkIn: '08:05',
    checkOut: '17:10',
    status: 'present',
  },
  {
    date: '10/04',
    dayLabel: 'T5',
    shift: 'Ca hành chính',
    shiftTime: '08:00-17:00',
    checkIn: '08:02',
    checkOut: '17:00',
    status: 'present',
  },
]

import type { Component } from 'vue'

const statusConfig: Record<
  AttendanceStatus,
  { label: string; bg: string; text: string; dot: string; icon: Component }
> = {
  present: {
    label: 'Đúng giờ',
    bg: 'bg-slate-50 dark:bg-slate-800',
    text: 'text-emerald-600 dark:text-emerald-400',
    dot: 'bg-emerald-500',
    icon: CheckCircle2,
  },
  late: {
    label: 'Đi muộn',
    bg: 'bg-slate-50 dark:bg-slate-800',
    text: 'text-amber-600 dark:text-amber-400',
    dot: 'bg-amber-500',
    icon: Clock,
  },
  absent: {
    label: 'Vắng mặt',
    bg: 'bg-slate-50 dark:bg-slate-800',
    text: 'text-rose-600 dark:text-rose-400',
    dot: 'bg-rose-500',
    icon: XCircle,
  },
  incomplete: {
    label: 'Thiếu DL',
    bg: 'bg-slate-50 dark:bg-slate-800',
    text: 'text-slate-600 dark:text-slate-400',
    dot: 'bg-slate-400',
    icon: HelpCircle,
  },
  off: {
    label: 'Cuối tuần',
    bg: 'bg-transparent',
    text: 'text-slate-400',
    dot: 'bg-slate-300',
    icon: AlertCircle,
  },
  holiday: {
    label: 'Nghỉ lễ',
    bg: 'bg-rose-50 dark:bg-rose-950/30',
    text: 'text-rose-500',
    dot: 'bg-rose-400',
    icon: AlertCircle,
  },
}

const summary = computed(() => {
  const working = mockLogs.filter((l) => l.status !== 'off' && l.status !== 'holiday')
  return {
    present: working.filter((l) => l.status === 'present').length,
    late: working.filter((l) => l.status === 'late').length,
    absent: working.filter((l) => l.status === 'absent').length,
    incomplete: working.filter((l) => l.status === 'incomplete').length,
  }
})

// Selected log row for mobile detail
const expandedRow = ref<string | null>(null)
const toggleRow = (date: string) => {
  expandedRow.value = expandedRow.value === date ? null : date
}
</script>

<template>
  <div class="min-h-screen space-y-4 px-4 py-4 sm:px-6 sm:py-6">
    <!-- Header + Month Nav -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-base font-black text-slate-900 dark:text-white">Bảng công của tôi</h1>
        <p class="text-[10px] uppercase font-bold tracking-widest text-slate-400">Lịch sử chi tiết</p>
      </div>
      <div
        class="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 dark:border-slate-800 dark:bg-slate-900"
      >
        <button
          @click="prevMonth"
          class="rounded p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <ChevronLeft class="h-4 w-4" />
        </button>
        <span
          class="min-w-[100px] text-center text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white"
          >{{ monthLabel }}</span
        >
        <button
          @click="nextMonth"
          class="rounded p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <ChevronRight class="h-4 w-4" />
        </button>
      </div>
    </div>

    <!-- Summary strip: simplified -->
    <div class="grid grid-cols-4 gap-2 sm:flex sm:gap-4">
      <div
        class="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex-1"
      >
        <p class="text-[8px] font-black uppercase tracking-widest text-slate-400">Đúng giờ</p>
        <p class="text-xl font-black text-slate-900 dark:text-white">{{ summary.present }}</p>
      </div>
      <div
        class="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex-1"
      >
        <p class="text-[8px] font-black uppercase tracking-widest text-slate-400">Đi muộn</p>
        <p class="text-xl font-black text-amber-500">{{ summary.late }}</p>
      </div>
      <div
        class="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex-1"
      >
        <p class="text-[8px] font-black uppercase tracking-widest text-slate-400">Vắng mặt</p>
        <p class="text-xl font-black text-rose-500">{{ summary.absent }}</p>
      </div>
      <div
        class="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex-1"
      >
        <p class="text-[8px] font-black uppercase tracking-widest text-slate-400">Thiếu DL</p>
        <p class="text-xl font-black text-slate-400">{{ summary.incomplete }}</p>
      </div>
    </div>

    <!-- Mobile: Minimal Card List -->
    <div class="block sm:hidden space-y-2">
      <div
        v-for="log in mockLogs"
        :key="log.date"
        @click="log.status !== 'off' && toggleRow(log.date)"
        :class="[
          'rounded-lg border bg-white transition-all dark:bg-slate-900',
          log.status === 'off'
            ? 'border-slate-100 dark:border-slate-800 opacity-60'
            : 'border-slate-200 dark:border-slate-800 active:scale-[0.99] cursor-pointer shadow-sm',
          expandedRow === log.date ? 'ring-1 ring-slate-400' : '',
        ]"
      >
        <div class="flex items-center gap-4 px-4 py-3">
          <div class="flex flex-col items-center shrink-0 w-8">
            <p class="text-sm font-black text-slate-900 dark:text-white">
              {{ log.date.split('/')[0] }}
            </p>
            <p class="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{{ log.dayLabel }}</p>
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <p class="text-sm font-bold text-slate-700 dark:text-white">{{ log.shift }}</p>
              <div :class="['h-2 w-2 rounded-full', statusConfig[log.status].dot]"></div>
            </div>
            <div class="mt-1 flex items-center gap-4 font-mono text-[11px] text-slate-400">
              <span>{{ log.checkIn ?? '--:--' }}</span>
              <span class="text-slate-200 dark:text-slate-700">•</span>
              <span>{{ log.checkOut ?? '--:--' }}</span>
            </div>
          </div>

          <RouterLink
            v-if="log.status === 'incomplete' || log.status === 'absent'"
            to="/my/requests"
            @click.stop
            class="shrink-0 rounded p-2 text-slate-300 hover:text-indigo-500"
          >
            <FileText class="h-4 w-4" />
          </RouterLink>
        </div>
      </div>
    </div>

    <!-- Desktop: Minimal Table -->
    <div
      class="hidden sm:block rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden dark:border-slate-800 dark:bg-slate-900"
    >
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="border-b border-slate-100 bg-slate-50/30 dark:border-slate-800">
              <th class="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Ngày</th>
              <th class="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Ca làm</th>
              <th class="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Giờ vào</th>
              <th class="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Giờ ra</th>
              <th class="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Trạng thái</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr
              v-for="log in mockLogs"
              :key="log.date"
              :class="[
                'transition-colors hover:bg-slate-50/30 dark:hover:bg-slate-800/30',
                log.status === 'off' ? 'bg-slate-50/50 dark:bg-slate-800/20' : '',
              ]"
            >
              <td class="px-5 py-3">
                <p class="text-sm font-black text-slate-900 dark:text-white">{{ log.date }}</p>
                <p class="text-[9px] font-bold text-slate-400 uppercase">{{ log.dayLabel }}</p>
              </td>
              <td class="px-5 py-3">
                <p class="text-sm font-medium text-slate-600 dark:text-slate-300">{{ log.shift }}</p>
              </td>
              <td class="px-5 py-3 font-mono text-xs text-slate-500">{{ log.checkIn ?? '—' }}</td>
              <td class="px-5 py-3 font-mono text-xs text-slate-500">{{ log.checkOut ?? '—' }}</td>
              <td class="px-5 py-3">
                <span :class="['text-xs font-bold', statusConfig[log.status].text]">
                  {{ statusConfig[log.status].label }}
                  <span v-if="log.lateMinutes" class="text-[10px]"> ({{ log.lateMinutes }}ph)</span>
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
