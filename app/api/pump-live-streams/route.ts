import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '48')
    const offset = parseInt(searchParams.get('offset') || '0')
    const includeNsfw = searchParams.get('includeNsfw') || 'false'
    const order = searchParams.get('order') || 'DESC'
    
    console.log(`API: Fetching currently live streams (limit: ${limit}, offset: ${offset})`)
    
    // Construct the pump.fun API URL
    const pumpFunUrl = `https://frontend-api-v3.pump.fun/coins/currently-live?offset=${offset}&limit=${limit}&includeNsfw=${includeNsfw}&order=${order}`
    
    console.log(`API: Fetching from pump.fun: ${pumpFunUrl}`)
    
    // Fetch from pump.fun API with proper headers
    const response = await fetch(pumpFunUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      // Add timeout
      signal: AbortSignal.timeout(10000) // 10 second timeout
    })
    
    if (!response.ok) {
      throw new Error(`Pump.fun API returned ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    
    console.log(`API: Successfully fetched ${data.length} live streams`)
    
    return NextResponse.json({
      success: true,
      data,
      count: data.length,
      timestamp: Date.now(),
      source: 'pump.fun'
    })
    
  } catch (error) {
    console.error('API: Error fetching live streams:', error)
    
    // Return fallback data instead of error
    const fallbackData = []
    
    return NextResponse.json({
      success: false,
      data: fallbackData,
      count: fallbackData.length,
      timestamp: Date.now(),
      source: 'fallback',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
