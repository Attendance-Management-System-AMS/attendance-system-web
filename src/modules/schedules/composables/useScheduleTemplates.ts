import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { queryKeys } from '@/shared/lib/queryKeys'
import { scheduleTemplateApi } from '@/modules/schedules/api/scheduleTemplate.api'
import type { CreateScheduleTemplate } from '@/modules/schedules/types/schedule.types'

export function useScheduleTemplates() {
  const queryClient = useQueryClient()

  const templatesQuery = useQuery({
    queryKey: queryKeys.scheduleTemplates.all(),
    queryFn: async () => {
      const response = await scheduleTemplateApi.getAll()
      return response.data?.result || []
    },
    staleTime: 1000 * 60 * 5, // 5 phút
  })

  const createTemplate = useMutation({
    mutationFn: (data: CreateScheduleTemplate) =>
      scheduleTemplateApi.create(data).then((res) => res.data.result),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.scheduleTemplates.all() })
    },
  })

  const updateTemplate = useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: CreateScheduleTemplate }) =>
      scheduleTemplateApi.update(id, data).then((res) => res.data.result),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.scheduleTemplates.all() })
    },
  })

  const deleteTemplate = useMutation({
    mutationFn: (id: number | string) => scheduleTemplateApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.scheduleTemplates.all() })
    },
  })

  return {
    templatesQuery,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  }
}
