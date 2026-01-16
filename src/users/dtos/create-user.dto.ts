import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class CreateUserDto {
    @ApiProperty({
        example: 'Natan',
        description: 'nome do usuário',
        minLength: 3,
        maxLength: 155,
    })
    @IsString()
    @MinLength(3)
    @MaxLength(155)
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        example: 'natan@email.com',
        description: 'email do usuário',
        maxLength: 255
    })
    @IsEmail()
    @MaxLength(255)
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        example: 'senha123',
        description: 'senha do usuário',
        minLength: 6,
        maxLength: 255,
    })
    @IsString()
    @MinLength(6)
    @MaxLength(255)
    @IsNotEmpty()
    password: string;
}