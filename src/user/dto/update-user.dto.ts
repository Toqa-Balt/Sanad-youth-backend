import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from "class-validator";

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    firstName?: string;
    @IsOptional()
    @IsString()
    lastName?: string;

    @IsInt()
    @IsOptional()
    @Min(1)
    age?: number;

}
