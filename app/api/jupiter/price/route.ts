import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')

    if (!address) {
      return NextResponse.json({ error: 'Token address is required' }, { status: 400 })
    }

    // Use Jupiter API for real price data
    try {
      const response = await fetch(`https://price.jup.ag/v4/price?ids=${address}`, {
        headers: {
          'Accept': 'application/json',
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        const price = data.data?.[address]?.price || 0
        
        return NextResponse.json({
          success: true,
          price,
          address,
          timestamp: Date.now(),
          source: 'jupiter'
        })
      }
    } catch (error) {
      console.warn('Jupiter API failed, trying CoinGecko:', error)
    }

    // Fallback to CoinGecko for SOL
    if (address === 'So11111111111111111111111111111111111111112') {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd', {
          headers: {
            'Accept': 'application/json',
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          const price = data.solana?.usd || 0
          
          return NextResponse.json({
            success: true,
            price,
            address,
            timestamp: Date.now(),
            source: 'coingecko'
          })
        }
      } catch (error) {
        console.warn('CoinGecko API failed:', error)
      }
    }

    // If all APIs fail, return error
    return NextResponse.json({
      success: false,
      error: 'Unable to fetch price from external APIs',
      price: 0
    }, { status: 503 })

  } catch (error) {
    console.error('Jupiter price API error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      price: 0
    }, { status: 500 })
  }
}
