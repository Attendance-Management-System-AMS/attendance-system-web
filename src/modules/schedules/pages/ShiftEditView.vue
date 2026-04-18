<script setup lang="ts">
import FormCard from '@/shared/ui/FormCard.vue'
import PageHeader from '@/shared/ui/PageHeader.vue'
import { computed, reactive, ref, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Save, Shield, Timer } from 'lucide-vue-next'
import { useQuery } from '@tanstack/vue-query'
import { shiftApi } from '@/modules/schedules/api/shift.api'
import { queryKeys } from '@/shared/lib/queryKeys'
import { useShifts } from '@/modules/schedules/composables/useShifts'
import type { CreateShift, Shift } from '@/modules/schedules/types/shift.types'

const shiftErrorMessage = computed(() => {
  const err = shiftQuery.error.value
  if (err && typeof err === 'object' && 'message' in err) {
    return (err as Error).message
  }
  return 'Không thể tải chi tiết ca làm.'
})

const router = useRouter()
const route = useRoute()
const { updateShift } = useShifts()

const shiftId = computed((): string | number | undefined => {
  const raw = route.params.id
  const r = Array.isArray(raw) ? raw[0] : raw
  if (r === undefined || r === '') return undefined
  const num = Number(r)
  return Number.isFinite(num) ? num : String(r)
})

const form = reactive({
  name: '',
  startTime: '',
  endTime: '',
  breakStart: '',
  breakEnd: '',
  gracePeriod: 10,
})

type FieldName = 'name' | 'startTime' | 'endTime'
const errors = reactive<Record<FieldName, string>>({
  name: '',
  startTime: '',
  endTime: '',
})

const submitError = ref('')

const inputClass =
  'h-10 w-full rounded-lg border border-border-standard bg-surface px-3 text-sm text-primary-text placeholder:text-tertiary-text focus:border-primary focus:bg-card focus:outline-none focus:ring-2 focus:ring-ring/40 transition-all dark:border-border dark:bg-elevated dark:text-primary-text'
const labelClass = 'block text-xs font-bold  tracking-normal text-secondary-text mb-1.5'

const validate = () => {
  errors.name = form.name.trim() ? '' : 'Vui lòng nhập tên ca'
  errors.startTime = form.startTime.trim() ? '' : 'Vui lòng nhập giờ bắt đầu'
  errors.endTime = form.endTime.trim() ? '' : 'Vui lòng nhập giờ kết thúc'
  return !Object.values(errors).some(Boolean)
}

const toTimeSeconds = (t: string) => {
  const v = (t || '').trim()
  if (!v) return ''
  return v.length === 5 ? `${v}:00` : v
}

const toTimeMinutes = (t?: string | null) => {
  if (!t) return ''
  return String(t).slice(0, 5)
}

const shiftQuery = useQuery({
  queryKey: computed(() =>
    shiftId.value != null
      ? queryKeys.shifts.detail(shiftId.value)
      : (['attendance-shift', '__none__'] as const),
  ),
  enabled: computed(() => shiftId.value != null),
  queryFn: async () => {
    const id = shiftId.value!
    const res = await shiftApi.getById(id)
    return res.data.result
  },
})

watchEffect(() => {
  const s = shiftQuery.data.value as Shift | undefined
  if (!s) return
  form.name = s.name ?? ''
  form.startTime = toTimeMinutes(s.startTime)
  form.endTime = toTimeMinutes(s.endTime)
  form.breakStart = toTimeMinutes(s.breakStart)
  form.breakEnd = toTimeMinutes(s.breakEnd)
  form.gracePeriod = typeof s.gracePeriod === 'number' ? s.gracePeriod : Number(s.gracePeriod ?? 0) || 0
})

const handleSubmit = async () => {
  submitError.value = ''
  if (!validate()) {
    submitError.value = 'Vui lòng kiểm tra lại các trường bắt buộc.'
    return
  }

  const payload: Partial<CreateShift> = {
    name: form.name.trim(),
    startTime: toTimeSeconds(form.startTime),
    endTime: toTimeSeconds(form.endTime),
    breakStart: form.breakStart ? toTimeSeconds(form.breakStart) : null,
    breakEnd: form.breakEnd ? toTimeSeconds(form.breakEnd) : null,
    gracePeriod: Number.isFinite(form.gracePeriod) ? form.gracePeriod : 0,
  }

  try {
    await updateShift.mutateAsync({ id: shiftId.value!, data: payload })
    router.push('/shifts')
  } catch (err) {
    console.error('Update shift failed:', err)
    submitError.value = 'Cập nhật thất bại. Vui lòng thử lại.'
  }
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader title="Sửa ca làm" description="Cập nhật thông tin ca làm">
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

    <div v-if="shiftQuery.isLoading.value" class="rounded-lg border border-border-standard bg-card px-4 py-3 text-sm text-secondary-text">
      Đang tải thông tin...
    </div>

    <div v-else-if="shiftQuery.isError.value" class="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
      {{ shiftErrorMessage }}
      <div>
        <button class="mt-2 text-primary underline hover:text-primary dark:text-primary" @click="shiftQuery.refetch()">
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
          <FormCard title="Thông tin ca làm" :icon="Timer">
            <div class="grid grid-cols-2 gap-4">
              <div class="col-span-2">
                <label :class="labelClass">Tên ca <span class="text-rose-500">*</span></label>
                <input v-model="form.name" type="text" :class="[inputClass, errors.name && 'border-rose-400']" />
                <p v-if="errors.name" class="mt-1 text-xs text-rose-600">{{ errors.name }}</p>
              </div>

              <div>
                <label :class="labelClass">Cho phép trễ (phút)</label>
                <input v-model.number="form.gracePeriod" type="number" min="0" :class="inputClass" />
              </div>

              <div>
                <label :class="labelClass">Giờ bắt đầu <span class="text-rose-500">*</span></label>
                <input v-model="form.startTime" type="time" :class="[inputClass, errors.startTime && 'border-rose-400']" />
                <p v-if="errors.startTime" class="mt-1 text-xs text-rose-600">{{ errors.startTime }}</p>
              </div>

              <div>
                <label :class="labelClass">Giờ kết thúc <span class="text-rose-500">*</span></label>
                <input v-model="form.endTime" type="time" :class="[inputClass, errors.endTime && 'border-rose-400']" />
                <p v-if="errors.endTime" class="mt-1 text-xs text-rose-600">{{ errors.endTime }}</p>
              </div>

              <div>
                <label :class="labelClass">Nghỉ giữa ca (bắt đầu)</label>
                <input v-model="form.breakStart" type="time" :class="inputClass" />
              </div>

              <div>
                <label :class="labelClass">Nghỉ giữa ca (kết thúc)</label>
                <input v-model="form.breakEnd" type="time" :class="inputClass" />
              </div>
            </div>
          </FormCard>
        </div>

        <div class="space-y-6">
          <FormCard title="Hành động" :icon="Shield">
            <div class="space-y-3">
              <button
                @click="handleSubmit"
                :disabled="updateShift.isPending.value"
                :class="[
                  'flex w-full items-center justify-center gap-2 h-11 rounded-lg text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-colors',
                  updateShift.isPending.value ? 'bg-primary cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700',
                ]"
              >
                <Save class="h-4 w-4" />
                {{ updateShift.isPending.value ? 'Đang cập nhật...' : 'Cập nhật' }}
              </button>

              <button
                @click="router.push('/shifts')"
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

