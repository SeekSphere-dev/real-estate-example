import { NextResponse } from 'next/server';
import { getPropertyTypes } from '@/lib/database';

export async function GET() {
  try {
    const propertyTypes = await getPropertyTypes();
    
    return NextResponse.json({
      success: true,
      data: propertyTypes
    });
  } catch (error) {
    console.error('Property types API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch property types',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}