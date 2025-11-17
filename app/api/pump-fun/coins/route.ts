import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sortBy = searchParams.get('sortBy') || 'creationTime'
    const limit = searchParams.get('limit') || '30'
    
    // Proxy request to pump.fun API to avoid CORS issues
    const url = `https://advanced-api-v2.pump.fun/coins/list?sortBy=${sortBy}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 0 }
    })
    
    if (!response.ok) {
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
    
    // Limit results if needed - minimal processing
    const coins = (data.coins && Array.isArray(data.coins)) 
      ? (parseInt(limit) > 0 ? data.coins.slice(0, parseInt(limit)) : data.coins)
      : []
    
    // Return with no-cache headers for live trading data
    return NextResponse.json({
      success: true,
      coins: coins,
      timestamp: Date.now()
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
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


