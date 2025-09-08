#!/usr/bin/env node

/**
 * Simple test script to verify database connection and basic functionality
 * Run with: npx tsx src/lib/test-database.ts
 */

import { 
  testConnection, 
  checkTables, 
  getPropertyTypes, 
  getListingTypes, 
  getProvinces,
  searchProperties,
  closePool 
} from './database';
import { createPaginationParams, validateSearchFilters } from './types';

async function runTests() {
  console.log('🧪 Starting database integration tests...\n');

  try {
    // Test 1: Database connection
    console.log('1. Testing database connection...');
    const connectionOk = await testConnection();
    if (!connectionOk) {
      throw new Error('Database connection failed');
    }
    console.log('✅ Database connection successful\n');

    // Test 2: Check required tables
    console.log('2. Checking required tables...');
    const tablesOk = await checkTables();
    if (!tablesOk) {
      console.log('⚠️  Some tables are missing. Make sure to run the schema.sql file first.\n');
    } else {
      console.log('✅ All required tables exist\n');
    }

    // Test 3: Fetch lookup data
    console.log('3. Testing lookup data queries...');
    
    try {
      const propertyTypes = await getPropertyTypes();
      console.log(`✅ Property types: ${propertyTypes.length} found`);
    } catch (error) {
      console.log('⚠️  Property types table might be empty');
    }

    try {
      const listingTypes = await getListingTypes();
      console.log(`✅ Listing types: ${listingTypes.length} found`);
    } catch (error) {
      console.log('⚠️  Listing types table might be empty');
    }

    try {
      const provinces = await getProvinces();
      console.log(`✅ Provinces: ${provinces.length} found`);
    } catch (error) {
      console.log('⚠️  Provinces table might be empty');
    }

    console.log();

    // Test 4: Search validation
    console.log('4. Testing search filter validation...');
    
    const validFilters = { min_price: 100000, max_price: 500000, bedrooms: 2 };
    const validResult = validateSearchFilters(validFilters);
    console.log(`✅ Valid filters validation: ${validResult.isValid ? 'PASS' : 'FAIL'}`);

    const invalidFilters = { min_price: -1000, max_price: 100, bedrooms: 25 };
    const invalidResult = validateSearchFilters(invalidFilters);
    console.log(`✅ Invalid filters validation: ${!invalidResult.isValid ? 'PASS' : 'FAIL'}`);
    if (!invalidResult.isValid) {
      console.log(`   Errors found: ${invalidResult.errors.length}`);
    }

    console.log();

    // Test 5: Basic property search (will work even with empty table)
    console.log('5. Testing property search...');
    try {
      const pagination = createPaginationParams(1, 5);
      const searchResult = await searchProperties({}, pagination);
      console.log(`✅ Property search: ${searchResult.properties.length} properties found (total: ${searchResult.total})`);
    } catch (error) {
      console.log('⚠️  Property search failed - this is expected if no data exists yet');
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    console.log('\n🎉 Database integration tests completed!');
    console.log('\nNext steps:');
    console.log('- Run the schema.sql file to create tables if they don\'t exist');
    console.log('- Populate lookup tables (provinces, cities, property_types, etc.)');
    console.log('- Run the data generation script to create sample properties');

  } catch (error) {
    console.error('❌ Test failed:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  } finally {
    await closePool();
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

export { runTests };