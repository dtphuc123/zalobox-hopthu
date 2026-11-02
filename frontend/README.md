# ZaloBox Hộp Thư — Frontend

Frontend React + TypeScript + Ant Design cho hệ thống quản lý hội thoại Zalo
OA, nối trực tiếp với backend NestJS qua REST API — toàn bộ dữ liệu hiển thị
(hội thoại, tin nhắn, báo cáo...) lấy thật từ backend, không có dữ liệu giả
lập trong code.

## Cài đặt

```bash
cd frontend
npm install
npm run dev
```

Mặc định frontend chạy ở `http://localhost:5173` và proxy mọi request
`/api/*` sang backend ở `http://localhost:3000` (xem `vite.config.ts`).
Nếu backend chạy ở cổng khác, sửa `target` trong `vite.config.ts`.

## Cấu trúc

```
src/
  api/            # gọi API backend (axios) + kiểu dữ liệu TypeScript
    client.ts     # axios instance, tự gắn JWT, tự đăng xuất khi 401
    auth.ts       # POST /auth/dang-nhap
    hoiThoai.ts   # GET/POST/PATCH /hoi-thoai
    types.ts      # interface khớp entity backend
  context/
    AuthContext.tsx   # trạng thái đăng nhập, lưu token + người dùng
  components/
    BoCucChinh.tsx     # layout chung (sidebar + header)
    RouteRiengTu.tsx   # bảo vệ route cần đăng nhập
  pages/
    DangNhap.tsx             # màn đăng nhập
    DanhSachHoiThoai.tsx     # danh sách hội thoại (bảng, trạng thái, nhãn, tự làm mới)
    ChiTietHoiThoai.tsx      # khung chat 1 hội thoại: gửi trả lời, đổi trạng thái,
                              # gán người phụ trách, gắn/gỡ nhãn, ghi chú nội bộ
    MauTraLoiNhanh.tsx       # quản lý mẫu trả lời soạn sẵn
    BaoCaoHieuSuat.tsx       # báo cáo hiệu suất nhân viên (chỉ admin)
    KetNoiZalo.tsx           # quét mã QR kết nối tài khoản Zalo OA
```

Mỗi trang gọi API theo cùng một khuôn mẫu: state `dangTai`/`loi`, gọi hàm
trong `src/api/*.ts` bằng `async/await` trong `try/catch/finally`, báo lỗi
qua `Alert` (lỗi chặn luồng chính) hoặc `message.error` (lỗi thao tác phụ,
không chặn trang) — không có trang nào âm thầm nuốt lỗi.

## Real-time

Chưa có WebSocket — danh sách hội thoại và lịch sử tin nhắn tự làm mới bằng
polling (`setInterval`, xem hằng số `CHU_KY_LAM_MOI_MS` trong từng trang).
