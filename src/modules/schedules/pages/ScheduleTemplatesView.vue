<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { ArrowLeft, Clock, Plus, Save, Trash2, Edit2, CalendarDays } from 'lucide-vue-next'
import PageHeader from '@/shared/ui/PageHeader.vue'
import DeleteConfirmDialog from '@/shared/ui/DeleteConfirmDialog.vue'
import { useScheduleTemplates } from '@/modules/schedules/composables/useScheduleTemplates'
import { useShifts } from '@/modules/schedules/composables/useShifts'
import { getApiErrorMessage } from '@/shared/api/apiErrorMessage'
import { useBackgroundTask } from '@/shared/lib/useBackgroundTask'
import type { ScheduleTemplate } from '@/modules/schedules/types/schedule.types'

const { templatesQuery, createTemplate, updateTemplate, deleteTemplate } = useScheduleTemplates()
const { shiftsQuery } = useShifts()
const { executeBackgroundTask } = useBackgroundTask()

const templates = computed(() => templatesQuery.data.value ?? [])
const shifts = computed(() => shiftsQuery.data.value ?? [])

const isModalOpen = ref(false)
const isEditMode = ref(false)
const editingId = ref<number | null>(null)
const deleteDialogOpen = ref(false)
const deleteTarget = ref<ScheduleTemplate | null>(null)

const errorMessage = ref('')

const templateForm = reactive({
  name: '',
  description: '',
  items: [] as { dayOfWeek: number; shiftId: string }[],
})

type TemplateDraft = {
  isEditMode: boolean
  editingId: number | null
  form: {
    name: string
    description: string
    items: { dayOfWeek: number; shiftId: string }[]
  }
}

const daysOfWeek = [
  { label: 'Thứ 2', value: 1 },
  { label: 'Thứ 3', value: 2 },
  { label: 'Thứ 4', value: 3 },
  { label: 'Thứ 5', value: 4 },
  { label: 'Thứ 6', value: 5 },
  { label: 'Thứ 7', value: 6 },
  { label: 'Chủ nhật', value: 7 },
]

const initForm = () => {
  templateForm.name = ''
  templateForm.description = ''
  templateForm.items = daysOfWeek.map((day) => ({
    dayOfWeek: day.value,
    shiftId: '',
  }))
}

const cloneTemplateItems = () =>
  templateForm.items.map((item) => ({
    dayOfWeek: item.dayOfWeek,
    shiftId: item.shiftId,
  }))

const snapshotTemplateDraft = (): TemplateDraft => ({
  isEditMode: isEditMode.value,
  editingId: editingId.value,
  form: {
    name: templateForm.name,
    description: templateForm.description,
    items: cloneTemplateItems(),
  },
})

const restoreTemplateDraft = (draft: TemplateDraft) => {
  isEditMode.value = draft.isEditMode
  editingId.value = draft.editingId
  templateForm.name = draft.form.name
  templateForm.description = draft.form.description
  templateForm.items = draft.form.items.map((item) => ({ ...item }))
}

const closeTemplateModal = () => {
  isModalOpen.value = false
  errorMessage.value = ''
}

const openCreateModal = () => {
  isEditMode.value = false
  editingId.value = null
  initForm()
  errorMessage.value = ''
  isModalOpen.value = true
}

const openEditModal = (template: ScheduleTemplate) => {
  isEditMode.value = true
  editingId.value = template.id
  templateForm.name = template.name
  templateForm.description = template.description || ''

  // Map existing items
  templateForm.items = daysOfWeek.map((day) => {
    const existing = template.items.find((item) => item.dayOfWeek === day.value)
    return {
      dayOfWeek: day.value,
      shiftId: existing ? String(existing.shiftId || existing.shift?.id || '') : '',
    }
  })

  errorMessage.value = ''
  isModalOpen.value = true
}

const handleSubmit = () => {
  errorMessage.value = ''

  if (!templateForm.name) {
    errorMessage.value = 'Vui lòng nhập tên mẫu lịch.'
    return
  }

  const validItems = templateForm.items
    .filter((item) => item.shiftId)
    .map((item) => ({
      dayOfWeek: item.dayOfWeek,
      shiftId: Number(item.shiftId),
    }))

  if (validItems.length === 0) {
    errorMessage.value = 'Vui lòng chọn ít nhất một ca làm việc cho một ngày trong tuần.'
    return
  }

  const draft = snapshotTemplateDraft()
  const data = {
    name: templateForm.name.trim(),
    description: templateForm.description.trim(),
    items: validItems,
  }

  void executeBackgroundTask({
    draft,
    payload: data,
    run: (nextData) =>
      draft.isEditMode && draft.editingId
        ? updateTemplate.mutateAsync({ id: draft.editingId, data: nextData })
        : createTemplate.mutateAsync(nextData),
    pendingMessage: draft.isEditMode
      ? `Đã tiếp nhận cập nhật cho mẫu lịch ${data.name}. Hệ thống đang đồng bộ.`
      : `Đã tiếp nhận mẫu lịch ${data.name}. Hệ thống đang đồng bộ.`,
    successMessage: draft.isEditMode
      ? `Đã cập nhật mẫu lịch ${data.name}.`
      : `Đã tạo mẫu lịch ${data.name}.`,
    errorMessage: ({ error }) => getApiErrorMessage(error, 'Thao tác thất bại. Vui lòng thử lại.'),
    onStart: () => {
      closeTemplateModal()
    },
    onError: ({ draft: previousDraft, message }) => {
      restoreTemplateDraft(previousDraft)
      errorMessage.value = message || 'Thao tác thất bại. Vui lòng thử lại.'
      isModalOpen.value = true
    },
  })
}

const requestDelete = (template: ScheduleTemplate) => {
  deleteTarget.value = template
  deleteDialogOpen.value = true
}

const confirmDelete = () => {
  if (!deleteTarget.value) return

  const target = { ...deleteTarget.value }
  void executeBackgroundTask({
    draft: target,
    payload: target,
    run: (nextTarget) => deleteTemplate.mutateAsync(nextTarget.id),
    pendingMessage: `Đã tiếp nhận yêu cầu xóa mẫu lịch ${target.name}. Hệ thống đang đồng bộ.`,
    successMessage: `Đã xóa mẫu lịch ${target.name}.`,
    errorMessage: ({ error }) => getApiErrorMessage(error, 'Không thể xóa mẫu lịch.'),
    onStart: () => {
      deleteDialogOpen.value = false
      deleteTarget.value = null
    },
    onError: ({ message }) => {
      errorMessage.value = message || 'Không thể xóa mẫu lịch.'
    },
  })
}

const getShiftName = (shiftId: string | number | null | undefined) => {
  if (shiftId === undefined || shiftId === null) return '—'
  const shift = shifts.value.find((s) => String(s.id) === String(shiftId))
  return shift?.name || `Ca #${shiftId}`
}

const getTemplateItemShiftId = (template: ScheduleTemplate, dayOfWeek: number) => {
  const item = template.items.find((entry) => entry.dayOfWeek === dayOfWeek)
  return item?.shiftId || item?.shift?.id
}

const getTemplateItemShiftName = (template: ScheduleTemplate, dayOfWeek: number) => {
  const shiftId = getTemplateItemShiftId(template, dayOfWeek)
  return shiftId ? getShiftName(shiftId) : 'Nghỉ'
}

const getDayLabel = (dayValue: number) => {
  return daysOfWeek.find((d) => d.value === dayValue)?.label || ''
}

const applyToAll = (shiftId: string) => {
  templateForm.items.forEach((item) => {
    item.shiftId = shiftId
  })
}

const applyToWeekdays = (shiftId: string) => {
  templateForm.items.forEach((item) => {
    if (item.dayOfWeek >= 1 && item.dayOfWeek <= 5) {
      item.shiftId = shiftId
    }
  })
}
</script>

<template>
  <div class="px-6 py-6 space-y-6">
    <PageHeader
      title="Mẫu lịch làm việc"
      description="Định nghĩa các khung giờ làm việc chuẩn để áp dụng nhanh cho nhân viên."
    >
      <template #actions>
        <button
          @click="openCreateModal"
          class="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold tracking-wide text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all dark:shadow-none"
        >
          <Plus class="h-4 w-4" />
          Thêm mẫu mới
        </button>
      </template>
    </PageHeader>

    <div v-if="templatesQuery.isLoading.value" class="flex h-64 items-center justify-center">
      <div class="flex flex-col items-center gap-2">
        <div
          class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
        ></div>
        <p class="text-sm text-secondary-text font-medium">Đang tải danh sách mẫu...</p>
      </div>
    </div>

    <div
      v-else-if="templates.length === 0"
      class="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 dark:border-border dark:bg-card/50"
    >
      <div
        class="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-tertiary-text dark:bg-elevated"
      >
        <CalendarDays class="h-6 w-6" />
      </div>
      <p class="mt-4 text-sm font-medium text-secondary-text">Chưa có mẫu lịch nào được tạo.</p>
      <button
        @click="openCreateModal"
        class="mt-2 text-sm font-bold text-primary hover:underline"
      >
        Tạo mẫu đầu tiên ngay
      </button>
    </div>

    <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="template in templates"
        :key="template.id"
        class="group relative flex flex-col rounded-lg border border-border bg-card p-5 shadow-none transition-all hover:border-primary/30 dark:border-border dark:bg-card/50"
      >
        <div class="flex items-start justify-between">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-primary/10"
          >
            <Clock class="h-5 w-5" />
          </div>
          <div class="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              @click="openEditModal(template)"
              class="rounded-lg p-2 text-tertiary-text hover:bg-muted hover:text-primary dark:hover:bg-elevated"
              title="Chỉnh sửa"
            >
              <Edit2 class="h-4 w-4" />
            </button>
            <button
              @click="requestDelete(template)"
              class="rounded-lg p-2 text-tertiary-text hover:bg-muted hover:text-rose-600 dark:hover:bg-elevated"
              title="Xóa"
            >
              <Trash2 class="h-4 w-4" />
            </button>
          </div>
        </div>

        <div class="mt-4">
          <h3 class="text-base font-bold text-primary-text dark:text-primary-text">{{ template.name }}</h3>
          <p class="mt-1 text-xs text-secondary-text line-clamp-2">
            {{ template.description || 'Không có mô tả' }}
          </p>
        </div>

        <div class="mt-5 space-y-2">
          <p class="text-[10px] font-bold tracking-normal text-tertiary-text">
            Khung giờ làm việc
          </p>
          <div class="space-y-1.5">
            <div
              v-for="day in daysOfWeek"
              :key="day.value"
              class="flex items-center justify-between gap-3 rounded-md border border-border-subtle bg-surface/30 px-2 py-1.5"
            >
              <span class="w-16 shrink-0 text-[10px] font-bold text-tertiary-text">
                {{ day.label }}
              </span>
              <span class="min-w-0 flex-1 truncate text-right text-xs font-semibold text-primary-text dark:text-tertiary-text">
                {{ getTemplateItemShiftName(template, day.value) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            class="absolute inset-0 bg-card/50 backdrop-blur-sm"
            @click="closeTemplateModal()"
          ></div>

          <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0 scale-95 translate-y-4"
            enter-to-class="opacity-100 scale-100 translate-y-0"
          >
            <div
              v-if="isModalOpen"
              class="relative w-full max-w-2xl rounded-lg border border-border bg-card shadow-2xl dark:border-border dark:bg-card overflow-hidden flex flex-col max-h-[90vh]"
            >
              <!-- Header -->
              <div
                class="flex items-center justify-between border-b border-border p-6 dark:border-border"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-primary/10"
                  >
                    <Plus v-if="!isEditMode" class="h-5 w-5" />
                    <Edit2 v-else class="h-5 w-5" />
                  </div>
                  <div>
                    <h3 class="text-lg font-bold text-primary-text dark:text-primary-text">
                      {{ isEditMode ? 'Chỉnh sửa mẫu lịch' : 'Tạo mẫu lịch làm việc mới' }}
                    </h3>
                    <p class="text-xs text-secondary-text">
                      Định nghĩa lịch chuẩn theo các thứ trong tuần.
                    </p>
                  </div>
                </div>
                <button
                  @click="closeTemplateModal()"
                  class="rounded-lg p-2 text-tertiary-text hover:bg-muted dark:hover:bg-elevated"
                >
                  <ArrowLeft class="h-5 w-5 rotate-180" />
                </button>
              </div>

              <!-- Body -->
              <div class="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                <div class="grid gap-5">
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div class="md:col-span-1 space-y-1.5">
                      <label class="text-xs font-bold tracking-normal text-secondary-text"
                        >Tên mẫu <span class="text-rose-500">*</span></label
                      >
                      <input
                        v-model="templateForm.name"
                        type="text"
                        placeholder="VD: Hành chính..."
                        class="h-10 w-full rounded-lg border border-border bg-muted/30 px-4 text-sm focus:ring-1 focus:ring-primary dark:border-border dark:bg-elevated dark:text-primary-text"
                      />
                    </div>
                    <div class="md:col-span-2 space-y-1.5">
                      <label class="text-xs font-bold tracking-normal text-secondary-text"
                        >Mô tả</label
                      >
                      <input
                        v-model="templateForm.description"
                        type="text"
                        placeholder="Ghi chú ngắn về mẫu này..."
                        class="h-10 w-full rounded-lg border border-border bg-muted/30 px-4 text-sm focus:ring-1 focus:ring-primary dark:border-border dark:bg-elevated dark:text-primary-text"
                      />
                    </div>
                  </div>

                  <div class="space-y-4">
                    <div class="flex items-center justify-between">
                      <label class="text-xs font-bold  tracking-normal text-secondary-text"
                        >Cấu hình chi tiết các ngày</label
                      >
                      <div class="flex gap-2">
                        <div class="group relative">
                          <button
                            type="button"
                            class="text-[10px] font-bold text-primary hover:text-primary bg-primary/10 px-2 py-1 rounded-lg transition-colors"
                          >
                            Gán nhanh...
                          </button>
                          <div
                            class="absolute right-0 top-full mt-1 hidden group-hover:block z-20 w-48 rounded-lg border border-border bg-card p-2 shadow-xl dark:border-border dark:bg-card"
                          >
                            <p class="px-2 py-1 text-[10px] font-bold text-tertiary-text ">
                              Chọn ca áp dụng:
                            </p>
                            <button
                              v-for="shift in shifts"
                              :key="shift.id"
                              @click="applyToWeekdays(String(shift.id))"
                              type="button"
                              class="w-full text-left px-2 py-1.5 text-xs rounded-lg hover:bg-surface dark:hover:bg-elevated"
                            >
                              T2-T6: {{ shift.name }}
                            </button>
                            <div class="my-1 border-t border-border-subtle dark:border-border"></div>
                            <button
                              v-for="shift in shifts"
                              :key="shift.id"
                              @click="applyToAll(String(shift.id))"
                              type="button"
                              class="w-full text-left px-2 py-1.5 text-xs rounded-lg hover:bg-surface dark:hover:bg-elevated"
                            >
                              Tất cả: {{ shift.name }}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div
                      class="grid grid-cols-1 md:grid-cols-2 gap-3 rounded-lg border border-border bg-muted/30 p-4 dark:border-border dark:bg-card/50"
                    >
                      <div
                        v-for="item in templateForm.items"
                        :key="item.dayOfWeek"
                        class="flex flex-col gap-1.5 p-2 rounded-lg bg-card border border-border dark:bg-elevated dark:border-border"
                      >
                        <span
                          class="text-[10px] font-bold  tracking-wide text-tertiary-text"
                          >{{ getDayLabel(item.dayOfWeek) }}</span
                        >
                        <select
                          v-model="item.shiftId"
                          class="h-9 w-full rounded-lg border border-border-standard bg-surface px-2 text-xs focus:ring-2 focus:ring-primary dark:border-border dark:bg-elevated dark:text-primary-text"
                        >
                          <option value="">— Nghỉ —</option>
                          <option v-for="shift in shifts" :key="shift.id" :value="String(shift.id)">
                            {{ shift.name }}
                            <template v-if="shift.startTime && shift.endTime">
                              ({{ shift.startTime.substring(0, 5) }}...)
                            </template>
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Messages -->
                <Transition name="fade">
                  <div
                    v-if="errorMessage"
                    class="flex items-center gap-2 rounded-lg border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600"
                  >
                    <div class="h-1.5 w-1.5 rounded-full bg-rose-600"></div>
                    {{ errorMessage }}
                  </div>
                </Transition>
              </div>

              <!-- Footer -->
                <div
                  class="flex items-center justify-end gap-3 border-t border-border p-6 dark:border-border"
                >
                  <button
                    @click="closeTemplateModal()"
                    class="h-10 rounded-lg border border-border px-6 text-sm font-medium text-secondary-text hover:bg-muted dark:border-border dark:text-tertiary-text"
                  >
                    Hủy
                  </button>
                  <button
                    @click="handleSubmit"
                    :disabled="createTemplate.isPending.value || updateTemplate.isPending.value"
                    class="h-10 flex items-center gap-2 rounded-lg bg-primary px-8 text-sm font-bold tracking-wide text-white shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:opacity-50"
                  >
                    <Save class="h-4 w-4" />
                    <span>{{ isEditMode ? 'Cập nhật' : 'Lưu mẫu' }}</span>
                  </button>
                </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>

    <DeleteConfirmDialog
      :open="deleteDialogOpen"
      title="Xóa mẫu lịch"
      description="Bạn có chắc chắn muốn xóa mẫu lịch này không? Hành động này không ảnh hưởng đến các lịch đã gán trước đó."
      :item-name="deleteTarget?.name || ''"
      @confirm="confirmDelete"
      @cancel="deleteDialogOpen = false"
    />
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
