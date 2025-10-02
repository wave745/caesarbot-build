import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params

    if (!address) {
      return NextResponse.json(
        { error: 'Missing token address parameter' },
        { status: 400 }
      )
    }

    console.log(`API: Fetching DexScreener data for token ${address}`)

    // Fetch token data from DexScreener API
    const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${address}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'CaesarBot/1.0'
      }
    })

    console.log(`DexScreener API response status: ${response.status}`)

    if (!response.ok) {
      throw new Error(`DexScreener API error: ${response.status}`)
    }

    const data = await response.json()
    console.log(`DexScreener API response data:`, data)

    if (!data.pairs || data.pairs.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No trading data found for this token',
        data: null
      })
    }

    // Get the first (most relevant) pair
    const pair = data.pairs[0]

    // Transform DexScreener data to our format
    const tokenData = {
      price: parseFloat(pair.priceUsd) || 0,
      priceChange24h: parseFloat(pair.priceChange?.h24) || 0,
      marketCap: parseFloat(pair.marketCap) || 0,
      volume24h: parseFloat(pair.volume?.h24) || 0,
      liquidity: parseFloat(pair.liquidity?.usd) || 0,
      dexId: pair.dexId,
      name: pair.baseToken?.name,
      symbol: pair.baseToken?.symbol,
      logo: pair.baseToken?.image,
      fdv: pair.fdv || 0,
      pairCreatedAt: pair.pairCreatedAt,
      // Additional metrics
      totalFees: "0", // DexScreener doesn't provide this
      supply: "0", // DexScreener doesn't provide this
      taxes: "Unknown", // DexScreener doesn't provide this
      community: "Unknown" // DexScreener doesn't provide this
    }

    console.log(`Transformed token data:`, tokenData)

    return NextResponse.json({
      success: true,
      data: tokenData
    })

  } catch (error) {
    console.error('Error fetching DexScreener token data:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch token data from DexScreener',
        data: null
      },
      { status: 500 }
    )
  }
}
