<script setup lang="ts">
import { computed } from 'vue'
import { CalendarRange, Clock, MapPin } from 'lucide-vue-next'
import PageHeader from '@/components/ui/PageHeader.vue'

interface ShiftBlock {
  day: string
  date: string
  title: string
  time: string
  place: string
  tone: 'indigo' | 'teal' | 'violet' | 'amber'
}

const weekLabel = computed(() => {
  const now = new Date()
  return new Intl.DateTimeFormat('vi-VN', { month: 'long', year: 'numeric' }).format(now)
})

const blocks: ShiftBlock[] = [
  {
    day: 'T2',
    date: '24',
    title: 'Ca sáng · Văn phòng',
    time: '08:00 – 17:30',
    place: 'Tầng 3 · Hà Nội',
    tone: 'indigo',
  },
  {
    day: 'T3',
    date: '25',
    title: 'Họp phòng IT',
    time: '09:00 – 10:30',
    place: 'Phòng họp B',
    tone: 'violet',
  },
  {
    day: 'T4',
    date: '26',
    title: 'Ca sáng · Văn phòng',
    time: '08:00 – 17:30',
    place: 'Tầng 3 · Hà Nội',
    tone: 'indigo',
  },
  {
    day: 'T5',
    date: '27',
    title: 'Làm việc remote',
    time: 'Cả ngày',
    place: '—',
    tone: 'teal',
  },
  {
    day: 'T6',
    date: '28',
    title: 'Ca chiều',
    time: '13:00 – 22:00',
    place: 'Tầng 3 · Hà Nội',
    tone: 'amber',
  },
]

const toneClass: Record<ShiftBlock['tone'], string> = {
  indigo: 'border-l-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/40',
  teal: 'border-l-teal-500 bg-teal-50/80 dark:bg-teal-950/40',
  violet: 'border-l-violet-500 bg-violet-50/80 dark:bg-violet-950/40',
  amber: 'border-l-amber-500 bg-amber-50/80 dark:bg-amber-950/40',
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      title="Lịch làm việc"
      :description="`Xem nhanh ca và sự kiện — ${weekLabel}`"
    />

    <div
      class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6"
    >
      <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
          <CalendarRange class="h-5 w-5 text-indigo-500" />
          Tuần hiện tại
        </div>
        <div class="flex gap-2">
          <button
            type="button"
            class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            ← Trước
          </button>
          <button
            type="button"
            class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            Sau →
          </button>
        </div>
      </div>

      <div class="grid gap-3 sm:grid-cols-5">
        <div
          v-for="b in blocks"
          :key="b.day + b.date"
          class="flex min-h-[120px] flex-col rounded-xl border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-800/30"
        >
          <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400">{{ b.day }}</p>
          <p class="text-lg font-bold text-slate-900 dark:text-white">{{ b.date }}</p>
        </div>
      </div>
    </div>

    <div>
      <h2 class="mb-3 text-sm font-bold uppercase tracking-wider text-slate-500">Chi tiết lịch</h2>
      <div class="space-y-3">
        <article
          v-for="b in blocks"
          :key="b.title + b.day"
          :class="[
            'flex flex-col gap-2 rounded-2xl border border-slate-100 pl-4 shadow-sm dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between',
            'border-l-4',
            toneClass[b.tone],
          ]"
        >
          <div class="py-4 pr-4">
            <p class="text-xs font-bold text-slate-500">{{ b.day }} · Tháng {{ weekLabel }}</p>
            <h3 class="mt-1 font-semibold text-slate-900 dark:text-white">{{ b.title }}</h3>
            <div class="mt-2 flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400">
              <span class="inline-flex items-center gap-1.5">
                <Clock class="h-4 w-4 text-slate-400" />
                {{ b.time }}
              </span>
              <span class="inline-flex items-center gap-1.5">
                <MapPin class="h-4 w-4 text-slate-400" />
                {{ b.place }}
              </span>
            </div>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>
