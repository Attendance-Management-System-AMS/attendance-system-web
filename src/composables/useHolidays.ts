import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { holidayApi } from '@/services/holiday.service'
import type { CreateHoliday, Holiday } from '@/types/holiday'

function normalizeHolidayListResult(result: unknown): Holiday[] {
  if (Array.isArray(result)) return result as Holiday[]
  if (result && typeof result === 'object' && Array.isArray((result as any).content)) return (result as any).content as Holiday[]
  return []
}

export function useHolidays() {
  const queryClient = useQueryClient()

  const holidaysQuery = useQuery<Holiday[]>({
    queryKey: ['attendance-holidays'],
    queryFn: async () => {
      const response = await holidayApi.getAll()
      return normalizeHolidayListResult(response.data?.result)
    },
    staleTime: 1000 * 60 * 3,
    gcTime: 1000 * 60 * 10,
  })

  const createHoliday = useMutation({
    mutationFn: (data: CreateHoliday) => holidayApi.create(data).then((res) => res.data.result),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['attendance-holidays'] }),
  })

  const updateHoliday = useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: Partial<CreateHoliday> }) =>
      holidayApi.update(id, data).then((res) => res.data.result),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['attendance-holidays'] }),
  })

  const deleteHoliday = useMutation({
    mutationFn: (id: string | number) => holidayApi.delete(id),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['attendance-holidays'] }),
  })

  return {
    holidaysQuery,
    createHoliday,
    updateHoliday,
    deleteHoliday,
  }
}

