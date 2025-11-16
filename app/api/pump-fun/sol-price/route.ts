import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const response = await fetch('https://frontend-api-v3.pump.fun/sol-price', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(2000) // 2 second timeout
    })
    
    if (!response.ok) {
      console.warn('⚠️ Pump.fun SOL price API returned error:', response.status)
      return NextResponse.json(
        { 
          success: false, 
          error: `Pump.fun SOL price API returned status ${response.status}`,
          solPrice: 0
        },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    
    // Return with no-cache headers for live trading data
    return NextResponse.json({
      success: true,
      solPrice: data.solPrice || 0,
      timestamp: Date.now()
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('Error fetching pump.fun SOL price:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        solPrice: 0
      },
      { status: 500 }
    )
  }
}


