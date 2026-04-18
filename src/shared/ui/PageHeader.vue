<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <div
    class="mb-6 flex flex-col gap-1 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between"
  >
    <div>
      <h1 class="text-2xl font-semibold tracking-normal leading-tight text-primary-text">
        {{ title }}
      </h1>
      <p v-if="description" class="mt-2 text-sm font-medium leading-6 text-secondary-text">
        {{ description }}
      </p>
    </div>
    <div v-if="$slots.actions" class="flex shrink-0 items-center gap-2 mt-3 sm:mt-0">
      <slot name="actions" />
    </div>
  </div>
</template>
