import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { queryKeys } from '@/lib/queryKeys'
import { holidayApi } from '@/services/holiday.service'
import type { CreateHoliday, Holiday } from '@/types/holiday'

function normalizeHolidayListResult(result: unknown): Holiday[] {
  if (Array.isArray(result)) return result as Holiday[]
  if (
    result !== null &&
    typeof result === 'object' &&
    'content' in result &&
    Array.isArray((result as { content: unknown }).content)
  ) {
    return (result as { content: Holiday[] }).content
  }
  return []
}

export function useHolidays() {
  const queryClient = useQueryClient()

  const holidaysQuery = useQuery<Holiday[]>({
    queryKey: queryKeys.holidays.all(),
    queryFn: async () => {
      const response = await holidayApi.getAll()
      return normalizeHolidayListResult(response.data?.result)
    },
    staleTime: 1000 * 60 * 3,
    gcTime: 1000 * 60 * 10,
  })

  const createHoliday = useMutation({
    mutationFn: (data: CreateHoliday) => holidayApi.create(data).then((res) => res.data.result),
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.holidays.all() }),
  })

  const updateHoliday = useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: Partial<CreateHoliday> }) =>
      holidayApi.update(id, data).then((res) => res.data.result),
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.holidays.all() }),
  })

  const deleteHoliday = useMutation({
    mutationFn: (id: string | number) => holidayApi.delete(id),
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.holidays.all() }),
  })

  return {
    holidaysQuery,
    createHoliday,
    updateHoliday,
    deleteHoliday,
  }
}

