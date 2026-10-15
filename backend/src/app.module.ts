import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ZaloModule } from './zalo/zalo.module';
import { HoiThoaiModule } from './hoi-thoai/hoi-thoai.module';
import { NhanModule } from './nhan/nhan.module';
import { MauTraLoiNhanhModule } from './mau-tra-loi-nhanh/mau-tra-loi-nhanh.module';
import { BaoCaoModule } from './bao-cao/bao-cao.module';
import { NguoiDungModule } from './nguoi-dung/nguoi-dung.module';
import {
  ToChuc,
  NguoiDung,
  TaiKhoanNenTang,
  KhachHang,
  HoiThoai,
  TinNhan,
  Nhan,
  GhiChuNoiBo,
  MauTraLoiNhanh,
} from './entities';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 3306),
        username: config.get<string>('DB_USERNAME', 'root'),
        password: config.get<string>('DB_PASSWORD', ''),
        database: config.get<string>('DB_DATABASE', 'zalobox_hopthu'),
        entities: [
          ToChuc,
          NguoiDung,
          TaiKhoanNenTang,
          KhachHang,
          HoiThoai,
          TinNhan,
          Nhan,
          GhiChuNoiBo,
          MauTraLoiNhanh,
        ],
        synchronize: true,
      }),
    }),
    AuthModule,
    ZaloModule,
    HoiThoaiModule,
    NhanModule,
    MauTraLoiNhanhModule,
    BaoCaoModule,
    NguoiDungModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}