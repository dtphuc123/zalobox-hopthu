import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NguoiDung } from '../entities';
import { NguoiDungHienTai } from '../hoi-thoai/hoi-thoai.service';

export interface NhanVienTomTat {
  id: string;
  hoTen: string;
  email: string;
  vaiTro: string;
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
    return danhSach.map((nd) => ({
      id: nd.id,
      hoTen: nd.hoTen,
      email: nd.email,
      vaiTro: nd.vaiTro,
    }));
  }
}