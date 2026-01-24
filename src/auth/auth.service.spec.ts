import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { HashingService } from './hashing/hashing.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import jwtConfig from './config/jwt.config';
import { ConfigType } from '@nestjs/config';
import {StringValue} from 'ms'

describe('AuthService', () => {
  let service: AuthService;
  let userRepo: jest.Mocked<Repository<User>>;
  let hashingService: jest.Mocked<HashingService>;
  let jwtService: jest.Mocked<JwtService>;

  const jwtConfigMock: ConfigType<typeof jwtConfig> = {
    secret: 'test-secret',
    audience: 'test-audience',
    issuer: 'test-issuer',
    expiresIn: '1h' as StringValue,
  };

  const userMock: User = {
    id: 'uuid',
    name: 'Natan',
    email: 'natan@email.com',
    passwordHash: 'hashed-password',
  } as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: HashingService,
          useValue: {
            compare: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
        {
          provide: jwtConfig.KEY,
          useValue: jwtConfigMock,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepo = module.get(getRepositoryToken(User));
    hashingService = module.get(HashingService);
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('must log in successfully and receive an accessToken.', async () => {
      userRepo.findOne.mockResolvedValue(userMock);
      hashingService.compare.mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValue('jwt-token');

      const result = await service.login({
        email: 'natan@email.com',
        password: '123456',
      });

      expect(result).toEqual({
        id: userMock.id,
        name: userMock.name,
        email: userMock.email,
        accessToken: 'jwt-token',
        expiresIn: '1h'
      });

      expect(hashingService.compare).toHaveBeenCalledWith(
        '123456',
        userMock.passwordHash,
      );

      expect(jwtService.signAsync).toHaveBeenCalledWith(
        {
          sub: String(userMock.id),
          name: userMock.name,
          email: userMock.email,
        },
        {
          audience: jwtConfigMock.audience,
          issuer: jwtConfigMock.issuer,
          secret: jwtConfigMock.secret,
          expiresIn:jwtConfigMock.expiresIn,
        },
      );
    });

    it('should throw UnauthorizedException if the user not exist', async () => {
      userRepo.findOne.mockResolvedValue(null);

      await expect(
        service.login({
          email: 'alex@email.com',
          password: '123456',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if the password is invalid', async () => {
      userRepo.findOne.mockResolvedValue(userMock);
      hashingService.compare.mockResolvedValue(false);

      await expect(
        service.login({
          email: 'natan@email.com',
          password: '231654',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
