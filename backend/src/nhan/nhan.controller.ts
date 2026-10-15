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
import { NhanService } from './nhan.service';
import { TaoNhanDto } from './dto/tao-nhan.dto';
import { CapNhatNhanDto } from './dto/cap-nhat-nhan.dto';

interface RequestCoNguoiDung {
  user: NguoiDungHienTai;
}

@Controller('nhan')
@UseGuards(JwtAuthGuard)
export class NhanController {
  constructor(private readonly nhanService: NhanService) {}

  @Get()
  async danhSach(@Req() req: RequestCoNguoiDung) {
    return this.nhanService.layDanhSach(req.user);
  }

  @Post()
  async tao(@Body() dto: TaoNhanDto, @Req() req: RequestCoNguoiDung) {
    return this.nhanService.tao(dto.ten, req.user);
  }

  @Patch(':id')
  async sua(
    @Param('id') id: string,
    @Body() dto: CapNhatNhanDto,
    @Req() req: RequestCoNguoiDung,
  ) {
    return this.nhanService.sua(id, dto.ten, req.user);
  }

  @Delete(':id')
  async xoa(@Param('id') id: string, @Req() req: RequestCoNguoiDung) {
    await this.nhanService.xoa(id, req.user);
    return { thanhCong: true };
  }
}