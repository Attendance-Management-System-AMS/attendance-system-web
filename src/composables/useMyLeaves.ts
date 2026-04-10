import { leaveApi } from '@/services/leave.service'
import type { CreateMyLeaveRequest } from '@/types/leave'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'

export function useMyLeaves(filters?: { status?: string }) {
  const queryClient = useQueryClient()

  const leavesQuery = useQuery({
    queryKey: ['leaves', 'me', filters],
    queryFn: () => leaveApi.getMyLeaves(filters).then(res => res.data.result),
  })

  const createMe = useMutation({
    mutationFn: (data: CreateMyLeaveRequest) => leaveApi.createMe(data).then(res => res.data.result),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves', 'me'] })
    },
  })

  const leaveTypesQuery = useQuery({
    queryKey: ['leaves', 'types'],
    queryFn: () => leaveApi.getTypes().then(res => res.data.result),
  })

  return {
    leavesQuery,
    createMe,
    leaveTypesQuery,
  }
}
