import { NextRequest, NextResponse } from 'next/server'
import { MoralisComprehensiveService } from '@/lib/services/moralis-comprehensive-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tokenAddress = searchParams.get('tokenAddress')
    const network = searchParams.get('network') || 'mainnet'

    if (!tokenAddress) {
      return NextResponse.json({ error: 'Token address is required' }, { status: 400 })
    }

    console.log(`API: Fetching holder stats for token: ${tokenAddress} on network: ${network}`)
    
    const moralisService = MoralisComprehensiveService.getInstance()
    const holderStats = await moralisService.getTokenHolderStats(tokenAddress, network)

    return NextResponse.json({
      success: true,
      data: holderStats,
      meta: {
        tokenAddress,
        network,
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


