#!/usr/bin/env tsx

import { query, testConnection } from '../src/lib/database';

/**
 * Drop all existing tables and recreate them from schema
 */
async function recreateTables() {
  console.log('🗑️  Dropping existing tables...');
  
  // Drop tables in reverse dependency order
  const dropQueries = [
    'DROP TABLE IF EXISTS property_history CASCADE',
    'DROP TABLE IF EXISTS property_feature_mappings CASCADE',
    'DROP TABLE IF EXISTS property_images CASCADE',
    'DROP TABLE IF EXISTS properties CASCADE',
    'DROP TABLE IF EXISTS agents CASCADE',
    'DROP TABLE IF EXISTS property_features CASCADE',
    'DROP TABLE IF EXISTS property_status CASCADE',
    'DROP TABLE IF EXISTS listing_types CASCADE',
    'DROP TABLE IF EXISTS property_types CASCADE',
    'DROP TABLE IF EXISTS neighborhoods CASCADE',
    'DROP TABLE IF EXISTS cities CASCADE',
    'DROP TABLE IF EXISTS provinces CASCADE'
  ];
  
  for (const dropQuery of dropQueries) {
    try {
      await query(dropQuery);
    } catch (error) {
      // Ignore errors for non-existent tables
      console.log(`Note: ${dropQuery} - table may not exist`);
    }
  }
  
  console.log('✅ All tables dropped');
  
  // Recreate tables from schema
  console.log('📊 Creating tables from schema...');
  
  const fs = await import('fs');
  const path = await import('path');
  
  // Read schema.sql file
  const schemaPath = path.join(process.cwd(), 'schema.sql');
  
  if (!fs.existsSync(schemaPath)) {
    throw new Error(`Schema file not found at ${schemaPath}`);
  }
  
  const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
  
  // Execute schema SQL
  await query(schemaSQL);
  
  console.log('✅ Tables created successfully');
}

async function main() {
  try {
    console.log('🚀 Starting table creation script...');
    
    // Test database connection
    const connected = await testConnection();
    if (!connected) {
      throw new Error('Could not connect to database');
    }
    
    // Recreate all tables
    await recreateTables();
    
    console.log('🎉 Database tables created successfully!');
    console.log('💡 Run "npm run generate-data" to populate with sample data');
    
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

export { recreateTables };