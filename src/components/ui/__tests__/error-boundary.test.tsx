import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary, ErrorMessage, SearchError } from '../error-boundary';

// Component that throws an error for testing
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('ErrorBoundary', () => {
  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('should render error UI when there is an error', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('should render custom fallback when provided', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const customFallback = <div>Custom error UI</div>;

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error UI')).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('should call onError callback when error occurs', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const onError = vi.fn();

    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String)
      })
    );

    consoleSpy.mockRestore();
  });

  it('should reset error state when retry button is clicked', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Try Again'));

    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});

describe('ErrorMessage', () => {
  it('should render error message with default title', () => {
    render(<ErrorMessage message="Something went wrong" />);

    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('should render error message with custom title', () => {
    render(<ErrorMessage title="Custom Error" message="Custom message" />);

    expect(screen.getByText('Custom Error')).toBeInTheDocument();
    expect(screen.getByText('Custom message')).toBeInTheDocument();
  });

  it('should render retry button when onRetry is provided', () => {
    const onRetry = vi.fn();
    render(<ErrorMessage message="Error occurred" onRetry={onRetry} />);

    const retryButton = screen.getByText('Retry');
    expect(retryButton).toBeInTheDocument();

    fireEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalled();
  });

  it('should not render retry button when onRetry is not provided', () => {
    render(<ErrorMessage message="Error occurred" />);

    expect(screen.queryByText('Retry')).not.toBeInTheDocument();
  });
});

describe('SearchError', () => {
  it('should render search error with default message', () => {
    render(<SearchError />);

    expect(screen.getByText('Search Error')).toBeInTheDocument();
    expect(screen.getByText('Unable to load search results')).toBeInTheDocument();
  });

  it('should render search error with custom message', () => {
    render(<SearchError message="Custom search error" />);

    expect(screen.getByText('Custom search error')).toBeInTheDocument();
  });

  it('should render retry button when onRetry is provided', () => {
    const onRetry = vi.fn();
    render(<SearchError onRetry={onRetry} />);

    const retryButton = screen.getByText('Try Again');
    expect(retryButton).toBeInTheDocument();

    fireEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalled();
  });

  it('should render clear filters button when onClearFilters is provided', () => {
    const onClearFilters = vi.fn();
    render(<SearchError onClearFilters={onClearFilters} />);

    const clearButton = screen.getByText('Clear Filters');
    expect(clearButton).toBeInTheDocument();

    fireEvent.click(clearButton);
    expect(onClearFilters).toHaveBeenCalled();
  });

  it('should render both buttons when both callbacks are provided', () => {
    const onRetry = vi.fn();
    const onClearFilters = vi.fn();
    render(<SearchError onRetry={onRetry} onClearFilters={onClearFilters} />);

    expect(screen.getByText('Try Again')).toBeInTheDocument();
    expect(screen.getByText('Clear Filters')).toBeInTheDocument();
  });
});