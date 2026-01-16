import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class LoginDto {
    @ApiProperty({
        example: 'natan@email.com',
        description: 'Email do usuário',
        maxLength: 255
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        example: '2206j147',
        description: 'Senha do usuário',
        minLength: 6,
        maxLength: 255
    })
    @IsString()
    @IsNotEmpty()
    password: string;
}
