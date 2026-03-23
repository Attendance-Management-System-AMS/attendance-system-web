import type { RouteRecordRaw } from 'vue-router'

export default [
    {
        path: '/employees',
        children: [
            {
                path: '',
                name: 'employees',
                component: () => import('@/views/employees/EmployeesView.vue'),
                meta: { title: 'Nhân viên' },
            },
            {
                path: 'new',
                name: 'employee-new',
                component: () => import('@/views/employees/EmployeeNewView.vue'),
                meta: { title: 'Thêm nhân viên' },
            },
            {
                path: ':id',
                name: 'employee-detail',
                component: () => import('@/views/employees/EmployeeDetailView.vue'),
                meta: { title: 'Chi tiết nhân viên' },
            },
            {
                path: ':id/edit',
                name: 'employee-edit',
                component: () => import('@/views/employees/EmployeeEditView.vue'),
                meta: { title: 'Chỉnh sửa nhân viên' },
            },
        ],
    },
] as RouteRecordRaw[]
