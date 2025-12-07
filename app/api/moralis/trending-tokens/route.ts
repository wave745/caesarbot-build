import { NextRequest, NextResponse } from 'next/server'
import { MoralisComprehensiveService } from '@/lib/services/moralis-comprehensive-service'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '50')
  const timeframe = searchParams.get('timeframe') || '1h'
  
  try {
    console.log(`API: Fetching trending tokens with limit: ${limit}, timeframe: ${timeframe}`)

    const moralisService = MoralisComprehensiveService.getInstance()
    const trendingTokens = await moralisService.getTrendingTokens(limit, timeframe)

    // Validate the response
    if (!trendingTokens) {
      console.warn('⚠️ Moralis service returned null/undefined')
      return NextResponse.json({
        success: true,
        data: [],
        meta: {
          limit,
          timeframe,
          timestamp: Date.now(),
          pollingInterval: 3000,
          warning: 'Service returned no data'
        }
      })
    }

    // Ensure it's an array
    const tokensArray = Array.isArray(trendingTokens) ? trendingTokens : []
    
    console.log(`✅ Returning ${tokensArray.length} trending tokens`)

    return NextResponse.json({
      success: true,
      data: tokensArray,
      meta: {
        limit,
        timeframe,
        timestamp: Date.now(),
        pollingInterval: 3000,
        count: tokensArray.length
      }
    })
  } catch (error) {
    console.error('API Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    
    console.error('Error details:', { errorMessage, errorStack })
    
    // Return error response with proper structure
    return NextResponse.json({
      success: false,
      error: errorMessage,
      data: [],
      meta: {
        limit,
        timeframe,
        timestamp: Date.now(),
        pollingInterval: 3000
      }
    }, { status: 500 })
  }
}
