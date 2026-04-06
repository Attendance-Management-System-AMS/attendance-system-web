<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { RouterLink } from 'vue-router'
import { ArrowLeft, CalendarRange, LayoutGrid, Trash2 } from 'lucide-vue-next'
import DeleteConfirmDialog from '@/components/ui/DeleteConfirmDialog.vue'
import FormCard from '@/components/ui/FormCard.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import { useEmployees } from '@/composables/useEmployees'
import { useSchedules } from '@/composables/useSchedules'
import { useShifts } from '@/composables/useShifts'
import { getApiErrorMessage } from '@/lib/apiErrorMessage'
import { scheduleApi } from '@/services/schedule.service'
import type { Page } from '@/types/api'
import type { Schedule } from '@/types/schedule'
import type { Shift } from '@/types/shift'

interface ScheduleWithShift extends Schedule {
  shift?: Shift
}

const { employeesQuery } = useEmployees()
const { shiftsQuery } = useShifts()
const { createSchedule, deleteSchedule } = useSchedules(null)

const employees = computed(() => employeesQuery.data.value ?? [])
const shifts = computed(() => shiftsQuery.data.value ?? [])

const assignmentError = ref('')
const assignmentSuccess = ref('')
const deleteDialogOpen = ref(false)
const isAssignDialogOpen = ref(false)
const deleteTarget = ref<ScheduleWithShift | null>(null)

const assignmentForm = reactive({
  employeeId: '',
  shiftId: '',
  daysOfWeek: [] as string[],
  effectiveFrom: '',
  isActive: true,
})

const dayOfWeekOptions = [
  { label: 'Thứ 2', value: '2' },
  { label: 'Thứ 3', value: '3' },
  { label: 'Thứ 4', value: '4' },
  { label: 'Thứ 5', value: '5' },
  { label: 'Thứ 6', value: '6' },
  { label: 'Thứ 7', value: '7' },
  { label: 'Chủ nhật', value: '8' },
]

const scheduleEmployeeFilter = ref('')
const scheduleShiftFilter = ref('')
const scheduleDayFilter = ref('')
const scheduleSearch = ref('')
const assignedPage = ref(1)
const assignedPageSize = ref(10)

interface ScheduleSearchData {
  items: Schedule[]
  totalPages: number
  totalElements: number
  page: number
}

const normalizeScheduleSearchData = (result: unknown): ScheduleSearchData => {
  if (Array.isArray(result)) {
    return {
      items: result as Schedule[],
      totalPages: 1,
      totalElements: result.length,
      page: 0,
    }
  }

  if (result && typeof result === 'object') {
    const pageResult = result as Partial<Page<Schedule>> & {
      items?: Schedule[]
      records?: Schedule[]
      data?: Schedule[]
      total?: number
    }

    const items = Array.isArray(pageResult.content)
      ? pageResult.content
      : Array.isArray(pageResult.items)
        ? pageResult.items
        : Array.isArray(pageResult.records)
          ? pageResult.records
          : Array.isArray(pageResult.data)
            ? pageResult.data
            : []

    const totalElements =
      typeof pageResult.totalElements === 'number'
        ? pageResult.totalElements
        : typeof pageResult.total === 'number'
          ? pageResult.total
          : items.length

    const totalPages =
      typeof pageResult.totalPages === 'number'
        ? pageResult.totalPages
        : Math.max(1, Math.ceil(totalElements / assignedPageSize.value))

    const page = typeof pageResult.page === 'number' ? pageResult.page : 0

    return {
      items,
      totalPages,
      totalElements,
      page,
    }
  }

  return {
    items: [],
    totalPages: 1,
    totalElements: 0,
    page: 0,
  }
}

const assignedSchedulesQuery = useQuery<ScheduleSearchData>({
  queryKey: computed(() => [
    'schedules',
    'search',
    {
      employeeId: scheduleEmployeeFilter.value || null,
      shiftId: scheduleShiftFilter.value || null,
      dayOfWeek: scheduleDayFilter.value || null,
      keyword: scheduleSearch.value.trim() || null,
      page: assignedPage.value,
      size: assignedPageSize.value,
    },
  ]),
  queryFn: async () => {
    const keyword = scheduleSearch.value.trim()
    const params: Record<string, unknown> = {
      page: assignedPage.value - 1,
      size: assignedPageSize.value,
    }

    if (scheduleEmployeeFilter.value) params.employeeId = Number(scheduleEmployeeFilter.value)
    if (scheduleShiftFilter.value) params.shiftId = Number(scheduleShiftFilter.value)
    if (scheduleDayFilter.value) params.dayOfWeek = Number(scheduleDayFilter.value)
    if (keyword) {
      params.keyword = keyword
      params.search = keyword
      params.query = keyword
    }

    const response = await scheduleApi.search(params)
    return normalizeScheduleSearchData(response.data?.result)
  },
  staleTime: 1000 * 30,
})

watch([scheduleEmployeeFilter, scheduleShiftFilter, scheduleDayFilter, scheduleSearch], () => {
  assignedPage.value = 1
})

const scheduleList = computed(() => assignedSchedulesQuery.data.value?.items ?? [])
const assignedTotalPages = computed(() =>
  Math.max(1, assignedSchedulesQuery.data.value?.totalPages ?? 1),
)
const assignedPageLabel = computed(() => (assignedSchedulesQuery.data.value?.page ?? 0) + 1)

const filteredSchedules = computed<ScheduleWithShift[]>(() => {
  return scheduleList.value.map((schedule) => ({
    ...schedule,
    shift: shifts.value.find((s) => String(s.id) === String(schedule.shiftId)),
  }))
})

const getEmployeeName = (employeeId: number | string): string => {
  const employee = employees.value.find((item) => String(item.id) === String(employeeId))
  if (!employee) return `NV #${employeeId}`
  return `${employee.fullName}${employee.employeeCode ? ` (${employee.employeeCode})` : ''}`
}

const getShiftName = (shiftId: number | string): string => {
  const shift = shifts.value.find((item) => String(item.id) === String(shiftId))
  return shift?.name || `Ca #${shiftId}`
}

const formatDayOfWeekLabel = (dayOfWeek?: number): string => {
  switch (dayOfWeek) {
    case 2:
      return 'Thứ 2'
    case 3:
      return 'Thứ 3'
    case 4:
      return 'Thứ 4'
    case 5:
      return 'Thứ 5'
    case 6:
      return 'Thứ 6'
    case 7:
      return 'Thứ 7'
    case 8:
      return 'Chủ nhật'
    default:
      return '—'
  }
}

const fmtTime = (time: string | undefined): string => {
  if (!time) return '-'
  return time.substring(0, 5)
}

const fmtDateInput = (value?: string): string => {
  if (!value) return '—'
  const trimmed = value.trim()
  if (!trimmed) return '—'
  return trimmed.slice(0, 10)
}

const resetAssignmentForm = () => {
  assignmentForm.employeeId = ''
  assignmentForm.shiftId = ''
  assignmentForm.daysOfWeek = []
  assignmentForm.effectiveFrom = ''
  assignmentForm.isActive = true
}

const submitAssignment = async () => {
  assignmentError.value = ''
  assignmentSuccess.value = ''

  if (
    !assignmentForm.employeeId ||
    !assignmentForm.shiftId ||
    assignmentForm.daysOfWeek.length === 0 ||
    !assignmentForm.effectiveFrom
  ) {
    assignmentError.value = 'Vui lòng chọn đầy đủ nhân viên, ca, ít nhất một thứ và ngày hiệu lực.'
    return
  }

  try {
    const promises = assignmentForm.daysOfWeek.map((day) =>
      createSchedule.mutateAsync({
        employeeId: Number(assignmentForm.employeeId),
        shiftId: Number(assignmentForm.shiftId),
        dayOfWeek: Number(day),
        effectiveFrom: assignmentForm.effectiveFrom,
        isActive: assignmentForm.isActive,
      }),
    )

    await Promise.all(promises)
    await assignedSchedulesQuery.refetch()
    assignmentSuccess.value = `Đã gán lịch làm việc cho ${assignmentForm.daysOfWeek.length} ngày thành công.`

    // Form stays open briefly to show success, then closes
    setTimeout(() => {
      isAssignDialogOpen.value = false
      resetAssignmentForm()
      assignmentSuccess.value = ''
    }, 1200)
  } catch (err) {
    assignmentError.value = getApiErrorMessage(
      err,
      'Không thể gán lịch làm việc. Vui lòng thử lại.',
    )
  }
}

const requestDeleteSchedule = (schedule: ScheduleWithShift) => {
  deleteTarget.value = schedule
  deleteDialogOpen.value = true
}

const confirmDeleteSchedule = async () => {
  if (!deleteTarget.value) return
  assignmentError.value = ''
  try {
    await deleteSchedule.mutateAsync(deleteTarget.value.id)
    await assignedSchedulesQuery.refetch()
    deleteDialogOpen.value = false
    deleteTarget.value = null
    assignmentSuccess.value = 'Đã xóa lịch làm việc.'
  } catch (err) {
    assignmentError.value = getApiErrorMessage(err, 'Không thể xóa lịch làm việc.')
  }
}
</script>

<template>
  <div class="space-y-6 px-6 py-6">
    <PageHeader
      title="Phân công lịch làm việc"
      description="Tìm kiếm, quản lý và gán ca làm việc cho nhân viên."
    >
      <template #actions>
        <div class="flex items-center gap-3">
          <button
            @click="isAssignDialogOpen = true"
            class="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all dark:shadow-none"
          >
            <CalendarRange class="h-4 w-4" />
            Gán lịch mới
          </button>
          <RouterLink
            to="/schedule"
            class="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <ArrowLeft class="h-4 w-4" />
            Quay lại lịch
          </RouterLink>
        </div>
      </template>
    </PageHeader>
    <FormCard title="Danh sách lịch đã gán" :icon="LayoutGrid">
      <div class="grid gap-3 md:grid-cols-4">
        <input
          v-model="scheduleSearch"
          type="text"
          placeholder="Tìm theo nhân viên, ca, mã..."
          class="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />
        <select
          v-model="scheduleEmployeeFilter"
          class="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        >
          <option value="">Tất cả nhân viên</option>
          <option v-for="employee in employees" :key="employee.id" :value="String(employee.id)">
            {{ employee.fullName }}
          </option>
        </select>
        <select
          v-model="scheduleShiftFilter"
          class="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        >
          <option value="">Tất cả ca</option>
          <option v-for="shift in shifts" :key="shift.id" :value="String(shift.id)">
            {{ shift.name || `Ca #${shift.id}` }}
          </option>
        </select>
        <select
          v-model="scheduleDayFilter"
          class="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        >
          <option value="">Tất cả thứ</option>
          <option v-for="option in dayOfWeekOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>

      <div class="mt-5 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
        <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead class="bg-slate-50 dark:bg-slate-900">
            <tr>
              <th
                class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
              >
                Nhân viên
              </th>
              <th
                class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
              >
                Ca
              </th>
              <th
                class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
              >
                Thứ
              </th>
              <th
                class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
              >
                Hiệu lực
              </th>
              <th
                class="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
              >
                Trạng thái
              </th>
              <th
                class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
              >
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-900">
            <tr v-if="assignedSchedulesQuery.isLoading.value">
              <td
                colspan="6"
                class="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400"
              >
                Đang tải danh sách lịch từ máy chủ...
              </td>
            </tr>
            <tr v-else-if="filteredSchedules.length === 0">
              <td
                colspan="6"
                class="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400"
              >
                Chưa có lịch nào hoặc bộ lọc đang không có kết quả.
              </td>
            </tr>
            <tr
              v-else
              v-for="schedule in filteredSchedules"
              :key="schedule.id"
              class="hover:bg-slate-50 dark:hover:bg-slate-800/60"
            >
              <td class="px-4 py-3 text-sm text-slate-900 dark:text-white">
                <div class="font-medium">{{ getEmployeeName(schedule.employeeId) }}</div>
                <div class="text-xs text-slate-500 dark:text-slate-400">
                  ID: {{ schedule.employeeId }}
                </div>
              </td>
              <td class="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                <div class="font-medium">{{ getShiftName(schedule.shiftId) }}</div>
                <div v-if="schedule.shift" class="text-xs text-slate-500 dark:text-slate-400">
                  {{ fmtTime(schedule.shift.startTime) }} - {{ fmtTime(schedule.shift.endTime) }}
                </div>
              </td>
              <td class="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                {{ formatDayOfWeekLabel(schedule.dayOfWeek) }}
              </td>
              <td class="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                {{ fmtDateInput(schedule.effectiveFrom) }}
              </td>
              <td class="px-4 py-3 text-center text-sm">
                <span
                  :class="[
                    'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold',
                    schedule.isActive === false
                      ? 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
                  ]"
                >
                  {{ schedule.isActive === false ? 'Ngừng' : 'Hoạt động' }}
                </span>
              </td>
              <td class="px-4 py-3 text-right">
                <button
                  type="button"
                  @click="requestDeleteSchedule(schedule)"
                  class="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-950"
                >
                  <Trash2 class="h-4 w-4" />
                  Xóa
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-4 flex items-center justify-between">
        <div class="text-sm text-slate-500 dark:text-slate-400">
          Trang {{ assignedPageLabel }} / {{ assignedTotalPages }}
        </div>
        <div class="flex items-center gap-2">
          <button
            type="button"
            :disabled="assignedPage <= 1 || assignedSchedulesQuery.isFetching.value"
            @click="assignedPage--"
            class="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Trước
          </button>
          <button
            type="button"
            :disabled="
              assignedPage >= assignedTotalPages || assignedSchedulesQuery.isFetching.value
            "
            @click="assignedPage++"
            class="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Sau
          </button>
        </div>
      </div>
    </FormCard>

    <DeleteConfirmDialog
      :open="deleteDialogOpen"
      title="Xóa lịch làm việc"
      description="Bạn có chắc chắn muốn xóa lịch đã gán này không?"
      :item-name="
        deleteTarget
          ? `${getEmployeeName(deleteTarget.employeeId)} - ${getShiftName(deleteTarget.shiftId)}`
          : ''
      "
      @confirm="confirmDeleteSchedule"
      @cancel="deleteDialogOpen = false"
    />

    <!-- Assignment Dialog -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="isAssignDialogOpen"
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
          @click.self="isAssignDialogOpen = false"
        >
          <div class="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"></div>

          <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0 scale-95 translate-y-4"
            enter-to-class="opacity-100 scale-100 translate-y-0"
          >
            <div
              v-if="isAssignDialogOpen"
              class="relative w-full max-w-2xl rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            >
              <!-- Header -->
              <div
                class="flex items-center justify-between border-b border-slate-100 p-6 dark:border-slate-800"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30"
                  >
                    <CalendarRange class="h-5 w-5" />
                  </div>
                  <div>
                    <h3 class="text-lg font-bold text-slate-900 dark:text-white">
                      Tạo lịch làm việc mới
                    </h3>
                    <p class="text-xs text-slate-500">
                      Phân công ca làm cho nhân viên theo các thứ trong tuần.
                    </p>
                  </div>
                </div>
                <button
                  @click="isAssignDialogOpen = false"
                  class="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <ArrowLeft class="h-5 w-5 rotate-180" />
                </button>
              </div>

              <!-- Body -->
              <div class="max-h-[70vh] overflow-y-auto p-6 scrollbar-hide">
                <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div class="space-y-1.5">
                    <label class="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Nhân viên <span class="text-rose-500">*</span>
                    </label>
                    <select
                      v-model="assignmentForm.employeeId"
                      class="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                      <option value="">Chọn nhân viên</option>
                      <option
                        v-for="employee in employees"
                        :key="employee.id"
                        :value="String(employee.id)"
                      >
                        {{ employee.fullName
                        }}{{ employee.employeeCode ? ` (${employee.employeeCode})` : '' }}
                      </option>
                    </select>
                  </div>

                  <div class="space-y-1.5">
                    <label class="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Ca làm <span class="text-rose-500">*</span>
                    </label>
                    <select
                      v-model="assignmentForm.shiftId"
                      class="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                      <option value="">Chọn ca làm</option>
                      <option v-for="shift in shifts" :key="shift.id" :value="String(shift.id)">
                        {{ shift.name || `Ca #${shift.id}` }}
                      </option>
                    </select>
                  </div>

                  <div class="md:col-span-2 space-y-2">
                    <label class="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Thứ trong tuần <span class="text-rose-500">*</span>
                    </label>
                    <div class="flex flex-wrap gap-2">
                      <button
                        type="button"
                        @click="assignmentForm.daysOfWeek = ['2', '3', '4', '5', '6']"
                        class="rounded-lg bg-indigo-50 px-3 py-1.5 text-[10px] font-bold uppercase text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/30"
                      >
                        Thứ 2 - Thứ 6
                      </button>
                      <button
                        type="button"
                        @click="assignmentForm.daysOfWeek = ['2', '3', '4', '5', '6', '7', '8']"
                        class="rounded-lg bg-indigo-50 px-3 py-1.5 text-[10px] font-bold uppercase text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/30"
                      >
                        Tất cả (T2 - CN)
                      </button>
                      <button
                        type="button"
                        @click="assignmentForm.daysOfWeek = []"
                        class="rounded-lg bg-slate-100 px-3 py-1.5 text-[10px] font-bold uppercase text-slate-600 hover:bg-slate-200 dark:bg-slate-800"
                      >
                        Bỏ chọn
                      </button>
                    </div>
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <label
                        v-for="option in dayOfWeekOptions"
                        :key="option.value"
                        class="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer hover:bg-white hover:shadow-sm transition-all"
                        :class="{
                          'border-indigo-500 bg-white ring-1 ring-indigo-500/20 shadow-md shadow-indigo-100':
                            assignmentForm.daysOfWeek.includes(option.value),
                        }"
                      >
                        <input
                          type="checkbox"
                          v-model="assignmentForm.daysOfWeek"
                          :value="option.value"
                          class="h-4 w-4 rounded border-slate-300 text-indigo-600"
                        />
                        <span class="text-xs font-semibold">{{ option.label }}</span>
                      </label>
                    </div>
                  </div>

                  <div class="space-y-1.5">
                    <label class="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Ngày hiệu lực <span class="text-rose-500">*</span>
                    </label>
                    <input
                      v-model="assignmentForm.effectiveFrom"
                      type="date"
                      class="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>

                  <div class="md:col-span-2">
                    <label
                      class="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50 cursor-pointer hover:bg-white transition-all dark:border-slate-800 dark:bg-slate-900/50"
                    >
                      <input
                        v-model="assignmentForm.isActive"
                        type="checkbox"
                        class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span class="text-sm font-medium text-slate-700 dark:text-slate-300"
                        >Kích hoạt lịch ngay sau khi gán</span
                      >
                    </label>
                  </div>
                </div>

                <Transition name="fade">
                  <div
                    v-if="assignmentError"
                    class="mt-4 flex items-center gap-2 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600"
                  >
                    <div class="h-1 w-1 rounded-full bg-rose-600"></div>
                    {{ assignmentError }}
                  </div>
                </Transition>
                <Transition name="fade">
                  <div
                    v-if="assignmentSuccess"
                    class="mt-4 flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-600"
                  >
                    <div class="h-1 w-1 rounded-full bg-emerald-600"></div>
                    {{ assignmentSuccess }}
                  </div>
                </Transition>
              </div>

              <!-- Footer -->
              <div
                class="flex items-center justify-end gap-3 border-t border-slate-100 p-6 dark:border-slate-800"
              >
                <button
                  type="button"
                  @click="isAssignDialogOpen = false"
                  class="h-11 rounded-xl border border-slate-200 px-6 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  @click="resetAssignmentForm"
                  class="h-11 rounded-xl border border-dashed border-slate-300 px-6 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  Làm mới
                </button>
                <button
                  type="button"
                  @click="submitAssignment"
                  :disabled="createSchedule.isPending.value"
                  class="h-11 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-8 text-sm font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 dark:shadow-none"
                >
                  <CalendarRange v-if="!createSchedule.isPending.value" class="h-4 w-4" />
                  <span>{{ createSchedule.isPending.value ? 'Đang xử lý...' : 'Gán lịch' }}</span>
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
