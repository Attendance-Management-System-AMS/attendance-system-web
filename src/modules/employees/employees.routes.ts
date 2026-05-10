import type { RouteRecordRaw } from 'vue-router'

export default [
  {
    path: '/employees',
    meta: { roles: ['ROLE_ADMIN', 'ROLE_HR', 'ROLE_MANAGER'] },
    children: [
      {
        path: '',
        name: 'employees',
        component: () => import('@/modules/employees/pages/EmployeesView.vue'),
        meta: { title: 'Nhân viên' },
      },
      {
        path: 'new',
        name: 'employee-new',
        component: () => import('@/modules/employees/pages/EmployeeNewView.vue'),
        meta: { title: 'Thêm nhân viên', roles: ['ROLE_ADMIN', 'ROLE_HR'] },
      },
      {
        path: ':id/register-face',
        name: 'employee-register-face',
        component: () => import('@/modules/employees/pages/EmployeeFaceRegisterView.vue'),
        meta: { title: 'Đăng ký khuôn mặt', roles: ['ROLE_ADMIN', 'ROLE_HR'] },
      },
      {
        path: ':id/edit',
        name: 'employee-edit',
        component: () => import('@/modules/employees/pages/EmployeeEditView.vue'),
        meta: { title: 'Chỉnh sửa nhân viên', roles: ['ROLE_ADMIN', 'ROLE_HR'] },
      },
      {
        path: ':id',
        name: 'employee-detail',
        component: () => import('@/modules/employees/pages/EmployeeDetailView.vue'),
        meta: { title: 'Chi tiết nhân viên' },
      },
    ],
  },
] as RouteRecordRaw[]
