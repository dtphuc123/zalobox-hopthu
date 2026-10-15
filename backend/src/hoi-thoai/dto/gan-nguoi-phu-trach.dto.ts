import { IsNotEmpty, IsUUID } from 'class-validator';

export class GanNguoiPhuTrachDto {
  @IsUUID()
  @IsNotEmpty()
  nguoiPhuTrachId: string;
}