<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <div class="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between mb-6">
    <div>
      <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
        {{ title }}
      </h1>
      <p v-if="description" class="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {{ description }}
      </p>
    </div>
    <div v-if="$slots.actions" class="flex shrink-0 items-center gap-2 mt-3 sm:mt-0">
      <slot name="actions" />
    </div>
  </div>
</template>
