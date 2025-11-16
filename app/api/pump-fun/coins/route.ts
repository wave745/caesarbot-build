import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sortBy = searchParams.get('sortBy') || 'creationTime'
    const limit = searchParams.get('limit') || '30'
    
    // Proxy request to pump.fun API to avoid CORS issues
    const url = `https://advanced-api-v2.pump.fun/coins/list?sortBy=${sortBy}`
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Fetching pump.fun tokens from:', url)
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
      console.warn('⚠️ Pump.fun API returned error:', response.status)
      return NextResponse.json(
        { 
          success: false, 
          error: `Pump.fun API returned status ${response.status}`,
          coins: []
        },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Pump.fun API response:', {
        hasCoins: !!data.coins,
        coinsLength: data.coins?.length || 0,
        hasPagination: !!data.pagination
      })
    }
    
    // Limit results if needed
    if (data.coins && Array.isArray(data.coins)) {
      const limitNum = parseInt(limit)
      if (limitNum > 0 && data.coins.length > limitNum) {
        data.coins = data.coins.slice(0, limitNum)
      }
    }
    
    // Return with no-cache headers for live trading data
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
    console.error('Error fetching pump.fun coins:', error)
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


