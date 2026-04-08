<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  FileEdit,
  FileText,
  Send,
  X,
  XCircle,
} from 'lucide-vue-next'

const activeTab = ref<'leave' | 'correction'>('leave')

type RequestStatus = 'pending' | 'approved' | 'rejected'

interface LeaveRequest {
  id: number
  type: string
  from: string
  to: string
  days: number
  reason: string
  status: RequestStatus
  submittedAt: string
  approvedBy?: string
  note?: string
}
interface CorrectionRequest {
  id: number
  date: string
  requestedIn: string | null
  requestedOut: string | null
  reason: string
  status: RequestStatus
  submittedAt: string
}

const leaveRequests = ref<LeaveRequest[]>([
  {
    id: 1,
    type: 'Nghỉ phép năm',
    from: '10/04/2026',
    to: '10/04/2026',
    days: 1,
    reason: 'Việc cá nhân',
    status: 'approved',
    submittedAt: '05/04/2026',
    approvedBy: 'Nguyễn Quản Lý',
  },
  {
    id: 2,
    type: 'Nghỉ ốm',
    from: '22/03/2026',
    to: '23/03/2026',
    days: 2,
    reason: 'Sốt cao, cần nghỉ ngơi',
    status: 'approved',
    submittedAt: '21/03/2026',
    approvedBy: 'Nguyễn Quản Lý',
  },
  {
    id: 3,
    type: 'Nghỉ không lương',
    from: '01/04/2026',
    to: '01/04/2026',
    days: 1,
    reason: 'Việc gia đình',
    status: 'rejected',
    submittedAt: '28/03/2026',
    note: 'Thiếu nhân lực trong ngày này.',
  },
])
const correctionRequests = ref<CorrectionRequest[]>([
  {
    id: 1,
    date: '04/04/2026',
    requestedIn: '07:55',
    requestedOut: '17:00',
    reason: 'Quên quẹt thẻ về do họp khẩn',
    status: 'pending',
    submittedAt: '05/04/2026',
  },
  {
    id: 2,
    date: '08/04/2026',
    requestedIn: '08:10',
    requestedOut: '17:05',
    reason: 'Máy chấm công hỏng cả ngày',
    status: 'pending',
    submittedAt: '09/04/2026',
  },
])

const statusConfig: Record<
  RequestStatus,
  { label: string; bg: string; text: string; icon: unknown }
> = {
  pending: {
    label: 'Chờ duyệt',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    text: 'text-amber-700 dark:text-amber-400',
    icon: Clock,
  },
  approved: {
    label: 'Đã duyệt',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    text: 'text-emerald-700 dark:text-emerald-400',
    icon: CheckCircle2,
  },
  rejected: {
    label: 'Từ chối',
    bg: 'bg-rose-50 dark:bg-rose-950/30',
    text: 'text-rose-700 dark:text-rose-400',
    icon: XCircle,
  },
}

const isLeaveModalOpen = ref(false)
const isCorrectionModalOpen = ref(false)

const leaveForm = reactive({ type: '', from: '', to: '', reason: '' })
const correctionForm = reactive({ date: '', requestedIn: '', requestedOut: '', reason: '' })

const leaveTypes = ['Nghỉ phép năm', 'Nghỉ ốm', 'Nghỉ không lương', 'Nghỉ thai sản', 'Nghỉ bù']

const submitLeave = () => {
  if (!leaveForm.type || !leaveForm.from || !leaveForm.to || !leaveForm.reason) return
  leaveRequests.value.unshift({
    id: Date.now(),
    type: leaveForm.type,
    from: leaveForm.from,
    to: leaveForm.to,
    days: 1,
    reason: leaveForm.reason,
    status: 'pending',
    submittedAt: new Date().toLocaleDateString('vi-VN'),
  })
  Object.assign(leaveForm, { type: '', from: '', to: '', reason: '' })
  isLeaveModalOpen.value = false
}
const submitCorrection = () => {
  if (!correctionForm.date || !correctionForm.reason) return
  correctionRequests.value.unshift({
    id: Date.now(),
    date: correctionForm.date,
    requestedIn: correctionForm.requestedIn || null,
    requestedOut: correctionForm.requestedOut || null,
    reason: correctionForm.reason,
    status: 'pending',
    submittedAt: new Date().toLocaleDateString('vi-VN'),
  })
  Object.assign(correctionForm, { date: '', requestedIn: '', requestedOut: '', reason: '' })
  isCorrectionModalOpen.value = false
}

const pendingCount = computed(
  () =>
    leaveRequests.value.filter((r) => r.status === 'pending').length +
    correctionRequests.value.filter((r) => r.status === 'pending').length,
)
</script>

<template>
  <div class="min-h-screen space-y-4 px-4 py-4 sm:px-6 sm:py-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-lg font-black text-slate-900 dark:text-white">Đơn từ của tôi</h1>
        <p class="text-xs text-slate-500">Theo dõi đơn nghỉ phép và bổ sung công</p>
      </div>
    </div>

    <!-- Action Buttons: full-width on mobile -->
    <div class="grid grid-cols-2 gap-2 sm:flex sm:gap-3">
      <button
        @click="isLeaveModalOpen = true"
        class="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 active:scale-95 transition-transform dark:shadow-none sm:rounded-2xl sm:px-5 sm:py-2"
      >
        <CalendarDays class="h-4 w-4" />
        Xin nghỉ phép
      </button>
      <button
        @click="isCorrectionModalOpen = true"
        class="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 active:scale-95 transition-transform dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 sm:rounded-2xl sm:px-5 sm:py-2"
      >
        <FileEdit class="h-4 w-4" />
        Bổ sung công
      </button>
    </div>

    <!-- Pending Banner -->
    <div
      v-if="pendingCount > 0"
      class="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900 dark:bg-amber-950/30"
    >
      <Clock class="h-4 w-4 shrink-0 text-amber-600" />
      <p class="text-sm text-amber-800 dark:text-amber-400">
        <strong>{{ pendingCount }} đơn</strong> đang chờ phê duyệt.
      </p>
    </div>

    <!-- Tabs -->
    <div
      class="flex rounded-xl border border-slate-200 bg-slate-100/60 p-1 dark:border-slate-800 dark:bg-slate-900/50"
    >
      <button
        @click="activeTab = 'leave'"
        :class="[
          'flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all',
          activeTab === 'leave'
            ? 'bg-white text-indigo-700 shadow dark:bg-slate-800 dark:text-indigo-400'
            : 'text-slate-500',
        ]"
      >
        <CalendarDays class="h-4 w-4" />
        Nghỉ phép
        <span
          v-if="leaveRequests.length"
          class="ml-1 rounded-full bg-indigo-100 px-1.5 text-xs text-indigo-700 dark:bg-indigo-900 dark:text-indigo-400"
          >{{ leaveRequests.length }}</span
        >
      </button>
      <button
        @click="activeTab = 'correction'"
        :class="[
          'flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all',
          activeTab === 'correction'
            ? 'bg-white text-indigo-700 shadow dark:bg-slate-800 dark:text-indigo-400'
            : 'text-slate-500',
        ]"
      >
        <FileText class="h-4 w-4" />
        Bổ sung
        <span
          v-if="correctionRequests.length"
          class="ml-1 rounded-full bg-indigo-100 px-1.5 text-xs text-indigo-700 dark:bg-indigo-900 dark:text-indigo-400"
          >{{ correctionRequests.length }}</span
        >
      </button>
    </div>

    <!-- Leave List -->
    <div v-if="activeTab === 'leave'" class="space-y-3">
      <div
        v-if="leaveRequests.length === 0"
        class="rounded-xl border-2 border-dashed border-slate-200 py-16 text-center dark:border-slate-800"
      >
        <CalendarDays class="mx-auto h-10 w-10 text-slate-300" />
        <p class="mt-3 text-sm text-slate-400">Chưa có đơn nào.</p>
      </div>
      <div
        v-for="req in leaveRequests"
        :key="req.id"
        class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex-1 min-w-0">
            <div class="flex flex-wrap gap-2 items-center">
              <p class="font-black text-slate-900 dark:text-white">{{ req.type }}</p>
              <div
                :class="[
                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold',
                  statusConfig[req.status].bg,
                  statusConfig[req.status].text,
                ]"
              >
                <component :is="statusConfig[req.status].icon" class="h-3 w-3" />
                {{ statusConfig[req.status].label }}
              </div>
            </div>
            <p class="mt-1 text-sm text-slate-500">
              {{ req.from }} — {{ req.to }} · <strong>{{ req.days }} ngày</strong>
            </p>
            <p class="mt-1.5 text-xs text-slate-600 dark:text-slate-400 italic leading-relaxed">
              "{{ req.reason }}"
            </p>
            <div
              v-if="req.note"
              class="mt-2 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-900 dark:bg-rose-950/20 dark:text-rose-400"
            >
              <strong>Từ chối:</strong> {{ req.note }}
            </div>
            <p v-if="req.approvedBy" class="mt-1.5 text-[11px] text-emerald-600">
              ✓ Được duyệt bởi {{ req.approvedBy }}
            </p>
          </div>
          <p class="text-[11px] text-slate-400 shrink-0 whitespace-nowrap">{{ req.submittedAt }}</p>
        </div>
      </div>
    </div>

    <!-- Correction List -->
    <div v-else class="space-y-3">
      <div
        v-if="correctionRequests.length === 0"
        class="rounded-xl border-2 border-dashed border-slate-200 py-16 text-center dark:border-slate-800"
      >
        <FileText class="mx-auto h-10 w-10 text-slate-300" />
        <p class="mt-3 text-sm text-slate-400">Chưa có đơn nào.</p>
      </div>
      <div
        v-for="req in correctionRequests"
        :key="req.id"
        class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex-1 min-w-0">
            <div class="flex flex-wrap gap-2 items-center">
              <p class="font-black text-slate-900 dark:text-white">{{ req.date }}</p>
              <div
                :class="[
                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold',
                  statusConfig[req.status].bg,
                  statusConfig[req.status].text,
                ]"
              >
                <component :is="statusConfig[req.status].icon" class="h-3 w-3" />
                {{ statusConfig[req.status].label }}
              </div>
            </div>
            <div class="mt-1.5 flex gap-4 font-mono text-sm">
              <span class="text-slate-500"
                >Vào:
                <strong class="text-slate-800 dark:text-slate-200">{{
                  req.requestedIn ?? '—'
                }}</strong></span
              >
              <span class="text-slate-500"
                >Ra:
                <strong class="text-slate-800 dark:text-slate-200">{{
                  req.requestedOut ?? '—'
                }}</strong></span
              >
            </div>
            <p class="mt-1.5 text-xs text-slate-600 dark:text-slate-400 italic">
              "{{ req.reason }}"
            </p>
          </div>
          <p class="text-[11px] text-slate-400 shrink-0 whitespace-nowrap">{{ req.submittedAt }}</p>
        </div>
      </div>
    </div>

    <!-- Leave Modal: full-screen on mobile -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-to-class="opacity-0"
        leave-active-class="transition duration-150"
      >
        <div
          v-if="isLeaveModalOpen"
          class="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
        >
          <div
            class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            @click="isLeaveModalOpen = false"
          ></div>
          <div
            class="relative w-full sm:max-w-lg rounded-t-3xl sm:rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-2xl"
          >
            <!-- Handle bar (mobile) -->
            <div class="flex justify-center pt-3 pb-1 sm:hidden">
              <div class="h-1 w-10 rounded-full bg-slate-300 dark:bg-slate-700"></div>
            </div>
            <div
              class="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800"
            >
              <div class="flex items-center gap-2">
                <div
                  class="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600"
                >
                  <CalendarDays class="h-4 w-4" />
                </div>
                <h3 class="font-black text-slate-900 dark:text-white">Xin nghỉ phép</h3>
              </div>
              <button
                @click="isLeaveModalOpen = false"
                class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X class="h-5 w-5" />
              </button>
            </div>
            <div class="p-5 space-y-4">
              <div>
                <label
                  class="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500"
                  >Loại nghỉ *</label
                >
                <select
                  v-model="leaveForm.type"
                  class="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="">Chọn loại nghỉ</option>
                  <option v-for="t in leaveTypes" :key="t" :value="t">{{ t }}</option>
                </select>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label
                    class="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500"
                    >Từ ngày *</label
                  >
                  <input
                    v-model="leaveForm.from"
                    type="date"
                    class="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label
                    class="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500"
                    >Đến ngày *</label
                  >
                  <input
                    v-model="leaveForm.to"
                    type="date"
                    class="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label
                  class="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500"
                  >Lý do *</label
                >
                <textarea
                  v-model="leaveForm.reason"
                  rows="3"
                  placeholder="Nêu rõ lý do xin nghỉ..."
                  class="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                ></textarea>
              </div>
            </div>
            <div class="flex gap-3 border-t border-slate-100 p-5 dark:border-slate-800">
              <button
                @click="isLeaveModalOpen = false"
                class="flex-1 h-12 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 dark:border-slate-700"
              >
                Hủy
              </button>
              <button
                @click="submitLeave"
                :disabled="!leaveForm.type || !leaveForm.from || !leaveForm.to || !leaveForm.reason"
                class="flex-1 h-12 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 text-sm font-bold text-white shadow-lg shadow-indigo-200 disabled:opacity-50 dark:shadow-none"
              >
                <Send class="h-4 w-4" />Gửi đơn
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Correction Modal: full-screen on mobile -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-to-class="opacity-0"
        leave-active-class="transition duration-150"
      >
        <div
          v-if="isCorrectionModalOpen"
          class="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
        >
          <div
            class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            @click="isCorrectionModalOpen = false"
          ></div>
          <div
            class="relative w-full sm:max-w-lg rounded-t-3xl sm:rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-2xl"
          >
            <div class="flex justify-center pt-3 pb-1 sm:hidden">
              <div class="h-1 w-10 rounded-full bg-slate-300 dark:bg-slate-700"></div>
            </div>
            <div
              class="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800"
            >
              <div class="flex items-center gap-2">
                <div
                  class="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600"
                >
                  <FileEdit class="h-4 w-4" />
                </div>
                <h3 class="font-black text-slate-900 dark:text-white">Bổ sung công</h3>
              </div>
              <button
                @click="isCorrectionModalOpen = false"
                class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X class="h-5 w-5" />
              </button>
            </div>
            <div class="p-5 space-y-4">
              <div
                class="rounded-xl border border-amber-100 bg-amber-50 p-3 text-xs text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-400"
              >
                ⚠ Đơn sẽ cần quản lý xác nhận trước khi cập nhật.
              </div>
              <div>
                <label
                  class="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500"
                  >Ngày bổ sung *</label
                >
                <input
                  v-model="correctionForm.date"
                  type="date"
                  class="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label
                    class="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500"
                    >Giờ vào</label
                  >
                  <input
                    v-model="correctionForm.requestedIn"
                    type="time"
                    class="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label
                    class="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500"
                    >Giờ ra</label
                  >
                  <input
                    v-model="correctionForm.requestedOut"
                    type="time"
                    class="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label
                  class="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500"
                  >Lý do *</label
                >
                <textarea
                  v-model="correctionForm.reason"
                  rows="3"
                  placeholder="VD: Quên quẹt thẻ về..."
                  class="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                ></textarea>
              </div>
            </div>
            <div class="flex gap-3 border-t border-slate-100 p-5 dark:border-slate-800">
              <button
                @click="isCorrectionModalOpen = false"
                class="flex-1 h-12 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 dark:border-slate-700"
              >
                Hủy
              </button>
              <button
                @click="submitCorrection"
                :disabled="!correctionForm.date || !correctionForm.reason"
                class="flex-1 h-12 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 text-sm font-bold text-white shadow-lg shadow-indigo-200 disabled:opacity-50 dark:shadow-none"
              >
                <Send class="h-4 w-4" />Gửi đơn
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
