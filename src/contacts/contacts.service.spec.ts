import { Test, TestingModule } from '@nestjs/testing';
import { ContactsService } from './contacts.service';
import { Repository } from 'typeorm';
import { Contact } from './entities/contact.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('ContactsService', () => {
  let contactService: ContactsService;
  let contactRepo: jest.Mocked<Repository<Contact>>;

  const user: User = {
    id: 'uuid',
    name: 'joao',
    email: 'joao@email.com',
    passwordHash: 'passwordHash',
    contacts: [],
  };

  const mockContact: Contact = {
    id: 'uuid-2',
    name: 'Renan',
    email: 'renan@email.com',
    phone: '8799456022',
    createdAt: new Date(),
    user: user,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactsService,
        {
          provide: getRepositoryToken(Contact),
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
      ],
    }).compile();

    contactService = module.get<ContactsService>(ContactsService);
    contactRepo = module.get(getRepositoryToken(Contact));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(contactService).toBeDefined();
  });

  describe('create', () => {
    it('must successfully create a new contact', async () => {
      contactRepo.findOne.mockResolvedValue(null);
      contactRepo.create.mockReturnValue(mockContact);
      contactRepo.save.mockResolvedValue(mockContact);

      const result = await contactService.create(
        {
          name: 'Renan',
          email: 'renan@email.com',
          phone: '8799456022',
        },
        'uuid',
      );

      expect(contactRepo.create).toHaveBeenCalled();
      expect(contactRepo.save).toHaveBeenCalledWith(mockContact);
      expect(result).toEqual(mockContact);
    });

    it('should throw a new ConflictException if the contact already exists', async () => {
      contactRepo.findOne.mockResolvedValue(mockContact);

      expect(
        contactService.create(
          {
            name: 'Renan',
            email: 'renan@email.com',
            phone: '87 99456022',
          },
          'uuid',
        ),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return a paginated list', async () => {
      const qb: any = {
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockContact], 1]),
      };
      contactRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await contactService.findAll(
        {
          page: 1,
          limit: 10,
          sortBy: 'name',
          sortOrder: 'ASC',
        },
        'uuid',
      );

      expect(result.data).toHaveLength(1);
      expect(result.meta.totalItems).toBe(1);
      expect(result.meta.totalPages).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return a contact by id', async () => {
      contactRepo.findOne.mockResolvedValue(mockContact);

      const result = await contactService.findOne('uuid-2', 'uuid');

      expect(result).toEqual(mockContact);
    });

    it('should throw a NotFoundException if not exist', async () => {
      contactRepo.findOne.mockResolvedValue(null);

      expect(contactService.findOne('uuid-2', 'uuid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('must update a contact successfully', async () => {
      contactRepo.findOne.mockResolvedValue(mockContact);
      contactRepo.save.mockImplementation(async (c) => c);

      const updateContactDto = {
        name: 'Lucas',
      };

      const result = await contactService.update(
        'uuid-2',
        'uuid',
        updateContactDto,
      );

      expect(contactRepo.save).toHaveBeenCalledWith({
        ...mockContact,
        ...updateContactDto,
      });

      expect(result.name).toEqual(updateContactDto.name);
    });

    it('should throw a NotFoundException if not exist', async () => {
      contactRepo.findOne.mockResolvedValue(null);

      expect(
        contactService.update('uuid-2', 'uuid', {
          name: 'Lucas',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('must successfully remove a contact', async () => {
      contactRepo.findOne.mockResolvedValue(mockContact);
      contactRepo.remove.mockResolvedValue(mockContact);

      const result = await contactService.remove('uuid-2', 'uuid');

      expect(contactRepo.remove).toHaveBeenCalledWith(mockContact);
      expect(result).toEqual(mockContact);
    });

    it('should throw a NotFoundException if not exist', async () => {
      contactRepo.findOne.mockResolvedValue(null);

      expect(contactService.remove('uuid-2', 'uuid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
