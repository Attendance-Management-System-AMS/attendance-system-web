<script setup lang="ts">
import { reactive, onMounted, onUnmounted } from 'vue'
import { useNow, useDateFormat } from '@vueuse/core'
import { CheckCircle2, XCircle } from 'lucide-vue-next'
import { attendanceService } from '@/services/attendance.service' // eslint-disable-line @typescript-eslint/no-unused-vars
import { useFaceDetection } from '@/composables/useFaceDetection'

// --- State ---
const time = useDateFormat(useNow(), 'HH:mm:ss')
const date = useDateFormat(useNow(), 'DD/MM/YYYY')
const ui = reactive({
  locked: false,
  progress: 0,
  feedback: { status: 'idle', msg: '', name: '' },
})

const { videoRef, isLoaded, loadModels, setupCamera, detectFace, stopCamera } = useFaceDetection()
let scanTimer: number | undefined
let faceDetectedStartTime: number | null = null

// --- Logic ---
const handleCheckIn = async (descriptor: Float32Array) => {
  ui.locked = true
  ui.progress = 0

  // Hiệu ứng progress giả lập cho mượt
  const progressInterval = setInterval(() => {
    if (ui.progress < 90) ui.progress += 10
  }, 50)

  try {
    const descriptorArray = Array.from(descriptor)
    console.log('[TEST MODE] Face detected, descriptor:', descriptorArray)

    // GIẢ LẬP ĐỘ TRỄ MẠNG
    await new Promise(resolve => setTimeout(resolve, 800))

    // THÔNG BÁO THÀNH CÔNG GIẢ LẬP (Không gọi BE)
    ui.progress = 100
    ui.feedback = {
      status: 'success',
      msg: 'Chấm công thành công!',
      name: 'Người dùng Thử nghiệm',
    }

    /*
    // Code gọi BE thực tế (Tạm khóa)
    const data = await attendanceService.checkIn(descriptorArray)
    ui.feedback = {
      status: 'success',
      msg: data.message || 'Chấm công thành công!',
      name: data.employeeName || 'Nhân viên',
    }
    */
  } catch (err) {
    clearInterval(progressInterval)
    const errorMsg = err instanceof Error ? err.message : 'Không thể nhận diện'
    ui.feedback = { status: 'error', msg: errorMsg, name: '' }
  }

  // Reset sau 3s để chuẩn bị lần quét tiếp theo
  setTimeout(() => {
    Object.assign(ui, {
      locked: false,
      progress: 0,
      feedback: { status: 'idle', msg: '', name: '' },
    })
    runScanner()
  }, 3000)
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
    ui.feedback = { status: 'error', msg: 'Lỗi truy cập Camera hoặc AI!', name: '' }
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



      <!-- Simplified Notification -->
      <Transition name="notification">
        <div
          v-if="ui.feedback.status !== 'idle'"
          class="absolute top-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-6 pointer-events-none"
        >
          <div
            :class="[
              'bg-black/70 backdrop-blur-xl border border-white/10 px-8 py-5 rounded-2xl shadow-2xl flex items-center justify-center gap-4 transition-all duration-500',
              ui.feedback.status === 'success' ? 'border-emerald-500/40' : 'border-rose-500/40',
            ]"
          >
            <CheckCircle2 v-if="ui.feedback.status === 'success'" class="w-7 h-7 text-emerald-400" />
            <XCircle v-else class="w-7 h-7 text-rose-400" />

            <p class="text-lg font-bold text-white tracking-tight text-center">
              <span v-if="ui.feedback.name" class="text-blue-400">{{ ui.feedback.name }}</span>
              <br/>
              <span v-if="ui.feedback.status === 'success'" class="text-emerald-400">{{ ui.feedback.msg }}</span>
              <span v-else class="text-rose-400">{{ ui.feedback.msg }}</span>
            </p>
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
.notification-enter-active {
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.notification-leave-active {
  transition: all 0.4s cubic-bezier(0.6, -0.28, 0.735, 0.045);
}
.notification-enter-from {
  transform: translate(-50%, -100px) scale(0.9);
  opacity: 0;
}
.notification-leave-to {
  transform: translate(-50%, -40px) scale(0.95);
  opacity: 0;
  filter: blur(8px);
}
</style>
