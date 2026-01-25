import {
  CanActivate,
  ExecutionContext,
  NotFoundException,
} from '@nestjs/common';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthTokenGuard } from 'src/auth/guards/auth-token.guard';
import { SendMailDto } from './dto/send-email.dto';

describe('EmailController', () => {
  let emailController: EmailController;
  let emailService: jest.Mocked<EmailService>;

  class AuthGuardMock implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
      return true;
    }
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmailController],
      providers: [
        {
          provide: EmailService,
          useValue: {
            sendMail: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthTokenGuard)
      .useClass(AuthGuardMock)
      .compile();

    emailController = module.get<EmailController>(EmailController);
    emailService = module.get(EmailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('send', () => {
    it('should call emailService.sendMail with the correct dto', async () => {
      const dto: SendMailDto = {
        to: 'test@test.com',
        subject: 'Teste',
        message: '<p>Hello</p>',
      };

      emailService.sendMail.mockResolvedValue(undefined);

      await expect(emailController.send(dto)).resolves.not.toThrow();
      expect(emailService.sendMail).toHaveBeenCalledTimes(1);
      expect(emailService.sendMail).toHaveBeenCalledWith(dto);
    });

    it('should propagate NotFoundException', async () => {
      const dto: SendMailDto = {
        to: 'inexistente@test.com',
        subject: 'Erro',
        message: 'teste',
      };

      emailService.sendMail.mockRejectedValue(
        new NotFoundException('Destinatário não encontrado.'),
      );

      await expect(emailController.send(dto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
