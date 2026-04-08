<script setup lang="ts">
import LoadingSpinner from './LoadingSpinner.vue'

interface Props {
  show: boolean
  text?: string
  fullScreen?: boolean
  blur?: boolean
  transparent?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  text: 'Đang tải dữ liệu...',
  fullScreen: false,
  blur: true,
  transparent: false
})
</script>

<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="props.show"
      :class="[
        props.fullScreen ? 'fixed inset-0 z-100' : 'absolute inset-0 z-50 rounded-inherit',
        props.blur ? 'backdrop-blur-sm' : '',
        props.transparent ? 'bg-white/40 dark:bg-slate-900/40' : 'bg-white/80 dark:bg-slate-950/80',
        'flex flex-col items-center justify-center p-4 text-center'
      ]"
    >
      <div class="relative flex flex-col items-center gap-4">
        <!-- Spinner with a soft glowing background -->
        <div class="relative">
          <div class="absolute inset-0 scale-150 rounded-full bg-indigo-500/10 blur-2xl animate-pulse"></div>
          <LoadingSpinner size="lg" />
        </div>
        
        <p 
          v-if="props.text"
          class="text-sm font-bold tracking-wide text-slate-600 dark:text-slate-300 animate-pulse"
        >
          {{ props.text }}
        </p>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.rounded-inherit {
  border-radius: inherit;
}
</style>
