# 🎨 Hướng dẫn Cấu hình Giao diện & Hệ màu Động (TimeMaster UI System)

Tài liệu này cung cấp khung quy chuẩn (Framework) để duy trì phong cách thiết kế **"Neutral First - Primary Accents"** (Nền trung tính - Điểm nhấn thương hiệu) cho toàn bộ dự án TimeMaster.

---

## 💎 1. Nguyên tắc cốt lõi (Core Principles)

*   **Sạch & Thoáng (Clean & Minimal)**: Tuyệt đối không sử dụng các mảng màu nền đậm hoặc màu thương hiệu cho các khối nội dung lớn. Chỉ dùng nền trắng (`bg-white`) hoặc xám cực nhạt (`bg-slate-50`).
*   **Đồng bộ Typography (2 Font System)**:
    *   **`font-heading` (Outfit)**: Chuyên dùng cho các tiêu đề (h1-h6), con số lớn, và các thành phần cần sự hiện đại, in đậm, in nghiêng.
    *   **`font-body` (Inter)**: Chuyên dùng cho văn bản nội dung, nhãn (label), dữ liệu bảng, và các mô tả chi tiết.
*   **Màu sắc động (Dynamic Semantic)**: Luôn dùng class **`primary`** để hệ thống có thể đổi màu theo cài đặt.

---

## 🛠 2. Các Class Tailwind tiêu chuẩn

### A. Typography chuẩn
*   **Tiêu đề (Heading Style)**: `font-heading font-black uppercase tracking-tight text-slate-900`
*   **Nội dung (Body Style)**: `font-body font-medium text-slate-600`
*   **Nhãn (Label Style)**: `font-body font-bold text-slate-400 uppercase tracking-widest text-[10px]`

### B. Màu thương hiệu (Primary)
*   `bg-primary`: Nền màu thương hiệu (cho nút bấm, icon).
*   `text-primary`: Chữ màu thương hiệu (cho tiêu đề nhỏ, link).
*   `border-primary`: Viền màu thương hiệu (khi hover hoặc active).
*   `shadow-primary/20`: Bóng đổ có sắc màu thương hiệu (tạo chiều sâu).

*   **Tiêu đề chính**: `text-slate-900 font-black uppercase tracking-tight`
*   **Tiêu đề phụ/Label**: `text-slate-400 font-bold uppercase tracking-widest text-[10px]`
*   **Nội dung**: `text-slate-600 font-medium`

---

## 📦 3. Khung Card Tiêu chuẩn (No-Background Style)

Sử dụng cấu trúc này cho các thẻ stats hoặc container:

```vue
<Card class="border-slate-100 bg-white shadow-none p-6 hover:bg-slate-50 transition-all group rounded-2xl">
  <div class="flex flex-col gap-4">
    <!-- Header của Card -->
    <div class="flex items-center justify-between">
      <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tiêu đề thẻ</span>
      <!-- Icon Container: Chuyển màu khi hover vào card cha -->
      <div class="h-9 w-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 
                  group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20 transition-all">
        <component :is="YourIcon" class="h-5 w-5" />
      </div>
    </div>
    
    <!-- Nội dung chính: Đổi màu khi hover -->
    <span class="text-2xl font-black text-slate-900 group-hover:text-primary transition-colors">
      1,234.56
    </span>
  </div>
</Card>
```

---

## 📑 4. Cấu hình Input & Form

Luôn để Input có nền trung tính, tránh dùng nền màu `primary/5` gây cảm giác "bẩn" màn hình:

```vue
<!-- Select / Input standard -->
<input 
  class="h-10 px-4 rounded-xl border border-slate-100 bg-slate-50 
         focus:ring-1 focus:ring-primary outline-none transition-all 
         text-sm font-bold text-slate-800"
/>
```

---

## 🔗 5. Tích hợp trong logic (Composables)

Để lấy màu hiện tại trong Javascript/Typescript code (nếu cần), hãy dùng `useTheme`:

```typescript
import { useTheme } from '@/composables/useTheme'
const { currentTheme } = useTheme()

// Lấy màu primary hiện tại dưới dạng OKLCH string
console.log(currentTheme.value.primary) 
```

---

## 🚀 6. Cách thêm màu mới vào hệ thống

Nếu muốn thêm 1 bộ màu mới vào danh sách cài đặt, hãy cập nhật file `src/composables/useTheme.ts`:

1.  Truy cập [oklch.com](https://oklch.com).
2.  Chọn màu bạn muốn và lấy thông số (ví dụ: `0.55 0.23 260`).
3.  Thêm vào mảng `THEMES`:
    ```typescript
    { 
      name: 'new-color', 
      label: 'Tên hiển thị', 
      primary: '0.XX 0.XX XXX', 
      primaryForeground: '0.98 0.01 XXX' // Thường là màu trắng sáng
    }
    ```

---
> **Lưu ý**: Luôn kiểm tra giao diện ở cả **Light Mode** và **Dark Mode** để đảm bảo độ tương phản của màu `primary` bạn vừa cấu hình.
