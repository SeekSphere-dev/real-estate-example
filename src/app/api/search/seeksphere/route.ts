import { NextRequest, NextResponse } from 'next/server';
import { searchWithSeeksphere, isSeeksphereAvailable } from '@/lib/seeksphere';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, page = 1, limit = 20 } = body;

    // Validate query
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid query', 
          message: 'Query must be a non-empty string'
        },
        { status: 400 }
      );
    }

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid pagination parameters',
          message: 'Page must be >= 1 and limit must be between 1 and 100'
        },
        { status: 400 }
      );
    }

    // Perform seeksphere search (includes graceful degradation)
    const result = await searchWithSeeksphere(query.trim(), page, limit);

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Seeksphere search error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Search failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  const query = searchParams.get('q');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  try {
    // Validate query
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid query', 
          message: 'Query parameter "q" must be a non-empty string'
        },
        { status: 400 }
      );
    }

    // Validate pagination parameters
    if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid pagination parameters',
          message: 'Page must be >= 1 and limit must be between 1 and 100'
        },
        { status: 400 }
      );
    }

    // Perform seeksphere search (includes graceful degradation)
    const result = await searchWithSeeksphere(query.trim(), page, limit);

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Seeksphere search error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Search failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}