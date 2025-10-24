// Test script to validate SolanaTracker integration
// Run with: node test-solanatracker-integration.js

const fetch = require('node-fetch');

async function testSolanaTrackerIntegration() {
  console.log('🧪 Testing SolanaTracker Integration...\n');

  try {
    // Test 1: Check if SolanaTracker API key is configured
    const apiKey = process.env.SOLANATRACKER_API_KEY;
    if (!apiKey) {
      console.log('❌ SOLANATRACKER_API_KEY not found in environment variables');
      console.log('   Please add SOLANATRACKER_API_KEY=your_api_key to your .env.local file');
      return;
    }
    console.log('✅ SolanaTracker API key found');

    // Test 2: Test SolanaTracker service initialization
    console.log('\n🔧 Testing SolanaTracker Service...');
    const { SolanaTrackerService } = require('./lib/services/solanatracker-service.ts');
    const service = SolanaTrackerService.getInstance();
    console.log('✅ SolanaTracker service initialized');

    // Test 3: Test platform configuration
    console.log('\n📋 Testing Platform Configuration...');
    const platforms = service.getPlatforms();
    const supportedPlatforms = service.getSupportedPlatforms();
    console.log(`✅ Found ${Object.keys(platforms).length} platforms configured`);
    console.log(`✅ ${supportedPlatforms.length} platforms supported:`, supportedPlatforms.join(', '));

    // Test 4: Test API endpoints (if running in development)
    if (process.env.NODE_ENV === 'development') {
      console.log('\n🌐 Testing API Endpoints...');
      
      try {
        const response = await fetch('http://localhost:3000/api/solanatracker/platforms');
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Platforms API endpoint working');
          console.log(`   Found ${data.data.count} supported platforms`);
        } else {
          console.log('⚠️  Platforms API endpoint returned:', response.status);
        }
      } catch (error) {
        console.log('⚠️  Could not test API endpoints (server may not be running)');
      }
    }

    console.log('\n🎉 SolanaTracker integration test completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Start your development server: npm run dev');
    console.log('   2. Visit the trenches page to see multi-platform tokens');
    console.log('   3. Check the NEW column for tokens from various platforms');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('   Stack trace:', error.stack);
  }
}

// Run the test
testSolanaTrackerIntegration();
