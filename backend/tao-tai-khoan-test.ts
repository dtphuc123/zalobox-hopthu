import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import {
  ToChuc,
  NguoiDung,
  TaiKhoanNenTang,
  KhachHang,
  HoiThoai,
  TinNhan,
  Nhan,
  GhiChuNoiBo,
  MauTraLoiNhanh,
} from './src/entities';

async function main() {
  const dataSource = new DataSource({
    type: 'mysql',
    // Đọc từ biến môi trường; không đặt thì mặc định chạy vào XAMPP như cũ
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'zalobox_hopthu',
    entities: [
      ToChuc,
      NguoiDung,
      TaiKhoanNenTang,
      KhachHang,
      HoiThoai,
      TinNhan,
      Nhan,
      GhiChuNoiBo,
      MauTraLoiNhanh,
    ],
  });

  await dataSource.initialize();
  console.log(
    `Đã kết nối DB: ${dataSource.options.database} (port ${(dataSource.options as { port?: number }).port})`,
  );

  const toChucRepo = dataSource.getRepository(ToChuc);
  const nguoiDungRepo = dataSource.getRepository(NguoiDung);

  let toChuc = await toChucRepo.findOne({ where: { ten: 'SnailSoft Test' } });
  if (!toChuc) {
    toChuc = await toChucRepo.save({ ten: 'SnailSoft Test' });
  }

  // Tránh lỗi trùng email nếu chạy script nhiều lần
  const daCo = await nguoiDungRepo.findOne({
    where: { email: 'test@example.com' },
  });
  if (daCo) {
    console.log('Tài khoản test@example.com đã tồn tại, bỏ qua.');
    await dataSource.destroy();
    return;
  }

  const matKhauMaHoa = await bcrypt.hash('123456', 10);

  const nguoiDung = await nguoiDungRepo.save({
    toChucId: toChuc.id,
    hoTen: 'Phúc Test',
    email: 'test@example.com',
    matKhauMaHoa,
    vaiTro: 'quan_tri',
  });

  console.log('Đã tạo tài khoản test:', nguoiDung.email);
  await dataSource.destroy();
}

main().catch(console.error);