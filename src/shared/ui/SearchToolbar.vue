<script setup lang="ts">
import { Search } from 'lucide-vue-next'
import { Input } from './input'

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
        class="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400"
      />
      <Input
        :model-value="modelValue"
        type="text"
        :placeholder="placeholder ?? 'Tìm kiếm...'"
        class="pl-10 h-10 rounded-xl bg-slate-50 focus:bg-white dark:bg-slate-800 transition-all"
        @update:model-value="(val) => $emit('update:modelValue', val as string)"
      />
    </div>

    <!-- Filters slot -->
    <div v-if="$slots.filters" class="flex items-center gap-2 flex-wrap">
      <slot name="filters" />
    </div>
  </div>
</template>
