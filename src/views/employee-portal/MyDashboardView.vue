<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { AlertCircle, CheckCircle2, Clock, TrendingUp, Star } from 'lucide-vue-next'

const now = ref(new Date())
let timer: number | undefined
onMounted(() => (timer = window.setInterval(() => (now.value = new Date()), 1000)))
onUnmounted(() => clearInterval(timer))


const monthSummary = {
  workedDays: 18,
  totalDays: 22,
  totalHours: 142.5,
  lateCount: 2,
  leaveUsed: 1,
  leaveBalance: 11,
}

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
    <!-- Month Stats: 2x2 grid on mobile, 4 cols on wide -->
    <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div
        class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <div class="flex items-center gap-2 mb-2">
          <div
            class="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40"
          >
            <CheckCircle2 class="h-3.5 w-3.5" />
          </div>
          <p class="text-[10px] font-bold uppercase text-slate-400">Ngày làm</p>
        </div>
        <p class="text-2xl font-black text-slate-900 dark:text-white">
          {{ monthSummary.workedDays }}
        </p>
        <div class="mt-2 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            class="h-1.5 rounded-full bg-emerald-500 transition-all"
            :style="{ width: `${(monthSummary.workedDays / monthSummary.totalDays) * 100}%` }"
          ></div>
        </div>
        <p class="mt-1 text-[10px] text-slate-400">/ {{ monthSummary.totalDays }} ngày</p>
      </div>

      <div
        class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <div class="flex items-center gap-2 mb-2">
          <div
            class="flex h-7 w-7 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40"
          >
            <TrendingUp class="h-3.5 w-3.5" />
          </div>
          <p class="text-[10px] font-bold uppercase text-slate-400">Giờ công</p>
        </div>
        <p class="text-2xl font-black text-slate-900 dark:text-white">
          {{ monthSummary.totalHours }}<span class="text-sm text-slate-400">h</span>
        </p>
        <p class="mt-1 text-[10px] text-slate-400">Tháng này</p>
      </div>

      <div
        class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <div class="flex items-center gap-2 mb-2">
          <div
            class="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/40"
          >
            <Clock class="h-3.5 w-3.5" />
          </div>
          <p class="text-[10px] font-bold uppercase text-slate-400">Đi muộn</p>
        </div>
        <p class="text-2xl font-black text-amber-600">{{ monthSummary.lateCount }}</p>
        <p class="mt-1 text-[10px] text-slate-400">lần tháng này</p>
      </div>

      <div
        class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <div class="flex items-center gap-2 mb-2">
          <div
            class="flex h-7 w-7 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40"
          >
            <Star class="h-3.5 w-3.5" />
          </div>
          <p class="text-[10px] font-bold uppercase text-slate-400">Phép còn</p>
        </div>
        <p class="text-2xl font-black text-indigo-600">{{ monthSummary.leaveBalance }}</p>
        <p class="mt-1 text-[10px] text-slate-400">đã dùng {{ monthSummary.leaveUsed }}</p>
      </div>
    </div>

    <!-- Week strip -->
    <div
      class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <p class="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Tuần này</p>
      <div class="grid grid-cols-7 gap-1">
        <div v-for="day in weekDays" :key="day.label" class="flex flex-col items-center gap-1">
          <span
            class="text-[9px] font-bold"
            :class="['T7', 'CN'].includes(day.label) ? 'text-rose-400' : 'text-slate-400'"
            >{{ day.label }}</span
          >
          <div
            :class="[
              'flex h-9 w-9 items-center justify-center rounded-xl text-[11px] font-black text-white',
              statusDotColor[day.status],
            ]"
          >
            <CheckCircle2 v-if="day.status === 'present'" class="h-4 w-4" />
            <Clock v-else-if="day.status === 'late'" class="h-4 w-4" />
            <span
              v-else
              :class="day.status === 'today' ? 'text-white' : 'text-slate-400 dark:text-slate-500'"
              >{{ day.date }}</span
            >
          </div>
        </div>
      </div>
    </div>

    <!-- Notifications -->
    <div
      class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <p class="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
        Thông báo gần đây
      </p>
      <div class="divide-y divide-slate-100 dark:divide-slate-800">
        <div
          v-for="notif in recentNotifications"
          :key="notif.message"
          class="flex gap-3 py-3 first:pt-0 last:pb-0"
        >
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
