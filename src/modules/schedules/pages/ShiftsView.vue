<script setup lang="ts">
import { computed, ref } from 'vue'
import { Timer, Plus, Loader2 } from 'lucide-vue-next'
import PageHeader from '@/shared/ui/PageHeader.vue'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import DataTable from '@/shared/ui/DataTable.vue'
import ActionDropdown from '@/shared/ui/ActionDropdown.vue'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/alert-dialog'
import { useShifts } from '@/modules/schedules/composables/useShifts'
import type { Shift } from '@/modules/schedules/types/shift.types'
import { getApiErrorMessage } from '@/shared/api/apiErrorMessage'
import { toast } from 'vue-sonner'

const { shiftsQuery, deleteShift } = useShifts()
const { data: shiftsRaw, isLoading } = shiftsQuery
const shifts = computed(() => shiftsRaw.value ?? [])

const columns = [
  { key: 'name', label: 'Tên ca' },
  { key: 'time', label: 'Giờ làm việc' },
  { key: 'gracePeriod', label: 'Cho phép trễ', align: 'center' as const },
  { key: 'status', label: 'Trạng thái' },
  { key: 'actions', label: 'Hành động', align: 'right' as const },
]

const deleteTarget = ref<Shift | null>(null)
const isAlertOpen = ref(false)
const isDeletingShiftId = ref<string | number | null>(null)

const handleDelete = (id: string | number) => {
  const item = shifts.value.find((s) => String(s.id) === String(id))
  if (item) {
    deleteTarget.value = item
    isAlertOpen.value = true
  }
}

const confirmDelete = async () => {
  if (!deleteTarget.value || isDeletingShiftId.value !== null) return

  isDeletingShiftId.value = deleteTarget.value.id

  try {
    await deleteShift.mutateAsync(deleteTarget.value.id)
    await shiftsQuery.refetch()
    toast.success('Đã xóa ca làm việc thành công.')
    isAlertOpen.value = false
    deleteTarget.value = null
  } catch (err) {
    toast.error(getApiErrorMessage(err, 'Không thể xóa ca làm việc.'))
  } finally {
    isDeletingShiftId.value = null
  }
}

const fmtTime = (t?: string | null) => (t ? String(t).slice(0, 5) : '—')
</script>

<template>
  <div class="space-y-6">
    <PageHeader title="Ca làm việc" description="Quản lý danh mục ca làm việc">
      <template #actions>
        <Button as-child class="gap-2 shadow-lg shadow-primary/20 dark:shadow-none bg-primary hover:bg-primary">
          <RouterLink to="/shifts/new">
            <Plus class="h-4 w-4" />
            Tạo mới
          </RouterLink>
        </Button>
      </template>
    </PageHeader>

    <div class="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
      <DataTable 
        :columns="columns" 
        :rows="shifts" 
        :loading="isLoading"
      >
        <!-- Custom Name Column -->
        <template #cell-name="{ row }">
          <div class="flex items-center gap-3">
             <div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary dark:bg-primary/10 dark:text-primary">
              <Timer class="h-4 w-4" />
            </div>
            <span class="font-bold text-primary-text dark:text-primary-text">{{ row.name }}</span>
          </div>
        </template>

        <!-- Custom Time Column -->
        <template #cell-time="{ row }">
          <div class="flex items-center gap-2">
            <code class="text-[11px] font-mono font-bold bg-muted dark:bg-elevated px-1.5 py-0.5 rounded text-secondary-text dark:text-tertiary-text">
              {{ fmtTime(row.startTime) }}
            </code>
            <span class="text-tertiary-text text-[10px]">→</span>
            <code class="text-[11px] font-mono font-bold bg-muted dark:bg-elevated px-1.5 py-0.5 rounded text-secondary-text dark:text-tertiary-text">
              {{ fmtTime(row.endTime) }}
            </code>
          </div>
        </template>

        <!-- Custom Grace Period Column -->
        <template #cell-gracePeriod="{ row }">
          <span class="text-sm font-semibold text-primary-text dark:text-primary-text">
             {{ typeof row.gracePeriod === 'number' ? `${row.gracePeriod} phút` : '—' }}
          </span>
        </template>

        <!-- Custom Status Column -->
        <template #cell-status>
          <Badge 
            variant="default"
            class="font-bold flex-shrink-0 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/30"
          >
            Hoạt động
          </Badge>
        </template>

        <!-- Custom Actions Column -->
        <template #cell-actions="{ row }">
          <ActionDropdown 
            :item-id="row.id" 
            :edit-to="`/shifts/${row.id}/edit`" 
            @delete="handleDelete" 
          />
        </template>
      </DataTable>
    </div>

    <!-- Shadcn Alert Dialog for Deletion -->
    <AlertDialog :open="isAlertOpen" @update:open="isAlertOpen = $event">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa ca làm việc <span class="font-bold text-primary-text dark:text-primary-text">"{{ deleteTarget?.name }}"</span>? 
            Hành động này không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel :disabled="isDeletingShiftId !== null">Hủy</AlertDialogCancel>
          <Button
            type="button"
            class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            :disabled="isDeletingShiftId !== null"
            @click="confirmDelete"
          >
            <Loader2 v-if="isDeletingShiftId !== null" class="mr-2 h-4 w-4 animate-spin" />
            {{ isDeletingShiftId !== null ? 'Đang xóa...' : 'Xác nhận xóa' }}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
