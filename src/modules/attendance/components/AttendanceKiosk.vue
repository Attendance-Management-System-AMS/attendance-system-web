<script setup lang="ts">
import { reactive, onMounted, onUnmounted } from 'vue'
import { useNow, useDateFormat } from '@vueuse/core'
import { CheckCircle2, XCircle } from 'lucide-vue-next'
import { getApiErrorMessage } from '@/shared/api/apiErrorMessage'
import {
  attendanceApi,
  type AttendanceCheckInResult,
  type AttendanceEmployeeBrief,
} from '@/modules/attendance/api/attendance.api'
import { employeeApi } from '@/modules/employees/api/employee.api'
import { useFaceDetection } from '@/shared/face/useFaceDetection'
import type { Employee } from '@/modules/employees/types/employee.types'

// --- Constants ---
const FACE_SCORE_THRESHOLD = 0.45
const FACE_HOLD_MS = 700
const SCAN_DELAY_MS = 120
const RESET_DELAY_MS = 3500
const KIOSK_DEVICE_ID_KEY = 'attendance-kiosk-device-id'

// --- State ---
const time = useDateFormat(useNow(), 'HH:mm:ss')
const date = useDateFormat(useNow(), 'DD/MM/YYYY')

const state = reactive({
  locked: false,
  kioskReady: false,
  errorMsg: '' as string,

  success: {
    show: false,
    loading: false,
    employee: null as Employee | null,
    eventTime: '',
    eventLabel: 'Giờ vào',
    status: '',
  }
})

function getKioskDeviceId(): string {
  const existing = window.localStorage.getItem(KIOSK_DEVICE_ID_KEY)
  if (existing && existing.trim() !== '') {
    return existing
  }

  const generated = typeof window.crypto?.randomUUID === 'function'
    ? window.crypto.randomUUID()
    : `kiosk-${Date.now()}`

  window.localStorage.setItem(KIOSK_DEVICE_ID_KEY, generated)
  return generated
}

function createKioskNonce(): string {
  return typeof window.crypto?.randomUUID === 'function'
    ? window.crypto.randomUUID()
    : `nonce-${Date.now()}`
}

// --- Helpers ---
function employeeFromBrief(row: AttendanceCheckInResult, brief: AttendanceEmployeeBrief): Employee {
  return {
    id: row.employeeId ?? 0,
    employeeCode: brief.employeeCode ?? '',
    fullName: brief.fullName ?? '',
    departmentName: brief.departmentName ?? '',
    positionName: brief.positionName ?? '',
    // Các field khác để trống
    gender: '', email: '', departmentId: null, positionId: null,
    managerId: null, managerName: null, status: '',
    biometricHash: null, joinDate: '', createdAt: '',
  }
}

function formatCheckInTime(iso?: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleString('vi-VN', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
}

// --- Success Panel ---
async function showSuccess(result?: AttendanceCheckInResult) {
  if (!result) return

  state.success.show = true
  state.success.loading = true

  const isCheckout = Boolean(result.checkOutTime)
  state.success.eventTime = formatCheckInTime(isCheckout ? result.checkOutTime : result.checkInTime)
  state.success.eventLabel = isCheckout ? 'Giờ ra' : 'Giờ vào'
  state.success.status = result.status ?? ''

  // Ưu tiên dùng brief từ API
  let brief = result.employee

  if (!brief?.fullName && result.employeeFullName) {
    brief = {
      fullName: result.employeeFullName,
      employeeCode: result.employeeSnapshotCode ?? '',
      departmentName: result.employeeSnapshotDepartmentName ?? '',
      positionName: result.employeeSnapshotPositionName ?? '',
    }
  }

  if (brief?.fullName) {
    state.success.employee = employeeFromBrief(result, brief)
    state.success.loading = false
  }
  else if (result.employeeId) {
    try {
      const res = await employeeApi.getById(result.employeeId)
      state.success.employee = res.data.result
    } catch {
      state.success.employee = null
    } finally {
      state.success.loading = false
    }
  }
  else {
    state.success.loading = false
  }
}

function hideSuccess() {
  state.success.show = false
  state.success.employee = null
  state.success.loading = false
  state.success.eventTime = ''
  state.success.status = ''
}

// --- Face Detection ---
const { videoRef, isLoaded, loadModels, setupCamera, detectFace, stopCamera } = useFaceDetection()

let scanTimer: number | undefined
let resetTimer: number | undefined
let faceHoldStart: number | null = null

const handleCheckIn = async (descriptor: Float32Array) => {
  state.locked = true
  state.errorMsg = ''

  try {
    const deviceId = getKioskDeviceId()
    const session = await attendanceApi.createKioskSession(deviceId)
    const sessionToken = session.result?.token

    if (!sessionToken) {
      throw new Error('Không lấy được phiên kiosk hợp lệ.')
    }

    const data = await attendanceApi.scanByFace(Array.from(descriptor), {
      deviceId,
      sessionToken,
      nonce: createKioskNonce(),
      timestamp: Date.now(),
    })
    await showSuccess(data.result)
  } catch (err) {
    state.errorMsg = getApiErrorMessage(err, 'Không thể chấm công.')
  }

  // Tự động reset sau khi thành công
  resetTimer = window.setTimeout(() => {
    state.locked = false
    state.errorMsg = ''
    hideSuccess()
    runScanner()
  }, RESET_DELAY_MS)
}

const runScanner = async () => {
  if (state.locked || !state.kioskReady || !isLoaded.value) {
    faceHoldStart = null
    scanTimer = window.setTimeout(runScanner, SCAN_DELAY_MS)
    return
  }

  const det = await detectFace()

  if (det && det.detection.score >= FACE_SCORE_THRESHOLD) {
    if (!faceHoldStart) {
      faceHoldStart = Date.now()
    } else if (Date.now() - faceHoldStart >= FACE_HOLD_MS) {
      faceHoldStart = null
      await handleCheckIn(det.descriptor)
      return
    }
  } else {
    faceHoldStart = null
  }

  scanTimer = window.setTimeout(runScanner, SCAN_DELAY_MS)
}

// --- Lifecycle ---
onMounted(async () => {
  try {
    await loadModels()
    await setupCamera()
    await attendanceApi.createKioskSession(getKioskDeviceId())
    state.kioskReady = true
    runScanner()
  } catch (err) {
    console.error('Khởi tạo lỗi:', err)
    state.kioskReady = false
    state.errorMsg = getApiErrorMessage(err, 'Kiosk cần phiên vận hành hợp lệ hoặc không thể truy cập Camera/AI!')
  }
})

onUnmounted(() => {
  if (scanTimer) clearTimeout(scanTimer)
  if (resetTimer) clearTimeout(resetTimer)
  stopCamera()
})
</script>

<template>
  <div class="fixed inset-0 bg-slate-950 flex flex-col font-sans select-none overflow-hidden text-white">
    <main class="relative flex-1 flex items-center justify-center">
      <video ref="videoRef" autoplay muted playsinline
        class="absolute inset-0 w-full h-full object-cover scale-x-[-1] opacity-60" />

      <div class="absolute inset-0 z-10 p-4 sm:p-8 flex flex-col pointer-events-none">
        <div class="flex justify-end items-start w-full">
          <div class="bg-black/60 backdrop-blur-xl border border-white/10 px-4 py-2 sm:px-6 sm:py-3 rounded-xl text-right">
            <div class="text-xl sm:text-3xl font-mono font-black tracking-tighter">{{ time }}</div>
            <div class="text-[8px] sm:text-[10px] text-white/40 font-bold uppercase tracking-widest">{{ date }}</div>
          </div>
        </div>

        <div v-if="isLoaded && state.kioskReady && !state.locked" class="flex-1 flex items-center justify-center">
          <div class="w-48 h-48 sm:w-80 sm:h-80 relative">
            <div class="absolute -top-1 -left-1 w-8 h-8 sm:w-12 sm:h-12 border-t-4 border-l-4 border-indigo-500 rounded-tl-2xl opacity-50"></div>
            <div class="absolute -top-1 -right-1 w-8 h-8 sm:w-12 sm:h-12 border-t-4 border-r-4 border-indigo-500 rounded-tr-2xl opacity-50"></div>
            <div class="absolute -bottom-1 -left-1 w-8 h-8 sm:w-12 sm:h-12 border-b-4 border-l-4 border-indigo-500 rounded-bl-2xl opacity-50"></div>
            <div class="absolute -bottom-1 -right-1 w-8 h-8 sm:w-12 sm:h-12 border-b-4 border-r-4 border-indigo-500 rounded-br-2xl opacity-50"></div>
          </div>
        </div>
      </div>

      <div v-if="state.errorMsg" class="absolute top-20 left-1/2 z-50 w-[90%] max-w-md -translate-x-1/2">
        <div class="flex items-center gap-3 rounded-xl border border-rose-500/40 bg-black/75 px-4 py-3 text-center backdrop-blur-xl">
          <XCircle class="h-5 w-5 shrink-0 text-rose-400" />
          <p class="text-xs font-semibold text-rose-100">{{ state.errorMsg }}</p>
        </div>
      </div>

      <div v-if="state.success.show" class="pointer-events-none absolute inset-x-0 bottom-0 z-40 px-2 pb-4 sm:px-8 sm:pb-6 pt-12">
        <div class="mx-auto max-w-2xl rounded-xl border border-white/10 bg-slate-900/90 backdrop-blur-2xl shadow-2xl overflow-hidden">

          <div class="flex items-center gap-2 border-b border-white/10 bg-white/5 px-4 py-2">
            <CheckCircle2 class="h-3 w-3 sm:h-4 sm:w-4 text-emerald-400" />
            <span class="font-semibold text-[10px] sm:text-sm text-white">Chấm công thành công</span>
          </div>

          <div class="p-3 sm:p-5 flex flex-row items-center gap-3 sm:gap-6 flex-nowrap">

            <div class="h-14 w-14 sm:h-20 sm:w-20 shrink-0 flex items-center justify-center rounded-xl sm:rounded-2xl bg-white/10 text-2xl sm:text-4xl font-bold text-white border border-white/20">
              <span v-if="!state.success.loading">{{ state.success.employee?.fullName?.charAt(0) || '?' }}</span>
              <span v-else class="animate-pulse">...</span>
            </div>

            <div class="flex-1 min-w-0">

              <div class="flex justify-between items-center mb-0.5 sm:mb-2 gap-2">
                <p class="font-mono text-xs sm:text-lg font-bold text-emerald-400 tracking-wider shrink-0">
                  {{ state.success.employee?.employeeCode || '---' }}
                </p>
                <p class="text-[9px] sm:text-base font-medium text-white/80 whitespace-nowrap">
                  {{ state.success.eventTime }}
                </p>
              </div>

              <p class="text-sm sm:text-xl font-bold text-white truncate leading-tight">
                {{ state.success.employee?.fullName || 'Đang tải...' }}
              </p>

              <p class="text-[10px] sm:text-sm text-white/70 mb-1 sm:mb-3 truncate">
                {{ state.success.employee?.departmentName }} • {{ state.success.employee?.positionName }}
              </p>

              <div class="flex justify-between items-center">
                <p class="text-[9px] sm:text-xs text-white/60">
                  {{ state.success.eventLabel }}: <span class="text-white">{{ state.success.status }}</span>
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
