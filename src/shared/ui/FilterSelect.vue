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
      class="h-10 cursor-pointer appearance-none rounded-lg border border-border-standard bg-surface pl-3 pr-8 text-sm font-medium text-secondary-text transition-colors hover:border-border focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-ring/40"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option value="">Tất cả {{ label }}</option>
      <option v-for="opt in options" :key="opt.value" :value="opt.value">
        {{ opt.label }}
      </option>
    </select>
    <ChevronDown
      class="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-tertiary-text"
    />
  </div>
</template>
