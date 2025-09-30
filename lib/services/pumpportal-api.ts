// lib/services/pumpportal-api.ts
export interface PumpPortalToken {
  address: string
  symbol: string
  name: string
  image?: string
  decimals: number
  price: number
  priceChange24h: number
  volume24h: number
  marketCap: number
  liquidity: number
  createdAt: string
  isVerified: boolean
  socialLinks?: {
    website?: string
    twitter?: string
    telegram?: string
  }
  holders: number
  transactions: number
  age?: number
  risk?: 'low' | 'med' | 'high'
  isPaid?: boolean
}

export interface PumpPortalResponse {
  success: boolean
  data: PumpPortalToken[]
  meta: {
    count: number
    timestamp: number
    source: 'pumpportal'
  }
}

export class PumpPortalAPI {
  private static instance: PumpPortalAPI
  private baseUrl = 'https://api.pumpportal.io'
  private apiKey: string | null = null

  private constructor() {
    // Initialize with API key if available
    this.apiKey = process.env.PUMPPORTAL_API_KEY || null
  }

  public static getInstance(): PumpPortalAPI {
    if (!PumpPortalAPI.instance) {
      PumpPortalAPI.instance = new PumpPortalAPI()
    }
    return PumpPortalAPI.instance
  }

  // Get BONK tokens from PumpPortal
  async getBonkTokens(limit: number = 25, timeframe: string = '1h'): Promise<PumpPortalToken[]> {
    try {
      console.log(`PumpPortal: Fetching BONK tokens (limit: ${limit}, timeframe: ${timeframe})`)
      
      // Try to fetch real BONK.fun tokens from their API
      const url = `${this.baseUrl}/api/v1/tokens/bonk/new`
      const params = new URLSearchParams({
        limit: limit.toString(),
        timeframe,
        sort: 'created_at',
        order: 'desc'
      })

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'User-Agent': 'CaesarX/1.0'
      }

      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`
      }

      const response = await fetch(`${url}?${params}`, {
        method: 'GET',
        headers,
        signal: AbortSignal.timeout(5000)
      })

      if (!response.ok) {
        throw new Error(`BONK.fun API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      const tokens: PumpPortalToken[] = (data.data || data.tokens || []).map((token: any) => ({
        address: token.address || token.contract_address,
        symbol: token.symbol || 'UNKNOWN',
        name: token.name || token.symbol || 'Unknown Token',
        image: token.image || token.logo,
        decimals: token.decimals || 9,
        price: parseFloat(token.price || token.price_usd || '0'),
        priceChange24h: parseFloat(token.price_change_24h || '0'),
        volume24h: parseFloat(token.volume_24h || '0'),
        marketCap: parseFloat(token.market_cap || '0'),
        liquidity: parseFloat(token.liquidity || '0'),
        createdAt: token.created_at || token.launch_time || new Date().toISOString(),
        isVerified: token.is_verified || false,
        socialLinks: {
          website: token.website,
          twitter: token.twitter,
          telegram: token.telegram
        },
        holders: parseInt(token.holders || '0'),
        transactions: parseInt(token.transactions || '0'),
        age: this.calculateAge(token.created_at || token.launch_time),
        risk: this.calculateRisk(token),
        isPaid: token.is_paid || false
      }))

      console.log(`PumpPortal: Successfully fetched ${tokens.length} BONK tokens`)
      return tokens

      } catch (error) {
      console.error('PumpPortal API Error:', error)
      
      // Fallback: Return empty array instead of throwing
      // This ensures the app continues to work even if PumpPortal is down
      return []
    }
  }

  // Get trending BONK tokens
  async getTrendingBonkTokens(limit: number = 25): Promise<PumpPortalToken[]> {
    try {
      console.log(`PumpPortal: Fetching trending BONK tokens (limit: ${limit})`)
      
      const url = `${this.baseUrl}/api/v1/tokens/bonk/trending`
      const params = new URLSearchParams({
        limit: limit.toString(),
        sort: 'volume_24h',
        order: 'desc'
      })

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'User-Agent': 'CaesarX/1.0'
      }

      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`
      }

      const response = await fetch(`${url}?${params}`, {
        method: 'GET',
        headers,
        signal: AbortSignal.timeout(2000)
      })

      if (!response.ok) {
        throw new Error(`PumpPortal API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      const tokens: PumpPortalToken[] = (data.data || data.tokens || []).map((token: any) => ({
        address: token.address || token.contract_address,
        symbol: token.symbol || 'UNKNOWN',
        name: token.name || token.symbol || 'Unknown Token',
        image: token.image || token.logo,
        decimals: token.decimals || 9,
        price: parseFloat(token.price || token.price_usd || '0'),
        priceChange24h: parseFloat(token.price_change_24h || '0'),
        volume24h: parseFloat(token.volume_24h || '0'),
        marketCap: parseFloat(token.market_cap || '0'),
        liquidity: parseFloat(token.liquidity || '0'),
        createdAt: token.created_at || token.launch_time || new Date().toISOString(),
        isVerified: token.is_verified || false,
        socialLinks: {
          website: token.website,
          twitter: token.twitter,
          telegram: token.telegram
        },
        holders: parseInt(token.holders || '0'),
        transactions: parseInt(token.transactions || '0'),
        age: this.calculateAge(token.created_at || token.launch_time),
        risk: this.calculateRisk(token),
        isPaid: token.is_paid || false
      }))

      console.log(`PumpPortal: Successfully fetched ${tokens.length} trending BONK tokens`)
      return tokens

    } catch (error) {
      console.error('PumpPortal API Error:', error)
      return []
    }
  }

  // Calculate token age in minutes
  private calculateAge(createdAt: string): number {
    if (!createdAt) return 0
    
    const created = new Date(createdAt)
    const now = new Date()
    const diffMs = now.getTime() - created.getTime()
    return Math.floor(diffMs / (1000 * 60)) // Return minutes
  }

  // Calculate risk level based on token metrics
  private calculateRisk(token: any): 'low' | 'med' | 'high' {
    const liquidity = parseFloat(token.liquidity || '0')
    const holders = parseInt(token.holders || '0')
    const marketCap = parseFloat(token.market_cap || '0')
    
    // High risk: Low liquidity, few holders, small market cap
    if (liquidity < 1000 || holders < 10 || marketCap < 10000) {
      return 'high'
    }
    
    // Medium risk: Moderate metrics
    if (liquidity < 10000 || holders < 100 || marketCap < 100000) {
      return 'med'
    }
    
    // Low risk: Good metrics
    return 'low'
  }

  // Get combined new tokens (Pump.fun + BONK)
  async getCombinedNewTokens(limit: number = 25, timeframe: string = '1h'): Promise<{
    pumpfun: any[]
    bonk: PumpPortalToken[]
    combined: any[]
  }> {
    try {
      console.log(`PumpPortal: Fetching combined new tokens (limit: ${limit})`)
      
      // Fetch both Pump.fun and BONK tokens in parallel
      const [pumpfunTokens, bonkTokens] = await Promise.allSettled([
        this.getPumpfunTokens(limit),
        this.getBonkTokens(limit, timeframe)
      ])

      const pumpfun = pumpfunTokens.status === 'fulfilled' ? pumpfunTokens.value : []
      const bonk = bonkTokens.status === 'fulfilled' ? bonkTokens.value : []

      // Combine and sort by creation time
      const combined = [...pumpfun, ...bonk].sort((a, b) => {
        const timeA = new Date(a.createdAt || a.created_at || 0).getTime()
        const timeB = new Date(b.createdAt || b.created_at || 0).getTime()
        return timeB - timeA
      })

      console.log(`PumpPortal: Combined ${pumpfun.length} Pump.fun + ${bonk.length} BONK tokens = ${combined.length} total`)
      
      return {
        pumpfun,
        bonk,
        combined: combined.slice(0, limit)
      }

    } catch (error) {
      console.error('PumpPortal: Error fetching combined tokens:', error)
      return {
        pumpfun: [],
        bonk: [],
        combined: []
      }
    }
  }

  // Fallback method to get Pump.fun tokens (if Moralis is not available)
  private async getPumpfunTokens(limit: number): Promise<any[]> {
    try {
      // This would be a fallback to get Pump.fun tokens directly
      // For now, return empty array as we're using Moralis for Pump.fun
      return []
    } catch (error) {
      console.error('PumpPortal: Error fetching Pump.fun tokens:', error)
      return []
    }
  }
}

export const pumpPortalAPI = PumpPortalAPI.getInstance()
