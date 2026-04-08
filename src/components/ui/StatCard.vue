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
    indigo: { bg: 'bg-indigo-50', icon: 'text-indigo-600', dark: 'dark:bg-indigo-950' },
    emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', dark: 'dark:bg-emerald-950' },
    amber: { bg: 'bg-amber-50', icon: 'text-amber-600', dark: 'dark:bg-amber-950' },
    rose: { bg: 'bg-rose-50', icon: 'text-rose-600', dark: 'dark:bg-rose-950' },
    slate: { bg: 'bg-slate-100', icon: 'text-slate-600', dark: 'dark:bg-slate-800' },
  }
  return configs[props.color ?? 'indigo']
})

const changeColorClass = computed(() => {
  if (props.changeType === 'positive') return 'text-emerald-500'
  if (props.changeType === 'negative') return 'text-rose-500'
  return 'text-slate-400'
})
</script>

<template>
  <div
    class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow dark:border-slate-800 dark:bg-slate-900"
  >
    <div class="mb-3 flex items-center justify-between">
      <SkeletonLoader v-if="loading" width="60%" height="10px" rounded="full" />
      <span v-else class="text-[11px] font-bold uppercase tracking-wider text-slate-400">
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
      <div v-else class="text-2xl font-black text-slate-900 dark:text-white">{{ value }}</div>

      <SkeletonLoader v-if="loading" width="40px" height="40px" rounded="xl" className="shrink-0" />
      <div
        v-else
        :class="[
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
          colorConfig.bg,
          colorConfig.dark,
        ]"
      >
        <component :is="icon" :class="['h-5 w-5', colorConfig.icon]" />
      </div>
    </div>
  </div>
</template>
