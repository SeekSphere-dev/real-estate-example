'use client';

import { useState } from 'react';
import { Property, SearchFilters as SearchFiltersType, PropertyImage } from '@/lib/types';
import { 
  PropertyCard, 
  PropertyGrid, 
  PropertyGallery, 
  CompactGallery,
  SearchFilters,
  LoadingState,
  LoadingSpinner,
  ErrorBoundary,
  ErrorMessage,
  SearchError
} from '@/components';

// Mock data for demonstration
const mockProperty: Property = {
  id: '1',
  mls_number: 'MLS123456',
  property_type_id: 1,
  listing_type_id: 1,
  status_id: 1,
  agent_id: 1,
  street_address: '123 Main Street',
  unit_number: 'Unit 4B',
  neighborhood_id: 1,
  city_id: 1,
  province_id: 1,
  postal_code: 'M5V 3A8',
  latitude: 43.6532,
  longitude: -79.3832,
  title: 'Beautiful Downtown Condo with City Views',
  description: 'Stunning 2-bedroom, 2-bathroom condo in the heart of downtown with panoramic city views.',
  year_built: 2018,
  total_area_sqft: 1200,
  lot_size_sqft: undefined,
  bedrooms: 2,
  bathrooms: 2,
  half_bathrooms: 0,
  floors: 1,
  list_price: 750000,
  price_per_sqft: 625,
  monthly_rent: undefined,
  maintenance_fee: 450,
  property_taxes_annual: 8500,
  heating_type: 'Central Air',
  cooling_type: 'Central Air',
  utilities_included: ['Heat', 'Water'],
  parking_spaces: 1,
  parking_type: 'Underground',
  pet_friendly: true,
  furnished: false,
  listed_date: new Date('2024-01-15'),
  available_date: new Date('2024-02-01'),
  sold_date: undefined,
  last_updated: new Date(),
  created_at: new Date('2024-01-15'),
  property_type: { id: 1, name: 'Condo', description: 'Condominium', category: 'Residential', created_at: new Date() },
  listing_type: { id: 1, name: 'sale', description: 'For Sale', created_at: new Date() },
  status: { id: 1, name: 'Active', description: 'Available for sale', is_available: true, created_at: new Date() },
  agent: {
    id: 1,
    first_name: 'John',
    last_name: 'Smith',
    email: 'john.smith@realty.com',
    phone: '(555) 123-4567',
    license_number: 'RE123456',
    agency_name: 'Premium Realty',
    years_experience: 8,
    rating: 4.8,
    total_reviews: 127,
    created_at: new Date()
  },
  city: { id: 1, name: 'Toronto', province_id: 1, created_at: new Date() },
  province: { id: 1, code: 'ON', name: 'Ontario', country_code: 'CA', created_at: new Date() },
  neighborhood: { id: 1, name: 'Downtown Core', city_id: 1, created_at: new Date() },
  images: [
    {
      id: 1,
      property_id: '1',
      image_url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
      image_type: 'exterior',
      caption: 'Front view of the building',
      display_order: 1,
      is_primary: true,
      created_at: new Date()
    },
    {
      id: 2,
      property_id: '1',
      image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop',
      image_type: 'interior',
      caption: 'Living room with city views',
      display_order: 2,
      is_primary: false,
      created_at: new Date()
    }
  ],
  features: [
    { id: 1, name: 'Hardwood Floors', category: 'Flooring', created_at: new Date() },
    { id: 2, name: 'Granite Countertops', category: 'Kitchen', created_at: new Date() },
    { id: 3, name: 'Balcony', category: 'Outdoor', created_at: new Date() }
  ]
};

const mockProperties = Array.from({ length: 6 }, (_, i) => ({
  ...mockProperty,
  id: `${i + 1}`,
  title: `Property ${i + 1} - ${mockProperty.title}`,
  list_price: mockProperty.list_price! + (i * 50000)
}));

export default function ComponentsDemo() {
  const [filters, setFilters] = useState<SearchFiltersType>({});
  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);

  const mockPropertyTypes = [
    { id: 1, name: 'Condo' },
    { id: 2, name: 'House' },
    { id: 3, name: 'Townhouse' }
  ];

  const mockListingTypes = [
    { id: 1, name: 'sale' },
    { id: 2, name: 'rent' }
  ];

  const mockCities = [
    { id: 1, name: 'Toronto', province: { name: 'Ontario', code: 'ON' } },
    { id: 2, name: 'Vancouver', province: { name: 'British Columbia', code: 'BC' } }
  ];

  const mockProvinces = [
    { id: 1, name: 'Ontario', code: 'ON' },
    { id: 2, name: 'British Columbia', code: 'BC' }
  ];

  const mockFeatures = [
    { id: 1, name: 'Hardwood Floors', category: 'Flooring' },
    { id: 2, name: 'Granite Countertops', category: 'Kitchen' },
    { id: 3, name: 'Balcony', category: 'Outdoor' }
  ];

  const toggleLoading = () => {
    setLoading(!loading);
  };

  const toggleError = () => {
    setShowError(!showError);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Components Demo</h1>
        
        <div className="space-y-12">
          {/* Loading Components */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Loading Components</h2>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Loading Spinner</h3>
                  <div className="flex gap-4 items-center">
                    <LoadingSpinner size="sm" />
                    <LoadingSpinner size="md" />
                    <LoadingSpinner size="lg" />
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Loading State</h3>
                  <LoadingState message="Loading properties..." />
                </div>
              </div>
            </div>
          </section>

          {/* Error Components */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Error Components</h2>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="space-y-4">
                <ErrorMessage 
                  title="Connection Error"
                  message="Unable to connect to the server. Please check your internet connection."
                  onRetry={() => alert('Retry clicked')}
                />
                
                <SearchError 
                  message="No results found for your search criteria"
                  onRetry={() => alert('Retry search')}
                  onClearFilters={() => alert('Clear filters')}
                />
              </div>
            </div>
          </section>

          {/* Property Card */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Property Card</h2>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="max-w-sm">
                <PropertyCard 
                  property={mockProperty} 
                  showFavorite={true}
                  onFavoriteToggle={(id) => alert(`Toggle favorite for ${id}`)}
                />
              </div>
            </div>
          </section>

          {/* Property Grid */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Property Grid</h2>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="mb-4 flex gap-2">
                <button 
                  onClick={toggleLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Toggle Loading: {loading ? 'ON' : 'OFF'}
                </button>
              </div>
              <PropertyGrid 
                properties={loading ? [] : mockProperties}
                loading={loading}
                showFavorites={true}
                onFavoriteToggle={(id) => alert(`Toggle favorite for ${id}`)}
              />
            </div>
          </section>

          {/* Property Gallery */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Property Gallery</h2>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="max-w-2xl">
                <PropertyGallery 
                  images={mockProperty.images || []}
                  propertyTitle={mockProperty.title}
                />
              </div>
            </div>
          </section>

          {/* Compact Gallery */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Compact Gallery</h2>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="max-w-md">
                <CompactGallery 
                  images={mockProperty.images || []}
                  propertyTitle={mockProperty.title}
                />
              </div>
            </div>
          </section>

          {/* Search Filters */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Search Filters</h2>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="max-w-md">
                <SearchFilters
                  filters={filters}
                  onFiltersChange={setFilters}
                  onSearch={() => alert('Search triggered')}
                  propertyTypes={mockPropertyTypes}
                  listingTypes={mockListingTypes}
                  cities={mockCities}
                  provinces={mockProvinces}
                  features={mockFeatures}
                />
              </div>
            </div>
          </section>

          {/* Error Boundary Demo */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Error Boundary</h2>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="mb-4">
                <button 
                  onClick={toggleError}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Toggle Error Component: {showError ? 'ON' : 'OFF'}
                </button>
              </div>
              <ErrorBoundary>
                {showError ? <ThrowError /> : <div className="p-4 bg-green-100 text-green-800 rounded">Component working normally</div>}
              </ErrorBoundary>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

// Component that throws an error for testing ErrorBoundary
function ThrowError(): never {
  throw new Error('This is a test error for the ErrorBoundary component');
}