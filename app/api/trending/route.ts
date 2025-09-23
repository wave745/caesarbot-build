import { NextRequest, NextResponse } from 'next/server'
import { MoralisService } from '@/lib/services/moralis-service'

// Real data integration services
const HELIUS_RPC_URL = process.env.NEXT_PUBLIC_HELIUS_RPC_URL || 'https://api.mainnet-beta.solana.com'
const MORALIS_API_KEY = process.env.NEXT_PUBLIC_MORALIS_API_KEY

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || '1h'
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    const type = searchParams.get('type') || 'trending' // trending, dex, new

    console.log(`Fetching tokens: type=${type}, timeframe=${timeframe}, limit=${limit}, search=${search}`)

    let tokens = []

    // If search is provided, try Moralis search API first, then fallback to filtering
    if (search && search.length > 2) {
      tokens = await searchTokensWithMoralis(search, limit)
      
      // If Moralis search fails, get trending tokens and filter them
      if (tokens.length === 0) {
        console.log('Moralis search failed, filtering trending tokens')
        const trendingTokens = await getTrendingTokens(timeframe, limit * 3)
        tokens = trendingTokens.filter((token: any) => 
          token.symbol.toLowerCase().includes(search.toLowerCase()) ||
          token.name.toLowerCase().includes(search.toLowerCase()) ||
          token.ca.toLowerCase().includes(search.toLowerCase())
        ).slice(0, limit)
      }
    } else {
      // Get tokens based on type
      if (type === 'dex') {
        tokens = await getDexTokens(timeframe, limit)
      } else if (type === 'new') {
        tokens = await getNewTokens(timeframe, limit)
      } else {
        tokens = await getTrendingTokens(timeframe, limit)
      }
    }

    // Sort by volume descending (most active first)
    tokens.sort((a: any, b: any) => (b.volume || 0) - (a.volume || 0))

    return NextResponse.json({
      success: true,
      data: tokens,
      meta: {
        type,
        timeframe,
        limit,
        count: tokens.length,
        search: search || null
      }
    })

  } catch (error) {
    console.error('Error fetching tokens:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch tokens',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Get trending tokens based on real transaction activity
async function getTrendingTokens(timeframe: string, limit: number) {
  try {
    // For demo purposes, prioritize mock data that matches the CaesarX dashboard
    console.log('Using mock data for CaesarX dashboard demo')
    return getFallbackActiveTokens().slice(0, limit)

    // Uncomment below to use real APIs instead of mock data
    /*
    // First try DexScreener (most reliable for trending)
    const dexScreenerTokens = await getTrendingFromDexScreener(timeframe, limit)
    if (dexScreenerTokens.length > 0) {
      console.log(`Returning ${dexScreenerTokens.length} tokens from DexScreener`)
      return dexScreenerTokens
    }

    // Try Moralis's dedicated trending tokens API if available
    const moralisTrendingTokens = await getTrendingFromMoralis(timeframe, limit)
    if (moralisTrendingTokens.length > 0) {
      console.log(`Returning ${moralisTrendingTokens.length} tokens from Moralis trending API`)
      return moralisTrendingTokens
    }

    console.log('External APIs failed, using fallback tokens')
    // Final fallback to known popular tokens
    return getFallbackActiveTokens().slice(0, limit)
    */
  } catch (error) {
    console.error('Error getting trending tokens:', error)
    // Final fallback to known popular tokens
    return getFallbackActiveTokens().slice(0, limit)
  }
}

// Get DEX tokens (tokens on Raydium/Jupiter or with DEX paid status)
async function getDexTokens(timeframe: string, limit: number) {
  try {
    console.log('Getting DEX tokens...')
    
    // For now, return the same data as trending but mark them as DEX tokens
    const trendingTokens = await getTrendingTokens(timeframe, limit)
    
    // Mark tokens as DEX tokens (paid status)
    return trendingTokens.map((token: any) => ({
      ...token,
      isPaid: true, // DEX tokens are considered "paid"
      risk: 'low' as const // DEX tokens are generally lower risk
    }))
  } catch (error) {
    console.error('Error getting DEX tokens:', error)
    return getFallbackActiveTokens().slice(0, limit).map((token: any) => ({
      ...token,
      isPaid: true,
      risk: 'low' as const
    }))
  }
}

// Get new tokens (fresh tokens across launchpads)
async function getNewTokens(timeframe: string, limit: number) {
  try {
    console.log('Getting new tokens...')
    
    // For now, return the same data as trending but mark them as new tokens
    const trendingTokens = await getTrendingTokens(timeframe, limit)
    
    // Mark tokens as new tokens (recent age)
    return trendingTokens.map((token: any) => ({
      ...token,
      age: Math.floor(Math.random() * 60) + 1, // Random age between 1-60 minutes
      risk: 'high' as const // New tokens are generally higher risk
    }))
  } catch (error) {
    console.error('Error getting new tokens:', error)
    return getFallbackActiveTokens().slice(0, limit).map((token: any) => ({
      ...token,
      age: Math.floor(Math.random() * 60) + 1,
      risk: 'high' as const
    }))
  }
}

// Search tokens using Moralis's search API
async function searchTokensWithMoralis(query: string, limit: number) {
  try {
    console.log(`Searching tokens with Moralis: ${query}`)
    
    const moralisService = MoralisService.getInstance()
    console.log('Moralis service available:', moralisService.isAvailable())
    console.log('Moralis API key present:', !!process.env.NEXT_PUBLIC_MORALIS_API_KEY)
    
    if (!moralisService.isAvailable()) {
      console.log('Moralis service not available, using fallback')
      return []
    }

    // Use Moralis's token search endpoint
    const response = await fetch(`https://deep-index.moralis.io/api/v2.2/tokens/search?q=${encodeURIComponent(query)}&chain=solana&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-API-Key': process.env.NEXT_PUBLIC_MORALIS_API_KEY || '',
        'User-Agent': 'CaesarX/1.0'
      }
    })

    if (!response.ok) {
      throw new Error(`Moralis search API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('Moralis search response:', JSON.stringify(data, null, 2))

    if (data.result && data.result.length > 0) {
      console.log(`Found ${data.result.length} tokens from Moralis search`)
      
      return data.result.slice(0, limit).map((token: any) => {
        // Calculate risk level
        const risk = calculateRiskLevel(
          token.marketCap || 0, 
          token.volume24h || 0, 
          token.transactionCount24h || 0
        )

        return {
          ca: token.tokenAddress,
          symbol: token.symbol || 'UNK',
          name: token.name || 'Unknown Token',
          image: token.logo || `/tokens/default.png`,
          marketCap: Math.floor(token.marketCap || 0),
          liquidity: Math.floor(token.liquidity || 0),
          volume: Math.floor(token.volume24h || 0),
          txns: token.transactionCount24h || 0,
          price: parseFloat(token.price || 0),
          change: parseFloat((token.priceChange24h || 0).toFixed(2)),
          holders: token.holderCount || 0,
          age: token.age || 1,
          isPaid: false, // Moralis doesn't provide DEX paid status
          risk: risk,
          buyTxns: Math.floor((token.transactionCount24h || 0) * 0.6),
          sellTxns: Math.floor((token.transactionCount24h || 0) * 0.4),
          holderChange: token.holderChange24h ? `${token.holderChange24h > 0 ? '+' : ''}${token.holderChange24h.toFixed(1)}%` : '0.0%'
        }
      })
    }

    console.log('No tokens found in Moralis search response')
    return []
  } catch (error) {
    console.error('Error searching tokens with Moralis:', error)
    return []
  }
}

// Get trending tokens from Moralis's dedicated trending API
async function getTrendingFromMoralis(timeframe: string, limit: number) {
  try {
    console.log('Fetching from Moralis trending API...')
    
    const moralisService = MoralisService.getInstance()
    if (!moralisService.isAvailable()) {
      throw new Error('Moralis service not available')
    }

    // Use Moralis's dedicated trending tokens endpoint
    const response = await fetch('https://deep-index.moralis.io/api/v2.2/tokens/trending', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-API-Key': process.env.NEXT_PUBLIC_MORALIS_API_KEY || '',
        'User-Agent': 'CaesarX/1.0'
      }
    })

    if (!response.ok) {
      throw new Error(`Moralis trending API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('Moralis trending response:', JSON.stringify(data, null, 2))

    if (data.result && data.result.length > 0) {
      console.log(`Found ${data.result.length} trending tokens from Moralis`)
      
      return data.result.slice(0, limit).map((token: any) => {
        // Calculate risk level
        const risk = calculateRiskLevel(
          token.marketCap || 0, 
          token.volume24h || 0, 
          token.transactionCount24h || 0
        )

        return {
          ca: token.tokenAddress,
          symbol: token.symbol || 'UNK',
          name: token.name || 'Unknown Token',
          image: token.logo || `/tokens/default.png`,
          marketCap: Math.floor(token.marketCap || 0),
          liquidity: Math.floor(token.liquidity || 0),
          volume: Math.floor(token.volume24h || 0),
          txns: token.transactionCount24h || 0,
          price: parseFloat(token.price || 0),
          change: parseFloat((token.priceChange24h || 0).toFixed(2)),
          holders: token.holderCount || 0,
          age: token.age || 1,
          isPaid: false, // Moralis doesn't provide DEX paid status
          risk: risk,
          buyTxns: Math.floor((token.transactionCount24h || 0) * 0.6),
          sellTxns: Math.floor((token.transactionCount24h || 0) * 0.4),
          holderChange: token.holderChange24h ? `${token.holderChange24h > 0 ? '+' : ''}${token.holderChange24h.toFixed(1)}%` : '0.0%'
        }
      })
    }

    console.log('No trending tokens found in Moralis response')
    return []
  } catch (error) {
    console.error('Error fetching from Moralis trending API:', error)
    return []
  }
}

// Get trending data from DexScreener (most reliable)
async function getTrendingFromDexScreener(timeframe: string, limit: number) {
  try {
    console.log('Fetching from DexScreener...')
    
    // Get trending tokens from DexScreener with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
    
    // Try multiple DexScreener endpoints
    const endpoints = [
      'https://api.dexscreener.com/latest/dex/tokens/trending?chain=solana',
      'https://api.dexscreener.com/latest/dex/search/?q=solana',
      'https://api.dexscreener.com/latest/dex/tokens/volume?chain=solana'
    ]
    
    let response = null
    let data = null
    
    for (const endpoint of endpoints) {
      try {
        console.log(`Trying DexScreener endpoint: ${endpoint}`)
        response = await fetch(endpoint, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'CaesarX/1.0'
          },
          signal: controller.signal
        })
        
        if (response.ok) {
          data = await response.json()
          if (data.pairs && data.pairs.length > 0) {
            console.log(`Success with endpoint: ${endpoint}`)
            break
          }
        }
      } catch (error) {
        console.warn(`Failed endpoint ${endpoint}:`, error.message)
        continue
      }
    }
    
    clearTimeout(timeoutId)
    
    if (!response || !response.ok) {
      throw new Error(`DexScreener API error: ${response?.status || 'No response'} ${response?.statusText || 'No response'}`)
    }
    
    if (!data) {
      throw new Error('No data received from DexScreener')
    }
    
    console.log('DexScreener response:', JSON.stringify(data, null, 2))
    
    if (data.pairs && data.pairs.length > 0) {
      console.log(`Found ${data.pairs.length} trending pairs from DexScreener`)
      
      return data.pairs.slice(0, limit).map((pair: any) => {
        // Calculate real price change
        const priceChange = pair.priceChange?.h24 || 0
        
        // Calculate market cap in USD
        const marketCap = pair.marketCap || 0
        
        // Get volume in USD
        const volume = pair.volume?.h24 || 0
        
        // Get liquidity in USD
        const liquidity = pair.liquidity?.usd || 0
        
        // Get transaction counts
        const txns = pair.txns?.h24 || 0
        const buyTxns = pair.txns?.h24?.buys || Math.floor(txns * 0.6)
        const sellTxns = pair.txns?.h24?.sells || Math.floor(txns * 0.4)
        
        // Calculate risk level
        const risk = calculateRiskLevel(marketCap, volume, txns)
        
        return {
          ca: pair.baseToken?.address || pair.tokenAddress,
          symbol: pair.baseToken?.symbol || 'UNK',
          name: pair.baseToken?.name || 'Unknown Token',
          image: pair.baseToken?.image || `/tokens/default.png`,
          marketCap: Math.floor(marketCap),
          liquidity: Math.floor(liquidity),
          volume: Math.floor(volume),
          txns: typeof txns === 'object' ? (txns.buys + txns.sells) : txns,
          price: parseFloat(pair.priceUsd || 0),
          change: parseFloat(priceChange.toFixed(2)),
          holders: pair.holders || 0,
          age: pair.pairCreatedAt ? Math.floor((Date.now() - pair.pairCreatedAt) / (1000 * 60 * 60 * 24)) : 1,
          isPaid: false, // DexScreener doesn't provide DEX paid status
          risk: risk,
          buyTxns: typeof txns === 'object' ? txns.buys : buyTxns,
          sellTxns: typeof txns === 'object' ? txns.sells : sellTxns,
          holderChange: '0.0%' // Would need historical data
        }
      })
    }
    
    console.log('No pairs found in DexScreener response')
    return []
  } catch (error) {
    console.error('Error fetching from DexScreener:', error)
    if (error.name === 'AbortError') {
      console.error('DexScreener request timed out')
    }
    return []
  }
}

// Get recent active tokens from Helius
async function getRecentActiveTokens(timeframe: string, limit: number): Promise<string[]> {
  try {
    console.log('Fetching recent active tokens from Helius...')
    
    // Get recent signatures for high-activity accounts
    const response = await fetch(HELIUS_RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getSignaturesForAddress',
        params: [
          '11111111111111111111111111111111', // System program for general activity
          { 
            limit: 100,
            commitment: 'confirmed'
          }
        ]
      })
    })

    const data = await response.json()
    
    if (!data.result) {
      throw new Error('No signatures returned from Helius')
    }

    // Get unique token mints from recent transactions
    const tokenMints = new Set<string>()
    
    // Process recent signatures to find token activity
    for (const sig of data.result.slice(0, 50)) {
      try {
        const txResponse = await fetch(`https://api.helius.xyz/v0/transactions?api-key=${process.env.NEXT_PUBLIC_HELIUS_RPC_URL?.split('api-key=')[1]}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transactions: [sig.signature] })
        })
        
        const txData = await txResponse.json()
        
        if (txData[0]?.tokenTransfers) {
          txData[0].tokenTransfers.forEach((transfer: any) => {
            if (transfer.mint && transfer.mint !== 'So11111111111111111111111111111111111111112') { // Exclude SOL
              tokenMints.add(transfer.mint)
            }
          })
        }
      } catch (error) {
        console.warn(`Error processing signature ${sig.signature}:`, error)
      }
    }

    return Array.from(tokenMints).slice(0, limit)
  } catch (error) {
    console.error('Error getting recent active tokens:', error)
    // Fallback to known active tokens
    return getFallbackActiveTokens()
  }
}

// Enrich token data with Moralis
async function enrichTokenWithMoralis(tokenMint: string) {
  const moralisService = MoralisService.getInstance()
  
  if (!moralisService.isAvailable()) {
    throw new Error('Moralis service not available')
  }

  try {
    // Get comprehensive token data from Moralis
    const [metadata, priceData, trades] = await Promise.all([
      moralisService.getTokenMetadata(tokenMint).catch(() => null),
      moralisService.getTokenPrice(tokenMint).catch(() => null),
      moralisService.getTokenTransactions(tokenMint).catch(() => null)
    ])

    // Calculate volume from trades
    const volume = trades?.reduce((sum: number, trade: any) => {
      return sum + (trade.value || 0)
    }, 0) || 0

    // Calculate market cap
    const marketCap = priceData?.usdPrice && metadata?.supply 
      ? priceData.usdPrice * metadata.supply 
      : 0

    // Calculate price change from trade data
    const priceChange = calculatePriceChange(trades)

    return {
      ca: tokenMint,
      symbol: metadata?.symbol || tokenMint.slice(0, 6).toUpperCase(),
      name: metadata?.name || 'Unknown Token',
      image: metadata?.image || `/tokens/default.png`,
      marketCap: Math.floor(marketCap),
      liquidity: Math.floor(volume * 0.1), // Estimate liquidity as 10% of volume
      volume: Math.floor(volume),
      txns: trades?.length || 0,
      price: priceData?.usdPrice || 0,
      change: parseFloat(priceChange.toFixed(2)),
      holders: 0, // Simplified for now
      age: 1, // Simplified for now
      isPaid: false, // Simplified for now
      risk: calculateRiskLevel(marketCap, volume, trades?.length || 0),
      // Additional data
      buyTxns: calculateBuyTransactions(trades),
      sellTxns: calculateSellTransactions(trades),
      holderChange: '0.0%' // Simplified for now
    }
  } catch (error) {
    console.error(`Error enriching token ${tokenMint}:`, error)
    throw error
  }
}

// Get fallback active tokens (mock data matching CaesarX dashboard format)
function getFallbackActiveTokens(): any[] {
  return [
    {
      ca: 'Falcon1234567890123456789012345678901234567890',
      symbol: 'Falcon-SOL',
      name: 'Falcon',
      image: '/tokens/falcon.png',
      marketCap: 3700000, // $3.7M market cap
      liquidity: 127000, // $127K liquidity
      volume: 234000, // $234K volume
      txns: 1300,
      price: 0.037,
      change: 7.3,
      holders: 2500,
      age: 40, // 40 minutes
      isPaid: false,
      risk: 'med' as const,
      buyTxns: 750,
      sellTxns: 534,
      holderChange: '+19%'
    },
    {
      ca: 'MetaMask123456789012345678901234567890123456789',
      symbol: 'MetaMask',
      name: 'MetaMask Coin',
      image: '/tokens/metamask.png',
      marketCap: 23000, // $23K market cap
      liquidity: 10000, // $10K liquidity
      volume: 232000, // $232K volume
      txns: 1300,
      price: 0.000023,
      change: -99.2,
      holders: 500,
      age: 29, // 29 minutes
      isPaid: false,
      risk: 'high' as const,
      buyTxns: 688,
      sellTxns: 620,
      holderChange: '0%'
    },
    {
      ca: 'HEMI123456789012345678901234567890123456789012',
      symbol: 'HEMI',
      name: 'Hemi Network',
      image: '/tokens/hemi.png',
      marketCap: 6600000, // $6.6M market cap
      liquidity: 172000, // $172K liquidity
      volume: 199000, // $199K volume
      txns: 1300,
      price: 0.066,
      change: 13.9,
      holders: 3200,
      age: 39, // 39 minutes
      isPaid: false,
      risk: 'med' as const,
      buyTxns: 692,
      sellTxns: 574,
      holderChange: '+21%'
    },
    {
      ca: 'MaskCoin123456789012345678901234567890123456789',
      symbol: '$MaskCoin',
      name: 'MetaMask Coin',
      image: '/tokens/maskcoin.png',
      marketCap: 4400000, // $4.4M market cap
      liquidity: 139000, // $139K liquidity
      volume: 195000, // $195K volume
      txns: 1300,
      price: 0.044,
      change: 8.6,
      holders: 2800,
      age: 28, // 28 minutes
      isPaid: false,
      risk: 'med' as const,
      buyTxns: 714,
      sellTxns: 547,
      holderChange: '+20%'
    },
    {
      ca: 'PumpFun1234567890123456789012345678901234567890',
      symbol: 'PUMP',
      name: 'Pump Fun Token',
      image: '/tokens/pump.png',
      marketCap: 1200000, // $1.2M market cap
      liquidity: 85000, // $85K liquidity
      volume: 156000, // $156K volume
      txns: 980,
      price: 0.012,
      change: 25.4,
      holders: 1800,
      age: 15, // 15 minutes
      isPaid: false,
      risk: 'high' as const,
      buyTxns: 650,
      sellTxns: 330,
      holderChange: '+35%'
    },
    {
      ca: 'Solana12345678901234567890123456789012345678901',
      symbol: 'SOL',
      name: 'Solana',
      image: '/tokens/sol.png',
      marketCap: 180000000000, // $180B market cap
      liquidity: 5000000000, // $5B liquidity
      volume: 2000000000, // $2B volume
      txns: 150000,
      price: 180.50,
      change: 2.5,
      holders: 5000000,
      age: 1500, // 25 hours
      isPaid: true,
      risk: 'low' as const,
      buyTxns: 90000,
      sellTxns: 60000,
      holderChange: '+1.2%'
    },
    {
      ca: 'Bonk1234567890123456789012345678901234567890123',
      symbol: 'BONK',
      name: 'Bonk',
      image: '/tokens/bonk.png',
      marketCap: 2500000000, // $2.5B market cap
      liquidity: 150000000, // $150M liquidity
      volume: 300000000, // $300M volume
      txns: 25000,
      price: 0.000035,
      change: 8.5,
      holders: 800000,
      age: 400, // 6.7 hours
      isPaid: true,
      risk: 'med' as const,
      buyTxns: 15000,
      sellTxns: 10000,
      holderChange: '+3.2%'
    },
    {
      ca: 'WIF12345678901234567890123456789012345678901234',
      symbol: 'WIF',
      name: 'dogwifhat',
      image: '/tokens/wif.png',
      marketCap: 1800000000, // $1.8B market cap
      liquidity: 120000000, // $120M liquidity
      volume: 250000000, // $250M volume
      txns: 20000,
      price: 1.85,
      change: -2.3,
      holders: 600000,
      age: 300, // 5 hours
      isPaid: true,
      risk: 'med' as const,
      buyTxns: 12000,
      sellTxns: 8000,
      holderChange: '-1.1%'
    }
  ]
}

// Calculate price change from trade data
function calculatePriceChange(trades: any[]): number {
  if (!trades || trades.length < 2) return 0
  
  // Get first and last trade prices
  const firstTrade = trades[0]
  const lastTrade = trades[trades.length - 1]
  
  if (!firstTrade?.priceUsd || !lastTrade?.priceUsd) return 0
  
  const priceChange = ((lastTrade.priceUsd - firstTrade.priceUsd) / firstTrade.priceUsd) * 100
  return parseFloat(priceChange.toFixed(2))
}

// Calculate buy transactions from trade data
function calculateBuyTransactions(trades: any[]): number {
  if (!trades) return 0
  
  // Count trades where token amount increased (buy)
  return trades.filter(trade => 
    trade.tokenAmount && parseFloat(trade.tokenAmount) > 0
  ).length
}

// Calculate sell transactions from trade data
function calculateSellTransactions(trades: any[]): number {
  if (!trades) return 0
  
  // Count trades where token amount decreased (sell)
  return trades.filter(trade => 
    trade.tokenAmount && parseFloat(trade.tokenAmount) < 0
  ).length
}

// Calculate risk level based on token metrics
function calculateRiskLevel(marketCap: number, volume: number, txns: number): 'low' | 'med' | 'high' {
  let riskScore = 0
  
  // Market cap risk
  if (marketCap < 100000) riskScore += 3
  else if (marketCap < 1000000) riskScore += 2
  else if (marketCap < 10000000) riskScore += 1
  
  // Volume risk
  if (volume < 1000) riskScore += 2
  else if (volume < 10000) riskScore += 1
  
  // Transaction risk
  if (txns < 10) riskScore += 2
  else if (txns < 100) riskScore += 1
  
  if (riskScore >= 4) return 'high'
  if (riskScore >= 2) return 'med'
  return 'low'
}
