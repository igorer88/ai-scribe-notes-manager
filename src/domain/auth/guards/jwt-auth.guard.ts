import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { JwtService } from '@nestjs/jwt'

import { IS_PUBLIC_KEY } from '../constants'
import { JwtPayload } from '../interfaces/jwt-payload.interface'

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass()
    ])

    if (isPublic) {
      return true
    }

    const request = context.switchToHttp().getRequest()
    const authorization = request.headers?.authorization

    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization header')
    }

    const token = authorization.slice(7)

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token)
      request.user = payload
    } catch {
      throw new UnauthorizedException('Invalid or expired token')
    }

    return true
  }
}
