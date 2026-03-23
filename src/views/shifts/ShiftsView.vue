<script setup lang="ts">
import { computed, ref } from 'vue'
import { BriefcaseBusiness } from 'lucide-vue-next'
import PageHeader from '@/components/ui/PageHeader.vue'
import ActionDropdown from '@/components/ui/ActionDropdown.vue'
import DeleteConfirmDialog from '@/components/ui/DeleteConfirmDialog.vue'
import { usePositions } from '@/composables/usePositions'
import type { Position } from '@/types/position'

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
        <div class="rounded-xl border border-slate-200 px-4 py-2 text-xs text-slate-500 dark:border-slate-800">
          Đồng bộ từ API
        </div>
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
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Mô tả</th>
              <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Số NV</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Trạng thái</th>
              <th class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Hành động</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-800">
            <tr v-if="isLoading">
              <td colspan="6" class="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                Đang tải danh sách chức vụ...
              </td>
            </tr>
            <tr v-else-if="isError">
              <td colspan="6" class="px-6 py-12 text-center text-red-600 dark:text-red-400">
                Lỗi: {{ (error as Error)?.message || 'Không thể tải dữ liệu' }}
                <button class="ml-4 text-indigo-600 underline hover:text-indigo-800 dark:text-indigo-400" @click="() => positionsQuery.refetch()">
                  Thử lại
                </button>
              </td>
            </tr>
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
              <td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{{ position.description || '—' }}</td>
              <td class="px-6 py-4 text-center text-sm font-semibold text-slate-700 dark:text-slate-200">{{ position.employeeCount ?? 0 }}</td>
              <td class="px-6 py-4">
                <span :class="[
                  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold',
                  position.status === 'inactive' ? 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-100',
                ]">
                  {{ position.status === 'inactive' ? 'Ngừng hoạt động' : 'Hoạt động' }}
                </span>
              </td>
              <td class="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                <ActionDropdown :item-id="position.id" @delete="handleDelete" />
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
