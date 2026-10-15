import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NguoiDungHienTai } from '../hoi-thoai/hoi-thoai.service';
import { MauTraLoiNhanhService } from './mau-tra-loi-nhanh.service';
import { TaoMauTraLoiDto } from './dto/tao-mau.dto';
import { CapNhatMauTraLoiDto } from './dto/cap-nhat-mau.dto';

interface RequestCoNguoiDung {
  user: NguoiDungHienTai;
}

@Controller('mau-tra-loi-nhanh')
@UseGuards(JwtAuthGuard)
export class MauTraLoiNhanhController {
  constructor(private readonly mauService: MauTraLoiNhanhService) {}

  @Get()
  async danhSach(@Req() req: RequestCoNguoiDung) {
    return this.mauService.layDanhSach(req.user);
  }

  @Post()
  async tao(@Body() dto: TaoMauTraLoiDto, @Req() req: RequestCoNguoiDung) {
    return this.mauService.tao(dto, req.user);
  }

  @Patch(':id')
  async sua(
    @Param('id') id: string,
    @Body() dto: CapNhatMauTraLoiDto,
    @Req() req: RequestCoNguoiDung,
  ) {
    return this.mauService.sua(id, dto, req.user);
  }

  @Delete(':id')
  async xoa(@Param('id') id: string, @Req() req: RequestCoNguoiDung) {
    await this.mauService.xoa(id, req.user);
    return { thanhCong: true };
  }
}