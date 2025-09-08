import { NextRequest, NextResponse } from 'next/server';
import { searchProperties } from '@/lib/database';
import { validateSearchFilters, createPaginationParams } from '@/lib/types';
import type { SearchFilters, SortOptions } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse pagination parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const pagination = createPaginationParams(page, limit);
    
    // Parse sort parameters
    const sortParam = searchParams.get('sort') || 'date_desc';
    const [field, direction] = sortParam.split('_');
    const sort: SortOptions = {
      field: (field as any) || 'date',
      direction: (direction as 'asc' | 'desc') || 'desc'
    };
    
    // Parse search filters
    const filters: SearchFilters = {};
    
    const query = searchParams.get('query') || searchParams.get('q');
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
    
    // Validate filters
    const validation = validateSearchFilters(filters);
    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        error: 'Invalid search parameters',
        details: validation.errors
      }, { status: 400 });
    }
    
    // Perform search
    const searchResult = await searchProperties(filters, pagination, sort);
    
    return NextResponse.json({
      success: true,
      data: searchResult
    });
    
  } catch (error) {
    console.error('Search API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filters = {}, pagination = {}, sort = {} } = body;
    
    // Create pagination params with defaults
    const paginationParams = createPaginationParams(
      pagination.page || 1,
      pagination.limit || 20
    );
    
    // Create sort options with defaults
    const sortOptions: SortOptions = {
      field: sort.field || 'date',
      direction: sort.direction || 'desc'
    };
    
    // Validate filters
    const validation = validateSearchFilters(filters);
    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        error: 'Invalid search parameters',
        details: validation.errors
      }, { status: 400 });
    }
    
    // Perform search
    const searchResult = await searchProperties(filters, paginationParams, sortOptions);
    
    return NextResponse.json({
      success: true,
      data: searchResult
    });
    
  } catch (error) {
    console.error('Search API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}