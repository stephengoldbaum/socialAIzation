/**
 * Standardized error handling system for the Metaverse Social Practice backend
 * 
 * This module provides a set of standardized error classes and utilities
 * for consistent error handling across the application.
 */

/**
 * Error response interface for API responses
 */
export interface ErrorResponse {
  error: {
    message: string;
    code: string;
    statusCode: number;
    validationErrors?: any[];
  }
}

// Base application error class
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  code?: string;
  validationErrors?: any[];
  
  constructor(message: string, statusCode: number, code?: string, validationErrors?: any[], isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;
    this.validationErrors = validationErrors;
    
    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
    
    // Set the prototype explicitly
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// HTTP error classes
export class BadRequestError extends AppError {
  constructor(message = 'Bad request', code = 'BAD_REQUEST') {
    super(message, 400, code);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', code = 'UNAUTHORIZED') {
    super(message, 401, code);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', code = 'FORBIDDEN') {
    super(message, 403, code);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', code = 'NOT_FOUND') {
    super(message, 404, code);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict', code = 'CONFLICT') {
    super(message, 409, code);
  }
}

export class ValidationError extends BadRequestError {
  errors: any[];
  
  constructor(message = 'Validation error', errors: any[] = [], code = 'VALIDATION_ERROR') {
    super(message, code);
    this.errors = errors;
    this.validationErrors = errors;
  }
}

// Database error classes
export class DatabaseError extends AppError {
  constructor(message = 'Database error', code = 'DATABASE_ERROR', isOperational = true) {
    super(message, 500, code, undefined, isOperational);
  }
}

// Service error classes
export class ServiceError extends AppError {
  constructor(message = 'Service error', statusCode = 500, code = 'SERVICE_ERROR') {
    super(message, statusCode, code);
  }
}

// External service error
export class ExternalServiceError extends AppError {
  constructor(message = 'External service error', code = 'EXTERNAL_SERVICE_ERROR') {
    super(message, 502, code);
  }
}

/**
 * Converts any error to an AppError
 * @param error Any error object
 * @returns AppError instance
 */
export function normalizeError(error: any): AppError {
  if (error instanceof AppError) {
    return error;
  }
  
  // Handle Zod validation errors
  if (error.name === 'ZodError') {
    return new ValidationError('Validation error', error.errors, 'VALIDATION_ERROR');
  }
  
  // Handle MongoDB errors
  if (error.name === 'MongoError' || error.name === 'MongoServerError') {
    return new DatabaseError(error.message, 'DATABASE_ERROR', true);
  }
  
  // Handle other errors
  return new AppError(error.message || 'Unknown error', 500, 'INTERNAL_ERROR', undefined, false);
}
