<script setup lang="ts">
import type { Component } from 'vue'
import { computed } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface Props {
  title: string
  value: string | number
  description?: string
  icon: Component
  accent?: 'blue' | 'emerald' | 'amber' | 'rose'
}

const props = withDefaults(defineProps<Props>(), {
  accent: 'blue',
})

const accentClass = computed(() => {
  const map: Record<NonNullable<Props['accent']>, string> = {
    blue: 'bg-blue-500/10 text-blue-700',
    emerald: 'bg-emerald-500/10 text-emerald-700',
    amber: 'bg-amber-500/10 text-amber-700',
    rose: 'bg-rose-500/10 text-rose-700',
  }
  return map[props.accent]
})
</script>

<template>
  <Card class="border-slate-200">
    <CardHeader class="flex flex-row items-center justify-between">
      <div>
        <CardTitle class="text-sm font-medium text-slate-600">
          {{ title }}
        </CardTitle>
      </div>
      <div :class="cn('flex size-10 items-center justify-center rounded-full', accentClass)">
        <component :is="icon" class="size-5" />
      </div>
    </CardHeader>
    <CardContent class="space-y-1">
      <p class="text-2xl font-semibold text-slate-900">{{ value }}</p>
      <p v-if="description" class="text-xs text-slate-500">
        {{ description }}
      </p>
    </CardContent>
  </Card>
</template>
