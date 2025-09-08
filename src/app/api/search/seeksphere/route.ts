import { NextRequest, NextResponse } from 'next/server';
import { searchWithSeeksphere, isSeeksphereAvailable } from '@/lib/seeksphere';
import { SearchFilters, validateSearchFilters } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filters, page = 1, limit = 20 } = body;

    // Validate search filters
    const validation = validateSearchFilters(filters);
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          error: 'Invalid search filters', 
          details: validation.errors 
        },
        { status: 400 }
      );
    }

    // Check if seeksphere is available
    if (!isSeeksphereAvailable()) {
      return NextResponse.json(
        { 
          error: 'Seeksphere service is not available',
          message: 'Please check your seeksphere configuration'
        },
        { status: 503 }
      );
    }

    // Perform seeksphere search
    const result = await searchWithSeeksphere(filters, page, limit);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Seeksphere search error:', error);
    
    return NextResponse.json(
      { 
        error: 'Search failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  // Convert URL search params to filters
  const filters: SearchFilters = {
    query: searchParams.get('q') || undefined,
    property_type: searchParams.get('property_type') || undefined,
    listing_type: searchParams.get('listing_type') || undefined,
    min_price: searchParams.get('min_price') ? parseInt(searchParams.get('min_price')!) : undefined,
    max_price: searchParams.get('max_price') ? parseInt(searchParams.get('max_price')!) : undefined,
    bedrooms: searchParams.get('bedrooms') ? parseInt(searchParams.get('bedrooms')!) : undefined,
    bathrooms: searchParams.get('bathrooms') ? parseInt(searchParams.get('bathrooms')!) : undefined,
    city: searchParams.get('city') || undefined,
    province: searchParams.get('province') || undefined,
    min_sqft: searchParams.get('min_sqft') ? parseInt(searchParams.get('min_sqft')!) : undefined,
    max_sqft: searchParams.get('max_sqft') ? parseInt(searchParams.get('max_sqft')!) : undefined,
  };

  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  try {
    // Validate search filters
    const validation = validateSearchFilters(filters);
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          error: 'Invalid search filters', 
          details: validation.errors 
        },
        { status: 400 }
      );
    }

    // Check if seeksphere is available
    if (!isSeeksphereAvailable()) {
      return NextResponse.json(
        { 
          error: 'Seeksphere service is not available',
          message: 'Please check your seeksphere configuration'
        },
        { status: 503 }
      );
    }

    // Perform seeksphere search
    const result = await searchWithSeeksphere(filters, page, limit);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Seeksphere search error:', error);
    
    return NextResponse.json(
      { 
        error: 'Search failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}