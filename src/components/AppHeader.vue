<script setup lang="ts">
import { ref } from 'vue'
import { Bell, Search } from 'lucide-vue-next'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

const searchQuery = ref('')
</script>

<template>
  <header
    class="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur"
  >
    <div>
      <p class="text-xs uppercase tracking-wide text-slate-500">Dashboard / Tổng quan</p>
      <h1 class="text-xl font-semibold text-slate-900">Bảng điều khiển</h1>
    </div>

    <div class="flex flex-1 items-center justify-end gap-4">
      <div class="relative w-full max-w-md">
        <Search
          class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
        />
        <Input
          v-model="searchQuery"
          placeholder="Tìm kiếm nhân sự, phòng ban, ca làm..."
          class="pl-9"
        />
      </div>

      <Button variant="outline" size="icon" class="shrink-0">
        <Bell class="size-4" />
      </Button>

      <Separator orientation="vertical" class="hidden h-8 md:block" />

      <div class="flex items-center gap-3">
        <Avatar>
          <AvatarImage
            src="https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=200&auto=format&fit=facearea"
            alt="Ảnh đại diện"
          />
          <AvatarFallback>NV</AvatarFallback>
        </Avatar>
        <div class="hidden text-sm md:block">
          <p class="font-medium text-slate-900">Nguyễn Thanh Vân</p>
          <p class="text-xs text-slate-500">Quản trị hệ thống</p>
        </div>
      </div>
    </div>
  </header>
</template>
