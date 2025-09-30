// Test Moralis API with correct headers
const MORALIS_API_KEY = process.env.MORALIS_API_KEY || process.env.NEXT_PUBLIC_MORALIS_API_KEY

async function testMoralisAPI() {
  try {
    console.log('Testing Moralis API with correct headers...')
    
    if (!MORALIS_API_KEY) {
      console.error('Moralis API key not found in environment variables')
      return
    }
    
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'X-API-Key': MORALIS_API_KEY
      }
    }

    const response = await fetch('https://deep-index.moralis.io/api/v2.2/tokens/trending?chain=solana&limit=5', options)
    
    console.log('Response status:', response.status)
    console.log('Response ok:', response.ok)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('API Error:', response.status, response.statusText)
      console.error('Error body:', errorText)
      return
    }
    
    const data = await response.json()
    console.log('Success! Got', data.length, 'tokens')
    console.log('First token:', JSON.stringify(data[0], null, 2))
    
  } catch (error) {
    console.error('Error:', error.message)
    if (error.name === 'AbortError') {
      console.error('Request timed out')
    }
  }
}

testMoralisAPI()
