import { fileURLToPath, URL } from 'node:url'
import { VitePWA } from 'vite-plugin-pwa'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isE2EMode = mode === 'test'
  const devProxyTarget =
    env.DEV_PROXY_TARGET || env.VITE_DEV_PROXY_TARGET || 'http://localhost:9000'
  const devAllowedHostsRaw = (env.DEV_ALLOWED_HOSTS || env.VITE_DEV_ALLOWED_HOSTS)?.trim()
  const allowedHosts = devAllowedHostsRaw
    ? devAllowedHostsRaw
        .split(',')
        .map((h) => h.trim())
        .filter(Boolean)
    : true

  return {
    plugins: [
      tailwindcss(),
      vue(),
      vueJsx(),
      ...(!isE2EMode ? [vueDevTools()] : []),
      ...(!isE2EMode
        ? [
            VitePWA({
              registerType: 'autoUpdate',
              injectRegister: 'script',
              manifest: {
                id: '/ams-kiosk/',
                name: 'Attendance Management System',
                short_name: 'AMS Kiosk',
                description: 'Hệ thống chấm công khuôn mặt tự động (AMS)',
                theme_color: '#3b82f6',
                background_color: '#f8fafc',
                display: 'standalone',
                orientation: 'portrait',
                start_url: '/',
                categories: ['productivity', 'security'],
                icons: [
                  {
                    src: 'pwa-512.png',
                    sizes: '512x512',
                    type: 'image/png',
                    purpose: 'any maskable',
                  },
                  {
                    src: 'pwa-512.png',
                    sizes: '192x192',
                    type: 'image/png',
                    purpose: 'any maskable',
                  },
                ],
              },
              devOptions: {
                enabled: true,
                type: 'module',
              },
              workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,vue}'],
                navigateFallback: 'index.html',
              },
            }),
          ]
        : []),
    ],
    server: {
      host: true,
      allowedHosts,
      proxy: {
        '/api': {
          target: devProxyTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('face-api.js') || id.includes('@tensorflow')) {
              return 'face-recognition'
            }
          },
        },
      },
    },
  }
})
