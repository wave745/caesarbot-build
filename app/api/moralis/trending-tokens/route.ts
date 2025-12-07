import { NextRequest, NextResponse } from 'next/server'
import { MoralisComprehensiveService } from '@/lib/services/moralis-comprehensive-service'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '50')
  const timeframe = searchParams.get('timeframe') || '1h'
  
  try {
    console.log(`API: Fetching trending tokens with limit: ${limit}, timeframe: ${timeframe}`)

    // Check if API key is configured
    const apiKey = process.env.MORALIS_API_KEY || process.env.NEXT_PUBLIC_MORALIS_API_KEY
    if (!apiKey) {
      console.error('❌ Moralis API key not configured in environment variables')
      return NextResponse.json({
        success: false,
        error: 'Moralis API key not configured',
        data: [],
        meta: {
          limit,
          timeframe,
          timestamp: Date.now(),
          pollingInterval: 3000
        }
      }, { status: 500 })
    }

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
    // Don't return 500 status in production to prevent UI crashes
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
    }, { status: 200 }) // Return 200 so UI can handle the error gracefully
  }
}
