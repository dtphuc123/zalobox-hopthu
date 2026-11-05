import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { GhiChuNoiBo, HoiThoai, NguoiDung } from '../entities';
import { NguoiDungHienTai } from '../hoi-thoai/hoi-thoai.service';
import { TaoNguoiDungDto } from './dto/tao-nguoi-dung.dto';
import { CapNhatNguoiDungDto } from './dto/cap-nhat-nguoi-dung.dto';

export interface NhanVienTomTat {
  id: string;
  hoTen: string;
  email: string;
  vaiTro: string;
  trangThai: string;
}

function tomTat(nd: NguoiDung): NhanVienTomTat {
  return {
    id: nd.id,
    hoTen: nd.hoTen,
    email: nd.email,
    vaiTro: nd.vaiTro,
    trangThai: nd.trangThai,
  };
}

@Injectable()
export class NguoiDungService {
  constructor(
    @InjectRepository(NguoiDung)
    private readonly nguoiDungRepo: Repository<NguoiDung>,
  ) {}

  async layDanhSachNhanVien(user: NguoiDungHienTai): Promise<NhanVienTomTat[]> {
    const danhSach = await this.nguoiDungRepo.find({
      where: { toChucId: user.toChucId },
      order: { hoTen: 'ASC' },
    });
    return danhSach.map(tomTat);
  }

  async taoNguoiDung(
    user: NguoiDungHienTai,
    dto: TaoNguoiDungDto,
  ): Promise<NhanVienTomTat> {
    this.kiemTraQuanTri(user);

    const email = dto.email.trim().toLowerCase();
    const daCo = await this.nguoiDungRepo.findOne({ where: { email } });
    if (daCo) {
      throw new ConflictException('Email này đã được sử dụng');
    }

    const matKhauMaHoa = await bcrypt.hash(dto.matKhau, 10);
    const moi = await this.nguoiDungRepo.save({
      toChucId: user.toChucId,
      hoTen: dto.hoTen.trim(),
      email,
      matKhauMaHoa,
      vaiTro: dto.vaiTro,
      trangThai: 'hoat_dong',
    });
    return tomTat(moi as NguoiDung);
  }

  async capNhatNguoiDung(
    user: NguoiDungHienTai,
    id: string,
    dto: CapNhatNguoiDungDto,
  ): Promise<NhanVienTomTat> {
    this.kiemTraQuanTri(user);

    const nguoiDung = await this.nguoiDungRepo.findOne({
      where: { id, toChucId: user.toChucId },
    });
    if (!nguoiDung) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    // Tránh admin tự khoá hoặc tự hạ quyền chính mình, làm mất khả năng quản trị
    if (nguoiDung.id === user.id) {
      const doiVaiTro = dto.vaiTro !== undefined && dto.vaiTro !== nguoiDung.vaiTro;
      const tuKhoa = dto.trangThai === 'khoa';
      if (doiVaiTro || tuKhoa) {
        throw new BadRequestException(
          'Không thể tự đổi vai trò hoặc tự khoá tài khoản của chính mình',
        );
      }
    }

    if (dto.vaiTro !== undefined) nguoiDung.vaiTro = dto.vaiTro;
    if (dto.trangThai !== undefined) nguoiDung.trangThai = dto.trangThai;
    if (dto.matKhauMoi) {
      nguoiDung.matKhauMaHoa = await bcrypt.hash(dto.matKhauMoi, 10);
    }

    const daLuu = await this.nguoiDungRepo.save(nguoiDung);
    return tomTat(daLuu);
  }

  async xoaNguoiDung(user: NguoiDungHienTai, id: string): Promise<{ daXoa: true }> {
    this.kiemTraQuanTri(user);

    if (id === user.id) {
      throw new BadRequestException('Không thể tự xoá tài khoản của chính mình');
    }

    const nguoiDung = await this.nguoiDungRepo.findOne({
      where: { id, toChucId: user.toChucId },
    });
    if (!nguoiDung) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    // Gỡ các ràng buộc khoá ngoại trước khi xoá: hội thoại đang giao cho người này
    // quay về chưa phân công, ghi chú nội bộ do người này viết bị xoá cùng tài khoản.
    await this.nguoiDungRepo.manager.transaction(async (manager) => {
      await manager.update(
        HoiThoai,
        { nguoiPhuTrachId: id, trangThai: 'dang_xu_ly' },
        { nguoiPhuTrachId: null, trangThai: 'moi' },
      );
      await manager.update(HoiThoai, { nguoiPhuTrachId: id }, { nguoiPhuTrachId: null });
      await manager.delete(GhiChuNoiBo, { nguoiDungId: id });
      await manager.delete(NguoiDung, { id });
    });

    return { daXoa: true };
  }

  private kiemTraQuanTri(user: NguoiDungHienTai) {
    if (user.vaiTro !== 'quan_tri') {
      throw new ForbiddenException('Chỉ admin được quản lý người dùng');
    }
  }
}
