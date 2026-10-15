import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { KhachHang } from '../entities/khach-hang.entity';
import { HoiThoai } from '../entities/hoi-thoai.entity';
import { TinNhan } from '../entities/tin-nhan.entity';
import { TaiKhoanNenTang } from '../entities/tai-khoan-nen-tang.entity';
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

    this.logger.log(
      `Đã lưu tin nhắn ${tinNhan.id} vào hội thoại ${hoiThoai.id}`,
    );

    return tinNhan;
  }
}