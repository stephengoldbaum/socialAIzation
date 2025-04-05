/**
 * Error handling middleware for the Metaverse Social Practice backend
 * 
 * This middleware provides consistent error handling for all routes.
 */

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError, ErrorResponse, ValidationError, normalizeError } from '../utils/errors';
import { ILoggerService } from '../services/logger.service';
import container from '../di/container';
import TYPES from '../di/types';
import { z } from 'zod';

/**
 * Global error handler middleware
 */
export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  const logger = container.get<ILoggerService>(TYPES.LoggerService);
  
  // Default to internal server error
  const appError = err instanceof AppError
    ? err
    : new AppError('Internal server error', 500, 'INTERNAL_ERROR');

  // Log error based on severity
  if (appError.statusCode >= 500) {
    logger.error(`[${req.method}] ${req.path} - ${appError.message}`, {
      error: err,
      stack: err.stack,
      statusCode: appError.statusCode,
      params: req.validatedParams || req.params,
      query: req.validatedQuery || req.query
    });
  } else {
    logger.warn(`[${req.method}] ${req.path} - ${appError.message}`, {
      statusCode: appError.statusCode,
      error: err.message,
      params: req.validatedParams || req.params,
      query: req.validatedQuery || req.query
    });
  }

  // Prepare response
  const response: ErrorResponse = {
    error: {
      message: appError.message,
      code: appError.code || 'UNKNOWN_ERROR',
      statusCode: appError.statusCode
    }
  };

  // Add validation errors if available
  if (appError.validationErrors) {
    response.error.validationErrors = appError.validationErrors;
  }

  // Send response
  res.status(appError.statusCode).json(response);
}

/**
 * Wraps async route handlers to catch errors
 * @param fn Async route handler
 */
export function asyncErrorHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
  };
}

/**
 * Validates request body against a Zod schema
 * @param schema Zod schema
 */
export function validateBody<T>(schema: z.ZodType<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Parse and validate request body
      const validatedBody = schema.parse(req.body);
      
      // Attach validated body to request
      req.validatedBody = validatedBody;
      
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        next(new AppError('Validation error', 400, 'VALIDATION_ERROR', error.errors));
      } else {
        next(error);
      }
    }
  };
}

/**
 * Validates request query against a Zod schema
 * @param schema Zod schema
 */
export function validateQuery<T>(schema: z.ZodType<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Parse and validate request query
      const validatedQuery = schema.parse(req.query);
      
      // Attach validated query to request
      req.validatedQuery = validatedQuery;
      
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        next(new AppError('Validation error', 400, 'VALIDATION_ERROR', error.errors));
      } else {
        next(error);
      }
    }
  };
}

/**
 * Validates request params against a Zod schema
 * @param schema Zod schema
 */
export function validateParams<T>(schema: z.ZodType<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Parse and validate request params
      const validatedParams = schema.parse(req.params);
      
      // Attach validated params to request
      req.validatedParams = validatedParams;
      
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        next(new AppError('Validation error', 400, 'VALIDATION_ERROR', error.errors));
      } else {
        next(error);
      }
    }
  };
}

/**
 * 404 Not Found middleware
 */
export function notFoundHandler(req: Request, res: Response, next: NextFunction) {
  const error = new AppError(`Not found - ${req.originalUrl}`, 404, 'NOT_FOUND');
  next(error);
}
