'use client';

import { useState, useCallback } from 'react';

export interface ErrorState {
  error: string | null;
  isError: boolean;
  errorCode?: string;
  retryCount: number;
}

export interface ErrorHandlerOptions {
  maxRetries?: number;
  onError?: (error: Error) => void;
  onRetry?: () => void;
  fallbackMessage?: string;
}

export function useErrorHandler(options: ErrorHandlerOptions = {}) {
  const {
    maxRetries = 3,
    onError,
    onRetry,
    fallbackMessage = 'An unexpected error occurred'
  } = options;

  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isError: false,
    retryCount: 0
  });

  const handleError = useCallback((error: unknown, errorCode?: string) => {
    const errorMessage = error instanceof Error 
      ? error.message 
      : typeof error === 'string' 
        ? error 
        : fallbackMessage;

    setErrorState(prev => ({
      error: errorMessage,
      isError: true,
      errorCode,
      retryCount: prev.retryCount
    }));

    if (onError && error instanceof Error) {
      onError(error);
    }
  }, [onError, fallbackMessage]);

  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      isError: false,
      retryCount: 0
    });
  }, []);

  const retry = useCallback(() => {
    if (errorState.retryCount < maxRetries) {
      setErrorState(prev => ({
        ...prev,
        retryCount: prev.retryCount + 1,
        error: null,
        isError: false
      }));
      
      if (onRetry) {
        onRetry();
      }
    }
  }, [errorState.retryCount, maxRetries, onRetry]);

  const canRetry = errorState.retryCount < maxRetries;

  return {
    ...errorState,
    handleError,
    clearError,
    retry,
    canRetry
  };
}

// Specialized hook for API errors
export function useApiErrorHandler(options: ErrorHandlerOptions = {}) {
  const errorHandler = useErrorHandler(options);

  const handleApiError = useCallback((error: unknown, response?: Response) => {
    let errorMessage = 'API request failed';
    let errorCode: string | undefined;

    if (response) {
      errorCode = response.status.toString();
      
      switch (response.status) {
        case 400:
          errorMessage = 'Invalid request parameters';
          break;
        case 401:
          errorMessage = 'Authentication required';
          break;
        case 403:
          errorMessage = 'Access denied';
          break;
        case 404:
          errorMessage = 'Resource not found';
          break;
        case 429:
          errorMessage = 'Too many requests. Please try again later';
          break;
        case 500:
          errorMessage = 'Server error. Please try again';
          break;
        case 503:
          errorMessage = 'Service temporarily unavailable';
          break;
        default:
          errorMessage = `Request failed with status ${response.status}`;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    errorHandler.handleError(errorMessage, errorCode);
  }, [errorHandler]);

  return {
    ...errorHandler,
    handleApiError
  };
}

// Hook for search-specific error handling
export function useSearchErrorHandler() {
  const [searchState, setSearchState] = useState({
    isLoading: false,
    hasTimedOut: false,
    fallbackUsed: false
  });

  const errorHandler = useApiErrorHandler({
    fallbackMessage: 'Search failed. Please try again.',
    maxRetries: 2
  });

  const setLoading = useCallback((loading: boolean) => {
    setSearchState(prev => ({ ...prev, isLoading: loading }));
  }, []);

  const setTimedOut = useCallback((timedOut: boolean) => {
    setSearchState(prev => ({ ...prev, hasTimedOut: timedOut }));
  }, []);

  const setFallbackUsed = useCallback((used: boolean) => {
    setSearchState(prev => ({ ...prev, fallbackUsed: used }));
  }, []);

  const handleSearchError = useCallback((error: unknown, options?: {
    isTimeout?: boolean;
    fallbackAvailable?: boolean;
  }) => {
    const { isTimeout = false, fallbackAvailable = false } = options || {};

    if (isTimeout) {
      setTimedOut(true);
      errorHandler.handleError('Search is taking longer than expected');
    } else {
      errorHandler.handleApiError(error);
    }

    setLoading(false);
  }, [errorHandler, setLoading, setTimedOut]);

  const resetSearch = useCallback(() => {
    setSearchState({
      isLoading: false,
      hasTimedOut: false,
      fallbackUsed: false
    });
    errorHandler.clearError();
  }, [errorHandler]);

  return {
    ...errorHandler,
    ...searchState,
    setLoading,
    setTimedOut,
    setFallbackUsed,
    handleSearchError,
    resetSearch
  };
}