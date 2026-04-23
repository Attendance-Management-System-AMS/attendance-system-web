<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Eye, EyeOff, LockKeyhole, User } from 'lucide-vue-next'
import { getApiErrorMessage } from '@/shared/api/apiErrorMessage'
import { setAuthTokens } from '@/shared/auth/token'
import { authApi, resolveAuthToken } from '@/modules/auth/api/auth.api'
import { useAuth } from '@/modules/auth/composables/useAuth'
import LoadingOverlay from '@/shared/ui/LoadingOverlay.vue'

const router = useRouter()
const route = useRoute()

const login = ref('')
const password = ref('')
const remember = ref(true)
const showPassword = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref('')

const canSubmit = computed(() => login.value.trim() !== '' && password.value.trim() !== '')

const handleSubmit = async () => {
  errorMessage.value = ''

  if (!canSubmit.value) {
    errorMessage.value = 'Vui lòng nhập tên đăng nhập hoặc email và mật khẩu.'
    return
  }

  isSubmitting.value = true
  try {
    const data = await authApi.login({
      login: login.value.trim(),
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
    class="relative min-h-screen overflow-hidden bg-background text-foreground"
  >
    <LoadingOverlay :show="isSubmitting" text="Đang đăng nhập..." full-screen />
    <div
      class="relative z-10 mx-auto flex min-h-screen w-full items-center justify-center px-4 py-8 sm:px-6 lg:px-8"
    >
      <div class="w-full max-w-md">
        <section
          class="relative overflow-hidden rounded-lg border border-border-standard bg-card p-6 text-card-foreground shadow-xl sm:p-8"
        >

          <div class="mb-6">
            <p class="text-xs font-medium tracking-normal text-primary">
              Đăng nhập hệ thống
            </p>
            <h2 class="mt-2 text-2xl font-semibold tracking-normal text-primary-text">
              Chào mừng quay lại
            </h2>
            <p class="mt-1 text-sm text-secondary-text">
              Sử dụng tài khoản nội bộ để truy cập TimeMaster AMS.
            </p>
          </div>

          <form class="space-y-4" @submit.prevent="handleSubmit">
            <div>
              <label class="mb-1.5 block text-xs font-medium tracking-normal text-tertiary-text"
                >Tên đăng nhập hoặc email</label
              >
              <div class="relative">
                <User
                  class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-tertiary-text"
                />
                <input
                  v-model="login"
                  data-testid="login-email"
                  type="text"
                  autocomplete="username"
                  placeholder="EMP-0001 hoặc admin@timemaster.vn"
                  class="h-11 w-full rounded-lg border border-border-standard bg-surface pl-10 pr-3 text-sm text-primary-text outline-none transition-colors placeholder:text-tertiary-text focus:border-primary focus:bg-background focus:ring-2 focus:ring-ring/40"
                />
              </div>
            </div>

            <div>
              <label class="mb-1.5 block text-xs font-medium tracking-normal text-tertiary-text"
                >Mật khẩu</label
              >
              <div class="relative">
                <LockKeyhole
                  class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-tertiary-text"
                />
                <input
                  v-model="password"
                  data-testid="login-password"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="current-password"
                  placeholder="Nhập mật khẩu"
                  class="h-11 w-full rounded-lg border border-border-standard bg-surface pl-10 pr-10 text-sm text-primary-text outline-none transition-colors placeholder:text-tertiary-text focus:border-primary focus:bg-background focus:ring-2 focus:ring-ring/40"
                />
                <button
                  type="button"
                  class="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-secondary-text transition-colors hover:bg-elevated hover:text-primary-text"
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
                class="inline-flex cursor-pointer items-center gap-2 text-sm text-secondary-text"
              >
                <input
                  v-model="remember"
                  type="checkbox"
                  class="h-4 w-4 rounded border-border-standard text-primary"
                />
                Ghi nhớ đăng nhập
              </label>
              <button
                type="button"
                class="text-sm font-medium text-primary hover:brightness-110"
              >
                Quên mật khẩu?
              </button>
            </div>

            <p
              v-if="errorMessage"
              data-testid="login-error"
              class="rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-600 dark:text-rose-400"
            >
              {{ errorMessage }}
            </p>

            <button
              type="submit"
              data-testid="login-submit"
              :disabled="isSubmitting"
              class="mt-2 inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {{ isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập' }}
            </button>
          </form>
        </section>
      </div>
    </div>
  </div>
</template>
