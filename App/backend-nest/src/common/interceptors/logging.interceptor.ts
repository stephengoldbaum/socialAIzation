import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

/**
 * Global logging interceptor
 * - Logs all incoming requests and outgoing responses
 * - Tracks request duration
 * - Provides consistent logging format
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const { method, url, ip } = request;
    
    const userAgent = request.get('user-agent') || 'unknown';
    const startTime = Date.now();
    
    return next.handle().pipe(
      tap({
        next: () => {
          const responseTime = Date.now() - startTime;
          const { statusCode } = response;
          
          this.logger.log(
            `${method} ${url} ${statusCode} ${responseTime}ms - ${ip} - ${userAgent}`,
          );
        },
        error: (error) => {
          const responseTime = Date.now() - startTime;
          
          this.logger.error(
            `${method} ${url} ERROR ${responseTime}ms - ${ip} - ${userAgent}`,
            error.stack,
          );
        },
      }),
    );
  }
}
