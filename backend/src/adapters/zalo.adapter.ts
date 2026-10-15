const { Zalo, ThreadType } = require('zca-js');
import * as fs from 'fs';
import * as path from 'path';
import { IPlatformAdapter, IncomingMessageEvent } from './platform-adapter.interface';

// Trong Docker, ./sessions = /app/sessions (được gắn volume nên không mất khi restart)
const DUONG_DAN_PHIEN =
  process.env.ZALO_SESSION_PATH || './sessions/zalo-session.json';
const DUONG_DAN_QR = './qr.png';

interface PhienZalo {
  cookie: any;
  imei: string;
  userAgent: string;
}

export class ZaloAdapter implements IPlatformAdapter {
  private api: any = null;
  private status: 'active' | 'disconnected' | 'error' = 'disconnected';
  /** Ảnh QR mới nhất (base64, không có tiền tố data:), null nếu không chờ quét */
  private qrBase64: string | null = null;

  async connect(onQrGenerated?: (qrPath: string) => void): Promise<void> {
    try {
      const zalo = new Zalo();

      // 1. Thử đăng nhập lại bằng phiên đã lưu
      const phien = this.docPhien();
      if (phien) {
        try {
          this.api = await zalo.login(phien);
          this.status = 'active';
          this.qrBase64 = null;
          console.log('Đăng nhập Zalo bằng phiên đã lưu thành công!');
          return;
        } catch (loi) {
          console.warn('Phiên Zalo đã lưu không dùng được nữa, chuyển sang quét QR.');
          this.xoaPhien();
        }
      }

      // 2. Không có phiên (hoặc phiên hỏng) -> đăng nhập bằng QR
      this.status = 'disconnected';
      this.api = await zalo.loginQR({}, async (event: any) => {
        if (event?.data?.image) {
          // Có mã QR mới: giữ base64 trong bộ nhớ để giao diện web lấy hiển thị
          const base64 = String(event.data.image).replace(
            /^data:image\/\w+;base64,/,
            '',
          );
          this.qrBase64 = base64;
          // Vẫn lưu ra file để tiện kiểm tra khi cần
          fs.writeFileSync(DUONG_DAN_QR, Buffer.from(base64, 'base64'));
          console.log(`Đã có mã QR mới (lưu tại ${DUONG_DAN_QR})`);
          onQrGenerated?.(DUONG_DAN_QR);
        } else if (event?.data?.cookie && event?.data?.imei) {
          // Quét xong: zca-js trả về thông tin đăng nhập -> lưu lại
          this.luuPhien({
            cookie: event.data.cookie,
            imei: event.data.imei,
            userAgent: event.data.userAgent,
          });
        }
      });

      // Phòng trường hợp phiên bản zca-js không gửi thông tin đăng nhập qua callback
      if (!fs.existsSync(DUONG_DAN_PHIEN)) {
        const ctx = this.api?.getContext?.();
        if (ctx?.imei) {
          this.luuPhien({
            cookie: ctx.cookie?.toJSON?.()?.cookies ?? ctx.cookie,
            imei: ctx.imei,
            userAgent: ctx.userAgent,
          });
        }
      }

      this.status = 'active';
      this.qrBase64 = null;
      console.log('Kết nối Zalo thành công!');
    } catch (err) {
      this.status = 'error';
      this.qrBase64 = null;
      console.error('Lỗi kết nối Zalo:', err);
      throw err;
    }
  }

  async sendMessage(
    externalCustomerId: string,
    content: string,
  ): Promise<void> {
    if (!this.api) throw new Error('Chưa kết nối tới Zalo');
    await this.api.sendMessage(
      { msg: content },
      externalCustomerId,
      ThreadType.User,
    );
  }

  onMessageReceived(callback: (event: IncomingMessageEvent) => void): void {
    if (!this.api) throw new Error('Chưa kết nối tới Zalo');
    this.api.listener.on('message', (message: any) => {
      const isPlainText = typeof message.data.content === 'string';
      if (message.isSelf || !isPlainText) return;

      callback({
        externalCustomerId: message.threadId,
        customerName: message.data?.dName,
        content: message.data.content,
        platformMessageId: message.data?.msgId ?? `${Date.now()}`,
      });
    });
    this.api.listener.start();
  }

  getStatus(): 'active' | 'disconnected' | 'error' {
    return this.status;
  }

    /** Ảnh QR đang chờ quét (base64), hoặc null nếu không có */
  layMaQr(): string | null {
    return this.qrBase64;
  }

  /** ID tài khoản Zalo đang đăng nhập (vd: 613003286244780335), null nếu chưa đăng nhập */
  layIdTaiKhoanZalo(): string | null {
    if (!this.api) return null;
    const id = this.api.getOwnId?.() ?? this.api.getContext?.()?.uid;
    return id ? String(id) : null;
  }

  // ===== Lưu / đọc phiên đăng nhập =====

  private docPhien(): PhienZalo | null {
    try {
      if (!fs.existsSync(DUONG_DAN_PHIEN)) return null;
      return JSON.parse(fs.readFileSync(DUONG_DAN_PHIEN, 'utf-8'));
    } catch {
      return null;
    }
  }

  private luuPhien(phien: PhienZalo): void {
    try {
      fs.mkdirSync(path.dirname(DUONG_DAN_PHIEN), { recursive: true });
      fs.writeFileSync(DUONG_DAN_PHIEN, JSON.stringify(phien));
      console.log(`Đã lưu phiên Zalo tại ${DUONG_DAN_PHIEN}`);
    } catch (loi) {
      console.error('Không lưu được phiên Zalo:', loi);
    }
  }

  private xoaPhien(): void {
    try {
      if (fs.existsSync(DUONG_DAN_PHIEN)) fs.unlinkSync(DUONG_DAN_PHIEN);
    } catch {
      /* bỏ qua */
    }
  }
}