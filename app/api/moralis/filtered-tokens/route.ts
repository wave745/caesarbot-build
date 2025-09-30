import { NextRequest, NextResponse } from 'next/server'
import { MoralisComprehensiveService } from '@/lib/services/moralis-comprehensive-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '100')
    
    // Extract filters from query parameters
    const filters: Record<string, any> = {}
    const filterKeys = [
      'minMarketCap', 'maxMarketCap', 'minLiquidity', 'maxLiquidity',
      'minVolume', 'maxVolume', 'minHolders', 'maxHolders',
      'minPriceChange', 'maxPriceChange', 'risk', 'isPaid',
      'minAge', 'maxAge', 'minTransactions', 'maxTransactions'
    ]
    
    filterKeys.forEach(key => {
      const value = searchParams.get(key)
      if (value !== null) {
        filters[key] = value
      }
    })

    console.log(`API: Fetching filtered tokens with filters:`, filters)
    
    const moralisService = MoralisComprehensiveService.getInstance()
    const tokens = await moralisService.getFilteredTokens(filters, limit)

    return NextResponse.json({
      success: true,
      data: tokens,
      meta: {
        filters,
        limit,
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






