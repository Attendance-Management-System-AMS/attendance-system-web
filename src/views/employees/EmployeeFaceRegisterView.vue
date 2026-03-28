<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import axios from 'axios'
import { ArrowLeft, CheckCircle2, Info, ScanFace, ShieldCheck, X, XCircle } from 'lucide-vue-next'
import { employeeApi } from '@/services/employee.service'
import { useEmployees } from '@/composables/useEmployees'
import { useFaceDetection } from '@/composables/useFaceDetection'
import type { Employee } from '@/types/employee'

const route = useRoute()
const router = useRouter()
const { registerFaceDescriptor } = useEmployees()

const employeeId = computed(() => Number(route.params.id))

const employeeQuery = useQuery<Employee>({
  queryKey: computed(() => ['employee', employeeId.value]),
  queryFn: async () => {
    const res = await employeeApi.getById(employeeId.value)
    return res.data.result
  },
  enabled: computed(() => Number.isFinite(employeeId.value) && employeeId.value > 0),
})

const employee = computed(() => employeeQuery.data.value)

const ui = reactive({
  locked: false,
  progress: 0,
  feedback: { status: 'idle' as 'idle' | 'success' | 'error', msg: '' },
  /** Đặt true sau khi API lưu thành công — giữ UI “đã đăng ký” kể cả khi GET chưa kịp trả faceRegistered */
  justSavedFace: false,
  lastSuccessAt: null as number | null,
})

let successAutoHideTimer: number | undefined

/** Hiển thị “đã có mẫu” khi server báo hoặc vừa lưu thành công trong phiên */
const effectiveFaceRegistered = computed(
  () => !!(employee.value?.faceRegistered || ui.justSavedFace),
)

const successTimeLabel = computed(() => {
  if (!ui.lastSuccessAt) return ''
  return new Date(ui.lastSuccessAt).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
})

function dismissFeedback() {
  if (successAutoHideTimer) {
    window.clearTimeout(successAutoHideTimer)
    successAutoHideTimer = undefined
  }
  ui.feedback = { status: 'idle', msg: '' }
}

const { videoRef, isLoaded, loadModels, setupCamera, detectFace, stopCamera } = useFaceDetection()
let scanTimer: number | undefined
let faceDetectedStartTime: number | null = null

function parseApiError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const msg = err.response?.data as { message?: string } | undefined
    if (msg?.message) return msg.message
    if (err.message) return err.message
  }
  if (err instanceof Error) return err.message
  return 'Không thể đăng ký khuôn mặt.'
}

const submitDescriptor = async (descriptor: Float32Array) => {
  ui.locked = true
  ui.progress = 0
  const progressInterval = window.setInterval(() => {
    if (ui.progress < 90) ui.progress += 12
  }, 60)

  try {
    const descriptorArray = Array.from(descriptor) as number[]
    await registerFaceDescriptor.mutateAsync({
      id: employeeId.value,
      body: { descriptor: descriptorArray },
    })
    ui.progress = 100
    ui.justSavedFace = true
    ui.lastSuccessAt = Date.now()
    ui.feedback = {
      status: 'success',
      msg: 'Đã lưu khuôn mặt thành công. Mẫu descriptor đã được gửi lên máy chủ.',
    }
    await employeeQuery.refetch()
  } catch (err) {
    ui.feedback = { status: 'error', msg: parseApiError(err) }
  } finally {
    window.clearInterval(progressInterval)
  }

  window.setTimeout(() => {
    ui.locked = false
    ui.progress = 0
    runScanner()
  }, 500)

  if (successAutoHideTimer) window.clearTimeout(successAutoHideTimer)
  successAutoHideTimer = window.setTimeout(() => {
    if (ui.feedback.status === 'success') dismissFeedback()
  }, 20000)
}

const runScanner = async () => {
  if (!ui.locked && isLoaded.value) {
    const det = await detectFace()
    if (det && det.detection.score > 0.72) {
      if (!faceDetectedStartTime) {
        faceDetectedStartTime = Date.now()
      } else {
        const duration = Date.now() - faceDetectedStartTime
        if (duration >= 1800) {
          faceDetectedStartTime = null
          if (scanTimer) window.clearTimeout(scanTimer)
          await submitDescriptor(det.descriptor)
          return
        }
      }
    } else {
      faceDetectedStartTime = null
    }
  } else {
    faceDetectedStartTime = null
  }
  scanTimer = window.setTimeout(runScanner, 200)
}

onMounted(async () => {
  try {
    await loadModels()
    await setupCamera()
    runScanner()
  } catch (err) {
    console.error(err)
    ui.feedback = { status: 'error', msg: 'Không mở được camera hoặc tải model AI.' }
  }
})

onUnmounted(() => {
  if (scanTimer) window.clearTimeout(scanTimer)
  if (successAutoHideTimer) window.clearTimeout(successAutoHideTimer)
  stopCamera()
})
</script>

<template>
  <div class="space-y-8">
    <!-- Điều hướng -->
    <div>
      <button
        type="button"
        @click="router.push(employee ? `/employees/${employee.id}` : '/employees')"
        class="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
      >
        <ArrowLeft class="h-4 w-4" />
        Quay lại
      </button>
    </div>

    <div
      v-if="employeeQuery.isLoading.value"
      class="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900"
    >
      <div class="mx-auto mb-3 h-8 w-8 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
      Đang tải thông tin nhân viên...
    </div>

    <div
      v-else-if="employeeQuery.isError.value || !employee"
      class="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300"
    >
      Không tìm thấy nhân viên.
    </div>

    <template v-else>
      <!-- Tiêu đề + nhân viên -->
      <header class="space-y-2 border-b border-slate-200/80 pb-8 dark:border-slate-800/80">
        <p
          class="text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400"
        >
          Chấm công nhận diện
        </p>
        <h1 class="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          Đăng ký khuôn mặt
        </h1>
        <div
          class="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
        >
          <p
            class="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-lg text-slate-700 dark:text-slate-200"
          >
            <span class="font-semibold">{{ employee.fullName }}</span>
            <span class="text-slate-300 dark:text-slate-600" aria-hidden="true">·</span>
            <span
              class="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-sm font-medium text-indigo-700 dark:bg-slate-800 dark:text-indigo-300"
            >
              {{ employee.employeeCode }}
            </span>
          </p>
          <p
            v-if="effectiveFaceRegistered"
            class="inline-flex items-center gap-2 self-start rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 shadow-sm dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-200"
            role="status"
            aria-live="polite"
          >
            <CheckCircle2 class="h-3.5 w-3.5 shrink-0" />
            Đã có mẫu khuôn mặt trên hệ thống
          </p>
        </div>
      </header>

      <div class="grid gap-8 lg:grid-cols-12 lg:items-start">
        <!-- Camera -->
        <div class="lg:col-span-7 xl:col-span-8">
          <div
            class="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-linear-to-b from-slate-900 to-slate-950 shadow-xl ring-1 ring-black/5 dark:border-slate-700/80"
            :class="
              ui.feedback.status === 'success'
                ? 'ring-2 ring-emerald-500/60 shadow-emerald-500/10'
                : ''
            "
          >
            <div
              v-if="ui.feedback.status === 'success'"
              class="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center pt-4"
            >
              <span
                class="pointer-events-none flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-600/95 px-4 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur-sm"
              >
                <CheckCircle2 class="h-5 w-5 shrink-0" />
                Lưu thành công
              </span>
            </div>
            <div class="relative aspect-4/3 w-full">
              <video
                ref="videoRef"
                autoplay
                muted
                playsinline
                class="absolute inset-0 h-full w-full object-cover opacity-95 transform-[scaleX(-1)]"
              />
              <div
                class="pointer-events-none absolute inset-0 flex items-center justify-center border-[3px] border-white/15"
              >
                <div
                  class="h-[68%] max-h-[min(420px,70vw)] w-[55%] max-w-[min(340px,85vw)] rounded-[50%] border-2 border-dashed border-white/45 shadow-[0_0_0_9999px_rgba(0,0,0,0.42)]"
                />
              </div>
              <div
                class="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 via-black/40 to-transparent px-4 pb-5 pt-16 sm:px-6"
              >
                <div
                  class="flex gap-3 rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-sm text-white shadow-lg backdrop-blur-md"
                >
                  <ScanFace class="mt-0.5 h-5 w-5 shrink-0 text-indigo-300" />
                  <p class="leading-relaxed">
                    Đặt mặt trong khung, ánh sáng đều. Giữ yên khoảng
                    <strong class="font-semibold text-white">2 giây</strong>
                    để hệ thống chụp descriptor.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Cột phải -->
        <div class="flex flex-col gap-5 lg:col-span-5 xl:col-span-4">
          <div
            class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            :class="
              effectiveFaceRegistered
                ? 'border-emerald-200/80 ring-1 ring-emerald-100 dark:border-emerald-900/40 dark:ring-emerald-900/30'
                : ''
            "
          >
            <div class="flex items-start gap-3">
              <div
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/50"
              >
                <ShieldCheck class="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div class="min-w-0 flex-1">
                <h2
                  class="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                >
                  Trạng thái
                </h2>
                <p class="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  <template v-if="effectiveFaceRegistered">
                    Đã có khuôn mặt đăng ký — lần lưu tiếp theo sẽ
                    <strong class="font-semibold text-emerald-700 dark:text-emerald-400"
                      >cập nhật</strong
                    >
                    mẫu.
                  </template>
                  <template v-else>
                    Chưa đăng ký — lưu lần đầu để dùng chấm công nhận diện.
                  </template>
                </p>
              </div>
            </div>

            <div
              v-if="!isLoaded"
              class="mt-4 flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400"
            >
              <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
              Đang tải model nhận diện...
            </div>

            <div
              v-if="ui.progress > 0 && ui.progress < 100"
              class="mt-5 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
            >
              <div
                class="h-full rounded-full bg-indigo-500 transition-[width] duration-150"
                :style="{ width: `${ui.progress}%` }"
              />
            </div>

            <div
              v-if="ui.feedback.status === 'success'"
              class="mt-5 rounded-xl border border-emerald-200 bg-emerald-50/90 p-4 text-sm text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/50 dark:text-emerald-100"
              role="status"
              aria-live="assertive"
            >
              <div class="flex items-start gap-3">
                <CheckCircle2
                  class="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400"
                />
                <div class="min-w-0 flex-1 space-y-1">
                  <p>{{ ui.feedback.msg }}</p>
                  <p
                    v-if="successTimeLabel"
                    class="text-xs text-emerald-800/80 dark:text-emerald-200/80"
                  >
                    Thời điểm lưu: {{ successTimeLabel }}
                  </p>
                </div>
                <button
                  type="button"
                  class="shrink-0 rounded-lg p-1 text-emerald-700 transition-colors hover:bg-emerald-100 dark:text-emerald-300 dark:hover:bg-emerald-900/50"
                  aria-label="Đóng thông báo"
                  @click="dismissFeedback"
                >
                  <X class="h-4 w-4" />
                </button>
              </div>
            </div>
            <div
              v-if="ui.feedback.status === 'error'"
              class="mt-5 rounded-xl border border-rose-200 bg-rose-50/90 p-4 text-sm text-rose-900 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-100"
            >
              <div class="flex items-start gap-3">
                <XCircle class="mt-0.5 h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
                <span class="flex-1">{{ ui.feedback.msg }}</span>
                <button
                  type="button"
                  class="shrink-0 rounded-lg p-1 text-rose-700 transition-colors hover:bg-rose-100 dark:text-rose-300 dark:hover:bg-rose-900/50"
                  aria-label="Đóng thông báo lỗi"
                  @click="dismissFeedback"
                >
                  <X class="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
