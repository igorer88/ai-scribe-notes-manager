import { Test, TestingModule } from '@nestjs/testing'
import { DataSource } from 'typeorm'

import { HealthCheckService } from './health-check.service'

const mockDataSource = {
  query: jest.fn()
}

describe('HealthCheckService', () => {
  let healthCheckService: HealthCheckService

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthCheckService,
        {
          provide: DataSource,
          useValue: mockDataSource
        }
      ]
    }).compile()

    healthCheckService = module.get<HealthCheckService>(HealthCheckService)
  })

  it('should be defined', () => {
    expect(healthCheckService).toBeDefined()
  })

  it('should connect to the database', async () => {
    mockDataSource.query.mockResolvedValueOnce([1])
    const isConnected = await healthCheckService.isDatabaseConnected()
    expect(isConnected).toBe(true)
    expect(mockDataSource.query).toHaveBeenCalledWith('SELECT 1')
  })

  it('should return false if the database connection fails', async () => {
    mockDataSource.query.mockRejectedValueOnce(new Error('Connection failed'))
    const isConnected = await healthCheckService.isDatabaseConnected()
    expect(isConnected).toBe(false)
  })
})
