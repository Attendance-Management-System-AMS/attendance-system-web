<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-vue-next'
import { getApiErrorMessage } from '@/shared/api/apiErrorMessage'
import { setAuthTokens } from '@/shared/auth/token'
import { authApi, resolveAuthToken } from '@/modules/auth/api/auth.api'
import { useAuth } from '@/modules/auth/composables/useAuth'
import LoadingOverlay from '@/shared/ui/LoadingOverlay.vue'

const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const remember = ref(true)
const showPassword = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref('')

const canSubmit = computed(() => email.value.trim() !== '' && password.value.trim() !== '')

const handleSubmit = async () => {
  errorMessage.value = ''

  if (!canSubmit.value) {
    errorMessage.value = 'Vui lòng nhập email và mật khẩu.'
    return
  }

  isSubmitting.value = true
  try {
    const data = await authApi.login({
      email: email.value.trim(),
      password: password.value,
      remember: remember.value,
    })

    const result = data?.result
    const token = resolveAuthToken(result)

    if (!token) {
      throw new Error('Phản hồi đăng nhập không chứa token.')
    }

    setAuthTokens(token, result?.refreshToken)

    if (result?.user) {
      const { setUser } = useAuth()
      setUser(result.user)
    }

    // Re-check roles immediately to decide where to go
    const { isAdmin, isHR, isManager } = useAuth()
    const isPowerUser = isAdmin.value || isHR.value || isManager.value

    let redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/dashboard'

    // Nếu là PowerUser mà bị redirect vào trang cá nhân, ép buộc về Dashboard tổng
    if (isPowerUser && (redirect === '/' || redirect.startsWith('/my'))) {
      redirect = '/dashboard'
    }

    router.push(redirect)
  } catch (err) {
    errorMessage.value = getApiErrorMessage(err, 'Đăng nhập thất bại. Vui lòng thử lại.')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div
    class="relative min-h-screen overflow-hidden bg-linear-to-br from-slate-100 via-indigo-50 to-white dark:from-slate-950 dark:via-indigo-950/40 dark:to-slate-900"
  >
    <div
      class="pointer-events-none absolute -top-16 -left-16 h-64 w-64 rounded-full bg-indigo-400/25 blur-3xl dark:bg-indigo-600/20"
    />
    <div
      class="pointer-events-none absolute right-0 bottom-0 h-80 w-80 rounded-full bg-indigo-300/20 blur-3xl dark:bg-indigo-500/10"
    />

    <div
      class="relative z-10 mx-auto flex min-h-screen w-full items-center justify-center px-4 py-8 sm:px-6 lg:px-8"
    >
      <div class="w-full max-w-md">
        <section
          class="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-2xl shadow-indigo-200/30 dark:border-slate-800 dark:bg-slate-900 sm:p-8"
        >
          <!-- Loading Overlay -->
          <LoadingOverlay :show="isSubmitting" />

          <div class="mb-6">
            <p
              class="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400"
            >
              Đăng nhập hệ thống
            </p>
            <h2 class="mt-2 text-2xl font-black text-slate-900 dark:text-white">
              Chào mừng quay lại
            </h2>
            <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Sử dụng tài khoản nội bộ để truy cập TimeMaster AMS.
            </p>
          </div>

          <form class="space-y-4" @submit.prevent="handleSubmit">
            <div>
              <label class="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500"
                >Email</label
              >
              <div class="relative">
                <Mail
                  class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                />
                <input
                  v-model="email"
                  type="email"
                  autocomplete="email"
                  placeholder="admin@timemaster.vn"
                  class="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label class="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500"
                >Mật khẩu</label
              >
              <div class="relative">
                <LockKeyhole
                  class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                />
                <input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="current-password"
                  placeholder="Nhập mật khẩu"
                  class="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <button
                  type="button"
                  class="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                  @click="showPassword = !showPassword"
                  :aria-label="showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'"
                >
                  <EyeOff v-if="showPassword" class="h-4 w-4" />
                  <Eye v-else class="h-4 w-4" />
                </button>
              </div>
            </div>

            <div class="flex items-center justify-between gap-3">
              <label
                class="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-600 dark:text-slate-300"
              >
                <input
                  v-model="remember"
                  type="checkbox"
                  class="h-4 w-4 rounded border-slate-300 text-indigo-600"
                />
                Ghi nhớ đăng nhập
              </label>
              <button
                type="button"
                class="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                Quên mật khẩu?
              </button>
            </div>

            <p
              v-if="errorMessage"
              class="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300"
            >
              {{ errorMessage }}
            </p>

            <button
              type="submit"
              :disabled="isSubmitting"
              class="mt-2 inline-flex h-11 w-full items-center justify-center rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-400"
            >
              {{ isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập' }}
            </button>
          </form>
        </section>
      </div>
    </div>
  </div>
</template>
