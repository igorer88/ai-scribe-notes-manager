import {
  Global,
  Module,
  Scope,
  ClassSerializerInterceptor
} from '@nestjs/common'
import { APP_INTERCEPTOR } from '@nestjs/core'

import { AiProcessingModule } from './ai-processing/ai-processing.module'
import { FileStorageModule } from './file-storage/file-storage.module'
import { LoggingInterceptor } from './interceptors'

@Global()
@Module({
  imports: [FileStorageModule, AiProcessingModule],
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
  exports: [FileStorageModule, AiProcessingModule]
})
export class SharedModule {}
