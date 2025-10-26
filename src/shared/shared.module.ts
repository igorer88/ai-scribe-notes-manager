import {
  Global,
  Module,
  Scope,
  ClassSerializerInterceptor
} from '@nestjs/common'
import { APP_INTERCEPTOR } from '@nestjs/core'

import { FileStorageModule } from './file-storage/file-storage.module'
import { LoggingInterceptor } from './interceptors'

@Global()
@Module({
  imports: [FileStorageModule],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      scope: Scope.REQUEST,
      useClass: LoggingInterceptor
    },
    {
      provide: APP_INTERCEPTOR,
      scope: Scope.REQUEST,
      useClass: ClassSerializerInterceptor
    }
  ],
  exports: [FileStorageModule]
})
export class SharedModule {}
