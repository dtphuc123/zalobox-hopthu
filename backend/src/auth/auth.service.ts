import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { NguoiDung } from '../entities';
import { DangNhapDto } from './dto/dang-nhap.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(NguoiDung)
    private nguoiDungRepo: Repository<NguoiDung>,
    private jwtService: JwtService,
  ) {}

  async dangNhap(dto: DangNhapDto) {
    const nguoiDung = await this.nguoiDungRepo.findOne({
      where: { email: dto.email },
    });

    if (!nguoiDung) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    const khopMatKhau = await bcrypt.compare(dto.matKhau, nguoiDung.matKhauMaHoa);
    if (!khopMatKhau) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    const payload = {
      sub: nguoiDung.id,
      toChucId: nguoiDung.toChucId,
      vaiTro: nguoiDung.vaiTro,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      nguoiDung: {
        id: nguoiDung.id,
        hoTen: nguoiDung.hoTen,
        email: nguoiDung.email,
        vaiTro: nguoiDung.vaiTro,
      },
    };
  }

  async baoMatMatKhau(matKhauGoc: string): Promise<string> {
    return bcrypt.hash(matKhauGoc, 10);
  }
}