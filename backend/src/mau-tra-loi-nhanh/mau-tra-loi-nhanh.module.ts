import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MauTraLoiNhanh } from '../entities/mau-tra-loi-nhanh.entity';
import { AuthModule } from '../auth/auth.module';
import { MauTraLoiNhanhService } from './mau-tra-loi-nhanh.service';
import { MauTraLoiNhanhController } from './mau-tra-loi-nhanh.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MauTraLoiNhanh]), AuthModule],
  controllers: [MauTraLoiNhanhController],
  providers: [MauTraLoiNhanhService],
  exports: [MauTraLoiNhanhService],
})
export class MauTraLoiNhanhModule {}