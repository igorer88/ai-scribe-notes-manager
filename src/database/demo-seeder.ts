import { DataSource } from 'typeorm'
import { runSeeder } from 'typeorm-extension'

import { Patient } from '@/domain/patient/entities/patient.entity'
import { User } from '@/domain/user/entities/user.entity'

import { PatientSeeder } from './seeds/PatientSeeder'
import { UserSeeder } from './seeds/UserSeeder'

/**
 * Idempotent, non-destructive demo-data provisioning intended to run on
 * every application boot (deploy environments where no shell is available).
 * - Creates the `demo` user only when it does not exist.
 * - Seeds 4 sample patients only when the patients table is empty.
 * Never truncates or overwrites existing data.
 */
export async function runDemoSeed(dataSource: DataSource): Promise<void> {
  const userRepository = dataSource.getRepository(User)
  const demoExists = await userRepository.exists({
    where: { username: 'demo' }
  })

  if (!demoExists) {
    await runSeeder(dataSource, UserSeeder)
  }

  const patientCount = await dataSource.getRepository(Patient).count()
  if (patientCount === 0) {
    await runSeeder(dataSource, PatientSeeder)
  }
}
