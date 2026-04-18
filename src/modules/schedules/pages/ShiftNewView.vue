<script setup lang="ts">
import FormCard from '@/shared/ui/FormCard.vue'
import PageHeader from '@/shared/ui/PageHeader.vue'
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Save, Shield, Timer } from 'lucide-vue-next'
import { useShifts } from '@/modules/schedules/composables/useShifts'
import type { CreateShift } from '@/modules/schedules/types/shift.types'

const router = useRouter()
const { createShift } = useShifts()

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
const hasErrors = computed(() => Object.values(errors).some(Boolean))

const inputClass =
  'h-10 w-full rounded-lg border border-border-standard bg-surface px-3 text-sm text-primary-text placeholder:text-tertiary-text focus:border-primary focus:bg-card focus:outline-none focus:ring-2 focus:ring-ring/40 transition-all dark:border-border dark:bg-elevated dark:text-primary-text'
const labelClass = 'block text-xs font-bold  tracking-normal text-secondary-text mb-1.5'

const validate = () => {
  errors.name = form.name.trim() ? '' : 'Vui lòng nhập tên ca'
  errors.startTime = form.startTime.trim() ? '' : 'Vui lòng nhập giờ bắt đầu'
  errors.endTime = form.endTime.trim() ? '' : 'Vui lòng nhập giờ kết thúc'
  return !hasErrors.value
}

const toTimeSeconds = (t: string) => {
  const v = (t || '').trim()
  if (!v) return ''
  return v.length === 5 ? `${v}:00` : v
}

const handleSubmit = async () => {
  submitError.value = ''
  if (!validate()) {
    submitError.value = 'Vui lòng kiểm tra lại các trường bắt buộc.'
    return
  }

  const payload: CreateShift = {
    name: form.name.trim(),
    startTime: toTimeSeconds(form.startTime),
    endTime: toTimeSeconds(form.endTime),
    breakStart: form.breakStart ? toTimeSeconds(form.breakStart) : null,
    breakEnd: form.breakEnd ? toTimeSeconds(form.breakEnd) : null,
    gracePeriod: Number.isFinite(form.gracePeriod) ? form.gracePeriod : 0,
  }

  try {
    await createShift.mutateAsync(payload)
    router.push('/shifts')
  } catch (err) {
    console.error('Create shift failed:', err)
    submitError.value = 'Tạo ca làm thất bại. Vui lòng thử lại.'
  }
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader title="Thêm ca làm" description="Tạo mới ca làm việc">
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

            <div class="col-span-2 text-xs text-secondary-text">
              Backend hiện trả về định dạng giờ `HH:mm:ss` nên UI sẽ tự thêm `:00` khi bạn chọn `HH:mm`.
            </div>
          </div>
        </FormCard>
      </div>

      <div class="space-y-6">
        <FormCard title="Hành động" :icon="Shield">
          <div class="space-y-3">
            <button
              @click="handleSubmit"
              :disabled="createShift.isPending.value"
              :class="[
                'flex w-full items-center justify-center gap-2 h-11 rounded-lg text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-colors',
                createShift.isPending.value ? 'bg-primary cursor-not-allowed' : 'bg-primary hover:bg-primary',
              ]"
            >
              <Save class="h-4 w-4" />
              {{ createShift.isPending.value ? 'Đang tạo...' : 'Tạo ca làm' }}
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
</template>

