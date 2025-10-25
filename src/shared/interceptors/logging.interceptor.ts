import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor
} from '@nestjs/common'
import { Observable, throwError } from 'rxjs'
import { catchError, tap } from 'rxjs/operators'

import { isEmptyObject } from '@/shared/utils.helper'

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  protected readonly logger = new Logger(this.constructor.name)

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest()
    const { body } = request
    const userAgent = request.get('user-agent') || ''
    const { ip, method, path: url } = request
    const now = Date.now()

    this.logger.log(
      `${method} ${url} ${context.getClass().name} ${
        context.getHandler().name
      } - [${userAgent}] ${ip}`
    )

    if (!isEmptyObject(body)) {
      this.logger.debug({ body })
    }

    return next.handle().pipe(
      tap(res => {
        const response = context.switchToHttp().getResponse()
        const { statusCode } = response
        const contentLength = response.get('content-length') ?? ''

        this.logger.log(
          `${method} ${statusCode} ${url} ${contentLength} - [${userAgent}] ${ip}: ${
            Date.now() - now
          }ms`
        )

        this.logger.debug({ res })
      }),
      catchError(error => {
        this.logger.error(
          `${method} ${error.status} ${url} - [${userAgent}] ${ip}: ${
            Date.now() - now
          }ms`
        )
        return throwError(() => {
          return error
        })
      })
    )
  }
}