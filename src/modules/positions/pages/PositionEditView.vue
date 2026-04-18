<script setup lang="ts">
import FormCard from '@/shared/ui/FormCard.vue'
import PageHeader from '@/shared/ui/PageHeader.vue'
import { computed, reactive, ref, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, BriefcaseBusiness, Save, Shield } from 'lucide-vue-next'
import { positionApi } from '@/modules/positions/api/position.api'
import { usePositions } from '@/modules/positions/composables/usePositions'
import { useDepartments } from '@/modules/departments/composables/useDepartments'
import type { CreatePosition, Position } from '@/modules/positions/types/position.types'
import type { Department } from '@/modules/departments/types/department.types'
import { useQuery } from '@tanstack/vue-query'
import { queryKeys } from '@/shared/lib/queryKeys'

const router = useRouter()
const route = useRoute()
const { updatePosition } = usePositions()
const { departmentsQuery } = useDepartments()
const departments = computed<Department[]>(() => departmentsQuery.data.value?.content ?? [])

function departmentIdForApi(v: string): string | number | undefined {
  if (v === '') return undefined
  if (/^\d+$/.test(v)) return Number(v)
  return v
}

const positionId = computed((): string | number | undefined => {
  const raw = route.params.id
  const r = Array.isArray(raw) ? raw[0] : raw
  if (r === undefined || r === '') return undefined
  const num = Number(r)
  return Number.isFinite(num) ? num : String(r)
})

const form = reactive({
  name: '',
  code: '',
  description: '',
  departmentId: '',
  level: null as number | null,
  status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE' | string,
})

type FieldName = 'name' | 'departmentId' | 'level' | 'status'
const errors = reactive<Record<FieldName, string>>({
  name: '',
  departmentId: '',
  level: '',
  status: '',
})

const submitError = ref('')

const inputClass =
  'h-10 w-full rounded-lg border border-border-standard bg-surface px-3 text-sm text-primary-text placeholder:text-tertiary-text focus:border-primary focus:bg-card focus:outline-none focus:ring-2 focus:ring-ring/40 transition-all dark:border-border dark:bg-elevated dark:text-primary-text'
const labelClass = 'block text-xs font-bold  tracking-normal text-secondary-text mb-1.5'

const validate = () => {
  errors.name = form.name.trim() ? '' : 'Vui lòng nhập tên chức vụ'
  errors.departmentId = form.departmentId ? '' : 'Vui lòng chọn phòng ban'
  errors.level = form.level !== null && Number.isFinite(form.level) ? '' : 'Vui lòng nhập level'
  errors.status = form.status ? '' : 'Vui lòng chọn trạng thái'

  return !Object.values(errors).some(Boolean)
}

const positionQuery = useQuery({
  queryKey: computed(() =>
    positionId.value != null
      ? queryKeys.positions.detail(positionId.value)
      : (['position', '__none__'] as const),
  ),
  enabled: computed(() => positionId.value != null),
  queryFn: async () => {
    const id = positionId.value!
    const res = await positionApi.getById(id)
    return res.data.result
  },
})

watchEffect(() => {
  const p = positionQuery.data.value as Position | undefined
  if (!p) return

  form.name = p.name ?? ''
  form.code = p.code ?? ''
  form.description = p.description ?? ''
  form.departmentId = p.departmentId != null && p.departmentId !== '' ? String(p.departmentId) : ''
  form.level = typeof p.level === 'number' ? p.level : p.level ? Number(p.level) : null
  form.status = p.status ?? 'ACTIVE'
})

const positionErrorMessage = computed(() => {
  const err = positionQuery.error.value
  if (err && typeof err === 'object' && 'message' in err) {
    return (err as Error).message
  }
  return ''
})

const handleSubmit = async () => {
  submitError.value = ''
  if (!validate()) {
    submitError.value = 'Vui lòng kiểm tra lại các trường bắt buộc.'
    return
  }

  const payload: Partial<CreatePosition> = {
    name: form.name.trim(),
    code: form.code.trim() || undefined,
    description: form.description.trim() || undefined,
    departmentId: departmentIdForApi(form.departmentId),
    level: form.level !== null ? form.level : undefined,
    status: form.status,
  }

  try {
    await updatePosition.mutateAsync({ id: positionId.value!, data: payload })
    router.push('/positions')
  } catch (err) {
    console.error('Update position failed:', err)
    submitError.value = 'Cập nhật thất bại. Vui lòng thử lại.'
  }
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader title="Sửa chức vụ" description="Cập nhật thông tin chức vụ nhân sự">
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

    <div v-if="positionQuery.isLoading.value" class="rounded-lg border border-border-standard bg-card px-4 py-3 text-sm text-secondary-text">
      Đang tải thông tin...
    </div>

    <div
      v-else-if="positionQuery.isError.value"
      class="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
    >
      {{ positionErrorMessage || 'Không thể tải chi tiết chức vụ.' }}
      <div>
        <button class="mt-2 text-primary underline hover:text-primary dark:text-primary" @click="positionQuery.refetch()">
          Thử lại
        </button>
      </div>
    </div>

    <div v-else>
      <div v-if="submitError" class="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
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
                <p v-if="departmentsQuery.isLoading.value" class="mt-1 text-xs text-secondary-text">Đang tải danh sách phòng ban…</p>
                <p v-else-if="errors.departmentId" class="mt-1 text-xs text-rose-600">{{ errors.departmentId }}</p>
              </div>

              <div>
                <label :class="labelClass">
                  Level <span class="text-rose-500">*</span>
                </label>
                <input v-model.number="form.level" type="number" :class="[inputClass, errors.level && 'border-rose-400']" />
                <p v-if="errors.level" class="mt-1 text-xs text-rose-600">{{ errors.level }}</p>
              </div>

              <div>
                <label :class="labelClass">
                  Trạng thái <span class="text-rose-500">*</span>
                </label>
                <select v-model="form.status" :class="[inputClass, errors.status && 'border-rose-400']">
                  <option value="ACTIVE">Hoạt động</option>
                  <option value="INACTIVE">Vô hiệu</option>
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
                :disabled="updatePosition.isPending.value"
                :class="[
                  'flex w-full items-center justify-center gap-2 h-11 rounded-lg text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-colors',
                  updatePosition.isPending.value ? 'bg-primary cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700',
                ]"
              >
                <Save class="h-4 w-4" />
                {{ updatePosition.isPending.value ? 'Đang cập nhật...' : 'Cập nhật' }}
              </button>

              <button
                @click="router.push('/positions')"
                class="flex w-full items-center justify-center h-10 rounded-lg border border-border-standard text-sm font-medium text-secondary-text hover:bg-surface transition-colors"
              >
                Hủy bỏ
              </button>
            </div>
          </FormCard>
        </div>
      </div>
    </div>
  </div>
</template>

