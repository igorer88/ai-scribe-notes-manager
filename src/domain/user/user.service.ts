import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import * as bcrypt from 'bcrypt'
import { Repository } from 'typeorm'

import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { User } from './entities/user.entity'

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10)
    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword
    })
    return this.usersRepository.save(user)
  }

  async findAllByUserId(userId: string): Promise<User[]> {
    const user = await this.usersRepository.findOneBy({ id: userId })
    return user ? [user] : []
  }

  async findOne(id: string): Promise<User> {
    return this.usersRepository.findOneBy({ id })
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { username } })
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const data = { ...updateUserDto }

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10)
    }

    await this.usersRepository.update(id, data)
    return this.usersRepository.findOneBy({ id })
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.softDelete(id)
  }

  async recover(id: string): Promise<void> {
    await this.usersRepository.recover({ id })
  }
}
