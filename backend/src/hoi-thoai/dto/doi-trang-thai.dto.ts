import { IsIn, IsNotEmpty } from 'class-validator';

export class DoiTrangThaiDto {
  @IsIn(['moi', 'dang_xu_ly', 'da_xong'])
  @IsNotEmpty()
  trangThai: 'moi' | 'dang_xu_ly' | 'da_xong';
}