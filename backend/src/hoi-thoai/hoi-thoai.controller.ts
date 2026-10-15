import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { HoiThoaiService, NguoiDungHienTai } from './hoi-thoai.service';
import { GuiTinNhanDto } from './dto/gui-tin-nhan.dto';
import { GanNguoiPhuTrachDto } from './dto/gan-nguoi-phu-trach.dto';
import { DoiTrangThaiDto } from './dto/doi-trang-thai.dto';
import { ThemGhiChuDto } from './dto/them-ghi-chu.dto';
import { GanNhanDto } from './dto/gan-nhan.dto';

interface RequestCoNguoiDung {
  user: NguoiDungHienTai;
}

@Controller('hoi-thoai')
@UseGuards(JwtAuthGuard)
export class HoiThoaiController {
  constructor(private readonly hoiThoaiService: HoiThoaiService) {}

  @Get()
  async danhSach(@Req() req: RequestCoNguoiDung) {
    return this.hoiThoaiService.layDanhSach(req.user);
  }

  // GET /hoi-thoai/tim-kiem — tìm kiếm hội thoại
  @Get('tim-kiem')
  async timKiem(
    @Query('tuKhoa') tuKhoa: string | undefined,
    @Query('khachHangId') khachHangId: string | undefined,
    @Query('nhanId') nhanId: string | undefined,
    @Query('trangThai') trangThai: string | undefined,
    @Query('tuNgay') tuNgay: string | undefined,
    @Query('denNgay') denNgay: string | undefined,
    @Req() req: RequestCoNguoiDung,
  ) {
    return this.hoiThoaiService.timKiem(
      { tuKhoa, khachHangId, nhanId, trangThai, tuNgay, denNgay },
      req.user,
    );
  }

  @Get(':id/tin-nhan')
  async lichSuTinNhan(@Param('id') id: string, @Req() req: RequestCoNguoiDung) {
    return this.hoiThoaiService.layLichSuTinNhan(id, req.user);
  }

  @Post(':id/tin-nhan')
  async guiTinNhan(
    @Param('id') id: string,
    @Body() dto: GuiTinNhanDto,
    @Req() req: RequestCoNguoiDung,
  ) {
    return this.hoiThoaiService.guiTinNhan(id, dto.noiDung, req.user);
  }

  @Patch(':id/nguoi-phu-trach')
  async ganNguoiPhuTrach(
    @Param('id') id: string,
    @Body() dto: GanNguoiPhuTrachDto,
    @Req() req: RequestCoNguoiDung,
  ) {
    return this.hoiThoaiService.ganNguoiPhuTrach(id, dto.nguoiPhuTrachId, req.user);
  }

  @Patch(':id/trang-thai')
  async doiTrangThai(
    @Param('id') id: string,
    @Body() dto: DoiTrangThaiDto,
    @Req() req: RequestCoNguoiDung,
  ) {
    return this.hoiThoaiService.doiTrangThai(id, dto.trangThai, req.user);
  }

  // GET /hoi-thoai/:id/ghi-chu — danh sách ghi chú nội bộ
  @Get(':id/ghi-chu')
  async danhSachGhiChu(@Param('id') id: string, @Req() req: RequestCoNguoiDung) {
    return this.hoiThoaiService.layDanhSachGhiChu(id, req.user);
  }

  // POST /hoi-thoai/:id/ghi-chu — thêm ghi chú nội bộ
  @Post(':id/ghi-chu')
  async themGhiChu(
    @Param('id') id: string,
    @Body() dto: ThemGhiChuDto,
    @Req() req: RequestCoNguoiDung,
  ) {
    return this.hoiThoaiService.themGhiChu(id, dto.noiDung, req.user);
  }

  // POST /hoi-thoai/:id/nhan — gắn nhãn vào hội thoại
  @Post(':id/nhan')
  async ganNhan(
    @Param('id') id: string,
    @Body() dto: GanNhanDto,
    @Req() req: RequestCoNguoiDung,
  ) {
    return this.hoiThoaiService.ganNhan(id, dto.nhanId, req.user);
  }

  // DELETE /hoi-thoai/:id/nhan/:nhanId — gỡ nhãn khỏi hội thoại
  @Delete(':id/nhan/:nhanId')
  async goNhan(
    @Param('id') id: string,
    @Param('nhanId') nhanId: string,
    @Req() req: RequestCoNguoiDung,
  ) {
    return this.hoiThoaiService.goNhan(id, nhanId, req.user);
  }
}