import { Body, Controller, Get, Post } from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'

import { CreateUserDto } from '@/domain/user/dto/create-user.dto'
import { User } from '@/domain/user/entities/user.entity'

import { AuthService } from './auth.service'
import { CurrentUser } from './decorators/current-user.decorator'
import { Public } from './decorators/public.decorator'
import { LoginAuthDto } from './dto/login-auth.dto'
import { AuthResponse } from './interfaces/auth-response.interface'
import { JwtPayload } from './interfaces/jwt-payload.interface'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('register')
  register(@Body() createUserDto: CreateUserDto): Promise<AuthResponse> {
    return this.authService.register(createUserDto)
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('login')
  login(@Body() loginAuthDto: LoginAuthDto): Promise<AuthResponse> {
    return this.authService.login(loginAuthDto)
  }

  @Get('me')
  me(@CurrentUser() payload: JwtPayload): Promise<User> {
    return this.authService.me(payload.sub)
  }
}
