import { ConflictException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Repository } from "typeorm";
import { CreateUserDto } from "./dtos/create-user.dto";
import { UpdateUserDto } from "./dtos/update-user.dto";

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
    ) {}

    async create(createUserDto: CreateUserDto) {
        const isExists = await this.userRepo.findOneBy({
            email: createUserDto.email,
        });
        if(isExists) {
            throw new ConflictException('Esse e-mail já está cadastrado.');
        }

        const user = this.userRepo.create({
            name: createUserDto.name,
            email: createUserDto.email,
            password: createUserDto.password,
        });

        return await this.userRepo.save(user);
    }

    async findOne(id: string) {
        console.log(id);
    }

    async update(id: string, updateUserDto: UpdateUserDto) {
        console.log(id, updateUserDto);
    }

    async remove(id: string) {
        console.log(id);        
    }
}