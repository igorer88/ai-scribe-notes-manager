import { NestFactory } from '@nestjs/core'

import { SeederModule } from './seeder.module'
import { DatabaseSeeder } from './seeds/DatabaseSeeder'

async function bootstrap(): Promise<void> {
  const app = await NestFactory.createApplicationContext(SeederModule)
  const seeder = app.get(DatabaseSeeder)
  await seeder.run()
  await app.close()
}

bootstrap()
