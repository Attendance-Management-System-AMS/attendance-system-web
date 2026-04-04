<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { RouterLink } from 'vue-router'
import { ArrowLeft, CalendarRange, LayoutGrid, Search, Trash2 } from 'lucide-vue-next'
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
const deleteTarget = ref<ScheduleWithShift | null>(null)

const assignmentForm = reactive({
    employeeId: '',
    shiftId: '',
    dayOfWeek: '2',
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

        const totalElements = typeof pageResult.totalElements === 'number'
            ? pageResult.totalElements
            : typeof pageResult.total === 'number'
                ? pageResult.total
                : items.length

        const totalPages = typeof pageResult.totalPages === 'number'
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
const assignedTotalPages = computed(() => Math.max(1, assignedSchedulesQuery.data.value?.totalPages ?? 1))
const assignedTotalElements = computed(() => assignedSchedulesQuery.data.value?.totalElements ?? 0)
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
    assignmentForm.dayOfWeek = '2'
    assignmentForm.effectiveFrom = ''
    assignmentForm.isActive = true
}

const submitAssignment = async () => {
    assignmentError.value = ''
    assignmentSuccess.value = ''

    if (!assignmentForm.employeeId || !assignmentForm.shiftId || !assignmentForm.dayOfWeek || !assignmentForm.effectiveFrom) {
        assignmentError.value = 'Vui lòng chọn đầy đủ nhân viên, ca, thứ và ngày hiệu lực.'
        return
    }

    try {
        await createSchedule.mutateAsync({
            employeeId: Number(assignmentForm.employeeId),
            shiftId: Number(assignmentForm.shiftId),
            dayOfWeek: Number(assignmentForm.dayOfWeek),
            effectiveFrom: assignmentForm.effectiveFrom,
            isActive: assignmentForm.isActive,
        })
        await assignedSchedulesQuery.refetch()
        assignmentSuccess.value = 'Đã gán lịch làm việc thành công.'
        resetAssignmentForm()
    } catch (err) {
        assignmentError.value = getApiErrorMessage(err, 'Không thể gán lịch làm việc. Vui lòng thử lại.')
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
        <PageHeader title="Phân công lịch làm việc" description="Tạo, tìm kiếm, và xóa lịch làm việc của nhân viên.">
            <template #actions>
                <RouterLink to="/schedule"
                    class="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800">
                    <ArrowLeft class="h-4 w-4" />
                    Quay lại lịch
                </RouterLink>
            </template>
        </PageHeader>

        <div class="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <FormCard title="Tạo lịch làm việc" :icon="CalendarRange">
                <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <label class="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                            Nhân viên <span class="text-rose-500">*</span>
                        </label>
                        <select v-model="assignmentForm.employeeId"
                            class="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                            <option value="">Chọn nhân viên</option>
                            <option v-for="employee in employees" :key="employee.id" :value="String(employee.id)">
                                {{ employee.fullName }}{{ employee.employeeCode ? ` (${employee.employeeCode})` : '' }}
                            </option>
                        </select>
                    </div>

                    <div>
                        <label class="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                            Ca làm <span class="text-rose-500">*</span>
                        </label>
                        <select v-model="assignmentForm.shiftId"
                            class="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                            <option value="">Chọn ca làm</option>
                            <option v-for="shift in shifts" :key="shift.id" :value="String(shift.id)">
                                {{ shift.name || `Ca #${shift.id}` }}
                            </option>
                        </select>
                    </div>

                    <div>
                        <label class="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                            Thứ trong tuần <span class="text-rose-500">*</span>
                        </label>
                        <select v-model="assignmentForm.dayOfWeek"
                            class="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                            <option v-for="option in dayOfWeekOptions" :key="option.value" :value="option.value">
                                {{ option.label }}
                            </option>
                        </select>
                    </div>

                    <div>
                        <label class="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                            Ngày hiệu lực <span class="text-rose-500">*</span>
                        </label>
                        <input v-model="assignmentForm.effectiveFrom" type="date"
                            class="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                    </div>

                    <label
                        class="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 md:col-span-2">
                        <input v-model="assignmentForm.isActive" type="checkbox"
                            class="h-4 w-4 rounded border-slate-300 text-indigo-600" />
                        Kích hoạt lịch ngay sau khi gán
                    </label>
                </div>

                <div v-if="assignmentError"
                    class="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {{ assignmentError }}
                </div>
                <div v-if="assignmentSuccess"
                    class="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    {{ assignmentSuccess }}
                </div>

                <div class="mt-5 flex flex-wrap gap-3">
                    <button type="button" @click="submitAssignment" :disabled="createSchedule.isPending.value"
                        class="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-400">
                        <CalendarRange class="h-4 w-4" />
                        {{ createSchedule.isPending.value ? 'Đang gán...' : 'Gán lịch' }}
                    </button>
                    <button type="button" @click="resetAssignmentForm"
                        class="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                        Làm mới
                    </button>
                </div>
            </FormCard>

            <FormCard title="Tóm tắt" :icon="Search">
                <div class="grid grid-cols-2 gap-4 text-sm">
                    <div class="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
                        <div class="text-slate-500 dark:text-slate-400">Số lịch đang có</div>
                        <div class="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{{ assignedTotalElements }}
                        </div>
                    </div>
                    <div class="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
                        <div class="text-slate-500 dark:text-slate-400">Trang hiện tại</div>
                        <div class="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{{ assignedPageLabel }}
                        </div>
                    </div>
                </div>
            </FormCard>
        </div>

        <FormCard title="Danh sách lịch đã gán" :icon="LayoutGrid">
            <div class="grid gap-3 md:grid-cols-4">
                <input v-model="scheduleSearch" type="text" placeholder="Tìm theo nhân viên, ca, mã..."
                    class="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                <select v-model="scheduleEmployeeFilter"
                    class="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                    <option value="">Tất cả nhân viên</option>
                    <option v-for="employee in employees" :key="employee.id" :value="String(employee.id)">
                        {{ employee.fullName }}
                    </option>
                </select>
                <select v-model="scheduleShiftFilter"
                    class="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                    <option value="">Tất cả ca</option>
                    <option v-for="shift in shifts" :key="shift.id" :value="String(shift.id)">
                        {{ shift.name || `Ca #${shift.id}` }}
                    </option>
                </select>
                <select v-model="scheduleDayFilter"
                    class="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
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
                                class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                Nhân viên</th>
                            <th
                                class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                Ca</th>
                            <th
                                class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                Thứ</th>
                            <th
                                class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                Hiệu lực</th>
                            <th
                                class="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                Trạng thái</th>
                            <th
                                class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                Thao tác</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-900">
                        <tr v-if="assignedSchedulesQuery.isLoading.value">
                            <td colspan="6" class="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                                Đang tải
                                danh sách lịch từ máy chủ...</td>
                        </tr>
                        <tr v-else-if="filteredSchedules.length === 0">
                            <td colspan="6" class="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                                Chưa có
                                lịch nào hoặc bộ lọc đang không có kết quả.</td>
                        </tr>
                        <tr v-else v-for="schedule in filteredSchedules" :key="schedule.id"
                            class="hover:bg-slate-50 dark:hover:bg-slate-800/60">
                            <td class="px-4 py-3 text-sm text-slate-900 dark:text-white">
                                <div class="font-medium">{{ getEmployeeName(schedule.employeeId) }}</div>
                                <div class="text-xs text-slate-500 dark:text-slate-400">ID: {{ schedule.employeeId }}
                                </div>
                            </td>
                            <td class="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                                <div class="font-medium">{{ getShiftName(schedule.shiftId) }}</div>
                                <div v-if="schedule.shift" class="text-xs text-slate-500 dark:text-slate-400">{{
                                    fmtTime(schedule.shift.startTime) }} - {{ fmtTime(schedule.shift.endTime) }}</div>
                            </td>
                            <td class="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{{
                                formatDayOfWeekLabel(schedule.dayOfWeek) }}</td>
                            <td class="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{{
                                fmtDateInput(schedule.effectiveFrom) }}</td>
                            <td class="px-4 py-3 text-center text-sm">
                                <span
                                    :class="['inline-flex rounded-full px-2.5 py-1 text-xs font-semibold', schedule.isActive === false ? 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300']">
                                    {{ schedule.isActive === false ? 'Ngừng' : 'Hoạt động' }}
                                </span>
                            </td>
                            <td class="px-4 py-3 text-right">
                                <button type="button" @click="requestDeleteSchedule(schedule)"
                                    class="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-950">
                                    <Trash2 class="h-4 w-4" />
                                    Xóa
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="mt-4 flex items-center justify-between">
                <div class="text-sm text-slate-500 dark:text-slate-400">Trang {{ assignedPageLabel }} / {{
                    assignedTotalPages }}
                </div>
                <div class="flex items-center gap-2">
                    <button type="button" :disabled="assignedPage <= 1 || assignedSchedulesQuery.isFetching.value"
                        @click="assignedPage--"
                        class="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800">Trước</button>
                    <button type="button"
                        :disabled="assignedPage >= assignedTotalPages || assignedSchedulesQuery.isFetching.value"
                        @click="assignedPage++"
                        class="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800">Sau</button>
                </div>
            </div>
        </FormCard>

        <DeleteConfirmDialog :open="deleteDialogOpen" title="Xóa lịch làm việc"
            description="Bạn có chắc chắn muốn xóa lịch đã gán này không?"
            :item-name="deleteTarget ? `${getEmployeeName(deleteTarget.employeeId)} - ${getShiftName(deleteTarget.shiftId)}` : ''"
            @confirm="confirmDeleteSchedule" @cancel="deleteDialogOpen = false" />
    </div>
</template>
