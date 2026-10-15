import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ThemGhiChuDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  noiDung: string;
}