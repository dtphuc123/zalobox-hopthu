import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NguoiDungHienTai } from '../hoi-thoai/hoi-thoai.service';
import { NguoiDungService } from './nguoi-dung.service';
import { TaoNguoiDungDto } from './dto/tao-nguoi-dung.dto';
import { CapNhatNguoiDungDto } from './dto/cap-nhat-nguoi-dung.dto';

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

  @Post()
  async tao(@Req() req: RequestCoNguoiDung, @Body() dto: TaoNguoiDungDto) {
    return this.nguoiDungService.taoNguoiDung(req.user, dto);
  }

  @Patch(':id')
  async capNhat(
    @Req() req: RequestCoNguoiDung,
    @Param('id') id: string,
    @Body() dto: CapNhatNguoiDungDto,
  ) {
    return this.nguoiDungService.capNhatNguoiDung(req.user, id, dto);
  }
}
