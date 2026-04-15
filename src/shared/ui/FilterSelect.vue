<script setup lang="ts">
import { ChevronDown } from 'lucide-vue-next'

defineProps<{
  label: string
  options: { label: string; value: string }[]
  modelValue: string
}>()

defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()
</script>

<template>
  <div class="relative">
    <select
      :value="modelValue"
      class="h-10 appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-3 pr-8 text-sm font-medium text-slate-600 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option value="">Tất cả {{ label }}</option>
      <option v-for="opt in options" :key="opt.value" :value="opt.value">
        {{ opt.label }}
      </option>
    </select>
    <ChevronDown
      class="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
    />
  </div>
</template>
