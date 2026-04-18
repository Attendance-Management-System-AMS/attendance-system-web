<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: string
  thickness?: number
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  color: 'indigo',
  thickness: 3
})

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16'
}

const colorMap: Record<string, string> = {
  indigo: 'var(--primary)',
  primary: 'var(--primary)',
  emerald: 'oklch(0.65 0.18 160)',
  amber: 'oklch(0.72 0.17 80)',
  rose: 'oklch(0.62 0.22 20)',
}

const spinnerColor = computed(() => colorMap[props.color] ?? 'var(--primary)')
</script>

<template>
  <div class="relative inline-flex items-center justify-center">
    <!-- Outer ring / track -->
    <div 
      :class="[sizeClasses[props.size]]"
      class="rounded-full border-border/50"
      :style="{ borderWidth: `${props.thickness}px` }"
    ></div>
    
    <!-- Animated spinner -->
    <div 
      :class="[sizeClasses[props.size]]"
      class="absolute animate-spin rounded-full border-t-transparent"
      :style="{ borderWidth: `${props.thickness}px`, borderColor: spinnerColor, borderTopColor: 'transparent' }"
    ></div>
    
    <!-- Subtle glow effect for LG/XL -->
    <div 
      v-if="props.size === 'lg' || props.size === 'xl'"
      :class="[props.size === 'lg' ? 'h-8 w-8' : 'h-12 w-12']"
      class="absolute rounded-full blur-xl animate-pulse"
      :style="{ backgroundColor: 'color-mix(in oklch, ' + spinnerColor + ' 20%, transparent)' }"
    ></div>
  </div>
</template>

<style scoped>
.animate-spin {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
