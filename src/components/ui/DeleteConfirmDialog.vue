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
} from '@/components/ui/alert-dialog'
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
    <AlertDialogContent class="max-w-[425px] rounded-xl overflow-hidden p-0 border-none shadow-2xl">
      <div class="p-6">
        <AlertDialogHeader>
          <div class="flex items-center gap-4 mb-4">
            <div
              class="h-12 w-12 rounded-xl bg-rose-50 dark:bg-rose-950 flex items-center justify-center text-rose-600 shadow-sm border border-rose-100 dark:border-rose-900/50"
            >
              <AlertTriangle class="h-6 w-6" />
            </div>
            <div class="space-y-1">
              <AlertDialogTitle
                class="text-xl font-black text-slate-900 dark:text-white leading-tight"
              >
                {{ title }}
              </AlertDialogTitle>
              <AlertDialogDescription v-if="description" class="text-xs font-medium text-slate-500">
                {{ description }}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <div
          v-if="itemName"
          class="my-4 p-4 rounded-xl border border-dashed border-rose-200 bg-rose-50/30 dark:bg-rose-950/20 dark:border-rose-900/50"
        >
          <p class="text-xs font-black text-rose-700 dark:text-rose-400 uppercase tracking-tight">
            Đối tượng:
          </p>
          <p class="text-sm font-bold text-slate-700 dark:text-slate-200 mt-1">"{{ itemName }}"</p>
        </div>

        <p
          class="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed mt-4"
        >
          Cảnh báo: Hành động này không thể hoàn tác. Dữ liệu sẽ bị xóa khởi hệ thống vĩnh viễn.
        </p>
      </div>

      <AlertDialogFooter class="bg-slate-50/50 dark:bg-slate-900/50 p-6 flex flex-row gap-3">
        <AlertDialogCancel
          @click="handleCancel"
          class="flex-1 h-11 rounded-xl border-border bg-white text-sm font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 dark:bg-slate-800"
        >
          Hủy bỏ
        </AlertDialogCancel>
        <AlertDialogAction
          @click="handleConfirm"
          class="flex-1 h-11 rounded-xl bg-rose-600 font-black uppercase tracking-widest text-white shadow-lg shadow-rose-200 dark:shadow-none hover:bg-rose-700"
        >
          Xác nhận xóa
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
