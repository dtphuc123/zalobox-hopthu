import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NguoiDung } from '../entities';
import { AuthModule } from '../auth/auth.module';
import { NguoiDungService } from './nguoi-dung.service';
import { NguoiDungController } from './nguoi-dung.controller';

@Module({
  imports: [TypeOrmModule.forFeature([NguoiDung]), AuthModule],
  controllers: [NguoiDungController],
  providers: [NguoiDungService],
})
export class NguoiDungModule {}