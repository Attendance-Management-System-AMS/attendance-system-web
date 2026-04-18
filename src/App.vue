<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'
import { useAuth } from '@/modules/auth/composables/useAuth'
import { useTheme } from '@/shared/theme/useTheme'
import LoadingOverlay from '@/shared/ui/LoadingOverlay.vue'
import { Toaster } from '@/shared/ui/sonner'

const { isLoadingProfile } = useAuth()
const { initTheme, activeColorScheme } = useTheme()

onMounted(() => {
  initTheme()
})
</script>

<template>
  <div class="min-h-screen">
    <!-- Toàn màn hình Splash Screen khi khởi tạo app -->
    <LoadingOverlay 
      :show="isLoadingProfile" 
      text="Đang tải..." 
      full-screen
    />
    
    <RouterView />
    <Toaster :theme="(activeColorScheme as any)" position="top-right" rich-colors close-button />
  </div>
</template>
