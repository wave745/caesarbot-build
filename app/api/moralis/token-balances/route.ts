import { NextRequest, NextResponse } from 'next/server'
import { MoralisComprehensiveService } from '@/lib/services/moralis-comprehensive-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('walletAddress')
    const chain = searchParams.get('chain') || 'solana'
    const limit = parseInt(searchParams.get('limit') || '100')

    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 })
    }

    console.log(`API: Fetching token balances for wallet: ${walletAddress}`)
    
    const moralisService = MoralisComprehensiveService.getInstance()
    const balances = await moralisService.getTokenBalances(walletAddress, chain, limit)

    return NextResponse.json({
      success: true,
      data: balances,
      meta: {
        walletAddress,
        chain,
        limit,
        count: balances.length,
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






