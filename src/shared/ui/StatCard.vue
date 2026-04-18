<script setup lang="ts">
import { computed, type Component } from 'vue'
import { TrendingUp, TrendingDown } from 'lucide-vue-next'
import SkeletonLoader from './SkeletonLoader.vue'

const props = defineProps<{
  label: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: Component
  color?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'slate'
  loading?: boolean
}>()

const colorConfig = computed(() => {
  const configs = {
    indigo: { bg: 'bg-primary/10', icon: 'text-primary' },
    emerald: { bg: 'bg-emerald-500/10', icon: 'text-emerald-500' },
    amber: { bg: 'bg-amber-500/10', icon: 'text-amber-500' },
    rose: { bg: 'bg-rose-500/10', icon: 'text-rose-500' },
    slate: { bg: 'bg-muted', icon: 'text-tertiary-text' },
  }
  return configs[props.color ?? 'indigo']
})

const changeColorClass = computed(() => {
  if (props.changeType === 'positive') return 'text-emerald-500'
  if (props.changeType === 'negative') return 'text-rose-500'
  return 'text-tertiary-text'
})
</script>

<template>
  <div
    class="rounded-lg border border-border-standard bg-card p-5 text-card-foreground shadow-sm transition-colors hover:bg-elevated"
  >
    <div class="mb-3 flex items-center justify-between">
      <SkeletonLoader v-if="loading" width="60%" height="10px" rounded="full" />
      <span v-else class="text-xs font-medium tracking-normal text-tertiary-text">
        {{ label }}
      </span>

      <SkeletonLoader v-if="loading" width="25%" height="10px" rounded="full" />
      <span
        v-else-if="change"
        :class="['flex items-center gap-0.5 text-[10px] font-bold', changeColorClass]"
      >
        <TrendingUp v-if="changeType === 'positive'" class="h-3 w-3" />
        <TrendingDown v-else-if="changeType === 'negative'" class="h-3 w-3" />
        {{ change }}
      </span>
    </div>

    <div class="flex items-end justify-between">
      <div v-if="loading" class="w-full">
        <SkeletonLoader width="40%" height="24px" rounded="lg" />
      </div>
      <div v-else class="text-2xl font-semibold text-primary-text tabular-nums">{{ value }}</div>

      <SkeletonLoader v-if="loading" width="40px" height="40px" rounded="xl" className="shrink-0" />
      <div
        v-else
        :class="[
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
          colorConfig.bg,
        ]"
      >
        <component :is="icon" :class="['h-5 w-5', colorConfig.icon]" />
      </div>
    </div>
  </div>
</template>
