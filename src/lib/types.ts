// Core database entity types
export interface Province {
  id: number;
  code: string;
  name: string;
  country_code: string;
  created_at: Date;
}

export interface City {
  id: number;
  name: string;
  province_id: number;
  population?: number;
  latitude?: number;
  longitude?: number;
  created_at: Date;
  province?: Province;
}

export interface Neighborhood {
  id: number;
  name: string;
  city_id: number;
  average_income?: number;
  walkability_score?: number;
  safety_rating?: number;
  created_at: Date;
  city?: City;
}

export interface PropertyType {
  id: number;
  name: string;
  description?: string;
  category?: string;
  created_at: Date;
}

export interface ListingType {
  id: number;
  name: string;
  description?: string;
  created_at: Date;
}

export interface PropertyStatus {
  id: number;
  name: string;
  description?: string;
  is_available: boolean;
  created_at: Date;
}

export interface Agent {
  id: number;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  license_number?: string;
  agency_name?: string;
  years_experience?: number;
  rating?: number;
  total_reviews: number;
  created_at: Date;
}

export interface PropertyFeature {
  id: number;
  name: string;
  category?: string;
  description?: string;
  created_at: Date;
}

export interface PropertyImage {
  id: number;
  property_id: string;
  image_url: string;
  image_type?: string;
  caption?: string;
  display_order: number;
  is_primary: boolean;
  created_at: Date;
}

export interface PropertyHistory {
  id: number;
  property_id: string;
  event_type: string;
  old_value?: string;
  new_value?: string;
  price_change?: number;
  status_change?: string;
  event_date: Date;
  notes?: string;
}

// Main Property interface
export interface Property {
  id: string;
  mls_number?: string;
  property_type_id: number;
  listing_type_id: number;
  status_id: number;
  agent_id?: number;
  
  // Location
  street_address: string;
  unit_number?: string;
  neighborhood_id?: number;
  city_id: number;
  province_id: number;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  
  // Basic details
  title: string;
  description?: string;
  year_built?: number;
  
  // Size and layout
  total_area_sqft?: number;
  lot_size_sqft?: number;
  bedrooms?: number;
  bathrooms?: number;
  half_bathrooms: number;
  floors?: number;
  
  // Pricing
  list_price?: number;
  price_per_sqft?: number;
  monthly_rent?: number;
  maintenance_fee?: number;
  property_taxes_annual?: number;
  
  // Utilities and costs
  heating_type?: string;
  cooling_type?: string;
  utilities_included?: string[];
  
  // Building amenities
  parking_spaces: number;
  parking_type?: string;
  pet_friendly: boolean;
  furnished: boolean;
  
  // Timestamps
  listed_date?: Date;
  available_date?: Date;
  sold_date?: Date;
  last_updated: Date;
  created_at: Date;
  
  // Relations (populated via joins)
  property_type?: PropertyType;
  listing_type?: ListingType;
  status?: PropertyStatus;
  agent?: Agent;
  city?: City;
  province?: Province;
  neighborhood?: Neighborhood;
  images?: PropertyImage[];
  features?: PropertyFeature[];
  history?: PropertyHistory[];
}

// Search and filter types
export interface SearchFilters {
  query?: string;
  property_type?: string;
  listing_type?: string;
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  bathrooms?: number;
  city?: string;
  province?: string;
  features?: string[];
  min_sqft?: number;
  max_sqft?: number;
  parking_spaces?: number;
  pet_friendly?: boolean;
  furnished?: boolean;
}

export interface SearchResult {
  properties: Property[];
  total: number;
  page: number;
  limit: number;
  filters: SearchFilters;
}

// Seeksphere specific types
export interface SeeksphereSearchResult extends SearchResult {
  relevance_scores?: number[];
  search_time_ms?: number;
  suggestions?: string[];
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Form and UI types
export interface PropertyFormData {
  title: string;
  description?: string;
  street_address: string;
  unit_number?: string;
  city_id: number;
  province_id: number;
  postal_code?: string;
  property_type_id: number;
  listing_type_id: number;
  list_price?: number;
  monthly_rent?: number;
  bedrooms?: number;
  bathrooms?: number;
  total_area_sqft?: number;
  features?: number[];
}

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

// Utility types
export type PropertySortField = 'price' | 'date' | 'size' | 'bedrooms' | 'bathrooms';
export type SortDirection = 'asc' | 'desc';

export interface SortOptions {
  field: PropertySortField;
  direction: SortDirection;
}

// Database error types
export interface DatabaseError extends Error {
  code?: string;
  detail?: string;
  table?: string;
  constraint?: string;
}

// Validation types
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Search validation functions
export const validateSearchFilters = (filters: SearchFilters): ValidationResult => {
  const errors: ValidationError[] = [];

  // Validate price ranges
  if (filters.min_price && filters.min_price < 0) {
    errors.push({ field: 'min_price', message: 'Minimum price must be positive', value: filters.min_price });
  }

  if (filters.max_price && filters.max_price < 0) {
    errors.push({ field: 'max_price', message: 'Maximum price must be positive', value: filters.max_price });
  }

  if (filters.min_price && filters.max_price && filters.min_price > filters.max_price) {
    errors.push({ field: 'price_range', message: 'Minimum price cannot be greater than maximum price' });
  }

  // Validate bedroom/bathroom counts
  if (filters.bedrooms && (filters.bedrooms < 0 || filters.bedrooms > 20)) {
    errors.push({ field: 'bedrooms', message: 'Bedrooms must be between 0 and 20', value: filters.bedrooms });
  }

  if (filters.bathrooms && (filters.bathrooms < 0 || filters.bathrooms > 20)) {
    errors.push({ field: 'bathrooms', message: 'Bathrooms must be between 0 and 20', value: filters.bathrooms });
  }

  // Validate square footage
  if (filters.min_sqft && filters.min_sqft < 0) {
    errors.push({ field: 'min_sqft', message: 'Minimum square footage must be positive', value: filters.min_sqft });
  }

  if (filters.max_sqft && filters.max_sqft < 0) {
    errors.push({ field: 'max_sqft', message: 'Maximum square footage must be positive', value: filters.max_sqft });
  }

  if (filters.min_sqft && filters.max_sqft && filters.min_sqft > filters.max_sqft) {
    errors.push({ field: 'sqft_range', message: 'Minimum square footage cannot be greater than maximum' });
  }

  // Validate parking spaces
  if (filters.parking_spaces && (filters.parking_spaces < 0 || filters.parking_spaces > 20)) {
    errors.push({ field: 'parking_spaces', message: 'Parking spaces must be between 0 and 20', value: filters.parking_spaces });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Pagination validation
export const validatePagination = (pagination: PaginationParams): ValidationResult => {
  const errors: ValidationError[] = [];

  if (pagination.page < 1) {
    errors.push({ field: 'page', message: 'Page must be 1 or greater', value: pagination.page });
  }

  if (pagination.limit < 1 || pagination.limit > 100) {
    errors.push({ field: 'limit', message: 'Limit must be between 1 and 100', value: pagination.limit });
  }

  if (pagination.offset < 0) {
    errors.push({ field: 'offset', message: 'Offset must be 0 or greater', value: pagination.offset });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Helper function to create pagination params
export const createPaginationParams = (page: number = 1, limit: number = 20): PaginationParams => {
  const validPage = Math.max(1, page);
  const validLimit = Math.min(Math.max(1, limit), 100);
  const offset = (validPage - 1) * validLimit;

  return {
    page: validPage,
    limit: validLimit,
    offset
  };
};