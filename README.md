# TimeMaster AMS - Attendance Management System

**TimeMaster AMS** là một giải pháp quản lý chấm công hiện đại, tích hợp công nghệ nhận diện khuôn mặt (Face Recognition) và quản lý nhân sự tập trung. Dự án được xây dựng với mục tiêu tối ưu hóa quy trình điểm danh, giảm thiểu sai sót và tăng cường tính minh bạch trong quản lý thời gian làm việc.

## 🚀 Tính năng nổi bật

- **Nhận diện khuôn mặt (FaceID)**: Tích hợp `face-api.js` để chấm công qua Camera với độ chính xác cao.
- **Kiosk Chấm công**: Giao diện chuyên dụng cho các thiết bị đặt tại sảnh ra vào, hỗ trợ tracking mặt thời gian thực.
- **Quản lý Nhân sự**: Quản lý danh sách nhân viên, hồ sơ, và trạng thái làm việc.
- **Quản lý Phòng ban**: Tổ chức nhân sự theo sơ đồ phòng ban, gán trưởng phòng và ca làm việc mặc định.
- **Bảng công & Báo cáo**: Theo dõi lịch sử chấm công, tính toán thời gian làm thêm (OT) và xuất báo cáo.
- **Giao diện hiện đại**: Hỗ trợ Dark Mode, responsive hoàn toàn, trải nghiệm mượt mà với Tailwind CSS 4 và Shadcn UI.

## 🛠 Công nghệ sử dụng

- **Framework**: Vue.js 3 (Composition API)
- **Build Tool**: Vite
- **State Management**: Pinia
- **Data Fetching**: Axios & @tanstack/vue-query
- **Styling**: Tailwind CSS 4, Lucide Icons, Shadcn UI (Reka UI)
- **AI/ML**: face-api.js (TensorFlow.js)
- **PWA**: Hỗ trợ Progressive Web App để cài đặt như ứng dụng trên máy tính/điện thoại.

## 📁 Cấu trúc thư mục chính

```text
src/
├── assets/          # Tài nguyên tĩnh (CSS, Images)
├── components/      # Các component tái sử dụng
│   ├── attendance/  # Component nghiệp vụ chấm công
│   ├── layout/      # Khung giao diện (Sidebar, Navbar)
│   └── ui/          # Component giao diện cơ bản (Shadcn UI)
├── composables/     # Logic tái sử dụng (Hooks)
├── lib/             # Cấu hình thư viện (Axios instance, utils)
├── services/        # Layer gọi API
├── types/           # Định nghĩa TypeScript interfaces
├── views/           # Các trang (Pages)
└── router/          # Cấu hình định tuyến
```

## ⚙️ Cài đặt và Chạy thử

### Yêu cầu hệ thống

- Node.js version >= 20.19.0 hoặc >= 22.12.0
- Backend API đang chạy (mặc định tại `http://localhost:9000/api`)

### Các bước cài đặt

1. **Clone dự án**:

   ```bash
   git clone <repository-url>
   cd attendance-system-web
   ```

2. **Cài đặt dependencies**:

   ```bash
   npm install
   ```

3. **Cấu hình môi trường**:
   Tạo file `.env` từ `.env.example` và cập nhật `VITE_API_URL`.

4. **Chạy môi trường phát triển**:

   ```bash
   npm run dev
   ```

5. **Xây dựng bản production**:
   ```bash
   npm run build
   ```

## 🛡 Kiểm tra chất lượng code

- **Linting**: `npm run lint` (Sử dụng ESLint và Oxlint để kiểm tra lỗi cú pháp).
- **Type-Check**: `npm run type-check` (Kiểm tra kiểu dữ liệu TypeScript).
- **Formatting**: `npm run format` (Sử dụng Prettier để định dạng code).

## 📄 Giấy phép

Dự án này thuộc bản quyền của **K22-DATN**. Vui lòng liên hệ để biết thêm chi tiết về việc sử dụng và phân phối.

---

_Phát triển bởi Đội ngũ TimeMaster — 2026_
