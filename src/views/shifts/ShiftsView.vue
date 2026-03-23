<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { BriefcaseBusiness } from 'lucide-vue-next'
import PageHeader from '@/components/ui/PageHeader.vue'
import ActionDropdown from '@/components/ui/ActionDropdown.vue'
import DeleteConfirmDialog from '@/components/ui/DeleteConfirmDialog.vue'
import { usePositions } from '@/composables/usePositions'
import type { Position } from '@/types/position'
import LoadingErrorState from '@/components/ui/LoadingErrorState.vue'

const { positionsQuery, deletePosition } = usePositions()
const { data: positionsRaw, isLoading, isError, error } = positionsQuery
const positions = computed(() => positionsRaw.value ?? [])

const deleteDialog = ref(false)
const deleteTarget = ref<Position | null>(null)

const handleDelete = (id: string | number) => {
  const item = positions.value.find((position) => String(position.id) === String(id))
  if (item) {
    deleteTarget.value = item
    deleteDialog.value = true
  }
}

const confirmDelete = () => {
  if (deleteTarget.value) {
    deletePosition.mutate(deleteTarget.value.id)
  }
  deleteDialog.value = false
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader title="Chức vụ" description="Quản lý chức vụ nhân sự">
      <template #actions>
        <RouterLink
          to="/shifts/new"
          class="flex items-center gap-2 h-10 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors dark:shadow-none"
        >
          Tạo mới
        </RouterLink>
      </template>
    </PageHeader>

    <div
      class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
    >
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead class="bg-slate-50 dark:bg-slate-900">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Chức vụ</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Mã</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Phòng ban</th>
              <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Level</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Trạng thái</th>
              <th class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Hành động</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-800">
            <LoadingErrorState
              v-if="isLoading || isError"
              mode="row"
              :colspan="6"
              :is-loading="isLoading"
              :is-error="isError"
              :error="error"
              loadingText="Đang tải danh sách chức vụ..."
              errorText="Không thể tải danh sách chức vụ"
              retryLabel="Thử lại"
              @retry="() => positionsQuery.refetch()"
            />

            <tr v-else-if="positions.length === 0">
              <td colspan="6" class="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                Chưa có chức vụ nào
              </td>
            </tr>
            <tr v-else v-for="position in positions" :key="position.id" class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
              <td class="whitespace-nowrap px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-sm font-bold dark:bg-indigo-900 dark:text-indigo-300">
                    <BriefcaseBusiness class="h-4 w-4" />
                  </div>
                  <span class="font-medium text-slate-900 dark:text-white">{{ position.name }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-sm font-mono text-slate-600 dark:text-slate-300">{{ position.code || '—' }}</td>
              <td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{{ position.departmentName || '—' }}</td>
              <td class="px-6 py-4 text-center text-sm font-semibold text-slate-700 dark:text-slate-200">{{ position.level || '—' }}</td>
              <td class="px-6 py-4">
                <span :class="[
                  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold',
                  position.status === 'inactive' ? 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-100',
                ]">
                  {{ position.status === 'inactive' ? 'Ngừng hoạt động' : 'Hoạt động' }}
                </span>
              </td>
              <td class="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                <ActionDropdown
                  :item-id="position.id"
                  :edit-to="`/shifts/${position.id}/edit`"
                  @delete="handleDelete"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <DeleteConfirmDialog
      :open="deleteDialog"
      title="Xóa chức vụ"
      description="Bạn có chắc chắn muốn xóa chức vụ này không?"
      :item-name="deleteTarget?.name"
      @confirm="confirmDelete"
      @cancel="deleteDialog = false"
    />
  </div>
</template>
