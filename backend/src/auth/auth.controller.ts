import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { DangNhapDto } from './dto/dang-nhap.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('dang-nhap')
  dangNhap(@Body() dto: DangNhapDto) {
    return this.authService.dangNhap(dto);
  }
}