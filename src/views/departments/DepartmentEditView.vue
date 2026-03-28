<script setup lang="ts">
import { computed, reactive, ref, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Building2, Save, Shield } from 'lucide-vue-next'
import { useQuery } from '@tanstack/vue-query'
import PageHeader from '@/components/ui/PageHeader.vue'
import FormCard from '@/components/ui/FormCard.vue'
import { departmentApi } from '@/services/department.service'
import type { Department } from '@/types/department'
import { useDepartments } from '@/composables/useDepartments'

const route = useRoute()
const router = useRouter()
const { updateDepartment } = useDepartments()

const departmentId = computed(() => route.params.id as string)

const form = reactive({
  name: '',
  description: '',
  status: 'active' as 'active' | 'inactive',
})

type FieldName = 'name' | 'status'
const errors = reactive<Record<FieldName, string>>({
  name: '',
  status: '',
})

const submitError = ref('')

const inputClass =
  'h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all dark:border-slate-700 dark:bg-slate-800 dark:text-white'
const labelClass = 'block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5'

const departmentQuery = useQuery<Department>({
  queryKey: ['department', departmentId],
  enabled: computed(() => Boolean(departmentId.value)),
  queryFn: async () => {
    const res = await departmentApi.getById(departmentId.value)
    return res.data.result
  },
})

watchEffect(() => {
  const d = departmentQuery.data.value
  if (!d) return
  form.name = d.name ?? ''
  form.description = d.description ?? ''
  form.status = d.status === 'inactive' ? 'inactive' : 'active'
})

const validate = () => {
  errors.name = form.name.trim() ? '' : 'Vui lòng nhập tên phòng ban'
  errors.status = form.status ? '' : 'Vui lòng chọn trạng thái'
  return !Object.values(errors).some(Boolean)
}

const handleSubmit = async () => {
  submitError.value = ''
  if (!validate()) {
    submitError.value = 'Vui lòng kiểm tra lại các trường bắt buộc.'
    return
  }

  try {
    await updateDepartment.mutateAsync({
      id: departmentId.value,
      data: {
        name: form.name.trim(),
        description: form.description.trim(),
        status: form.status,
      },
    })
    router.push('/departments')
  } catch (err) {
    console.error('Update department failed:', err)
    submitError.value = 'Cập nhật thất bại. Vui lòng thử lại.'
  }
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader title="Sửa phòng ban" description="Cập nhật thông tin phòng ban">
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

    <div v-if="departmentQuery.isLoading.value" class="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
      Đang tải thông tin...
    </div>

    <div
      v-else-if="departmentQuery.isError.value"
      class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
    >
      {{ (departmentQuery.error.value as Error | undefined)?.message || 'Không thể tải chi tiết phòng ban.' }}
      <div>
        <button class="mt-2 text-indigo-600 underline hover:text-indigo-800 dark:text-indigo-400" @click="departmentQuery.refetch()">
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
          <FormCard title="Thông tin phòng ban" :icon="Building2">
            <div class="grid grid-cols-2 gap-4">
              <div class="col-span-2">
                <label :class="labelClass">
                  Tên phòng ban <span class="text-rose-500">*</span>
                </label>
                <input v-model="form.name" type="text" :class="[inputClass, errors.name && 'border-rose-400']" />
                <p v-if="errors.name" class="mt-1 text-xs text-rose-600">{{ errors.name }}</p>
              </div>

              <div class="col-span-2">
                <label :class="labelClass">Mô tả</label>
                <textarea v-model="form.description" rows="3" :class="inputClass" />
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
            </div>
          </FormCard>
        </div>

        <div class="space-y-6">
          <FormCard title="Hành động" :icon="Shield">
            <div class="space-y-3">
              <button
                @click="handleSubmit"
                :disabled="updateDepartment.isPending.value"
                :class="[
                  'flex w-full items-center justify-center gap-2 h-11 rounded-xl text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-colors',
                  updateDepartment.isPending.value ? 'bg-indigo-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700',
                ]"
              >
                <Save class="h-4 w-4" />
                {{ updateDepartment.isPending.value ? 'Đang cập nhật...' : 'Cập nhật' }}
              </button>

              <button
                @click="router.push('/departments')"
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

