import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { shiftApi } from '@/services/shift.service'
import type { CreateShift, Shift } from '@/types/shift'

function normalizeShiftListResult(result: unknown): Shift[] {
  if (Array.isArray(result)) return result as Shift[]
  if (result && typeof result === 'object' && Array.isArray((result as any).content)) return (result as any).content as Shift[]
  return []
}

export function useShifts() {
  const queryClient = useQueryClient()

  const shiftsQuery = useQuery<Shift[]>({
    queryKey: ['attendance-shifts'],
    queryFn: async () => {
      const response = await shiftApi.getAll()
      return normalizeShiftListResult(response.data?.result)
    },
    staleTime: 1000 * 60 * 3,
    gcTime: 1000 * 60 * 10,
  })

  const createShift = useMutation({
    mutationFn: (data: CreateShift) => shiftApi.create(data).then((res) => res.data.result),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['attendance-shifts'] }),
  })

  const updateShift = useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: Partial<CreateShift> }) =>
      shiftApi.update(id, data).then((res) => res.data.result),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['attendance-shifts'] }),
  })

  const deleteShift = useMutation({
    mutationFn: (id: string | number) => shiftApi.delete(id),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['attendance-shifts'] }),
  })

  return {
    shiftsQuery,
    createShift,
    updateShift,
    deleteShift,
  }
}

