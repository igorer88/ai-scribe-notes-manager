import { join } from 'node:path'

import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { ServeStaticModule } from '@nestjs/serve-static'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'

import {
  aiConfig,
  apiConfig,
  dbConfig,
  storageConfig,
  getValidationSchema
} from './config'
import { DatabaseModule } from './database/database.module'
import { DomainModule } from './domain/domain.module'
import { SharedModule } from './shared/shared.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: getValidationSchema(),
      load: [aiConfig, apiConfig, dbConfig, storageConfig],
      isGlobal: true,
      cache: true
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'web', 'dist'),
      exclude: ['^/api']
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          ttl: configService.getOrThrow<number>('api.throttle.ttl'),
          limit: configService.getOrThrow<number>('api.throttle.limit')
        }
      ]
    }),
    SharedModule,
    DatabaseModule,
    DomainModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    }
  ]
})
export class AppModule {
  static port: number
  static secretKey: string
  static environment: string

  constructor(private readonly configService: ConfigService) {
    AppModule.environment = this.configService.get('api.environment') as string
    AppModule.port = this.configService.get('api.port') as number
    AppModule.secretKey = this.configService.get('api.secretKey') as string
  }
}
