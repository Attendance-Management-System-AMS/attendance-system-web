import { attendanceApi, type MyAttendanceFilters } from '@/services/attendance.service'
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
    queryFn: () => attendanceApi.getMyHistory(normalizedFilters.value).then(res => res.data.result),
  })

  const todayQuery = useQuery({
    queryKey: ['attendance', 'me', 'today'],
    queryFn: () => attendanceApi.getTodayMe().then(res => res.data.result),
  })

  const scheduleQuery = useQuery({
    queryKey: ['attendance', 'me', 'schedules'],
    queryFn: () => attendanceApi.getMySchedules().then(res => res.data.result),
  })

  return {
    historyQuery,
    todayQuery,
    scheduleQuery,
  }
}
