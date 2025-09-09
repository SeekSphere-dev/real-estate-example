import { describe, it, expect, vi } from 'vitest';
import {
  AppError,
  DatabaseError,
  ValidationError,
  SeeksphereError,
  handleDatabaseError,
  handleSeeksphereError,
  handleValidationError,
  getSafeErrorMessage,
  logError,
  withRetry
} from '../error-handler';

describe('Error Handler', () => {
  describe('AppError', () => {
    it('should create error with all properties', () => {
      const error = new AppError('Test error', 'TEST_CODE', 400, { field: 'test' });
      
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
      expect(error.statusCode).toBe(400);
      expect(error.context).toEqual({ field: 'test' });
      expect(error.timestamp).toBeInstanceOf(Date);
    });

    it('should serialize to JSON correctly', () => {
      const error = new AppError('Test error', 'TEST_CODE', 400);
      const json = error.toJSON();
      
      expect(json.message).toBe('Test error');
      expect(json.code).toBe('TEST_CODE');
      expect(json.statusCode).toBe(400);
      expect(json.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('Specific Error Types', () => {
    it('should create DatabaseError with correct defaults', () => {
      const error = new DatabaseError('DB failed');
      
      expect(error.code).toBe('DATABASE_ERROR');
      expect(error.statusCode).toBe(500);
    });

    it('should create ValidationError with correct defaults', () => {
      const error = new ValidationError('Validation failed');
      
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.statusCode).toBe(400);
    });

    it('should create SeeksphereError with correct defaults', () => {
      const error = new SeeksphereError('Seeksphere failed');
      
      expect(error.code).toBe('SEEKSPHERE_ERROR');
      expect(error.statusCode).toBe(503);
    });
  });

  describe('Error Handlers', () => {
    it('should handle database errors', () => {
      const originalError = new Error('Connection failed');
      
      expect(() => handleDatabaseError(originalError, 'query')).toThrow(DatabaseError);
      
      try {
        handleDatabaseError(originalError, 'query');
      } catch (error) {
        expect(error).toBeInstanceOf(DatabaseError);
        expect((error as DatabaseError).message).toContain('Database query failed');
        expect((error as DatabaseError).context?.operation).toBe('query');
      }
    });

    it('should handle seeksphere errors', () => {
      const originalError = new Error('API failed');
      
      expect(() => handleSeeksphereError(originalError, 'search')).toThrow(SeeksphereError);
    });

    it('should handle validation errors', () => {
      expect(() => handleValidationError('email', 'invalid', 'must be valid email')).toThrow(ValidationError);
    });
  });

  describe('getSafeErrorMessage', () => {
    it('should return AppError message directly', () => {
      const error = new AppError('Safe error message');
      expect(getSafeErrorMessage(error)).toBe('Safe error message');
    });

    it('should sanitize connection errors', () => {
      const error = new Error('ECONNREFUSED connection failed');
      expect(getSafeErrorMessage(error)).toBe('Service temporarily unavailable. Please try again later.');
    });

    it('should sanitize timeout errors', () => {
      const error = new Error('Request timeout occurred');
      expect(getSafeErrorMessage(error)).toBe('Request timed out. Please try again.');
    });

    it('should return generic message for unknown errors', () => {
      expect(getSafeErrorMessage('unknown')).toBe('An unexpected error occurred. Please try again.');
    });
  });

  describe('logError', () => {
    it('should log error with context', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const error = new Error('Test error');
      const context = { userId: '123' };
      
      logError(error, context);
      
      expect(consoleSpy).toHaveBeenCalledWith('Application Error:', expect.objectContaining({
        message: 'Test error',
        context,
        timestamp: expect.any(String)
      }));
      
      consoleSpy.mockRestore();
    });
  });

  describe('withRetry', () => {
    it('should succeed on first attempt', async () => {
      const operation = vi.fn().mockResolvedValue('success');
      
      const result = await withRetry(operation, 3);
      
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and eventually succeed', async () => {
      const operation = vi.fn()
        .mockRejectedValueOnce(new Error('Attempt 1'))
        .mockRejectedValueOnce(new Error('Attempt 2'))
        .mockResolvedValue('success');
      
      const result = await withRetry(operation, 3, 10); // Short delay for testing
      
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(3);
    });

    it('should throw after max retries', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('Always fails'));
      
      await expect(withRetry(operation, 2, 10)).rejects.toThrow('Always fails');
      expect(operation).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });
  });
});