import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'

import { AppModule } from './app.module'
import { logLevel } from './config'
import { parseAllowedOrigins } from './config/environment/api.config'
import { setup } from './setup'

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: parseAllowedOrigins(process.env.API_ALLOWED_ORIGINS),
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      credentials: true
    },
    logger: logLevel
  })
  const logger = new Logger('Bootstrap')

  setup(app)

  await app.listen(AppModule.port)
  logger.log(`Server running in: '${AppModule.environment}' environment`)
  logger.log(`Server started on port: ${AppModule.port}`)
}
bootstrap()
