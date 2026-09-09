import { Logger } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { runSeeder } from 'typeorm-extension'

import { Patient } from '@/domain/patient/entities/patient.entity'
import { User } from '@/domain/user/entities/user.entity'

import { PatientSeeder } from './seeds/PatientSeeder'
import { UserSeeder } from './seeds/UserSeeder'

const CONTEXT = 'DemoSeed'

/**
 * Idempotent, non-destructive demo-data provisioning intended to run on
 * every application boot (deploy environments where no shell is available).
 * - Creates the `demo` user only when it does not exist.
 * - Seeds 4 sample patients only when the patients table is empty.
 * Never truncates or overwrites existing data.
 */
export async function runDemoSeed(
  dataSource: DataSource,
  logger?: Logger
): Promise<void> {
  const userRepository = dataSource.getRepository(User)
  const demoExists = await userRepository.exists({
    where: { username: 'demo' }
  })

  if (demoExists) {
    logger?.log('Demo user already exists, skipping', CONTEXT)
  } else {
    logger?.log('Creating demo user...', CONTEXT)
    await runSeeder(dataSource, UserSeeder)
  }

  const patientCount = await dataSource.getRepository(Patient).count()
  if (patientCount === 0) {
    logger?.log('No patients found, seeding demo patients...', CONTEXT)
    await runSeeder(dataSource, PatientSeeder)
  } else {
    logger?.log(
      `Patients already present (${patientCount}), skipping seeding`,
      CONTEXT
    )
  }

  logger?.log('Demo data provisioning completed', CONTEXT)
}
