<script setup lang="ts">
import { computed } from 'vue'

const STATUS_CONFIG = {
  present: { class: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400', label: 'Đúng giờ' },
  late: { class: 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400', label: 'Đi trễ' },
  absent: { class: 'bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400', label: 'Vắng mặt' },
  working: { class: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400', label: 'Đang làm' },
  leave: { class: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400', label: 'Nghỉ phép' },
} as const

const props = defineProps<{
  status: keyof typeof STATUS_CONFIG
  customLabel?: string
}>()

const config = computed(() => STATUS_CONFIG[props.status] ?? STATUS_CONFIG.leave)
</script>

<template>
  <span
    :class="[
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold',
      config.class,
    ]"
  >
    {{ customLabel ?? config.label }}
  </span>
</template>
