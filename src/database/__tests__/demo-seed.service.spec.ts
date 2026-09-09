import { DataSource } from 'typeorm'

import { DemoSeedService } from '../demo-seed.service'
import { runDemoSeed } from '../demo-seeder'

jest.mock('../demo-seeder', () => ({
  runDemoSeed: jest.fn()
}))

const mockRunDemoSeed = runDemoSeed as jest.Mock

describe('DemoSeedService', () => {
  let service: DemoSeedService
  const dataSource = {} as DataSource

  beforeEach(() => {
    jest.clearAllMocks()
    delete process.env.BOOT_SEED
    service = new DemoSeedService(dataSource)
  })

  it('provisions demo data on application bootstrap', async () => {
    await service.onApplicationBootstrap()

    expect(mockRunDemoSeed).toHaveBeenCalledWith(dataSource, expect.anything())
  })

  it('skips provisioning when BOOT_SEED=false', async () => {
    process.env.BOOT_SEED = 'false'

    await service.onApplicationBootstrap()

    expect(mockRunDemoSeed).not.toHaveBeenCalled()
  })

  it('does not throw when provisioning fails', async () => {
    mockRunDemoSeed.mockRejectedValue(new Error('boom'))

    await expect(service.onApplicationBootstrap()).resolves.toBeUndefined()
  })
})
