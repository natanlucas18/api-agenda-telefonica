import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { HashingService } from 'src/auth/hashing/hashing.service';
import { ResponseUserDto } from './dtos/response-user.dto';
import { TokenPayloadDto } from 'src/auth/dto/token-payload.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly hashingService: HashingService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<ResponseUserDto> {
    const isExists = await this.userRepo.findOne({
      where: { email: createUserDto.email },
    });
    if (isExists) {
      throw new ConflictException('Esse e-mail já está cadastrado.');
    }

    const passwordHash = await this.hashingService.hash(createUserDto.password);
    const dataUser = this.userRepo.create({
      name: createUserDto.name,
      email: createUserDto.email,
      passwordHash,
    });
    const user = await this.userRepo.save(dataUser);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }

  async findOne(id: string): Promise<ResponseUserDto> {
    const user = await this.userRepo.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    tokenPayloadDto: TokenPayloadDto,
  ): Promise<ResponseUserDto> {
    const userData = {
      name: updateUserDto?.name,
    };

    if (updateUserDto?.password) {
      const passwordHash = await this.hashingService.hash(
        updateUserDto.password,
      );
      userData['passwordHash'] = passwordHash;
    }
    const user = await this.userRepo.preload({
      id,
      ...userData,
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (user.id !== tokenPayloadDto.sub) {
      throw new ForbiddenException('Você não pode atualizar esse usuário');
    }

    const updateUser = await this.userRepo.save(user);

    return {
      id: updateUser.id,
      name: updateUser.name,
      email: updateUser.email,
    };
  }

  async remove(
    id: string,
    tokenPayloadDto: TokenPayloadDto,
  ): Promise<ResponseUserDto> {
    const user = await this.userRepo.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (user.id !== tokenPayloadDto.sub) {
      throw new ForbiddenException('Você não pode remover esse usuário');
    }

    const removedUser = await this.userRepo.remove(user);
    return {
      id: removedUser.id,
      name: removedUser.name,
      email: removedUser.email,
    };
  }
}
