<script setup lang="ts">
import { computed, reactive, ref, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Save, Shield, Timer } from 'lucide-vue-next'
import { useQuery } from '@tanstack/vue-query'
import PageHeader from '@/components/ui/PageHeader.vue'
import FormCard from '@/components/ui/FormCard.vue'
import { shiftApi } from '@/services/shift.service'
import { useShifts } from '@/composables/useShifts'
import type { CreateShift } from '@/types/shift'

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
  'h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all dark:border-slate-700 dark:bg-slate-800 dark:text-white'
const labelClass = 'block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5'

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
  queryKey: ['attendance-shift', shiftId],
  enabled: computed(() => shiftId.value != null),
  queryFn: async () => {
    const id = shiftId.value!
    const res = await shiftApi.getById(id)
    return res.data.result
  },
})

watchEffect(() => {
  const s = shiftQuery.data.value as any
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
          class="flex items-center gap-2 h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft class="h-4 w-4" />
          Quay lại
        </button>
      </template>
    </PageHeader>

    <div v-if="shiftQuery.isLoading.value" class="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
      Đang tải thông tin...
    </div>

    <div v-else-if="shiftQuery.isError.value" class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
      {{ (shiftQuery.error.value as Error | undefined)?.message || 'Không thể tải chi tiết ca làm.' }}
      <div>
        <button class="mt-2 text-indigo-600 underline hover:text-indigo-800 dark:text-indigo-400" @click="shiftQuery.refetch()">
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
                  'flex w-full items-center justify-center gap-2 h-11 rounded-xl text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-colors',
                  updateShift.isPending.value ? 'bg-indigo-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700',
                ]"
              >
                <Save class="h-4 w-4" />
                {{ updateShift.isPending.value ? 'Đang cập nhật...' : 'Cập nhật' }}
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

