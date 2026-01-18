import { NextRequest, NextResponse } from 'next/server'
import { search } from '@/lib/seeksphere'

// Allow this route to run for up to 60 seconds (max for Vercel Pro plan)
// For self-hosted deployments, this can be increased further
export const maxDuration = 60

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')

  if (!query) {
    return NextResponse.json({ error: 'Query parameter required' }, { status: 400 })
  }

  try {
    const properties = await search(query)
    return NextResponse.json({
      data: properties,
      totalCount: properties.length,
      query
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}