import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner, LoadingState, Skeleton, PropertyCardSkeleton } from '../loading';

describe('LoadingSpinner', () => {
  it('should render with default size', () => {
    render(<LoadingSpinner />);
    
    const spinner = screen.getByRole('generic');
    expect(spinner).toHaveClass('w-8', 'h-8', 'animate-spin');
  });

  it('should render with small size', () => {
    render(<LoadingSpinner size="sm" />);
    
    const spinner = screen.getByRole('generic');
    expect(spinner).toHaveClass('w-4', 'h-4');
  });

  it('should render with large size', () => {
    render(<LoadingSpinner size="lg" />);
    
    const spinner = screen.getByRole('generic');
    expect(spinner).toHaveClass('w-12', 'h-12');
  });

  it('should apply custom className', () => {
    render(<LoadingSpinner className="custom-class" />);
    
    const spinner = screen.getByRole('generic');
    expect(spinner).toHaveClass('custom-class');
  });
});

describe('LoadingState', () => {
  it('should render with default message', () => {
    render(<LoadingState />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should render with custom message', () => {
    render(<LoadingState message="Searching properties..." />);
    
    expect(screen.getByText('Searching properties...')).toBeInTheDocument();
  });

  it('should include loading spinner', () => {
    render(<LoadingState />);
    
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(<LoadingState className="custom-loading" />);
    
    expect(container.firstChild).toHaveClass('custom-loading');
  });
});

describe('Skeleton', () => {
  it('should render with default classes', () => {
    render(<Skeleton />);
    
    const skeleton = screen.getByRole('generic');
    expect(skeleton).toHaveClass('animate-pulse', 'bg-gray-200', 'rounded');
  });

  it('should apply custom className', () => {
    render(<Skeleton className="custom-skeleton" />);
    
    const skeleton = screen.getByRole('generic');
    expect(skeleton).toHaveClass('custom-skeleton');
  });

  it('should apply custom width and height styles', () => {
    render(<Skeleton width="100px" height="50px" />);
    
    const skeleton = screen.getByRole('generic');
    expect(skeleton).toHaveStyle({ width: '100px', height: '50px' });
  });
});

describe('PropertyCardSkeleton', () => {
  it('should render property card skeleton structure', () => {
    const { container } = render(<PropertyCardSkeleton />);
    
    // Should have main container
    expect(container.querySelector('.bg-white.rounded-lg.shadow-md')).toBeInTheDocument();
    
    // Should have image skeleton
    expect(container.querySelector('.w-full.h-48')).toBeInTheDocument();
    
    // Should have content skeletons
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(1);
  });

  it('should have proper structure for property card layout', () => {
    const { container } = render(<PropertyCardSkeleton />);
    
    // Should have padding container
    expect(container.querySelector('.p-4')).toBeInTheDocument();
    
    // Should have flex container for price and details
    expect(container.querySelector('.flex.justify-between.items-center')).toBeInTheDocument();
  });
});