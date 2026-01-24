import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { HashingService } from 'src/auth/hashing/hashing.service';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { TokenPayloadDto } from 'src/auth/dto/token-payload.dto';
import { ResponseUserDto } from './dtos/response-user.dto';

describe('UsersService', () => {
  let service: UsersService;
  let userRepo: jest.Mocked<Repository<User>>;
  let hashingService: jest.Mocked<HashingService>;

  const tokenPayload: TokenPayloadDto = {
    sub: 'uuid',
    name: 'Joao',
    aud: 'teste',
    iss: 'teste',
    iat: 1,
    exp: 2,
  };

  const userMock: User = {
    id: 'uuid',
    name: 'natan',
    email: 'natan@email.com',
    passwordHash: 'hashed-password',
    contacts: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            preload: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: HashingService,
          useValue: {
            hash: jest.fn(),
            compare: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepo = module.get(getRepositoryToken(User));
    hashingService = module.get(HashingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('must successfully create a new user', async () => {
      userRepo.findOne.mockResolvedValue(null);
      hashingService.hash.mockResolvedValue('hashed-password');
      userRepo.create.mockReturnValue(userMock);
      userRepo.save.mockResolvedValue(userMock);

      const result = await service.create({
        name: 'natan',
        email: 'natan@email.com',
        password: '123456',
      });

      expect(result).toEqual({
        id: 'uuid',
        name: 'natan',
        email: 'natan@email.com',
      });

      expect(hashingService.hash).toHaveBeenCalledWith('123456');
    });

    it('should throw ConflictEcpetion if the email already exists', async () => {
      userRepo.findOne.mockResolvedValue(userMock);

      await expect(
        service.create({
          name: 'natan',
          email: 'natan@email.com',
          password: '123456',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findOne', () => {
    it('should return a user', async () => {
        const expectedResponse:ResponseUserDto = {
          id: userMock.id,
          name: userMock.name,
          email: userMock.email,
        };

      userRepo.findOne.mockResolvedValue(userMock);

      const result = await service.findOne('uuid');


      expect(result).toEqual(expectedResponse);
    });

    it('should throw NotFoundException if the user not exist', async () => {
      userRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne('uuid-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('must update a user successfully', async () => {
      userRepo.preload.mockResolvedValue({
        id: userMock.id,
        name: 'Lucas',
        email: userMock.email,
      } as User);

      userRepo.save.mockResolvedValue({
        id: userMock.id,
        name: 'Lucas',
        email: userMock.email,
      } as User);

      const result = await service.update(
        'uuid',
        { name: 'Lucas' },
        tokenPayload,
      );

      expect(result.name).toBe('Lucas');
    });

    it('must update password if a password has been sent', async () => {
      hashingService.hash.mockResolvedValue('new-hash');

      userRepo.preload.mockResolvedValue({
        id: userMock.id,
        name: userMock.name,
        email: userMock.email,
        passwordHash: 'new-hash',
      } as User);

      userRepo.save.mockResolvedValue({
        id: userMock.id,
        name: userMock.name,
        email: userMock.email,
      } as User);

      await service.update(
        'uuid',
        { password: 'novaSenha' },
        tokenPayload,
      );

      expect(hashingService.hash).toHaveBeenCalledWith('novaSenha');
    });

    it('should throw NotFoundException if the user not exist', async () => {
      userRepo.preload.mockResolvedValue(undefined);

      await expect(
        service.update('uuid-1', { name: 'flavio' }, tokenPayload),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if you try to update another user', async () => {
      userRepo.preload.mockResolvedValue({
        id: 'uuid-5',
      } as User);

      await expect(
        service.update('uuid-5', { name: 'Teste' }, tokenPayload),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should remove the user', async () => {
      userRepo.findOne.mockResolvedValue({
        id: userMock.id,
        name: userMock.name,
        email: userMock.email,
      } as User);

      userRepo.remove.mockResolvedValue({
        id: userMock.id,
        name: userMock.name,
        email: userMock.email,
      } as User);

      const result = await service.remove('uuid', tokenPayload);

      expect(result.id).toBe('uuid');
    });

    it('should throw NotFoundException if the user not exist', async () => {
      userRepo.findOne.mockResolvedValue(null);

      await expect(
        service.remove('uuid-5', tokenPayload),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if you try to remove another user', async () => {
      userRepo.findOne.mockResolvedValue({
        id: 'uuid-5',
      } as User);

      await expect(
        service.remove('uuid-5', tokenPayload),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
