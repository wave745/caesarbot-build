import { NextRequest, NextResponse } from 'next/server'
import { MoralisComprehensiveService } from '@/lib/services/moralis-comprehensive-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tokenAddresses = searchParams.get('tokenAddresses')
    const chain = searchParams.get('chain') || 'solana'

    if (!tokenAddresses) {
      return NextResponse.json({ error: 'Token addresses are required' }, { status: 400 })
    }

    const addresses = tokenAddresses.split(',').filter(addr => addr.trim())
    if (addresses.length === 0) {
      return NextResponse.json({ error: 'At least one token address is required' }, { status: 400 })
    }

    console.log(`API: Fetching prices for ${addresses.length} tokens`)
    
    const moralisService = MoralisComprehensiveService.getInstance()
    const prices = await moralisService.getTokenPrices(addresses, chain)

    return NextResponse.json({
      success: true,
      data: prices,
      meta: {
        tokenAddresses: addresses,
        chain,
        count: prices.length,
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






