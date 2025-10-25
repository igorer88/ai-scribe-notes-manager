import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'

@Injectable()
export class HealthCheckService {
  constructor(private readonly dataSource: DataSource) {}

  async isDatabaseConnected(): Promise<boolean> {
    try {
      await this.dataSource.query('SELECT 1')
      return true
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return false
    }
  }
}
