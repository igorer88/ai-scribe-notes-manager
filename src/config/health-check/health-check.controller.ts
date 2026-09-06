import { Controller, Get } from '@nestjs/common'
import { SkipThrottle } from '@nestjs/throttler'

import { HealthCheckService } from './health-check.service'

@SkipThrottle()
@Controller('health')
export class HealthCheckController {
  constructor(private readonly healthCheckService: HealthCheckService) {}

  @Get('')
  async checkAppStatus(): Promise<{ status: string }> {
    return { status: 'Ok' }
  }

  @Get('db')
  async checkDatabaseConnection(): Promise<{ status: string }> {
    const isConnected = await this.healthCheckService.isDatabaseConnected()
    if (!isConnected) {
      return { status: 'Database is not connected' }
    }

    return { status: 'Database is connected' }
  }
}
