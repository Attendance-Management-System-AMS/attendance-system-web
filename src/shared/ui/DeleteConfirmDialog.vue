<script setup lang="ts">
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/alert-dialog'
import { AlertTriangle } from 'lucide-vue-next'

defineProps<{
  open: boolean
  title: string
  description?: string
  itemName?: string
}>()

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

const handleConfirm = () => emit('confirm')
const handleCancel = () => emit('cancel')
</script>

<template>
  <AlertDialog :open="open" @update:open="(val) => !val && handleCancel()">
    <AlertDialogContent class="max-w-106.25 overflow-hidden rounded-lg border-none p-0 shadow-2xl">
      <div class="p-6">
        <AlertDialogHeader>
          <div class="flex items-center gap-4 mb-4">
            <div
              class="flex h-12 w-12 items-center justify-center rounded-lg border border-rose-500/20 bg-rose-500/10 text-rose-600 shadow-sm dark:text-rose-400"
            >
              <AlertTriangle class="h-6 w-6" />
            </div>
            <div class="space-y-1">
              <AlertDialogTitle
                class="text-xl font-semibold leading-tight text-primary-text"
              >
                {{ title }}
              </AlertDialogTitle>
              <AlertDialogDescription v-if="description" class="text-xs font-medium text-secondary-text">
                {{ description }}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <div
          v-if="itemName"
          class="my-4 rounded-lg border border-dashed border-rose-500/30 bg-rose-500/10 p-4"
        >
          <p class="text-xs font-semibold tracking-normal text-rose-600 dark:text-rose-400">
            Đối tượng:
          </p>
          <p class="mt-1 text-sm font-semibold text-primary-text">"{{ itemName }}"</p>
        </div>

        <p
          class="mt-4 text-[10px] font-medium leading-relaxed text-tertiary-text"
        >
          Cảnh báo: Hành động này không thể hoàn tác. Dữ liệu sẽ bị xóa khởi hệ thống vĩnh viễn.
        </p>
      </div>

      <AlertDialogFooter class="flex flex-row gap-3 bg-surface p-6">
        <AlertDialogCancel
          @click="handleCancel"
          class="h-11 flex-1 rounded-lg border-border bg-background text-sm font-semibold tracking-normal text-secondary-text hover:bg-elevated"
        >
          Hủy bỏ
        </AlertDialogCancel>
        <AlertDialogAction
          @click="handleConfirm"
          class="h-11 flex-1 rounded-lg bg-rose-600 font-semibold tracking-normal text-white shadow-lg shadow-rose-500/20 hover:bg-rose-700"
        >
          Xác nhận xóa
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
