<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { Home, SearchX } from 'lucide-vue-next'
</script>

<template>
  <div class="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16">
    <div
      class="relative mb-8 flex h-28 w-28 items-center justify-center rounded-3xl bg-linear-to-br from-indigo-500 via-violet-500 to-teal-400 shadow-xl shadow-indigo-500/25"
    >
      <SearchX class="h-14 w-14 text-white" />
      <span
        class="absolute -right-2 -top-2 rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold uppercase text-white"
      >
        404
      </span>
    </div>
    <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
      Không tìm thấy trang
    </h1>
    <p class="mt-2 max-w-md text-center text-sm text-slate-500 dark:text-slate-400">
      Đường dẫn không tồn tại hoặc đã được đổi. Hãy quay về trang chủ hoặc dùng menu bên trái.
    </p>
    <RouterLink
      to="/dashboard"
      class="mt-8 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-700"
    >
      <Home class="h-4 w-4" />
      Về Dashboard
    </RouterLink>
  </div>
</template>
