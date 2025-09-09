/**
 * Comprehensive error handling utilities for the application
 */

export interface ErrorDetails {
  message: string;
  code?: string;
  statusCode?: number;
  context?: Record<string, any>;
  timestamp: Date;
  stack?: string;
}

export class AppError extends Error {
  public readonly code?: string;
  public readonly statusCode: number;
  public readonly context?: Record<string, any>;
  public readonly timestamp: Date;

  constructor(
    message: string,
    code?: string,
    statusCode: number = 500,
    context?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.context = context;
    this.timestamp = new Date();

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  toJSON(): ErrorDetails {
    return {
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      context: this.context,
      timestamp: this.timestamp,
      stack: this.stack
    };
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'DATABASE_ERROR', 500, context);
    this.name = 'DatabaseError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'VALIDATION_ERROR', 400, context);
    this.name = 'ValidationError';
  }
}

export class SeeksphereError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'SEEKSPHERE_ERROR', 503, context);
    this.name = 'SeeksphereError';
  }
}

/**
 * Error handler utility functions
 */
export function handleDatabaseError(error: unknown, operation: string): never {
  const message = error instanceof Error ? error.message : 'Unknown database error';
  throw new DatabaseError(`Database ${operation} failed: ${message}`, {
    operation,
    originalError: error instanceof Error ? error.message : String(error)
  });
}

export function handleSeeksphereError(error: unknown, operation: string): never {
  const message = error instanceof Error ? error.message : 'Unknown seeksphere error';
  throw new SeeksphereError(`Seeksphere ${operation} failed: ${message}`, {
    operation,
    originalError: error instanceof Error ? error.message : String(error)
  });
}

export function handleValidationError(field: string, value: any, rule: string): never {
  throw new ValidationError(`Validation failed for field '${field}': ${rule}`, {
    field,
    value,
    rule
  });
}

/**
 * Safe error message extraction for user display
 */
export function getSafeErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    // Don't expose internal error details to users
    if (error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND')) {
      return 'Service temporarily unavailable. Please try again later.';
    }
    
    if (error.message.includes('timeout')) {
      return 'Request timed out. Please try again.';
    }
    
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Log error with context for debugging
 */
export function logError(error: unknown, context?: Record<string, any>): void {
  const errorDetails = {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    context,
    timestamp: new Date().toISOString()
  };
  
  console.error('Application Error:', errorDetails);
}

/**
 * Retry wrapper with exponential backoff
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: unknown;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        break;
      }
      
      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}