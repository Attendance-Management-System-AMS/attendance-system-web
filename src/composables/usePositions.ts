import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { positionApi } from '@/services/position.service'
import type { CreatePosition, Position } from '@/types/position'

export function usePositions() {
  const queryClient = useQueryClient()

  const positionsQuery = useQuery<Position[]>({
    queryKey: ['positions'],
    queryFn: async () => {
      const response = await positionApi.getAll()
      const result = response.data?.result as Position[] | { content?: Position[] } | undefined
      if (Array.isArray(result)) return result
      if (result && Array.isArray(result.content)) return result.content
      return []
    },
    staleTime: 1000 * 60 * 3,
    gcTime: 1000 * 60 * 10,
  })

  const createPosition = useMutation({
    mutationFn: (data: CreatePosition) => positionApi.create(data).then((res) => res.data.result),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['positions'] }),
  })

  const deletePosition = useMutation({
    mutationFn: (id: string | number) => positionApi.delete(id),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['positions'] }),
  })

  const updatePosition = useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: Partial<CreatePosition> }) =>
      positionApi.update(id, data).then((res) => res.data.result),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['positions'] }),
  })

  return {
    positionsQuery,
    createPosition,
    deletePosition,
    updatePosition,
  }
}
