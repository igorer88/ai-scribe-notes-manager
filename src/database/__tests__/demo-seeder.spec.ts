import type { DataSource } from 'typeorm'
import { runSeeder } from 'typeorm-extension'

import { User } from '@/domain/user/entities/user.entity'

import { runDemoSeed } from '../demo-seeder'
import { PatientSeeder } from '../seeds/PatientSeeder'
import { UserSeeder } from '../seeds/UserSeeder'

jest.mock('typeorm-extension', () => ({
  runSeeder: jest.fn(() => Promise.resolve())
}))

const mockRunSeeder = runSeeder as jest.Mock

describe('runDemoSeed', () => {
  let userRepository: { exists: jest.Mock }
  let patientRepository: { count: jest.Mock }

  const createDataSource = (): DataSource =>
    ({
      getRepository: jest.fn(entity =>
        entity === User ? userRepository : patientRepository
      )
    }) as unknown as DataSource

  beforeEach(() => {
    jest.clearAllMocks()
    userRepository = { exists: jest.fn() }
    patientRepository = { count: jest.fn() }
  })

  it('creates the demo user and seeds patients when both are missing', async () => {
    userRepository.exists.mockResolvedValue(false)
    patientRepository.count.mockResolvedValue(0)

    const dataSource = createDataSource()
    await runDemoSeed(dataSource)

    expect(mockRunSeeder).toHaveBeenCalledWith(dataSource, UserSeeder)
    expect(mockRunSeeder).toHaveBeenCalledWith(dataSource, PatientSeeder)
  })

  it('seeds patients only when the demo user already exists', async () => {
    userRepository.exists.mockResolvedValue(true)
    patientRepository.count.mockResolvedValue(0)

    const dataSource = createDataSource()
    await runDemoSeed(dataSource)

    expect(mockRunSeeder).not.toHaveBeenCalledWith(dataSource, UserSeeder)
    expect(mockRunSeeder).toHaveBeenCalledWith(dataSource, PatientSeeder)
  })

  it('creates the demo user only when patients already exist', async () => {
    userRepository.exists.mockResolvedValue(false)
    patientRepository.count.mockResolvedValue(4)

    const dataSource = createDataSource()
    await runDemoSeed(dataSource)

    expect(mockRunSeeder).toHaveBeenCalledWith(dataSource, UserSeeder)
    expect(mockRunSeeder).not.toHaveBeenCalledWith(dataSource, PatientSeeder)
  })

  it('is a no-op when demo user and patients already exist', async () => {
    userRepository.exists.mockResolvedValue(true)
    patientRepository.count.mockResolvedValue(4)

    const dataSource = createDataSource()
    await runDemoSeed(dataSource)

    expect(mockRunSeeder).not.toHaveBeenCalled()
  })
})
