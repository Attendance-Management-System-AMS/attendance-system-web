<script setup lang="ts">
import FormCard from '@/components/ui/FormCard.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import { computed, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Briefcase, Save, Shield, User } from 'lucide-vue-next'
import { useEmployees } from '@/composables/useEmployees'
import { useDepartments } from '@/composables/useDepartments'
import { usePositions } from '@/composables/usePositions'
import type { CreateEmployee } from '@/types/employee'
import type { Department } from '@/types/department'
import type { Position } from '@/types/position'

const router = useRouter()
const { createEmployee } = useEmployees()
const { departmentsQuery } = useDepartments()
const { positionsQuery } = usePositions()

const departments = computed<Department[]>(() => departmentsQuery.data.value?.content ?? [])
const positions = computed<Position[]>(() => positionsQuery.data.value ?? [])

const filteredPositions = computed(() => {
  const deptId = form.departmentId
  if (!deptId) return []
  return positions.value.filter((p) => String(p.departmentId ?? '') === String(deptId))
})

const form = reactive({
  fullName: '',
  empCode: '',
  nationalId: '',
  phone: '',
  email: '',
  address: '',
  departmentId: '',
  positionId: '',
  shift: '',
  joinDate: '',
  username: '',
  role: 'employee',
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
const shifts = ['Ca sáng (08:00–17:30)', 'Ca chiều (13:00–22:00)', 'Ca đêm (22:00–06:00)']
const roles = [
  { label: 'Nhân viên', value: 'employee' },
  { label: 'Quản lý', value: 'manager' },
  { label: 'Quản trị viên', value: 'admin' },
]

const inputClass =
  'h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all dark:border-slate-700 dark:bg-slate-800 dark:text-white'

const labelClass = 'block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5'

type FieldName =
  | 'fullName'
  | 'empCode'
  | 'email'
  | 'departmentId'
  | 'positionId'
  | 'shift'
  | 'username'
type FieldErrors = Record<FieldName, string>

const errors = reactive<FieldErrors>({
  fullName: '',
  empCode: '',
  email: '',
  departmentId: '',
  positionId: '',
  shift: '',
  username: '',
})

const submitMessage = ref('')

const validateForm = () => {
  errors.fullName = form.fullName.trim() ? '' : 'Vui lòng nhập họ và tên'
  errors.empCode = form.empCode.trim() ? '' : 'Vui lòng nhập mã nhân viên'
  errors.email = form.email.trim()
    ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
      ? ''
      : 'Email không đúng định dạng'
    : 'Vui lòng nhập email'
  errors.departmentId = form.departmentId ? '' : 'Vui lòng chọn phòng ban'
  errors.positionId = form.positionId ? '' : 'Vui lòng chọn chức vụ'
  errors.shift = form.shift ? '' : 'Vui lòng chọn ca làm việc'
  errors.username = form.username.trim() ? '' : 'Vui lòng nhập tên đăng nhập'

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
    employeeCode: form.empCode.trim(),
    email: form.email.trim(),
    departmentId: numericIdForApi(form.departmentId),
    positionId: numericIdForApi(form.positionId),
    status: form.isActive ? 'ACTIVE' : 'INACTIVE',
    joinDate: form.joinDate || undefined,
  }

  try {
    await createEmployee.mutateAsync(payload)
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
          class="flex items-center gap-2 h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft class="h-4 w-4" />
          Quay lại
        </button>
      </template>
    </PageHeader>

    <div class="grid grid-cols-3 gap-6">
      <div
        v-if="submitMessage"
        :class="[
          'col-span-3 rounded-xl border px-4 py-3 text-sm',
          hasErrors
            ? 'border-rose-200 bg-rose-50 text-rose-700'
            : 'border-emerald-200 bg-emerald-50 text-emerald-700',
        ]"
      >
        {{ submitMessage }}
      </div>

      <!-- Left: Main form -->
      <div class="col-span-2 space-y-6">
        <!-- Personal info -->
        <FormCard title="Thông tin cá nhân" :icon="User">
          <div class="grid grid-cols-2 gap-4">
            <div class="col-span-2">
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
              <label :class="labelClass">Mã nhân viên <span class="text-rose-500">*</span></label>
              <input
                v-model="form.empCode"
                type="text"
                placeholder="NV001"
                :class="[inputClass, errors.empCode && 'border-rose-400']"
                class="font-mono"
              />
              <p v-if="errors.empCode" class="mt-1 text-xs text-rose-600">{{ errors.empCode }}</p>
            </div>
            <div>
              <label :class="labelClass">Số CCCD</label>
              <input
                v-model="form.nationalId"
                type="text"
                placeholder="0XXXXXXXXX"
                :class="inputClass"
                class="font-mono"
              />
            </div>
            <div>
              <label :class="labelClass">Số điện thoại</label>
              <input v-model="form.phone" type="tel" placeholder="0XXXXXXXXX" :class="inputClass" />
            </div>
            <div>
              <label :class="labelClass">Email <span class="text-rose-500">*</span></label>
              <input
                v-model="form.email"
                type="email"
                placeholder="nhanvien@company.vn"
                :class="[inputClass, errors.email && 'border-rose-400']"
              />
              <p v-if="errors.email" class="mt-1 text-xs text-rose-600">{{ errors.email }}</p>
            </div>
            <div class="col-span-2">
              <label :class="labelClass">Địa chỉ</label>
              <input
                v-model="form.address"
                type="text"
                placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
                :class="inputClass"
              />
            </div>
          </div>
        </FormCard>

        <!-- Work info -->
        <FormCard title="Thông tin công việc" :icon="Briefcase">
          <div class="grid grid-cols-2 gap-4">
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
              <p v-if="departmentsQuery.isLoading.value" class="mt-1 text-xs text-slate-500">
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
              <p v-if="positionsQuery.isLoading.value" class="mt-1 text-xs text-slate-500">
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
            <div>
              <label :class="labelClass">Ca làm việc <span class="text-rose-500">*</span></label>
              <select v-model="form.shift" :class="[inputClass, errors.shift && 'border-rose-400']">
                <option value="">-- Chọn ca --</option>
                <option v-for="s in shifts" :key="s" :value="s">{{ s }}</option>
              </select>
              <p v-if="errors.shift" class="mt-1 text-xs text-rose-600">{{ errors.shift }}</p>
            </div>
            <div>
              <label :class="labelClass">Ngày vào làm</label>
              <input v-model="form.joinDate" type="date" :class="inputClass" />
            </div>
          </div>
        </FormCard>
      </div>

      <!-- Right: Account + Actions -->
      <div class="space-y-6">
        <!-- Account & permissions -->
        <FormCard title="Tài khoản & Phân quyền" :icon="Shield">
          <div class="space-y-4">
            <div>
              <label :class="labelClass">Tên đăng nhập <span class="text-rose-500">*</span></label>
              <input
                v-model="form.username"
                type="text"
                placeholder="ten.dangnhap"
                :class="[inputClass, errors.username && 'border-rose-400']"
                class="font-mono"
              />
              <p v-if="errors.username" class="mt-1 text-xs text-rose-600">{{ errors.username }}</p>
            </div>
            <div>
              <label :class="labelClass">Vai trò</label>
              <select v-model="form.role" :class="inputClass">
                <option v-for="r in roles" :key="r.value" :value="r.value">{{ r.label }}</option>
              </select>
            </div>
            <div
              class="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800"
            >
              <div>
                <p class="text-sm font-medium text-slate-900 dark:text-white">
                  Kích hoạt tài khoản
                </p>
                <p class="text-xs text-slate-400">Nhân viên có thể đăng nhập ngay</p>
              </div>
              <button
                type="button"
                @click="form.isActive = !form.isActive"
                :class="[
                  'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200',
                  form.isActive ? 'bg-indigo-600' : 'bg-slate-200',
                ]"
              >
                <span
                  :class="[
                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-200',
                    form.isActive ? 'translate-x-5' : 'translate-x-0',
                  ]"
                ></span>
              </button>
            </div>
          </div>
        </FormCard>

        <!-- Action buttons -->
        <div
          class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3"
        >
          <button
            @click="handleSubmit"
            :disabled="isSubmitting"
            :class="[
              'flex w-full items-center justify-center gap-2 h-11 rounded-xl text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-colors dark:shadow-none',
              isSubmitting
                ? 'bg-indigo-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700',
            ]"
          >
            <Save class="h-4 w-4" />
            {{ isSubmitting ? 'Đang lưu...' : 'Lưu nhân viên' }}
          </button>
          <button
            @click="router.push('/employees')"
            class="flex w-full items-center justify-center h-10 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Hủy bỏ
          </button>

          <div class="border-t border-slate-100 dark:border-slate-800 pt-3">
            <p class="text-[10px] text-slate-400 text-center leading-relaxed">
              Nhân viên sẽ nhận email thông báo tài khoản sau khi được tạo thành công
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
