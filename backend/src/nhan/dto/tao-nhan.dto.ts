import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class TaoNhanDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  ten: string;
}