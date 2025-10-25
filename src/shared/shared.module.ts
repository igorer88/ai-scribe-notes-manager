import {
  Global,
  Module,
  Scope,
  ClassSerializerInterceptor
} from '@nestjs/common'
import { APP_INTERCEPTOR } from '@nestjs/core'

import { LoggingInterceptor } from './interceptors'

@Global()
@Module({
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
  ]
})
export class SharedModule {}
