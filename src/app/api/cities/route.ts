import { NextRequest, NextResponse } from 'next/server';
import { getCitiesByProvince } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const provinceId = searchParams.get('province_id');
    
    if (!provinceId) {
      return NextResponse.json({
        success: false,
        error: 'Province ID is required'
      }, { status: 400 });
    }
    
    const cities = await getCitiesByProvince(parseInt(provinceId));
    
    return NextResponse.json({
      success: true,
      data: cities
    });
  } catch (error) {
    console.error('Cities API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch cities',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}