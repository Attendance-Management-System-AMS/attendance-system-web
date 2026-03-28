<script setup lang="ts">
import { computed, reactive, ref, watchEffect } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, Briefcase, RefreshCw, Shield, User } from 'lucide-vue-next'
import PageHeader from '@/components/ui/PageHeader.vue'
import FormCard from '@/components/ui/FormCard.vue'
import { useQuery } from '@tanstack/vue-query'
import { employeeApi } from '@/services/employee.service'
import { queryKeys } from '@/lib/queryKeys'
import { useEmployees } from '@/composables/useEmployees'
import type { Employee, UpdateEmployee } from '@/types/employee'

const router = useRouter()
const route = useRoute()

const { updateEmployee } = useEmployees()

const employeeId = computed(() => Number(route.params.id))

const form = reactive({
  fullName: '',
  empCode: '',
  nationalId: '',
  phone: '',
  email: '',
  address: '',
  department: '',
  position: '',
  shift: '',
  joinDate: '',
  username: '',
  role: '',
  isActive: true,
})

const departments = ['Nhân sự', 'Công nghệ', 'Tài chính', 'Kinh doanh', 'Vận hành', 'IT']
const shifts = ['Ca sáng (08:00–17:30)', 'Ca chiều (13:00–22:00)', 'Ca đêm (22:00–06:00)']
const roles = [
  { label: 'Nhân viên', value: 'employee' },
  { label: 'Quản lý', value: 'manager' },
  { label: 'Quản trị viên', value: 'admin' },
]

const inputClass =
  'h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all dark:border-slate-700 dark:bg-slate-800 dark:text-white'

const labelClass = 'block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5'

const submitError = ref('')

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
  form.empCode = e.employeeCode ?? ''
  form.email = e.email ?? ''
  form.joinDate = e.joinDate ?? ''

  form.department = e.departmentName ?? ''
  form.position = e.positionName ?? ''
  form.shift = e.shift ?? ''

  form.isActive = (e.status ?? 'active').toLowerCase() === 'active'
})

const handleSubmit = async () => {
  submitError.value = ''

  if (!form.fullName.trim() || !form.empCode.trim() || !form.email.trim()) {
    submitError.value = 'Vui lòng điền đầy đủ họ tên, mã nhân viên và email.'
    return
  }

  const payload: UpdateEmployee = {
    fullName: form.fullName.trim(),
    employeeCode: form.empCode.trim(),
    email: form.email.trim(),
    status: form.isActive ? 'active' : 'inactive',
    joinDate: form.joinDate || undefined,
  }

  try {
    await updateEmployee.mutateAsync({ id: employeeId.value, data: payload })
    router.push(`/employees/${employeeId.value}`)
  } catch (err) {
    console.error('Update employee failed:', err)
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
          class="flex items-center gap-2 h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft class="h-4 w-4" />
          Quay lại
        </button>
      </template>
    </PageHeader>

    <div class="grid grid-cols-3 gap-6">
      <!-- Left: Main form -->
      <div class="col-span-2 space-y-6">
        <FormCard title="Thông tin cá nhân" :icon="User">
          <div class="grid grid-cols-2 gap-4">
            <div class="col-span-2">
              <label :class="labelClass">Họ và tên <span class="text-rose-500">*</span></label>
              <input v-model="form.fullName" type="text" :class="inputClass" />
            </div>
            <div>
              <label :class="labelClass">Mã nhân viên</label>
              <input v-model="form.empCode" type="text" :class="inputClass + ' font-mono'" readonly />
            </div>
            <div>
              <label :class="labelClass">Số CCCD</label>
              <input v-model="form.nationalId" type="text" :class="inputClass + ' font-mono'" />
            </div>
            <div>
              <label :class="labelClass">Số điện thoại</label>
              <input v-model="form.phone" type="tel" :class="inputClass" />
            </div>
            <div>
              <label :class="labelClass">Email <span class="text-rose-500">*</span></label>
              <input v-model="form.email" type="email" :class="inputClass" />
            </div>
            <div class="col-span-2">
              <label :class="labelClass">Địa chỉ</label>
              <input v-model="form.address" type="text" :class="inputClass" />
            </div>
          </div>
        </FormCard>

        <FormCard title="Thông tin công việc" :icon="Briefcase">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label :class="labelClass">Phòng ban <span class="text-rose-500">*</span></label>
              <select v-model="form.department" :class="inputClass">
                <option v-for="dept in departments" :key="dept" :value="dept">{{ dept }}</option>
              </select>
            </div>
            <div>
              <label :class="labelClass">Chức vụ</label>
              <input v-model="form.position" type="text" :class="inputClass" />
            </div>
            <div>
              <label :class="labelClass">Ca làm việc</label>
              <select v-model="form.shift" :class="inputClass">
                <option v-for="s in shifts" :key="s" :value="s">{{ s }}</option>
              </select>
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
        <FormCard title="Tài khoản & Phân quyền" :icon="Shield">
          <div class="space-y-4">
            <div>
              <label :class="labelClass">Tên đăng nhập</label>
              <input v-model="form.username" type="text" :class="inputClass + ' font-mono'" />
            </div>
            <div>
              <label :class="labelClass">Vai trò</label>
              <select v-model="form.role" :class="inputClass">
                <option v-for="r in roles" :key="r.value" :value="r.value">{{ r.label }}</option>
              </select>
            </div>
            <div class="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
              <div>
                <p class="text-sm font-medium text-slate-900 dark:text-white">Trạng thái tài khoản</p>
                <p class="text-xs text-slate-400">{{ form.isActive ? 'Đang hoạt động' : 'Đã vô hiệu' }}</p>
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
        <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
          <button
            @click="handleSubmit"
            :disabled="updateEmployee.isPending.value"
            :class="[
              'flex w-full items-center justify-center gap-2 h-11 rounded-xl text-sm font-semibold text-white shadow-lg shadow-emerald-200 transition-colors dark:shadow-none',
              updateEmployee.isPending.value ? 'bg-emerald-300 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700',
            ]"
          >
            <RefreshCw class="h-4 w-4" />
            {{ updateEmployee.isPending.value ? 'Đang cập nhật...' : 'Cập nhật thay đổi' }}
          </button>
          <button
            @click="router.push('/employees')"
            class="flex w-full items-center justify-center h-10 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Hủy bỏ
          </button>

          <div class="border-t border-slate-100 dark:border-slate-800 pt-3">
            <div class="flex items-center justify-between">
              <span class="text-[10px] text-slate-400">Mã nhân viên</span>
              <span class="font-mono text-[11px] font-bold text-slate-600">{{ form.empCode }}</span>
            </div>
          </div>

          <div v-if="submitError" class="pt-2 text-sm text-rose-600">
            {{ submitError }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
