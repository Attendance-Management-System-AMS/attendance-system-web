<script setup lang="ts">
import { computed, ref } from 'vue'
import { BriefcaseBusiness, Plus } from 'lucide-vue-next'
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
import { usePositions } from '@/modules/positions/composables/usePositions'
import type { Position } from '@/modules/positions/types/position.types'

const { positionsQuery, deletePosition } = usePositions()
const { data: positionsRaw, isLoading } = positionsQuery
const positions = computed(() => positionsRaw.value ?? [])

const columns = [
  { key: 'name', label: 'Chức vụ' },
  { key: 'code', label: 'Mã' },
  { key: 'departmentName', label: 'Phòng ban' },
  { key: 'level', label: 'Level', align: 'center' as const },
  { key: 'status', label: 'Trạng thái' },
  { key: 'actions', label: 'Hành động', align: 'right' as const },
]

const deleteTarget = ref<Position | null>(null)
const isAlertOpen = ref(false)

const handleDelete = (id: string | number) => {
  const item = positions.value.find((p) => String(p.id) === String(id))
  if (item) {
    deleteTarget.value = item
    isAlertOpen.value = true
  }
}

const confirmDelete = () => {
  if (deleteTarget.value) {
    deletePosition.mutate(deleteTarget.value.id)
    isAlertOpen.value = false
    deleteTarget.value = null
  }
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader title="Chức vụ" description="Quản lý chức vụ nhân sự">
      <template #actions>
        <Button as-child class="gap-2 shadow-lg shadow-primary/20 dark:shadow-none bg-primary hover:bg-primary">
          <RouterLink to="/positions/new">
            <Plus class="h-4 w-4" />
            Tạo mới
          </RouterLink>
        </Button>
      </template>
    </PageHeader>

    <div class="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
      <DataTable 
        :columns="columns" 
        :rows="positions" 
        :loading="isLoading"
      >
        <!-- Custom Name Column -->
        <template #cell-name="{ row }">
          <div class="flex items-center gap-3">
             <div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary dark:bg-primary/10 dark:text-primary">
              <BriefcaseBusiness class="h-4 w-4" />
            </div>
            <span class="font-bold text-primary-text dark:text-primary-text">{{ row.name }}</span>
          </div>
        </template>

        <!-- Custom Code Column -->
        <template #cell-code="{ row }">
          <code class="text-[11px] font-mono font-bold bg-muted dark:bg-elevated px-1.5 py-0.5 rounded text-secondary-text dark:text-tertiary-text">
            {{ row.code || '—' }}
          </code>
        </template>

        <!-- Custom Status Column -->
        <template #cell-status="{ row }">
          <Badge 
            :variant="row.status === 'inactive' ? 'secondary' : 'default'"
            class="font-bold flex-shrink-0"
            :class="row.status !== 'inactive' ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/30' : ''"
          >
            {{ row.status === 'inactive' ? 'Ngừng hoạt động' : 'Hoạt động' }}
          </Badge>
        </template>

        <!-- Custom Actions Column -->
        <template #cell-actions="{ row }">
          <ActionDropdown 
            :item-id="row.id" 
            :edit-to="`/positions/${row.id}/edit`" 
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
            Bạn có chắc chắn muốn xóa chức vụ <span class="font-bold text-primary-text dark:text-primary-text">"{{ deleteTarget?.name }}"</span>? 
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
