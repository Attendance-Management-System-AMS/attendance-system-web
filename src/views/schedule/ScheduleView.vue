<script setup lang="ts">
import { computed, ref } from 'vue'
import { CalendarRange, ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-vue-next'
import PageHeader from '@/components/ui/PageHeader.vue'

interface ShiftBlock {
  id: string | number
  date: string // YYYY-MM-DD
  title: string
  time: string
  place: string
  tone: 'indigo' | 'teal' | 'violet' | 'amber'
}

const startOfWeekMonday = (date: Date) => {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const day = d.getDay() // 0 Sun ... 6 Sat
  const diff = (day === 0 ? -6 : 1) - day
  d.setDate(d.getDate() + diff)
  return d
}

const addDays = (date: Date, days: number) => {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

const fmtYmd = (date: Date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

const fmtDayLabel = (date: Date) =>
  new Intl.DateTimeFormat('vi-VN', { weekday: 'short' }).format(date).replace('.', '')

const fmtMonthYear = (date: Date) =>
  new Intl.DateTimeFormat('vi-VN', { month: 'long', year: 'numeric' }).format(date)

const weekOffset = ref(0)
const todayYmd = fmtYmd(new Date())

const weekStart = computed(() => addDays(startOfWeekMonday(new Date()), weekOffset.value * 7))
const weekDays = computed(() =>
  Array.from({ length: 7 }).map((_, i) => {
    const d = addDays(weekStart.value, i)
    return {
      dateObj: d,
      ymd: fmtYmd(d),
      dayLabel: fmtDayLabel(d),
      dayNumber: d.getDate(),
      isToday: fmtYmd(d) === todayYmd,
    }
  }),
)

const weekLabel = computed(() => fmtMonthYear(weekStart.value))
const weekRangeLabel = computed(() => {
  const from = weekStart.value
  const to = addDays(weekStart.value, 6)
  const fromStr = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit' }).format(from)
  const toStr = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit' }).format(to)
  return `${fromStr} → ${toStr}`
})

const seedDate = computed(() => weekDays.value[0]?.ymd ?? todayYmd)
const blocks = computed<ShiftBlock[]>(() => {
  const monday = new Date(seedDate.value)
  return [
    {
      id: 1,
      date: fmtYmd(addDays(monday, 0)),
      title: 'Ca sáng · Văn phòng',
      time: '08:00 – 17:00',
      place: 'Tầng 3 · Hà Nội',
      tone: 'indigo',
    },
    {
      id: 2,
      date: fmtYmd(addDays(monday, 1)),
      title: 'Họp phòng IT',
      time: '09:00 – 10:30',
      place: 'Phòng họp B',
      tone: 'violet',
    },
    {
      id: 3,
      date: fmtYmd(addDays(monday, 2)),
      title: 'Ca sáng · Văn phòng',
      time: '08:00 – 17:00',
      place: 'Tầng 3 · Hà Nội',
      tone: 'indigo',
    },
    {
      id: 4,
      date: fmtYmd(addDays(monday, 3)),
      title: 'Làm việc remote',
      time: 'Cả ngày',
      place: '—',
      tone: 'teal',
    },
    {
      id: 5,
      date: fmtYmd(addDays(monday, 4)),
      title: 'Ca chiều',
      time: '13:00 – 17:00',
      place: 'Tầng 3 · Hà Nội',
      tone: 'amber',
    },
  ]
})

const toneClass: Record<ShiftBlock['tone'], string> = {
  indigo: 'border-l-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/40',
  teal: 'border-l-teal-500 bg-teal-50/80 dark:bg-teal-950/40',
  violet: 'border-l-violet-500 bg-violet-50/80 dark:bg-violet-950/40',
  amber: 'border-l-amber-500 bg-amber-50/80 dark:bg-amber-950/40',
}

const selectedDate = ref<string>(todayYmd)
const selectedBlocks = computed(() => blocks.value.filter((b) => b.date === selectedDate.value))
const blocksCountByDate = computed(() => {
  const map = new Map<string, number>()
  for (const b of blocks.value) map.set(b.date, (map.get(b.date) ?? 0) + 1)
  return map
})
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      title="Lịch làm việc"
      :description="`Xem nhanh ca và sự kiện — ${weekLabel}`"
    />

    <div class="grid gap-6 lg:grid-cols-3">
      <section
        class="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6"
      >
        <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div class="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
              <CalendarRange class="h-5 w-5 text-indigo-500" />
              Tuần · {{ weekRangeLabel }}
            </div>
            <p class="mt-1 text-xs text-slate-500">Chọn 1 ngày để xem chi tiết bên phải</p>
          </div>

          <div class="flex items-center gap-2">
            <button
              type="button"
              @click="weekOffset -= 1"
              class="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              <ChevronLeft class="h-4 w-4" />
              Trước
            </button>
            <button
              type="button"
              @click="weekOffset = 0"
              class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              Hôm nay
            </button>
            <button
              type="button"
              @click="weekOffset += 1"
              class="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              Sau
              <ChevronRight class="h-4 w-4" />
            </button>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          <button
            v-for="d in weekDays"
            :key="d.ymd"
            type="button"
            @click="selectedDate = d.ymd"
            :class="[
              'group relative overflow-hidden rounded-2xl border p-3 text-left transition-colors',
              selectedDate === d.ymd
                ? 'border-indigo-200 bg-indigo-50 dark:border-indigo-900 dark:bg-indigo-950/40'
                : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/30 dark:hover:bg-slate-800/50',
            ]"
          >
            <div class="flex items-start justify-between gap-2">
              <div>
                <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {{ d.dayLabel }}
                  <span v-if="d.isToday" class="ml-1 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] text-emerald-700">
                    Hôm nay
                  </span>
                </p>
                <p class="mt-1 text-xl font-black text-slate-900 dark:text-white">{{ d.dayNumber }}</p>
              </div>

              <span
                v-if="(blocksCountByDate.get(d.ymd) ?? 0) > 0"
                class="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-slate-900 px-2 text-[10px] font-bold text-white dark:bg-white dark:text-slate-900"
              >
                {{ blocksCountByDate.get(d.ymd) }}
              </span>
            </div>

            <div class="mt-3 space-y-1">
              <div
                v-for="b in blocks.filter((x) => x.date === d.ymd).slice(0, 2)"
                :key="b.id"
                :class="[
                  'rounded-xl border-l-4 px-2.5 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200',
                  toneClass[b.tone],
                ]"
              >
                <div class="truncate">{{ b.title }}</div>
                <div class="mt-1 text-[11px] font-medium text-slate-600 dark:text-slate-400">{{ b.time }}</div>
              </div>
              <p
                v-if="(blocksCountByDate.get(d.ymd) ?? 0) > 2"
                class="text-[11px] font-medium text-slate-500"
              >
                +{{ (blocksCountByDate.get(d.ymd) ?? 0) - 2 }} sự kiện khác
              </p>
            </div>
          </button>
        </div>
      </section>

      <aside class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-bold uppercase tracking-wider text-slate-500">Chi tiết ngày</p>
            <p class="mt-1 text-lg font-bold text-slate-900 dark:text-white">
              {{ selectedDate }}
            </p>
            <p class="mt-1 text-xs text-slate-500">{{ weekLabel }}</p>
          </div>
        </div>

        <div class="mt-5 space-y-3">
          <div v-if="selectedBlocks.length === 0" class="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-800/30">
            Không có ca / sự kiện trong ngày này.
          </div>

          <article
            v-else
            v-for="b in selectedBlocks"
            :key="b.id"
            :class="[
              'flex flex-col gap-2 rounded-2xl border border-slate-100 pl-4 shadow-sm dark:border-slate-800',
              'border-l-4',
              toneClass[b.tone],
            ]"
          >
            <div class="py-4 pr-4">
              <h3 class="font-semibold text-slate-900 dark:text-white">{{ b.title }}</h3>
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
      </aside>
    </div>
  </div>
</template>
