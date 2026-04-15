<script setup lang="ts">
import { Clock } from 'lucide-vue-next'
import PageHeader from '@/shared/ui/PageHeader.vue'
</script>

<template>
  <div class="space-y-6">
    <PageHeader title="Giới thiệu" description="TimeMaster AMS — Hệ thống quản lý chấm công" />
    <div
      class="rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div class="flex items-center gap-3">
        <div
          class="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg"
        >
          <Clock class="h-6 w-6" />
        </div>
        <div>
          <p class="font-bold text-slate-900 dark:text-white">TimeMaster AMS</p>
          <p class="text-sm text-slate-500">Phiên bản giao diện web</p>
        </div>
      </div>
      <p class="mt-6 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
        Ứng dụng quản lý chấm công và nhân sự cho doanh nghiệp. Trang này dùng cho thông tin tĩnh
        hoặc liên kết tài liệu khi cần.
      </p>
    </div>
  </div>
</template>
