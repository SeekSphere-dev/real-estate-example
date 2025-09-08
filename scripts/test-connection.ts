#!/usr/bin/env tsx

import { testConnection, checkTables, query } from '../src/lib/database';

async function testDatabaseSetup() {
  console.log('Testing database connection and setup...\n');
  
  try {
    // Test basic connection
    console.log('1. Testing database connection...');
    const connected = await testConnection();
    if (!connected) {
      console.error('❌ Database connection failed');
      return false;
    }
    console.log('✅ Database connection successful\n');
    
    // Check if tables exist
    console.log('2. Checking required tables...');
    const tablesExist = await checkTables();
    if (!tablesExist) {
      console.error('❌ Required tables do not exist. Please run schema.sql first.');
      return false;
    }
    console.log('✅ All required tables exist\n');
    
    // Check current data counts
    console.log('3. Checking existing data...');
    const counts = await query(`
      SELECT 
        (SELECT COUNT(*) FROM properties) as properties,
        (SELECT COUNT(*) FROM agents) as agents,
        (SELECT COUNT(*) FROM cities) as cities,
        (SELECT COUNT(*) FROM provinces) as provinces
    `);
    
    const data = counts.rows[0];
    console.log(`   Properties: ${data.properties}`);
    console.log(`   Agents: ${data.agents}`);
    console.log(`   Cities: ${data.cities}`);
    console.log(`   Provinces: ${data.provinces}`);
    
    if (parseInt(data.properties) > 0) {
      console.log('\n⚠️  Database already contains property data.');
      console.log('   The generation script will add to existing data, not replace it.');
    }
    
    console.log('\n✅ Database is ready for data generation!');
    console.log('\nTo generate data, run: npm run generate-data');
    
    return true;
    
  } catch (error) {
    console.error('❌ Database setup test failed:', error);
    return false;
  }
}

// Run the test
if (require.main === module) {
  testDatabaseSetup().then((success) => {
    process.exit(success ? 0 : 1);
  });
}

export { testDatabaseSetup };