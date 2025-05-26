import { Controller, Get, Post, Body, Param, Put, Delete, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserEntity as User } from './user.entity';
import { CreateUserDto, UpdateUserDto } from './dto';

@Controller('users')
@UseInterceptors(ClassSerializerInterceptor) // This will exclude password from responses
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<User> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.usersService.remove(id);
  }
}