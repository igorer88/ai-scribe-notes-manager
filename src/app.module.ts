import { join } from 'node:path'

import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { ServeStaticModule } from '@nestjs/serve-static'

import {
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
      load: [apiConfig, dbConfig, storageConfig],
      isGlobal: true,
      cache: true
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'web')
    }),
    SharedModule,
    DatabaseModule,
    DomainModule
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
