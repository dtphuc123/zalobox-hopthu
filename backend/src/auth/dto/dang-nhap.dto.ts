import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class DangNhapDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  matKhau: string;
}