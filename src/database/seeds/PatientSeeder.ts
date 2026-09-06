import { faker } from '@faker-js/faker'
import { DataSource } from 'typeorm'
import { Seeder } from 'typeorm-extension'

import { Patient } from '@/domain/patient/entities/patient.entity'
import { User } from '@/domain/user/entities/user.entity'

export class PatientSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const repository = dataSource.getRepository(Patient)

    // Assign seeded patients to the demo user
    const demoUser = await dataSource.getRepository(User).findOne({
      where: { username: 'demo' }
    })
    if (!demoUser) {
      throw new Error('Demo user not found, run UserSeeder first')
    }

    // Always create 4 fresh demo patients (entrypoint truncates first)
    for (let i = 0; i < 4; i++) {
      const patientData = {
        name: faker.person.fullName(),
        dateOfBirth: faker.date.birthdate({ min: 18, max: 90, mode: 'age' }),
        user: demoUser
      }
      const patient = repository.create(patientData)
      await repository.save(patient)
    }
    console.log('Demo patients created successfully')
  }
}
