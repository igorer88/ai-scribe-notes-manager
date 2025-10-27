import * as bcrypt from 'bcrypt'
import { DataSource } from 'typeorm'
import { Seeder } from 'typeorm-extension'

import { User } from '@/domain/user/entities/user.entity'

export class UserSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const repository = dataSource.getRepository(User)

    // Check if demo user already exists
    const existingUser = await repository.findOne({
      where: { username: 'demo' }
    })

    if (existingUser) {
      console.log('Demo user already exists, skipping creation')
      return
    }

    const hashedPassword = await bcrypt.hash('demo', 10)

    const demoUser = repository.create({
      username: 'demo',
      password: hashedPassword
    })

    await repository.save(demoUser)
    console.log('Demo user created successfully')
  }
}
