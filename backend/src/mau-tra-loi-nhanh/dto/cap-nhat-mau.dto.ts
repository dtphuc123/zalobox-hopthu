import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CapNhatMauTraLoiDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  tieuDe: string;

  @IsString()
  @IsNotEmpty()
  noiDung: string;
}