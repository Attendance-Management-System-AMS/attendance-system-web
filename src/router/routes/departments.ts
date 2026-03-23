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
            {
                path: ':id/edit',
                name: 'departments-edit',
                component: () => import('@/views/departments/DepartmentEditView.vue'),
                meta: { title: 'Sửa phòng ban' },
            },
        ],
    },
] as RouteRecordRaw[]
