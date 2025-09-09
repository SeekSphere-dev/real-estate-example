'use client';

import { LoadingSpinner, PropertyCardSkeleton } from '@/components/ui/loading';
import { Search, Zap } from 'lucide-react';

interface SearchLoadingProps {
  type?: 'traditional' | 'seeksphere';
  message?: string;
  showSkeletons?: boolean;
  skeletonCount?: number;
}

export function SearchLoading({ 
  type = 'traditional', 
  message,
  showSkeletons = true,
  skeletonCount = 6
}: SearchLoadingProps) {
  const defaultMessage = type === 'seeksphere' 
    ? 'Seeksphere is analyzing your search...' 
    : 'Searching properties...';

  return (
    <div className="space-y-6">
      {/* Loading Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-center space-x-3">
          {type === 'seeksphere' ? (
            <Zap className="w-6 h-6 text-blue-600 animate-pulse" />
          ) : (
            <Search className="w-6 h-6 text-blue-600" />
          )}
          <LoadingSpinner size="md" />
          <p className="text-gray-600 font-medium">
            {message || defaultMessage}
          </p>
        </div>
        
        {type === 'seeksphere' && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center space-x-2 text-sm text-gray-500">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <span>Converting natural language to search query</span>
            </div>
          </div>
        )}
      </div>

      {/* Skeleton Results */}
      {showSkeletons && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: skeletonCount }, (_, i) => (
            <PropertyCardSkeleton key={i} />
          ))}
        </div>
      )}
    </div>
  );
}

interface SearchErrorProps {
  error: string;
  type?: 'traditional' | 'seeksphere';
  onRetry?: () => void;
  onFallback?: () => void;
  fallbackAvailable?: boolean;
}

export function SearchError({ 
  error, 
  type = 'traditional', 
  onRetry, 
  onFallback,
  fallbackAvailable = false
}: SearchErrorProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-8">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <Search className="w-8 h-8 text-red-600" />
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {type === 'seeksphere' ? 'Seeksphere Search Failed' : 'Search Failed'}
        </h3>
        
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          {error}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          )}
          
          {fallbackAvailable && onFallback && (
            <button
              onClick={onFallback}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Use Traditional Search
            </button>
          )}
        </div>
        
        {type === 'seeksphere' && fallbackAvailable && (
          <p className="text-sm text-gray-500 mt-4">
            Don't worry - we can still search using traditional filters
          </p>
        )}
      </div>
    </div>
  );
}

export function SearchTimeout({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-3 bg-yellow-100 rounded-full flex items-center justify-center">
          <Search className="w-6 h-6 text-yellow-600" />
        </div>
        
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">
          Search Taking Longer Than Expected
        </h3>
        
        <p className="text-yellow-700 mb-4">
          The search is taking longer than usual. This might be due to high server load.
        </p>
        
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}