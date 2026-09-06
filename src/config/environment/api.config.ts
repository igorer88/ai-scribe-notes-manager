import { registerAs } from '@nestjs/config'

export const DEFAULT_ALLOWED_ORIGINS =
  'http://localhost:5173,http://localhost:3000'

export const parseAllowedOrigins = (value?: string): string[] =>
  (value ?? DEFAULT_ALLOWED_ORIGINS)
    .split(',')
    .map(origin => origin.trim())
    .filter(origin => origin.length > 0)

export const apiConfig = registerAs('api', () => ({
  environment: process.env.NODE_ENV,
  port: process.env.API_PORT ? parseInt(process.env.API_PORT) : undefined,
  secretKey: process.env.API_SECRET_KEY,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  allowedOrigins: parseAllowedOrigins(process.env.API_ALLOWED_ORIGINS),
  throttle: {
    ttl: process.env.THROTTLE_TTL ? parseInt(process.env.THROTTLE_TTL) : 60,
    limit: process.env.THROTTLE_LIMIT
      ? parseInt(process.env.THROTTLE_LIMIT)
      : 60
  }
}))
