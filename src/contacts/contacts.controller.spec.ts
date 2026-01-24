import { Test, TestingModule } from '@nestjs/testing';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';
import { CanActivate, ConflictException, ExecutionContext, NotFoundException } from '@nestjs/common';
import { AuthTokenGuard } from 'src/auth/guards/auth-token.guard';
import { CreateContactDto } from './dto/create-contact.dto';
import { Contact } from './entities/contact.entity';
import { TokenPayloadDto } from 'src/auth/dto/token-payload.dto';

describe('ContactsController', () => {
  let contactsController: ContactsController;
  let contactsService: jest.Mocked<ContactsService>;

  class AuthGuardMock implements CanActivate{
    canActivate(context: ExecutionContext): boolean {
      return true;
    }
  };

  const mockContact:Contact = {
    id: 'uuid-2',
    name: 'Natan',
    email: 'natan@email.com',
    phone: '8799999999',
    createdAt: new Date(),
    user: {
      id: 'uuid',
      name: 'joao',
      email: 'joao@email.com',
      passwordHash: 'passwordHash',
      contacts: []
    }
  };

  const mockTokenPayloadDto:TokenPayloadDto = {
    aud: 'localhost',
    iss: 'localhost',
    exp: 8400,
    iat: 166660,
    name: 'Joao silva',
    sub: 'uuid',
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContactsController],
      providers: [{
        provide: ContactsService,
        useValue: {
          create: jest.fn(),
          findAll: jest.fn(),
          findOne: jest.fn(),
          update: jest.fn(),
          remove: jest.fn()
        }
      }],
    })
    .overrideGuard(AuthTokenGuard)
    .useClass(AuthGuardMock)
    .compile();

    contactsController = module.get<ContactsController>(ContactsController);
    contactsService = module.get(ContactsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  })

  it('should be defined', () => {
    expect(contactsController).toBeDefined();
  });

  describe('create', () => {
    it('should call contactService.create with correct dto and userId', async () => {
      const dto: CreateContactDto = {
        name: 'Natan',
        email: 'natan@email.com',
        phone: '8799999999'
      };

      contactsService.create.mockResolvedValue(mockContact);

      const result = await contactsController.create(dto, mockTokenPayloadDto);

      expect(contactsService.create).toHaveBeenCalledWith(dto,mockTokenPayloadDto.sub);
      expect(result).toEqual(mockContact);
    });

    it('should propagate ConflictException', async () => {
      contactsService.create.mockRejectedValue(
        new ConflictException('Já existe um contato cadastrado com esse e-mail'),
      );

      expect(contactsController.create({
        name: 'Natan',
        email: 'natan@email.com',
        phone: '8799999999'
      }, mockTokenPayloadDto)).rejects.toThrow(ConflictException)
    })
  })

  describe('findAll', () => {
    it('should call contactService.findAll with query params and userId', async () => {
      const query = { page: 1, limit: 10 };
      const expected = { data: [], meta: {} };

      contactsService.findAll.mockResolvedValue(expected as any);

      const result = await contactsController.findAll(query, mockTokenPayloadDto);

      expect(contactsService.findAll).toHaveBeenCalledWith(query, mockTokenPayloadDto.sub);
      expect(result).toEqual(expected);
    });
  });

  describe('findOne', () => {
    it('should call contactService.findOne with ID and userId', async () => {
      contactsService.findOne.mockResolvedValue(mockContact);

      const result = await contactsController.findOne('uuid-2', mockTokenPayloadDto);

      expect(contactsService.findOne).toHaveBeenCalledWith('uuid-2', mockTokenPayloadDto.sub);
      expect(result).toEqual(mockContact);
    });

    it('should propagate NotFoundException', async () => {
      contactsService.findOne.mockRejectedValue(
        new NotFoundException('Contato não encontrado')
      );

      expect(contactsController.findOne('uuid-1', mockTokenPayloadDto))
      .rejects.toThrow(NotFoundException);
    })
  });

  describe('update', () => {
    it('should call contactService.update with id, dto and userId', async () => {
      contactsService.update.mockResolvedValue(mockContact);
      
      const result = await contactsController.update('uuid-2', mockTokenPayloadDto, { name: 'Lucas'})

      expect(contactsService.update).toHaveBeenCalledWith('uuid-2', mockTokenPayloadDto.sub,
        {name: 'Lucas'}
      );
      expect(result).toEqual(mockContact);
    });

    it('should propagate NotFoundException', async () => {
      contactsService.update.mockRejectedValue(
        new NotFoundException('Contato não encontrado')
      );

      expect(contactsController.update(
        'uuid-1',
        mockTokenPayloadDto,
        {name: 'Renan'},
      )).rejects.toThrow(NotFoundException)
    })
  });

  describe('remove', () => {
    it('should call contactService.remove with id and userId', async () => {
      contactsService.remove.mockResolvedValue(mockContact);

      const result = await contactsController.remove('uuid-2', mockTokenPayloadDto);

      expect(contactsService.remove).toHaveBeenCalledWith('uuid-2', mockTokenPayloadDto.sub);
      expect(result).toEqual(mockContact);
    })

    it('should propagate NotFoundException', async () => {
      contactsService.remove.mockRejectedValue(
        new NotFoundException('Contato não encontrado')
      );

      expect(contactsController.remove('uuid-1', mockTokenPayloadDto))
      .rejects.toThrow(NotFoundException);
    })
  })
});
