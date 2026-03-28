<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, BriefcaseBusiness, Save, Shield } from 'lucide-vue-next'
import { usePositions } from '@/composables/usePositions'
import { useDepartments } from '@/composables/useDepartments'
import type { CreatePosition } from '@/types/position'
import type { Department } from '@/types/department'

const router = useRouter()
const { createPosition } = usePositions()
const { departmentsQuery } = useDepartments()
const departments = computed<Department[]>(() => departmentsQuery.data.value ?? [])

const form = reactive({
  name: '',
  code: '',
  description: '',
  departmentId: '',
  level: 1,
  status: 'active' as 'active' | 'inactive' | string,
})

function departmentIdForApi(v: string): string | number | undefined {
  if (v === '') return undefined
  if (/^\d+$/.test(v)) return Number(v)
  return v
}

type FieldName = 'name' | 'departmentId' | 'level' | 'status'
const errors = reactive<Record<FieldName, string>>({
  name: '',
  departmentId: '',
  level: '',
  status: '',
})

const submitError = ref('')

const inputClass =
  'h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all dark:border-slate-700 dark:bg-slate-800 dark:text-white'
const labelClass = 'block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5'

const hasErrors = computed(() => Object.values(errors).some(Boolean))

const validate = () => {
  errors.name = form.name.trim() ? '' : 'Vui lòng nhập tên chức vụ'
  errors.departmentId = form.departmentId ? '' : 'Vui lòng chọn phòng ban'
  errors.level = Number.isFinite(form.level) ? '' : 'Vui lòng nhập level hợp lệ'
  errors.status = form.status ? '' : 'Vui lòng chọn trạng thái'

  return !hasErrors.value
}

const handleSubmit = async () => {
  submitError.value = ''
  if (!validate()) {
    submitError.value = 'Vui lòng kiểm tra lại các trường bắt buộc.'
    return
  }

  const payload: CreatePosition = {
    name: form.name.trim(),
    code: form.code.trim() || undefined,
    description: form.description.trim() || undefined,
    departmentId: departmentIdForApi(form.departmentId),
    level: Number.isFinite(form.level) ? form.level : 1,
    status: form.status,
  }

  try {
    await createPosition.mutateAsync(payload)
    router.push('/positions')
  } catch (err) {
    console.error('Create position failed:', err)
    submitError.value = 'Tạo chức vụ thất bại. Vui lòng thử lại.'
  }
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader title="Thêm chức vụ" description="Tạo mới chức vụ nhân sự">
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

    <div v-if="submitError" class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
      {{ submitError }}
    </div>

    <div class="grid grid-cols-3 gap-6">
      <div class="col-span-2 space-y-6">
        <FormCard title="Thông tin chức vụ" :icon="BriefcaseBusiness">
          <div class="grid grid-cols-2 gap-4">
            <div class="col-span-2">
              <label :class="labelClass">
                Tên chức vụ <span class="text-rose-500">*</span>
              </label>
              <input v-model="form.name" type="text" :class="[inputClass, errors.name && 'border-rose-400']" />
              <p v-if="errors.name" class="mt-1 text-xs text-rose-600">{{ errors.name }}</p>
            </div>

            <div>
              <label :class="labelClass">Mã</label>
              <input v-model="form.code" type="text" :class="inputClass + ' font-mono'" />
            </div>

            <div>
              <label :class="labelClass">
                Phòng ban <span class="text-rose-500">*</span>
              </label>
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
              <p v-if="departmentsQuery.isLoading.value" class="mt-1 text-xs text-slate-500">Đang tải danh sách phòng ban…</p>
              <p v-else-if="errors.departmentId" class="mt-1 text-xs text-rose-600">{{ errors.departmentId }}</p>
            </div>

            <div>
              <label :class="labelClass">
                Level <span class="text-rose-500">*</span>
              </label>
              <input
                v-model.number="form.level"
                type="number"
                min="1"
                :class="[inputClass, errors.level && 'border-rose-400']"
              />
              <p v-if="errors.level" class="mt-1 text-xs text-rose-600">{{ errors.level }}</p>
            </div>

            <div>
              <label :class="labelClass">
                Trạng thái <span class="text-rose-500">*</span>
              </label>
              <select v-model="form.status" :class="[inputClass, errors.status && 'border-rose-400']">
                <option value="active">active</option>
                <option value="inactive">inactive</option>
              </select>
              <p v-if="errors.status" class="mt-1 text-xs text-rose-600">{{ errors.status }}</p>
            </div>

            <div class="col-span-2">
              <label :class="labelClass">Mô tả</label>
              <textarea v-model="form.description" rows="3" :class="inputClass" />
            </div>
          </div>
        </FormCard>
      </div>

      <div class="space-y-6">
        <FormCard title="Hành động" :icon="Shield">
          <div class="space-y-3">
            <button
              @click="handleSubmit"
              :disabled="createPosition.isPending.value"
              :class="[
                'flex w-full items-center justify-center gap-2 h-11 rounded-xl text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-colors',
                createPosition.isPending.value ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700',
              ]"
            >
              <Save class="h-4 w-4" />
              {{ createPosition.isPending.value ? 'Đang tạo...' : 'Tạo chức vụ' }}
            </button>

            <button
              @click="router.push('/positions')"
              class="flex w-full items-center justify-center h-10 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Hủy bỏ
            </button>
          </div>
        </FormCard>
      </div>
    </div>
  </div>
</template>

