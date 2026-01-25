import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { SendMailDto } from './dto/send-email.dto';
import { Repository } from 'typeorm';
import { Contact } from 'src/contacts/entities/contact.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class EmailService {
  private transporter: Transporter;
  private readonly logger = new Logger(EmailService.name);
  @InjectRepository(Contact)
  private readonly contactsRepo: Repository<Contact>;

  constructor(private readonly config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get<string>('email.host'),
      port: this.config.get<number>('email.port'),
      secure: this.config.get<boolean>('email.secure'),
      auth: this.config.get('email.user')
        ? {
            user: this.config.get('email.user'),
            pass: this.config.get('email.pass'),
          }
        : undefined,
    });
  }

  async sendMail({ to, subject, message }: SendMailDto): Promise<void> {
    const contact = await this.contactsRepo.findOne({
      where: { email: to },
    });

    if (!contact) {
      throw new NotFoundException('Destinatário não encontrado.');
    }

    await this.transporter.sendMail({
      from: this.config.get<string>('email.from'),
      to,
      subject,
      html: message,
    });

    this.logger.log(`Email enviado para ${to}`);
  }
}
