import { NextResponse } from 'next/server'

export async function GET() {
  const maxRetries = 3
  let lastError: Error | null = null
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt} to fetch Pump.fun MC tokens...`)
      
      const response = await fetch('https://advanced-api-v2.pump.fun/coins/list?sortBy=marketCap', {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'CaesarX/1.0'
        },
        signal: AbortSignal.timeout(10000) // 10 second timeout
      })
      
      if (!response.ok) {
        throw new Error(`Pump.fun MC API responded with status: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log(`Successfully fetched ${data.coins?.length || 0} MC tokens from Pump.fun`)
      return NextResponse.json(data)
      
    } catch (error) {
      lastError = error as Error
      console.error(`MC Attempt ${attempt} failed:`, error)
      
      if (attempt < maxRetries) {
        const delay = attempt * 1000
        console.log(`Waiting ${delay}ms before MC retry...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  
  console.error('All attempts to fetch Pump.fun MC tokens failed:', lastError)
  return NextResponse.json({ 
    error: 'Failed to fetch MC tokens after multiple attempts',
    details: lastError?.message || 'Unknown error',
    coins: []
  }, { status: 500 })
}
