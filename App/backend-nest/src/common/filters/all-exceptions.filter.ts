import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Global exception filter that implements strict fail-fast error handling
 * - All exceptions are caught and transformed into consistent error responses
 * - Detailed error information is included in development but limited in production
 * - All errors are properly logged
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    // Determine HTTP status code
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    
    // Get error message
    let message = 'Internal server error';
    let details: any = null;
    
    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      message = exception.message;
      
      if (typeof exceptionResponse === 'object') {
        details = exceptionResponse;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      
      // Include stack trace in development only
      if (process.env.NODE_ENV !== 'production') {
        details = {
          stack: exception.stack,
        };
      }
    }
    
    // Log the error
    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    );
    
    // Send error response
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      ...(details && process.env.NODE_ENV !== 'production' ? { details } : {}),
    };
    
    response.status(status).json(errorResponse);
  }
}
