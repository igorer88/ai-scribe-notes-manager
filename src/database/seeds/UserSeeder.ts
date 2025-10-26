import * as bcrypt from 'bcrypt'
import { DataSource } from 'typeorm'
import { Seeder } from 'typeorm-extension'

import { User } from '@/domain/user/entities/user.entity'

export class UserSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const repository = dataSource.getRepository(User)

    const hashedPassword = await bcrypt.hash('demo', 10)

    const demoUser = repository.create({
      username: 'demo',
      password: hashedPassword
    })

    await repository.save(demoUser)
  }
}
