import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ZaloListenerService } from './zalo-listener.service';

@Controller('zalo')
@UseGuards(JwtAuthGuard) // phải đăng nhập mới xem được QR
export class ZaloController {
  constructor(private readonly zaloListenerService: ZaloListenerService) {}

  /** Trạng thái kết nối Zalo + ảnh QR (nếu đang chờ quét) */
  @Get('trang-thai')
  layTrangThai() {
    return this.zaloListenerService.layTrangThai();
  }
}