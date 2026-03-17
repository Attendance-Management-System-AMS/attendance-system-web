<script setup lang="ts">
import { AlertTriangle } from 'lucide-vue-next'

const props = defineProps<{
  open: boolean
  title: string
  description?: string
  itemName?: string
}>()

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="props.open"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="emit('cancel')"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"></div>

        <!-- Dialog -->
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-4"
          enter-to-class="opacity-100 scale-100 translate-y-0"
        >
          <div
            v-if="props.open"
            class="relative w-full max-w-[425px] rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20 dark:bg-slate-900 dark:border-slate-800"
          >
            <!-- Header -->
            <div class="p-6 pb-0">
              <div class="flex items-start gap-4">
                <div
                  class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-50 dark:bg-rose-950"
                >
                  <AlertTriangle class="h-6 w-6 text-rose-600" />
                </div>
                <div class="flex-1 pt-1">
                  <h2 class="text-base font-bold text-slate-900 dark:text-white">{{ title }}</h2>
                  <p v-if="description" class="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {{ description }}
                  </p>
                </div>
              </div>

              <div
                v-if="itemName"
                class="mt-4 rounded-xl border border-rose-100 bg-rose-50/50 px-4 py-3 dark:border-rose-900 dark:bg-rose-950/50"
              >
                <p class="text-sm font-medium text-rose-700 dark:text-rose-400">
                  "{{ itemName }}"
                </p>
              </div>

              <p class="mt-4 text-xs text-slate-400">
                Hành động này không thể hoàn tác. Dữ liệu sẽ bị xóa vĩnh viễn.
              </p>
            </div>

            <!-- Actions -->
            <div class="flex justify-end gap-3 p-6 pt-5">
              <button
                @click="emit('cancel')"
                class="h-10 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                Hủy bỏ
              </button>
              <button
                @click="emit('confirm')"
                class="h-10 rounded-xl bg-rose-600 px-4 text-sm font-semibold text-white shadow-lg shadow-rose-200 hover:bg-rose-700 transition-colors dark:shadow-none"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
