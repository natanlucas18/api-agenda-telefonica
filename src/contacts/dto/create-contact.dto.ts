import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class CreateContactDto {
    @ApiProperty({
        example: 'João',
        description: 'nome do contato',
        minLength: 3,
        maxLength: 255,
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(255)
    name: string;

    @ApiProperty({
        example: 'joao@email.com',
        description: 'email do contato'
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        example: '87 99566042',
        description: 'numero de telefone do contato',
        minLength: 10
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(10)
    phone: string;
}
