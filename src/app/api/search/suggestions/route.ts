import { NextRequest, NextResponse } from 'next/server';
import { getSearchSuggestions, isSeeksphereAvailable } from '@/lib/seeksphere';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ suggestions: [] });
    }

    // Check if seeksphere is available
    if (!isSeeksphereAvailable()) {
      // Return basic suggestions if seeksphere is not available
      const basicSuggestions = generateBasicSuggestions(query);
      return NextResponse.json({ suggestions: basicSuggestions });
    }

    // Get suggestions from seeksphere
    const suggestions = await getSearchSuggestions(query);

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Error getting search suggestions:', error);
    
    // Fallback to basic suggestions on error
    const query = request.nextUrl.searchParams.get('q') || '';
    const basicSuggestions = generateBasicSuggestions(query);
    
    return NextResponse.json({ suggestions: basicSuggestions });
  }
}

/**
 * Generate basic search suggestions when seeksphere is not available
 */
function generateBasicSuggestions(query: string): string[] {
  const lowerQuery = query.toLowerCase().trim();
  
  const suggestions: string[] = [];
  
  // Property type suggestions
  const propertyTypes = ['house', 'condo', 'apartment', 'townhouse'];
  const matchingTypes = propertyTypes.filter(type => 
    type.includes(lowerQuery) || lowerQuery.includes(type)
  );
  
  matchingTypes.forEach(type => {
    suggestions.push(`${type} for sale`);
    suggestions.push(`${type} for rent`);
  });
  
  // Location-based suggestions
  const commonCities = ['toronto', 'vancouver', 'montreal', 'calgary', 'ottawa'];
  const matchingCities = commonCities.filter(city => 
    city.includes(lowerQuery) || lowerQuery.includes(city)
  );
  
  matchingCities.forEach(city => {
    suggestions.push(`properties in ${city}`);
    suggestions.push(`${city} real estate`);
  });
  
  // Feature-based suggestions
  const features = ['parking', 'balcony', 'pool', 'gym', 'pet friendly'];
  const matchingFeatures = features.filter(feature => 
    feature.includes(lowerQuery) || lowerQuery.includes(feature)
  );
  
  matchingFeatures.forEach(feature => {
    suggestions.push(`properties with ${feature}`);
  });
  
  // Generic suggestions based on common search patterns
  if (lowerQuery.includes('bedroom') || lowerQuery.includes('bed')) {
    suggestions.push('2 bedroom apartment', '3 bedroom house', '1 bedroom condo');
  }
  
  if (lowerQuery.includes('downtown') || lowerQuery.includes('city')) {
    suggestions.push('downtown condo', 'city center apartment');
  }
  
  if (lowerQuery.includes('family') || lowerQuery.includes('home')) {
    suggestions.push('family home with yard', 'single family house');
  }
  
  // Remove duplicates and limit to 5 suggestions
  const uniqueSuggestions = [...new Set(suggestions)];
  return uniqueSuggestions.slice(0, 5);
}