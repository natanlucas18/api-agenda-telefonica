import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SendMailDto {
  @ApiProperty({
    example: 'lucas@email.com',
    description: 'destinatário',
  })
  @IsEmail()
  to: string;

  @ApiProperty({
    example: 'Relatório de vendas do mês de janeiro',
    description: 'assunto',
  })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({
    example: 'Parabens, você atingiu a meta de vendas no mês de janeiro.',
    description: 'Mensagem',
  })
  @IsString()
  @IsNotEmpty()
  message: string;
}
