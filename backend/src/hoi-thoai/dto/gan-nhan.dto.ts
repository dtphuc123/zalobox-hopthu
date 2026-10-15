import { IsNotEmpty, IsUUID } from 'class-validator';

export class GanNhanDto {
  @IsUUID()
  @IsNotEmpty()
  nhanId: string;
}