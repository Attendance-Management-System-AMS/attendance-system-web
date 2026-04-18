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
        class="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-tertiary-text"
      />
      <Input
        :model-value="modelValue"
        type="text"
        :placeholder="placeholder ?? 'Tìm kiếm...'"
        class="h-10 rounded-lg bg-surface pl-10 transition-colors focus:bg-background"
        @update:model-value="(val) => $emit('update:modelValue', val as string)"
      />
    </div>

    <!-- Filters slot -->
    <div v-if="$slots.filters" class="flex items-center gap-2 flex-wrap">
      <slot name="filters" />
    </div>
  </div>
</template>
