<script setup lang="ts">
import FormCard from '@/shared/ui/FormCard.vue'
import PageHeader from '@/shared/ui/PageHeader.vue'
import { computed, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useQueryClient } from '@tanstack/vue-query'
import { ArrowLeft, Briefcase, Save, User } from 'lucide-vue-next'
import { useEmployees } from '@/modules/employees/composables/useEmployees'
import { useDepartments } from '@/modules/departments/composables/useDepartments'
import { usePositions } from '@/modules/positions/composables/usePositions'
import { queryKeys } from '@/shared/lib/queryKeys'
import type { CreateEmployee } from '@/modules/employees/types/employee.types'
import type { Department } from '@/modules/departments/types/department.types'
import type { Position } from '@/modules/positions/types/position.types'
import type { Employee } from '@/modules/employees/types/employee.types'

const router = useRouter()
const queryClient = useQueryClient()
const { createEmployee, employeesQuery: managersQuery } = useEmployees({
  size: 200,
  sort: 'fullName',
  sortDir: 'asc',
  status: 'ACTIVE',
})
const { departmentsQuery } = useDepartments()
const { positionsQuery } = usePositions()

const departments = computed<Department[]>(() => departmentsQuery.data.value?.content ?? [])
const positions = computed<Position[]>(() => positionsQuery.data.value ?? [])
const managers = computed<Employee[]>(() => managersQuery.data.value?.content ?? [])

const filteredPositions = computed(() => {
  const deptId = form.departmentId
  if (!deptId) return []
  return positions.value.filter((p) => String(p.departmentId ?? '') === String(deptId))
})

const form = reactive({
  fullName: '',
  gender: '',
  email: '',
  departmentId: '',
  positionId: '',
  managerId: '',
  joinDate: '',
  isActive: true,
})

watch(
  () => form.departmentId,
  () => {
    form.positionId = ''
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

const submitMessage = ref('')

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

const hasErrors = computed(() => Object.values(errors).some((value) => Boolean(value)))
const isSubmitting = computed(() => createEmployee.isPending.value)

const handleSubmit = async () => {
  submitMessage.value = ''
  const isValid = validateForm()

  if (!isValid) {
    submitMessage.value = 'Vui lòng điền đầy đủ các trường bắt buộc trước khi lưu.'
    return
  }

  const payload: CreateEmployee = {
    fullName: form.fullName.trim(),
    gender: form.gender || undefined,
    email: form.email.trim(),
    departmentId: numericIdForApi(form.departmentId),
    positionId: numericIdForApi(form.positionId),
    managerId: numericIdForApi(form.managerId),
    status: form.isActive ? 'ACTIVE' : 'INACTIVE',
    joinDate: form.joinDate || undefined,
  }

  try {
    await createEmployee.mutateAsync(payload)
    await queryClient.invalidateQueries({
      queryKey: queryKeys.employees.all(),
      refetchType: 'all',
    })
    router.push('/employees')
  } catch (error) {
    submitMessage.value = 'Tạo nhân viên thất bại. Vui lòng thử lại.'
    console.error('Create employee failed:', error)
  }
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader title="Thêm nhân viên mới" description="Điền thông tin để tạo hồ sơ nhân viên mới">
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

    <div class="space-y-6">
      <div
        v-if="submitMessage"
        :class="[hasErrors ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700', 'rounded-lg border px-4 py-3 text-sm']"
      >
        {{ submitMessage }}
      </div>

      <div class="grid gap-6 xl:grid-cols-[minmax(0,1.75fr)_360px]">
        <div class="space-y-6">
          <FormCard title="Thông tin cá nhân" :icon="User">
            <div class="grid gap-4 md:grid-cols-2">
              <div class="md:col-span-2">
                <label :class="labelClass">Họ và tên <span class="text-rose-500">*</span></label>
                <input
                  v-model="form.fullName"
                  type="text"
                  placeholder="Nguyễn Văn A"
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
                  placeholder="nhanvien@company.vn"
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
                  <option v-for="d in departments" :key="d.id" :value="String(d.id)">
                    {{ d.name }}
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
                  <option v-for="p in filteredPositions" :key="p.id" :value="String(p.id)">
                    {{ p.name }}
                  </option>
                </select>
                <p v-if="positionsQuery.isLoading.value" class="mt-1 text-xs text-secondary-text">
                  Đang tải chức vụ…
                </p>
                <p v-else-if="errors.positionId" class="mt-1 text-xs text-rose-600">
                  {{ errors.positionId }}
                </p>
                <p
                  v-else-if="form.departmentId && !filteredPositions.length"
                  class="mt-1 text-xs text-amber-600"
                >
                  Chưa có chức vụ cho phòng ban này. Hãy thêm chức vụ trong mục Chức vụ.
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
              <p class="text-sm font-semibold text-primary-text">Lưu hồ sơ</p>
              <p class="text-xs leading-relaxed text-tertiary-text">
                Sau khi lưu, hệ thống sẽ tạo hồ sơ nhân viên, username theo mã nhân viên và mật khẩu mặc định dạng <code>Emp@0025</code>.
              </p>
            </div>
            <button
              @click="handleSubmit"
              :disabled="isSubmitting"
              :class="[
                'flex w-full items-center justify-center gap-2 h-11 rounded-lg text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-colors dark:shadow-none',
                isSubmitting
                  ? 'bg-primary cursor-not-allowed'
                  : 'bg-primary hover:bg-primary',
              ]"
            >
              <Save class="h-4 w-4" />
              {{ isSubmitting ? 'Đang lưu...' : 'Lưu nhân viên' }}
            </button>
            <button
              @click="router.push('/employees')"
              class="flex w-full items-center justify-center h-10 rounded-lg border border-border-standard text-sm font-medium text-secondary-text hover:bg-surface transition-colors"
            >
              Hủy bỏ
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
