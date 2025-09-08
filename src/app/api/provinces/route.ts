import { NextResponse } from 'next/server';
import { getProvinces } from '@/lib/database';

export async function GET() {
  try {
    const provinces = await getProvinces();
    
    return NextResponse.json({
      success: true,
      data: provinces
    });
  } catch (error) {
    console.error('Provinces API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch provinces',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}