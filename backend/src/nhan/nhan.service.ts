import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Nhan } from '../entities/nhan.entity';
import { NguoiDungHienTai } from '../hoi-thoai/hoi-thoai.service';

@Injectable()
export class NhanService {
  constructor(
    @InjectRepository(Nhan)
    private readonly nhanRepo: Repository<Nhan>,
  ) {}

  /** Danh sách nhãn trong tổ chức — mọi người đã đăng nhập đều xem được. */
  async layDanhSach(user: NguoiDungHienTai): Promise<Nhan[]> {
    return this.nhanRepo.find({
      where: { toChucId: user.toChucId },
      order: { ten: 'ASC' },
    });
  }

  async tao(ten: string, user: NguoiDungHienTai): Promise<Nhan> {
    this.kiemTraQuyenAdmin(user);

    const daTonTai = await this.nhanRepo.findOne({
      where: { toChucId: user.toChucId, ten },
    });
    if (daTonTai) {
      throw new ConflictException('Nhãn này đã tồn tại');
    }

    return this.nhanRepo.save({ toChucId: user.toChucId, ten });
  }

  async sua(id: string, ten: string, user: NguoiDungHienTai): Promise<Nhan> {
    this.kiemTraQuyenAdmin(user);
    const nhan = await this.timNhanCuaToChuc(id, user);
    nhan.ten = ten;
    return this.nhanRepo.save(nhan);
  }

  /** Xóa nhãn — gỡ hết liên kết trong bảng trung gian trước để tránh lỗi FK. */
  async xoa(id: string, user: NguoiDungHienTai): Promise<void> {
    this.kiemTraQuyenAdmin(user);
    const nhan = await this.timNhanCuaToChuc(id, user);

    await this.nhanRepo.manager
      .createQueryBuilder()
      .delete()
      .from('hoi_thoai_nhan')
      .where('nhanId = :id', { id })
      .execute();

    await this.nhanRepo.remove(nhan);
  }

  private async timNhanCuaToChuc(
    id: string,
    user: NguoiDungHienTai,
  ): Promise<Nhan> {
    const nhan = await this.nhanRepo.findOne({
      where: { id, toChucId: user.toChucId },
    });
    if (!nhan) {
      throw new NotFoundException('Không tìm thấy nhãn');
    }
    return nhan;
  }

  private kiemTraQuyenAdmin(user: NguoiDungHienTai): void {
    if (user.vaiTro !== 'quan_tri') {
      throw new ForbiddenException('Chỉ admin được quản lý nhãn');
    }
  }
}