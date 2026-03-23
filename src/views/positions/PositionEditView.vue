<script setup lang="ts">
import { computed, reactive, ref, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, BriefcaseBusiness, Pencil, Save, Shield } from 'lucide-vue-next'
import PageHeader from '@/components/ui/PageHeader.vue'
import FormCard from '@/components/ui/FormCard.vue'
import { positionApi } from '@/services/position.service'
import { usePositions } from '@/composables/usePositions'
import type { CreatePosition } from '@/types/position'
import { useQuery } from '@tanstack/vue-query'

const router = useRouter()
const route = useRoute()
const { updatePosition } = usePositions()

const positionId = computed(() => {
  const raw = route.params.id
  const num = Number(raw)
  return Number.isFinite(num) ? num : raw
})

const form = reactive({
  name: '',
  code: '',
  description: '',
  departmentId: null as number | null,
  level: null as number | null,
  status: 'active' as 'active' | 'inactive' | string,
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
  'h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all dark:border-slate-700 dark:bg-slate-800 dark:text-white'
const labelClass = 'block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5'

const validate = () => {
  errors.name = form.name.trim() ? '' : 'Vui lòng nhập tên chức vụ'
  errors.departmentId = form.departmentId !== null && Number.isFinite(form.departmentId) ? '' : 'Vui lòng nhập departmentId'
  errors.level = form.level !== null && Number.isFinite(form.level) ? '' : 'Vui lòng nhập level'
  errors.status = form.status ? '' : 'Vui lòng chọn trạng thái'

  return !Object.values(errors).some(Boolean)
}

const positionQuery = useQuery({
  queryKey: ['position', positionId],
  enabled: computed(() => Boolean(positionId.value)),
  queryFn: async () => {
    const res = await positionApi.getById(positionId.value)
    return res.data.result
  },
})

watchEffect(() => {
  const p = positionQuery.data.value as any
  if (!p) return

  form.name = p.name ?? ''
  form.code = p.code ?? ''
  form.description = p.description ?? ''
  form.departmentId = typeof p.departmentId === 'number' ? p.departmentId : p.departmentId ? Number(p.departmentId) : null
  form.level = typeof p.level === 'number' ? p.level : p.level ? Number(p.level) : null
  form.status = p.status ?? 'active'
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
    departmentId: form.departmentId ?? undefined,
    level: form.level !== null ? form.level : undefined,
    status: form.status,
  }

  try {
    await updatePosition.mutateAsync({ id: positionId.value as any, data: payload })
    router.push('/shifts')
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
          class="flex items-center gap-2 h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft class="h-4 w-4" />
          Quay lại
        </button>
      </template>
    </PageHeader>

    <div v-if="positionQuery.isLoading.value" class="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
      Đang tải thông tin...
    </div>

    <div
      v-else-if="positionQuery.isError.value"
      class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
    >
      {{ (positionQuery.error.value as Error | undefined)?.message || 'Không thể tải chi tiết chức vụ.' }}
      <div>
        <button class="mt-2 text-indigo-600 underline hover:text-indigo-800 dark:text-indigo-400" @click="positionQuery.refetch()">
          Thử lại
        </button>
      </div>
    </div>

    <div v-else>
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
                  DepartmentId <span class="text-rose-500">*</span>
                </label>
                <input
                  v-model.number="form.departmentId"
                  type="number"
                  :class="[inputClass, errors.departmentId && 'border-rose-400']"
                />
                <p v-if="errors.departmentId" class="mt-1 text-xs text-rose-600">{{ errors.departmentId }}</p>
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
                :disabled="updatePosition.isPending.value"
                :class="[
                  'flex w-full items-center justify-center gap-2 h-11 rounded-xl text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-colors',
                  updatePosition.isPending.value ? 'bg-indigo-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700',
                ]"
              >
                <Save class="h-4 w-4" />
                {{ updatePosition.isPending.value ? 'Đang cập nhật...' : 'Cập nhật' }}
              </button>

              <button
                @click="router.push('/shifts')"
                class="flex w-full items-center justify-center h-10 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
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

