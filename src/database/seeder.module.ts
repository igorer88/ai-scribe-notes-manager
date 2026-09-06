import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DataSource } from 'typeorm'

import { Patient } from '@/domain/patient/entities/patient.entity'
import { User } from '@/domain/user/entities/user.entity'

import { getDatabaseCredentials } from './database.connector'
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
        const credentials = getDatabaseCredentials(process.env)

        const dataSource = new DataSource({
          type: 'postgres',
          host: credentials.host,
          port: credentials.port,
          database: credentials.database,
          username: credentials.username,
          password: credentials.password,
          ssl: credentials.ssl,
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
