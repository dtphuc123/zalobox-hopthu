import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MauTraLoiNhanh } from '../entities/mau-tra-loi-nhanh.entity';
import { NguoiDungHienTai } from '../hoi-thoai/hoi-thoai.service';
import { TaoMauTraLoiDto } from './dto/tao-mau.dto';
import { CapNhatMauTraLoiDto } from './dto/cap-nhat-mau.dto';

@Injectable()
export class MauTraLoiNhanhService {
  constructor(
    @InjectRepository(MauTraLoiNhanh)
    private readonly mauRepo: Repository<MauTraLoiNhanh>,
  ) {}

  async layDanhSach(user: NguoiDungHienTai): Promise<MauTraLoiNhanh[]> {
    return this.mauRepo.find({
      where: { toChucId: user.toChucId },
      order: { tieuDe: 'ASC' },
    });
  }

  async tao(
    dto: TaoMauTraLoiDto,
    user: NguoiDungHienTai,
  ): Promise<MauTraLoiNhanh> {
    return this.mauRepo.save({
      toChucId: user.toChucId,
      tieuDe: dto.tieuDe,
      noiDung: dto.noiDung,
    });
  }

  async sua(
    id: string,
    dto: CapNhatMauTraLoiDto,
    user: NguoiDungHienTai,
  ): Promise<MauTraLoiNhanh> {
    const mau = await this.timMauCuaToChuc(id, user);
    mau.tieuDe = dto.tieuDe;
    mau.noiDung = dto.noiDung;
    return this.mauRepo.save(mau);
  }

  async xoa(id: string, user: NguoiDungHienTai): Promise<void> {
    const mau = await this.timMauCuaToChuc(id, user);
    await this.mauRepo.remove(mau);
  }

  private async timMauCuaToChuc(
    id: string,
    user: NguoiDungHienTai,
  ): Promise<MauTraLoiNhanh> {
    const mau = await this.mauRepo.findOne({
      where: { id, toChucId: user.toChucId },
    });
    if (!mau) {
      throw new NotFoundException('Không tìm thấy mẫu trả lời nhanh');
    }
    return mau;
  }
}