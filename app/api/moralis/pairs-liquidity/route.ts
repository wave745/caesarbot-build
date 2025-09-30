import { NextRequest, NextResponse } from 'next/server'
import { MoralisComprehensiveService } from '@/lib/services/moralis-comprehensive-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tokenAddress = searchParams.get('tokenAddress')
    const chain = searchParams.get('chain') || 'solana'

    if (!tokenAddress) {
      return NextResponse.json({ error: 'Token address is required' }, { status: 400 })
    }

    console.log(`API: Fetching pairs for token: ${tokenAddress}`)
    
    const moralisService = MoralisComprehensiveService.getInstance()
    const pairs = await moralisService.getPairsAndLiquidity(tokenAddress, chain)

    return NextResponse.json({
      success: true,
      data: pairs,
      meta: {
        tokenAddress,
        chain,
        count: pairs.length,
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






