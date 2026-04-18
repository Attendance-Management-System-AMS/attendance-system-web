<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    mode?: 'block' | 'row'
    isLoading?: boolean
    isError?: boolean
    error?: unknown
    colspan?: number
    loadingText?: string
    errorText?: string
    retryLabel?: string
  }>(),
  {
    mode: 'block',
    isLoading: false,
    isError: false,
    colspan: 1,
    loadingText: 'Đang tải...',
    errorText: 'Không thể tải dữ liệu',
    retryLabel: 'Thử lại',
  },
)

const emit = defineEmits<{
  (e: 'retry'): void
}>()

const resolvedErrorText = computed(() => {
  if (props.error && typeof props.error === 'object' && 'message' in props.error) {
    const msg = (props.error as { message?: unknown }).message
    return String(msg ?? props.errorText)
  }
  return props.errorText
})
</script>

<template>
  <!-- Loading -->
  <tr v-if="mode === 'row' && isLoading">
    <td :colspan="colspan" class="px-4 py-12 text-center text-secondary-text">
      {{ loadingText }}
    </td>
  </tr>

  <div v-else-if="mode === 'block' && isLoading" class="py-12 text-center text-secondary-text">
    {{ loadingText }}
  </div>

  <!-- Error -->
  <tr v-else-if="mode === 'row' && isError">
    <td :colspan="colspan" class="px-4 py-12 text-center text-destructive">
      <div class="mb-2">{{ resolvedErrorText }}</div>
      <button
        class="font-medium text-primary underline hover:brightness-110"
        type="button"
        @click="emit('retry')"
      >
        {{ retryLabel }}
      </button>
    </td>
  </tr>

  <div v-else-if="mode === 'block' && isError" class="py-12 text-center text-destructive">
    <div class="mb-2">{{ resolvedErrorText }}</div>
    <button
      class="font-medium text-primary underline hover:brightness-110"
      type="button"
      @click="emit('retry')"
    >
      {{ retryLabel }}
    </button>
  </div>
</template>
