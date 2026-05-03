import { attendanceApi, type MyAttendanceFilters } from '@/modules/attendance/api/attendance.api'
import { useQuery } from '@tanstack/vue-query'
import { computed, toValue } from 'vue'
import type { MaybeRefOrGetter } from 'vue'


export function useMyAttendance(filters?: MaybeRefOrGetter<MyAttendanceFilters>) {
  const normalizedFilters = computed(() => {
    const raw = toValue(filters)
    return {
      fromDate: raw?.fromDate,
      toDate: raw?.toDate,
      status: raw?.status,
      page: raw?.page ?? 0,
      size: raw?.size ?? 20,
    }
  })

  const historyQuery = useQuery({
    queryKey: computed(() => ['attendance', 'me', 'history', normalizedFilters.value] as const),
    queryFn: () => attendanceApi.getMyHistory(normalizedFilters.value).then(res => res.data.result ?? null),
    staleTime: 1000 * 60 * 2,
  })

  const todayQuery = useQuery({
    queryKey: ['attendance', 'me', 'today'],
    queryFn: () => attendanceApi.getTodayMe().then(res => res.data.result ?? null),
    staleTime: 1000 * 30,
  })

  const scheduleQuery = useQuery({
    queryKey: ['attendance', 'me', 'schedules'],
    queryFn: () => attendanceApi.getMySchedules().then(res => res.data.result ?? null),
    staleTime: 1000 * 60 * 5,
  })

  return {
    historyQuery,
    todayQuery,
    scheduleQuery,
  }
}
