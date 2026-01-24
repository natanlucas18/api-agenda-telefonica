import { Test, TestingModule } from '@nestjs/testing';
import { CanActivate, ConflictException, ExecutionContext, ForbiddenException, NotFoundException } from '@nestjs/common';
import { AuthTokenGuard } from 'src/auth/guards/auth-token.guard';
import { TokenPayloadDto } from 'src/auth/dto/token-payload.dto';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dtos/create-user.dto';

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: jest.Mocked<UsersService>;

  class AuthGuardMock implements CanActivate{
    canActivate(context: ExecutionContext): boolean {
      return true;
    }
  };

  const userMock: User = {
    id: 'uuid-2',
    name: 'Natan',
    email: 'natan@email.com',
    passwordHash: 'passwordHash',
    contacts: []
  };

  const mockTokenPayloadDto:TokenPayloadDto = {
    sub: 'uuid-2',
    name: 'Joao silva',
    aud: 'localhost',
    iss: 'localhost',
    exp: 8400,
    iat: 166660,
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{
        provide: UsersService,
        useValue: {
          create: jest.fn(),
          findOne: jest.fn(),
          update: jest.fn(),
          remove: jest.fn()
        }
      }],
    })
    .overrideGuard(AuthTokenGuard)
    .useClass(AuthGuardMock)
    .compile();

    usersController = module.get<UsersController>(UsersController);
    usersService = module.get(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  })

  it('should be defined', () => {
    expect(usersController).toBeDefined();
  });

  describe('create', () => {
    it('should call usersService.create with correct dto', async () => {
      const dto: CreateUserDto = {
        name: 'Natan',
        email: 'natan@email.com',
        password: 'password'
      };

      usersService.create.mockResolvedValue(userMock);

      const result = await usersController.create(dto);

      expect(usersService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(userMock);
    });

    it('should propagate ConflictException', async () => {
      usersService.create.mockRejectedValue(
        new ConflictException('Esse e-mail já está cadastrado.'),
      );

      expect(usersController.create({
        name: 'Natan',
        email: 'natan@email.com',
        password: 'password'
      })).rejects.toThrow(ConflictException)
    })
  })

  describe('findOne', () => {
    it('should call usersService.findOne with ID', async () => {
      usersService.findOne.mockResolvedValue(userMock);

      const result = await usersController.findOne('uuid-2');

      expect(usersService.findOne).toHaveBeenCalledWith('uuid-2');
      expect(result).toEqual(userMock);
    });

    it('should propagate NotFoundException', async () => {
      usersService.findOne.mockRejectedValue(
        new NotFoundException('Usuário não encontrado')
      );

      expect(usersController.findOne('uuid-1'))
      .rejects.toThrow(NotFoundException);
    })
  });

  describe('update', () => {
    it('should call usersService.update with id, dto and tokenPayloadDto', async () => {
      usersService.update.mockResolvedValue(userMock);
      
      const result = await usersController.update('uuid-2', mockTokenPayloadDto, { name: 'Lucas'})

      expect(usersService.update).toHaveBeenCalledWith('uuid-2', {name: 'Lucas'},
        mockTokenPayloadDto
      );
      expect(result).toEqual(userMock);
    });

    it('should propagate NotFoundException', async () => {
      usersService.update.mockRejectedValue(
        new NotFoundException('Usuário não encontrado')
      );

      expect(usersController.update(
        'uuid-1',
        mockTokenPayloadDto,
        {name: 'Robson'},
      )).rejects.toThrow(NotFoundException)
    });

    it('should propagate ForbiddenException', async () => {
        usersService.update.mockRejectedValue(
            new ForbiddenException('Você não pode atualizar esse usuário')
        );

        expect(usersController.update(
            'uuid-5',
            mockTokenPayloadDto,
            { name: 'Ricardo'}
        )).rejects.toThrow(ForbiddenException);
    })
  });

  describe('remove', () => {
    it('should call usersService.remove with id and tokenPayloadDto', async () => {
      usersService.remove.mockResolvedValue(userMock);

      const result = await usersController.remove('uuid-2', mockTokenPayloadDto);

      expect(usersService.remove).toHaveBeenCalledWith('uuid-2', mockTokenPayloadDto);
      expect(result).toEqual(userMock);
    })

    it('should propagate NotFoundException', async () => {
      usersService.remove.mockRejectedValue(
        new NotFoundException('Usuário não encontrado')
      );

      expect(usersController.remove('uuid-1', mockTokenPayloadDto))
      .rejects.toThrow(NotFoundException);
    });

    it('should propagate ForbiddenException', async () => {
        usersService.remove.mockRejectedValue(
            new ForbiddenException('Você não pode remover esse usuário')
        );

        expect(usersController.remove(
            'uuid-5',
            mockTokenPayloadDto
        )).rejects.toThrow(ForbiddenException);
    });
  });
});
