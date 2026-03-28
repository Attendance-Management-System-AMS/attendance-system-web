<script setup lang="ts">
import { reactive, onMounted, onUnmounted } from 'vue'
import { useNow, useDateFormat } from '@vueuse/core'
import axios from 'axios'
import { Building2, Briefcase, CheckCircle2, Clock, Hash, User, XCircle } from 'lucide-vue-next'
import { attendanceApi, type AttendanceCheckInResult } from '@/services/attendance.service'
import { employeeApi } from '@/services/employee.service'
import { useFaceDetection } from '@/composables/useFaceDetection'
import type { Employee } from '@/types/employee'

function parseApiError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const body = err.response?.data as { message?: string } | undefined
    if (body?.message) return body.message
    if (err.message) return err.message
  }
  if (err instanceof Error) return err.message
  return 'Không thể chấm công.'
}

// --- State ---
const time = useDateFormat(useNow(), 'HH:mm:ss')
const date = useDateFormat(useNow(), 'DD/MM/YYYY')
const ui = reactive({
  locked: false,
  progress: 0,
  /** Chỉ dùng cho lỗi (camera, API…) — thành công hiển thị ở panel dưới */
  errorMsg: '' as string,
})

function formatCheckInTime(iso: string | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

const successPanel = reactive({
  show: false,
  loadingProfile: false,
  employee: null as Employee | null,
  checkInTime: '',
  attendanceStatus: '',
  employeeId: null as number | null,
})

async function showSuccessFromResult(result: AttendanceCheckInResult | undefined) {
  successPanel.show = true
  successPanel.employee = null
  successPanel.loadingProfile = true
  successPanel.checkInTime = formatCheckInTime(result?.checkInTime)
  successPanel.attendanceStatus = result?.status ?? ''
  successPanel.employeeId = result?.employeeId ?? null

  const id = result?.employeeId
  if (id != null) {
    try {
      const res = await employeeApi.getById(id)
      successPanel.employee = res.data.result
    } catch {
      successPanel.employee = null
    }
  }
  successPanel.loadingProfile = false
}

function clearSuccessPanel() {
  successPanel.show = false
  successPanel.employee = null
  successPanel.loadingProfile = false
  successPanel.checkInTime = ''
  successPanel.attendanceStatus = ''
  successPanel.employeeId = null
}

const { videoRef, isLoaded, loadModels, setupCamera, detectFace, stopCamera } = useFaceDetection()
let scanTimer: number | undefined
let faceDetectedStartTime: number | null = null

// --- Logic ---
const handleCheckIn = async (descriptor: Float32Array) => {
  ui.locked = true
  ui.progress = 0

  const progressInterval = window.setInterval(() => {
    if (ui.progress < 90) ui.progress += 10
  }, 50)

  try {
    const descriptorArray = Array.from(descriptor) as number[]
    const data = await attendanceApi.checkInByFace(descriptorArray)
    ui.progress = 100
    ui.errorMsg = ''
    await showSuccessFromResult(data.result)
  } catch (err) {
    ui.errorMsg = parseApiError(err)
    ui.progress = 0
  } finally {
    window.clearInterval(progressInterval)
  }

  // Reset sau 3s để chuẩn bị lần quét tiếp theo
  setTimeout(() => {
    ui.locked = false
    ui.progress = 0
    ui.errorMsg = ''
    clearSuccessPanel()
    runScanner()
  }, 5000)
}

const runScanner = async () => {
  if (!ui.locked && isLoaded.value) {
    const det = await detectFace()
    if (det && det.detection.score > 0.7) {
      if (!faceDetectedStartTime) {
        faceDetectedStartTime = Date.now()
      } else {
        const duration = Date.now() - faceDetectedStartTime
        if (duration >= 2000) {
          // Đã đứng im đủ 2 giây
          faceDetectedStartTime = null
          if (scanTimer) window.clearTimeout(scanTimer)
          await handleCheckIn(det.descriptor)
          return
        }
      }
    } else {
      // Không thấy mặt hoặc mặt di chuyển/điểm thấp -> reset thời gian
      faceDetectedStartTime = null
    }
  } else {
    faceDetectedStartTime = null
  }
  scanTimer = window.setTimeout(runScanner, 200) // Tăng tần suất quét để mượt hơn khi tracking 2s
}

onMounted(async () => {
  try {
    await loadModels()
    await setupCamera()
    runScanner()
  } catch (err) {
    console.error('Khởi tạo lỗi:', err)
    ui.errorMsg = 'Lỗi truy cập Camera hoặc AI!'
  }
})

onUnmounted(() => {
  if (scanTimer) window.clearTimeout(scanTimer)
  stopCamera()
})
</script>

<template>
  <div
    class="fixed inset-0 bg-slate-950 flex flex-col font-sans select-none overflow-hidden text-white"
  >
    <main class="relative flex-1 flex items-center justify-center">
      <video
        ref="videoRef"
        autoplay
        muted
        playsinline
        class="absolute inset-0 w-full h-full object-cover scale-x-[-1] opacity-60"
      ></video>

      <!-- HUD Layer -->
      <div class="absolute inset-0 z-10 p-8 flex flex-col pointer-events-none">
        <div class="flex justify-between items-start w-full">
          <div
            class="bg-black/60 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-4"
          >
            <div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <h1 class="text-xl font-black tracking-tighter">AMS KIOSK</h1>
          </div>

          <div
            class="bg-black/60 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-2xl text-right"
          >
            <div class="text-3xl font-mono font-black tracking-tighter">{{ time }}</div>
            <div class="text-[10px] text-white/40 font-bold uppercase tracking-widest">
              {{ date }}
            </div>
          </div>
        </div>

        <div v-if="isLoaded && !ui.locked" class="flex-1 flex items-center justify-center">
          <div class="w-72 h-72 sm:w-80 sm:h-80 relative">
            <div
              class="absolute -top-1 -left-1 w-12 h-12 border-t-4 border-l-4 border-blue-500 rounded-tl-2xl opacity-50"
            ></div>
            <div
              class="absolute -top-1 -right-1 w-12 h-12 border-t-4 border-r-4 border-blue-500 rounded-tr-2xl opacity-50"
            ></div>
            <div
              class="absolute -bottom-1 -left-1 w-12 h-12 border-b-4 border-l-4 border-blue-500 rounded-bl-2xl opacity-50"
            ></div>
            <div
              class="absolute -bottom-1 -right-1 w-12 h-12 border-b-4 border-r-4 border-blue-500 rounded-br-2xl opacity-50"
            ></div>
            <div
              class="absolute inset-x-0 h-0.5 bg-linear-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_20px_#3b82f6] animate-scan"
            ></div>
          </div>
        </div>
      </div>

      <!-- Lỗi: gọn phía trên -->
      <Transition name="fade">
        <div
          v-if="ui.errorMsg"
          class="absolute top-24 left-1/2 z-50 w-full max-w-md -translate-x-1/2 px-6 pointer-events-none"
        >
          <div
            class="flex items-center justify-center gap-3 rounded-2xl border border-rose-500/40 bg-black/75 px-5 py-4 text-center shadow-2xl backdrop-blur-xl"
          >
            <XCircle class="h-6 w-6 shrink-0 text-rose-400" />
            <p class="text-sm font-semibold text-rose-100">{{ ui.errorMsg }}</p>
          </div>
        </div>
      </Transition>

      <!-- Chấm công thành công: thông tin nhân viên phía dưới -->
      <Transition name="slide-up">
        <div
          v-if="successPanel.show"
          class="pointer-events-none absolute inset-x-0 bottom-0 z-40 px-4 pb-6 pt-16 sm:px-8"
        >
          <div
            class="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-emerald-500/30 bg-linear-to-t from-slate-950/95 via-slate-900/90 to-slate-900/75 shadow-2xl shadow-emerald-900/20 backdrop-blur-xl"
          >
            <div
              class="flex items-center gap-2 border-b border-white/10 bg-emerald-500/10 px-5 py-3 text-emerald-300"
            >
              <CheckCircle2 class="h-5 w-5 shrink-0" />
              <span class="text-sm font-bold tracking-wide">Đã chấm công</span>
            </div>

            <div class="grid gap-4 px-5 py-5 sm:grid-cols-[auto_1fr] sm:items-start">
              <div
                class="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/20 text-2xl font-black text-emerald-300"
              >
                <template v-if="successPanel.loadingProfile">
                  <span class="h-8 w-8 animate-pulse rounded-lg bg-white/10" />
                </template>
                <template v-else-if="successPanel.employee?.fullName">
                  {{ successPanel.employee.fullName.charAt(0).toUpperCase() }}
                </template>
                <User v-else class="h-8 w-8 text-emerald-400/80" />
              </div>

              <div class="min-w-0 space-y-3 text-left">
                <div>
                  <p class="text-[10px] font-bold uppercase tracking-wider text-white/40">
                    Họ và tên
                  </p>
                  <p
                    v-if="successPanel.loadingProfile"
                    class="mt-1 h-6 w-48 animate-pulse rounded bg-white/10"
                  />
                  <p v-else class="truncate text-xl font-bold text-white">
                    {{ successPanel.employee?.fullName ?? `Nhân viên #${successPanel.employeeId}` }}
                  </p>
                </div>

                <div class="grid gap-3 sm:grid-cols-2">
                  <div class="flex items-start gap-2 rounded-xl bg-white/5 px-3 py-2">
                    <Hash class="mt-0.5 h-4 w-4 shrink-0 text-white/35" />
                    <div>
                      <p class="text-[10px] font-bold uppercase text-white/35">Mã NV</p>
                      <p class="font-mono text-sm text-white/90">
                        {{ successPanel.employee?.employeeCode ?? '—' }}
                      </p>
                    </div>
                  </div>
                  <div class="flex items-start gap-2 rounded-xl bg-white/5 px-3 py-2">
                    <Clock class="mt-0.5 h-4 w-4 shrink-0 text-white/35" />
                    <div>
                      <p class="text-[10px] font-bold uppercase text-white/35">Giờ vào</p>
                      <p class="text-sm font-medium text-emerald-200/95">
                        {{ successPanel.checkInTime }}
                      </p>
                    </div>
                  </div>
                  <div class="flex items-start gap-2 rounded-xl bg-white/5 px-3 py-2 sm:col-span-2">
                    <Building2 class="mt-0.5 h-4 w-4 shrink-0 text-white/35" />
                    <div class="min-w-0 flex-1">
                      <p class="text-[10px] font-bold uppercase text-white/35">Phòng ban</p>
                      <p class="truncate text-sm text-white/85">
                        {{ successPanel.employee?.departmentName ?? '—' }}
                      </p>
                    </div>
                  </div>
                  <div class="flex items-start gap-2 rounded-xl bg-white/5 px-3 py-2 sm:col-span-2">
                    <Briefcase class="mt-0.5 h-4 w-4 shrink-0 text-white/35" />
                    <div class="min-w-0 flex-1">
                      <p class="text-[10px] font-bold uppercase text-white/35">Chức vụ</p>
                      <p class="truncate text-sm text-white/85">
                        {{ successPanel.employee?.positionName ?? '—' }}
                      </p>
                    </div>
                  </div>
                </div>

                <p v-if="successPanel.attendanceStatus" class="text-[11px] text-white/45">
                  Trạng thái: <span class="text-white/70">{{ successPanel.attendanceStatus }}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </main>
  </div>
</template>

<style scoped>
@keyframes scan {
  0% {
    top: 0;
    opacity: 0;
  }

  50% {
    opacity: 1;
  }

  100% {
    top: 100%;
    opacity: 0;
  }
}

.animate-scan {
  animation: scan 3s linear infinite;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.35s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active {
  transition: all 0.45s cubic-bezier(0.22, 1, 0.36, 1);
}

.slide-up-leave-active {
  transition: all 0.35s ease-in;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(24px);
}
</style>
