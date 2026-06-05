import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import type { Request, Response } from 'express'
import { ApiResponse } from '../utils/api-response'

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name)

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    const isHttpException = exception instanceof HttpException
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR

    const payload = isHttpException ? exception.getResponse() : null
    const message = this.resolveMessage(payload, exception)

    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} -> ${status} ${message}`,
        exception instanceof Error ? exception.stack : undefined,
      )
    }

    response.status(status).json(ApiResponse.success(null, message, status))
  }

  private resolveMessage(payload: string | object | null, exception: unknown) {
    if (typeof payload === 'string' && payload.trim()) {
      return payload
    }

    if (payload && typeof payload === 'object') {
      const record = payload as Record<string, unknown>
      const message = record.message

      if (Array.isArray(message)) {
        return message.join('；')
      }

      if (typeof message === 'string' && message.trim()) {
        return message
      }

      if (typeof record.error === 'string' && record.error.trim()) {
        return record.error
      }
    }

    if (exception instanceof Error && exception.message.trim()) {
      return exception.message
    }

    return '服务器内部错误'
  }
}
