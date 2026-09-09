import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common'
import { InjectDataSource } from '@nestjs/typeorm'
import { DataSource } from 'typeorm'

import { runDemoSeed } from './demo-seeder'

const CONTEXT = 'DemoSeed'

@Injectable()
export class DemoSeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(CONTEXT)

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async onApplicationBootstrap(): Promise<void> {
    if (process.env.BOOT_SEED === 'false') {
      this.logger.log('BOOT_SEED=false, skipping demo data provisioning')
      return
    }

    try {
      await runDemoSeed(this.dataSource, this.logger)
    } catch (error) {
      this.logger.error(
        'Demo data provisioning failed; continuing without it',
        error instanceof Error ? error.stack : String(error)
      )
    }
  }
}
