'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SearchFilters, SearchResults } from '@/components/search';
import { LoadingSpinner } from '@/components/ui/loading';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { ChevronLeft, ChevronRight, Filter, X } from 'lucide-react';
import { clsx } from 'clsx';
import type { 
  SearchFilters as SearchFiltersType, 
  SearchResult, 
  Property,
  PropertyType,
  ListingType,
  City,
  Province,
  PropertyFeature
} from '@/lib/types';

const ITEMS_PER_PAGE = 20;

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State management
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter options state
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  const [listingTypes, setListingTypes] = useState<ListingType[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [features, setFeatures] = useState<PropertyFeature[]>([]);
  
  // Parse filters from URL parameters
  const parseFiltersFromURL = useCallback((): SearchFiltersType => {
    const filters: SearchFiltersType = {};
    
    const query = searchParams.get('q');
    if (query) filters.query = query;
    
    const propertyType = searchParams.get('property_type');
    if (propertyType) filters.property_type = propertyType;
    
    const listingType = searchParams.get('listing_type');
    if (listingType) filters.listing_type = listingType;
    
    const minPrice = searchParams.get('min_price');
    if (minPrice) filters.min_price = parseInt(minPrice);
    
    const maxPrice = searchParams.get('max_price');
    if (maxPrice) filters.max_price = parseInt(maxPrice);
    
    const bedrooms = searchParams.get('bedrooms');
    if (bedrooms) filters.bedrooms = parseInt(bedrooms);
    
    const bathrooms = searchParams.get('bathrooms');
    if (bathrooms) filters.bathrooms = parseFloat(bathrooms);
    
    const city = searchParams.get('city');
    if (city) filters.city = city;
    
    const province = searchParams.get('province');
    if (province) filters.province = province;
    
    const minSqft = searchParams.get('min_sqft');
    if (minSqft) filters.min_sqft = parseInt(minSqft);
    
    const maxSqft = searchParams.get('max_sqft');
    if (maxSqft) filters.max_sqft = parseInt(maxSqft);
    
    const parkingSpaces = searchParams.get('parking_spaces');
    if (parkingSpaces) filters.parking_spaces = parseInt(parkingSpaces);
    
    const petFriendly = searchParams.get('pet_friendly');
    if (petFriendly === 'true') filters.pet_friendly = true;
    
    const furnished = searchParams.get('furnished');
    if (furnished === 'true') filters.furnished = true;
    
    const featuresParam = searchParams.get('features');
    if (featuresParam) {
      filters.features = featuresParam.split(',').filter(Boolean);
    }
    
    return filters;
  }, [searchParams]);

  const [filters, setFilters] = useState<SearchFiltersType>(parseFiltersFromURL());
  const currentPage = parseInt(searchParams.get('page') || '1');

  // Update URL when filters change
  const updateURL = useCallback((newFilters: SearchFiltersType, page: number = 1) => {
    const params = new URLSearchParams();
    
    if (newFilters.query) params.set('q', newFilters.query);
    if (newFilters.property_type) params.set('property_type', newFilters.property_type);
    if (newFilters.listing_type) params.set('listing_type', newFilters.listing_type);
    if (newFilters.min_price) params.set('min_price', newFilters.min_price.toString());
    if (newFilters.max_price) params.set('max_price', newFilters.max_price.toString());
    if (newFilters.bedrooms) params.set('bedrooms', newFilters.bedrooms.toString());
    if (newFilters.bathrooms) params.set('bathrooms', newFilters.bathrooms.toString());
    if (newFilters.city) params.set('city', newFilters.city);
    if (newFilters.province) params.set('province', newFilters.province);
    if (newFilters.min_sqft) params.set('min_sqft', newFilters.min_sqft.toString());
    if (newFilters.max_sqft) params.set('max_sqft', newFilters.max_sqft.toString());
    if (newFilters.parking_spaces) params.set('parking_spaces', newFilters.parking_spaces.toString());
    if (newFilters.pet_friendly) params.set('pet_friendly', 'true');
    if (newFilters.furnished) params.set('furnished', 'true');
    if (newFilters.features && newFilters.features.length > 0) {
      params.set('features', newFilters.features.join(','));
    }
    if (page > 1) params.set('page', page.toString());
    
    const newURL = `/search${params.toString() ? `?${params.toString()}` : ''}`;
    router.push(newURL, { scroll: false });
  }, [router]);

  // Load filter options
  const loadFilterOptions = useCallback(async () => {
    try {
      const [propertyTypesRes, listingTypesRes, provincesRes, featuresRes] = await Promise.all([
        fetch('/api/property-types'),
        fetch('/api/listing-types'),
        fetch('/api/provinces'),
        fetch('/api/features')
      ]);

      if (propertyTypesRes.ok) {
        const data = await propertyTypesRes.json();
        setPropertyTypes(data.data || []);
      }

      if (listingTypesRes.ok) {
        const data = await listingTypesRes.json();
        setListingTypes(data.data || []);
      }

      if (provincesRes.ok) {
        const data = await provincesRes.json();
        setProvinces(data.data || []);
      }

      if (featuresRes.ok) {
        const data = await featuresRes.json();
        setFeatures(data.data || []);
      }

      // Load cities if province is selected
      if (filters.province) {
        const province = provinces.find(p => p.code === filters.province || p.name === filters.province);
        if (province) {
          const citiesRes = await fetch(`/api/cities?province_id=${province.id}`);
          if (citiesRes.ok) {
            const data = await citiesRes.json();
            setCities(data.data || []);
          }
        }
      }
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  }, [filters.province, provinces]);

  // Search properties
  const searchProperties = useCallback(async (searchFilters: SearchFiltersType, page: number = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', ITEMS_PER_PAGE.toString());
      
      // Add filters to search params
      Object.entries(searchFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            if (value.length > 0) {
              params.set(key, value.join(','));
            }
          } else {
            params.set(key, value.toString());
          }
        }
      });

      const response = await fetch(`/api/search?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Search failed');
      }
      
      setSearchResult(data.data);
    } catch (error) {
      console.error('Search error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while searching');
      setSearchResult(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: SearchFiltersType) => {
    setFilters(newFilters);
    updateURL(newFilters, 1);
  }, [updateURL]);

  // Handle search
  const handleSearch = useCallback(() => {
    searchProperties(filters, 1);
  }, [searchProperties, filters]);

  // Handle pagination
  const handlePageChange = useCallback((page: number) => {
    updateURL(filters, page);
    searchProperties(filters, page);
  }, [updateURL, searchProperties, filters]);

  // Load initial data
  useEffect(() => {
    loadFilterOptions();
  }, [loadFilterOptions]);

  // Search when URL changes
  useEffect(() => {
    const urlFilters = parseFiltersFromURL();
    setFilters(urlFilters);
    searchProperties(urlFilters, currentPage);
  }, [searchParams, parseFiltersFromURL, searchProperties, currentPage]);



  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Traditional Property Search</h1>
                <p className="text-gray-600 mt-1">
                  Search through our property database using traditional filters
                </p>
              </div>
              
              {/* Mobile filter toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          <div className="flex gap-6">
            {/* Filters Sidebar */}
            <div className={clsx(
              'lg:w-80 lg:flex-shrink-0',
              'lg:block',
              showFilters ? 'block' : 'hidden'
            )}>
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
                <div className="flex items-center justify-between mb-4 lg:hidden">
                  <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <SearchFilters
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  onSearch={handleSearch}
                  loading={loading}
                  propertyTypes={propertyTypes}
                  listingTypes={listingTypes}
                  cities={cities}
                  provinces={provinces}
                  features={features}
                />
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              <SearchResults
                searchResult={searchResult}
                loading={loading}
                error={error}
                currentPage={currentPage}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={handlePageChange}
                onRetry={handleSearch}
                onClearFilters={() => handleFiltersChange({})}
                showRelevanceScores={false}
              />
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}