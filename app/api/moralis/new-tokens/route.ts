import { NextRequest, NextResponse } from 'next/server'
import { MoralisComprehensiveService } from '@/lib/services/moralis-comprehensive-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10') // Default limit for new tokens
    const timeframe = searchParams.get('timeframe') || '1h'
    const realtime = searchParams.get('realtime') === 'true'

    console.log(`API: Fetching new tokens (limit: ${limit}, realtime: ${realtime})`)
    
    const moralisService = MoralisComprehensiveService.getInstance()
    const tokens = await moralisService.getNewTokens(limit, timeframe)

    // Add real-time metadata for live streaming
    const response = {
      success: true,
      data: tokens,
      meta: {
        limit,
        timeframe,
        count: tokens.length,
        timestamp: Date.now(),
        realtime,
        pollingInterval: realtime ? 25 : 30000
      }
    }

    // Add cache headers for real-time requests
    const headers = new Headers()
    if (realtime) {
      headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
      headers.set('Pragma', 'no-cache')
      headers.set('Expires', '0')
    }

    return NextResponse.json(response, { headers })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: []
    }, { status: 500 })
  }
}


