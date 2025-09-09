import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useErrorHandler, useApiErrorHandler, useSearchErrorHandler } from '../useErrorHandler';

describe('useErrorHandler', () => {
  it('should initialize with no error', () => {
    const { result } = renderHook(() => useErrorHandler());

    expect(result.current.error).toBeNull();
    expect(result.current.isError).toBe(false);
    expect(result.current.retryCount).toBe(0);
    expect(result.current.canRetry).toBe(true);
  });

  it('should handle Error objects', () => {
    const { result } = renderHook(() => useErrorHandler());
    const testError = new Error('Test error message');

    act(() => {
      result.current.handleError(testError);
    });

    expect(result.current.error).toBe('Test error message');
    expect(result.current.isError).toBe(true);
  });

  it('should handle string errors', () => {
    const { result } = renderHook(() => useErrorHandler());

    act(() => {
      result.current.handleError('String error message');
    });

    expect(result.current.error).toBe('String error message');
    expect(result.current.isError).toBe(true);
  });

  it('should use fallback message for unknown error types', () => {
    const { result } = renderHook(() => 
      useErrorHandler({ fallbackMessage: 'Custom fallback' })
    );

    act(() => {
      result.current.handleError({ unknown: 'object' });
    });

    expect(result.current.error).toBe('Custom fallback');
    expect(result.current.isError).toBe(true);
  });

  it('should call onError callback', () => {
    const onError = vi.fn();
    const { result } = renderHook(() => useErrorHandler({ onError }));
    const testError = new Error('Test error');

    act(() => {
      result.current.handleError(testError);
    });

    expect(onError).toHaveBeenCalledWith(testError);
  });

  it('should clear error state', () => {
    const { result } = renderHook(() => useErrorHandler());

    act(() => {
      result.current.handleError('Test error');
    });

    expect(result.current.isError).toBe(true);

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.isError).toBe(false);
    expect(result.current.retryCount).toBe(0);
  });

  it('should handle retry functionality', () => {
    const onRetry = vi.fn();
    const { result } = renderHook(() => 
      useErrorHandler({ maxRetries: 2, onRetry })
    );

    act(() => {
      result.current.handleError('Test error');
    });

    expect(result.current.retryCount).toBe(0);
    expect(result.current.canRetry).toBe(true);

    act(() => {
      result.current.retry();
    });

    expect(result.current.retryCount).toBe(1);
    expect(result.current.isError).toBe(false);
    expect(onRetry).toHaveBeenCalled();
  });

  it('should respect max retry limit', () => {
    const onRetry = vi.fn();
    const { result } = renderHook(() => 
      useErrorHandler({ maxRetries: 1, onRetry })
    );

    act(() => {
      result.current.handleError('Test error');
    });

    // First retry
    act(() => {
      result.current.retry();
    });

    expect(result.current.retryCount).toBe(1);
    expect(result.current.canRetry).toBe(false);

    // Second retry should not work
    act(() => {
      result.current.retry();
    });

    expect(result.current.retryCount).toBe(1);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});

describe('useApiErrorHandler', () => {
  it('should handle API errors with response status', () => {
    const { result } = renderHook(() => useApiErrorHandler());
    const mockResponse = { status: 404 } as Response;

    act(() => {
      result.current.handleApiError('Not found', mockResponse);
    });

    expect(result.current.error).toBe('Resource not found');
    expect(result.current.errorCode).toBe('404');
  });

  it('should handle different HTTP status codes', () => {
    const { result } = renderHook(() => useApiErrorHandler());

    const testCases = [
      { status: 400, expectedMessage: 'Invalid request parameters' },
      { status: 401, expectedMessage: 'Authentication required' },
      { status: 403, expectedMessage: 'Access denied' },
      { status: 429, expectedMessage: 'Too many requests. Please try again later' },
      { status: 500, expectedMessage: 'Server error. Please try again' },
      { status: 503, expectedMessage: 'Service temporarily unavailable' },
    ];

    testCases.forEach(({ status, expectedMessage }) => {
      const mockResponse = { status } as Response;

      act(() => {
        result.current.handleApiError('Error', mockResponse);
      });

      expect(result.current.error).toBe(expectedMessage);
      expect(result.current.errorCode).toBe(status.toString());

      act(() => {
        result.current.clearError();
      });
    });
  });

  it('should handle errors without response', () => {
    const { result } = renderHook(() => useApiErrorHandler());
    const testError = new Error('Network error');

    act(() => {
      result.current.handleApiError(testError);
    });

    expect(result.current.error).toBe('Network error');
    expect(result.current.errorCode).toBeUndefined();
  });
});

describe('useSearchErrorHandler', () => {
  it('should initialize with default search state', () => {
    const { result } = renderHook(() => useSearchErrorHandler());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.hasTimedOut).toBe(false);
    expect(result.current.fallbackUsed).toBe(false);
    expect(result.current.isError).toBe(false);
  });

  it('should handle loading state', () => {
    const { result } = renderHook(() => useSearchErrorHandler());

    act(() => {
      result.current.setLoading(true);
    });

    expect(result.current.isLoading).toBe(true);

    act(() => {
      result.current.setLoading(false);
    });

    expect(result.current.isLoading).toBe(false);
  });

  it('should handle timeout errors', () => {
    const { result } = renderHook(() => useSearchErrorHandler());

    act(() => {
      result.current.setLoading(true);
    });

    act(() => {
      result.current.handleSearchError('Timeout', { isTimeout: true });
    });

    expect(result.current.hasTimedOut).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('Search is taking longer than expected');
  });

  it('should handle regular search errors', () => {
    const { result } = renderHook(() => useSearchErrorHandler());

    act(() => {
      result.current.setLoading(true);
    });

    act(() => {
      result.current.handleSearchError(new Error('Search failed'));
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(true);
    expect(result.current.error).toBe('Search failed');
  });

  it('should reset search state', () => {
    const { result } = renderHook(() => useSearchErrorHandler());

    act(() => {
      result.current.setLoading(true);
      result.current.setTimedOut(true);
      result.current.setFallbackUsed(true);
      result.current.handleSearchError('Error');
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.hasTimedOut).toBe(true);
    expect(result.current.fallbackUsed).toBe(true);
    expect(result.current.isError).toBe(true);

    act(() => {
      result.current.resetSearch();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.hasTimedOut).toBe(false);
    expect(result.current.fallbackUsed).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle fallback usage', () => {
    const { result } = renderHook(() => useSearchErrorHandler());

    act(() => {
      result.current.setFallbackUsed(true);
    });

    expect(result.current.fallbackUsed).toBe(true);
  });
});