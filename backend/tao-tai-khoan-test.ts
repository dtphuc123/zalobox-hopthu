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
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: '',
    database: 'zalobox_hopthu',
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

  const toChucRepo = dataSource.getRepository(ToChuc);
  const nguoiDungRepo = dataSource.getRepository(NguoiDung);

  let toChuc = await toChucRepo.findOne({ where: { ten: 'SnailSoft Test' } });
  if (!toChuc) {
    toChuc = await toChucRepo.save({ ten: 'SnailSoft Test' });
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