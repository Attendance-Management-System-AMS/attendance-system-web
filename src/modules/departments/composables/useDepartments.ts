import { departmentApi } from '@/modules/departments/api/department.api';
import type { Department } from '@/modules/departments/types/department.types';
import type { Page } from '@/shared/types/api';
import { queryKeys } from '@/shared/lib/queryKeys'
import axios from 'axios'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { type MaybeRefOrGetter, toValue, computed } from 'vue'

export interface UseDepartmentsParams {
    page?: MaybeRefOrGetter<number>;
    size?: MaybeRefOrGetter<number>;
    sort?: MaybeRefOrGetter<string>;
    sortDir?: MaybeRefOrGetter<string>;
    keyword?: MaybeRefOrGetter<string>;
}

function emptyDepartmentsPage(): Page<Department> {
    return {
        content: [],
        page: 0,
        size: 0,
        totalElements: 0,
        totalPages: 0,
        last: true,
        first: true,
        numberOfElements: 0,
    }
}

type DepartmentQuerySnapshot = [readonly unknown[], Page<Department> | undefined]

function matchesDepartmentKeyword(department: Department, keyword?: string) {
    const normalizedKeyword = keyword?.trim().toLowerCase()
    if (!normalizedKeyword) {
        return true
    }

    return [department.name, department.description]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedKeyword))
}

function getDepartmentQueryMeta(queryKey: readonly unknown[]) {
    const raw = queryKey[1]
    if (!raw || typeof raw !== 'object') {
        return { keyword: '', page: 0, size: undefined as number | undefined }
    }

    const params = raw as Record<string, unknown>

    return {
        keyword: typeof params.keyword === 'string' ? params.keyword : '',
        page: typeof params.page === 'number' ? params.page : 0,
        size: typeof params.size === 'number' ? params.size : undefined,
    }
}

function cloneDepartmentPage(page: Page<Department>): Page<Department> {
    return {
        ...page,
        content: [...page.content],
    }
}

function snapshotDepartmentQueries(queryClient: ReturnType<typeof useQueryClient>): DepartmentQuerySnapshot[] {
    return queryClient
        .getQueriesData<Page<Department>>({ queryKey: queryKeys.departments.all() })
        .map(([queryKey, page]) => [queryKey, page ? cloneDepartmentPage(page) : undefined] as DepartmentQuerySnapshot)
}

function restoreDepartmentQueries(
    queryClient: ReturnType<typeof useQueryClient>,
    snapshots: DepartmentQuerySnapshot[] | undefined,
) {
    snapshots?.forEach(([queryKey, page]) => {
        queryClient.setQueryData(queryKey, page)
    })
}

export function useDepartments(params?: UseDepartmentsParams) {
    const queryClient = useQueryClient()

    // Query danh sách
    const departmentsQuery = useQuery<Page<Department>>({
        queryKey: computed(() => [
            ...queryKeys.departments.all(),
            {
                keyword: toValue(params?.keyword),
                page: toValue(params?.page),
                size: toValue(params?.size),
                sort: toValue(params?.sort),
                sortDir: toValue(params?.sortDir),
            }
        ]),
        queryFn: async () => {
            try {
                const response = await departmentApi.getAll({
                    keyword: toValue(params?.keyword),
                    page: toValue(params?.page),
                    size: toValue(params?.size),
                    sort: toValue(params?.sort),
                    sortDir: toValue(params?.sortDir),
                })
                return response.data?.result ?? emptyDepartmentsPage()
            } catch (error) {
                if (axios.isAxiosError(error) && error.response?.status === 403) {
                    return emptyDepartmentsPage()
                }
                throw error
            }
        },
        staleTime: 1000 * 60 * 3, // 3 phút
        gcTime: 1000 * 60 * 10,   // giữ cache 10 phút
    })

    // Mutation tạo
    const createDepartment = useMutation({
        mutationFn: (data: { name: string; description: string }) =>
            departmentApi.create(data).then(res => res.data.result),
        onMutate: async (newDept) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.departments.all() })
            const previous = snapshotDepartmentQueries(queryClient)
            const optimisticDepartment: Department = {
                id: `optimistic-${Date.now()}`,
                name: newDept.name.trim(),
                description: newDept.description.trim(),
                totalEmployees: 0,
                status: 'ACTIVE',
            }

            previous.forEach(([queryKey, page]) => {
                if (!page) {
                    return
                }

                const { keyword, page: pageIndex, size } = getDepartmentQueryMeta(queryKey)
                if (!matchesDepartmentKeyword(optimisticDepartment, keyword)) {
                    return
                }

                const nextContent =
                    pageIndex === 0
                        ? [optimisticDepartment, ...page.content].slice(0, size ?? undefined)
                        : page.content
                const nextTotalElements = page.totalElements + 1

                queryClient.setQueryData<Page<Department>>(queryKey, {
                    ...page,
                    content: nextContent,
                    totalElements: nextTotalElements,
                    totalPages: page.size
                        ? Math.max(1, Math.ceil(nextTotalElements / page.size))
                        : page.totalPages,
                    numberOfElements: nextContent.length,
                })
            })

            return { previous }
        },
        onError: (_err, _newDept, context) => {
            restoreDepartmentQueries(queryClient, context?.previous)
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.departments.all() })
        },
    })

    // Mutation xóa
    const deleteDepartment = useMutation({
        mutationFn: (id: string) => departmentApi.delete(id),
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.departments.all() })
            const previous = snapshotDepartmentQueries(queryClient)

            previous.forEach(([queryKey, page]) => {
                if (!page) {
                    return
                }

                const nextContent = page.content.filter((department) => String(department.id) !== String(id))
                if (nextContent.length === page.content.length) {
                    return
                }

                const nextTotalElements = Math.max(page.totalElements - 1, 0)

                queryClient.setQueryData<Page<Department>>(queryKey, {
                    ...page,
                    content: nextContent,
                    totalElements: nextTotalElements,
                    totalPages: page.size
                        ? Math.max(1, Math.ceil(nextTotalElements / page.size))
                        : page.totalPages,
                    numberOfElements: nextContent.length,
                })
            })

            return { previous }
        },
        onError: (_err, _id, context) => {
            restoreDepartmentQueries(queryClient, context?.previous)
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.departments.all() })
        },
    })

    // Mutation cập nhật
    const updateDepartment = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Department> }) =>
            departmentApi.update(id, data).then((res) => res.data.result),
        onMutate: async ({ id, data }) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.departments.all() })
            const previous = snapshotDepartmentQueries(queryClient)

            previous.forEach(([queryKey, page]) => {
                if (!page) {
                    return
                }

                queryClient.setQueryData<Page<Department>>(queryKey, {
                    ...page,
                    content: page.content.map((department) =>
                        String(department.id) === String(id)
                            ? {
                                ...department,
                                ...data,
                                name: typeof data.name === 'string' ? data.name.trim() : department.name,
                                description:
                                    typeof data.description === 'string'
                                        ? data.description.trim()
                                        : department.description,
                            }
                            : department,
                    ),
                })
            })

            return { previous }
        },
        onError: (_err, _variables, context) => {
            restoreDepartmentQueries(queryClient, context?.previous)
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.departments.all() })
        },
    })

    return {
        departmentsQuery,
        createDepartment,
        deleteDepartment,
        updateDepartment,
    }
}
