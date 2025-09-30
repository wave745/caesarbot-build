import { NextRequest, NextResponse } from 'next/server'
import { MoralisComprehensiveService } from '@/lib/services/moralis-comprehensive-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tokenAddress = searchParams.get('tokenAddress')
    const chain = searchParams.get('chain') || 'solana'
    const limit = parseInt(searchParams.get('limit') || '100')
    const timeframe = searchParams.get('timeframe') || '24h'

    if (!tokenAddress) {
      return NextResponse.json({ error: 'Token address is required' }, { status: 400 })
    }

    console.log(`API: Fetching swaps for token: ${tokenAddress}`)
    
    const moralisService = MoralisComprehensiveService.getInstance()
    const swaps = await moralisService.getTokenSwaps(tokenAddress, chain, limit, timeframe)

    return NextResponse.json({
      success: true,
      data: swaps,
      meta: {
        tokenAddress,
        chain,
        limit,
        timeframe,
        count: swaps.length,
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






