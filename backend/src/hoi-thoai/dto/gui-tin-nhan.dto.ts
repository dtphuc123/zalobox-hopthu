import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class GuiTinNhanDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  noiDung: string;
}