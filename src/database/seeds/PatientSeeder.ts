import { faker } from '@faker-js/faker'
import { DataSource } from 'typeorm'
import { Seeder } from 'typeorm-extension'

import { Patient } from '@/domain/patient/entities/patient.entity'

export class PatientSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const repository = dataSource.getRepository(Patient)

    // Always create 4 fresh demo patients (entrypoint truncates first)
    for (let i = 0; i < 4; i++) {
      const patientData = {
        name: faker.person.fullName(),
        dateOfBirth: faker.date.birthdate({ min: 18, max: 90, mode: 'age' })
      }
      const patient = repository.create(patientData)
      await repository.save(patient)
    }
    console.log('Demo patients created successfully')
  }
}
