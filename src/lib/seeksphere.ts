import { SeeksphereSearchResult, Property, SearchFilters } from './types';

// Import seeksphere SDK
let SeeksphereClient: any;
try {
  SeeksphereClient = require('seeksphere-sdk');
} catch (error) {
  console.warn('Seeksphere SDK not available:', error);
}

// Seeksphere configuration interface
interface SeeksphereConfig {
  apiKey?: string;
  indexName?: string;
  endpoint?: string;
}

// Initialize seeksphere configuration
const seeksphereConfig: SeeksphereConfig = {
  apiKey: process.env.SEEKSPHERE_API_KEY,
  indexName: process.env.SEEKSPHERE_INDEX_NAME || 'real_estate_properties',
  endpoint: process.env.SEEKSPHERE_ENDPOINT,
};

// Global seeksphere client instance
let seeksphereClient: any = null;

/**
 * Initialize seeksphere client
 */
const initializeClient = () => {
  if (!SeeksphereClient) {
    throw new Error('Seeksphere SDK not available');
  }
  
  if (!seeksphereClient) {
    seeksphereClient = new SeeksphereClient({
      apiKey: seeksphereConfig.apiKey,
      indexName: seeksphereConfig.indexName,
      endpoint: seeksphereConfig.endpoint,
    });
  }
  
  return seeksphereClient;
};

/**
 * Initialize seeksphere with property data
 */
export const initializeSeeksphere = async (properties: Property[]): Promise<boolean> => {
  try {
    const client = initializeClient();
    
    // Transform properties for seeksphere indexing
    const documents = properties.map(property => ({
      id: property.id,
      title: property.title,
      description: property.description || '',
      location: `${property.street_address}, ${property.city?.name || ''}, ${property.province?.name || ''}`,
      price: property.list_price || property.monthly_rent || 0,
      bedrooms: property.bedrooms || 0,
      bathrooms: property.bathrooms || 0,
      sqft: property.total_area_sqft || 0,
      property_type: property.property_type?.name || '',
      listing_type: property.listing_type?.name || '',
      features: property.features?.map(f => f.name).join(', ') || '',
      agent: property.agent ? `${property.agent.first_name} ${property.agent.last_name}` : '',
      neighborhood: property.neighborhood?.name || '',
    }));
    
    await client.indexDocuments(documents);
    console.log(`Indexed ${documents.length} properties with seeksphere`);
    return true;
  } catch (error) {
    console.error('Error initializing seeksphere:', error);
    return false;
  }
};

/**
 * Perform a search using seeksphere
 */
export const searchWithSeeksphere = async (
  filters: SearchFilters,
  page: number = 1,
  limit: number = 20
): Promise<SeeksphereSearchResult> => {
  const startTime = Date.now();
  
  try {
    const client = initializeClient();
    
    // Build seeksphere query
    const query = buildSeeksphereQuery(filters);
    
    // Perform search
    const searchOptions = {
      query,
      limit,
      offset: (page - 1) * limit,
      includeScores: true,
      includeSuggestions: true,
    };
    
    const result = await client.search(searchOptions);
    
    // Transform seeksphere results back to our Property format
    const properties = await transformSeeksphereResults(result.documents || []);
    
    const searchTime = Date.now() - startTime;
    
    return {
      properties,
      total: result.total || 0,
      page,
      limit,
      filters,
      relevance_scores: result.scores || [],
      search_time_ms: searchTime,
      suggestions: result.suggestions || [],
    };
  } catch (error) {
    console.error('Error searching with seeksphere:', error);
    
    // Fallback to empty result
    return {
      properties: [],
      total: 0,
      page,
      limit,
      filters,
      relevance_scores: [],
      search_time_ms: Date.now() - startTime,
      suggestions: [],
    };
  }
};

/**
 * Build seeksphere query from search filters
 */
const buildSeeksphereQuery = (filters: SearchFilters): string => {
  const queryParts: string[] = [];
  
  // Main text query
  if (filters.query) {
    queryParts.push(filters.query);
  }
  
  // Property type filter
  if (filters.property_type) {
    queryParts.push(`property_type:${filters.property_type}`);
  }
  
  // Listing type filter
  if (filters.listing_type) {
    queryParts.push(`listing_type:${filters.listing_type}`);
  }
  
  // Location filters
  if (filters.city) {
    queryParts.push(`location:${filters.city}`);
  }
  
  if (filters.province) {
    queryParts.push(`location:${filters.province}`);
  }
  
  // Price range
  if (filters.min_price || filters.max_price) {
    const minPrice = filters.min_price || 0;
    const maxPrice = filters.max_price || 999999999;
    queryParts.push(`price:[${minPrice} TO ${maxPrice}]`);
  }
  
  // Bedroom filter
  if (filters.bedrooms) {
    queryParts.push(`bedrooms:${filters.bedrooms}`);
  }
  
  // Bathroom filter
  if (filters.bathrooms) {
    queryParts.push(`bathrooms:${filters.bathrooms}`);
  }
  
  // Square footage range
  if (filters.min_sqft || filters.max_sqft) {
    const minSqft = filters.min_sqft || 0;
    const maxSqft = filters.max_sqft || 999999;
    queryParts.push(`sqft:[${minSqft} TO ${maxSqft}]`);
  }
  
  // Features
  if (filters.features && filters.features.length > 0) {
    const featuresQuery = filters.features.map(f => `features:${f}`).join(' OR ');
    queryParts.push(`(${featuresQuery})`);
  }
  
  return queryParts.join(' AND ') || '*';
};

/**
 * Transform seeksphere results back to Property objects
 */
const transformSeeksphereResults = async (documents: any[]): Promise<Property[]> => {
  // Import database functions
  const { getPropertyById } = await import('./database');
  
  // Get full property data for each result
  const properties: Property[] = [];
  
  for (const doc of documents) {
    try {
      const property = await getPropertyById(doc.id);
      if (property) {
        properties.push(property);
      }
    } catch (error) {
      console.error(`Error fetching property ${doc.id}:`, error);
    }
  }
  
  return properties;
};

/**
 * Get search suggestions from seeksphere
 */
export const getSearchSuggestions = async (query: string): Promise<string[]> => {
  try {
    const client = initializeClient();
    
    const result = await client.suggest({
      query,
      limit: 5,
    });
    
    return result.suggestions || [];
  } catch (error) {
    console.error('Error getting search suggestions:', error);
    return [];
  }
};

/**
 * Check if seeksphere is properly configured and available
 */
export const isSeeksphereAvailable = (): boolean => {
  try {
    return !!SeeksphereClient && !!seeksphereConfig.apiKey;
  } catch (error) {
    return false;
  }
};

export { seeksphereConfig };