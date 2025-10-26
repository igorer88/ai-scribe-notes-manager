import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { Seeder, runSeeder } from 'typeorm-extension'

import { PatientSeeder } from './PatientSeeder'
import { UserSeeder } from './UserSeeder'

@Injectable()
export class DatabaseSeeder implements Seeder {
  constructor(private readonly dataSource: DataSource) {}

  async run(): Promise<void> {
    await runSeeder(this.dataSource, UserSeeder)
    await runSeeder(this.dataSource, PatientSeeder)
  }
}
