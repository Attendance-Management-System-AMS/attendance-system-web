<script setup lang="ts">
import { computed } from 'vue'
import { Badge } from './badge'

const STATUS_CONFIG = {
  present: {
    class: 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900',
    label: 'Đúng giờ',
  },
  late: {
    class: 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900',
    label: 'Đi trễ',
  },
  absent: {
    class: 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-50 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900',
    label: 'Vắng mặt',
  },
  working: {
    class: 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-50 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900',
    label: 'Đang làm',
  },
  leave: {
    class: 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
    label: 'Nghỉ phép',
  },
} as const

const props = defineProps<{
  status: keyof typeof STATUS_CONFIG
  customLabel?: string
}>()

const config = computed(() => STATUS_CONFIG[props.status] ?? STATUS_CONFIG.leave)
</script>

<template>
  <Badge
    variant="outline"
    :class="[
      'rounded-full px-2.5 py-0.5 text-[10px] font-bold transition-none shadow-none',
      config.class,
    ]"
  >
    {{ customLabel ?? config.label }}
  </Badge>
</template>
