<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Save, Shield, Timer } from 'lucide-vue-next'
import PageHeader from '@/components/ui/PageHeader.vue'
import FormCard from '@/components/ui/FormCard.vue'
import { useShifts } from '@/composables/useShifts'
import type { CreateShift } from '@/types/shift'

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
  'h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all dark:border-slate-700 dark:bg-slate-800 dark:text-white'
const labelClass = 'block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5'

const validate = () => {
  errors.name = form.name.trim() ? '' : 'Vui lòng nhập tên ca'
  errors.startTime = form.startTime.trim() ? '' : 'Vui lòng nhập giờ bắt đầu'
  errors.endTime = form.endTime.trim() ? '' : 'Vui lòng nhập giờ kết thúc'
  errors.status = '' // backend hiện không có status
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

            <div class="col-span-2 text-xs text-slate-500">
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
                'flex w-full items-center justify-center gap-2 h-11 rounded-xl text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-colors',
                createShift.isPending.value ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700',
              ]"
            >
              <Save class="h-4 w-4" />
              {{ createShift.isPending.value ? 'Đang tạo...' : 'Tạo ca làm' }}
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
</template>

