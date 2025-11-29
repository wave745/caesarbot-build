import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') || '30'
    
    // Proxy request to pump.fun API sorted by marketCap for "about to graduate" tokens
    // Fetch more tokens (100) to increase chances of finding tokens in 70-99% range
    const url = `https://advanced-api-v2.pump.fun/coins/list?sortBy=marketCap`
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Fetching pump.fun MC tokens from:', url)
    }
    
    // Fetch more tokens to increase chances of finding tokens in 70-99% range
    // The API doesn't support limit parameter, but we'll filter and limit after
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      // Add timeout to prevent hanging requests - faster for initial load
      signal: AbortSignal.timeout(2000) // 2 second timeout - slightly longer to fetch more data
    })
    
    if (!response.ok) {
      console.warn('⚠️ Pump.fun MC API returned error:', response.status)
      return NextResponse.json(
        { 
          success: false, 
          error: `Pump.fun MC API returned status ${response.status}`,
          coins: []
        },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Pump.fun MC API response:', {
        hasCoins: !!data.coins,
        coinsLength: data.coins?.length || 0,
        hasPagination: !!data.pagination
      })
    }
    
    // Return exactly what the API returns - no filtering, no sorting, no modifications
    return NextResponse.json({
      success: true,
      coins: data.coins || [],
      pagination: data.pagination || {},
      timestamp: Date.now()
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('Error fetching pump.fun MC coins:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        coins: []
      },
      { status: 500 }
    )
  }
}

