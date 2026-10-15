import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Nhan } from '../entities/nhan.entity';
import { AuthModule } from '../auth/auth.module';
import { NhanService } from './nhan.service';
import { NhanController } from './nhan.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Nhan]), AuthModule],
  controllers: [NhanController],
  providers: [NhanService],
  exports: [NhanService],
})
export class NhanModule {}