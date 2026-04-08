import type { RouteRecordRaw } from 'vue-router'

export default [
    {
        path: '/departments',
        meta: { roles: ['ROLE_ADMIN', 'ROLE_HR'] },
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
