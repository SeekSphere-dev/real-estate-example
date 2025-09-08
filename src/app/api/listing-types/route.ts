import { NextResponse } from 'next/server';
import { getListingTypes } from '@/lib/database';

export async function GET() {
  try {
    const listingTypes = await getListingTypes();
    
    return NextResponse.json({
      success: true,
      data: listingTypes
    });
  } catch (error) {
    console.error('Listing types API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch listing types',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}