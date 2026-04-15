<script setup lang="ts">
import { type Component } from 'vue'

defineProps<{
  title: string
  icon?: Component
}>()
</script>

<template>
  <div
    class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
  >
    <div
      v-if="title"
      class="mb-5 flex items-center gap-2.5 border-b border-slate-100 pb-4 dark:border-slate-800"
    >
      <div
        v-if="icon"
        class="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950"
      >
        <component :is="icon" class="h-4 w-4 text-indigo-600" />
      </div>
      <h3 class="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
        {{ title }}
      </h3>
    </div>
    <slot />
  </div>
</template>
