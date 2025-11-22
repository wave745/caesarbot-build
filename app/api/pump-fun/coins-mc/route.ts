import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') || '30'
    
    // Proxy request to pump.fun API sorted by marketCap for "about to graduate" tokens
    const url = `https://advanced-api-v2.pump.fun/coins/list?sortBy=marketCap`
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Fetching pump.fun MC tokens from:', url)
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
    
    // Filter tokens with high market cap (about to graduate) - typically > 80% bonding curve progress
    let filteredCoins = data.coins || []
    if (Array.isArray(filteredCoins)) {
      // Filter for tokens that are close to graduation (high bonding curve progress or high market cap)
      filteredCoins = filteredCoins.filter((coin: any) => {
        const bondingCurveProgress = coin.bondingCurveProgress || 0
        const marketCap = coin.marketCap || 0
        // Include tokens with > 50% bonding curve progress or market cap > $10k
        return bondingCurveProgress > 50 || marketCap > 10000
      })
    }
    
    // Limit results if needed
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

