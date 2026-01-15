import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { AuthTokenGuard } from 'src/auth/guards/auth-token.guard';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';

@UseGuards(AuthTokenGuard)
@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post()
  create(@Body() createContactDto: CreateContactDto) {
    return this.contactsService.create(createContactDto);
  }

  @HttpCode(HttpStatus.OK)
  @Get()
  findAll(
    @Query() query: PaginationQueryDto
  ) {
    return this.contactsService.findAll(query);
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contactsService.findOne(id);
  }

  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateContactDto: UpdateContactDto) {
    return this.contactsService.update(id, updateContactDto);
  }

  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contactsService.remove(id);
  }
}
