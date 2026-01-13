import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class CreateUserDto {
    @IsString()
    @MinLength(3)
    @MaxLength(155)
    @IsNotEmpty()
    name: string;

    @IsEmail()
    @MaxLength(255)
    @IsNotEmpty()
    email: string;

    @IsString()
    @MinLength(6)
    @MaxLength(255)
    @IsNotEmpty()
    password: string;
}