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
      // Add timeout to prevent hanging requests - faster for initial load
      signal: AbortSignal.timeout(1500) // 1.5 second timeout - faster initial load
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
    
    // Filter tokens that are ABOUT TO GRADUATE (70-99% bonding curve progress)
    // EXCLUDE already-graduated tokens (bondingCurveProgress >= 100 or graduationDate in past)
    let filteredCoins = data.coins || []
    if (Array.isArray(filteredCoins)) {
      const now = Date.now()
      // Filter for tokens that are about to graduate (70-99% bonding curve progress)
      filteredCoins = filteredCoins.filter((coin: any) => {
        const bondingCurveProgress = coin.bondingCurveProgress || 0
        const graduationDate = coin.graduationDate || null
        
        // EXCLUDE tokens that have already graduated
        // 1. Bonding curve progress >= 100 means already graduated
        if (bondingCurveProgress >= 100) {
          return false
        }
        
        // 2. If graduationDate exists and is in the past, token has already graduated
        if (graduationDate && typeof graduationDate === 'number' && graduationDate < now) {
          return false
        }
        
        // INCLUDE only tokens with bonding curve progress between 70-99%
        // These are tokens that are about to graduate/migrate
        return bondingCurveProgress >= 70 && bondingCurveProgress < 100
      })
      
      // Sort by bonding curve progress (descending) - tokens closest to graduation first
      filteredCoins.sort((a: any, b: any) => {
        const progressA = a.bondingCurveProgress || 0
        const progressB = b.bondingCurveProgress || 0
        return progressB - progressA
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

