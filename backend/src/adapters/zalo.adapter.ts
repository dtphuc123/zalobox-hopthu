const { Zalo, ThreadType } = require('zca-js');
import { IPlatformAdapter, IncomingMessageEvent } from './platform-adapter.interface';

export class ZaloAdapter implements IPlatformAdapter {
  private api: any = null;
  private status: 'active' | 'disconnected' | 'error' = 'disconnected';

  async connect(onQrGenerated?: (qrPath: string) => void): Promise<void> {
    try {
      const zalo = new Zalo();
      const qrPath = './qr.png';

      this.api = await zalo.loginQR({}, async (event: any) => {
        if (event?.actions?.saveToFile) {
          // Dùng hàm có sẵn của zca-js để lưu ảnh QR ra file
          await event.actions.saveToFile(qrPath);
          console.log(`Đã lưu mã QR ra file: ${qrPath}`);
          onQrGenerated?.(qrPath);
        } else if (event?.data?.image) {
          // Phòng trường hợp phiên bản zca-js không có actions.saveToFile,
          // tự giải mã base64 và lưu file thủ công
          const fs = require('fs');
          fs.writeFileSync(qrPath, Buffer.from(event.data.image, 'base64'));
          console.log(`Đã lưu mã QR ra file (thủ công): ${qrPath}`);
          onQrGenerated?.(qrPath);
        }
      });

      this.status = 'active';
      console.log('Kết nối Zalo thành công!');
    } catch (err) {
      this.status = 'error';
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
}