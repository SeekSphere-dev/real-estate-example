'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Sparkles } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { SearchResults } from '@/components/search';
import { Property, SearchFilters, SeeksphereSearchResult } from '@/lib/types';

function SeeksphereSearchContent() {
  const [searchResult, setSearchResult] = useState<SeeksphereSearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  
  const searchParams = useSearchParams();
  const router = useRouter();

  // Initialize filters from URL parameters
  const [filters, setFilters] = useState<SearchFilters>(() => ({
    query: searchParams.get('q') || '',
    property_type: searchParams.get('property_type') || undefined,
    listing_type: searchParams.get('listing_type') || undefined,
    min_price: searchParams.get('min_price') ? parseInt(searchParams.get('min_price')!) : undefined,
    max_price: searchParams.get('max_price') ? parseInt(searchParams.get('max_price')!) : undefined,
    bedrooms: searchParams.get('bedrooms') ? parseInt(searchParams.get('bedrooms')!) : undefined,
    bathrooms: searchParams.get('bathrooms') ? parseInt(searchParams.get('bathrooms')!) : undefined,
    city: searchParams.get('city') || undefined,
    province: searchParams.get('province') || undefined,
  }));

  const [currentPage, setCurrentPage] = useState(1);
  const limit = 20;

  // Update URL when filters change
  const updateURL = useCallback((newFilters: SearchFilters, page: number = 1) => {
    const params = new URLSearchParams();
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, value.toString());
      }
    });
    
    if (page > 1) {
      params.set('page', page.toString());
    }
    
    router.push(`/seeksphere?${params.toString()}`);
  }, [router]);

  // Perform seeksphere search
  const performSearch = useCallback(async (searchFilters: SearchFilters, page: number = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/search/seeksphere', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filters: searchFilters,
          page,
          limit,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Search failed');
      }
      
      const result: SeeksphereSearchResult = await response.json();
      setSearchResult(result);
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setSearchResult(null);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  // Get search suggestions
  const getSuggestions = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }
    
    try {
      const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      }
    } catch (err) {
      console.error('Error getting suggestions:', err);
    }
  }, []);

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const newFilters = { ...filters, query };
    setFilters(newFilters);
    updateURL(newFilters);
    performSearch(newFilters);
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    updateURL(newFilters);
    performSearch(newFilters);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    updateURL(filters, page);
    performSearch(filters, page);
  };

  // Initial search on component mount
  useEffect(() => {
    const initialQuery = searchParams.get('q') || '';
    const initialPage = parseInt(searchParams.get('page') || '1');
    
    setQuery(initialQuery);
    setCurrentPage(initialPage);
    
    if (initialQuery || Object.values(filters).some(v => v !== undefined && v !== '')) {
      performSearch(filters, initialPage);
    }
  }, []);

  // Get suggestions when query changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      getSuggestions(query);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [query, getSuggestions]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Sparkles className="h-8 w-8 text-blue-600" />
                Seeksphere Search
              </h1>
              <p className="mt-2 text-gray-600">
                Experience intelligent property search powered by advanced AI
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Powered by</div>
              <div className="text-lg font-semibold text-blue-600">seeksphere</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Search Interface */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-6">
            {/* Main Search Input */}
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Try: 'Modern condo downtown with parking' or 'Family home near schools'"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                />
              </div>
              
              {/* Search Suggestions */}
              {suggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        setQuery(suggestion);
                        setSuggestions([]);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Advanced Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Property Type
                </label>
                <select
                  value={filters.property_type || ''}
                  onChange={(e) => handleFilterChange('property_type', e.target.value || undefined)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Any Type</option>
                  <option value="House">House</option>
                  <option value="Condo">Condo</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Townhouse">Townhouse</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Listing Type
                </label>
                <select
                  value={filters.listing_type || ''}
                  onChange={(e) => handleFilterChange('listing_type', e.target.value || undefined)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Any</option>
                  <option value="For Sale">For Sale</option>
                  <option value="For Rent">For Rent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bedrooms
                </label>
                <select
                  value={filters.bedrooms || ''}
                  onChange={(e) => handleFilterChange('bedrooms', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                  <option value="5">5+</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bathrooms
                </label>
                <select
                  value={filters.bathrooms || ''}
                  onChange={(e) => handleFilterChange('bathrooms', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                </select>
              </div>
            </div>

            {/* Price Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Price
                </label>
                <input
                  type="number"
                  value={filters.min_price || ''}
                  onChange={(e) => handleFilterChange('min_price', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="No minimum"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Price
                </label>
                <input
                  type="number"
                  value={filters.max_price || ''}
                  onChange={(e) => handleFilterChange('max_price', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="No maximum"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-5 w-5" />
                  Search with Seeksphere
                </>
              )}
            </button>
          </form>
        </div>

        <SearchResults
          searchResult={searchResult}
          loading={loading}
          error={error}
          currentPage={currentPage}
          itemsPerPage={limit}
          onPageChange={handlePageChange}
          onRetry={() => performSearch(filters, currentPage)}
          onClearFilters={() => {
            setQuery('');
            const newFilters = { query: '' };
            setFilters(newFilters);
            updateURL(newFilters);
            performSearch(newFilters);
          }}
          showRelevanceScores={true}
        />
      </div>
    </div>
    </ErrorBoundary>
  );
}

export default function SeekspherePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <SeeksphereSearchContent />
    </Suspense>
  );
}