<script setup lang="ts">
import { Search } from 'lucide-vue-next'

defineProps<{
  placeholder?: string
  modelValue: string
}>()

defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()
</script>

<template>
  <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
    <!-- Search input -->
    <div class="relative flex-1 max-w-sm">
      <Search
        class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
      />
      <input
        :value="modelValue"
        type="text"
        :placeholder="placeholder ?? 'Tìm kiếm...'"
        class="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-indigo-500"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
    </div>

    <!-- Filters slot -->
    <div v-if="$slots.filters" class="flex items-center gap-2 flex-wrap">
      <slot name="filters" />
    </div>
  </div>
</template>
