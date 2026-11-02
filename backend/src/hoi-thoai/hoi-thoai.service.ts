import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HoiThoai } from '../entities/hoi-thoai.entity';
import { TinNhan } from '../entities/tin-nhan.entity';
import { KhachHang } from '../entities/khach-hang.entity';
import { GhiChuNoiBo } from '../entities/ghi-chu-noi-bo.entity';
import { Nhan } from '../entities/nhan.entity';
import { ZaloListenerService } from '../zalo/zalo-listener.service';

export interface NguoiDungHienTai {
  id: string;
  toChucId: string;
  vaiTro: string;
}

export interface BoLocTimKiemHoiThoai {
  tuKhoa?: string;
  khachHangId?: string;
  nhanId?: string;
  trangThai?: string;
  tuNgay?: string;
  denNgay?: string;
}

@Injectable()
export class HoiThoaiService {
  constructor(
    @InjectRepository(HoiThoai)
    private readonly hoiThoaiRepo: Repository<HoiThoai>,
    @InjectRepository(TinNhan)
    private readonly tinNhanRepo: Repository<TinNhan>,
    @InjectRepository(KhachHang)
    private readonly khachHangRepo: Repository<KhachHang>,
    @InjectRepository(GhiChuNoiBo)
    private readonly ghiChuRepo: Repository<GhiChuNoiBo>,
    @InjectRepository(Nhan)
    private readonly nhanRepo: Repository<Nhan>,
    private readonly zaloListenerService: ZaloListenerService,
  ) {}

  async layDanhSach(user: NguoiDungHienTai): Promise<HoiThoai[]> {
    const where: Record<string, unknown> = { toChucId: user.toChucId };
    if (user.vaiTro !== 'quan_tri') {
      where.nguoiPhuTrachId = user.id;
    }

    return this.hoiThoaiRepo.find({
      where,
      relations: { khachHang: true, danhSachNhan: true },
      order: { ngayCapNhat: 'DESC' },
    });
  }

  /**
   * Lấy đúng 1 hội thoại theo id (kèm khách hàng + nhãn), có kiểm tra quyền
   * giống layDanhSach: admin xem được mọi hội thoại trong tổ chức, nhân viên
   * chỉ xem được hội thoại mình phụ trách.
   */
  async layMotHoiThoai(
    hoiThoaiId: string,
    user: NguoiDungHienTai,
  ): Promise<HoiThoai> {
    await this.timHoiThoaiCoQuyen(hoiThoaiId, user);

    return this.hoiThoaiRepo.findOne({
      where: { id: hoiThoaiId },
      relations: { khachHang: true, danhSachNhan: true },
    }) as Promise<HoiThoai>;
  }

  /**
   * Tìm kiếm hội thoại theo từ khóa (tên/SĐT/mã ngoài khách hàng + nội dung
   * tin nhắn), khách hàng, trạng thái, khoảng thời gian cập nhật, và nhãn.
   * Vẫn áp dụng đúng rule phân quyền như layDanhSach.
   */
  async timKiem(
    bo: BoLocTimKiemHoiThoai,
    user: NguoiDungHienTai,
  ): Promise<HoiThoai[]> {
    const qb = this.hoiThoaiRepo
      .createQueryBuilder('ht')
      .leftJoinAndSelect('ht.khachHang', 'khachHang')
      .leftJoinAndSelect('ht.danhSachNhan', 'nhan')
      .where('ht.toChucId = :toChucId', { toChucId: user.toChucId });

    if (user.vaiTro !== 'quan_tri') {
      qb.andWhere('ht.nguoiPhuTrachId = :nguoiDungId', {
        nguoiDungId: user.id,
      });
    }

    if (bo.khachHangId) {
      qb.andWhere('ht.khachHangId = :khachHangId', {
        khachHangId: bo.khachHangId,
      });
    }

    if (bo.trangThai) {
      qb.andWhere('ht.trangThai = :trangThai', { trangThai: bo.trangThai });
    }

    if (bo.tuNgay) {
      qb.andWhere('ht.ngayCapNhat >= :tuNgay', { tuNgay: bo.tuNgay });
    }

    if (bo.denNgay) {
      qb.andWhere('ht.ngayCapNhat <= :denNgay', { denNgay: bo.denNgay });
    }

    if (bo.nhanId) {
      qb.andWhere('nhan.id = :nhanId', { nhanId: bo.nhanId });
    }

    if (bo.tuKhoa) {
      qb.andWhere(
        `(
          khachHang.ten LIKE :tuKhoa
          OR khachHang.maNgoai LIKE :tuKhoa
          OR khachHang.soDienThoai LIKE :tuKhoa
          OR EXISTS (
            SELECT 1 FROM tin_nhan tn
            WHERE tn.hoiThoaiId = ht.id AND tn.noiDung LIKE :tuKhoa
          )
        )`,
        { tuKhoa: `%${bo.tuKhoa}%` },
      );
    }

    qb.orderBy('ht.ngayCapNhat', 'DESC');

    return qb.getMany();
  }

  async layLichSuTinNhan(
    hoiThoaiId: string,
    user: NguoiDungHienTai,
  ): Promise<TinNhan[]> {
    const hoiThoai = await this.timHoiThoaiCoQuyen(hoiThoaiId, user);
    return this.tinNhanRepo.find({
      where: { hoiThoaiId: hoiThoai.id },
      order: { ngayTao: 'ASC' },
    });
  }

  async guiTinNhan(
    hoiThoaiId: string,
    noiDung: string,
    user: NguoiDungHienTai,
  ): Promise<TinNhan> {
    const hoiThoai = await this.timHoiThoaiCoQuyen(hoiThoaiId, user);

    const khachHang = await this.khachHangRepo.findOne({
      where: { id: hoiThoai.khachHangId },
    });
    if (!khachHang) {
      throw new NotFoundException('Không tìm thấy khách hàng của hội thoại này');
    }

    await this.zaloListenerService.guiTinNhan(khachHang.maNgoai, noiDung);

    const tinNhan = await this.tinNhanRepo.save({
      hoiThoaiId: hoiThoai.id,
      nguoiGuiId: user.id,
      loaiNguoiGui: 'nhan_vien',
      noiDung,
      trangThai: 'da_gui',
    });

    if (hoiThoai.trangThai === 'moi') {
      await this.hoiThoaiRepo.update(hoiThoai.id, {
        trangThai: 'dang_xu_ly',
      });
    }

    return tinNhan;
  }

  async ganNguoiPhuTrach(
    hoiThoaiId: string,
    nguoiPhuTrachId: string,
    user: NguoiDungHienTai,
  ): Promise<HoiThoai> {
    if (user.vaiTro !== 'quan_tri') {
      throw new ForbiddenException('Chỉ admin được gán người phụ trách');
    }

    const hoiThoai = await this.hoiThoaiRepo.findOne({
      where: { id: hoiThoaiId, toChucId: user.toChucId },
    });
    if (!hoiThoai) {
      throw new NotFoundException('Không tìm thấy hội thoại');
    }

    hoiThoai.nguoiPhuTrachId = nguoiPhuTrachId;
    if (hoiThoai.trangThai === 'moi') {
      hoiThoai.trangThai = 'dang_xu_ly';
    }

    return this.hoiThoaiRepo.save(hoiThoai);
  }

  async doiTrangThai(
    hoiThoaiId: string,
    trangThai: string,
    user: NguoiDungHienTai,
  ): Promise<HoiThoai> {
    const hoiThoai = await this.timHoiThoaiCoQuyen(hoiThoaiId, user);
    hoiThoai.trangThai = trangThai;
    return this.hoiThoaiRepo.save(hoiThoai);
  }

  async layDanhSachGhiChu(
    hoiThoaiId: string,
    user: NguoiDungHienTai,
  ): Promise<GhiChuNoiBo[]> {
    const hoiThoai = await this.timHoiThoaiCoQuyen(hoiThoaiId, user);
    return this.ghiChuRepo.find({
      where: { hoiThoaiId: hoiThoai.id },
      relations: { nguoiDung: true },
      order: { ngayTao: 'ASC' },
    });
  }

  async themGhiChu(
    hoiThoaiId: string,
    noiDung: string,
    user: NguoiDungHienTai,
  ): Promise<GhiChuNoiBo> {
    const hoiThoai = await this.timHoiThoaiCoQuyen(hoiThoaiId, user);
    return this.ghiChuRepo.save({
      hoiThoaiId: hoiThoai.id,
      nguoiDungId: user.id,
      noiDung,
    });
  }

  async ganNhan(
    hoiThoaiId: string,
    nhanId: string,
    user: NguoiDungHienTai,
  ): Promise<HoiThoai> {
    const hoiThoai = await this.timHoiThoaiCoQuyen(hoiThoaiId, user);

    const nhan = await this.nhanRepo.findOne({
      where: { id: nhanId, toChucId: user.toChucId },
    });
    if (!nhan) {
      throw new NotFoundException('Không tìm thấy nhãn');
    }

    await this.hoiThoaiRepo
      .createQueryBuilder()
      .relation(HoiThoai, 'danhSachNhan')
      .of(hoiThoai.id)
      .add(nhan.id);

    return this.hoiThoaiRepo.findOne({
      where: { id: hoiThoai.id },
      relations: { danhSachNhan: true },
    }) as Promise<HoiThoai>;
  }

  async goNhan(
    hoiThoaiId: string,
    nhanId: string,
    user: NguoiDungHienTai,
  ): Promise<HoiThoai> {
    const hoiThoai = await this.timHoiThoaiCoQuyen(hoiThoaiId, user);

    await this.hoiThoaiRepo
      .createQueryBuilder()
      .relation(HoiThoai, 'danhSachNhan')
      .of(hoiThoai.id)
      .remove(nhanId);

    return this.hoiThoaiRepo.findOne({
      where: { id: hoiThoai.id },
      relations: { danhSachNhan: true },
    }) as Promise<HoiThoai>;
  }

  private async timHoiThoaiCoQuyen(
    hoiThoaiId: string,
    user: NguoiDungHienTai,
  ): Promise<HoiThoai> {
    const hoiThoai = await this.hoiThoaiRepo.findOne({
      where: { id: hoiThoaiId, toChucId: user.toChucId },
    });
    if (!hoiThoai) {
      throw new NotFoundException('Không tìm thấy hội thoại');
    }
    if (user.vaiTro !== 'quan_tri' && hoiThoai.nguoiPhuTrachId !== user.id) {
      throw new ForbiddenException('Bạn không có quyền với hội thoại này');
    }
    return hoiThoai;
  }
}