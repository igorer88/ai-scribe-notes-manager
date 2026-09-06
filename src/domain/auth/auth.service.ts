import {
  ConflictException,
  Injectable,
  UnauthorizedException
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'

import { CreateUserDto } from '@/domain/user/dto/create-user.dto'
import { User } from '@/domain/user/entities/user.entity'
import { UserService } from '@/domain/user/user.service'

import { LoginAuthDto } from './dto/login-auth.dto'
import { AuthResponse } from './interfaces/auth-response.interface'
import { JwtPayload } from './interfaces/jwt-payload.interface'

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService
  ) {}

  private async buildAuthResponse(user: User): Promise<AuthResponse> {
    const payload: JwtPayload = { sub: user.id, username: user.username }
    const accessToken = await this.jwtService.signAsync(payload)

    return { accessToken, user }
  }

  async register(createUserDto: CreateUserDto): Promise<AuthResponse> {
    const existing = await this.userService.findByUsername(
      createUserDto.username
    )
    if (existing) {
      throw new ConflictException('Username is already taken')
    }

    const user = await this.userService.create(createUserDto)
    return this.buildAuthResponse(user)
  }

  async login(loginAuthDto: LoginAuthDto): Promise<AuthResponse> {
    const user = await this.userService.findByUsername(loginAuthDto.username)

    if (!user) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const passwordMatches = await bcrypt.compare(
      loginAuthDto.password,
      user.password
    )
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials')
    }

    return this.buildAuthResponse(user)
  }

  async me(userId: string): Promise<User> {
    const user = await this.userService.findOne(userId)
    if (!user) {
      throw new UnauthorizedException('User not found')
    }

    return user
  }
}
