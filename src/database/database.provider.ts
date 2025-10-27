import { DynamicModule } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm'

import { Environment } from '@/config'

export const databaseProviders: DynamicModule[] = [
  TypeOrmModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: async (
      configService: ConfigService
    ): Promise<TypeOrmModuleOptions> => {
      const isProduction =
        configService.get<string>('api.environment') === Environment.Production

      const commonOptions = {
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
        synchronize: !isProduction,
        autoLoadEntities: true,
        retryAttempts: isProduction ? 10 : 3, // More retries in production
        retryDelay: 3000, // 3 seconds delay between retries
        connectTimeoutMS: 10000, // 10 seconds connection timeout
        acquireTimeoutMS: 30000, // 30 seconds acquire timeout
        timeout: 30000 // 30 seconds query timeout
      }

      const specificOptions: TypeOrmModuleOptions = {
        ...commonOptions,
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        database: configService.get<string>('DB_NAME'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        ssl: false, // Disable SSL for Docker environment
        uuidExtension: 'pgcrypto'
      }

      return specificOptions
    }
  })
]
