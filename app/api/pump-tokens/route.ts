import { NextResponse } from 'next/server'

export async function GET() {
  const maxRetries = 3
  let lastError: Error | null = null
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt} to fetch Pump.fun tokens...`)
      
      const response = await fetch('https://advanced-api-v2.pump.fun/coins/list?sortBy=creationTime', {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'CaesarX/1.0'
        },
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(10000) // 10 second timeout
      })
      
      if (!response.ok) {
        throw new Error(`Pump.fun API responded with status: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log(`Successfully fetched ${data.coins?.length || 0} tokens from Pump.fun`)
      return NextResponse.json(data)
      
    } catch (error) {
      lastError = error as Error
      console.error(`Attempt ${attempt} failed:`, error)
      
      // If this is not the last attempt, wait before retrying
      if (attempt < maxRetries) {
        const delay = attempt * 1000 // Exponential backoff: 1s, 2s, 3s
        console.log(`Waiting ${delay}ms before retry...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  
  // All retries failed
  console.error('All attempts to fetch Pump.fun tokens failed:', lastError)
  return NextResponse.json({ 
    error: 'Failed to fetch tokens after multiple attempts',
    details: lastError?.message || 'Unknown error',
    coins: [] // Return empty array to prevent client crashes
  }, { status: 500 })
}
