import { NextRequest, NextResponse } from 'next/server'
import { SolanaTrackerService } from '@/lib/services/solanatracker-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'new'
    const limit = parseInt(searchParams.get('limit') || '30')

    console.log(`API: Fetching ${type} tokens from SolanaTracker (limit: ${limit})`)
    
    const solanaTrackerService = SolanaTrackerService.getInstance()
    let tokens = []

    switch (type) {
      case 'new':
        tokens = await solanaTrackerService.getLatestTokens(limit)
        break
      case 'graduating':
        tokens = await solanaTrackerService.getGraduatingTokens(limit)
        break
      case 'graduated':
        tokens = await solanaTrackerService.getGraduatedTokens(limit)
        break
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid type parameter. Must be "new", "graduating", or "graduated"',
          data: []
        }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      data: tokens,
      meta: {
        type,
        limit,
        count: tokens.length,
        timestamp: Date.now()
      }
    })
  } catch (error) {
    console.error('SolanaTracker Tokens API Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: []
    }, { status: 500 })
  }
}
