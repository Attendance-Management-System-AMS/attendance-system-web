import { attendanceApi } from '@/modules/attendance/api/attendance.api'
import type { AttendanceTodayFilters } from '@/modules/attendance/api/attendance.api'
import { employeeApi } from '@/modules/employees/api/employee.api'
import axios from 'axios'
import {
    createUnrecordedTodayAttendance,
    mapAttendanceStatusFromApi,
    mergeTodayAttendance,
} from '@/modules/attendance/utils/attendanceMap'
import { queryKeys } from '@/shared/lib/queryKeys'
import type { Attendance } from '@/modules/attendance/types/attendance.types'
import type { Employee } from '@/modules/employees/types/employee.types'
import type { Page } from '@/shared/types/api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { computed, toValue } from 'vue'
import type { MaybeRefOrGetter } from 'vue'

function parseEmployeesPage(result: unknown): Employee[] {
    if (Array.isArray(result)) return result as Employee[]
    if (
        result &&
        typeof result === 'object' &&
        'content' in result &&
        Array.isArray((result as Page<Employee>).content)
    ) {
        return (result as Page<Employee>).content
    }
    return []
}

function formatLocalDate(date = new Date()) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

async function fetchAllEmployees() {
    const first = await employeeApi.getAll({ page: 0, size: 500, sort: 'fullName', sortDir: 'asc' })
    const firstPage = first.data?.result
    const employees = parseEmployeesPage(firstPage).filter((employee) => {
        const status = String(employee.status ?? '').trim().toUpperCase()
        return status !== 'INACTIVE'
    })

    const totalPages =
        firstPage && !Array.isArray(firstPage) && typeof firstPage === 'object' && 'totalPages' in firstPage
            ? Number(firstPage.totalPages)
            : 1

    if (Number.isFinite(totalPages) && totalPages > 1) {
        const rest = await Promise.all(
            Array.from({ length: totalPages - 1 }, (_, index) =>
                employeeApi.getAll({ page: index + 1, size: 500, sort: 'fullName', sortDir: 'asc' }),
            ),
        )

        for (const response of rest) {
            employees.push(
                ...parseEmployeesPage(response.data?.result).filter((employee) => {
                    const status = String(employee.status ?? '').trim().toUpperCase()
                    return status !== 'INACTIVE'
                }),
            )
        }
    }

    return employees
}

async function fetchEmployeesForAttendanceView() {
    try {
        return await fetchAllEmployees()
    } catch (error) {
        // Manager can access attendance operations but not the HR employee directory.
        // In that case we still show recorded attendance rows using snapshot data
        // returned by attendance-service instead of failing the whole screen.
        if (axios.isAxiosError(error) && error.response?.status === 403) {
            return null
        }

        throw error
    }
}

function normalizeText(value: unknown) {
    return String(value ?? '').trim().toLowerCase()
}

function applyTodayFilters(rows: Attendance[], filters: AttendanceTodayFilters) {
    const search = normalizeText(filters.search)
    const department = normalizeText(filters.department)
    const status = filters.status ? mapAttendanceStatusFromApi(filters.status) : ''

    return rows.filter((row) => {
        const employee = row.employee
        if (search) {
            const haystack = normalizeText(
                `${employee?.fullName ?? ''} ${employee?.employeeCode ?? ''} ${employee?.email ?? ''}`,
            )
            if (!haystack.includes(search)) return false
        }

        if (department) {
            const departmentId = normalizeText(employee?.departmentId)
            const departmentName = normalizeText(employee?.departmentName)
            if (departmentId !== department && departmentName !== department) return false
        }

        if (status && row.status !== status) return false

        return true
    })
}

export function useAttendance(filters?: MaybeRefOrGetter<AttendanceTodayFilters>) {
    const queryClient = useQueryClient()

    const normalizedFilters = computed<AttendanceTodayFilters>(() => {
        const raw = toValue(filters)
        return {
            date: raw?.date?.trim() || undefined,
            search: raw?.search?.trim() || undefined,
            department: raw?.department?.trim() || undefined,
            status: raw?.status?.trim() || undefined,
        }
    })

    const workDateFilter = computed(() => normalizedFilters.value.date ?? formatLocalDate())

    // Query danh sách chấm công hôm nay (map DTO API + join nhân viên theo employeeId)
    const baseAttendanceQuery = useQuery<Attendance[]>({
        queryKey: computed(() => [...queryKeys.attendance.today(), { date: workDateFilter.value }] as const),
        queryFn: async () => {
            const [attRes, empRes] = await Promise.all([
                attendanceApi.getToday({ date: workDateFilter.value }),
                queryClient.fetchQuery({
                    queryKey: [...queryKeys.employees.all(), 'attendance-active'] as const,
                    queryFn: fetchEmployeesForAttendanceView,
                    staleTime: 1000 * 60 * 3,
                    gcTime: 1000 * 60 * 10,
                }),
            ])
            const result = attRes.data?.result
            const rows = Array.isArray(result) ? result : (result?.content ?? [])
            const employees = empRes ?? []
            const byEmployeeId = new Map(employees.map((e) => [e.id, e]))
            const recordedRows = mergeTodayAttendance(rows, byEmployeeId)

            if (!empRes) {
                return recordedRows
            }

            const recordedByEmployeeId = new Map(
                recordedRows
                    .filter((row) => row.employeeId != null)
                    .map((row) => [row.employeeId as number, row]),
            )
            const mergedRows = employees.map(
                (employee) =>
                    recordedByEmployeeId.get(employee.id) ??
                    createUnrecordedTodayAttendance(employee, workDateFilter.value),
            )

            for (const row of recordedRows) {
                if (row.employeeId != null && !byEmployeeId.has(row.employeeId)) {
                    mergedRows.push(row)
                }
            }

            return mergedRows
        },
        staleTime: 1000 * 60 * 1, // 1 phút
    })

    const attendanceQuery = {
        ...baseAttendanceQuery,
        data: computed(() => applyTodayFilters(baseAttendanceQuery.data.value ?? [], normalizedFilters.value)),
    }

    const deleteAttendance = useMutation({
        mutationFn: (id: string | number) => attendanceApi.delete(id),
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.attendance.today() })
        },
    })

    return {
        attendanceQuery,
        deleteAttendance,
    }
}
