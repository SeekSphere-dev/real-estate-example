-- Enable UUID extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create a fallback UUID function if the extension isn't available
CREATE OR REPLACE FUNCTION generate_uuid_fallback()
RETURNS UUID AS $$
BEGIN
    -- Try uuid_generate_v4() first
    BEGIN
        RETURN uuid_generate_v4();
    EXCEPTION
        WHEN OTHERS THEN
            -- Fallback to gen_random_uuid() (PostgreSQL 13+)
            BEGIN
                RETURN gen_random_uuid();
            EXCEPTION
                WHEN OTHERS THEN
                    -- Final fallback using md5 hash
                    RETURN (md5(random()::text || clock_timestamp()::text))::uuid;
            END;
    END;
END;
$$ LANGUAGE plpgsql;

-- 1. Provinces lookup table
CREATE TABLE provinces (
    id SERIAL PRIMARY KEY,
    code VARCHAR(2) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    country_code VARCHAR(2) DEFAULT 'CA',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Cities lookup table
CREATE TABLE cities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    province_id INTEGER NOT NULL REFERENCES provinces(id),
    population INTEGER,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Neighborhoods within cities
CREATE TABLE neighborhoods (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    city_id INTEGER NOT NULL REFERENCES cities(id),
    average_income INTEGER,
    walkability_score INTEGER CHECK (walkability_score >= 0 AND walkability_score <= 100),
    safety_rating INTEGER CHECK (safety_rating >= 1 AND safety_rating <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Property types lookup
CREATE TABLE property_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(50), -- residential, commercial, industrial
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Listing types (sale, rent, lease, etc.)
CREATE TABLE listing_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Property status
CREATE TABLE property_status (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Real estate agents
CREATE TABLE agents (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    license_number VARCHAR(50) UNIQUE,
    agency_name VARCHAR(100),
    years_experience INTEGER,
    rating DECIMAL(3,2) CHECK (rating >= 0 AND rating <= 5),
    total_reviews INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Main properties table
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT generate_uuid_fallback(),
    mls_number VARCHAR(50) UNIQUE,
    property_type_id INTEGER NOT NULL REFERENCES property_types(id),
    listing_type_id INTEGER NOT NULL REFERENCES listing_types(id),
    status_id INTEGER NOT NULL REFERENCES property_status(id),
    agent_id INTEGER REFERENCES agents(id),

    -- Location
    street_address VARCHAR(200) NOT NULL,
    unit_number VARCHAR(20),
    neighborhood_id INTEGER REFERENCES neighborhoods(id),
    city_id INTEGER NOT NULL REFERENCES cities(id),
    province_id INTEGER NOT NULL REFERENCES provinces(id),
    postal_code VARCHAR(10),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),

    -- Basic details
    title VARCHAR(200) NOT NULL,
    description TEXT,
    year_built INTEGER,

    -- Size and layout
    total_area_sqft INTEGER,
    lot_size_sqft INTEGER,
    bedrooms INTEGER,
    bathrooms DECIMAL(3,1),
    half_bathrooms INTEGER DEFAULT 0,
    floors INTEGER,

    -- Pricing
    list_price DECIMAL(12,2),
    price_per_sqft DECIMAL(8,2),
    monthly_rent DECIMAL(10,2),
    maintenance_fee DECIMAL(8,2),
    property_taxes_annual DECIMAL(10,2),

    -- Utilities and costs
    heating_type VARCHAR(50),
    cooling_type VARCHAR(50),
    utilities_included TEXT[], -- array of included utilities

    -- Building amenities
    parking_spaces INTEGER DEFAULT 0,
    parking_type VARCHAR(50), -- garage, driveway, street, etc.
    pet_friendly BOOLEAN DEFAULT false,
    furnished BOOLEAN DEFAULT false,

    -- Timestamps
    listed_date DATE,
    available_date DATE,
    sold_date DATE,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Search optimization
    search_vector tsvector
);

-- 9. Property features/amenities lookup
CREATE TABLE property_features (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50), -- interior, exterior, building, neighborhood
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Many-to-many relationship for property features
CREATE TABLE property_feature_mappings (
    id SERIAL PRIMARY KEY,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    feature_id INTEGER NOT NULL REFERENCES property_features(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(property_id, feature_id)
);

-- 11. Property images
CREATE TABLE property_images (
    id SERIAL PRIMARY KEY,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    image_type VARCHAR(50), -- exterior, interior, floor_plan, etc.
    caption TEXT,
    display_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. Property price/status history
CREATE TABLE property_history (
    id SERIAL PRIMARY KEY,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- price_change, status_change, listing
    old_value TEXT,
    new_value TEXT,
    price_change DECIMAL(12,2),
    status_change VARCHAR(100),
    event_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);