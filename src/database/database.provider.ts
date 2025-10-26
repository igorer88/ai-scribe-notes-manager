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
        autoLoadEntities: true
      }

      const specificOptions: TypeOrmModuleOptions = {
        ...commonOptions,
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        database: configService.get<string>('DB_NAME'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        ssl: isProduction,
        uuidExtension: 'pgcrypto'
      }

      return specificOptions
    }
  })
]
