<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <div
    class="mb-6 flex flex-col gap-1 border-b border-slate-200/70 pb-5 sm:flex-row sm:items-start sm:justify-between dark:border-slate-800/80"
  >
    <div>
      <h1 class="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none dark:text-white">
        {{ title }}
      </h1>
      <p v-if="description" class="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
        {{ description }}
      </p>
    </div>
    <div v-if="$slots.actions" class="flex shrink-0 items-center gap-2 mt-3 sm:mt-0">
      <slot name="actions" />
    </div>
  </div>
</template>
