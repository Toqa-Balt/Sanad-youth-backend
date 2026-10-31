import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class CreateProgramMeetingDto {
  @IsDateString()
  @IsNotEmpty()
  date: string; // Or Date if using @Type(() => Date) from class-transformer

  @IsString()
  @IsNotEmpty()
  time: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsUrl() // Or @IsString() if you don't want strict URL validation
  url?: string;

  @IsInt()
  @IsNotEmpty()
  programId: number;
}