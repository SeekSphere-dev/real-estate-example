import { NextResponse } from 'next/server';
import { getPropertyFeatures } from '@/lib/database';

export async function GET() {
  try {
    const features = await getPropertyFeatures();
    
    return NextResponse.json({
      success: true,
      data: features
    });
  } catch (error) {
    console.error('Features API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch property features',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}