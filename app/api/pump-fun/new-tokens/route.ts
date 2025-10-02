import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '25')
    const sortBy = searchParams.get('sortBy') || 'creationTime'
    const direction = searchParams.get('direction') || 'desc'
    
    console.log(`API: Fetching new tokens from pump.fun (limit: ${limit})`)
    
    // Fetch from pump.fun API
    const response = await fetch(
      `https://advanced-api-v2.pump.fun/coins/list?sortBy=${sortBy}&direction=${direction}`,
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
    
    // Transform pump.fun data to our format
    const transformedTokens = data.coins.slice(0, limit).map((coin: any) => ({
      tokenAddress: coin.coinMint,
      symbol: coin.ticker,
      name: coin.name,
      logo: coin.imageUrl,
      decimals: '6', // Pump.fun tokens are typically 6 decimals
      priceUsd: coin.currentMarketPrice?.toString() || '0',
      priceNative: coin.currentMarketPrice?.toString() || '0',
      liquidity: coin.marketCap?.toString() || '0',
      fullyDilutedValuation: coin.marketCap?.toString() || '0',
      marketCap: coin.marketCap?.toString() || '0',
      volume24h: coin.volume?.toString() || '0',
      createdAt: new Date(coin.creationTime).toISOString(),
      transactions: coin.transactions || 0,
      holders: coin.numHolders || 0,
      bondingCurveProgress: coin.bondingCurveProgress || 0,
      sniperCount: coin.sniperCount || 0,
      // Social links from pump.fun
      website: coin.website,
      twitter: coin.twitter,
      telegram: coin.telegram,
      hasTwitter: coin.hasTwitter || false,
      hasTelegram: coin.hasTelegram || false,
      hasWebsite: coin.hasWebsite || false,
      hasSocial: coin.hasSocial || false,
      // Additional pump.fun specific data
      dev: coin.dev,
      devHoldingsPercentage: coin.devHoldingsPercentage || 0,
      allTimeHighMarketCap: coin.allTimeHighMarketCap || 0,
      poolAddress: coin.poolAddress,
      graduationDate: coin.graduationDate,
      // Source identification
      source: 'pumpfun',
      platform: 'Pump.fun'
    }))
    
    return NextResponse.json({
      success: true,
      data: transformedTokens,
      meta: {
        limit,
        count: transformedTokens.length,
        timestamp: Date.now(),
        source: 'pump.fun',
        hasMore: data.pagination?.hasMore || false,
        lastScore: data.pagination?.lastScore
      }
    })
  } catch (error) {
    console.error('❌ Pump.fun API Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: []
    }, { status: 500 })
  }
}
