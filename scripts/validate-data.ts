#!/usr/bin/env tsx

import { query } from '../src/lib/database';

async function validateGeneratedData() {
  console.log('Validating generated data quality...\n');
  
  try {
    // Basic counts
    console.log('=== Data Counts ===');
    const counts = await query(`
      SELECT 
        (SELECT COUNT(*) FROM properties) as properties,
        (SELECT COUNT(*) FROM agents) as agents,
        (SELECT COUNT(*) FROM property_images) as images,
        (SELECT COUNT(*) FROM property_feature_mappings) as feature_mappings,
        (SELECT COUNT(*) FROM cities) as cities,
        (SELECT COUNT(*) FROM provinces) as provinces,
        (SELECT COUNT(*) FROM property_features) as features
    `);
    
    const data = counts.rows[0];
    console.log(`Properties: ${data.properties}`);
    console.log(`Agents: ${data.agents}`);
    console.log(`Images: ${data.images}`);
    console.log(`Feature Mappings: ${data.feature_mappings}`);
    console.log(`Cities: ${data.cities}`);
    console.log(`Provinces: ${data.provinces}`);
    console.log(`Features: ${data.features}\n`);
    
    // Property type distribution
    console.log('=== Property Type Distribution ===');
    const typeDistribution = await query(`
      SELECT pt.name, COUNT(*) as count, 
             ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM properties), 2) as percentage
      FROM properties p
      JOIN property_types pt ON p.property_type_id = pt.id
      GROUP BY pt.name
      ORDER BY count DESC
    `);
    
    typeDistribution.rows.forEach(row => {
      console.log(`${row.name}: ${row.count} (${row.percentage}%)`);
    });
    
    // Listing type distribution
    console.log('\n=== Listing Type Distribution ===');
    const listingDistribution = await query(`
      SELECT lt.name, COUNT(*) as count,
             ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM properties), 2) as percentage
      FROM properties p
      JOIN listing_types lt ON p.listing_type_id = lt.id
      GROUP BY lt.name
      ORDER BY count DESC
    `);
    
    listingDistribution.rows.forEach(row => {
      console.log(`${row.name}: ${row.count} (${row.percentage}%)`);
    });
    
    // Price ranges
    console.log('\n=== Price Ranges ===');
    const priceRanges = await query(`
      SELECT 
        COUNT(CASE WHEN list_price IS NOT NULL THEN 1 END) as for_sale_count,
        ROUND(AVG(list_price), 2) as avg_sale_price,
        MIN(list_price) as min_sale_price,
        MAX(list_price) as max_sale_price,
        COUNT(CASE WHEN monthly_rent IS NOT NULL THEN 1 END) as for_rent_count,
        ROUND(AVG(monthly_rent), 2) as avg_rent_price,
        MIN(monthly_rent) as min_rent_price,
        MAX(monthly_rent) as max_rent_price
      FROM properties
    `);
    
    const prices = priceRanges.rows[0];
    console.log(`For Sale Properties: ${prices.for_sale_count}`);
    console.log(`  Average Price: $${prices.avg_sale_price?.toLocaleString()}`);
    console.log(`  Price Range: $${prices.min_sale_price?.toLocaleString()} - $${prices.max_sale_price?.toLocaleString()}`);
    console.log(`For Rent Properties: ${prices.for_rent_count}`);
    console.log(`  Average Rent: $${prices.avg_rent_price?.toLocaleString()}/month`);
    console.log(`  Rent Range: $${prices.min_rent_price?.toLocaleString()} - $${prices.max_rent_price?.toLocaleString()}/month`);
    
    // Geographic distribution
    console.log('\n=== Geographic Distribution (Top 10 Cities) ===');
    const geoDistribution = await query(`
      SELECT c.name as city, pr.name as province, COUNT(*) as property_count
      FROM properties p
      JOIN cities c ON p.city_id = c.id
      JOIN provinces pr ON p.province_id = pr.id
      GROUP BY c.name, pr.name
      ORDER BY property_count DESC
      LIMIT 10
    `);
    
    geoDistribution.rows.forEach(row => {
      console.log(`${row.city}, ${row.province}: ${row.property_count} properties`);
    });
    
    // Bedroom distribution
    console.log('\n=== Bedroom Distribution ===');
    const bedroomDistribution = await query(`
      SELECT 
        CASE 
          WHEN bedrooms = 0 THEN 'Studio'
          WHEN bedrooms IS NULL THEN 'Unknown'
          ELSE bedrooms || ' bedroom' || CASE WHEN bedrooms > 1 THEN 's' ELSE '' END
        END as bedroom_type,
        COUNT(*) as count
      FROM properties
      GROUP BY bedrooms
      ORDER BY bedrooms NULLS LAST
    `);
    
    bedroomDistribution.rows.forEach(row => {
      console.log(`${row.bedroom_type}: ${row.count}`);
    });
    
    // Data quality checks
    console.log('\n=== Data Quality Checks ===');
    
    // Check for properties without images
    const noImages = await query(`
      SELECT COUNT(*) as count
      FROM properties p
      LEFT JOIN property_images pi ON p.id = pi.property_id
      WHERE pi.property_id IS NULL
    `);
    console.log(`Properties without images: ${noImages.rows[0].count}`);
    
    // Check for properties without features
    const noFeatures = await query(`
      SELECT COUNT(*) as count
      FROM properties p
      LEFT JOIN property_feature_mappings pfm ON p.id = pfm.property_id
      WHERE pfm.property_id IS NULL
    `);
    console.log(`Properties without features: ${noFeatures.rows[0].count}`);
    
    // Check for missing required fields
    const missingData = await query(`
      SELECT 
        COUNT(CASE WHEN title IS NULL OR title = '' THEN 1 END) as missing_title,
        COUNT(CASE WHEN street_address IS NULL OR street_address = '' THEN 1 END) as missing_address,
        COUNT(CASE WHEN list_price IS NULL AND monthly_rent IS NULL THEN 1 END) as missing_price
      FROM properties
    `);
    
    const missing = missingData.rows[0];
    console.log(`Missing titles: ${missing.missing_title}`);
    console.log(`Missing addresses: ${missing.missing_address}`);
    console.log(`Missing prices (both sale and rent): ${missing.missing_price}`);
    
    // Agent distribution
    console.log('\n=== Agent Statistics ===');
    const agentStats = await query(`
      SELECT 
        COUNT(*) as total_agents,
        ROUND(AVG(years_experience), 1) as avg_experience,
        ROUND(AVG(rating), 2) as avg_rating,
        COUNT(DISTINCT agency_name) as unique_agencies
      FROM agents
    `);
    
    const agentData = agentStats.rows[0];
    console.log(`Total Agents: ${agentData.total_agents}`);
    console.log(`Average Experience: ${agentData.avg_experience} years`);
    console.log(`Average Rating: ${agentData.avg_rating}/5.0`);
    console.log(`Unique Agencies: ${agentData.unique_agencies}`);
    
    console.log('\n✅ Data validation complete!');
    
  } catch (error) {
    console.error('❌ Data validation failed:', error);
    return false;
  }
  
  return true;
}

// Run the validation
if (require.main === module) {
  validateGeneratedData().then((success) => {
    process.exit(success ? 0 : 1);
  });
}

export { validateGeneratedData };