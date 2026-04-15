import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { queryKeys } from '@/shared/lib/queryKeys'
import { shiftApi } from '@/modules/schedules/api/shift.api'
import type { CreateShift, Shift } from '@/modules/schedules/types/shift.types'

function normalizeShiftListResult(result: unknown): Shift[] {
  if (Array.isArray(result)) return result as Shift[]
  if (
    result !== null &&
    typeof result === 'object' &&
    'content' in result &&
    Array.isArray((result as { content: unknown }).content)
  ) {
    return (result as { content: Shift[] }).content
  }
  return []
}

export function useShifts() {
  const queryClient = useQueryClient()

  const shiftsQuery = useQuery<Shift[]>({
    queryKey: queryKeys.shifts.all(),
    queryFn: async () => {
      const response = await shiftApi.getAll()
      return normalizeShiftListResult(response.data?.result)
    },
    staleTime: 1000 * 60 * 3,
    gcTime: 1000 * 60 * 10,
  })

  const createShift = useMutation({
    mutationFn: (data: CreateShift) => shiftApi.create(data).then((res) => res.data.result),
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.shifts.all() }),
  })

  const updateShift = useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: Partial<CreateShift> }) =>
      shiftApi.update(id, data).then((res) => res.data.result),
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.shifts.all() }),
  })

  const deleteShift = useMutation({
    mutationFn: (id: string | number) => shiftApi.delete(id),
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.shifts.all() }),
  })

  return {
    shiftsQuery,
    createShift,
    updateShift,
    deleteShift,
  }
}

