import { DynamicModule } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm'

import { Environment } from '@/config'

import { getDatabaseCredentials } from './database.connector'

export const databaseProviders: DynamicModule[] = [
  TypeOrmModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: async (
      configService: ConfigService
    ): Promise<TypeOrmModuleOptions> => {
      const environment = configService.get<string>('api.environment')
      const isDevelopment = environment === Environment.Development
      const isStaging = environment === Environment.Staging

      const commonOptions = {
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
        synchronize: isDevelopment,
        autoLoadEntities: true,
        retryAttempts: isDevelopment || isStaging ? 3 : 10, // More retries in production
        retryDelay: 3000, // 3 seconds delay between retries
        connectTimeoutMS: 10000, // 10 seconds connection timeout
        acquireTimeoutMS: 30000, // 30 seconds acquire timeout
        timeout: 30000 // 30 seconds query timeout
      }

      const credentials = getDatabaseCredentials(process.env)

      const specificOptions: TypeOrmModuleOptions = {
        ...commonOptions,
        type: 'postgres',
        host: credentials.host,
        port: credentials.port,
        database: credentials.database,
        username: credentials.username,
        password: credentials.password,
        ssl: credentials.ssl
      }

      return specificOptions
    }
  })
]
