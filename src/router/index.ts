import { createRouter, createWebHistory } from 'vue-router'

import DashboardView from '@/views/DashboardView.vue'
import AttendanceView from '@/views/AttendanceView.vue'
import EmployeesView from '@/views/employees/EmployeesView.vue'
import EmployeeNewView from '@/views/employees/EmployeeNewView.vue'
import EmployeeEditView from '@/views/employees/EmployeeEditView.vue'
import DepartmentsView from '@/views/DepartmentsView.vue'
import ShiftsView from '@/views/ShiftsView.vue'
import TimesheetsView from '@/views/TimesheetsView.vue'
import ReportsView from '@/views/ReportsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { title: 'Dashboard' },
    },
    {
      path: '/attendance',
      name: 'attendance',
      component: AttendanceView,
      meta: { title: 'Chấm công hôm nay' },
    },
    {
      path: '/schedule',
      name: 'schedule',
      component: () => import('@/views/PlaceholderView.vue'),
      meta: { title: 'Lịch làm việc' },
    },
    {
      path: '/employees',
      name: 'employees',
      component: EmployeesView,
      meta: { title: 'Nhân viên' },
    },
    {
      path: '/employees/new',
      name: 'employee-new',
      component: EmployeeNewView,
      meta: { title: 'Thêm nhân viên' },
    },
    {
      path: '/employees/:id/edit',
      name: 'employee-edit',
      component: EmployeeEditView,
      meta: { title: 'Chỉnh sửa nhân viên' },
    },
    {
      path: '/departments',
      name: 'departments',
      component: DepartmentsView,
      meta: { title: 'Phòng ban' },
    },
    {
      path: '/shifts',
      name: 'shifts',
      component: ShiftsView,
      meta: { title: 'Ca làm việc' },
    },
    {
      path: '/timesheets',
      name: 'timesheets',
      component: TimesheetsView,
      meta: { title: 'Bảng công' },
    },
    {
      path: '/reports',
      name: 'reports',
      component: ReportsView,
      meta: { title: 'Báo cáo & Phân tích' },
    },
    {
      path: '/export',
      name: 'export',
      component: () => import('@/views/PlaceholderView.vue'),
      meta: { title: 'Xuất báo cáo' },
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/PlaceholderView.vue'),
      meta: { title: 'Cài đặt' },
    },
    {
      path: '/permissions',
      name: 'permissions',
      component: () => import('@/views/PlaceholderView.vue'),
      meta: { title: 'Phân quyền' },
    },
    {
      path: '/kiosk',
      name: 'kiosk',
      component: () => import('@/components/AttendanceKiosk.vue'),
      meta: {
        hideLayout: true,
        title: 'Kiosk Chấm công',
      },
    },
  ],
})

// Update document title on route change
router.afterEach((to) => {
  const title = to.meta.title as string | undefined
  document.title = title ? `${title} — TimeMaster AMS` : 'TimeMaster AMS'
})

export default router
