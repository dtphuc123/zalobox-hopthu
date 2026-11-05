import { IsEmail, IsIn, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class TaoNguoiDungDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  hoTen: string;

  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(100)
  matKhau: string;

  @IsIn(['quan_tri', 'nhan_vien'])
  vaiTro: string;
}
