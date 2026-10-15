import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HoiThoai } from '../entities/hoi-thoai.entity';
import { AuthModule } from '../auth/auth.module';
import { BaoCaoService } from './bao-cao.service';
import { BaoCaoController } from './bao-cao.controller';

@Module({
  imports: [TypeOrmModule.forFeature([HoiThoai]), AuthModule],
  controllers: [BaoCaoController],
  providers: [BaoCaoService],
})
export class BaoCaoModule {}