import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { leaveApi } from '@/services/leave.service'
import type { CreateLeaveRequest, LeaveRequest } from '@/types/leave'

export function useLeaves() {
  const queryClient = useQueryClient()

  const leavesQuery = useQuery<LeaveRequest[]>({
    queryKey: ['leaves'],
    queryFn: async () => {
      const response = await leaveApi.getAll()
      return response.data?.result?.content || []
    },
    staleTime: 1000 * 60 * 1,
  })

  const createLeave = useMutation({
    mutationFn: (data: CreateLeaveRequest) => leaveApi.create(data).then((res) => res.data.result),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['leaves'] }),
  })

  const approveLeave = useMutation({
    mutationFn: (id: string | number) => leaveApi.approve(id).then((res) => res.data.result),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['leaves'] }),
  })

  const rejectLeave = useMutation({
    mutationFn: (id: string | number) => leaveApi.reject(id).then((res) => res.data.result),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['leaves'] }),
  })

  return {
    leavesQuery,
    createLeave,
    approveLeave,
    rejectLeave,
  }
}
