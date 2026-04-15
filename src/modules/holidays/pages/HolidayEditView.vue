<script setup lang="ts">
import FormCard from '@/shared/ui/FormCard.vue'
import PageHeader from '@/shared/ui/PageHeader.vue'
import { computed, reactive, ref, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import { ArrowLeft, CalendarDays, Save, Shield } from 'lucide-vue-next'
import { holidayApi } from '@/modules/holidays/api/holiday.api'
import { queryKeys } from '@/shared/lib/queryKeys'
import { useHolidays } from '@/modules/holidays/composables/useHolidays'
import type { CreateHoliday, Holiday } from '@/modules/holidays/types/holiday.types'

const router = useRouter()
const route = useRoute()
const { updateHoliday } = useHolidays()

const holidayId = computed((): string | number | undefined => {
  const raw = route.params.id
  const r = Array.isArray(raw) ? raw[0] : raw
  if (r === undefined || r === '') return undefined
  const num = Number(r)
  return Number.isFinite(num) ? num : String(r)
})

const form = reactive({
  holidayName: '',
  fromDate: '',
  toDate: '',
  isPaid: true,
})

type FieldName = 'holidayName' | 'fromDate' | 'toDate'
const errors = reactive<Record<FieldName, string>>({
  holidayName: '',
  fromDate: '',
  toDate: '',
})

const submitError = ref('')

// Computed property to safely get the error message
const holidayErrorMessage = computed(() => {
  const err = holidayQuery.error.value
  if (err && typeof err === 'object' && 'message' in err) {
    return (err as Error).message
  }
  return 'Không thể tải chi tiết ngày nghỉ.'
})

const inputClass =
  'h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all dark:border-slate-700 dark:bg-slate-800 dark:text-white'
const labelClass = 'block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5'

const validate = () => {
  errors.holidayName = form.holidayName.trim() ? '' : 'Vui lòng nhập tên ngày nghỉ'
  errors.fromDate = form.fromDate.trim() ? '' : 'Vui lòng chọn ngày bắt đầu'
  errors.toDate = form.toDate.trim() ? '' : 'Vui lòng chọn ngày kết thúc'
  return !Object.values(errors).some(Boolean)
}

const holidayQuery = useQuery({
  queryKey: computed(() =>
    holidayId.value != null
      ? queryKeys.holidays.detail(holidayId.value)
      : (['attendance-holiday', '__none__'] as const),
  ),
  enabled: computed(() => holidayId.value != null),
  queryFn: async () => {
    const id = holidayId.value!
    const res = await holidayApi.getById(id)
    return res.data.result
  },
})

watchEffect(() => {
  const h = holidayQuery.data.value as Holiday | undefined
  if (!h) return
  form.holidayName = h.holidayName ?? ''
  form.fromDate = h.fromDate ?? ''
  form.toDate = h.toDate ?? ''
  form.isPaid = typeof h.isPaid === 'boolean' ? h.isPaid : Boolean(h.isPaid)
})

const handleSubmit = async () => {
  submitError.value = ''
  if (!validate()) {
    submitError.value = 'Vui lòng kiểm tra lại các trường bắt buộc.'
    return
  }

  const payload: Partial<CreateHoliday> = {
    holidayName: form.holidayName.trim(),
    fromDate: form.fromDate.trim(),
    toDate: form.toDate.trim(),
    isPaid: form.isPaid,
  }

  try {
    await updateHoliday.mutateAsync({ id: holidayId.value!, data: payload })
    router.push('/holidays')
  } catch (err) {
    console.error('Update holiday failed:', err)
    submitError.value = 'Cập nhật thất bại. Vui lòng thử lại.'
  }
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader title="Sửa ngày nghỉ" description="Cập nhật thông tin ngày nghỉ">
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

    <div v-if="holidayQuery.isLoading.value" class="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
      Đang tải thông tin...
    </div>

    <div v-else-if="holidayQuery.isError.value" class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
      {{ holidayErrorMessage }}
      <div>
        <button class="mt-2 text-indigo-600 underline hover:text-indigo-800 dark:text-indigo-400" @click="holidayQuery.refetch()">
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
          <FormCard title="Thông tin ngày nghỉ" :icon="CalendarDays">
            <div class="grid grid-cols-2 gap-4">
              <div class="col-span-2">
                <label :class="labelClass">Tên ngày nghỉ <span class="text-rose-500">*</span></label>
                <input
                  v-model="form.holidayName"
                  type="text"
                  :class="[inputClass, errors.holidayName && 'border-rose-400']"
                />
                <p v-if="errors.holidayName" class="mt-1 text-xs text-rose-600">{{ errors.holidayName }}</p>
              </div>

              <div>
                <label :class="labelClass">Từ ngày <span class="text-rose-500">*</span></label>
                <input v-model="form.fromDate" type="date" :class="[inputClass, errors.fromDate && 'border-rose-400']" />
                <p v-if="errors.fromDate" class="mt-1 text-xs text-rose-600">{{ errors.fromDate }}</p>
              </div>

              <div>
                <label :class="labelClass">Đến ngày <span class="text-rose-500">*</span></label>
                <input v-model="form.toDate" type="date" :class="[inputClass, errors.toDate && 'border-rose-400']" />
                <p v-if="errors.toDate" class="mt-1 text-xs text-rose-600">{{ errors.toDate }}</p>
              </div>

              <div class="col-span-2">
                <label :class="labelClass">Hưởng lương</label>
                <select v-model="form.isPaid" :class="inputClass">
                  <option :value="true">Có</option>
                  <option :value="false">Không</option>
                </select>
              </div>
            </div>
          </FormCard>
        </div>

        <div class="space-y-6">
          <FormCard title="Hành động" :icon="Shield">
            <div class="space-y-3">
              <button
                @click="handleSubmit"
                :disabled="updateHoliday.isPending.value"
                :class="[
                  'flex w-full items-center justify-center gap-2 h-11 rounded-xl text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-colors',
                  updateHoliday.isPending.value ? 'bg-indigo-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700',
                ]"
              >
                <Save class="h-4 w-4" />
                {{ updateHoliday.isPending.value ? 'Đang cập nhật...' : 'Cập nhật' }}
              </button>

              <button
                @click="router.push('/holidays')"
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

