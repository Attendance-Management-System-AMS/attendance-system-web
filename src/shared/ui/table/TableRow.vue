<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/shared/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <tr
    :class="
      cn(
        'border-b border-slate-200 transition-colors hover:bg-slate-50 data-[state=selected]:bg-slate-100',
        props.class,
      )
    "
  >
    <slot />
  </tr>
</template>
