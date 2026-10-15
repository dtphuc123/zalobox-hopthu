import { DataSource } from 'typeorm';
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
  const taiKhoanRepo = dataSource.getRepository(TaiKhoanNenTang);

  const toChuc = await toChucRepo.findOne({ where: { ten: 'SnailSoft Test' } });
  if (!toChuc) {
    throw new Error(
      'Chưa có tổ chức "SnailSoft Test" — chạy tao-tai-khoan-test.ts trước',
    );
  }

  let taiKhoan = await taiKhoanRepo.findOne({
    where: { toChucId: toChuc.id, loaiNenTang: 'zalo' },
  });

  if (!taiKhoan) {
    taiKhoan = await taiKhoanRepo.save({
      toChucId: toChuc.id,
      loaiNenTang: 'zalo',
      dinhDanh: 'Zalo test account',
      trangThai: 'hoat_dong',
    });
    console.log('Đã tạo tài khoản nền tảng mới.');
  } else {
    console.log('Tài khoản nền tảng đã tồn tại, dùng lại.');
  }

  console.log('taiKhoanNenTangId:', taiKhoan.id);
  await dataSource.destroy();
}

main().catch(console.error);