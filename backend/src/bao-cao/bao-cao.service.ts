import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HoiThoai } from '../entities/hoi-thoai.entity';
import { NguoiDungHienTai } from '../hoi-thoai/hoi-thoai.service';

export interface HieuSuatNhanVien {
  nguoiDungId: string;
  hoTen: string;
  soHoiThoaiDaXuLy: number;
  soHoiThoaiDaXong: number;
  soTinNhanDaGui: number;
  /** null nếu chưa có hội thoại nào tính được thời gian phản hồi */
  thoiGianPhanHoiTrungBinhPhut: number | null;
}

@Injectable()
export class BaoCaoService {
  constructor(
    @InjectRepository(HoiThoai)
    private readonly hoiThoaiRepo: Repository<HoiThoai>,
  ) {}

  async baoCaoHieuSuat(
    tuNgay: string | undefined,
    denNgay: string | undefined,
    user: NguoiDungHienTai,
  ): Promise<HieuSuatNhanVien[]> {
    if (user.vaiTro !== 'quan_tri') {
      throw new ForbiddenException('Chỉ admin được xem báo cáo hiệu suất');
    }

    const qb = this.hoiThoaiRepo
      .createQueryBuilder('ht')
      .leftJoinAndSelect('ht.nguoiPhuTrach', 'nv')
      .leftJoinAndSelect('ht.danhSachTinNhan', 'tn')
      .where('ht.toChucId = :toChucId', { toChucId: user.toChucId })
      .andWhere('ht.nguoiPhuTrachId IS NOT NULL');

    if (tuNgay) {
      qb.andWhere('ht.ngayCapNhat >= :tuNgay', { tuNgay });
    }
    if (denNgay) {
      qb.andWhere('ht.ngayCapNhat <= :denNgay', { denNgay });
    }

    const danhSachHoiThoai = await qb.getMany();

    interface TichLuy {
      hoTen: string;
      soHoiThoaiDaXuLy: number;
      soHoiThoaiDaXong: number;
      soTinNhanDaGui: number;
      tongPhutPhanHoi: number;
      soLanCoPhanHoi: number;
    }
    const theoNhanVien = new Map<string, TichLuy>();

    for (const ht of danhSachHoiThoai) {
      if (!ht.nguoiPhuTrachId || !ht.nguoiPhuTrach) continue;

      const key = ht.nguoiPhuTrachId;
      if (!theoNhanVien.has(key)) {
        theoNhanVien.set(key, {
          hoTen: ht.nguoiPhuTrach.hoTen,
          soHoiThoaiDaXuLy: 0,
          soHoiThoaiDaXong: 0,
          soTinNhanDaGui: 0,
          tongPhutPhanHoi: 0,
          soLanCoPhanHoi: 0,
        });
      }
      const tk = theoNhanVien.get(key)!;

      tk.soHoiThoaiDaXuLy += 1;
      if (ht.trangThai === 'da_xong') {
        tk.soHoiThoaiDaXong += 1;
      }

      const tinNhanTrongHoiThoai = [...(ht.danhSachTinNhan ?? [])].sort(
        (a, b) => new Date(a.ngayTao).getTime() - new Date(b.ngayTao).getTime(),
      );

      tk.soTinNhanDaGui += tinNhanTrongHoiThoai.filter((tn) => {
        if (tn.loaiNguoiGui !== 'nhan_vien') return false;
        if (tuNgay && new Date(tn.ngayTao) < new Date(tuNgay)) return false;
        if (denNgay && new Date(tn.ngayTao) > new Date(denNgay)) return false;
        return true;
      }).length;

      // Thời gian phản hồi: tin nhắn khách đầu tiên -> tin nhắn nhân viên
      // đầu tiên xuất hiện sau đó trong cùng hội thoại.
      const tinKhachDauTien = tinNhanTrongHoiThoai.find(
        (tn) => tn.loaiNguoiGui === 'khach_hang',
      );
      if (tinKhachDauTien) {
        const tinNhanVienSauDo = tinNhanTrongHoiThoai.find(
          (tn) =>
            tn.loaiNguoiGui === 'nhan_vien' &&
            new Date(tn.ngayTao) > new Date(tinKhachDauTien.ngayTao),
        );
        if (tinNhanVienSauDo) {
          const phut =
            (new Date(tinNhanVienSauDo.ngayTao).getTime() -
              new Date(tinKhachDauTien.ngayTao).getTime()) /
            60000;
          tk.tongPhutPhanHoi += phut;
          tk.soLanCoPhanHoi += 1;
        }
      }
    }

    return Array.from(theoNhanVien.entries()).map(([nguoiDungId, tk]) => ({
      nguoiDungId,
      hoTen: tk.hoTen,
      soHoiThoaiDaXuLy: tk.soHoiThoaiDaXuLy,
      soHoiThoaiDaXong: tk.soHoiThoaiDaXong,
      soTinNhanDaGui: tk.soTinNhanDaGui,
      thoiGianPhanHoiTrungBinhPhut:
        tk.soLanCoPhanHoi > 0
          ? Math.round((tk.tongPhutPhanHoi / tk.soLanCoPhanHoi) * 10) / 10
          : null,
    }));
  }
}