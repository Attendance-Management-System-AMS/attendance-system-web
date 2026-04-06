import { computed, unref, type Ref } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { queryKeys } from '@/lib/queryKeys'
import { scheduleApi } from '@/services/schedule.service'
import type { CreateSchedule, Schedule } from '@/types/schedule'

function normalizeScheduleListResult(result: unknown): Schedule[] {
  if (Array.isArray(result)) return result as Schedule[]
  if (
    result !== null &&
    typeof result === 'object' &&
    'content' in result &&
    Array.isArray((result as { content: unknown }).content)
  ) {
    return (result as { content: Schedule[] }).content
  }
  if (
    result !== null &&
    typeof result === 'object' &&
    'items' in result &&
    Array.isArray((result as { items: unknown }).items)
  ) {
    return (result as { items: Schedule[] }).items
  }
  if (
    result !== null &&
    typeof result === 'object' &&
    'records' in result &&
    Array.isArray((result as { records: unknown }).records)
  ) {
    return (result as { records: Schedule[] }).records
  }
  if (
    result !== null &&
    typeof result === 'object' &&
    'data' in result &&
    Array.isArray((result as { data: unknown }).data)
  ) {
    return (result as { data: Schedule[] }).data
  }
  return []
}

export function useSchedules(
  employeeId: Ref<string | number | null> | string | number | null,
  params?: Ref<Record<string, unknown> | null> | Record<string, unknown> | null,
) {
  const queryClient = useQueryClient()

  // Normalize input to computed value
  const resolvedEmployeeId = computed(() => unref(employeeId))
  const resolvedParams = computed(() => unref(params))

  // Query lịch làm việc: có employeeId thì lấy theo nhân viên, không có thì lấy toàn bộ
  const schedulesQuery = useQuery<Schedule[]>({
    queryKey: computed(() =>
      resolvedEmployeeId.value
        ? queryKeys.schedules.byEmployee(resolvedEmployeeId.value)
        : [...queryKeys.schedules.all(), resolvedParams.value],
    ),
    queryFn: async () => {
      const id = resolvedEmployeeId.value
      const queryParams = resolvedParams.value || {}

      const response = id
        ? await scheduleApi.getByEmployee(id)
        : await scheduleApi.getAll(queryParams)
      return normalizeScheduleListResult(response.data?.result)
    },
    staleTime: 1000 * 60 * 3,
    gcTime: 1000 * 60 * 10,
  })

  // Mutation tạo schedule
  const createSchedule = useMutation({
    mutationFn: (data: CreateSchedule) =>
      scheduleApi.create(data).then((res) => res.data.result),

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.schedules.all() })
      const id = resolvedEmployeeId.value
      if (id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.schedules.byEmployee(id) })
      }
    },
  })

  // Mutation xóa schedule
  const deleteSchedule = useMutation({
    mutationFn: (id: string | number) => scheduleApi.delete(id),

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.schedules.all() })
      const id = resolvedEmployeeId.value
      if (id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.schedules.byEmployee(id) })
      }
    },
  })

  return {
    schedulesQuery,
    createSchedule,
    deleteSchedule,
  }
}
