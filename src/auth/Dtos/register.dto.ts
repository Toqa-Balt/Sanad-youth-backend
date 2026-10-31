import { IsEmail, IsInt, IsNotEmpty, IsString, Min, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsInt()
  @Min(1)
  age: number;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}