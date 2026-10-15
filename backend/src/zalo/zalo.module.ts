import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { KhachHang } from '../entities/khach-hang.entity';
import { HoiThoai } from '../entities/hoi-thoai.entity';
import { TinNhan } from '../entities/tin-nhan.entity';
import { TaiKhoanNenTang } from '../entities/tai-khoan-nen-tang.entity';
import { ToChuc } from '../entities/to-chuc.entity';
import { TinNhanSyncService } from './tin-nhan-sync.service';
import { ZaloListenerService } from './zalo-listener.service';
import { ZaloController } from './zalo.controller';

@Module({
  imports: [
    // Cần cho JwtAuthGuard dùng trong ZaloController
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([
      KhachHang,
      HoiThoai,
      TinNhan,
      TaiKhoanNenTang,
      ToChuc,
    ]),
  ],
  controllers: [ZaloController],
  providers: [TinNhanSyncService, ZaloListenerService],
  exports: [TinNhanSyncService, ZaloListenerService],
})
export class ZaloModule {}