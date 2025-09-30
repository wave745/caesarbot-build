import { NextRequest, NextResponse } from 'next/server'
import { MoralisComprehensiveService } from '@/lib/services/moralis-comprehensive-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tokenAddress = searchParams.get('tokenAddress')
    const network = searchParams.get('network') || 'mainnet'
    const limit = parseInt(searchParams.get('limit') || '15')

    if (!tokenAddress) {
      return NextResponse.json({ error: 'Token address is required' }, { status: 400 })
    }

    console.log(`API: Fetching top holders for token: ${tokenAddress} on network: ${network}`)
    
    const moralisService = MoralisComprehensiveService.getInstance()
    const topHolders = await moralisService.getTopTokenHolders(tokenAddress, network, limit)

    return NextResponse.json({
      success: true,
      data: topHolders,
      meta: {
        tokenAddress,
        network,
        limit,
        count: topHolders.length,
        timestamp: Date.now()
      }
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null
    }, { status: 500 })
  }
}


