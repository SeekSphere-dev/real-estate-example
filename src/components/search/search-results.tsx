import { PropertyGrid } from '@/components/property';
import { LoadingSpinner } from '@/components/ui/loading';
import { Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import { Property, SearchResult, SeeksphereSearchResult } from '@/lib/types';

interface SearchResultsProps {
  searchResult: SearchResult | SeeksphereSearchResult | null;
  loading: boolean;
  error: string | null;
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onRetry: () => void;
  onClearFilters: () => void;
  className?: string;
  showRelevanceScores?: boolean;
}

export function SearchResults({
  searchResult,
  loading,
  error,
  currentPage,
  itemsPerPage,
  onPageChange,
  onRetry,
  onClearFilters,
  className,
  showRelevanceScores = false
}: SearchResultsProps) {
  // Calculate pagination info
  const totalPages = searchResult ? Math.ceil(searchResult.total / itemsPerPage) : 0;
  const startItem = searchResult ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = searchResult ? Math.min(currentPage * itemsPerPage, searchResult.total) : 0;

  // Check if this is a seeksphere result
  const isSeeksphereResult = searchResult && 'relevance_scores' in searchResult;
  const seeksphereResult = isSeeksphereResult ? searchResult as SeeksphereSearchResult : null;

  return (
    <div className={className}>
      {/* Results Header */}
      {searchResult && !loading && (
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <p className="text-gray-600">
                Showing {startItem}-{endItem} of {searchResult.total.toLocaleString()} properties
              </p>
              {seeksphereResult?.search_time_ms && (
                <span className="text-sm text-gray-500">
                  • {seeksphereResult.search_time_ms}ms
                </span>
              )}
            </div>
            
            {/* Sort/Relevance Indicator */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {showRelevanceScores && seeksphereResult ? (
                <span>Sorted by <strong>relevance</strong></span>
              ) : (
                <select className="border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="date_desc">Newest First</option>
                  <option value="date_asc">Oldest First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="size_desc">Size: Largest First</option>
                  <option value="size_asc">Size: Smallest First</option>
                </select>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
          <button
            onClick={onRetry}
            className="mt-2 text-red-600 hover:text-red-700 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Property Grid */}
      {!loading && searchResult && (
        <PropertyGrid
          properties={searchResult.properties}
          loading={loading}
          className="mb-8"
          relevanceScores={showRelevanceScores ? seeksphereResult?.relevance_scores : undefined}
        />
      )}

      {/* Pagination */}
      {!loading && searchResult && totalPages > 1 && (
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              
              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => onPageChange(pageNum)}
                      className={clsx(
                        'w-10 h-10 rounded-lg transition-colors',
                        pageNum === currentPage
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      )}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* No Results */}
      {!loading && searchResult && searchResult.properties.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="text-gray-400 mb-4">
            <Filter className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No properties found</h3>
          <p className="text-gray-500 mb-4">
            Try adjusting your search criteria or {showRelevanceScores ? 'using different keywords' : 'clearing some filters'}
          </p>
          <button
            onClick={onClearFilters}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showRelevanceScores ? 'Clear Search' : 'Clear All Filters'}
          </button>
        </div>
      )}
    </div>
  );
}