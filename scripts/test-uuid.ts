#!/usr/bin/env tsx

import { query, testConnection } from '../src/lib/database';

async function testUuidGeneration() {
  try {
    console.log('🧪 Testing UUID generation...');
    
    // Test database connection
    const connected = await testConnection();
    if (!connected) {
      throw new Error('Could not connect to database');
    }
    
    // Test UUID extension
    console.log('Testing uuid-ossp extension...');
    try {
      await query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
      const result = await query('SELECT uuid_generate_v4() as test_uuid');
      console.log('✅ uuid-ossp extension works:', result.rows[0].test_uuid);
    } catch (error) {
      console.log('❌ uuid-ossp extension failed:', error);
      
      // Try gen_random_uuid
      console.log('Testing gen_random_uuid...');
      try {
        const result = await query('SELECT gen_random_uuid() as test_uuid');
        console.log('✅ gen_random_uuid works:', result.rows[0].test_uuid);
      } catch (error2) {
        console.log('❌ gen_random_uuid failed:', error2);
        
        // Try md5 fallback
        console.log('Testing md5 fallback...');
        try {
          const result = await query("SELECT (md5(random()::text || clock_timestamp()::text))::uuid as test_uuid");
          console.log('✅ md5 fallback works:', result.rows[0].test_uuid);
        } catch (error3) {
          console.log('❌ All UUID methods failed:', error3);
          throw new Error('No UUID generation method available');
        }
      }
    }
    
    console.log('🎉 UUID generation test completed successfully!');
    
  } catch (error) {
    console.error('❌ UUID generation test failed:', error);
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testUuidGeneration();
}

export { testUuidGeneration };