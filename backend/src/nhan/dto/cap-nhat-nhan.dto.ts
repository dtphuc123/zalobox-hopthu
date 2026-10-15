import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CapNhatNhanDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  ten: string;
}