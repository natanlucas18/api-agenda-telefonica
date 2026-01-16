import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dtos/create-user.dto";
import { UpdateUserDto } from "./dtos/update-user.dto";
import { tokenPayloadParams } from "src/auth/params/token-payload.params";
import { TokenPayloadDto } from "src/auth/dto/token-payload.dto";
import { AuthTokenGuard } from "src/auth/guards/auth-token.guard";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags('users')
@Controller('users')
export class UsersController {
    constructor (
        private readonly userService: UsersService,
    ) {}

    @ApiOperation({summary: 'Cria um novo usuário'})
    @ApiResponse({status: 201, description: 'usuário criado com sucesso'})
    @ApiResponse({status: 409, description: 'Dados inválidos'})
    @HttpCode(HttpStatus.CREATED)
    @Post()
    async create(@Body() createUserDto: CreateUserDto) {
        return await this.userService.create(createUserDto);
    }

    @UseGuards(AuthTokenGuard)
    @ApiOperation({summary: 'Retorna um usuário específico pelo ID'})
    @ApiParam({name: 'id', description: 'Id do usuário'})
    @ApiResponse({status: 200, description: 'usuário retornado com sucesso'})
    @ApiResponse({status: 404, description: 'usuário não encontrado'})
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @Get(':id')
    async findOne(@Param('id') id: string) {
        return await this.userService.findOne(id);
    }

    @UseGuards(AuthTokenGuard)
    @ApiOperation({summary: 'Atualiza um usuário existente'})
    @ApiParam({name: 'id', description: 'Id do usuário'})
    @ApiResponse({status:200, description: 'atualização de usuário bem-sucedida'})
    @ApiResponse({status:404, description: 'usuário não encontrado'})
    @ApiResponse({status:403, description: 'não possui permissão para atualizar o usuário'})
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @Patch(':id')
    async update(
        @Param('id') id: string,
        @tokenPayloadParams() tokenPayloadDto:TokenPayloadDto,
        @Body() updateUserDto: UpdateUserDto) {
        return await this.userService.update(id, updateUserDto, tokenPayloadDto);
    }

    @UseGuards(AuthTokenGuard)
    @ApiOperation({summary: 'Remove um usuário existente'})
    @ApiParam({name: 'id', description: 'Id do usuário'})
    @ApiResponse({status: 200, description: 'usuário removido com sucesso'})
    @ApiResponse({status:404, description: 'usuário não encontrado'})
    @ApiResponse({status:403, description: 'não possui permissão para remover o usuário'})
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @Delete(':id')
    async remove(@Param('id') id: string, @tokenPayloadParams() tokenPayloadDto:TokenPayloadDto) {
        return await this.userService.remove(id, tokenPayloadDto);
    }
}