<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/shared/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <tfoot :class="cn('border-t border-slate-200 bg-slate-50 font-medium', props.class)">
    <slot />
  </tfoot>
</template>
