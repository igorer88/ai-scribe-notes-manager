import { faker } from '@faker-js/faker'
import { DataSource } from 'typeorm'
import { Seeder } from 'typeorm-extension'

import { Patient } from '@/domain/patient/entities/patient.entity'

export class PatientSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const repository = dataSource.getRepository(Patient)

    const patientData = []

    // Generate 3 random patients
    for (let i = 0; i < 3; i++) {
      patientData.push({
        name: faker.person.fullName(),
        dateOfBirth: faker.date.birthdate({ min: 18, max: 90, mode: 'age' })
      })
    }

    const newPatients = repository.create(patientData)
    await repository.save(newPatients)
  }
}
