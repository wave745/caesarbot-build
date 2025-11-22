import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') || '30'
    
    // Proxy request to pump.fun API for graduated tokens
    const url = `https://advanced-api-v2.pump.fun/coins/graduated?sortBy=creationTime`
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Fetching pump.fun graduated tokens from:', url)
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      // Add timeout to prevent hanging requests - fast response for live trading
      signal: AbortSignal.timeout(3000) // 3 second timeout - fast response for live trading
    })
    
    if (!response.ok) {
      console.warn('⚠️ Pump.fun Graduated API returned error:', response.status)
      return NextResponse.json(
        { 
          success: false, 
          error: `Pump.fun Graduated API returned status ${response.status}`,
          coins: []
        },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Pump.fun Graduated API response:', {
        hasCoins: !!data.coins,
        coinsLength: data.coins?.length || 0,
        hasPagination: !!data.pagination
      })
    }
    
    // Limit results if needed
    let filteredCoins = data.coins || []
    if (filteredCoins && Array.isArray(filteredCoins)) {
      const limitNum = parseInt(limit)
      if (limitNum > 0 && filteredCoins.length > limitNum) {
        filteredCoins = filteredCoins.slice(0, limitNum)
      }
    }
    
    // Return with no-cache headers for live trading data
    return NextResponse.json({
      success: true,
      coins: filteredCoins || [],
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
    console.error('Error fetching pump.fun graduated coins:', error)
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

