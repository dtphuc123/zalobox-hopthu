# ZaloBox Hộp Thư — Backend

API NestJS + TypeORM + MySQL cho hệ thống quản lý hội thoại Zalo OA. Xác thực
bằng JWT, kết nối Zalo qua thư viện `zca-js` (đăng nhập bằng quét mã QR, nghe
tin nhắn khách đến, gửi tin nhắn trả lời).

## Cài đặt

```bash
cp .env.example .env   # điền thông tin kết nối MySQL thật + JWT_SECRET
npm install
npm run start:dev      # http://localhost:3000, tự reload khi sửa code
```

Backend cần một database MySQL đã tồn tại (tên khớp với `DB_DATABASE` trong
`.env`) — TypeORM tự đồng bộ schema dựa trên entity khi khởi động (môi trường
dev).

## Biến môi trường

Xem đầy đủ trong [`.env.example`](.env.example):

| Biến | Ý nghĩa |
|---|---|
| `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE` | Kết nối MySQL |
| `JWT_SECRET` | Khóa bí mật ký JWT khi đăng nhập |
| `ZALO_SESSION_PATH` | File lưu phiên đăng nhập Zalo (giữ nguyên qua các lần restart) |
| `PORT` | Cổng chạy server (mặc định 3000) |

## Cấu trúc module

```
src/
  auth/              đăng nhập (JWT), guard bảo vệ route, JwtStrategy
  zalo/              kết nối Zalo (QR), nghe tin nhắn đến, đồng bộ vào DB
  adapters/          ZaloAdapter — bọc thư viện zca-js sau 1 interface chung
                      (IPlatformAdapter), dễ thay nền tảng khác về sau
  hoi-thoai/         CRUD hội thoại: tìm kiếm, lịch sử tin nhắn, gán người
                      phụ trách, đổi trạng thái, gắn/gỡ nhãn, ghi chú nội bộ
  nhan/              quản lý nhãn (tag) hội thoại
  mau-tra-loi-nhanh/ mẫu trả lời soạn sẵn
  bao-cao/           báo cáo hiệu suất nhân viên (tính từ dữ liệu hội thoại
                      + tin nhắn thật trong DB, không có số liệu giả lập)
  nguoi-dung/        quản lý tài khoản nhân viên
  entities/          entity TypeORM (NguoiDung, HoiThoai, TinNhan, KhachHang,
                      Nhan, GhiChuNoiBo, ToChuc, TaiKhoanNenTang)
```

Mỗi module theo đúng 1 khuôn mẫu: `*.controller.ts` chỉ nhận request/trả kết
quả, toàn bộ nghiệp vụ (kiểm tra quyền, truy vấn DB) nằm trong
`*.service.ts`; validate input bằng DTO (`class-validator`), được bật toàn
cục qua `ValidationPipe` trong `main.ts`.

### Phân quyền

Hai vai trò: `quan_tri` (admin) và `nhan_vien`. Quy tắc áp dụng nhất quán ở
tầng service (không chỉ ở route):

- Admin xem/thao tác được mọi hội thoại trong tổ chức mình, xem được báo cáo
  hiệu suất, gán người phụ trách cho hội thoại.
- Nhân viên chỉ xem/thao tác được hội thoại mình đang phụ trách.

## Kiểm thử

```bash
npm test          # unit test (Jest), mock repository thủ công — không cần
                   # kết nối DB thật
npm run test:cov  # kèm báo cáo coverage
npm run test:e2e  # end-to-end (cần DB thật, xem test/jest-e2e.json)
```

Test hiện có tập trung vào phần dễ sai nhất: logic phân quyền
(`auth/auth.service.spec.ts`, `hoi-thoai/hoi-thoai.service.spec.ts`).

## Script khác

```bash
npm run build   # build ra dist/ (nest build)
npm run lint    # oxlint src/ test/
npm run format  # prettier --write
```

## Công nghệ dùng

NestJS · TypeORM · MySQL · Passport + JWT · class-validator/class-transformer
· bcrypt (mã hóa mật khẩu) · zca-js (kết nối Zalo) · Jest (test)
