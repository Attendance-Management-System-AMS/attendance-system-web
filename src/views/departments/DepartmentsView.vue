<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { useDepartments } from '@/composables/useDepartments'
import PageHeader from '@/components/ui/PageHeader.vue'
import SearchToolbar from '@/components/ui/SearchToolbar.vue'
import ActionDropdown from '@/components/ui/ActionDropdown.vue'
import DeleteConfirmDialog from '@/components/ui/DeleteConfirmDialog.vue'
import DepartmentCreateModal from '@/components/departments/DepartmentCreateModal.vue'
import DepartmentEditModal from '@/components/departments/DepartmentEditModal.vue'
import LoadingErrorState from '@/components/ui/LoadingErrorState.vue'
import TableSkeleton from '@/components/ui/TableSkeleton.vue'
import { Plus } from 'lucide-vue-next'
import type { Department } from '@/types/department'

const search = ref('')
const debouncedSearch = ref('')
const updateDebounced = useDebounceFn((val: string) => {
  debouncedSearch.value = val
}, 500)

watch(search, updateDebounced)

const { departmentsQuery, createDepartment, deleteDepartment, updateDepartment } = useDepartments({
  keyword: debouncedSearch,
})

const { data: departmentsRaw, isLoading, isError, error } = departmentsQuery
const departments = computed<Department[]>(() => departmentsRaw.value ?? [])

// Filtered list
const filteredDepartments = computed<Department[]>(() => departments.value)

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
  const dept = departments.value.find((d: Department) => String(d.id) === String(id))
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
  const dept = departments.value.find((d: Department) => String(d.id) === String(id))
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
</script>

<template>
  <div class="space-y-6 p-6">
    <PageHeader title="Phòng ban" description="Quản lý các phòng ban trong tổ chức">
      <template #actions>
        <button
          @click="isCreateModalOpen = true"
          class="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-indigo-700"
        >
          <Plus class="h-4 w-4" />
          Thêm phòng ban
        </button>
      </template>
    </PageHeader>

    <SearchToolbar v-model="search" placeholder="Tìm kiếm phòng ban, trưởng phòng..." />

    <!-- Bảng danh sách -->
    <div
      class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
    >
      <div class="overflow-x-auto">
        <!-- Skeleton Loading -->
        <TableSkeleton v-if="isLoading" :rows="6" :cols="5" has-avatar-column has-action-column />

        <!-- Error State -->
        <div v-else-if="isError" class="p-8">
          <LoadingErrorState
            mode="block"
            :is-loading="false"
            :is-error="true"
            :error="error"
            errorText="Không thể tải danh sách phòng ban"
            retryLabel="Thử lại"
            @retry="() => departmentsQuery.refetch()"
          />
        </div>

        <!-- Real Table -->
        <table v-else class="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead class="bg-slate-50 dark:bg-slate-900">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400"
              >
                Tên phòng ban
              </th>
              <th
                class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400"
              >
                Số NV
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400"
              >
                Trạng thái
              </th>
              <th
                class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400"
              >
                Hành động
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-800">
            <tr v-if="filteredDepartments.length === 0">
              <td colspan="6" class="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                Không tìm thấy phòng ban nào
                <button
                  @click="isCreateModalOpen = true"
                  class="ml-2 text-indigo-600 underline hover:text-indigo-800 dark:text-indigo-400"
                >
                  Thêm mới ngay
                </button>
              </td>
            </tr>
            <tr
              v-else
              v-for="dept in filteredDepartments"
              :key="dept.id"
              class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              <td class="whitespace-nowrap px-6 py-4">
                <div class="flex items-center gap-3">
                  <div
                    class="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-sm font-bold dark:bg-indigo-900 dark:text-indigo-300"
                  >
                    {{ dept.name.charAt(0) }}
                  </div>
                  <span class="font-medium text-slate-900 dark:text-white">{{ dept.name }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-center">
                <span
                  class="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-slate-100 px-2 text-xs font-bold text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                >
                  {{ dept.employeeCount }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span
                  :class="[
                    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold',
                    dept.status === 'ACTIVE'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-100'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
                  ]"
                >
                  {{ dept.status === 'ACTIVE' ? 'Hoạt động' : 'Ngừng hoạt động' }}
                </span>
              </td>
              <td class="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                <ActionDropdown
                  :item-id="dept.id"
                  @edit="handleEdit"
                  @delete="handleDelete"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal và Dialog -->
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

    <DeleteConfirmDialog
      :open="deleteDialog"
      title="Xóa phòng ban"
      description="Bạn có chắc chắn muốn xóa phòng ban này? Nhân viên trong phòng không bị ảnh hưởng."
      :item-name="deleteTarget?.name"
      @confirm="confirmDelete"
      @cancel="deleteDialog = false"
    />
  </div>
</template>
