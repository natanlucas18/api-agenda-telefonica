import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dtos/create-user.dto";
import { UpdateUserDto } from "./dtos/update-user.dto";
import { tokenPayloadParams } from "src/auth/params/token-payload.params";
import { TokenPayloadDto } from "src/auth/dto/token-payload.dto";
import { AuthTokenGuard } from "src/auth/guards/auth-token.guard";

@Controller('users')
export class UsersController {
    constructor (
        private readonly userService: UsersService,
    ) {}

    @HttpCode(HttpStatus.CREATED)
    @Post()
    async create(@Body() createUserDto: CreateUserDto) {
        return await this.userService.create(createUserDto);
    }

    @UseGuards(AuthTokenGuard)
    @HttpCode(HttpStatus.OK)
    @Get(':id')
    async findOne(@Param('id') id: string) {
        return await this.userService.findOne(id);
    }

    @UseGuards(AuthTokenGuard)
    @HttpCode(HttpStatus.OK)
    @Patch(':id')
    async update(
        @Param('id') id: string,
        @tokenPayloadParams() tokenPayloadDto:TokenPayloadDto,
        @Body() updateUserDto: UpdateUserDto) {
        return await this.userService.update(id, updateUserDto, tokenPayloadDto);
    }

    @UseGuards(AuthTokenGuard)
    @HttpCode(HttpStatus.OK)
    @Delete(':id')
    async remove(@Param('id') id: string, @tokenPayloadParams() tokenPayloadDto:TokenPayloadDto) {
        return await this.userService.remove(id, tokenPayloadDto);
    }
}