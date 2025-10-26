import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'

import { SeederModule } from './seeder.module'
import { DatabaseSeeder } from './seeds/DatabaseSeeder'

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap')

  const app = await NestFactory.createApplicationContext(SeederModule)
  const seeder = app.get(DatabaseSeeder)

  logger.log('Starting database seeding...')
  await seeder.run()
  logger.log('Database seeding completed.')
  await app.close()
}

bootstrap()
