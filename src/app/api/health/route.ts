import { NextResponse } from 'next/server';
import { testConnection } from '@/lib/database';

export async function GET() {
  try {
    // Test database connection
    const dbHealthy = await testConnection();
    
    if (!dbHealthy) {
      return NextResponse.json(
        { 
          status: 'unhealthy', 
          message: 'Database connection failed',
          timestamp: new Date().toISOString()
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      status: 'healthy',
      message: 'Application is running normally',
      database: 'connected',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });

  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        message: 'Health check failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    );
  }
}