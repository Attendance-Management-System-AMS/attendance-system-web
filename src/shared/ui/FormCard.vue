<script setup lang="ts">
import { type Component } from 'vue'

defineProps<{
  title: string
  icon?: Component
}>()
</script>

<template>
  <div
    class="rounded-lg border border-border-standard bg-card p-6 text-card-foreground shadow-sm"
  >
    <div
      v-if="title"
      class="mb-5 flex items-center gap-2.5 border-b border-border pb-4"
    >
      <div
        v-if="icon"
        class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10"
      >
        <component :is="icon" class="h-4 w-4 text-primary" />
      </div>
      <h3 class="text-sm font-semibold tracking-normal text-primary-text">
        {{ title }}
      </h3>
    </div>
    <slot />
  </div>
</template>
