<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import { ArrowLeft, Camera, CheckCircle2, ScanFace, ShieldCheck, X, XCircle } from 'lucide-vue-next'
import { getApiErrorMessage } from '@/shared/api/apiErrorMessage'
import { queryKeys } from '@/shared/lib/queryKeys'
import { employeeApi } from '@/modules/employees/api/employee.api'
import { useEmployees } from '@/modules/employees/composables/useEmployees'
import { useFaceDetection } from '@/shared/face/useFaceDetection'
import type { Employee } from '@/modules/employees/types/employee.types'

const FACE_SCORE_THRESHOLD = 0.5
const SCAN_DELAY_MS = 180
const CAPTURE_MAX_ATTEMPTS = 18
const CAPTURE_SAMPLE_DELAY_MS = 160
const CAPTURE_POSE_SETTLE_MS = 2000
const CAPTURE_TRANSITION_DELAY_MS = 700
const FACE_DESCRIPTOR_LENGTH = 128
const CAPTURE_SEQUENCE = [
  {
    key: 'front-open',
    label: 'Nhìn thẳng',
    instruction: 'Giữ đầu thẳng, mắt nhìn vào camera để lấy mẫu nền ổn định.',
  },
  {
    key: 'left',
    label: 'Quay nhẹ trái',
    instruction: 'Xoay mặt nhẹ sang trái khoảng 15-20 độ, vẫn giữ mặt trong khung.',
  },
  {
    key: 'right',
    label: 'Quay nhẹ phải',
    instruction: 'Xoay mặt nhẹ sang phải khoảng 15-20 độ, không nghiêng quá mạnh.',
  },
  {
    key: 'down',
    label: 'Cúi nhẹ đầu',
    instruction: 'Hạ cằm nhẹ xuống, giữ mắt, mũi và miệng vẫn nằm trong vùng oval.',
  },
  {
    key: 'front-close',
    label: 'Nhìn thẳng lại',
    instruction: 'Quay về chính diện để chốt mẫu cuối cùng trước khi lưu.',
  },
] as const
const CAPTURE_SAMPLE_COUNT = CAPTURE_SEQUENCE.length

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
  capturePoseIndex: -1,
  capturePoseLabel: '',
  feedback: { status: 'idle' as 'idle' | 'success' | 'error', msg: '' },
  /** Đặt true sau khi API lưu thành công — giữ UI “đã đăng ký” kể cả khi GET chưa kịp trả faceRegistered */
  justSavedFace: false,
  lastSuccessAt: null as number | null,
  hint: 'Căn giữa khuôn mặt trong khung. Khi bắt đầu, hướng dẫn sẽ hiện trực tiếp trên màn hình camera.',
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

  for (const [index, pose] of CAPTURE_SEQUENCE.entries()) {
    ui.capturePoseIndex = index
    ui.capturePoseLabel = pose.label
    ui.hint = `Bước ${index + 1}/${CAPTURE_SAMPLE_COUNT}: ${pose.instruction} Giữ tư thế này trong chốc lát.`

    await sleep(CAPTURE_POSE_SETTLE_MS)

    let attempts = 0
    let captured = false

    while (!captured && attempts < CAPTURE_MAX_ATTEMPTS) {
      attempts += 1
      const det = await detectFace()
      if (det && det.detection.score >= FACE_SCORE_THRESHOLD) {
        const descriptor = Array.from(det.descriptor) as number[]
        if (isValidDescriptor(descriptor)) {
          samples.push(descriptor)
          ui.captureStep = samples.length
          captured = true
        }
      }
      if (!captured) {
        await sleep(CAPTURE_SAMPLE_DELAY_MS)
      }
    }

    if (!captured) {
      throw new Error(`Chưa ghi nhận được bước "${pose.label}". Hãy giữ mặt trong khung, đủ sáng và thử lại.`)
    }

    if (index < CAPTURE_SEQUENCE.length - 1) {
      await sleep(CAPTURE_TRANSITION_DELAY_MS)
    }
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
      msg: 'Đã lưu khuôn mặt thành công. Hệ thống đã lấy mẫu nhìn thẳng, quay trái, quay phải và cúi nhẹ để lưu descriptor ổn định hơn.',
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
  ui.capturePoseIndex = -1
  ui.capturePoseLabel = ''
  ui.feedback = { status: 'idle', msg: '' }
  ui.hint = 'Chuẩn bị lấy mẫu. Hướng dẫn từng bước sẽ hiện trên màn hình camera.'

  try {
    const descriptor = await collectDescriptorSamples()
    await submitDescriptor(descriptor)
    ui.hint = 'Đăng ký hoàn tất. Mẫu khuôn mặt nhiều góc đã sẵn sàng để dùng khi chấm công.'
  } catch (err) {
    const localError =
      err instanceof Error
      && (err.message.startsWith('Chưa ghi nhận được bước') || err.message.startsWith('Descriptor'))
    ui.feedback = {
      status: 'error',
      msg: localError ? err.message : getApiErrorMessage(err, 'Không thể đăng ký khuôn mặt.'),
    }
    ui.hint = 'Đưa mặt vào giữa khung rồi thử lại. Hệ thống sẽ hướng dẫn lại từng bước trên màn hình.'
  } finally {
    ui.busy = false
    ui.captureStep = 0
    ui.capturePoseIndex = -1
    ui.capturePoseLabel = ''
    scanTimer = window.setTimeout(runScanner, 400)
  }
}

const runScanner = async () => {
  if (!ui.busy && isLoaded.value) {
    const det = await detectFace()
    ui.faceScore = det?.detection.score ?? 0
    if (det && det.detection.score >= FACE_SCORE_THRESHOLD) {
      ui.faceReady = true
      ui.hint = ''
    } else if (det) {
      ui.faceReady = false
      ui.hint = ' '
    } else {
      ui.faceReady = false
      ui.hint = ' '
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
  <div class="mx-auto max-w-7xl space-y-6 px-4 pb-8 pt-2 lg:px-6">
    <!-- Điều hướng -->
    <div>
      <button
        type="button"
        @click="router.push(employee ? `/employees/${employee.id}` : '/employees')"
        class="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-secondary-text transition-colors hover:bg-muted hover:text-primary-text dark:text-tertiary-text dark:hover:bg-elevated dark:hover:text-white"
      >
        <ArrowLeft class="h-4 w-4" />
        Quay lại
      </button>
    </div>

    <div
      v-if="employeeQuery.isLoading.value"
      class="rounded-lg border border-border-standard bg-card p-8 text-center text-sm text-secondary-text dark:border-border dark:bg-card"
    >
      <div class="mx-auto mb-3 h-8 w-8 animate-pulse rounded-full bg-muted dark:bg-elevated" />
      Đang tải thông tin nhân viên...
    </div>

    <div
      v-else-if="employeeQuery.isError.value || !employee"
      class="rounded-lg border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300"
    >
      Không tìm thấy nhân viên.
    </div>

    <template v-else>
      <header class="rounded-2xl border border-border-standard bg-card p-5 shadow-sm dark:border-border dark:bg-card sm:p-6">
        <div class="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div class="space-y-2">
            <p class="text-[11px] font-semibold tracking-normal text-primary dark:text-primary">
              Thiết bị đăng ký khuôn mặt
            </p>
            <h1 class="text-2xl font-semibold tracking-normal text-primary-text dark:text-primary-text sm:text-3xl">
              Đăng ký khuôn mặt cho nhân viên
            </h1>
            <p class="max-w-2xl text-sm leading-relaxed text-secondary-text dark:text-tertiary-text">
              Căn khuôn mặt vào khung, sau đó hệ thống sẽ lần lượt nhắc nhìn thẳng, quay nhẹ trái, quay nhẹ phải và cúi nhẹ đầu ngay trên màn hình camera.
            </p>
          </div>

          <div class="flex flex-col gap-2 sm:items-start xl:items-end">
            <div class="inline-flex flex-wrap items-center gap-2 rounded-xl border border-border-standard bg-surface px-3 py-2 text-sm dark:border-border dark:bg-background/40">
              <span class="font-semibold text-primary-text dark:text-primary-text">{{ employee.fullName }}</span>
              <span class="text-tertiary-text dark:text-secondary-text" aria-hidden="true">·</span>
              <span class="rounded-md bg-card px-2 py-0.5 font-mono text-xs font-semibold text-primary dark:bg-elevated dark:text-primary">
                {{ employee.employeeCode }}
              </span>
            </div>
            <p
              v-if="effectiveFaceRegistered"
              class="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 shadow-sm dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-200"
              role="status"
              aria-live="polite"
            >
              <CheckCircle2 class="h-3.5 w-3.5 shrink-0" />
              Hồ sơ này đã có mẫu khuôn mặt, lần đăng ký này sẽ cập nhật lại
            </p>
          </div>
        </div>
      </header>

      <div class="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_380px]">
        <div class="space-y-4">
          <div
            class="relative overflow-hidden rounded-2xl border border-border-standard/90 bg-linear-to-b from-slate-900 via-slate-950 to-slate-950 shadow-xl ring-1 ring-black/5 dark:border-border/80"
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
            <div class="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 py-4 sm:px-6">
              <div class="rounded-full border border-white/10 bg-black/35 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80 backdrop-blur-md">
                Camera trực tiếp
              </div>
              <div class="rounded-full border border-white/10 bg-black/35 px-3 py-1.5 text-xs font-semibold text-white/90 backdrop-blur-md">
                Độ rõ {{ Math.round(ui.faceScore * 100) }}%
              </div>
            </div>
            <div
              v-if="ui.feedback.status === 'success'"
              class="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center px-4 pt-16 sm:pt-20"
            >
              <span
                class="pointer-events-none flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-600/95 px-4 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur-sm"
              >
                <CheckCircle2 class="h-5 w-5 shrink-0" />
                Lưu thành công
              </span>
            </div>
            <div
              v-if="ui.busy && ui.capturePoseLabel"
              class="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center px-4 pt-10 sm:pt-12"
            >
              <div
                class="rounded-2xl border border-sky-300/35 bg-sky-500/92 px-3 py-1.5 text-white shadow-xl backdrop-blur-sm"
              >
                <div class="flex items-center gap-3">
                  <span class="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-white/20 px-2 text-[11px] font-bold">
                    {{ ui.capturePoseIndex + 1 }}/{{ CAPTURE_SAMPLE_COUNT }}
                  </span>
                  <p class="text-sm font-semibold">{{ ui.capturePoseLabel }}</p>
                </div>
              </div>
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
                class="pointer-events-none absolute inset-0 flex items-center justify-center border-3 border-white/10"
              >
                <div
                  class="h-[68%] max-h-[min(420px,70vw)] w-[55%] max-w-[min(340px,85vw)] rounded-full border-2 border-dashed shadow-[0_0_0_9999px_rgba(0,0,0,0.42)]"
                  :class="ui.faceReady || ui.busy ? 'border-emerald-300/80' : 'border-white/45'"
                />
              </div>
              <div
                class="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/85 via-black/45 to-transparent px-4 pb-5 pt-16 sm:px-6"
              >
                <div
                  v-if="ui.hint && !ui.busy && ui.feedback.status !== 'success'"
                  class="flex gap-3 rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-sm text-white shadow-lg backdrop-blur-md"
                >
                  <ScanFace class="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <p class="leading-relaxed">
                    {{ ui.hint }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside class="flex flex-col gap-4">
          <div class="rounded-2xl border border-border-standard bg-card p-5 shadow-sm dark:border-border dark:bg-card">
            <div class="flex items-start gap-3">
              <div
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/50"
              >
                <ShieldCheck class="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div class="min-w-0 flex-1">
                <h2
                  class="text-sm font-bold  tracking-normal text-secondary-text dark:text-tertiary-text"
                >
                  Trạng thái
                </h2>
                <p class="mt-2 text-sm leading-relaxed text-primary-text dark:text-tertiary-text">
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
              class="mt-5 rounded-2xl border px-4 py-3 text-sm"
              :class="
                ui.faceReady
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-100'
                  : 'border-border-standard bg-surface text-primary-text dark:border-border dark:bg-background/40 dark:text-tertiary-text'
              "
            >
              <div class="flex items-start gap-2">
                <span
                  class="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                  :class="ui.faceReady ? 'bg-emerald-500' : 'bg-slate-400'"
                />
                <div class="min-w-0 flex-1">
                  <p>
                    {{
                      !isLoaded
                        ? 'Hệ thống đang chuẩn bị model nhận diện.'
                        : ui.busy
                        ? 'Đang lấy mẫu khuôn mặt. Hãy nhìn theo hướng dẫn đang hiện trên màn hình camera.'
                        : 'Sẵn sàng.'
                    }}
                  </p>
                  <p v-if="!ui.busy && !isLoaded" class="mt-1 text-xs opacity-75">
                    Đang tải model nhận diện...
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              class="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60"
              :class="
                ui.faceReady || ui.busy
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-elevated hover:bg-card dark:bg-elevated dark:hover:bg-elevated'
              "
              :disabled="ui.busy || !isLoaded"
              @click="handleSaveFace"
            >
              <Camera class="h-4 w-4 shrink-0" />
              <span v-if="ui.busy">Đang lấy mẫu {{ ui.capturePoseIndex + 1 }}/{{ CAPTURE_SAMPLE_COUNT }}</span>
              <span v-else-if="effectiveFaceRegistered">Đăng ký lại khuôn mặt</span>
              <span v-else>Bắt đầu đăng ký</span>
            </button>
          </div>

          <div
            v-if="ui.feedback.status === 'success'"
            class="rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 text-sm text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/50 dark:text-emerald-100"
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
            class="rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-sm text-rose-900 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-100"
          >
            <div
              class="flex items-start gap-3"
            >
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
        </aside>
      </div>
    </template>
  </div>
</template>
