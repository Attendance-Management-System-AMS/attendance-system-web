<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { CalendarDays } from 'lucide-vue-next'
import PageHeader from '@/components/ui/PageHeader.vue'
import ActionDropdown from '@/components/ui/ActionDropdown.vue'
import DeleteConfirmDialog from '@/components/ui/DeleteConfirmDialog.vue'
import LoadingErrorState from '@/components/ui/LoadingErrorState.vue'
import { useHolidays } from '@/composables/useHolidays'
import type { Holiday } from '@/types/holiday'

const { holidaysQuery, deleteHoliday } = useHolidays()
const { data: holidaysRaw, isLoading, isError, error } = holidaysQuery
const holidays = computed(() => holidaysRaw.value ?? [])

const deleteDialog = ref(false)
const deleteTarget = ref<Holiday | null>(null)

const handleDelete = (id: string | number) => {
  const item = holidays.value.find((holiday) => String(holiday.id) === String(id))
  if (item) {
    deleteTarget.value = item
    deleteDialog.value = true
  }
}

const confirmDelete = () => {
  if (deleteTarget.value) {
    deleteHoliday.mutate(deleteTarget.value.id)
  }
  deleteDialog.value = false
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader title="Ngày nghỉ" description="Quản lý ngày nghỉ lễ và nghỉ hưởng lương">
      <template #actions>
        <RouterLink
          to="/holidays/new"
          class="flex items-center gap-2 h-10 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors dark:shadow-none"
        >
          Tạo mới
        </RouterLink>
      </template>
    </PageHeader>

    <div class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead class="bg-slate-50 dark:bg-slate-900">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Tên ngày nghỉ
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Ngày
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Hưởng lương
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Trạng thái
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-800">
            <LoadingErrorState
              v-if="isLoading || isError"
              mode="row"
              :colspan="5"
              :is-loading="isLoading"
              :is-error="isError"
              :error="error"
              loadingText="Đang tải danh sách ngày nghỉ..."
              errorText="Không thể tải danh sách ngày nghỉ"
              retryLabel="Thử lại"
              @retry="() => holidaysQuery.refetch()"
            />

            <tr v-else-if="holidays.length === 0">
              <td colspan="5" class="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                Chưa có ngày nghỉ nào
              </td>
            </tr>

            <tr
              v-else
              v-for="holiday in holidays"
              :key="holiday.id"
              class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              <td class="whitespace-nowrap px-6 py-4">
                <div class="flex items-center gap-3">
                  <div
                    class="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-sm font-bold dark:bg-indigo-900 dark:text-indigo-300"
                  >
                    <CalendarDays class="h-4 w-4" />
                  </div>
                  <span class="font-medium text-slate-900 dark:text-white">{{ holiday.holidayName || '—' }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-sm font-mono text-slate-600 dark:text-slate-300">
                {{ holiday.fromDate || '—' }}<span v-if="holiday.toDate"> → {{ holiday.toDate }}</span>
              </td>
              <td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                <span
                  :class="[
                    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold',
                    holiday.isPaid
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-100'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
                  ]"
                >
                  {{ holiday.isPaid ? 'Có' : 'Không' }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span
                  :class="[
                    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold',
                    'bg-emerald-100 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-100',
                  ]"
                >
                  Hoạt động
                </span>
              </td>
              <td class="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                <ActionDropdown :item-id="holiday.id" :edit-to="`/holidays/${holiday.id}/edit`" @delete="handleDelete" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <DeleteConfirmDialog
      :open="deleteDialog"
      title="Xóa ngày nghỉ"
      description="Bạn có chắc chắn muốn xóa ngày nghỉ này không?"
      :item-name="deleteTarget?.holidayName || ''"
      @confirm="confirmDelete"
      @cancel="deleteDialog = false"
    />
  </div>
</template>

