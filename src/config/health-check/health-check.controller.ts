import { Controller, Get, ServiceUnavailableException } from '@nestjs/common'
import { SkipThrottle } from '@nestjs/throttler'

import { Public } from '@/domain/auth/decorators/public.decorator'

import { HealthCheckService } from './health-check.service'

@SkipThrottle()
@Public()
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
      throw new ServiceUnavailableException('Database is not connected')
    }

    return { status: 'Database is connected' }
  }
}
