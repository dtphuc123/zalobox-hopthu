import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KhachHang } from '../entities/khach-hang.entity';
import { HoiThoai } from '../entities/hoi-thoai.entity';
import { TinNhan } from '../entities/tin-nhan.entity';
import { TaiKhoanNenTang } from '../entities/tai-khoan-nen-tang.entity';
import { TinNhanSyncService } from './tin-nhan-sync.service';
import { ZaloListenerService } from './zalo-listener.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([KhachHang, HoiThoai, TinNhan, TaiKhoanNenTang]),
  ],
  providers: [TinNhanSyncService, ZaloListenerService],
  exports: [TinNhanSyncService, ZaloListenerService],
})
export class ZaloModule {}