<script setup lang="ts">
interface Props {
  width?: string
  height?: string
  circle?: boolean
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  className?: string
}

const props = withDefaults(defineProps<Props>(), {
  width: '100%',
  height: '1rem',
  circle: false,
  rounded: 'md',
  className: '',
})

const roundedClasses = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-xl',
  full: 'rounded-full',
}
</script>

<template>
  <div
    :class="[
      'relative overflow-hidden bg-slate-100 dark:bg-slate-800',
      props.circle ? 'rounded-full' : roundedClasses[props.rounded],
      props.className,
    ]"
    :style="{ width: props.width, height: props.height }"
  >
    <!-- Shimmer effect overlay -->
    <div class="shimmer-overlay"></div>
  </div>
</template>

<style scoped>
.shimmer-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.4) 50%,
    transparent 100%
  );
  animation: shimmer 1.5s infinite;
}

/* Dark mode adjustments */
:deep(.dark) .shimmer-overlay {
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.05) 50%,
    transparent 100%
  );
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}
</style>
