<script setup lang="ts">
import PageHeader from '@/shared/ui/PageHeader.vue'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import { ArrowLeft, Pencil, ScanFace } from 'lucide-vue-next'
import { employeeApi } from '@/modules/employees/api/employee.api'
import { queryKeys } from '@/shared/lib/queryKeys'
import type { Employee } from '@/modules/employees/types/employee.types'

const route = useRoute()
const router = useRouter()

const employeeId = computed(() => Number(route.params.id))

const employeeQuery = useQuery<Employee>({
  queryKey: computed(() => queryKeys.employees.detail(employeeId.value)),
  queryFn: async () => {
    const response = await employeeApi.getById(employeeId.value)
    return response.data.result
  },
  enabled: computed(() => Number.isFinite(employeeId.value) && employeeId.value > 0),
  staleTime: 1000 * 60 * 3,
})

const employee = computed(() => employeeQuery.data.value)

const infoRows = computed(() => {
  const data = employee.value
  if (!data) return []

  return [
    { label: 'Mã nhân viên', value: data.employeeCode || '-' },
    { label: 'Giới tính', value: data.gender || '-' },
    { label: 'Email', value: data.email || '-' },
    { label: 'Phòng ban', value: data.departmentName || '-' },
    { label: 'Chức vụ', value: data.positionName || '-' },
    { label: 'Quản lý', value: data.managerName || '-' },
    { label: 'Ngày vào làm', value: data.joinDate || '-' },
    { label: 'Trạng thái', value: data.status || '-' },
    {
      label: 'Khuôn mặt (chấm công)',
      value: data.faceRegistered ? 'Đã đăng ký' : 'Chưa đăng ký',
    },
    { label: 'Ngày tạo', value: data.createdAt || '-' },
  ]
})
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      :title="employee?.fullName || 'Chi tiết nhân viên'"
      description="Thông tin hồ sơ nhân viên"
    >
      <template #actions>
        <button
          @click="router.back()"
          class="flex items-center gap-2 h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft class="h-4 w-4" />
          Quay lại
        </button>
        <button
          v-if="employee"
          @click="router.push(`/employees/${employee.id}/register-face`)"
          class="flex items-center gap-2 h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
        >
          <ScanFace class="h-4 w-4" />
          Khuôn mặt
        </button>
        <button
          v-if="employee"
          @click="router.push(`/employees/${employee.id}/edit`)"
          class="flex items-center gap-2 h-10 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors dark:shadow-none"
        >
          <Pencil class="h-4 w-4" />
          Chỉnh sửa
        </button>
      </template>
    </PageHeader>

    <div
      v-if="employeeQuery.isLoading.value"
      class="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900"
    >
      Đang tải thông tin nhân viên...
    </div>

    <div
      v-else-if="employeeQuery.isError.value"
      class="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300"
    >
      <p>Không thể tải chi tiết nhân viên.</p>
      <button
        class="mt-3 text-indigo-600 underline hover:text-indigo-800 dark:text-indigo-400"
        @click="employeeQuery.refetch()"
      >
        Thử lại
      </button>
    </div>

    <div
      v-else-if="employee"
      class="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden"
    >
      <div class="border-b border-slate-100 px-6 py-4 dark:border-slate-800">
        <p class="text-xs uppercase tracking-wider text-slate-400">Nhân viên</p>
        <p class="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
          {{ employee.fullName }}
        </p>
      </div>

      <div class="grid gap-0 sm:grid-cols-2">
        <div
          v-for="row in infoRows"
          :key="row.label"
          class="border-b border-slate-100 px-6 py-4 odd:bg-slate-50/50 dark:border-slate-800 dark:odd:bg-slate-800/30"
        >
          <p class="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {{ row.label }}
          </p>
          <p class="mt-1 text-sm text-slate-700 dark:text-slate-200">{{ row.value }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
