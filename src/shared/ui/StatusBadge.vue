<script setup lang="ts">
import { computed } from 'vue'
import { Badge } from './badge'

const STATUS_CONFIG = {
  present: {
    class: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400',
    label: 'Đúng giờ',
  },
  late: {
    class: 'border-amber-500/20 bg-amber-500/10 text-amber-600 hover:bg-amber-500/10 dark:text-amber-400',
    label: 'Đi trễ',
  },
  absent: {
    class: 'border-rose-500/20 bg-rose-500/10 text-rose-600 hover:bg-rose-500/10 dark:text-rose-400',
    label: 'Vắng mặt',
  },
  working: {
    class: 'border-primary/20 bg-primary/10 text-primary hover:bg-primary/10',
    label: 'Đang làm',
  },
  leave: {
    class: 'border-border-standard bg-muted text-secondary-text hover:bg-muted',
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
      'rounded-lg px-2.5 py-0.5 text-[10px] font-semibold transition-none shadow-none',
      config.class,
    ]"
  >
    {{ customLabel ?? config.label }}
  </Badge>
</template>
