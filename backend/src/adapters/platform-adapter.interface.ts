export interface IncomingMessageEvent {
  externalCustomerId: string;
  customerName?: string;
  content: string;
  platformMessageId: string;
}

export interface IPlatformAdapter {
  connect(onQrGenerated?: (qrPath: string) => void): Promise<void>;
  sendMessage(externalCustomerId: string, content: string): Promise<void>;
  onMessageReceived(callback: (event: IncomingMessageEvent) => void): void;
  getStatus(): 'active' | 'disconnected' | 'error';
}