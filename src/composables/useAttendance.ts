import { attendanceApi } from '@/services/attendance.service';
import type { Attendance } from '@/types/attendance';
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'

export function useAttendance() {
    const queryClient = useQueryClient()

    // Query danh sách
    const attendanceQuery = useQuery<Attendance[]>({
        queryKey: ['attendance'],
        queryFn: async () => (await attendanceApi.getAll()).data,
        staleTime: 1000 * 60 * 1, // 1 phút
    })

    // Mutation check-in
    const checkIn = useMutation({
        mutationFn: (descriptor: number[]) => attendanceApi.checkIn(descriptor),
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['attendance'] })
        },
    })

    return {
        attendanceQuery,
        checkIn,
    }
}
