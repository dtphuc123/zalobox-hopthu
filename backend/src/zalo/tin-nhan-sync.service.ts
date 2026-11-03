import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { KhachHang } from '../entities/khach-hang.entity';
import { HoiThoai } from '../entities/hoi-thoai.entity';
import { TinNhan } from '../entities/tin-nhan.entity';
import { TaiKhoanNenTang } from '../entities/tai-khoan-nen-tang.entity';
import { ToChuc } from '../entities/to-chuc.entity';
import { IncomingMessageEvent } from '../adapters/platform-adapter.interface';

@Injectable()
export class TinNhanSyncService {
  private readonly logger = new Logger(TinNhanSyncService.name);

  constructor(
    @InjectRepository(KhachHang)
    private readonly khachHangRepo: Repository<KhachHang>,
    @InjectRepository(HoiThoai)
    private readonly hoiThoaiRepo: Repository<HoiThoai>,
    @InjectRepository(TinNhan)
    private readonly tinNhanRepo: Repository<TinNhan>,
    @InjectRepository(TaiKhoanNenTang)
    private readonly taiKhoanRepo: Repository<TaiKhoanNenTang>,
    @InjectRepository(ToChuc)
    private readonly toChucRepo: Repository<ToChuc>,
  ) {}

  async xuLyTinNhanDen(
    taiKhoanNenTangId: string,
    event: IncomingMessageEvent,
  ): Promise<TinNhan | null> {
    // 1. Chống trùng: nếu tin nhắn này đã lưu rồi thì bỏ qua
    if (event.platformMessageId) {
      const daTonTai = await this.tinNhanRepo.findOne({
        where: { maTinNhanNenTang: event.platformMessageId },
      });
      if (daTonTai) {
        this.logger.debug(
          `Tin nhắn ${event.platformMessageId} đã tồn tại, bỏ qua`,
        );
        return null;
      }
    }

    // 2. Lấy tài khoản nền tảng để biết tổ chức nào sở hữu
    const taiKhoan = await this.taiKhoanRepo.findOne({
      where: { id: taiKhoanNenTangId },
    });
    if (!taiKhoan) {
      throw new Error(
        `Không tìm thấy tài khoản nền tảng: ${taiKhoanNenTangId}`,
      );
    }
    const toChucId = taiKhoan.toChucId;

    // 3. Tìm hoặc tạo khách hàng theo mã ngoài (threadId Zalo)
    let khachHang = await this.khachHangRepo.findOne({
      where: {
        toChucId,
        taiKhoanNenTangId,
        maNgoai: event.externalCustomerId,
      },
    });
    if (!khachHang) {
      khachHang = await this.khachHangRepo.save({
        toChucId,
        taiKhoanNenTangId,
        maNgoai: event.externalCustomerId,
        ten: event.customerName ?? undefined,
      });
      this.logger.log(`Tạo khách hàng mới: ${khachHang.id}`);
    }

    // 4. Tìm hội thoại đang mở (chưa xử lý xong), nếu chưa có thì tạo mới
    let hoiThoai = await this.hoiThoaiRepo.findOne({
      where: {
        khachHangId: khachHang.id,
        trangThai: In(['moi', 'dang_xu_ly']),
      },
      order: { ngayTao: 'DESC' },
    });

    if (!hoiThoai) {
      hoiThoai = await this.hoiThoaiRepo.save({
        toChucId,
        khachHangId: khachHang.id,
        taiKhoanNenTangId,
        nguoiPhuTrachId: null,
        trangThai: 'moi',
      });
      this.logger.log(`Tạo hội thoại mới: ${hoiThoai.id}`);
    }

    // 5. Lưu tin nhắn
    const tinNhan = await this.tinNhanRepo.save({
      hoiThoaiId: hoiThoai.id,
      nguoiGuiId: null,
      loaiNguoiGui: 'khach_hang',
      noiDung: event.content,
      trangThai: 'da_nhan',
      maTinNhanNenTang: event.platformMessageId,
    });

    // Cập nhật ngayCapNhat để hội thoại có tin mới nổi lên đầu danh sách.
    await this.hoiThoaiRepo.update(hoiThoai.id, {
      trangThai: hoiThoai.trangThai,
    });

    this.logger.log(
      `Đã lưu tin nhắn ${tinNhan.id} vào hội thoại ${hoiThoai.id}`,
    );

    return tinNhan;
  }

  /**
   * Tìm (hoặc tạo mới) bản ghi TaiKhoanNenTang ứng với tài khoản Zalo đang đăng nhập.
   * Thay cho việc ghi cứng ID: DB nào (XAMPP, Docker, server) cũng chạy được.
   * Trả về id của TaiKhoanNenTang.
   */
  async damBaoTaiKhoanZalo(idTaiKhoanZalo: string): Promise<string> {
    let taiKhoan = await this.taiKhoanRepo.findOne({
      where: { loaiNenTang: 'zalo', dinhDanh: idTaiKhoanZalo },
    });

    if (!taiKhoan) {
      const toChucId = await this.layToChucMacDinhId();
      taiKhoan = await this.taiKhoanRepo.save({
        toChucId,
        loaiNenTang: 'zalo',
        dinhDanh: idTaiKhoanZalo,
        trangThai: 'hoat_dong',
      });
      this.logger.log(
        `Tạo tài khoản nền tảng Zalo mới: ${taiKhoan.id} (Zalo ${idTaiKhoanZalo})`,
      );
    } else {
      await this.taiKhoanRepo.update(taiKhoan.id, { trangThai: 'hoat_dong' });
    }

    return taiKhoan.id;
  }

  /** Cập nhật trạng thái kết nối: 'hoat_dong' | 'ngat_ket_noi' | 'loi' */
  async capNhatTrangThaiTaiKhoan(
    taiKhoanNenTangId: string,
    trangThai: 'hoat_dong' | 'ngat_ket_noi' | 'loi',
  ): Promise<void> {
    await this.taiKhoanRepo.update(taiKhoanNenTangId, { trangThai });
  }

  /**
   * Tổ chức sở hữu tài khoản Zalo: lấy từ biến môi trường ZALO_TO_CHUC_ID nếu có,
   * nếu không thì lấy tổ chức đầu tiên trong DB.
   */
  private async layToChucMacDinhId(): Promise<string> {
    const tuBienMoiTruong = process.env.ZALO_TO_CHUC_ID;
    if (tuBienMoiTruong) return tuBienMoiTruong;

    const [toChuc] = await this.toChucRepo.find({ take: 1 });
    if (!toChuc) {
      throw new Error(
        'Chưa có tổ chức nào trong DB. Hãy chạy script tao-tai-khoan-test.ts trước.',
      );
    }
    return toChuc.id;
  }
}