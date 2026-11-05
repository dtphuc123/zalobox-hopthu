import {
  Controller,
  ForbiddenException,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NguoiDungHienTai } from '../hoi-thoai/hoi-thoai.service';
import { ZaloListenerService } from './zalo-listener.service';

interface RequestCoNguoiDung {
  user: NguoiDungHienTai;
}

@Controller('zalo')
@UseGuards(JwtAuthGuard) // phải đăng nhập mới xem được QR
export class ZaloController {
  constructor(private readonly zaloListenerService: ZaloListenerService) {}

  /** Trạng thái kết nối Zalo + ảnh QR (nếu đang chờ quét) */
  @Get('trang-thai')
  layTrangThai() {
    return this.zaloListenerService.layTrangThai();
  }

  /** Ngắt kết nối và hiện mã QR mới để đăng nhập tài khoản Zalo khác (chỉ admin) */
  @Post('doi-tai-khoan')
  async doiTaiKhoan(@Req() req: RequestCoNguoiDung) {
    if (req.user.vaiTro !== 'quan_tri') {
      throw new ForbiddenException('Chỉ admin được đổi tài khoản Zalo');
    }
    await this.zaloListenerService.doiTaiKhoan();
    return { daBatDauDoi: true };
  }
}
