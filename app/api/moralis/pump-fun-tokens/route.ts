import { NextRequest, NextResponse } from 'next/server'
import { MoralisComprehensiveService } from '@/lib/services/moralis-comprehensive-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '100')
    const timeframe = searchParams.get('timeframe') || '1h'

    console.log(`API: Fetching Pump Fun tokens (limit: ${limit}, timeframe: ${timeframe})`)
    
    const moralisService = MoralisComprehensiveService.getInstance()
    const tokens = await moralisService.getPumpFunTokens(limit, timeframe)

    return NextResponse.json({
      success: true,
      data: tokens,
      meta: {
        limit,
        timeframe,
        count: tokens.length,
        timestamp: Date.now()
      }
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: []
    }, { status: 500 })
  }
}






