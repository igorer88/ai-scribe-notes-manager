import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DataSource } from 'typeorm'

import { Patient } from '@/domain/patient/entities/patient.entity'
import { User } from '@/domain/user/entities/user.entity'

import { databaseProviders } from './database.provider'
import { DatabaseSeeder } from './seeds/DatabaseSeeder'
import { PatientSeeder } from './seeds/PatientSeeder'
import { UserSeeder } from './seeds/UserSeeder'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    ...databaseProviders,
    TypeOrmModule.forFeature([Patient, User])
  ],
  providers: [
    DatabaseSeeder,
    PatientSeeder,
    UserSeeder,
    {
      provide: DataSource,
      useFactory: async (): Promise<DataSource> => {
        const dataSource = new DataSource({
          type: 'postgres',
          host: process.env.DB_HOST,
          port: parseInt(process.env.DB_PORT || '5432'),
          database: process.env.DB_NAME,
          username: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          entities: [__dirname + '/../**/*.entity{.ts,.js}'],
          migrations: [__dirname + '/migrations/*{.ts,.js}'],
          synchronize: false
        })

        if (!dataSource.isInitialized) {
          await dataSource.initialize()
        }
        return dataSource
      }
    }
  ]
})
export class SeederModule {}
