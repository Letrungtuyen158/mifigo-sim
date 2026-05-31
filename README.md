# Mifigo SIM

Web tra cứu gói cước SIM/eSIM du lịch — frontend Next.js kết nối backend NestJS (`mifigo-sim-api`).

## Chạy local

### 1. Backend API (mifigo-sim-api)

```bash
cd ../mifigo-sim-api
npm install
cp .env.example .env
# Khởi động MongoDB, rồi:
npm run seed:example
npm run start:dev
```

API: http://localhost:3000/api · Swagger: http://localhost:3000/api/docs

### 2. Frontend (repo này)

```bash
npm install
cp .env.example .env.local
npm run dev -- -p 3001
```

Mở http://localhost:3001

> BE mặc định port **3000**, FE chạy port **3001** để tránh trùng.

## Tài khoản demo (sau `seed:example`)

| Role  | Email              | Password      |
|-------|--------------------|---------------|
| Admin | admin@mifigo.com   | Admin@123456  |
| Agent | agent@test.com     | Test@123456   |
| Customer | customer@test.com | Test@123456 |

## Kiến trúc

- **UI**: Next.js 15 App Router (`src/app`, `src/components`)
- **BFF**: Route handlers `src/app/api/*` proxy sang NestJS, giữ format response cũ cho UI
- **Auth**: JWT lưu httpOnly cookie `mifigo_sim_token`
- **Mapper**: `src/lib/api/mappers.ts` chuyển đổi schema BE ↔ FE

## Biến môi trường

| Biến | Mô tả |
|------|-------|
| `MIFIGO_API_URL` | URL gốc API, ví dụ `http://localhost:3000/api` |

## Tính năng

### Website khách
- Trang chủ, tra cứu gói, đặt hàng (yêu cầu đăng nhập), xem bill
- eSIM VN: admin import Excel qua API, xuất CSV

### Phân quyền giá
- Khách / anonymous: giá retail
- Đại lý / CTV: giá theo tier số lượng
- Admin: giá nhập NCC, so sánh, chỉnh giá bán

### Admin
- So sánh giá nhập NCC
- Sửa giá nhập / giá bán kênh
- Duyệt đơn / thanh toán thủ công
- Import kho eSIM

## Ghi chú

- Dữ liệu JSON local (`data/store.json`) **không còn dùng** — toàn bộ qua MongoDB backend.
- Đặt hàng bắt buộc đăng nhập (theo API backend).
- Quên mật khẩu gửi email (cấu hình SMTP trong BE).
