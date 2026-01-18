import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { Contact } from './entities/contact.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';
import { PaginatedResponseDto } from 'src/common/dtos/paginated-response.dto';
import { TokenPayloadDto } from 'src/auth/dto/token-payload.dto';

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepo: Repository<Contact>,
  ) {}
  async create(
    createContactDto: CreateContactDto,
    tokenPayloadDto: TokenPayloadDto
  ): Promise<Contact> {
      const isExist = await this.contactRepo.findOne({
        where: {
        email: createContactDto.email,
        user: {id: tokenPayloadDto.sub}
        }
      });

      if (isExist) {
        throw new ConflictException('Já existe um contato cadastrado com esse e-mail');
      }
      const contact = this.contactRepo.create({
        name: createContactDto.name,
        email: createContactDto.email,
        phone: createContactDto.phone,
        user: {id: tokenPayloadDto.sub}
      });
      return await this.contactRepo.save(contact);
  }

async findAll(
  query: PaginationQueryDto,
  userId: string,
): Promise<PaginatedResponseDto<Contact>> {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const qb = this.contactRepo.createQueryBuilder('contact')
    .innerJoin('contact.user', 'user')
    .where('user.id = :userId', {userId})

  if (query.search) {
    qb.andWhere('contact.name ILIKE :search', {
      search: `%${query.search}%`,
    });
  }

  const allowedSortBy = ['name', 'createdAt', 'updatedAt'];

  const sortBy = query.sortBy && allowedSortBy.includes(query.sortBy)
    ? query.sortBy
    : 'createdAt';

  const sortOrder =
    query.sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  qb.orderBy(`contact.${sortBy}`, sortOrder);
  qb.skip(skip).take(limit);

  const [data, total] = await qb.getManyAndCount();

  const totalPages = Math.ceil(total / limit);

  return {
    data,
    meta: {
      page,
      limit,
      totalItems: total,
      totalPages,
      hasPreviusPage: page > 1,
      hasNextPage: page < totalPages,
    },
  };
}

  async findOne(id: string, userId: string): Promise<Contact> {
    const contact = await this.contactRepo.findOne({
      where: {
        id,
        user: {id: userId},
      }
    })

    if (!contact) {
      throw new NotFoundException('Contato não encontrado');
    }

    return contact;
  }

  async update(id: string, userId: string, updateContactDto: UpdateContactDto): Promise<Contact> {
      const contact = await this.contactRepo.findOne({
        where: {
          id,
          user: { id: userId }
        }});
      if (!contact) {
        throw new NotFoundException('Contato não encontrado');
      }
      Object.assign(contact, updateContactDto);
      return await this.contactRepo.save(contact);
  }

  async remove(id: string, userId: string): Promise<Contact> {
      const contact = await this.contactRepo.findOne({
        where: {
          id,
          user: {id: userId}
        }
      });

      if (!contact) {
        throw new NotFoundException('Contato não encontrado');
      }
      return await this.contactRepo.remove(contact);
  }
}
