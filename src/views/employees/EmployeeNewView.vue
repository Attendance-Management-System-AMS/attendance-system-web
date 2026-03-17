<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Briefcase, Save, Shield, User } from 'lucide-vue-next'
import PageHeader from '@/components/ui/PageHeader.vue'
import FormCard from '@/components/ui/FormCard.vue'

const router = useRouter()

const form = reactive({
  fullName: '',
  empCode: '',
  nationalId: '',
  phone: '',
  email: '',
  address: '',
  department: '',
  position: '',
  shift: '',
  joinDate: '',
  username: '',
  role: 'employee',
  isActive: true,
})

const departments = ['Nhân sự', 'Công nghệ', 'Tài chính', 'Kinh doanh', 'Vận hành', 'IT']
const shifts = ['Ca sáng (08:00–17:30)', 'Ca chiều (13:00–22:00)', 'Ca đêm (22:00–06:00)']
const roles = [
  { label: 'Nhân viên', value: 'employee' },
  { label: 'Quản lý', value: 'manager' },
  { label: 'Quản trị viên', value: 'admin' },
]

const inputClass =
  'h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all dark:border-slate-700 dark:bg-slate-800 dark:text-white'

const labelClass = 'block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5'
</script>

<template>
  <div class="space-y-6">
    <PageHeader title="Thêm nhân viên mới" description="Điền thông tin để tạo hồ sơ nhân viên mới">
      <template #actions>
        <button
          @click="router.back()"
          class="flex items-center gap-2 h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft class="h-4 w-4" />
          Quay lại
        </button>
      </template>
    </PageHeader>

    <div class="grid grid-cols-3 gap-6">
      <!-- Left: Main form -->
      <div class="col-span-2 space-y-6">
        <!-- Personal info -->
        <FormCard title="Thông tin cá nhân" :icon="User">
          <div class="grid grid-cols-2 gap-4">
            <div class="col-span-2">
              <label :class="labelClass">Họ và tên <span class="text-rose-500">*</span></label>
              <input v-model="form.fullName" type="text" placeholder="Nguyễn Văn A" :class="inputClass" />
            </div>
            <div>
              <label :class="labelClass">Mã nhân viên <span class="text-rose-500">*</span></label>
              <input v-model="form.empCode" type="text" placeholder="NV001" :class="inputClass" class="font-mono" />
            </div>
            <div>
              <label :class="labelClass">Số CCCD</label>
              <input v-model="form.nationalId" type="text" placeholder="0XXXXXXXXX" :class="inputClass" class="font-mono" />
            </div>
            <div>
              <label :class="labelClass">Số điện thoại</label>
              <input v-model="form.phone" type="tel" placeholder="0XXXXXXXXX" :class="inputClass" />
            </div>
            <div>
              <label :class="labelClass">Email <span class="text-rose-500">*</span></label>
              <input v-model="form.email" type="email" placeholder="nhanvien@company.vn" :class="inputClass" />
            </div>
            <div class="col-span-2">
              <label :class="labelClass">Địa chỉ</label>
              <input v-model="form.address" type="text" placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành" :class="inputClass" />
            </div>
          </div>
        </FormCard>

        <!-- Work info -->
        <FormCard title="Thông tin công việc" :icon="Briefcase">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label :class="labelClass">Phòng ban <span class="text-rose-500">*</span></label>
              <select v-model="form.department" :class="inputClass">
                <option value="">-- Chọn phòng ban --</option>
                <option v-for="dept in departments" :key="dept" :value="dept">{{ dept }}</option>
              </select>
            </div>
            <div>
              <label :class="labelClass">Chức vụ <span class="text-rose-500">*</span></label>
              <input v-model="form.position" type="text" placeholder="Chuyên viên, Trưởng nhóm..." :class="inputClass" />
            </div>
            <div>
              <label :class="labelClass">Ca làm việc <span class="text-rose-500">*</span></label>
              <select v-model="form.shift" :class="inputClass">
                <option value="">-- Chọn ca --</option>
                <option v-for="s in shifts" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>
            <div>
              <label :class="labelClass">Ngày vào làm</label>
              <input v-model="form.joinDate" type="date" :class="inputClass" />
            </div>
          </div>
        </FormCard>
      </div>

      <!-- Right: Account + Actions -->
      <div class="space-y-6">
        <!-- Account & permissions -->
        <FormCard title="Tài khoản & Phân quyền" :icon="Shield">
          <div class="space-y-4">
            <div>
              <label :class="labelClass">Tên đăng nhập <span class="text-rose-500">*</span></label>
              <input v-model="form.username" type="text" placeholder="ten.dangnhap" :class="inputClass" class="font-mono" />
            </div>
            <div>
              <label :class="labelClass">Vai trò</label>
              <select v-model="form.role" :class="inputClass">
                <option v-for="r in roles" :key="r.value" :value="r.value">{{ r.label }}</option>
              </select>
            </div>
            <div class="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
              <div>
                <p class="text-sm font-medium text-slate-900 dark:text-white">Kích hoạt tài khoản</p>
                <p class="text-xs text-slate-400">Nhân viên có thể đăng nhập ngay</p>
              </div>
              <button
                type="button"
                @click="form.isActive = !form.isActive"
                :class="[
                  'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200',
                  form.isActive ? 'bg-indigo-600' : 'bg-slate-200',
                ]"
              >
                <span
                  :class="[
                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-200',
                    form.isActive ? 'translate-x-5' : 'translate-x-0',
                  ]"
                ></span>
              </button>
            </div>
          </div>
        </FormCard>

        <!-- Action buttons -->
        <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
          <button
            class="flex w-full items-center justify-center gap-2 h-11 rounded-xl bg-indigo-600 text-sm font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors dark:shadow-none"
          >
            <Save class="h-4 w-4" />
            Lưu nhân viên
          </button>
          <button
            @click="router.push('/employees')"
            class="flex w-full items-center justify-center h-10 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Hủy bỏ
          </button>

          <div class="border-t border-slate-100 dark:border-slate-800 pt-3">
            <p class="text-[10px] text-slate-400 text-center leading-relaxed">
              Nhân viên sẽ nhận email thông báo tài khoản sau khi được tạo thành công
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
