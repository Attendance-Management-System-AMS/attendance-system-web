<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import LoadingOverlay from '@/components/ui/LoadingOverlay.vue'
import { Toaster } from '@/components/ui/sonner'

const { isLoadingProfile } = useAuth()
</script>

<template>
  <div class="min-h-screen">
    <!-- Toàn màn hình Splash Screen khi khởi tạo app -->
    <LoadingOverlay 
      :show="isLoadingProfile" 
      text="Đang khởi tạo hệ thống..." 
      full-screen
    />
    
    <RouterView />
    <Toaster position="top-right" rich-colors close-button />
  </div>
</template>
