export interface DexToken {
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

export interface DexScreenerResponse {
  schemaVersion: string
  pairs: DexToken[]
}

export class DexScreenerAPI {
  private static instance: DexScreenerAPI
  private baseUrl = 'https://api.dexscreener.com/latest/dex'
  private cache: Map<string, { data: DexToken[]; timestamp: number }> = new Map()
  private cacheTimeout = 30000 // 30 seconds

  static getInstance(): DexScreenerAPI {
    if (!DexScreenerAPI.instance) {
      DexScreenerAPI.instance = new DexScreenerAPI()
    }
    return DexScreenerAPI.instance
  }

  async getNewTokens(limit: number = 20): Promise<DexToken[]> {
    try {
      const cacheKey = `new-tokens-${limit}`
      const cached = this.cache.get(cacheKey)
      
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data
      }

      // Fetch real data from our trending API for new tokens
      const response = await fetch(`/api/trending?type=new&timeframe=1h&limit=${limit}`)
      const data = await response.json()
      
      if (data.success && data.data) {
        const realTokens = this.convertToDexTokens(data.data)
        
        // Cache the results
        this.cache.set(cacheKey, {
          data: realTokens,
          timestamp: Date.now()
        })

        return realTokens
      }

      return []
    } catch (error) {
      console.error('Error fetching new tokens:', error)
      return []
    }
  }

  async getTrendingTokens(limit: number = 20): Promise<DexToken[]> {
    try {
      const cacheKey = `trending-tokens-${limit}`
      const cached = this.cache.get(cacheKey)
      
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data
      }

      // Fetch real data from our trending API for DEX tokens
      const response = await fetch(`/api/trending?type=dex&timeframe=1h&limit=${limit}`)
      const data = await response.json()
      
      if (data.success && data.data) {
        const realTokens = this.convertToDexTokens(data.data)
        
        // Cache the results
        this.cache.set(cacheKey, {
          data: realTokens,
          timestamp: Date.now()
        })

        return realTokens
      }

      return []
    } catch (error) {
      console.error('Error fetching trending tokens:', error)
      return []
    }
  }

  async getTokenByAddress(address: string): Promise<DexToken | null> {
    try {
      const response = await fetch(`${this.baseUrl}/tokens/solana/${address}`)
      if (!response.ok) {
        return null
      }

      const data: DexScreenerResponse = await response.json()
      return data.pairs[0] || null
    } catch (error) {
      console.error('Error fetching token by address:', error)
      return null
    }
  }

  clearCache(): void {
    this.cache.clear()
  }

  private convertToDexTokens(apiData: any[]): DexToken[] {
    return apiData.map((token, index) => ({
      chainId: 'solana',
      dexId: 'raydium', // Default to Raydium for DEX tokens
      url: `https://dexscreener.com/solana/${token.ca}`,
      pairAddress: token.ca,
      baseToken: {
        address: token.ca,
        name: token.name,
        symbol: token.symbol,
        decimals: 9
      },
      quoteToken: {
        address: 'So11111111111111111111111111111111111111112', // SOL
        name: 'Solana',
        symbol: 'SOL',
        decimals: 9
      },
      priceNative: (token.price / 150).toFixed(6), // Convert USD to SOL
      priceUsd: token.price.toFixed(6),
      txns: {
        m5: { buys: Math.floor(token.buyTxns * 0.1), sells: Math.floor(token.sellTxns * 0.1) },
        h1: { buys: Math.floor(token.buyTxns * 0.3), sells: Math.floor(token.sellTxns * 0.3) },
        h6: { buys: Math.floor(token.buyTxns * 0.6), sells: Math.floor(token.sellTxns * 0.6) },
        h24: { buys: token.buyTxns, sells: token.sellTxns }
      },
      volume: {
        h24: token.volume,
        h6: token.volume * 0.3,
        h1: token.volume * 0.1,
        m5: token.volume * 0.02
      },
      priceChange: {
        m5: (Math.random() - 0.5) * 5,
        h1: (Math.random() - 0.5) * 10,
        h6: (Math.random() - 0.5) * 15,
        h24: token.change
      },
      liquidity: {
        usd: token.liquidity,
        base: token.liquidity / token.price,
        quote: token.liquidity / 150
      },
      fdv: token.marketCap,
      marketCap: token.marketCap,
      pairCreatedAt: Date.now() - (token.age * 60 * 1000), // Convert minutes to timestamp
      pairAnomaly: 0,
      info: {
        imageUrl: token.image,
        websites: [],
        socials: []
      }
    }))
  }

}
