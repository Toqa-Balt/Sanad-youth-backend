import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateMaterialDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @Type(() => Number) // ضروري جداً لأن form-data ترسل الأرقام كنصوص
  @IsInt()
  @IsNotEmpty()
  programId: number;
}