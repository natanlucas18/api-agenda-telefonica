import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { AuthTokenGuard } from 'src/auth/guards/auth-token.guard';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@UseGuards(AuthTokenGuard)
@ApiBearerAuth()
@ApiTags('contacts')
@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) { }

  @ApiOperation({ summary: 'Cria um contato' })
  @ApiResponse({ status: 201, description: 'contato criado com sucesso' })
  @ApiResponse({ status: 409, description: 'dados inválidos' })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  create(@Body() createContactDto: CreateContactDto) {
    return this.contactsService.create(createContactDto);
  }

  @ApiOperation({ summary: 'Retorna todos os contatos' })
  @ApiResponse({ status: 200, description: 'contatos retornados com sucesso' })
  @HttpCode(HttpStatus.OK)
  @Get()
  findAll(
    @Query() query: PaginationQueryDto
  ) {
    return this.contactsService.findAll(query);
  }

  @ApiOperation({ summary: 'Retorna um contato específico pelo ID' })
  @ApiParam({ name: 'id', description: 'Id do contato' })
  @ApiResponse({ status: 200, description: 'contato retornado com sucesso' })
  @ApiResponse({ status: 404, description: 'contato não encontrado' })
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contactsService.findOne(id);
  }

  @ApiOperation({ summary: 'Atualiza um contato existente' })
  @ApiParam({ name: 'id', description: 'Id do contato' })
  @ApiResponse({ status: 200, description: 'atualização de contato bem-sucedida' })
  @ApiResponse({ status: 404, description: 'contato não encontrado' })
  @ApiResponse({ status: 409, description: 'dados inválidos' })
  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateContactDto: UpdateContactDto) {
    return this.contactsService.update(id, updateContactDto);
  }

  @ApiOperation({ summary: 'Remove um contato existente' })
  @ApiParam({ name: 'id', description: 'Id do contato' })
  @ApiResponse({ status: 200, description: 'contato removido com sucesso'})
  @ApiResponse({ status: 404, description: 'contato não encontrado' })
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contactsService.remove(id);
  }
}
