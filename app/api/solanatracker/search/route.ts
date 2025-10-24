import { NextRequest, NextResponse } from 'next/server'
import { SolanaTrackerService } from '@/lib/services/solanatracker-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!query) {
      return NextResponse.json({
        success: false,
        error: 'Query parameter "q" is required',
        data: []
      }, { status: 400 })
    }

    console.log(`API: Searching tokens with SolanaTracker (query: ${query}, limit: ${limit})`)
    
    const solanaTrackerService = SolanaTrackerService.getInstance()
    const tokens = await solanaTrackerService.searchTokens(query, limit)

    return NextResponse.json({
      success: true,
      data: tokens,
      meta: {
        query,
        limit,
        count: tokens.length,
        timestamp: Date.now()
      }
    })
  } catch (error) {
    console.error('SolanaTracker Search API Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: []
    }, { status: 500 })
  }
}
