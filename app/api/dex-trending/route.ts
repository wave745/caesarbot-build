import { NextResponse } from 'next/server'

interface DexScreenerPair {
  chainId: string
  dexId: string
  url: string
  pairAddress: string
  baseToken: {
    address: string
    name: string
    symbol: string
    decimals: number
  }
  quoteToken: {
    address: string
    name: string
    symbol: string
    decimals: number
  }
  priceNative: string
  priceUsd: string
  txns: {
    m5: { buys: number; sells: number }
    h1: { buys: number; sells: number }
    h6: { buys: number; sells: number }
    h24: { buys: number; sells: number }
  }
  volume: {
    h24: number
    h6: number
    h1: number
    m5: number
  }
  priceChange: {
    m5: number
    h1: number
    h6: number
    h24: number
  }
  liquidity: {
    usd: number
    base: number
    quote: number
  }
  fdv: number
  marketCap: number
  pairCreatedAt: number
  pairAnomaly: number
  info: {
    imageUrl: string
    websites: Array<{ label: string; url: string }>
    socials: Array<{ type: string; url: string }>
  }
}

interface DexScreenerResponse {
  schemaVersion: string
  pairs: DexScreenerPair[]
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const sortBy = searchParams.get('sortBy') || 'volume'
    const timeframe = searchParams.get('timeframe') || 'h24'

    console.log(`DEX API: Fetching trending tokens with limit=${limit}, sortBy=${sortBy}, timeframe=${timeframe}`)

    // Fetch newest tokens using DexScreener API
    const newestResponse = await fetch('https://api.dexscreener.com/latest/dex/tokens/solana')
    
    console.log(`DexScreener API response status: ${newestResponse.status}`)
    
    if (!newestResponse.ok) {
      throw new Error(`DexScreener API error: ${newestResponse.status}`)
    }

    const newestData: DexScreenerResponse = await newestResponse.json()
    console.log(`DexScreener API returned ${newestData.pairs?.length || 0} pairs`)
    
    if (!newestData.pairs || newestData.pairs.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No trending tokens found',
        tokens: [],
        count: 0
      })
    }

    // Filter tokens based on criteria
    let filteredTokens = newestData.pairs.filter(pair => {
      // More lenient filtering to get more tokens
      const minLiquidity = 1000 // $1k minimum liquidity
      const minVolume = 100 // $100 minimum volume
      
      return (
        pair.liquidity.usd >= minLiquidity &&
        pair.volume.h24 >= minVolume &&
        pair.baseToken.symbol !== 'SOL' && // Exclude SOL itself
        pair.quoteToken.symbol === 'SOL' && // Only SOL pairs
        pair.baseToken.symbol.length <= 15 && // Reasonable symbol length
        pair.baseToken.symbol.length >= 2 // Minimum symbol length
      )
    })
    
    console.log(`Filtered ${filteredTokens.length} tokens from ${newestData.pairs.length} total pairs`)

    // Sort tokens based on criteria
    switch (sortBy) {
      case 'volume':
        filteredTokens.sort((a, b) => b.volume.h24 - a.volume.h24)
        break
      case 'marketCap':
        filteredTokens.sort((a, b) => b.marketCap - a.marketCap)
        break
      case 'priceChange':
        filteredTokens.sort((a, b) => b.priceChange.h24 - a.priceChange.h24)
        break
      case 'liquidity':
        filteredTokens.sort((a, b) => b.liquidity.usd - a.liquidity.usd)
        break
      case 'new':
        filteredTokens.sort((a, b) => b.pairCreatedAt - a.pairCreatedAt)
        break
      default:
        filteredTokens.sort((a, b) => b.volume.h24 - a.volume.h24)
    }

    // Limit results
    const limitedTokens = filteredTokens.slice(0, limit)

    // Calculate comprehensive trending metrics for each token
    const tokensWithMetrics = limitedTokens.map(token => {
      // Volume metrics
      const volumeScore = Math.log(token.volume.h24 + 1)
      const volumeGrowth = token.volume.h6 > 0 ? (token.volume.h1 / token.volume.h6) : 0
      
      // Price change metrics
      const priceChangeScore = Math.abs(token.priceChange.h24)
      const priceVolatility = Math.abs(token.priceChange.h1) + Math.abs(token.priceChange.h6)
      
      // Liquidity metrics
      const liquidityScore = Math.log(token.liquidity.usd + 1)
      const liquidityRatio = token.liquidity.usd / (token.marketCap || 1)
      
      // Transaction activity metrics
      const totalTxns = token.txns.h24.buys + token.txns.h24.sells
      const transactionScore = Math.log(totalTxns + 1)
      const buyRatio = totalTxns > 0 ? token.txns.h24.buys / totalTxns : 0.5
      
      // Market cap and age metrics
      const marketCapScore = Math.log(token.marketCap + 1)
      const ageInHours = (Date.now() - token.pairCreatedAt) / (1000 * 60 * 60)
      const ageScore = Math.max(0, 1 - (ageInHours / 168)) // Favor tokens less than a week old
      
      // Calculate composite trending score
      const trendingScore = (
        volumeScore * 0.25 +           // Volume importance
        priceChangeScore * 0.2 +       // Price movement
        liquidityScore * 0.15 +        // Liquidity depth
        transactionScore * 0.15 +      // Transaction activity
        marketCapScore * 0.1 +         // Market cap
        ageScore * 0.1 +              // Token age (newer is better)
        volumeGrowth * 0.05            // Volume growth rate
      )
      
      // Calculate momentum indicators
      const momentum = {
        volumeGrowth,
        priceVolatility,
        liquidityRatio,
        buyRatio,
        ageInHours,
        trendingScore
      }
      
      return {
        ...token,
        trendingScore,
        momentum
      }
    })

    // Sort by trending score
    tokensWithMetrics.sort((a, b) => b.trendingScore - a.trendingScore)

    console.log(`DEX API: Returning ${tokensWithMetrics.length} trending tokens`)

    return NextResponse.json({
      success: true,
      tokens: tokensWithMetrics,
      count: tokensWithMetrics.length,
      sortBy,
      timeframe
    })

  } catch (error) {
    console.error('DEX API Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      tokens: [],
      count: 0
    }, { status: 500 })
  }
}
