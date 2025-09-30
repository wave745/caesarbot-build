export interface JupiterTrendingToken {
  address: string
  name: string
  symbol: string
  price: number
  priceChange24h: number
  volume24h: number
  marketCap: number
  liquidity: number
  image?: string
  tags?: string[]
  trendingScore?: number
}

export interface JupiterAPIResponse {
  success: boolean
  tokens: JupiterTrendingToken[]
  count: number
  dataSource: string
  error?: string
}

export class JupiterAPI {
  private static instance: JupiterAPI
  private cache: Map<string, { data: JupiterTrendingToken[]; timestamp: number }> = new Map()
  private cacheTimeout = 30000 // 30 seconds

  static getInstance(): JupiterAPI {
    if (!JupiterAPI.instance) {
      JupiterAPI.instance = new JupiterAPI()
    }
    return JupiterAPI.instance
  }

  async getTrendingTokens(limit: number = 100): Promise<JupiterTrendingToken[]> {
    try {
      const cacheKey = `trending-tokens-${limit}`
      const cached = this.cache.get(cacheKey)
      
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data
      }

      // Fetch from our trending API endpoint
      const response = await fetch('/api/trending')
      const data: JupiterAPIResponse = await response.json()
      
      if (data.success && data.tokens) {
        const tokens = data.tokens.slice(0, limit)
        
        // Cache the results
        this.cache.set(cacheKey, {
          data: tokens,
          timestamp: Date.now()
        })

        return tokens
      }

      return []
    } catch (error) {
      console.error('Error fetching trending tokens from Jupiter API:', error)
      return []
    }
  }

  async getTokenPrice(address: string): Promise<number> {
    try {
      const response = await fetch(`/api/token-price?address=${address}`)
      const data = await response.json()
      return data.price || 0
    } catch (error) {
      console.error('Error fetching token price:', error)
      return 0
    }
  }

  async getTokenInfo(address: string): Promise<JupiterTrendingToken | null> {
    try {
      const response = await fetch(`/api/token-info?address=${address}`)
      const data = await response.json()
      return data.token || null
    } catch (error) {
      console.error('Error fetching token info:', error)
      return null
    }
  }

  clearCache(): void {
    this.cache.clear()
  }
}
