import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ZaloAdapter } from '../adapters/zalo.adapter';
import { TinNhanSyncService } from './tin-nhan-sync.service';

export type TrangThaiKetNoiZalo =
  | 'hoat_dong'
  | 'cho_quet_qr'
  | 'dang_ket_noi'
  | 'ngat_ket_noi'
  | 'loi';

export interface ThongTinKetNoiZalo {
  trangThai: TrangThaiKetNoiZalo;
  maQr: string | null; // ảnh QR dạng base64 (không có tiền tố data:)
  idTaiKhoanZalo: string | null;
}

@Injectable()
export class ZaloListenerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ZaloListenerService.name);
  private readonly adapter = new ZaloAdapter();

  // Lấy tự động sau khi đăng nhập Zalo (không ghi cứng nữa)
  private taiKhoanNenTangId: string | null = null;

  private dangKetNoiLai = false;
  private soLanThuLai = 0;
  private watchdogTimer?: NodeJS.Timeout;
  private readonly KHOANG_CACH_KIEM_TRA_MS = 30_000; // kiểm tra mỗi 30s

  constructor(private readonly tinNhanSyncService: TinNhanSyncService) {}

  onModuleInit(): void {
    // Không await: để NestJS mở cổng ngay, đăng nhập Zalo chạy nền.
    // Nếu await ở đây, backend sẽ đứng chờ quét QR và không nhận request nào.
    void this.ketNoiLai();
    this.batDauWatchdog();
  }

  onModuleDestroy(): void {
    if (this.watchdogTimer) clearInterval(this.watchdogTimer);
  }

  /** Trạng thái kết nối hiện tại, dùng cho API GET /zalo/trang-thai */
  layTrangThai(): ThongTinKetNoiZalo {
    const trangThaiAdapter = this.adapter.getStatus();
    const maQr = this.adapter.layMaQr();

    let trangThai: TrangThaiKetNoiZalo;
    if (trangThaiAdapter === 'active') trangThai = 'hoat_dong';
    else if (maQr) trangThai = 'cho_quet_qr';
    else if (this.dangKetNoiLai) trangThai = 'dang_ket_noi';
    else if (trangThaiAdapter === 'error') trangThai = 'loi';
    else trangThai = 'ngat_ket_noi';

    return {
      trangThai,
      maQr: trangThai === 'cho_quet_qr' ? maQr : null,
      idTaiKhoanZalo: this.adapter.layIdTaiKhoanZalo(),
    };
  }

  /**
   * Đổi tài khoản Zalo: ngắt kết nối hiện tại, xoá phiên đã lưu và bắt đầu
   * lại từ đầu để hiện mã QR mới (quét bằng tài khoản Zalo khác).
   */
  async doiTaiKhoan(): Promise<void> {
    await this.ghiTrangThaiTaiKhoan('ngat_ket_noi');
    this.adapter.ngatKetNoi();
    this.taiKhoanNenTangId = null;
    void this.ketNoiLai();
  }

  private async ketNoi(): Promise<void> {
    try {
      await this.adapter.connect((qrPath) => {
        this.logger.log(`Mã QR đã lưu tại: ${qrPath}`);
      });

      // Lấy ID tài khoản Zalo vừa đăng nhập, tìm/tạo TaiKhoanNenTang tương ứng
      const idTaiKhoanZalo = this.adapter.layIdTaiKhoanZalo();
      if (!idTaiKhoanZalo) {
        throw new Error('Không lấy được ID tài khoản Zalo sau khi đăng nhập');
      }
      const taiKhoanNenTangId =
        await this.tinNhanSyncService.damBaoTaiKhoanZalo(idTaiKhoanZalo);
      this.taiKhoanNenTangId = taiKhoanNenTangId;

      this.adapter.onMessageReceived(async (event) => {
        try {
          await this.tinNhanSyncService.xuLyTinNhanDen(
            taiKhoanNenTangId,
            event,
          );
        } catch (loi) {
          this.logger.error('Lỗi khi lưu tin nhắn:', loi as Error);
        }
      });

      this.soLanThuLai = 0;
      this.logger.log(
        `ZaloListenerService đã sẵn sàng nhận tin nhắn (tài khoản nền tảng ${taiKhoanNenTangId}).`,
      );
    } catch (loi) {
      this.logger.error('Không thể kết nối ZaloAdapter:', loi as Error);
      await this.ghiTrangThaiTaiKhoan('loi');
      this.lenLichThuLaiKetNoi();
    }
  }

  /**
   * Định kỳ kiểm tra trạng thái kết nối. Nếu phát hiện không còn 'active'
   * (mất kết nối, QR hết hạn chưa quét khiến connect() reject...),
   * tự động thử kết nối lại (hiện QR mới).
   */
  private batDauWatchdog(): void {
    this.watchdogTimer = setInterval(() => {
      if (this.adapter.getStatus() !== 'active' && !this.dangKetNoiLai) {
        this.logger.warn('Phát hiện mất kết nối Zalo, đang thử kết nối lại...');
        void this.ghiTrangThaiTaiKhoan('ngat_ket_noi');
        void this.ketNoiLai();
      }
    }, this.KHOANG_CACH_KIEM_TRA_MS);
  }

  /** Thử lại với độ trễ tăng dần, tối đa 60s mỗi lần. */
  private lenLichThuLaiKetNoi(): void {
    this.soLanThuLai += 1;
    const doTre = Math.min(this.soLanThuLai * 10_000, 60_000);
    setTimeout(() => void this.ketNoiLai(), doTre);
  }

  private async ketNoiLai(): Promise<void> {
    if (this.dangKetNoiLai) return;
    this.dangKetNoiLai = true;
    try {
      await this.ketNoi();
    } finally {
      this.dangKetNoiLai = false;
    }
  }

  /** Ghi trạng thái vào DB, bỏ qua nếu chưa biết tài khoản nào */
  private async ghiTrangThaiTaiKhoan(
    trangThai: 'hoat_dong' | 'ngat_ket_noi' | 'loi',
  ): Promise<void> {
    if (!this.taiKhoanNenTangId) return;
    try {
      await this.tinNhanSyncService.capNhatTrangThaiTaiKhoan(
        this.taiKhoanNenTangId,
        trangThai,
      );
    } catch (loi) {
      this.logger.warn(`Không cập nhật được trạng thái tài khoản: ${loi}`);
    }
  }

  /**
   * Gửi tin nhắn trả lời khách qua Zalo.
   * Dùng bởi HoiThoaiService khi nhân viên trả lời trong hệ thống.
   */
  async guiTinNhan(externalCustomerId: string, noiDung: string): Promise<void> {
    if (this.adapter.getStatus() !== 'active') {
      throw new Error(
        'Chưa kết nối tới Zalo, không thể gửi tin nhắn lúc này.',
      );
    }
    await this.adapter.sendMessage(externalCustomerId, noiDung);
  }
}