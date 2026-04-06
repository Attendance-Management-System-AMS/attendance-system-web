<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock,
  ClipboardList,
  Coffee,
  FileText,
  LogIn,
  LogOut,
  Star,
  TrendingUp,
} from 'lucide-vue-next'

const now = ref(new Date())
let timer: number | undefined
onMounted(() => (timer = window.setInterval(() => (now.value = new Date()), 1000)))
onUnmounted(() => clearInterval(timer))

const timeString = computed(() =>
  new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(now.value),
)
const dateString = computed(() =>
  new Intl.DateTimeFormat('vi-VN', { weekday: 'short', day: '2-digit', month: 'long' }).format(now.value),
)

const employee = { name: 'Nguyễn Văn An', code: 'NV001', position: 'Kỹ sư phần mềm', department: 'Phòng Công nghệ', avatar: 'A' }
const todayShift = { name: 'Ca hành chính', startTime: '08:00', endTime: '17:00', breakTime: '12:00 - 13:00' }
const todayAttendance = { checkIn: '08:05', checkOut: null as string | null, lateMinutes: 5 }
const monthSummary = { workedDays: 18, totalDays: 22, totalHours: 142.5, lateCount: 2, leaveUsed: 1, leaveBalance: 11 }

const weekDays = [
  { label: 'T2', date: '31', status: 'present' },
  { label: 'T3', date: '1', status: 'present' },
  { label: 'T4', date: '2', status: 'late' },
  { label: 'T5', date: '3', status: 'present' },
  { label: 'T6', date: '4', status: 'present' },
  { label: 'T7', date: '5', status: 'off' },
  { label: 'CN', date: '6', status: 'today' },
]

const recentNotifications = [
  { type: 'success', message: 'Đơn nghỉ phép ngày 10/04 đã được duyệt.', time: '2 giờ trước' },
  { type: 'warning', message: 'Bạn đi trễ 5 phút ngày 02/04.', time: 'Hôm qua' },
  { type: 'info', message: 'Lịch làm việc tháng 5 đã cập nhật.', time: '3 ngày trước' },
]

const quickActions = [
  { label: 'Lịch của tôi', icon: CalendarDays, to: '/my/schedule', bg: 'bg-indigo-100 dark:bg-indigo-900/40', text: 'text-indigo-700 dark:text-indigo-300' },
  { label: 'Bảng công', icon: ClipboardList, to: '/my/attendance', bg: 'bg-emerald-100 dark:bg-emerald-900/40', text: 'text-emerald-700 dark:text-emerald-300' },
  { label: 'Gửi đơn từ', icon: FileText, to: '/my/requests', bg: 'bg-amber-100 dark:bg-amber-900/40', text: 'text-amber-700 dark:text-amber-300' },
]

const statusDotColor: Record<string, string> = {
  present: 'bg-emerald-500',
  late: 'bg-amber-400',
  absent: 'bg-rose-500',
  off: 'bg-slate-200 dark:bg-slate-700',
  today: 'bg-indigo-600 ring-2 ring-indigo-300 dark:ring-indigo-700',
}
</script>

<template>
  <div class="min-h-screen space-y-4 px-4 py-4 sm:px-6 sm:py-6">

    <!-- Hero Card: Employee + Shift + Clock merged on mobile -->
    <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-5 text-white shadow-xl dark:shadow-none">
      <div class="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
      <div class="pointer-events-none absolute -bottom-6 right-10 h-24 w-24 rounded-full bg-white/10" />

      <!-- Top row: Avatar + Name + Clock -->
      <div class="relative flex items-start justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-lg font-black backdrop-blur-sm">
            {{ employee.avatar }}
          </div>
          <div>
            <p class="text-[10px] font-bold uppercase tracking-widest text-indigo-200">{{ employee.code }}</p>
            <p class="text-base font-black leading-tight">{{ employee.name }}</p>
            <p class="text-xs text-indigo-200">{{ employee.position }}</p>
          </div>
        </div>
        <div class="text-right shrink-0">
          <p class="font-mono text-xl font-black tabular-nums">{{ timeString }}</p>
          <p class="text-[10px] text-indigo-200">{{ dateString }}</p>
        </div>
      </div>

      <!-- Divider -->
      <div class="relative my-4 border-t border-white/20" />

      <!-- Shift + Check-in info -->
      <div class="relative flex items-end justify-between gap-3">
        <div>
          <p class="text-[10px] font-bold uppercase tracking-widest text-indigo-200">Ca hôm nay</p>
          <p class="text-lg font-black">{{ todayShift.name }}</p>
          <div class="mt-1.5 flex flex-wrap gap-3">
            <span class="flex items-center gap-1 text-sm"><LogIn class="h-3.5 w-3.5 text-indigo-300" />{{ todayShift.startTime }}</span>
            <span class="flex items-center gap-1 text-sm"><LogOut class="h-3.5 w-3.5 text-indigo-300" />{{ todayShift.endTime }}</span>
            <span class="flex items-center gap-1 text-xs text-indigo-200"><Coffee class="h-3 w-3" />{{ todayShift.breakTime }}</span>
          </div>
        </div>
        <div class="shrink-0 rounded-2xl bg-white/20 px-4 py-2.5 text-center backdrop-blur-sm">
          <p class="text-[10px] text-indigo-200">Chấm vào</p>
          <p class="font-mono text-xl font-black">{{ todayAttendance.checkIn ?? '--:--' }}</p>
          <p v-if="todayAttendance.lateMinutes > 0" class="text-[10px] text-amber-300">⚠ Muộn {{ todayAttendance.lateMinutes }}ph</p>
          <div v-if="!todayAttendance.checkOut" class="mt-1 flex items-center justify-center gap-1 text-[10px] text-emerald-300">
            <span class="relative flex h-1.5 w-1.5">
              <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
            </span>
            Đang làm
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions (3 columns, always) -->
    <div class="grid grid-cols-3 gap-3">
      <RouterLink
        v-for="action in quickActions"
        :key="action.to"
        :to="action.to"
        class="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm active:scale-95 transition-transform dark:border-slate-800 dark:bg-slate-900"
      >
        <div :class="['flex h-10 w-10 items-center justify-center rounded-xl', action.bg]">
          <component :is="action.icon" :class="['h-5 w-5', action.text]" />
        </div>
        <span class="text-center text-[11px] font-bold leading-tight text-slate-600 dark:text-slate-400">{{ action.label }}</span>
      </RouterLink>
    </div>

    <!-- Month Stats: 2x2 grid on mobile, 4 cols on wide -->
    <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div class="flex items-center gap-2 mb-2">
          <div class="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40"><CheckCircle2 class="h-3.5 w-3.5" /></div>
          <p class="text-[10px] font-bold uppercase text-slate-400">Ngày làm</p>
        </div>
        <p class="text-2xl font-black text-slate-900 dark:text-white">{{ monthSummary.workedDays }}</p>
        <div class="mt-2 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800">
          <div class="h-1.5 rounded-full bg-emerald-500 transition-all" :style="{ width: `${(monthSummary.workedDays / monthSummary.totalDays) * 100}%` }"></div>
        </div>
        <p class="mt-1 text-[10px] text-slate-400">/ {{ monthSummary.totalDays }} ngày</p>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div class="flex items-center gap-2 mb-2">
          <div class="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40"><TrendingUp class="h-3.5 w-3.5" /></div>
          <p class="text-[10px] font-bold uppercase text-slate-400">Giờ công</p>
        </div>
        <p class="text-2xl font-black text-slate-900 dark:text-white">{{ monthSummary.totalHours }}<span class="text-sm text-slate-400">h</span></p>
        <p class="mt-1 text-[10px] text-slate-400">Tháng này</p>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div class="flex items-center gap-2 mb-2">
          <div class="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/40"><Clock class="h-3.5 w-3.5" /></div>
          <p class="text-[10px] font-bold uppercase text-slate-400">Đi muộn</p>
        </div>
        <p class="text-2xl font-black text-amber-600">{{ monthSummary.lateCount }}</p>
        <p class="mt-1 text-[10px] text-slate-400">lần tháng này</p>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div class="flex items-center gap-2 mb-2">
          <div class="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-900/40"><Star class="h-3.5 w-3.5" /></div>
          <p class="text-[10px] font-bold uppercase text-slate-400">Phép còn</p>
        </div>
        <p class="text-2xl font-black text-violet-600">{{ monthSummary.leaveBalance }}</p>
        <p class="mt-1 text-[10px] text-slate-400">đã dùng {{ monthSummary.leaveUsed }}</p>
      </div>
    </div>

    <!-- Week strip -->
    <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p class="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Tuần này</p>
      <div class="grid grid-cols-7 gap-1">
        <div v-for="day in weekDays" :key="day.label" class="flex flex-col items-center gap-1">
          <span class="text-[9px] font-bold" :class="['T7','CN'].includes(day.label) ? 'text-rose-400' : 'text-slate-400'">{{ day.label }}</span>
          <div :class="['flex h-9 w-9 items-center justify-center rounded-xl text-[11px] font-black text-white', statusDotColor[day.status]]">
            <CheckCircle2 v-if="day.status === 'present'" class="h-4 w-4" />
            <Clock v-else-if="day.status === 'late'" class="h-4 w-4" />
            <span v-else :class="day.status === 'today' ? 'text-white' : 'text-slate-400 dark:text-slate-500'">{{ day.date }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Notifications -->
    <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p class="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Thông báo gần đây</p>
      <div class="divide-y divide-slate-100 dark:divide-slate-800">
        <div v-for="notif in recentNotifications" :key="notif.message" class="flex gap-3 py-3 first:pt-0 last:pb-0">
          <div class="mt-0.5 shrink-0">
            <CheckCircle2 v-if="notif.type === 'success'" class="h-4 w-4 text-emerald-500" />
            <AlertCircle v-else-if="notif.type === 'warning'" class="h-4 w-4 text-amber-500" />
            <AlertCircle v-else class="h-4 w-4 text-indigo-500" />
          </div>
          <div class="min-w-0">
            <p class="text-sm text-slate-700 dark:text-slate-300">{{ notif.message }}</p>
            <p class="text-[10px] text-slate-400">{{ notif.time }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
