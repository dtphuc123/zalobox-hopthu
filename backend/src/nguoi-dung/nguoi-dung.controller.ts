import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NguoiDungHienTai } from '../hoi-thoai/hoi-thoai.service';
import { NguoiDungService } from './nguoi-dung.service';

interface RequestCoNguoiDung {
  user: NguoiDungHienTai;
}

@Controller('nguoi-dung')
@UseGuards(JwtAuthGuard)
export class NguoiDungController {
  constructor(private readonly nguoiDungService: NguoiDungService) {}

  @Get()
  async danhSach(@Req() req: RequestCoNguoiDung) {
    return this.nguoiDungService.layDanhSachNhanVien(req.user);
  }
}