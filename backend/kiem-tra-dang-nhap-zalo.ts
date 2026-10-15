import { ZaloAdapter } from './src/adapters/zalo.adapter';
const { Zalo } = require('zca-js');
import { exec } from 'child_process';

async function chayThu() {
  const zalo = new Zalo();
  console.log('Đang khởi tạo kết nối, mã QR sẽ lưu ra file qr.png...');

  const api = await zalo.loginQR({ qrPath: './qr.png' });

  console.log('Đăng nhập thành công!');
  console.log('Trạng thái: kết nối OK');
}

chayThu().catch((loi) => {
  console.error('Có lỗi xảy ra:', loi);
});