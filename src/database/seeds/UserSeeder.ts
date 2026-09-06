import * as bcrypt from 'bcrypt'
import { DataSource } from 'typeorm'
import { Seeder } from 'typeorm-extension'

import { User } from '@/domain/user/entities/user.entity'

export class UserSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const repository = dataSource.getRepository(User)

    // Upsert demo user - create if missing, keep existing
    const existingUser = await repository.findOne({
      where: { username: 'demo' }
    })

    const hashedPassword = await bcrypt.hash('demo', 10)

    if (existingUser) {
      // Update password if it changed (compare stored hash vs 'demo')
      if (existingUser.password !== hashedPassword) {
        existingUser.password = hashedPassword
        await repository.save(existingUser)
      }
      console.log('Demo user already exists, password synchronized')
    } else {
      const demoUser = repository.create({
        username: 'demo',
        password: hashedPassword
      })
      await repository.save(demoUser)
      console.log('Demo user created successfully')
    }
  }
}
