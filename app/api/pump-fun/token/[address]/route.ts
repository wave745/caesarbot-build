import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params
    
    console.log(`API: Fetching pump.fun token data for: ${address}`)
    
    // Fetch from pump.fun API
    const response = await fetch(
      `https://advanced-api-v2.pump.fun/coins/list?sortBy=creationTime&direction=desc`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }
    )
    
    if (!response.ok) {
      throw new Error(`Pump.fun API error: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    console.log(`✅ Pump.fun API: Fetched ${data.coins?.length || 0} tokens`)
    
    if (!data.coins || !Array.isArray(data.coins)) {
      throw new Error('Invalid response format from pump.fun API')
    }
    
    // Find the specific token by address
    const token = data.coins.find((coin: any) => 
      coin.coinMint === address || 
      coin.coinMint.toLowerCase() === address.toLowerCase()
    )
    
    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'Token not found in pump.fun',
        data: null
      }, { status: 404 })
    }
    
    // Transform pump.fun data to our format
    const transformedToken = {
      tokenAddress: token.coinMint,
      symbol: token.ticker,
      name: token.name,
      logo: token.imageUrl,
      decimals: '6',
      priceUsd: token.currentMarketPrice?.toString() || '0',
      priceNative: token.currentMarketPrice?.toString() || '0',
      liquidity: token.marketCap?.toString() || '0',
      fullyDilutedValuation: token.marketCap?.toString() || '0',
      marketCap: token.marketCap?.toString() || '0',
      volume24h: token.volume?.toString() || '0',
      createdAt: new Date(token.creationTime).toISOString(),
      transactions: token.transactions || 0,
      holders: token.numHolders || 0,
      bondingCurveProgress: token.bondingCurveProgress || 0,
      sniperCount: token.sniperCount || 0,
      // Social links from pump.fun
      website: token.website,
      twitter: token.twitter,
      telegram: token.telegram,
      hasTwitter: token.hasTwitter || false,
      hasTelegram: token.hasTelegram || false,
      hasWebsite: token.hasWebsite || false,
      hasSocial: token.hasSocial || false,
      // Additional pump.fun specific data
      dev: token.dev,
      devHoldingsPercentage: token.devHoldingsPercentage || 0,
      allTimeHighMarketCap: token.allTimeHighMarketCap || 0,
      poolAddress: token.poolAddress,
      graduationDate: token.graduationDate,
      // Source identification
      source: 'pumpfun',
      platform: 'Pump.fun'
    }
    
    return NextResponse.json({
      success: true,
      data: transformedToken,
      meta: {
        timestamp: Date.now(),
        source: 'pump.fun'
      }
    })
  } catch (error) {
    console.error('❌ Pump.fun Token API Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null
    }, { status: 500 })
  }
}
