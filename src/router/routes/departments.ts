import type { RouteRecordRaw } from 'vue-router'

export default [
    {
        path: '/departments',
        children: [
            {
                path: '',
                name: 'departments',
                component: () => import('@/views/departments/DepartmentsView.vue'),
                meta: { title: 'Phòng ban' },
            },
        ],
    },
] as RouteRecordRaw[]
