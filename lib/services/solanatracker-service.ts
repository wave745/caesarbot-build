export interface SolanaTrackerToken {
  id: string
  name: string
  symbol: string
  image: string
  marketCap: number
  volume: number
  price: number
  priceChange24h: number
  holders: number
  age: string
  platform: string
  platformLogo?: string
  contractAddress: string
  twitter?: string
  telegram?: string
  website?: string
  hasTwitter: boolean
  hasTelegram: boolean
  hasWebsite: boolean
  totalFees?: number
  tradingFees?: number
  tipsFees?: number
  devHoldingsPercentage?: number
  sniperOwnedPercentage?: number
  topHoldersPercentage?: number
  bondingCurveProgress?: number
  graduationDate?: string | null
  buyTransactions?: number
  sellTransactions?: number
  sniperCount?: number
}

export interface PlatformConfig {
  name: string
  displayName: string
  logo: string
  color: string
  supported: boolean
}

export class SolanaTrackerService {
  private static instance: SolanaTrackerService
  private apiKey: string
  private baseUrl = 'https://data.solanatracker.io'
  private cache = new Map<string, { data: any; timestamp: number }>()
  private cacheDuration = 30000 // 30 seconds

  private constructor() {
    this.apiKey = process.env.SOLANATRACKER_API_KEY || ''
    if (!this.apiKey) {
      console.warn('SOLANATRACKER_API_KEY not found in environment variables')
    }
  }

  public static getInstance(): SolanaTrackerService {
    if (!SolanaTrackerService.instance) {
      SolanaTrackerService.instance = new SolanaTrackerService()
    }
    return SolanaTrackerService.instance
  }

  private async makeRequest(endpoint: string): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`
    
    // Check cache first
    const cached = this.cache.get(endpoint)
    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      return cached.data
    }

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'User-Agent': 'CaesarX/1.0'
        },
        signal: AbortSignal.timeout(10000) // 10 second timeout
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      // Cache the response
      this.cache.set(endpoint, { data, timestamp: Date.now() })
      
      return data
    } catch (error) {
      console.error(`Error fetching from SolanaTracker ${endpoint}:`, error)
      throw error
    }
  }

  public async getLatestTokens(limit: number = 30): Promise<SolanaTrackerToken[]> {
    try {
      if (!this.apiKey) {
        console.warn('SolanaTracker API key not configured. Please set SOLANATRACKER_API_KEY environment variable.')
        return []
      }

      console.log('SolanaTracker: Fetching latest tokens with API key:', this.apiKey ? 'configured' : 'missing')
      const data = await this.makeRequest('/tokens/latest')
      console.log('SolanaTracker: Raw API response:', data)
      
      if (!Array.isArray(data)) {
        console.warn('Invalid SolanaTracker response structure for latest tokens:', data)
        return []
      }

      if (data.length === 0) {
        console.warn('No tokens returned from SolanaTracker API')
        return []
      }

      const convertedTokens = this.convertToTokens(data.slice(0, limit))
      console.log('SolanaTracker: Converted tokens:', convertedTokens.length)
      return convertedTokens
    } catch (error) {
      console.error('Error fetching latest tokens from SolanaTracker:', error)
      return []
    }
  }

  public async getGraduatingTokens(limit: number = 30): Promise<SolanaTrackerToken[]> {
    try {
      const data = await this.makeRequest('/tokens/multi/graduating')
      
      if (!Array.isArray(data)) {
        console.warn('Invalid SolanaTracker response structure for graduating tokens')
        return []
      }

      return this.convertToTokens(data.slice(0, limit))
    } catch (error) {
      console.error('Error fetching graduating tokens:', error)
      return []
    }
  }

  public async getGraduatedTokens(limit: number = 30): Promise<SolanaTrackerToken[]> {
    try {
      const data = await this.makeRequest('/tokens/multi/graduated')
      
      if (!Array.isArray(data)) {
        console.warn('Invalid SolanaTracker response structure for graduated tokens')
        return []
      }

      return this.convertToTokens(data.slice(0, limit))
    } catch (error) {
      console.error('Error fetching graduated tokens:', error)
      return []
    }
  }

  public async searchTokens(query: string, limit: number = 50): Promise<SolanaTrackerToken[]> {
    try {
      const data = await this.makeRequest(`/tokens/search?q=${encodeURIComponent(query)}&limit=${limit}`)
      
      if (!Array.isArray(data)) {
        console.warn('Invalid SolanaTracker response structure for search')
        return []
      }

      return this.convertToTokens(data.slice(0, limit))
    } catch (error) {
      console.error('Error searching tokens:', error)
      return []
    }
  }

  private convertToTokens(data: any[]): SolanaTrackerToken[] {
    // If no data or empty array, return empty array
    if (!data || data.length === 0) {
      return []
    }

    return data.map((item: any, index: number) => {
      // Extract platform information
      let platform = 'unknown'
      let platformLogo = undefined
      
      if (item.token?.createdOn) {
        const createdOn = item.token.createdOn.toLowerCase()
        if (createdOn.includes('pump.fun') || createdOn.includes('pump')) platform = 'pump.fun'
        else if (createdOn.includes('bonk.fun') || createdOn.includes('bonk') || createdOn.includes('letsbonk')) platform = 'bonk.fun'
        else if (createdOn.includes('moon.it') || createdOn.includes('moon')) platform = 'moon.it'
        else if (createdOn.includes('meteora')) platform = 'meteora'
        else if (createdOn.includes('pumpswap')) platform = 'pumpswap'
        else if (createdOn.includes('moonshot')) platform = 'moonshot'
        else if (createdOn.includes('boop')) platform = 'boop.fun'
        else if (createdOn.includes('orca')) platform = 'orca'
        else if (createdOn.includes('raydium')) platform = 'raydium'
        else if (createdOn.includes('jupiter')) platform = 'jupiter'
        else if (createdOn.includes('birdeye')) platform = 'birdeye'
        else if (createdOn.includes('dexscreener')) platform = 'dexscreener'
        else if (createdOn.includes('solscan')) platform = 'solscan'
        else if (createdOn.includes('solana')) platform = 'solana'
        else if (createdOn.includes('trends')) platform = 'trends.fun'
        else if (createdOn.includes('rupert')) platform = 'rupert'
        else if (createdOn.includes('bags.fm') || createdOn.includes('bags')) platform = 'bags.fm'
        else if (createdOn.includes('believe.app') || createdOn.includes('believe')) platform = 'believe.app'
        else platform = 'unknown'
      }

      // Also check pools[0].market for additional platform detection
      if (item.pools?.[0]?.market) {
        const market = item.pools[0].market.toLowerCase()
        if (market.includes('pump.fun') || market.includes('pump')) platform = 'pump.fun'
        else if (market.includes('bonk.fun') || market.includes('bonk') || market.includes('letsbonk')) platform = 'bonk.fun'
        else if (market.includes('moon.it') || market.includes('moon')) platform = 'moon.it'
        else if (market.includes('meteora')) platform = 'meteora'
        else if (market.includes('pumpswap')) platform = 'pumpswap'
        else if (market.includes('moonshot')) platform = 'moonshot'
        else if (market.includes('boop')) platform = 'boop.fun'
        else if (market.includes('orca')) platform = 'orca'
        else if (market.includes('raydium')) platform = 'raydium'
        else if (market.includes('jupiter')) platform = 'jupiter'
        else if (market.includes('birdeye')) platform = 'birdeye'
        else if (market.includes('dexscreener')) platform = 'dexscreener'
        else if (market.includes('solscan')) platform = 'solscan'
        else if (market.includes('solana')) platform = 'solana'
        else if (market.includes('trends')) platform = 'trends.fun'
        else if (market.includes('rupert')) platform = 'rupert'
        else if (market.includes('bags.fm') || market.includes('bags')) platform = 'bags.fm'
        else if (market.includes('believe.app') || market.includes('believe')) platform = 'believe.app'
      }

      const createdAt = item.token?.createdAt ? new Date(item.token.createdAt).getTime() : Date.now()
      
      return {
        id: item.token?.mint || item.mint || `token-${index}`,
        name: item.token?.name || item.name || 'Unknown',
        symbol: item.token?.symbol || item.symbol || 'UNK',
        image: item.token?.image || item.image || `https://ui-avatars.com/api/?name=${item.token?.symbol || item.symbol || 'T'}&background=6366f1&color=fff&size=48`,
        marketCap: item.pools?.[0]?.marketCap?.usd || item.marketCap || 0,
        volume: item.pools?.[0]?.volume?.h24 || item.pools?.[0]?.volume || item.volume || item.pools?.[0]?.txns?.volume || item.txns?.volume || item.pools?.[0]?.txns?.volume24h || item.pools?.[0]?.volume24h || item.volume24h || 0,
        price: item.pools?.[0]?.price?.usd || item.price || 0,
        priceChange24h: item.pools?.[0]?.priceChange?.h24 || item.priceChange24h || 0,
        holders: item.token?.holders || item.holders || 0,
        age: this.formatTimeAgo(createdAt),
        platform,
        platformLogo,
        contractAddress: item.token?.mint || item.mint || '',
        twitter: item.token?.twitter || item.twitter || null,
        telegram: item.token?.telegram || item.telegram || null,
        website: item.token?.website || item.website || null,
        hasTwitter: !!(item.token?.twitter || item.twitter),
        hasTelegram: !!(item.token?.telegram || item.telegram),
        hasWebsite: !!(item.token?.website || item.website),
        totalFees: parseFloat((item.risk?.fees?.total || 0).toFixed(3)),
        tradingFees: parseFloat((item.risk?.fees?.totalTrading || 0).toFixed(3)),
        tipsFees: parseFloat((item.risk?.fees?.totalTips || 0).toFixed(3)),
        devHoldingsPercentage: item.risk?.rugged?.risks?.devSoldPercentage || item.devHoldingsPercentage || 0,
        sniperOwnedPercentage: item.risk?.risks?.highOwnershipPercentage || item.sniperOwnedPercentage || 0,
        topHoldersPercentage: item.risk?.risks?.topHoldersPercentage || item.topHoldersPercentage || 0,
        bondingCurveProgress: item.pools?.[0]?.bondingCurveProgress || item.bondingCurveProgress || 0,
        graduationDate: item.graduationDate || null,
        buyTransactions: item.pools?.[0]?.txns?.buys || item.buyTransactions || 0,
        sellTransactions: item.pools?.[0]?.txns?.sells || item.sellTransactions || 0,
        sniperCount: item.sniperCount || 0,
        // Extract risk data from the risk object
        top10HoldersPercentage: item.risk?.top10 || 0,
        devPercentage: item.risk?.dev?.percentage || 0,
        devAmount: item.risk?.dev?.amount || 0,
        insidersCount: item.risk?.insiders?.count || 0,
        insidersTotalBalance: item.risk?.insiders?.totalBalance || 0,
        insidersTotalPercentage: item.risk?.insiders?.totalPercentage || 0,
        snipersCount: item.risk?.snipers?.count || 0,
        snipersTotalBalance: item.risk?.snipers?.totalBalance || 0,
        snipersTotalPercentage: item.risk?.snipers?.totalPercentage || 0
      }
    })
  }

  private formatTimeAgo(timestamp: number): string {
    const now = Date.now()
    const diff = now - timestamp
    
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days}d`
    if (hours > 0) return `${hours}h`
    if (minutes > 0) return `${minutes}m`
    return `${seconds}s`
  }

  public getPlatforms(): Record<string, PlatformConfig> {
    return {
      'pump.fun': {
        name: 'pump.fun',
        displayName: 'Pump.fun',
        logo: '/pump-fun-logo.png',
        color: '#8B5CF6',
        supported: true
      },
      'pumpswap': {
        name: 'pumpswap',
        displayName: 'PumpSwap',
        logo: '/pumpswap-logo.png',
        color: '#10B981',
        supported: true
      },
      'moonshot': {
        name: 'moonshot',
        displayName: 'Moonshot',
        logo: '/moonshot-logo.png',
        color: '#F59E0B',
        supported: true
      },
      'boop.fun': {
        name: 'boop.fun',
        displayName: 'Boop.fun',
        logo: '/boop-fun-logo.png',
        color: '#EF4444',
        supported: true
      },
      'orca': {
        name: 'orca',
        displayName: 'Orca',
        logo: '/orca-logo.png',
        color: '#06B6D4',
        supported: true
      },
      'meteora': {
        name: 'meteora',
        displayName: 'Meteora',
        logo: '/meteora-logo.png',
        color: '#8B5CF6',
        supported: true
      },
      'raydium': {
        name: 'raydium',
        displayName: 'Raydium',
        logo: '/raydium-logo.png',
        color: '#3B82F6',
        supported: true
      }
    }
  }

  public getSupportedPlatforms(): string[] {
    return Object.keys(this.getPlatforms()).filter(platform => 
      this.getPlatforms()[platform].supported
    )
  }
}
