import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchLoading, SearchError, SearchTimeout } from '../search-loading';

describe('SearchLoading', () => {
  it('should render traditional search loading by default', () => {
    render(<SearchLoading />);
    
    expect(screen.getByText('Searching properties...')).toBeInTheDocument();
  });

  it('should render seeksphere search loading', () => {
    render(<SearchLoading type="seeksphere" />);
    
    expect(screen.getByText('Seeksphere is analyzing your search...')).toBeInTheDocument();
    expect(screen.getByText('Converting natural language to search query')).toBeInTheDocument();
  });

  it('should render custom message', () => {
    render(<SearchLoading message="Custom loading message" />);
    
    expect(screen.getByText('Custom loading message')).toBeInTheDocument();
  });

  it('should render skeleton cards by default', () => {
    const { container } = render(<SearchLoading />);
    
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should not render skeletons when showSkeletons is false', () => {
    const { container } = render(<SearchLoading showSkeletons={false} />);
    
    // Should only have the loading spinner, not property card skeletons
    const gridContainer = container.querySelector('.grid');
    expect(gridContainer).not.toBeInTheDocument();
  });

  it('should render custom number of skeletons', () => {
    const { container } = render(<SearchLoading skeletonCount={3} />);
    
    const propertyCards = container.querySelectorAll('.bg-white.rounded-lg.shadow-md');
    expect(propertyCards).toHaveLength(3);
  });

  it('should show seeksphere-specific animation', () => {
    render(<SearchLoading type="seeksphere" />);
    
    const animatedDots = screen.getAllByRole('generic').filter(el => 
      el.classList.contains('animate-bounce')
    );
    expect(animatedDots).toHaveLength(3);
  });
});

describe('SearchError', () => {
  it('should render traditional search error by default', () => {
    render(<SearchError error="Search failed" />);
    
    expect(screen.getByText('Search Failed')).toBeInTheDocument();
    expect(screen.getByText('Search failed')).toBeInTheDocument();
  });

  it('should render seeksphere search error', () => {
    render(<SearchError error="Seeksphere API error" type="seeksphere" />);
    
    expect(screen.getByText('Seeksphere Search Failed')).toBeInTheDocument();
    expect(screen.getByText('Seeksphere API error')).toBeInTheDocument();
  });

  it('should render retry button when onRetry is provided', () => {
    const onRetry = vi.fn();
    render(<SearchError error="Error" onRetry={onRetry} />);
    
    const retryButton = screen.getByText('Try Again');
    expect(retryButton).toBeInTheDocument();
    
    fireEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalled();
  });

  it('should render fallback button when available', () => {
    const onFallback = vi.fn();
    render(
      <SearchError 
        error="Seeksphere failed" 
        type="seeksphere"
        onFallback={onFallback}
        fallbackAvailable={true}
      />
    );
    
    const fallbackButton = screen.getByText('Use Traditional Search');
    expect(fallbackButton).toBeInTheDocument();
    
    fireEvent.click(fallbackButton);
    expect(onFallback).toHaveBeenCalled();
  });

  it('should show fallback message for seeksphere errors', () => {
    render(
      <SearchError 
        error="API error" 
        type="seeksphere"
        fallbackAvailable={true}
      />
    );
    
    expect(screen.getByText("Don't worry - we can still search using traditional filters")).toBeInTheDocument();
  });

  it('should not render fallback button when not available', () => {
    render(
      <SearchError 
        error="Error" 
        type="seeksphere"
        fallbackAvailable={false}
      />
    );
    
    expect(screen.queryByText('Use Traditional Search')).not.toBeInTheDocument();
  });
});

describe('SearchTimeout', () => {
  it('should render timeout message', () => {
    render(<SearchTimeout />);
    
    expect(screen.getByText('Search Taking Longer Than Expected')).toBeInTheDocument();
    expect(screen.getByText('The search is taking longer than usual. This might be due to high server load.')).toBeInTheDocument();
  });

  it('should render retry button when onRetry is provided', () => {
    const onRetry = vi.fn();
    render(<SearchTimeout onRetry={onRetry} />);
    
    const retryButton = screen.getByText('Try Again');
    expect(retryButton).toBeInTheDocument();
    
    fireEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalled();
  });

  it('should not render retry button when onRetry is not provided', () => {
    render(<SearchTimeout />);
    
    expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
  });
});