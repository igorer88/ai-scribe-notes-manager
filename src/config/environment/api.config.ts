import { registerAs } from '@nestjs/config'

export const apiConfig = registerAs('api', () => ({
  environment: process.env.NODE_ENV,
  port: process.env.API_PORT ? parseInt(process.env.API_PORT) : undefined,
  secretKey: process.env.API_SECRET_KEY,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  throttle: {
    ttl: process.env.THROTTLE_TTL ? parseInt(process.env.THROTTLE_TTL) : 60,
    limit: process.env.THROTTLE_LIMIT
      ? parseInt(process.env.THROTTLE_LIMIT)
      : 60
  }
}))
