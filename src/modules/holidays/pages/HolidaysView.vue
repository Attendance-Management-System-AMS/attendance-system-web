<script setup lang="ts">
import { computed, ref } from 'vue'
import { CalendarDays, Plus } from 'lucide-vue-next'
import PageHeader from '@/shared/ui/PageHeader.vue'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import DataTable from '@/shared/ui/DataTable.vue'
import ActionDropdown from '@/shared/ui/ActionDropdown.vue'
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
import { useHolidays } from '@/modules/holidays/composables/useHolidays'
import type { Holiday } from '@/modules/holidays/types/holiday.types'

const { holidaysQuery, deleteHoliday } = useHolidays()
const { data: holidaysRaw, isLoading } = holidaysQuery
const holidays = computed(() => holidaysRaw.value ?? [])

const columns = [
  { key: 'holidayName', label: 'Tên ngày nghỉ' },
  { key: 'dateRange', label: 'Thời gian' },
  { key: 'isPaid', label: 'Hưởng lương', align: 'center' as const },
  { key: 'status', label: 'Trạng thái' },
  { key: 'actions', label: 'Hành động', align: 'right' as const },
]

const deleteTarget = ref<Holiday | null>(null)
const isAlertOpen = ref(false)

const handleDelete = (id: string | number) => {
  const item = holidays.value.find((h) => String(h.id) === String(id))
  if (item) {
    deleteTarget.value = item
    isAlertOpen.value = true
  }
}

const confirmDelete = () => {
  if (deleteTarget.value) {
    deleteHoliday.mutate(deleteTarget.value.id)
    isAlertOpen.value = false
    deleteTarget.value = null
  }
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader title="Ngày nghỉ" description="Quản lý ngày nghỉ lễ và nghỉ hưởng lương">
      <template #actions>
        <Button as-child class="gap-2 shadow-lg shadow-primary/20 dark:shadow-none bg-primary hover:bg-primary">
          <RouterLink to="/holidays/new">
            <Plus class="h-4 w-4" />
            Tạo mới
          </RouterLink>
        </Button>
      </template>
    </PageHeader>

    <div class="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
      <DataTable 
        :columns="columns" 
        :rows="holidays" 
        :loading="isLoading"
      >
        <!-- Custom Name Column -->
        <template #cell-holidayName="{ row }">
          <div class="flex items-center gap-3">
             <div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary dark:bg-primary/10 dark:text-primary">
              <CalendarDays class="h-4 w-4" />
            </div>
            <span class="font-bold text-primary-text dark:text-primary-text">{{ row.holidayName }}</span>
          </div>
        </template>

        <!-- Custom Date Range Column -->
        <template #cell-dateRange="{ row }">
          <div class="flex items-center gap-2">
            <code class="text-[11px] font-mono font-bold bg-muted dark:bg-elevated px-1.5 py-0.5 rounded text-secondary-text dark:text-tertiary-text">
              {{ row.fromDate || '—' }}
            </code>
            <span v-if="row.toDate" class="text-tertiary-text text-[10px]">→</span>
            <code v-if="row.toDate" class="text-[11px] font-mono font-bold bg-muted dark:bg-elevated px-1.5 py-0.5 rounded text-secondary-text dark:text-tertiary-text">
              {{ row.toDate }}
            </code>
          </div>
        </template>

        <!-- Custom Paid Column -->
        <template #cell-isPaid="{ row }">
           <Badge 
            :variant="row.isPaid ? 'default' : 'secondary'"
            class="font-bold border-none"
            :class="row.isPaid ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/30' : ''"
          >
            {{ row.isPaid ? 'Có' : 'Không' }}
          </Badge>
        </template>

        <!-- Custom Status Column -->
        <template #cell-status>
          <Badge class="bg-emerald-50 text-emerald-600 border-none font-bold">Hoạt động</Badge>
        </template>

        <!-- Custom Actions Column -->
        <template #cell-actions="{ row }">
          <ActionDropdown 
            :item-id="row.id" 
            :edit-to="`/holidays/${row.id}/edit`" 
            @delete="handleDelete" 
          />
        </template>
      </DataTable>
    </div>

    <!-- Shadcn Alert Dialog for Deletion -->
    <AlertDialog :open="isAlertOpen" @update:open="isAlertOpen = $event">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa ngày nghỉ</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa ngày nghỉ <span class="font-bold text-primary-text dark:text-primary-text">"{{ deleteTarget?.holidayName }}"</span>? 
            Hành động này không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <AlertDialogAction @click="confirmDelete" class="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Xác nhận xóa
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
