<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { useDepartments } from '@/composables/useDepartments'
import PageHeader from '@/components/ui/PageHeader.vue'
import SearchToolbar from '@/components/ui/SearchToolbar.vue'
import ActionDropdown from '@/components/ui/ActionDropdown.vue'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
import DepartmentCreateModal from '@/components/departments/DepartmentCreateModal.vue'
import DepartmentEditModal from '@/components/departments/DepartmentEditModal.vue'
import { Plus } from 'lucide-vue-next'
import Pagination from '@/components/ui/Pagination.vue'
import DataTable from '@/components/ui/DataTable.vue'
import type { Department } from '@/types/department'

const search = ref('')
const debouncedSearch = ref('')
const updateDebounced = useDebounceFn((val: string) => {
  debouncedSearch.value = val
}, 500)

watch(search, updateDebounced)

const currentPage = ref(0)
const pageSize = ref(10)

const { departmentsQuery, createDepartment, deleteDepartment, updateDepartment } = useDepartments({
  keyword: debouncedSearch,
  page: currentPage,
  size: pageSize,
})

const { data: departmentsRaw, isLoading } = departmentsQuery

const filteredDepartments = computed<Department[]>(() => departmentsRaw.value?.content ?? [])
const totalElements = computed(() => departmentsRaw.value?.totalElements ?? 0)
const totalPages = computed(() => departmentsRaw.value?.totalPages ?? 0)

watch(debouncedSearch, () => {
  currentPage.value = 0
})

// UI state
const isCreateModalOpen = ref(false)
const isEditModalOpen = ref(false)
const editTarget = ref<Department | null>(null)
const deleteDialog = ref(false)
const deleteTarget = ref<Department | null>(null)

const handleCreated = (data: { name: string; description: string }) => {
  createDepartment.mutate(data, {
    onSuccess: () => (isCreateModalOpen.value = false),
  })
}

const handleEdit = (id: string | number) => {
  const dept = filteredDepartments.value.find((d: Department) => String(d.id) === String(id))
  if (dept) {
    editTarget.value = dept
    isEditModalOpen.value = true
  }
}

const handleUpdated = (id: string | number, data: Partial<Department>) => {
  updateDepartment.mutate(
    { id: String(id), data },
    {
      onSuccess: () => {
        isEditModalOpen.value = false
        editTarget.value = null
      },
    },
  )
}

const handleDelete = (id: string | number) => {
  const dept = filteredDepartments.value.find((d: Department) => String(d.id) === String(id))
  if (dept) {
    deleteTarget.value = dept
    deleteDialog.value = true
  }
}

const confirmDelete = () => {
  if (deleteTarget.value) {
    deleteDepartment.mutate(String(deleteTarget.value.id))
  }
  deleteDialog.value = false
}

const columns = [
  { key: 'name', label: 'Tên phòng ban' },
  { key: 'description', label: 'Mô tả' },
  { key: 'totalEmployees', label: 'Số NV', align: 'center' as const },
  { key: 'status', label: 'Trạng thái' },
  { key: 'actions', label: 'Hành động', align: 'right' as const },
]
</script>

<template>
  <div class="space-y-6">
    <PageHeader title="Phòng ban" description="Quản lý các phòng ban trong tổ chức">
      <template #actions>
        <Button @click="isCreateModalOpen = true" class="gap-2 shadow-lg shadow-indigo-200 dark:shadow-none bg-indigo-600 hover:bg-indigo-700">
          <Plus class="h-4 w-4" />
          Thêm phòng ban
        </Button>
      </template>
    </PageHeader>

    <SearchToolbar v-model="search" placeholder="Tìm kiếm phòng ban, trưởng phòng..." />

    <div class="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <DataTable 
        :columns="columns" 
        :rows="filteredDepartments" 
        :loading="isLoading"
      >
        <template #cell-name="{ value }">
          <div class="flex items-center gap-3">
            <Avatar class="size-8 h-8 w-8 border border-indigo-50">
              <AvatarFallback class="bg-indigo-50 text-indigo-600 text-[10px] font-bold">
                {{ String(value).charAt(0) }}
              </AvatarFallback>
            </Avatar>
            <span class="font-bold text-slate-700 dark:text-slate-200">{{ value }}</span>
          </div>
        </template>

        <template #cell-description="{ value }">
          <p class="max-w-[250px] truncate text-sm text-slate-500 dark:text-slate-400 font-medium" :title="String(value)">
            {{ value || '—' }}
          </p>
        </template>

        <template #cell-totalEmployees="{ value }">
          <Badge variant="secondary" class="font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {{ value }} nhân viên
          </Badge>
        </template>

        <template #cell-status="{ value }">
          <Badge
            :variant="value === 'ACTIVE' ? 'default' : 'secondary'"
            class="px-2.5 py-0.5 text-[10px] font-bold border-none"
            :class="value === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/30' : ''"
          >
            {{ value === 'ACTIVE' ? 'Hoạt động' : 'Ngừng hoạt động' }}
          </Badge>
        </template>

        <template #cell-actions="{ row }">
          <ActionDropdown
            :item-id="(row as Department).id"
            @edit="handleEdit"
            @delete="handleDelete"
          />
        </template>
      </DataTable>

      <Pagination 
        v-model="currentPage" 
        :total-pages="totalPages" 
        :total-elements="totalElements" 
        :page-size="pageSize"
        label="phòng ban"
      />
    </div>

    <!-- Modals -->
    <DepartmentCreateModal
      :open="isCreateModalOpen"
      @close="isCreateModalOpen = false"
      @created="handleCreated"
    />

    <DepartmentEditModal
      :open="isEditModalOpen"
      :department="editTarget"
      @close="isEditModalOpen = false"
      @updated="handleUpdated"
    />

    <!-- Shadcn Alert Dialog -->
    <AlertDialog :open="deleteDialog" @update:open="(val) => deleteDialog = val">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa phòng ban</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa phòng ban <span class="font-bold text-slate-900 dark:text-white">{{ deleteTarget?.name }}</span>? 
            Hành động này không thể hoàn tác và có thể ảnh hưởng đến nhân sự trong phòng.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
          <AlertDialogAction 
            class="bg-destructive text-destructive-foreground hover:bg-destructive/90" 
            @click="confirmDelete"
          >
            Xác nhận xóa
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
