import { NextRequest, NextResponse } from 'next/server'

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
    
    // For SOL price, use a reliable external API
    if (addresses.includes('So11111111111111111111111111111111111111112')) {
      try {
        // Use CoinGecko API for reliable SOL price
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd', {
          headers: {
            'Accept': 'application/json',
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          const solPrice = data.solana?.usd || 0
          
          return NextResponse.json({
            success: true,
            data: [{
              tokenAddress: 'So11111111111111111111111111111111111111112',
              symbol: 'SOL',
              name: 'Solana',
              usdPrice: solPrice,
              priceChange24h: 0,
              marketCap: 0,
              volume24h: 0
            }],
            meta: {
              tokenAddresses: addresses,
              chain,
              count: 1,
              timestamp: Date.now(),
              source: 'coingecko'
            }
          })
        }
      } catch (error) {
        console.warn('CoinGecko API failed, trying Jupiter:', error)
      }
      
      // Fallback to Jupiter API
      try {
        const jupiterResponse = await fetch('https://price.jup.ag/v4/price?ids=So11111111111111111111111111111111111111112')
        if (jupiterResponse.ok) {
          const jupiterData = await jupiterResponse.json()
          const solPrice = jupiterData.data?.['So11111111111111111111111111111111111111112']?.price || 0
          
          return NextResponse.json({
            success: true,
            data: [{
              tokenAddress: 'So11111111111111111111111111111111111111112',
              symbol: 'SOL',
              name: 'Solana',
              usdPrice: solPrice,
              priceChange24h: 0,
              marketCap: 0,
              volume24h: 0
            }],
            meta: {
              tokenAddresses: addresses,
              chain,
              count: 1,
              timestamp: Date.now(),
              source: 'jupiter'
            }
          })
        }
      } catch (error) {
        console.warn('Jupiter API failed:', error)
      }
    }

    // If all APIs fail, return error
    return NextResponse.json({
      success: false,
      error: 'Unable to fetch token prices from external APIs',
      data: []
    }, { status: 503 })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: []
    }, { status: 500 })
  }
}






