# ZaloBox Hộp Thư

Hệ thống quản lý hội thoại Zalo OA tập trung cho đội chăm sóc khách hàng:
nhận & trả lời tin nhắn khách từ nhiều nhân viên trên cùng một giao diện web,
gán người phụ trách, gắn nhãn, ghi chú nội bộ, mẫu trả lời nhanh, và báo cáo
hiệu suất nhân viên. Dự án thực tập doanh nghiệp tại công ty TNHH SnailSoft.

## Kiến trúc

```
zalobox-hopthu/
  backend/    NestJS + TypeORM + MySQL — REST API, xác thực JWT,
              kết nối Zalo qua zca-js (QR login + nghe/gửi tin nhắn)
  frontend/   React + TypeScript + Vite + Ant Design — giao diện web
```

Frontend gọi backend qua `/api/*` (proxy lúc dev bằng Vite, bằng Nginx lúc
chạy production — xem `frontend/nginx.conf`). Toàn bộ dữ liệu hiển thị (danh
sách hội thoại, tin nhắn, báo cáo hiệu suất...) lấy trực tiếp từ MySQL qua
backend, không có dữ liệu giả lập trong code.

## Tính năng chính

- Đăng nhập bằng email/mật khẩu (JWT), phân quyền **quản trị** / **nhân viên**
- Kết nối tài khoản Zalo OA bằng quét mã QR, tự lưu phiên đăng nhập
- Danh sách hội thoại: lọc theo trạng thái/nhãn/khách hàng, tìm kiếm theo từ
  khóa, tự làm mới (polling)
- Chi tiết hội thoại: xem & gửi trả lời, đổi trạng thái, gán người phụ trách
  (chỉ admin), gắn/gỡ nhãn, ghi chú nội bộ
- Mẫu trả lời nhanh — soạn sẵn, tái sử dụng khi trả lời khách
- Báo cáo hiệu suất nhân viên theo khoảng thời gian (chỉ admin xem được)

## Chạy dự án

Yêu cầu: Node.js, MySQL 8, đã cài `npm`.

```bash
# 1. Backend
cd backend
cp .env.example .env      # điền thông tin DB thật + JWT_SECRET
npm install
npm run start:dev

# 2. Frontend (terminal khác)
cd frontend
npm install
npm run dev
```

Xem chi tiết từng phần ở [`backend/README.md`](backend/README.md) và
[`frontend/README.md`](frontend/README.md).

## Chạy bằng Docker

```bash
docker compose up --build
```

Xem biến môi trường cần thiết trong `.env` ở thư mục gốc (`DB_PASSWORD`,
`DB_DATABASE`, ...) dùng chung cho `docker-compose.yml`.

## Kiểm thử

```bash
cd backend
npm test          # unit test (Jest) cho các service — tập trung vào logic
                   # phân quyền (auth, hoi-thoai) và tính toán báo cáo
npm run test:cov  # kèm báo cáo coverage
```
