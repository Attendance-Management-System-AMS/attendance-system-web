<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { useDepartments } from '@/modules/departments/composables/useDepartments'
import { getApiErrorMessage } from '@/shared/api/apiErrorMessage'
import { useBackgroundTask } from '@/shared/lib/useBackgroundTask'
import PageHeader from '@/shared/ui/PageHeader.vue'
import SearchToolbar from '@/shared/ui/SearchToolbar.vue'
import ActionDropdown from '@/shared/ui/ActionDropdown.vue'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Avatar, AvatarFallback } from '@/shared/ui/avatar'
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
import DepartmentCreateModal from '@/modules/departments/components/DepartmentCreateModal.vue'
import DepartmentEditModal from '@/modules/departments/components/DepartmentEditModal.vue'
import { Plus } from 'lucide-vue-next'
import Pagination from '@/shared/ui/Pagination.vue'
import DataTable from '@/shared/ui/DataTable.vue'
import type { Department } from '@/modules/departments/types/department.types'

const search = ref('')
const debouncedSearch = ref('')
const updateDebounced = useDebounceFn((val: string) => {
  debouncedSearch.value = val
}, 500)

watch(search, updateDebounced)

const currentPage = ref(0)
const pageSize = ref(10)
const { executeBackgroundTask } = useBackgroundTask()

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
const createError = ref<string | null>(null)
const editError = ref<string | null>(null)
const createDraft = ref<{ name: string; description: string } | null>(null)

const openCreateModal = () => {
  createDraft.value = null
  createError.value = null
  isCreateModalOpen.value = true
}

const handleCloseCreateModal = () => {
  isCreateModalOpen.value = false
  createError.value = null
  createDraft.value = null
}

const handleCreated = (payload: { name: string; description: string }) => {
  void executeBackgroundTask({
    draft: payload,
    payload,
    run: (nextPayload) => createDepartment.mutateAsync(nextPayload),
    pendingMessage: `Đã tiếp nhận phòng ban ${payload.name}. Hệ thống đang đồng bộ.`,
    successMessage: `Đã tạo phòng ban ${payload.name}.`,
    errorMessage: ({ error }) => getApiErrorMessage(error, 'Không thể tạo phòng ban.'),
    onStart: () => {
      createError.value = null
      createDraft.value = payload
      isCreateModalOpen.value = false
    },
    onSuccess: () => {
      createDraft.value = null
    },
    onError: ({ draft, message }) => {
      createError.value = message || 'Không thể tạo phòng ban.'
      createDraft.value = draft
      isCreateModalOpen.value = true
    },
  })
}

const handleEdit = (id: string | number) => {
  const dept = filteredDepartments.value.find((d: Department) => String(d.id) === String(id))
  if (dept) {
    editError.value = null
    editTarget.value = { ...dept }
    isEditModalOpen.value = true
  }
}

const handleUpdated = (payload: {
  id: string | number
  data: Partial<Department>
}) => {
  if (!editTarget.value) {
    return
  }

  const draftDepartment = {
    ...editTarget.value,
    ...payload.data,
    id: String(payload.id),
  } as Department

  void executeBackgroundTask({
    draft: draftDepartment,
    payload,
    run: (nextPayload) => updateDepartment.mutateAsync({ id: String(nextPayload.id), data: nextPayload.data }),
    pendingMessage: `Đã tiếp nhận cập nhật cho ${draftDepartment.name}. Hệ thống đang đồng bộ.`,
    successMessage: `Đã cập nhật phòng ban ${draftDepartment.name}.`,
    errorMessage: ({ error }) => getApiErrorMessage(error, 'Không thể cập nhật phòng ban.'),
    onStart: () => {
      editError.value = null
      editTarget.value = draftDepartment
      isEditModalOpen.value = false
    },
    onSuccess: () => {
      editTarget.value = null
    },
    onError: ({ draft, message }) => {
      editError.value = message || 'Không thể cập nhật phòng ban.'
      editTarget.value = draft
      isEditModalOpen.value = true
    },
  })
}

const handleCloseEditModal = () => {
  isEditModalOpen.value = false
  editError.value = null
  editTarget.value = null
}

const handleDelete = (id: string | number) => {
  const dept = filteredDepartments.value.find((d: Department) => String(d.id) === String(id))
  if (dept) {
    deleteTarget.value = dept
    deleteDialog.value = true
  }
}

const confirmDelete = () => {
  if (!deleteTarget.value) {
    return
  }

  const target = { ...deleteTarget.value }
  void executeBackgroundTask({
    draft: target,
    payload: target,
    run: (nextTarget) => deleteDepartment.mutateAsync(String(nextTarget.id)),
    pendingMessage: `Đã tiếp nhận yêu cầu xóa ${target.name}. Hệ thống đang đồng bộ.`,
    successMessage: `Đã xóa phòng ban ${target.name}.`,
    errorMessage: ({ error }) => getApiErrorMessage(error, 'Không thể xóa phòng ban.'),
    onStart: () => {
      deleteDialog.value = false
      deleteTarget.value = null
    },
  })
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
        <Button @click="openCreateModal" class="gap-2 shadow-lg shadow-primary/20 dark:shadow-none bg-primary hover:bg-primary">
          <Plus class="h-4 w-4" />
          Thêm phòng ban
        </Button>
      </template>
    </PageHeader>

    <SearchToolbar v-model="search" placeholder="Tìm kiếm phòng ban, trưởng phòng..." />

    <div class="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
      <DataTable 
        :columns="columns" 
        :rows="filteredDepartments" 
        :loading="isLoading"
      >
        <template #cell-name="{ value }">
          <div class="flex items-center gap-3">
            <Avatar class="size-8 h-8 w-8 border border-primary/20">
              <AvatarFallback class="bg-primary/10 text-primary text-[10px] font-bold">
                {{ String(value).charAt(0) }}
              </AvatarFallback>
            </Avatar>
            <span class="font-bold text-primary-text dark:text-primary-text">{{ value }}</span>
          </div>
        </template>

        <template #cell-description="{ value }">
          <p class="max-w-62.5 truncate text-sm text-secondary-text dark:text-tertiary-text font-medium" :title="String(value)">
            {{ value || '—' }}
          </p>
        </template>

        <template #cell-totalEmployees="{ value }">
          <Badge variant="secondary" class="font-bold bg-muted dark:bg-elevated text-secondary-text dark:text-tertiary-text">
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
      :draft="createDraft"
      :is-submitting="createDepartment.isPending.value"
      :submit-error="createError"
      @close="handleCloseCreateModal"
      @created="handleCreated"
    />

    <DepartmentEditModal
      :open="isEditModalOpen"
      :department="editTarget"
      :is-submitting="updateDepartment.isPending.value"
      :submit-error="editError"
      @close="handleCloseEditModal"
      @updated="handleUpdated"
    />

    <!-- Shadcn Alert Dialog -->
    <AlertDialog :open="deleteDialog" @update:open="(val) => deleteDialog = val">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa phòng ban</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa phòng ban <span class="font-bold text-primary-text dark:text-primary-text">{{ deleteTarget?.name }}</span>? 
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
