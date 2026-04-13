import { attendanceApi } from '@/services/attendance.service'
import type { AttendanceTodayFilters } from '@/services/attendance.service'
import { employeeApi } from '@/services/employee.service'
import { mergeTodayAttendance } from '@/lib/attendanceMap'
import { queryKeys } from '@/lib/queryKeys'
import type { Attendance } from '@/types/attendance'
import type { Employee } from '@/types/employee'
import type { Page } from '@/types/api'
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

export function useAttendance(filters?: MaybeRefOrGetter<AttendanceTodayFilters>) {
    const queryClient = useQueryClient()

    const normalizedFilters = computed<AttendanceTodayFilters>(() => {
        const raw = toValue(filters)
        return {
            date: raw?.date?.trim() || undefined,
            search: raw?.search?.trim() || undefined,
            department: raw?.department?.trim() || undefined,
            shift: raw?.shift?.trim() || undefined,
            status: raw?.status?.trim() || undefined,
        }
    })

    // Query danh sách chấm công hôm nay (map DTO API + join nhân viên theo employeeId)
    const attendanceQuery = useQuery<Attendance[]>({
        queryKey: computed(() => [...queryKeys.attendance.today(), normalizedFilters.value] as const),
        queryFn: async () => {
            const [attRes, empRes] = await Promise.all([
                attendanceApi.getToday(normalizedFilters.value),
                employeeApi.getAll(),
            ])
            const result = attRes.data?.result
            const rows = Array.isArray(result) ? result : (result?.content ?? [])
            const employees = parseEmployeesPage(empRes.data?.result)
            const byEmployeeId = new Map(employees.map((e) => [e.id, e]))
            return mergeTodayAttendance(rows, byEmployeeId)
        },
        staleTime: 1000 * 60 * 1, // 1 phút
    })

    // Mutation check-in bằng khuôn mặt
    const checkIn = useMutation({
        mutationFn: (descriptor: number[]) => attendanceApi.checkInByFace(descriptor).then(data => data.result),
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.attendance.today() })
        },
    })

    const deleteAttendance = useMutation({
        mutationFn: (id: string | number) => attendanceApi.delete(id),
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.attendance.today() })
        },
    })

    return {
        attendanceQuery,
        checkIn,
        deleteAttendance,
    }
}
