# ZaloBox Hộp Thư — Frontend

Khung frontend React + TypeScript + Ant Design, nối với backend NestJS đã có
(`/auth/dang-nhap`, `/hoi-thoai`, `/hoi-thoai/:id/tin-nhan`,
`/hoi-thoai/:id/nguoi-phu-trach`).

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
    DangNhap.tsx            # màn đăng nhập
    DanhSachHoiThoai.tsx     # danh sách hội thoại (bảng, trạng thái, nhãn)
    ChiTietHoiThoai.tsx      # khung chat 1 hội thoại + gửi trả lời
```

## Điểm cần khớp lại với backend thật

Các interface trong `src/api/types.ts` được suy ra từ `hoi-thoai.service.ts`
và `hoi-thoai.controller.ts` đã xem qua (chưa xem entity gốc và
`AuthModule`/`dto đăng nhập`). Khi ghép nối thật, kiểm tra lại:

1. **Response của `POST /auth/dang-nhap`** — hiện giả định trả về
   `{ accessToken, nguoiDung: { id, hoTen, email, vaiTro, toChucId } }`.
   Nếu backend trả tên field khác (vd `token` thay vì `accessToken`), sửa
   trong `src/api/types.ts` và `src/api/auth.ts`.
2. **Entity `KhachHang`** — đang dùng `tenHienThi`, `anhDaiDien`, `maNgoai`.
   Khớp lại theo entity thật trong `entities/khach-hang.entity.ts`.
3. **Entity `Nhan`** — đang dùng `ten`, `mauSac`.

## Việc tiếp theo có thể làm

- Trang gán người phụ trách (`PATCH /hoi-thoai/:id/nguoi-phu-trach`) — hàm
  `ganNguoiPhuTrach` đã có sẵn trong `src/api/hoiThoai.ts`, chỉ cần thêm UI
  (vd dropdown chọn nhân viên) trong `ChiTietHoiThoai.tsx`, hiện chỉ admin
  mới gọi được theo logic backend.
- Tự động làm mới danh sách/tin nhắn theo thời gian thực (polling hoặc
  WebSocket) thay vì chỉ tải lại khi vào trang.
