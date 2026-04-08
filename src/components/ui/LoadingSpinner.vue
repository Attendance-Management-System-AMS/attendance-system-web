<script setup lang="ts">
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
</script>

<template>
  <div class="relative inline-flex items-center justify-center">
    <!-- Outer ring / track -->
    <div 
      :class="[sizeClasses[props.size]]"
      class="rounded-full border-slate-200/50 dark:border-slate-800/50"
      :style="{ borderWidth: `${props.thickness}px` }"
    ></div>
    
    <!-- Animated spinner -->
    <div 
      :class="[
        sizeClasses[props.size],
        `border-${props.color}-600`
      ]"
      class="absolute animate-spin rounded-full border-t-transparent"
      :style="{ borderWidth: `${props.thickness}px` }"
    ></div>
    
    <!-- Subtle glow effect for LG/XL -->
    <div 
      v-if="props.size === 'lg' || props.size === 'xl'"
      :class="[
        props.size === 'lg' ? 'h-8 w-8' : 'h-12 w-12',
        `bg-${props.color}-500/20`
      ]"
      class="absolute rounded-full blur-xl animate-pulse"
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
