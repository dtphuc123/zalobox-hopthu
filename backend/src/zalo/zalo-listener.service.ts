import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ZaloAdapter } from '../adapters/zalo.adapter';
import { TinNhanSyncService } from './tin-nhan-sync.service';

@Injectable()
export class ZaloListenerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ZaloListenerService.name);
  private readonly adapter = new ZaloAdapter();

  // TODO: thay bằng id thật của TaiKhoanNenTang
  private readonly taiKhoanNenTangId = 'fc8e709f-1d28-4425-b808-5b1a0978f60a';

  private dangKetNoiLai = false;
  private soLanThuLai = 0;
  private watchdogTimer?: NodeJS.Timeout;
  private readonly KHOANG_CACH_KIEM_TRA_MS = 30_000; // kiểm tra mỗi 30s

  constructor(private readonly tinNhanSyncService: TinNhanSyncService) {}

  async onModuleInit(): Promise<void> {
    await this.ketNoi();
    this.batDauWatchdog();
  }

  onModuleDestroy(): void {
    if (this.watchdogTimer) clearInterval(this.watchdogTimer);
  }

  private async ketNoi(): Promise<void> {
    try {
      await this.adapter.connect((qrPath) => {
        this.logger.log(`Mã QR đã lưu tại: ${qrPath}`);
      });

      this.adapter.onMessageReceived(async (event) => {
        try {
          await this.tinNhanSyncService.xuLyTinNhanDen(
            this.taiKhoanNenTangId,
            event,
          );
        } catch (loi) {
          this.logger.error('Lỗi khi lưu tin nhắn:', loi as Error);
        }
      });

      this.soLanThuLai = 0;
      this.logger.log('ZaloListenerService đã sẵn sàng nhận tin nhắn.');
    } catch (loi) {
      this.logger.error('Không thể kết nối ZaloAdapter:', loi as Error);
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