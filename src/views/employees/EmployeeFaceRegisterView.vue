<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import { ArrowLeft, Camera, CheckCircle2, ScanFace, ShieldCheck, X, XCircle } from 'lucide-vue-next'
import { getApiErrorMessage } from '@/lib/apiErrorMessage'
import { queryKeys } from '@/lib/queryKeys'
import { employeeApi } from '@/services/employee.service'
import { useEmployees } from '@/composables/useEmployees'
import { useFaceDetection } from '@/composables/useFaceDetection'
import type { Employee } from '@/types/employee'

const FACE_SCORE_THRESHOLD = 0.5
const SCAN_DELAY_MS = 180
const CAPTURE_SAMPLE_COUNT = 5
const CAPTURE_MAX_ATTEMPTS = 12
const CAPTURE_SAMPLE_DELAY_MS = 120
const FACE_DESCRIPTOR_LENGTH = 128

const route = useRoute()
const router = useRouter()
const { registerFaceDescriptor } = useEmployees()

const employeeId = computed(() => Number(route.params.id))

const employeeQuery = useQuery<Employee>({
  queryKey: computed(() => queryKeys.employees.detail(employeeId.value)),
  queryFn: async () => {
    const res = await employeeApi.getById(employeeId.value)
    return res.data.result
  },
  enabled: computed(() => Number.isFinite(employeeId.value) && employeeId.value > 0),
})

const employee = computed(() => employeeQuery.data.value)

const ui = reactive({
  busy: false,
  faceReady: false,
  faceScore: 0,
  captureStep: 0,
  feedback: { status: 'idle' as 'idle' | 'success' | 'error', msg: '' },
  /** Đặt true sau khi API lưu thành công — giữ UI “đã đăng ký” kể cả khi GET chưa kịp trả faceRegistered */
  justSavedFace: false,
  lastSuccessAt: null as number | null,
  hint: 'Đưa mặt vào giữa khung để kiểm tra chất lượng.',
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

const sleep = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms))

const isValidDescriptor = (descriptor: number[]) =>
  descriptor.length === FACE_DESCRIPTOR_LENGTH && descriptor.every((value) => Number.isFinite(value))

const averageDescriptors = (samples: number[][]) =>
  Array.from({ length: FACE_DESCRIPTOR_LENGTH }, (_, index) => {
    const value = samples.reduce((sum, sample) => sum + (sample[index] ?? 0), 0) / samples.length
    return Number(value.toFixed(8))
  })

const collectDescriptorSamples = async () => {
  const samples: number[][] = []
  let attempts = 0

  while (samples.length < CAPTURE_SAMPLE_COUNT && attempts < CAPTURE_MAX_ATTEMPTS) {
    attempts += 1
    const det = await detectFace()
    if (det && det.detection.score >= FACE_SCORE_THRESHOLD) {
      const descriptor = Array.from(det.descriptor) as number[]
      if (isValidDescriptor(descriptor)) {
        samples.push(descriptor)
        ui.captureStep = samples.length
      }
    }
    await sleep(CAPTURE_SAMPLE_DELAY_MS)
  }

  if (samples.length < 3) {
    throw new Error('Chưa lấy đủ mẫu khuôn mặt rõ. Vui lòng nhìn thẳng camera, giữ sáng đều và thử lại.')
  }

  return averageDescriptors(samples)
}

const submitDescriptor = async (descriptor: number[]) => {
  if (!isValidDescriptor(descriptor)) {
    throw new Error('Descriptor khuôn mặt không hợp lệ.')
  }

  try {
    await registerFaceDescriptor.mutateAsync({
      id: employeeId.value,
      body: { descriptor },
    })
    ui.justSavedFace = true
    ui.lastSuccessAt = Date.now()
    ui.feedback = {
      status: 'success',
      msg: 'Đã lưu khuôn mặt thành công. Hệ thống đã lấy nhiều mẫu và lưu descriptor ổn định hơn.',
    }
    await employeeQuery.refetch()
  } catch (err) {
    throw err
  }

  if (successAutoHideTimer) window.clearTimeout(successAutoHideTimer)
  successAutoHideTimer = window.setTimeout(() => {
    if (ui.feedback.status === 'success') dismissFeedback()
  }, 20000)
}

const handleSaveFace = async () => {
  if (ui.busy || !isLoaded.value) return

  if (scanTimer) {
    window.clearTimeout(scanTimer)
    scanTimer = undefined
  }

  ui.busy = true
  ui.captureStep = 0
  ui.feedback = { status: 'idle', msg: '' }
  ui.hint = 'Giữ yên, hệ thống đang lấy nhiều mẫu khuôn mặt.'

  try {
    const descriptor = await collectDescriptorSamples()
    await submitDescriptor(descriptor)
    ui.hint = 'Mẫu khuôn mặt đã sẵn sàng để dùng khi chấm công.'
  } catch (err) {
    const localError =
      err instanceof Error &&
      (err.message.startsWith('Chưa lấy đủ mẫu') || err.message.startsWith('Descriptor'))
    ui.feedback = {
      status: 'error',
      msg: localError ? err.message : getApiErrorMessage(err, 'Không thể đăng ký khuôn mặt.'),
    }
    ui.hint = 'Đưa mặt vào giữa khung để thử lại.'
  } finally {
    ui.busy = false
    ui.captureStep = 0
    scanTimer = window.setTimeout(runScanner, 400)
  }
}

const runScanner = async () => {
  if (!ui.busy && isLoaded.value) {
    const det = await detectFace()
    ui.faceScore = det?.detection.score ?? 0
    if (det && det.detection.score >= FACE_SCORE_THRESHOLD) {
      ui.faceReady = true
      ui.hint = 'Khuôn mặt đạt điều kiện. Bấm lưu để đăng ký.'
    } else if (det) {
      ui.faceReady = false
      ui.hint = 'Camera đã thấy mặt nhưng chưa đủ rõ. Nhìn thẳng và tăng ánh sáng.'
    } else {
      ui.faceReady = false
      ui.hint = 'Đưa mặt vào giữa khung để kiểm tra chất lượng.'
    }
  }
  scanTimer = window.setTimeout(runScanner, SCAN_DELAY_MS)
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
      class="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900"
    >
      <div class="mx-auto mb-3 h-8 w-8 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
      Đang tải thông tin nhân viên...
    </div>

    <div
      v-else-if="employeeQuery.isError.value || !employee"
      class="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300"
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
            class="relative overflow-hidden rounded-xl border border-slate-200/90 bg-linear-to-b from-slate-900 to-slate-950 shadow-xl ring-1 ring-black/5 dark:border-slate-700/80"
            :class="
              ui.busy
                ? 'ring-2 ring-sky-400/60 shadow-sky-500/10'
                : ui.feedback.status === 'success'
                ? 'ring-2 ring-emerald-500/60 shadow-emerald-500/10'
                : ui.faceReady
                ? 'ring-2 ring-emerald-400/50 shadow-emerald-500/10'
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
                  class="h-[68%] max-h-[min(420px,70vw)] w-[55%] max-w-[min(340px,85vw)] rounded-[50%] border-2 border-dashed shadow-[0_0_0_9999px_rgba(0,0,0,0.42)]"
                  :class="ui.faceReady || ui.busy ? 'border-emerald-300/80' : 'border-white/45'"
                />
              </div>
              <div
                class="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 via-black/40 to-transparent px-4 pb-5 pt-16 sm:px-6"
              >
                <div
                  class="flex gap-3 rounded-xl border border-white/10 bg-black/45 px-4 py-3 text-sm text-white shadow-lg backdrop-blur-md"
                >
                  <ScanFace class="mt-0.5 h-5 w-5 shrink-0 text-indigo-300" />
                  <p class="leading-relaxed">
                    {{ ui.hint }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Cột phải -->
        <div class="flex flex-col gap-5 lg:col-span-5 xl:col-span-4">
          <div
            class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
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
              <span class="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Đang tải model nhận diện...
            </div>

            <div
              class="mt-5 rounded-lg border px-4 py-3 text-sm"
              :class="
                ui.faceReady
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-100'
                  : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300'
              "
            >
              <div class="flex items-start gap-2">
                <span
                  class="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                  :class="ui.faceReady ? 'bg-emerald-500' : 'bg-slate-400'"
                />
                <div class="min-w-0 flex-1">
                  <p>{{ ui.hint }}</p>
                  <p class="mt-1 text-xs opacity-75">
                    Độ rõ hiện tại: {{ Math.round(ui.faceScore * 100) }}%
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              class="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60"
              :class="
                ui.faceReady || ui.busy
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600'
              "
              :disabled="ui.busy || !isLoaded"
              @click="handleSaveFace"
            >
              <Camera class="h-4 w-4 shrink-0" />
              <span v-if="ui.busy">Đang lấy mẫu {{ ui.captureStep }}/{{ CAPTURE_SAMPLE_COUNT }}</span>
              <span v-else-if="effectiveFaceRegistered">Cập nhật khuôn mặt</span>
              <span v-else>Lưu khuôn mặt</span>
            </button>

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
