import { NextRequest, NextResponse } from 'next/server'
import { MoralisComprehensiveService } from '@/lib/services/moralis-comprehensive-service'

const moralisService = MoralisComprehensiveService.getInstance()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '100')
    const timeframe = searchParams.get('timeframe') || '1h'
    
    console.log(`API: Fetching new tokens via SSE (limit: ${limit}, timeframe: ${timeframe})`)
    
    const tokens = await moralisService.getNewTokens(limit, timeframe)
    
    return NextResponse.json({
      success: true,
      tokens,
      isConnected: true,
      timestamp: Date.now()
    })
  } catch (error) {
    console.error('Error fetching new tokens:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      tokens: [],
      isConnected: false
    }, { status: 500 })
  }
}


