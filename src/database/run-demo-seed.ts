import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DataSource } from 'typeorm'

import { runDemoSeed } from './demo-seeder'
import { SeederModule } from './seeder.module'

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap')

  const app = await NestFactory.createApplicationContext(SeederModule)
  const dataSource = app.get(DataSource)

  logger.log('Starting demo data provisioning...')
  await runDemoSeed(dataSource)
  logger.log('Demo data provisioning completed.')
  await app.close()
}

bootstrap()
