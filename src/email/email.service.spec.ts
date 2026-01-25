import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from 'src/contacts/entities/contact.entity';
import { NotFoundException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

jest.mock('nodemailer');

describe('EmailService', () => {
  let service: EmailService;
  let contactsRepo: Repository<Contact>;

  const sendMailMock = jest.fn();

  beforeEach(async () => {
    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: sendMailMock,
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(<T = unknown>(key: string): T => {
              const config: Record<string, unknown> = {
                'email.host': 'smtp.test.com',
                'email.port': 587,
                'email.secure': false,
                'email.user': 'user',
                'email.pass': 'pass',
                'email.from': 'noreply@test.com',
              };
              return config[key] as T;
            }),
          },
        },
        {
          provide: getRepositoryToken(Contact),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    contactsRepo = module.get(getRepositoryToken(Contact));

    jest.clearAllMocks();
  });

  it('should send the email successfully', async () => {
    jest.spyOn(contactsRepo, 'findOne').mockResolvedValue({
      id: '1',
      email: 'test@test.com',
    } as Contact);

    sendMailMock.mockResolvedValue(undefined);

    await expect(
      service.sendMail({
        to: 'test@test.com',
        subject: 'Teste',
        message: '<p>Hello</p>',
      }),
    ).resolves.not.toThrow();

    expect(contactsRepo.findOne).toHaveBeenCalledWith({
      where: { email: 'test@test.com' },
    });

    expect(sendMailMock).toHaveBeenCalledWith({
      from: 'noreply@test.com',
      to: 'test@test.com',
      subject: 'Teste',
      html: '<p>Hello</p>',
    });
  });

  it('should throw NotFoundException if the contact not exist', async () => {
    jest.spyOn(contactsRepo, 'findOne').mockResolvedValue(null);

    await expect(
      service.sendMail({
        to: 'inexistente@test.com',
        subject: 'Teste',
        message: 'Hello',
      }),
    ).rejects.toThrow(NotFoundException);

    expect(sendMailMock).not.toHaveBeenCalled();
  });
});
