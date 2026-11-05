import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CapNhatNguoiDungDto {
  @IsOptional()
  @IsIn(['quan_tri', 'nhan_vien'])
  vaiTro?: string;

  @IsOptional()
  @IsIn(['hoat_dong', 'khoa'])
  trangThai?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  @MaxLength(100)
  matKhauMoi?: string;
}
