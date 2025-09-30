import { NextRequest, NextResponse } from 'next/server'
import { MoralisComprehensiveService } from '@/lib/services/moralis-comprehensive-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'trending'
    const timeframe = searchParams.get('timeframe') || '1h'
    const limit = parseInt(searchParams.get('limit') || '100')
    const search = searchParams.get('search')

    console.log(`API: Fetching ${type} tokens (${timeframe}, limit: ${limit})`)
    
    const moralisService = MoralisComprehensiveService.getInstance()
    let tokens

    if (search) {
      console.log(`Searching tokens with query: ${search}`)
      tokens = await moralisService.searchTokens(search, limit)
    } else {
      console.log('Fetching trending tokens from Moralis...')
      tokens = await moralisService.getTrendingTokens(limit)
    }
    
    console.log(`API: Fetched ${tokens.length} tokens from Moralis`)
    
    return NextResponse.json({
      success: true,
      data: tokens,
      meta: {
        type,
        timeframe,
        limit,
        count: tokens.length,
        search
      },
      dataSource: 'MORALIS'
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: [],
      meta: {
        type: 'trending',
        timeframe: '1h',
            limit: 100,
        count: 0,
        search: null
      }
    }, { status: 500 })
  }
}

