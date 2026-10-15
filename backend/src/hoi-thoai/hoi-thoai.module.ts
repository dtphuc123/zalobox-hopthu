import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HoiThoai } from '../entities/hoi-thoai.entity';
import { TinNhan } from '../entities/tin-nhan.entity';
import { KhachHang } from '../entities/khach-hang.entity';
import { GhiChuNoiBo } from '../entities/ghi-chu-noi-bo.entity';
import { Nhan } from '../entities/nhan.entity';
import { ZaloModule } from '../zalo/zalo.module';
import { AuthModule } from '../auth/auth.module';
import { HoiThoaiService } from './hoi-thoai.service';
import { HoiThoaiController } from './hoi-thoai.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([HoiThoai, TinNhan, KhachHang, GhiChuNoiBo, Nhan]),
    ZaloModule,
    AuthModule,
  ],
  controllers: [HoiThoaiController],
  providers: [HoiThoaiService],
})
export class HoiThoaiModule {}