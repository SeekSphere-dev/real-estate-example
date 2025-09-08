import { Pool, PoolClient } from 'pg';

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'seeksphere_real_estate',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
};

// Create a connection pool
const pool = new Pool(dbConfig);

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

/**
 * Test database connection
 */
export const testConnection = async (): Promise<boolean> => {
  try {
    const result = await query('SELECT NOW() as current_time');
    console.log('Database connection successful:', result.rows[0].current_time);
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
};

/**
 * Check if required tables exist
 */
export const checkTables = async (): Promise<boolean> => {
  try {
    const requiredTables = [
      'provinces', 'cities', 'neighborhoods', 'property_types', 
      'listing_types', 'property_status', 'agents', 'properties',
      'property_features', 'property_feature_mappings', 'property_images',
      'property_history'
    ];

    const result = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = ANY($1)
    `, [requiredTables]);

    const existingTables = result.rows.map(row => row.table_name);
    const missingTables = requiredTables.filter(table => !existingTables.includes(table));

    if (missingTables.length > 0) {
      console.error('Missing required tables:', missingTables);
      return false;
    }

    console.log('All required tables exist');
    return true;
  } catch (error) {
    console.error('Error checking tables:', error);
    return false;
  }
};

/**
 * Get a client from the connection pool
 */
export const getClient = async (): Promise<PoolClient> => {
  try {
    const client = await pool.connect();
    return client;
  } catch (error) {
    console.error('Error connecting to database:', error);
    throw error;
  }
};

/**
 * Execute a query with automatic client management
 */
export const query = async (text: string, params?: any[]) => {
  const client = await getClient();
  try {
    const result = await client.query(text, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Execute multiple queries in a transaction
 */
export const transaction = async (queries: Array<{ text: string; params?: any[] }>) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const results = [];
    
    for (const queryObj of queries) {
      const result = await client.query(queryObj.text, queryObj.params);
      results.push(result);
    }
    
    await client.query('COMMIT');
    return results;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Transaction error:', error);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Close the database pool (useful for cleanup)
 */
export const closePool = async () => {
  await pool.end();
};

// Property data access functions
import type { 
  Property, 
  SearchFilters, 
  SearchResult, 
  PaginationParams, 
  SortOptions,
  Agent,
  PropertyImage,
  PropertyFeature
} from './types';

/**
 * Get a single property by ID with all related data
 */
export const getPropertyById = async (id: string): Promise<Property | null> => {
  try {
    const propertyQuery = `
      SELECT 
        p.*,
        pt.name as property_type_name,
        pt.description as property_type_description,
        lt.name as listing_type_name,
        lt.description as listing_type_description,
        ps.name as status_name,
        ps.is_available as status_available,
        a.first_name as agent_first_name,
        a.last_name as agent_last_name,
        a.email as agent_email,
        a.phone as agent_phone,
        a.agency_name as agent_agency,
        c.name as city_name,
        pr.name as province_name,
        pr.code as province_code,
        n.name as neighborhood_name
      FROM properties p
      LEFT JOIN property_types pt ON p.property_type_id = pt.id
      LEFT JOIN listing_types lt ON p.listing_type_id = lt.id
      LEFT JOIN property_status ps ON p.status_id = ps.id
      LEFT JOIN agents a ON p.agent_id = a.id
      LEFT JOIN cities c ON p.city_id = c.id
      LEFT JOIN provinces pr ON p.province_id = pr.id
      LEFT JOIN neighborhoods n ON p.neighborhood_id = n.id
      WHERE p.id = $1
    `;

    const result = await query(propertyQuery, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    
    // Get property images
    const imagesResult = await query(
      'SELECT * FROM property_images WHERE property_id = $1 ORDER BY display_order, is_primary DESC',
      [id]
    );

    // Get property features
    const featuresResult = await query(`
      SELECT pf.* 
      FROM property_features pf
      JOIN property_feature_mappings pfm ON pf.id = pfm.feature_id
      WHERE pfm.property_id = $1
      ORDER BY pf.category, pf.name
    `, [id]);

    return mapRowToProperty(row, imagesResult.rows, featuresResult.rows);
  } catch (error) {
    console.error('Error fetching property by ID:', error);
    throw new Error(`Failed to fetch property with ID ${id}`);
  }
};

/**
 * Search properties with filters and pagination
 */
export const searchProperties = async (
  filters: SearchFilters = {},
  pagination: PaginationParams = { page: 1, limit: 20, offset: 0 },
  sort: SortOptions = { field: 'date', direction: 'desc' }
): Promise<SearchResult> => {
  try {
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    // Build WHERE conditions
    if (filters.query) {
      conditions.push(`(p.title ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`);
      params.push(`%${filters.query}%`);
      paramIndex++;
    }

    if (filters.property_type) {
      conditions.push(`pt.name = $${paramIndex}`);
      params.push(filters.property_type);
      paramIndex++;
    }

    if (filters.listing_type) {
      conditions.push(`lt.name = $${paramIndex}`);
      params.push(filters.listing_type);
      paramIndex++;
    }

    if (filters.min_price) {
      conditions.push(`(p.list_price >= $${paramIndex} OR p.monthly_rent >= $${paramIndex})`);
      params.push(filters.min_price);
      paramIndex++;
    }

    if (filters.max_price) {
      conditions.push(`(p.list_price <= $${paramIndex} OR p.monthly_rent <= $${paramIndex})`);
      params.push(filters.max_price);
      paramIndex++;
    }

    if (filters.bedrooms) {
      conditions.push(`p.bedrooms >= $${paramIndex}`);
      params.push(filters.bedrooms);
      paramIndex++;
    }

    if (filters.bathrooms) {
      conditions.push(`p.bathrooms >= $${paramIndex}`);
      params.push(filters.bathrooms);
      paramIndex++;
    }

    if (filters.city) {
      conditions.push(`c.name ILIKE $${paramIndex}`);
      params.push(`%${filters.city}%`);
      paramIndex++;
    }

    if (filters.province) {
      conditions.push(`(pr.code = $${paramIndex} OR pr.name ILIKE $${paramIndex + 1})`);
      params.push(filters.province);
      params.push(`%${filters.province}%`);
      paramIndex += 2;
    }

    if (filters.min_sqft) {
      conditions.push(`p.total_area_sqft >= $${paramIndex}`);
      params.push(filters.min_sqft);
      paramIndex++;
    }

    if (filters.max_sqft) {
      conditions.push(`p.total_area_sqft <= $${paramIndex}`);
      params.push(filters.max_sqft);
      paramIndex++;
    }

    if (filters.parking_spaces) {
      conditions.push(`p.parking_spaces >= $${paramIndex}`);
      params.push(filters.parking_spaces);
      paramIndex++;
    }

    if (filters.pet_friendly !== undefined) {
      conditions.push(`p.pet_friendly = $${paramIndex}`);
      params.push(filters.pet_friendly);
      paramIndex++;
    }

    if (filters.furnished !== undefined) {
      conditions.push(`p.furnished = $${paramIndex}`);
      params.push(filters.furnished);
      paramIndex++;
    }

    // Handle features filter
    if (filters.features && filters.features.length > 0) {
      conditions.push(`p.id IN (
        SELECT pfm.property_id 
        FROM property_feature_mappings pfm
        JOIN property_features pf ON pfm.feature_id = pf.id
        WHERE pf.name = ANY($${paramIndex})
        GROUP BY pfm.property_id
        HAVING COUNT(DISTINCT pf.name) = $${paramIndex + 1}
      )`);
      params.push(filters.features);
      params.push(filters.features.length);
      paramIndex += 2;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Build ORDER BY clause
    let orderBy = 'ORDER BY ';
    switch (sort.field) {
      case 'price':
        orderBy += `COALESCE(p.list_price, p.monthly_rent) ${sort.direction.toUpperCase()}`;
        break;
      case 'size':
        orderBy += `p.total_area_sqft ${sort.direction.toUpperCase()}`;
        break;
      case 'bedrooms':
        orderBy += `p.bedrooms ${sort.direction.toUpperCase()}`;
        break;
      case 'bathrooms':
        orderBy += `p.bathrooms ${sort.direction.toUpperCase()}`;
        break;
      case 'date':
      default:
        orderBy += `p.created_at ${sort.direction.toUpperCase()}`;
        break;
    }

    // Count total results
    const countQuery = `
      SELECT COUNT(*) as total
      FROM properties p
      LEFT JOIN property_types pt ON p.property_type_id = pt.id
      LEFT JOIN listing_types lt ON p.listing_type_id = lt.id
      LEFT JOIN cities c ON p.city_id = c.id
      LEFT JOIN provinces pr ON p.province_id = pr.id
      ${whereClause}
    `;

    const countResult = await query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Get paginated results
    const searchQuery = `
      SELECT 
        p.*,
        pt.name as property_type_name,
        lt.name as listing_type_name,
        c.name as city_name,
        pr.name as province_name,
        pr.code as province_code
      FROM properties p
      LEFT JOIN property_types pt ON p.property_type_id = pt.id
      LEFT JOIN listing_types lt ON p.listing_type_id = lt.id
      LEFT JOIN cities c ON p.city_id = c.id
      LEFT JOIN provinces pr ON p.province_id = pr.id
      ${whereClause}
      ${orderBy}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(pagination.limit, pagination.offset);
    const searchResult = await query(searchQuery, params);

    // Get images for all properties in one query
    const propertyIds = searchResult.rows.map(row => row.id);
    let images: PropertyImage[] = [];
    
    if (propertyIds.length > 0) {
      const imagesResult = await query(
        'SELECT * FROM property_images WHERE property_id = ANY($1) ORDER BY property_id, display_order, is_primary DESC',
        [propertyIds]
      );
      images = imagesResult.rows;
    }

    // Map results to Property objects
    const properties = searchResult.rows.map(row => {
      const propertyImages = images.filter(img => img.property_id === row.id);
      return mapRowToProperty(row, propertyImages, []);
    });

    return {
      properties,
      total,
      page: pagination.page,
      limit: pagination.limit,
      filters
    };
  } catch (error) {
    console.error('Error searching properties:', error);
    throw new Error('Failed to search properties');
  }
};

/**
 * Get all property types
 */
export const getPropertyTypes = async () => {
  try {
    const result = await query('SELECT * FROM property_types ORDER BY name');
    return result.rows;
  } catch (error) {
    console.error('Error fetching property types:', error);
    throw new Error('Failed to fetch property types');
  }
};

/**
 * Get all listing types
 */
export const getListingTypes = async () => {
  try {
    const result = await query('SELECT * FROM listing_types ORDER BY name');
    return result.rows;
  } catch (error) {
    console.error('Error fetching listing types:', error);
    throw new Error('Failed to fetch listing types');
  }
};

/**
 * Get all cities for a province
 */
export const getCitiesByProvince = async (provinceId: number) => {
  try {
    const result = await query(
      'SELECT * FROM cities WHERE province_id = $1 ORDER BY name',
      [provinceId]
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching cities:', error);
    throw new Error('Failed to fetch cities');
  }
};

/**
 * Get all provinces
 */
export const getProvinces = async () => {
  try {
    const result = await query('SELECT * FROM provinces ORDER BY name');
    return result.rows;
  } catch (error) {
    console.error('Error fetching provinces:', error);
    throw new Error('Failed to fetch provinces');
  }
};

/**
 * Get all property features
 */
export const getPropertyFeatures = async () => {
  try {
    const result = await query('SELECT * FROM property_features ORDER BY category, name');
    return result.rows;
  } catch (error) {
    console.error('Error fetching property features:', error);
    throw new Error('Failed to fetch property features');
  }
};

/**
 * Helper function to map database row to Property object
 */
function mapRowToProperty(row: any, images: any[] = [], features: any[] = []): Property {
  return {
    id: row.id,
    mls_number: row.mls_number,
    property_type_id: row.property_type_id,
    listing_type_id: row.listing_type_id,
    status_id: row.status_id,
    agent_id: row.agent_id,
    
    // Location
    street_address: row.street_address,
    unit_number: row.unit_number,
    neighborhood_id: row.neighborhood_id,
    city_id: row.city_id,
    province_id: row.province_id,
    postal_code: row.postal_code,
    latitude: row.latitude ? parseFloat(row.latitude) : undefined,
    longitude: row.longitude ? parseFloat(row.longitude) : undefined,
    
    // Basic details
    title: row.title,
    description: row.description,
    year_built: row.year_built,
    
    // Size and layout
    total_area_sqft: row.total_area_sqft,
    lot_size_sqft: row.lot_size_sqft,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms ? parseFloat(row.bathrooms) : undefined,
    half_bathrooms: row.half_bathrooms || 0,
    floors: row.floors,
    
    // Pricing
    list_price: row.list_price ? parseFloat(row.list_price) : undefined,
    price_per_sqft: row.price_per_sqft ? parseFloat(row.price_per_sqft) : undefined,
    monthly_rent: row.monthly_rent ? parseFloat(row.monthly_rent) : undefined,
    maintenance_fee: row.maintenance_fee ? parseFloat(row.maintenance_fee) : undefined,
    property_taxes_annual: row.property_taxes_annual ? parseFloat(row.property_taxes_annual) : undefined,
    
    // Utilities and costs
    heating_type: row.heating_type,
    cooling_type: row.cooling_type,
    utilities_included: row.utilities_included || [],
    
    // Building amenities
    parking_spaces: row.parking_spaces || 0,
    parking_type: row.parking_type,
    pet_friendly: row.pet_friendly || false,
    furnished: row.furnished || false,
    
    // Timestamps
    listed_date: row.listed_date ? new Date(row.listed_date) : undefined,
    available_date: row.available_date ? new Date(row.available_date) : undefined,
    sold_date: row.sold_date ? new Date(row.sold_date) : undefined,
    last_updated: new Date(row.last_updated),
    created_at: new Date(row.created_at),
    
    // Relations
    property_type: row.property_type_name ? {
      id: row.property_type_id,
      name: row.property_type_name,
      description: row.property_type_description,
      category: row.property_type_category,
      created_at: new Date()
    } : undefined,
    
    listing_type: row.listing_type_name ? {
      id: row.listing_type_id,
      name: row.listing_type_name,
      description: row.listing_type_description,
      created_at: new Date()
    } : undefined,
    
    status: row.status_name ? {
      id: row.status_id,
      name: row.status_name,
      description: row.status_description,
      is_available: row.status_available,
      created_at: new Date()
    } : undefined,
    
    agent: row.agent_first_name ? {
      id: row.agent_id,
      first_name: row.agent_first_name,
      last_name: row.agent_last_name,
      email: row.agent_email,
      phone: row.agent_phone,
      license_number: row.agent_license_number,
      agency_name: row.agent_agency,
      years_experience: row.agent_years_experience,
      rating: row.agent_rating ? parseFloat(row.agent_rating) : undefined,
      total_reviews: row.agent_total_reviews || 0,
      created_at: new Date()
    } : undefined,
    
    city: row.city_name ? {
      id: row.city_id,
      name: row.city_name,
      province_id: row.province_id,
      population: row.city_population,
      latitude: row.city_latitude ? parseFloat(row.city_latitude) : undefined,
      longitude: row.city_longitude ? parseFloat(row.city_longitude) : undefined,
      created_at: new Date()
    } : undefined,
    
    province: row.province_name ? {
      id: row.province_id,
      code: row.province_code,
      name: row.province_name,
      country_code: row.province_country_code || 'CA',
      created_at: new Date()
    } : undefined,
    
    neighborhood: row.neighborhood_name ? {
      id: row.neighborhood_id,
      name: row.neighborhood_name,
      city_id: row.city_id,
      average_income: row.neighborhood_average_income,
      walkability_score: row.neighborhood_walkability_score,
      safety_rating: row.neighborhood_safety_rating,
      created_at: new Date()
    } : undefined,
    
    images: images.map(img => ({
      id: img.id,
      property_id: img.property_id,
      image_url: img.image_url,
      image_type: img.image_type,
      caption: img.caption,
      display_order: img.display_order,
      is_primary: img.is_primary,
      created_at: new Date(img.created_at)
    })),
    
    features: features.map(feature => ({
      id: feature.id,
      name: feature.name,
      category: feature.category,
      description: feature.description,
      created_at: new Date(feature.created_at)
    }))
  };
}

export default pool;