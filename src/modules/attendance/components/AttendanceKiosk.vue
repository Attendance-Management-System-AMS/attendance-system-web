<script setup lang="ts">
import { reactive, onMounted, onUnmounted } from 'vue'
import { useNow, useDateFormat } from '@vueuse/core'
import { Building2, Briefcase, CheckCircle2, Clock, Hash, User, XCircle } from 'lucide-vue-next'
import { getApiErrorMessage } from '@/shared/api/apiErrorMessage'
import {
  attendanceApi,
  type AttendanceCheckInResult,
  type AttendanceEmployeeBrief,
} from '@/modules/attendance/api/attendance.api'
import { employeeApi } from '@/modules/employees/api/employee.api'
import { useFaceDetection } from '@/shared/face/useFaceDetection'
import type { Employee } from '@/modules/employees/types/employee.types'

// --- State ---
const time = useDateFormat(useNow(), 'HH:mm:ss')
const date = useDateFormat(useNow(), 'DD/MM/YYYY')
const ui = reactive({
  locked: false,
  /** Chỉ dùng cho lỗi (camera, API…) — thành công hiển thị ở panel dưới */
  errorMsg: '' as string,
})

const FACE_SCORE_THRESHOLD = 0.45
const FACE_HOLD_MS = 700
const SCAN_DELAY_MS = 120
const RESET_DELAY_MS = 3500

/** Dựng object hiển thị kiosk từ snapshot API — không cần GET /employees/:id. */
function employeeFromBrief(row: AttendanceCheckInResult, brief: AttendanceEmployeeBrief): Employee {
  const id = row.employeeId ?? 0
  return {
    id,
    employeeCode: brief.employeeCode,
    fullName: brief.fullName,
    gender: '',
    email: '',
    departmentId: null,
    departmentName: brief.departmentName,
    positionId: null,
    positionName: brief.positionName,
    managerId: null,
    managerName: null,
    status: '',
    biometricHash: null,
    joinDate: '',
    createdAt: '',
  }
}

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
  eventTime: '',
  eventLabel: 'Giờ vào',
  attendanceStatus: '',
  employeeId: null as number | null,
})

async function showSuccessFromResult(result: AttendanceCheckInResult | undefined) {
  successPanel.show = true
  const isCheckout = Boolean(result?.checkOutTime)
  successPanel.eventTime = formatCheckInTime(isCheckout ? result?.checkOutTime ?? undefined : result?.checkInTime)
  successPanel.eventLabel = isCheckout ? 'Giờ ra' : 'Giờ vào'
  successPanel.attendanceStatus = result?.status ?? ''
  successPanel.employeeId = result?.employeeId ?? null

  const brief =
    result?.employee ??
    (result?.employeeFullName && result?.employeeSnapshotCode
      ? {
          fullName: result.employeeFullName,
          employeeCode: result.employeeSnapshotCode,
          departmentName: result.employeeSnapshotDepartmentName ?? null,
          positionName: result.employeeSnapshotPositionName ?? null,
        }
      : null)
  const hasBrief =
    brief &&
    typeof brief.fullName === 'string' &&
    brief.fullName.trim() !== '' &&
    typeof brief.employeeCode === 'string' &&
    brief.employeeCode.trim() !== ''

  if (hasBrief && result) {
    successPanel.loadingProfile = false
    successPanel.employee = employeeFromBrief(result, brief)
    return
  }

  successPanel.employee = null
  successPanel.loadingProfile = true
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
  successPanel.eventTime = ''
  successPanel.eventLabel = 'Giờ vào'
  successPanel.attendanceStatus = ''
  successPanel.employeeId = null
}

const { videoRef, isLoaded, loadModels, setupCamera, detectFace, stopCamera } = useFaceDetection()
let scanTimer: number | undefined
let resetTimer: number | undefined
let faceDetectedStartTime: number | null = null

// --- Logic ---
const handleCheckIn = async (descriptor: Float32Array) => {
  ui.locked = true

  try {
    const descriptorArray = Array.from(descriptor) as number[]
    const data = await attendanceApi.scanByFace(descriptorArray)
    ui.errorMsg = ''
    await showSuccessFromResult(data.result)
  } catch (err) {
    ui.errorMsg = getApiErrorMessage(err, 'Không thể chấm công.')
  }

  // Reset nhanh để kiosk sẵn sàng cho lượt tiếp theo.
  resetTimer = window.setTimeout(() => {
    ui.locked = false
    ui.errorMsg = ''
    clearSuccessPanel()
    runScanner()
  }, RESET_DELAY_MS)
}

const runScanner = async () => {
  if (!ui.locked && isLoaded.value) {
    const det = await detectFace()
    if (det && det.detection.score >= FACE_SCORE_THRESHOLD) {
      if (!faceDetectedStartTime) {
        faceDetectedStartTime = Date.now()
      } else {
        const duration = Date.now() - faceDetectedStartTime
        if (duration >= FACE_HOLD_MS) {
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
  scanTimer = window.setTimeout(runScanner, SCAN_DELAY_MS)
}

onMounted(async () => {
  try {
    await loadModels()
    await setupCamera()
    runScanner()
  } catch (err) {
    console.error('Khởi tạo lỗi:', err)
    ui.errorMsg = getApiErrorMessage(err, 'Lỗi truy cập Camera hoặc AI!')
  }
})

onUnmounted(() => {
  if (scanTimer) window.clearTimeout(scanTimer)
  if (resetTimer) window.clearTimeout(resetTimer)
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
            class="bg-black/60 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-xl flex items-center gap-4"
          >
            <div class="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <h1 class="text-xl font-black tracking-tighter">CHẤM CÔNG KHUÔN MẶT</h1>
          </div>

          <div
            class="bg-black/60 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-xl text-right"
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
              class="absolute -top-1 -left-1 w-12 h-12 border-t-4 border-l-4 border-indigo-500 rounded-tl-2xl opacity-50"
            ></div>
            <div
              class="absolute -top-1 -right-1 w-12 h-12 border-t-4 border-r-4 border-indigo-500 rounded-tr-2xl opacity-50"
            ></div>
            <div
              class="absolute -bottom-1 -left-1 w-12 h-12 border-b-4 border-l-4 border-indigo-500 rounded-bl-2xl opacity-50"
            ></div>
            <div
              class="absolute -bottom-1 -right-1 w-12 h-12 border-b-4 border-r-4 border-indigo-500 rounded-br-2xl opacity-50"
            ></div>
          </div>
        </div>
      </div>

      <!-- Lỗi: gọn phía trên -->
      <div
        v-if="ui.errorMsg"
        class="absolute top-24 left-1/2 z-50 w-full max-w-md -translate-x-1/2 px-6 pointer-events-none"
      >
        <div
          class="flex items-center justify-center gap-3 rounded-xl border border-rose-500/40 bg-black/75 px-5 py-4 text-center shadow-2xl backdrop-blur-xl"
        >
          <XCircle class="h-6 w-6 shrink-0 text-rose-400" />
          <p class="text-sm font-semibold text-rose-100">{{ ui.errorMsg }}</p>
        </div>
      </div>

      <!-- Chấm công thành công: thông tin nhân viên phía dưới -->
      <div
        v-if="successPanel.show"
        class="pointer-events-none absolute inset-x-0 bottom-0 z-40 px-4 pb-6 pt-16 sm:px-8"
      >
        <div
          class="mx-auto max-w-2xl overflow-hidden rounded-xl border border-emerald-500/30 bg-linear-to-t from-slate-950/95 via-slate-900/90 to-slate-900/75 shadow-2xl shadow-emerald-900/20 backdrop-blur-xl"
        >
          <div
            class="flex items-center gap-2 border-b border-white/10 bg-emerald-500/10 px-5 py-3 text-emerald-300"
          >
            <CheckCircle2 class="h-5 w-5 shrink-0" />
            <span class="text-sm font-bold tracking-wide">Đã chấm công</span>
          </div>

          <div class="grid gap-4 px-5 py-5 sm:grid-cols-[auto_1fr] sm:items-start">
            <div
              class="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-2xl font-black text-emerald-300"
            >
              <template v-if="successPanel.loadingProfile">
                <span class="h-8 w-8 rounded-lg bg-white/10" />
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
                  class="mt-1 h-6 w-48 rounded bg-white/10"
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
                    <p class="text-[10px] font-bold uppercase text-white/35">{{ successPanel.eventLabel }}</p>
                    <p class="text-sm font-medium text-emerald-200/95">
                      {{ successPanel.eventTime }}
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
    </main>
  </div>
</template>
