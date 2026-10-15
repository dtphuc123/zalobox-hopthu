import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NguoiDungHienTai } from '../hoi-thoai/hoi-thoai.service';
import { BaoCaoService } from './bao-cao.service';

interface RequestCoNguoiDung {
  user: NguoiDungHienTai;
}

@Controller('bao-cao')
@UseGuards(JwtAuthGuard)
export class BaoCaoController {
  constructor(private readonly baoCaoService: BaoCaoService) {}

  // GET /bao-cao/hieu-suat?tuNgay=...&denNgay=...
  @Get('hieu-suat')
  async hieuSuat(
    @Query('tuNgay') tuNgay: string | undefined,
    @Query('denNgay') denNgay: string | undefined,
    @Req() req: RequestCoNguoiDung,
  ) {
    return this.baoCaoService.baoCaoHieuSuat(tuNgay, denNgay, req.user);
  }
}