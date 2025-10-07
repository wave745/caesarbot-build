// Simple test script to verify APIs work
const testAPIs = async () => {
  console.log('Testing API endpoints...')
  
  try {
    // Test health endpoint
    console.log('Testing /api/health...')
    const healthResponse = await fetch('http://localhost:3000/api/health')
    console.log('Health status:', healthResponse.status)
    
    // Test SOL price endpoint
    console.log('Testing /api/moralis/token-prices...')
    const priceResponse = await fetch('http://localhost:3000/api/moralis/token-prices?tokenAddresses=So11111111111111111111111111111111111111112&chain=solana')
    const priceData = await priceResponse.json()
    console.log('Price response:', priceData)
    
    // Test Jupiter endpoint
    console.log('Testing /api/jupiter/price...')
    const jupiterResponse = await fetch('http://localhost:3000/api/jupiter/price?address=So11111111111111111111111111111111111111112')
    const jupiterData = await jupiterResponse.json()
    console.log('Jupiter response:', jupiterData)
    
  } catch (error) {
    console.error('Test failed:', error)
  }
}

testAPIs()
