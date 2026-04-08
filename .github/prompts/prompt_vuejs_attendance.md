# 📋 PROMPT — Tái Tạo UI Hệ Thống Chấm Công dựa trên Design System StockMaster WMS (Vue.js)

> Copy toàn bộ nội dung phía dưới đường kẻ và paste vào AI (Claude, GPT, Gemini...) để tạo giao diện.

---

---

## 🚀 PROMPT BẮT ĐẦU (Copy từ đây)

---

Bạn là một senior frontend developer chuyên về Vue.js 3 và Tailwind CSS. Nhiệm vụ của bạn là xây dựng giao diện **Hệ Thống Quản Lý Chấm Công** (Attendance Management System) tên **"TimeMaster"** bằng **Vue 3 (Composition API) + Vite + Tailwind CSS v3**.

Toàn bộ giao diện phải tuân theo **Design System** được mô tả chi tiết dưới đây — lấy cảm hứng từ một WMS (Warehouse Management System) hiện đại, phong cách cao cấp, tone màu Indigo/Slate chuyên nghiệp.

---

## 🛠️ STACK KỸ THUẬT

- **Framework:** Vue 3 (Composition API với `<script setup>`)
- **Build tool:** Vite
- **Styling:** Tailwind CSS v3
- **Router:** Vue Router 4
- **Icons:** Lucide Vue Next (`lucide-vue-next`)
- **UI Components:** Tự xây dựng từ đầu theo Design System bên dưới (không dùng Vuetify, Element Plus hay PrimeVue)
- **Font:** Inter (Google Fonts) cho body, Fira Code/JetBrains Mono cho mã nhân viên
- **State:** `ref`, `computed`, `reactive` của Vue 3 (hoặc Pinia nếu cần global)

---

## 🎨 DESIGN SYSTEM (BẮT BUỘC TUÂN THEO)

### Màu sắc Chủ đạo

| Vai trò        | Tailwind class                     | Ý nghĩa                                 |
| -------------- | ---------------------------------- | --------------------------------------- |
| Primary        | `indigo-600`                       | Navbar, nút CTA, icon active, điểm nhấn |
| Primary Light  | `indigo-50`                        | Background item active, highlight       |
| App Background | `bg-[#F8FAFC]`                     | Nền toàn bộ vùng content                |
| Sidebar        | `bg-white`                         | Nền sidebar trái                        |
| Card           | `bg-white border border-slate-200` | Các khối thông tin                      |
| Text Primary   | `text-slate-900`                   | Tiêu đề, nội dung chính                 |
| Text Secondary | `text-slate-500`                   | Mô tả, nhãn phụ                         |
| Text Muted     | `text-slate-400`                   | Gợi ý, placeholder                      |

### Màu Trạng Thái (Status)

| Trạng thái        | Background      | Text               | Dùng cho           |
| ----------------- | --------------- | ------------------ | ------------------ |
| Đúng giờ / Có mặt | `bg-emerald-50` | `text-emerald-600` | Check-in đúng giờ  |
| Đi trễ            | `bg-amber-50`   | `text-amber-600`   | Trễ giờ, cần chú ý |
| Vắng mặt / Nghỉ   | `bg-rose-50`    | `text-rose-600`    | Vắng mặt, xóa      |
| Đang làm việc     | `bg-indigo-50`  | `text-indigo-600`  | Đang trong ca      |
| Nghỉ phép         | `bg-slate-100`  | `text-slate-500`   | Nghỉ có phép       |

### Dark Mode

Mỗi màu nền và viền đều phải có cặp `dark:*`:

- Card: `dark:bg-slate-900 dark:border-slate-800`
- Sidebar: `dark:bg-slate-950`
- Navbar: `dark:bg-indigo-950`
- App bg: `dark:bg-slate-950`

---

## 📐 CẤU TRÚC BỐ CỤC (Layout)

```
┌──── NAVBAR (h-16, bg-indigo-600, sticky top-0 z-40) ─────────────┐
│  [☰ Trigger] [Breadcrumb]  [🔍 Search]      [🔔] [👤 Avatar ▾] │
├─────────────┬─────────────────────────────────────────────────────┤
│  SIDEBAR    │  MAIN CONTENT (flex-1 overflow-y-auto)              │
│  w-[240px]  │  bg-[#F8FAFC]  px-4 py-6 lg:px-8                  │
│  bg-white   │                                                      │
│  ─────────  │  ┌── PageHeader ───────────── [Actions] ──────┐   │
│  Logo       │  ├── StatCards (4 col grid) ─────────────────── ┤   │
│  Online chip│  ├── SearchToolbar + FilterGroup ──────────────  ┤   │
│  ─────────  │  └── DataTable / CardGrid ─────────────────────  │   │
│  Navigation │                                                      │
│  Groups     │                                                      │
│  ─────────  │                                                      │
│  [User]     │                                                      │
└─────────────┴─────────────────────────────────────────────────────┘
```

### Chi tiết Sidebar

- Width: `w-[240px]`, collapsible thành icon khi click rail `w-[56px]`
- Logo: Icon `Clock` nền `indigo-600 rounded-xl`, text "TimeMaster" + "AMS Pro"
- Online chip: Badge nhỏ "Hệ thống · Online" màu `emerald`
- Menu chia 4 nhóm (SidebarGroup với label `text-[10px] font-bold uppercase tracking-wider text-slate-400`):
  1. **Tổng quan & Vận hành:** Dashboard, Chấm công hôm nay, Lịch làm việc
  2. **Nhân sự:** Nhân viên, Phòng ban, Ca làm việc
  3. **Báo cáo:** Bảng công, Phân tích, Xuất báo cáo
  4. **Hệ thống:** Cài đặt, Phân quyền
- Item active: `bg-indigo-50 text-indigo-700 font-semibold`, indicator `|` màu `indigo-600` ở mép trái
- Footer: Card profile người dùng nhỏ (tên + chức vụ)

### Chi tiết Navbar

- `h-16 bg-indigo-600 sticky top-0 z-40 text-white`
- Trái: Hamburger toggle + Breadcrumb (`Home / Module / Page`) + Global Search (`rounded-full bg-white/10`)
- Phải: Chip announcement + 🔔 Bell (dot đỏ pulse) + `|` divider + Avatar dropdown
- Avatar dropdown: `w-64 rounded-xl shadow-xl` với menu: Hồ sơ, Cài đặt, Đăng xuất

---

## 📄 DANH SÁCH CÁC TRANG CẦN XÂY DỰNG

### 1. `/dashboard` — Tổng quan chấm công

**Layout:** PageHeader → 4 StatCards → 2 cột (Bảng chấm công hôm nay | Biểu đồ tuần)

StatCards:

- Tổng nhân viên (icon: `Users`)
- Có mặt hôm nay (icon: `CheckCircle2`, màu emerald)
- Đi trễ (icon: `Clock`, màu amber)
- Vắng mặt (icon: `UserX`, màu rose)

### 2. `/attendance` — Chấm công hôm nay

**Layout:** PageHeader (nút "Chấm công nhanh") → SearchToolbar + Filter (Phòng ban, Ca, Trạng thái) → DataTable

Cột bảng: Nhân viên & Phòng ban | Ca làm việc | Giờ vào | Giờ ra | Làm thêm | Trạng thái | Hành động

Trạng thái badge:

- "Đúng giờ" — `emerald`
- "Đi trễ X phút" — `amber`
- "Vắng mặt" — `rose`
- "Đang làm" — `indigo`
- "Nghỉ phép" — `slate`

### 3. `/employees` — Danh sách nhân viên

**Layout:** PageHeader (nút "Thêm nhân viên" → link `/employees/new`) → SearchToolbar + Filter (Phòng ban, Ca) → DataTable hoặc Card Grid

Card nhân viên gồm: Avatar + Tên + Mã NV + Phòng ban + Ca + Trạng thái + Dropdown action

### 4. `/employees/new` — Thêm nhân viên mới

**Layout:** Grid 2/3 — 1/3

- Cột trái (2 col): Card "Thông tin cá nhân" (Họ tên, Mã NV, CCCD, SĐT, Email, Địa chỉ), Card "Thông tin công việc" (Phòng ban, Chức vụ, Ca làm việc, Ngày vào làm)
- Cột phải (1 col): Card "Tài khoản & Phân quyền" (Username, Role, Trạng thái toggle), Card action (Lưu nhân viên / Hủy)
- Nút Lưu: `bg-indigo-600 shadow-lg shadow-indigo-200 w-full`

### 5. `/employees/:id/edit` — Chỉnh sửa nhân viên

Giống `/employees/new` nhưng có dữ liệu điền sẵn. Nút action là `bg-emerald-600 "Cập nhật thay đổi"`.

### 6. `/departments` — Phòng ban

**Layout:** PageHeader + Bảng phòng ban với: Tên PB | Trưởng PB | Số nhân viên | Ca mặc định | Trạng thái | Hành động (Edit/Delete)

### 7. `/shifts` — Ca làm việc

**Layout:** Dạng Card Grid `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`

Mỗi card ca: Tên ca + Giờ bắt đầu → Giờ kết thúc + Cho phép trễ X phút + Số nhân viên đang áp dụng + Badge trạng thái + Dropdown action

### 8. `/timesheets` — Bảng công

**Layout:** PageHeader (nút Export) → Bộ lọc tháng/phòng ban → Bảng tổng hợp công

Bảng: Nhân viên | Ngày công chuẩn | Thực tế | Nghỉ phép | Vắng | Làm thêm | Tỷ lệ %

### 9. `/reports` — Báo cáo & Phân tích

Trang thống kê với biểu đồ dạng đơn giản (CSS bar chart) + bảng tổng hợp

---

## 🧩 COMPONENTS CẦN TẠO

### `AppSidebar.vue`

Sidebar collapsible với navigation groups, active state, sub-items, user card footer.

### `AppNavbar.vue`

Navbar indigo với breadcrumb tự động từ route, global search, bell notification, user avatar dropdown.

### `PageHeader.vue`

```vue
<PageHeader title="..." description="...">
  <template #actions>
    <button>...</button>
  </template>
</PageHeader>
```

`h1 text-2xl font-bold tracking-tight text-slate-900` cho title.

### `StatCard.vue`

Props: `label`, `value`, `change`, `icon`, `color`
Hiển thị KPI widget với icon màu, giá trị nổi bật, badge thay đổi.

### `SearchToolbar.vue`

Props: `placeholder`, `modelValue`
Slot: `#filters` để chèn FilterSelect
Input search full-width: `rounded-xl border-slate-200 bg-slate-50`

### `FilterSelect.vue`

Props: `label`, `options`, `modelValue`
Select dropdown với nhãn "Tất cả [X]" là giá trị mặc định.

### `DataTable.vue`

Props: `columns`, `rows`
Style: `rounded-xl overflow-hidden border-slate-200`, header `bg-slate-50/50 text-[11px] font-bold uppercase text-slate-400`, row hover `hover:bg-slate-50/50 transition-colors`

### `StatusBadge.vue`

Props: `status: 'present' | 'late' | 'absent' | 'working' | 'leave'`
Render `inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold` với màu tương ứng.

### `ActionDropdown.vue`

Dropdown 3 chấm (`MoreHorizontal`) với menu: Xem chi tiết, Chỉnh sửa (router-link), Xóa (EmitEvent).

### `DeleteConfirmDialog.vue`

Modal xác nhận xóa: Props `title`, `description`, `itemName`, emit `confirm`/`cancel`.
Style: `max-w-[425px] rounded-xl`, icon `AlertTriangle bg-rose-50`, nút xóa `bg-rose-600 shadow-lg shadow-rose-200`.

### `FormCard.vue`

Wrapper cho section trong form. Props: `title`, `icon`.
Style: `rounded-xl border border-slate-200 bg-white p-6 shadow-sm`

---

## 📏 SPACING & SIZING CHUẨN

| Mục đích                  | Class                         |
| ------------------------- | ----------------------------- |
| Card border-radius        | `rounded-xl`                  |
| Dialog/Dropdown radius    | `rounded-xl`                  |
| Icon button radius        | `rounded-full`                |
| Input radius              | `rounded-xl`                  |
| Card padding              | `p-6`                         |
| Khoảng cách giữa sections | `space-y-6`                   |
| Grid gap                  | `gap-4`                       |
| Chiều cao input           | `h-10`                        |
| Shadow card               | `shadow-sm`                   |
| Shadow CTA button         | `shadow-lg shadow-indigo-200` |

---

## ✍️ TYPOGRAPHY

| Cấp độ          | Class                                                           | Dùng cho               |
| --------------- | --------------------------------------------------------------- | ---------------------- |
| H1 — Page title | `text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl`  | PageHeader             |
| H3 — Section    | `text-sm font-bold uppercase tracking-wider text-slate-900`     | Card header            |
| Label form      | `text-xs font-bold text-slate-500 uppercase`                    | Form field label       |
| Body            | `text-sm font-medium text-slate-900`                            | Nội dung bảng          |
| Caption         | `text-[11px] font-bold uppercase tracking-wider text-slate-400` | KPI label, header bảng |
| Mã NV / Code    | `font-mono text-sm`                                             | Mã nhân viên           |

---

## 🗂️ CẤU TRÚC THƯ MỤC VUE

```
src/
├── assets/
├── components/
│   ├── layout/
│   │   ├── AppSidebar.vue
│   │   ├── AppNavbar.vue
│   │   └── DashboardLayout.vue
│   ├── ui/
│   │   ├── PageHeader.vue
│   │   ├── StatCard.vue
│   │   ├── SearchToolbar.vue
│   │   ├── FilterSelect.vue
│   │   ├── DataTable.vue
│   │   ├── StatusBadge.vue
│   │   ├── ActionDropdown.vue
│   │   ├── DeleteConfirmDialog.vue
│   │   └── FormCard.vue
│   └── features/
│       ├── attendance/
│       ├── employees/
│       └── departments/
├── views/
│   ├── DashboardView.vue
│   ├── AttendanceView.vue
│   ├── employees/
│   │   ├── EmployeesView.vue
│   │   ├── EmployeeNewView.vue
│   │   └── EmployeeEditView.vue
│   ├── DepartmentsView.vue
│   ├── ShiftsView.vue
│   ├── TimesheetsView.vue
│   └── ReportsView.vue
├── router/
│   └── index.ts
├── stores/
│   ├── useAuthStore.ts
│   └── useAttendanceStore.ts
└── App.vue
```

---

## 🔧 HƯỚNG DẪN TRIỂN KHAI

### Bước 1 — Khởi tạo dự án

```bash
npm create vite@latest timemaster-ams -- --template vue-ts
cd timemaster-ams
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install lucide-vue-next vue-router@4 pinia
```

### Bước 2 — Cài Google Fonts Inter

Thêm vào `index.html`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
  rel="stylesheet"
/>
```

### Bước 3 — Cấu hình Tailwind (`tailwind.config.js`)

```js
export default {
  content: ['./index.html', './src/**/*.{vue,ts,js}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'sans-serif'] },
      maxWidth: { '8xl': '88rem' },
    },
  },
}
```

### Bước 4 — `App.vue` layout chính

```vue
<template>
  <DashboardLayout>
    <RouterView />
  </DashboardLayout>
</template>
```

---

## 📌 YÊU CẦU BẮT BUỘC

1. **Không dùng class màu generic** như `blue`, `green`, `red` thuần — chỉ dùng `indigo`, `emerald`, `amber`, `rose`, `slate`.
2. **Mỗi card lớn** phải có `rounded-xl border border-slate-200 shadow-sm`.
3. **Mỗi element tương tác** phải có `transition-colors` và `hover:bg-*`.
4. **Form trang New/Edit** phải chia 2 cột: `grid-cols-3`, cột trái `col-span-2` là form chính, cột phải `col-span-1` là action sidebar.
5. **Xóa dữ liệu** phải qua [DeleteConfirmDialog](file:///d:/K22-DATN/warehouse-management/warehouse-management-frontend/src/components/features/DeleteConfirmDialog.tsx#23-73) xác nhận — không xóa trực tiếp.
6. **Breadcrumb** trong Navbar phải tự động từ `$route.path`.
7. **Sidebar** phải hỗ trợ thu gọn thành icon.
8. **Tất cả label** phải dùng `uppercase font-bold text-xs text-slate-500`.
9. **Data table** phải có row hover `hover:bg-slate-50/50 transition-colors`.
10. **Nút CTA chính** (`bg-indigo-600`) phải có `shadow-lg shadow-indigo-200 dark:shadow-none`.

---

## 💡 VÍ DỤ COMPONENT MẪU

### StatCard.vue

```vue
<template>
  <div
    class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
  >
    <div class="mb-2 flex items-center justify-between">
      <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400">{{ label }}</span>
      <span class="text-[10px] font-bold text-emerald-500">{{ change }}</span>
    </div>
    <div class="flex items-end justify-between">
      <div class="text-2xl font-black text-slate-900 dark:text-white">{{ value }}</div>
      <div :class="`flex h-9 w-9 items-center justify-center rounded-xl ${bgColor}`">
        <component :is="icon" :class="`h-5 w-5 ${iconColor}`" />
      </div>
    </div>
  </div>
</template>
```

### StatusBadge.vue

```vue
<template>
  <span
    :class="badgeClass"
    class="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold"
  >
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ status: 'present' | 'late' | 'absent' | 'working' | 'leave' }>()

const config = {
  present: { class: 'bg-emerald-50 text-emerald-600', label: 'Đúng giờ' },
  late: { class: 'bg-amber-50 text-amber-600', label: 'Đi trễ' },
  absent: { class: 'bg-rose-50 text-rose-600', label: 'Vắng mặt' },
  working: { class: 'bg-indigo-50 text-indigo-600', label: 'Đang làm' },
  leave: { class: 'bg-slate-100 text-slate-500', label: 'Nghỉ phép' },
}

const badgeClass = computed(() => config[props.status]?.class)
const label = computed(() => config[props.status]?.label)
</script>
```

---

## 🎯 MỤC TIÊU CUỐI CÙNG

Kết quả phải là một **SPA Vue 3** hoàn chỉnh trông **cực kỳ chuyên nghiệp, cao cấp, hiện đại** — tương đương giao diện của các phần mềm HRM thương mại như BambooHR, Clockify, hay Notion. Người dùng nhìn vào phải cảm nhận được sự **premium** ngay từ lần nhìn đầu tiên.

---

_Hãy bắt đầu bằng việc tạo: `DashboardLayout.vue`, `AppSidebar.vue`, `AppNavbar.vue`, sau đó `DashboardView.vue`. Từng bước một, đảm bảo mỗi component hoàn chỉnh trước khi sang component tiếp theo._
