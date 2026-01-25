import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { EmailService } from './email.service';
import { SendMailDto } from './dto/send-email.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthTokenGuard } from 'src/auth/guards/auth-token.guard';

@ApiTags('email')
@ApiBearerAuth()
@UseGuards(AuthTokenGuard)
@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Envia e-mails para contatos' })
  @ApiResponse({ status: 204, description: 'Envio de e-mail bem-sucedido' })
  @ApiResponse({ status: 404, description: 'Destinário não encontrado' })
  @Post('send')
  send(@Body() sendMailDto: SendMailDto) {
    return this.emailService.sendMail(sendMailDto);
  }
}
