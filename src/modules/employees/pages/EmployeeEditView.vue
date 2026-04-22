<script setup lang="ts">
import FormCard from '@/shared/ui/FormCard.vue'
import PageHeader from '@/shared/ui/PageHeader.vue'
import { computed, reactive, ref, watch, watchEffect } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, Briefcase, RefreshCw, Save, User } from 'lucide-vue-next'
import { useQuery } from '@tanstack/vue-query'
import { employeeApi } from '@/modules/employees/api/employee.api'
import { queryKeys } from '@/shared/lib/queryKeys'
import { useEmployees } from '@/modules/employees/composables/useEmployees'
import { useDepartments } from '@/modules/departments/composables/useDepartments'
import { usePositions } from '@/modules/positions/composables/usePositions'
import type { Employee, UpdateEmployee } from '@/modules/employees/types/employee.types'
import type { Department } from '@/modules/departments/types/department.types'
import type { Position } from '@/modules/positions/types/position.types'

import { toast } from 'vue-sonner'

const router = useRouter()
const route = useRoute()

const { updateEmployee, employeesQuery: managersQuery } = useEmployees({
  size: 200,
  sort: 'fullName',
  sortDir: 'asc',
  status: 'ACTIVE',
})
const { departmentsQuery } = useDepartments()
const { positionsQuery } = usePositions()

const employeeId = computed(() => Number(route.params.id))
const departments = computed<Department[]>(() => departmentsQuery.data.value?.content ?? [])
const positions = computed<Position[]>(() => positionsQuery.data.value ?? [])
const managers = computed<Employee[]>(() =>
  (managersQuery.data.value?.content ?? []).filter((employee) => employee.id !== employeeId.value),
)

const form = reactive({
  fullName: '',
  employeeCode: '',
  gender: '',
  email: '',
  departmentId: '',
  positionId: '',
  managerId: '',
  joinDate: '',
  isActive: true,
})

const filteredPositions = computed(() => {
  const deptId = form.departmentId
  if (!deptId) return []
  return positions.value.filter((p) => String(p.departmentId ?? '') === String(deptId))
})

watch(
  () => form.departmentId,
  (next, prev) => {
    if (next !== prev) {
      form.positionId = ''
    }
  },
)

function numericIdForApi(v: string): number | undefined {
  if (v === '') return undefined
  const n = Number(v)
  return Number.isFinite(n) ? n : undefined
}

const genders = [
  { label: 'Nam', value: 'MALE' },
  { label: 'Nữ', value: 'FEMALE' },
  { label: 'Khác', value: 'OTHER' },
]

const inputClass =
  'h-10 w-full rounded-lg border border-border-standard bg-surface px-3 text-sm text-primary-text placeholder:text-tertiary-text focus:border-primary focus:bg-card focus:outline-none focus:ring-2 focus:ring-ring/40 transition-all dark:border-border dark:bg-elevated dark:text-primary-text'

const labelClass = 'block text-xs font-bold  tracking-normal text-secondary-text mb-1.5'

type FieldName =
  | 'fullName'
  | 'gender'
  | 'email'
  | 'departmentId'
  | 'positionId'
  | 'managerId'
type FieldErrors = Record<FieldName, string>

const errors = reactive<FieldErrors>({
  fullName: '',
  gender: '',
  email: '',
  departmentId: '',
  positionId: '',
  managerId: '',
})

const employeeQuery = useQuery<Employee>({
  queryKey: computed(() => queryKeys.employees.detail(employeeId.value)),
  enabled: computed(() => Number.isFinite(employeeId.value) && employeeId.value > 0),
  queryFn: async () => {
    const res = await employeeApi.getById(employeeId.value)
    return res.data.result
  },
})

watchEffect(() => {
  const e = employeeQuery.data.value
  if (!e) return

  form.fullName = e.fullName ?? ''
  form.employeeCode = e.employeeCode ?? ''
  form.gender = e.gender ?? ''
  form.email = e.email ?? ''
  form.joinDate = e.joinDate ?? ''
  form.departmentId = e.departmentId != null ? String(e.departmentId) : ''
  form.positionId = e.positionId != null ? String(e.positionId) : ''
  form.managerId = e.managerId != null ? String(e.managerId) : ''
  form.isActive = (e.status ?? 'ACTIVE').toUpperCase() === 'ACTIVE'
})

const submitError = ref('')
const hasErrors = computed(() => Object.values(errors).some((value) => Boolean(value)))

const validateForm = () => {
  errors.fullName = form.fullName.trim() ? '' : 'Vui lòng nhập họ và tên'
  errors.gender = form.gender ? '' : 'Vui lòng chọn giới tính'
  errors.email = form.email.trim()
    ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
      ? ''
      : 'Email không đúng định dạng'
    : 'Vui lòng nhập email'
  errors.departmentId = form.departmentId ? '' : 'Vui lòng chọn phòng ban'
  errors.positionId = form.positionId ? '' : 'Vui lòng chọn chức vụ'
  errors.managerId = ''

  return Object.values(errors).every((value) => !value)
}

const handleSubmit = async () => {
  submitError.value = ''

  if (!validateForm()) {
    toast.error('Vui lòng điền đầy đủ các thông tin bắt buộc.')
    submitError.value = 'Vui lòng kiểm tra lại các trường bắt buộc trước khi lưu.'
    return
  }

  const payload: UpdateEmployee = {
    fullName: form.fullName.trim(),
    employeeCode: form.employeeCode.trim(),
    gender: form.gender || undefined,
    email: form.email.trim(),
    departmentId: numericIdForApi(form.departmentId),
    positionId: numericIdForApi(form.positionId),
    managerId: numericIdForApi(form.managerId),
    status: form.isActive ? 'ACTIVE' : 'INACTIVE',
    joinDate: form.joinDate || undefined,
  }

  try {
    await updateEmployee.mutateAsync({ id: employeeId.value, data: payload })
    toast.success('Cập nhật nhân viên thành công')
    setTimeout(() => {
      router.push(`/employees/${employeeId.value}`)
    }, 1500)
  } catch (err) {
    console.error('Update employee failed:', err)
    toast.error('Lỗi khi cập nhật nhân viên. Vui lòng thử lại.')
    submitError.value = 'Cập nhật thất bại. Vui lòng thử lại.'
  }
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      :title="`Chỉnh sửa: ${form.fullName}`"
      description="Cập nhật thông tin nhân viên trong hệ thống"
    >
      <template #actions>
        <button
          @click="router.back()"
          class="flex items-center gap-2 h-10 rounded-lg border border-border-standard bg-card px-4 text-sm font-medium text-secondary-text shadow-sm hover:bg-surface transition-colors"
        >
          <ArrowLeft class="h-4 w-4" />
          Quay lại
        </button>
      </template>
    </PageHeader>

    <div class="grid gap-6 xl:grid-cols-[minmax(0,1.75fr)_360px]">
      <div class="space-y-6">
        <FormCard title="Thông tin cá nhân" :icon="User">
          <div class="grid gap-4 md:grid-cols-2">
            <div class="md:col-span-2">
              <label :class="labelClass">Họ và tên <span class="text-rose-500">*</span></label>
              <input
                v-model="form.fullName"
                type="text"
                :class="[inputClass, errors.fullName && 'border-rose-400']"
              />
              <p v-if="errors.fullName" class="mt-1 text-xs text-rose-600">{{ errors.fullName }}</p>
            </div>
            <div>
              <label :class="labelClass">Giới tính <span class="text-rose-500">*</span></label>
              <select v-model="form.gender" :class="[inputClass, errors.gender && 'border-rose-400']">
                <option value="" disabled>— Chọn giới tính —</option>
                <option v-for="gender in genders" :key="gender.value" :value="gender.value">
                  {{ gender.label }}
                </option>
              </select>
              <p v-if="errors.gender" class="mt-1 text-xs text-rose-600">{{ errors.gender }}</p>
            </div>
            <div>
              <label :class="labelClass">Ngày vào làm</label>
              <input v-model="form.joinDate" type="date" :class="inputClass" />
            </div>
            <div class="md:col-span-2">
              <label :class="labelClass">Email <span class="text-rose-500">*</span></label>
              <input
                v-model="form.email"
                type="email"
                :class="[inputClass, errors.email && 'border-rose-400']"
              />
              <p v-if="errors.email" class="mt-1 text-xs text-rose-600">{{ errors.email }}</p>
            </div>
          </div>
        </FormCard>

        <FormCard title="Thông tin công việc" :icon="Briefcase">
          <div class="grid gap-4 md:grid-cols-2">
            <div>
              <label :class="labelClass">Phòng ban <span class="text-rose-500">*</span></label>
              <select
                v-model="form.departmentId"
                :disabled="departmentsQuery.isLoading.value"
                :class="[inputClass, errors.departmentId && 'border-rose-400']"
              >
                <option value="" disabled>— Chọn phòng ban —</option>
                <option v-for="department in departments" :key="department.id" :value="String(department.id)">
                  {{ department.name }}
                </option>
              </select>
              <p v-if="departmentsQuery.isLoading.value" class="mt-1 text-xs text-secondary-text">
                Đang tải phòng ban…
              </p>
              <p v-else-if="errors.departmentId" class="mt-1 text-xs text-rose-600">
                {{ errors.departmentId }}
              </p>
            </div>
            <div>
              <label :class="labelClass">Chức vụ <span class="text-rose-500">*</span></label>
              <select
                v-model="form.positionId"
                :disabled="!form.departmentId || positionsQuery.isLoading.value"
                :class="[inputClass, errors.positionId && 'border-rose-400']"
              >
                <option value="" disabled>
                  {{ form.departmentId ? '— Chọn chức vụ —' : '— Chọn phòng ban trước —' }}
                </option>
                <option v-for="position in filteredPositions" :key="position.id" :value="String(position.id)">
                  {{ position.name }}
                </option>
              </select>
              <p v-if="positionsQuery.isLoading.value" class="mt-1 text-xs text-secondary-text">
                Đang tải chức vụ…
              </p>
              <p v-else-if="errors.positionId" class="mt-1 text-xs text-rose-600">
                {{ errors.positionId }}
              </p>
              <p v-else-if="form.departmentId && !filteredPositions.length" class="mt-1 text-xs text-amber-600">
                Chưa có chức vụ cho phòng ban này.
              </p>
            </div>
            <div class="md:col-span-2">
              <label :class="labelClass">Quản lý trực tiếp</label>
              <select
                v-model="form.managerId"
                :disabled="managersQuery.isLoading.value"
                :class="inputClass"
              >
                <option value="">— Không chọn —</option>
                <option v-for="manager in managers" :key="manager.id" :value="String(manager.id)">
                  {{ manager.fullName }} · {{ manager.employeeCode }}
                </option>
              </select>
              <p v-if="managersQuery.isLoading.value" class="mt-1 text-xs text-secondary-text">
                Đang tải danh sách quản lý…
              </p>
            </div>
          </div>
        </FormCard>
      </div>

      <div class="space-y-6 xl:sticky xl:top-6 self-start">
        <FormCard title="Thiết lập nhanh" :icon="Save">
          <div class="space-y-4">
            <div class="rounded-xl border border-border-standard bg-surface/70 px-4 py-4 dark:border-border dark:bg-elevated/70">
              <p class="text-xs font-bold text-secondary-text">Mã nhân viên</p>
              <p class="mt-1 font-mono text-sm text-primary-text">{{ form.employeeCode || 'Đang tải...' }}</p>
            </div>
            <div
              class="flex items-center justify-between rounded-xl border border-border-standard bg-surface px-4 py-4 dark:border-border dark:bg-elevated"
            >
              <div>
                <p class="text-sm font-medium text-primary-text dark:text-primary-text">
                  Trạng thái nhân viên
                </p>
                <p class="text-xs text-tertiary-text">
                  {{ form.isActive ? 'ACTIVE' : 'INACTIVE' }}
                </p>
              </div>
              <button
                type="button"
                @click="form.isActive = !form.isActive"
                :class="[
                  'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200',
                  form.isActive ? 'bg-primary' : 'bg-muted',
                ]"
              >
                <span
                  :class="[
                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-card shadow-lg transition-transform duration-200',
                    form.isActive ? 'translate-x-5' : 'translate-x-0',
                  ]"
                ></span>
              </button>
            </div>
          </div>
        </FormCard>

        <div
          class="space-y-4 rounded-xl border border-border-standard bg-card p-5 shadow-sm dark:border-border dark:bg-card"
        >
          <div class="space-y-1">
            <p class="text-sm font-semibold text-primary-text">Cập nhật hồ sơ</p>
            <p class="text-xs leading-relaxed text-tertiary-text">
              Thay đổi tại đây sẽ cập nhật trực tiếp hồ sơ nhân viên trong hệ thống.
            </p>
          </div>
          <button
            @click="handleSubmit"
            :disabled="updateEmployee.isPending.value"
            :class="[
              'flex w-full items-center justify-center gap-2 h-11 rounded-lg text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-colors dark:shadow-none',
              updateEmployee.isPending.value
                ? 'bg-primary/70 cursor-not-allowed'
                : 'bg-primary hover:brightness-110',
            ]"
          >
            <RefreshCw :class="['h-4 w-4', { 'animate-spin': updateEmployee.isPending.value }]" />
            {{ updateEmployee.isPending.value ? 'Đang cập nhật...' : 'Cập nhật thay đổi' }}
          </button>
          <button
            @click="router.push('/employees')"
            class="flex w-full items-center justify-center h-10 rounded-lg border border-border-standard text-sm font-medium text-secondary-text hover:bg-surface transition-colors"
          >
            Hủy bỏ
          </button>

          <div v-if="submitError" class="pt-2 text-sm text-rose-600">
            {{ submitError }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
