import { Controller, Get } from '@nestjs/common'

import { HealthCheckService } from './health-check.service'

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
