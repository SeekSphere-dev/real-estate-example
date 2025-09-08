'use client';

import { SearchFilters as SearchFiltersType } from '@/lib/types';
import { ChevronDown, ChevronUp, X, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { clsx } from 'clsx';

interface SearchFiltersProps {
  filters: SearchFiltersType;
  onFiltersChange: (filters: SearchFiltersType) => void;
  onSearch?: () => void;
  loading?: boolean;
  className?: string;
  propertyTypes?: Array<{ id: number; name: string; }>;
  listingTypes?: Array<{ id: number; name: string; }>;
  cities?: Array<{ id: number; name: string; province?: { name: string; code: string; } }>;
  provinces?: Array<{ id: number; name: string; code: string; }>;
  features?: Array<{ id: number; name: string; category?: string; }>;
}

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

function CollapsibleSection({ title, children, defaultOpen = false, className }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={clsx('border border-gray-200 rounded-lg', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="font-medium text-gray-900">{title}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>
      {isOpen && (
        <div className="px-4 pb-4 border-t border-gray-200">
          {children}
        </div>
      )}
    </div>
  );
}

export function SearchFilters({
  filters,
  onFiltersChange,
  onSearch,
  loading = false,
  className,
  propertyTypes = [],
  listingTypes = [],
  cities = [],
  provinces = [],
  features = []
}: SearchFiltersProps) {
  const [localFilters, setLocalFilters] = useState<SearchFiltersType>(filters);

  // Update local filters when props change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const updateFilter = (key: keyof SearchFiltersType, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters: SearchFiltersType = {};
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = Object.values(localFilters).some(value => 
    value !== undefined && value !== '' && value !== null && 
    (Array.isArray(value) ? value.length > 0 : true)
  );

  const handleSearch = () => {
    onSearch?.();
  };

  // Group features by category
  const featuresByCategory = features.reduce((acc, feature) => {
    const category = feature.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(feature);
    return acc;
  }, {} as Record<string, typeof features>);

  return (
    <div className={clsx('space-y-4', className)}>
      {/* Search Query */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search properties..."
          value={localFilters.query || ''}
          onChange={(e) => updateFilter('query', e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        {onSearch && (
          <button
            onClick={handleSearch}
            disabled={loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        )}
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Active filters applied</span>
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 transition-colors"
          >
            <X className="w-4 h-4" />
            Clear all
          </button>
        </div>
      )}

      {/* Property Type & Listing Type */}
      <CollapsibleSection title="Property & Listing Type" defaultOpen>
        <div className="space-y-4 pt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Type
            </label>
            <select
              value={localFilters.property_type || ''}
              onChange={(e) => updateFilter('property_type', e.target.value || undefined)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              {propertyTypes.map((type) => (
                <option key={type.id} value={type.name}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Listing Type
            </label>
            <select
              value={localFilters.listing_type || ''}
              onChange={(e) => updateFilter('listing_type', e.target.value || undefined)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Listings</option>
              {listingTypes.map((type) => (
                <option key={type.id} value={type.name}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </CollapsibleSection>

      {/* Price Range */}
      <CollapsibleSection title="Price Range">
        <div className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Price
              </label>
              <input
                type="number"
                placeholder="0"
                value={localFilters.min_price || ''}
                onChange={(e) => updateFilter('min_price', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Price
              </label>
              <input
                type="number"
                placeholder="No limit"
                value={localFilters.max_price || ''}
                onChange={(e) => updateFilter('max_price', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Bedrooms & Bathrooms */}
      <CollapsibleSection title="Bedrooms & Bathrooms">
        <div className="space-y-4 pt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bedrooms
            </label>
            <select
              value={localFilters.bedrooms || ''}
              onChange={(e) => updateFilter('bedrooms', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Any</option>
              {[0, 1, 2, 3, 4, 5].map((num) => (
                <option key={num} value={num}>
                  {num === 0 ? 'Studio' : `${num}+ bedroom${num > 1 ? 's' : ''}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bathrooms
            </label>
            <select
              value={localFilters.bathrooms || ''}
              onChange={(e) => updateFilter('bathrooms', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Any</option>
              {[1, 1.5, 2, 2.5, 3, 3.5, 4].map((num) => (
                <option key={num} value={num}>
                  {num}+ bathroom{num > 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      </CollapsibleSection>

      {/* Location */}
      <CollapsibleSection title="Location">
        <div className="space-y-4 pt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Province
            </label>
            <select
              value={localFilters.province || ''}
              onChange={(e) => updateFilter('province', e.target.value || undefined)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Provinces</option>
              {provinces.map((province) => (
                <option key={province.id} value={province.code}>
                  {province.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City
            </label>
            <select
              value={localFilters.city || ''}
              onChange={(e) => updateFilter('city', e.target.value || undefined)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Cities</option>
              {cities
                .filter(city => !localFilters.province || city.province?.code === localFilters.province)
                .map((city) => (
                  <option key={city.id} value={city.name}>
                    {city.name}
                    {city.province && `, ${city.province.code}`}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </CollapsibleSection>

      {/* Size & Parking */}
      <CollapsibleSection title="Size & Parking">
        <div className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Sq Ft
              </label>
              <input
                type="number"
                placeholder="0"
                value={localFilters.min_sqft || ''}
                onChange={(e) => updateFilter('min_sqft', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Sq Ft
              </label>
              <input
                type="number"
                placeholder="No limit"
                value={localFilters.max_sqft || ''}
                onChange={(e) => updateFilter('max_sqft', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Parking Spaces
            </label>
            <select
              value={localFilters.parking_spaces || ''}
              onChange={(e) => updateFilter('parking_spaces', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Any</option>
              {[0, 1, 2, 3, 4].map((num) => (
                <option key={num} value={num}>
                  {num === 0 ? 'No parking required' : `${num}+ space${num > 1 ? 's' : ''}`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </CollapsibleSection>

      {/* Additional Options */}
      <CollapsibleSection title="Additional Options">
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={localFilters.pet_friendly || false}
                onChange={(e) => updateFilter('pet_friendly', e.target.checked || undefined)}
                className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Pet Friendly</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={localFilters.furnished || false}
                onChange={(e) => updateFilter('furnished', e.target.checked || undefined)}
                className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Furnished</span>
            </label>
          </div>
        </div>
      </CollapsibleSection>

      {/* Features */}
      {Object.keys(featuresByCategory).length > 0 && (
        <CollapsibleSection title="Features & Amenities">
          <div className="pt-4">
            {Object.entries(featuresByCategory).map(([category, categoryFeatures]) => (
              <div key={category} className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">{category}</h4>
                <div className="space-y-2">
                  {categoryFeatures.map((feature) => (
                    <label key={feature.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={localFilters.features?.includes(feature.name) || false}
                        onChange={(e) => {
                          const currentFeatures = localFilters.features || [];
                          const newFeatures = e.target.checked
                            ? [...currentFeatures, feature.name]
                            : currentFeatures.filter(f => f !== feature.name);
                          updateFilter('features', newFeatures.length > 0 ? newFeatures : undefined);
                        }}
                        className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{feature.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}
    </div>
  );
}