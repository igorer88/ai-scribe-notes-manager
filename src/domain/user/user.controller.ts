import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  NotFoundException
} from '@nestjs/common'

import { CurrentUser } from '@/domain/auth/decorators/current-user.decorator'

import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { User } from './entities/user.entity'
import { UserService } from './user.service'

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  private ensureSelf(id: string, currentUserId: string): void {
    if (id !== currentUserId) {
      throw new NotFoundException(`User with ID "${id}" not found`)
    }
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.create(createUserDto)
  }

  @Get()
  findAll(@CurrentUser('sub') currentUserId: string): Promise<User[]> {
    return this.userService.findAllByUserId(currentUserId)
  }

  @Get(':id')
  findOne(
    @CurrentUser('sub') currentUserId: string,
    @Param('id') id: string
  ): Promise<User> {
    this.ensureSelf(id, currentUserId)
    return this.userService.findOne(id)
  }

  @Patch(':id')
  update(
    @CurrentUser('sub') currentUserId: string,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto
  ): Promise<User> {
    this.ensureSelf(id, currentUserId)
    return this.userService.update(id, updateUserDto)
  }

  @Delete(':id')
  remove(
    @CurrentUser('sub') currentUserId: string,
    @Param('id') id: string
  ): Promise<void> {
    this.ensureSelf(id, currentUserId)
    return this.userService.remove(id)
  }

  @Patch(':id/recover')
  recover(
    @CurrentUser('sub') currentUserId: string,
    @Param('id') id: string
  ): Promise<void> {
    this.ensureSelf(id, currentUserId)
    return this.userService.recover(id)
  }
}
