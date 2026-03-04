import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '@/views/HomeView.vue'
import AboutView from '@/views/AboutView.vue'
import PlaceholderView from '@/views/PlaceholderView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/nhan-su',
      name: 'nhan-su',
      component: PlaceholderView,
      meta: {
        title: 'Quản lý nhân sự',
      },
    },
    {
      path: '/cham-cong',
      name: 'cham-cong',
      component: PlaceholderView,
      meta: {
        title: 'Quản lý chấm công',
      },
    },
    {
      path: '/bao-cao',
      name: 'bao-cao',
      component: PlaceholderView,
      meta: {
        title: 'Báo cáo tổng hợp',
      },
    },
    {
      path: '/cai-dat',
      name: 'cai-dat',
      component: PlaceholderView,
      meta: {
        title: 'Cấu hình hệ thống',
      },
    },
    {
      path: '/about',
      name: 'about',
      component: AboutView,
    },
  ],
})

export default router
