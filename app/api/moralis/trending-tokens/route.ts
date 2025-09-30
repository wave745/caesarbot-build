import { NextRequest, NextResponse } from 'next/server'
import { MoralisComprehensiveService } from '@/lib/services/moralis-comprehensive-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const timeframe = searchParams.get('timeframe') || '1h'

    console.log(`API: Fetching trending tokens with limit: ${limit}, timeframe: ${timeframe}`)

    const moralisService = MoralisComprehensiveService.getInstance()
    const trendingTokens = await moralisService.getTrendingTokens(limit, timeframe)

    return NextResponse.json({
      success: true,
      data: trendingTokens,
      meta: {
        limit,
        timeframe,
        timestamp: Date.now(),
        pollingInterval: 3000 // 3 seconds for real-time updates
      }
    })
  } catch (error) {
    console.error('API Error:', error)
    
    // Return empty array instead of error to prevent UI issues
    return NextResponse.json({
      success: true,
      data: [],
      meta: {
        limit: parseInt(searchParams.get('limit') || '10'),
        timeframe: searchParams.get('timeframe') || '1h',
        timestamp: Date.now(),
        pollingInterval: 3000,
        error: 'API timeout - showing empty state'
      }
    })
  }
}
