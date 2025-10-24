// Client-side live data service for footer

export interface FooterLiveData {
  solPrice: number
  walletBalance: number
  portfolioValue: number
  networkLatency: number
  systemPerformance: number
  lastUpdate: number
}

export class FooterLiveDataService {
  private static instance: FooterLiveDataService
  private cache: Map<string, { data: any; timestamp: number }> = new Map()
  private cacheTimeout = 30000 // 30 seconds

  static getInstance(): FooterLiveDataService {
    if (!FooterLiveDataService.instance) {
      FooterLiveDataService.instance = new FooterLiveDataService()
    }
    return FooterLiveDataService.instance
  }

  constructor() {
    // Client-side only service
  }

  // Get live SOL price
  async getSolPrice(): Promise<number> {
    try {
      const cacheKey = 'sol-price'
      const cached = this.cache.get(cacheKey)
      
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data
      }

      // Try Moralis API first
      try {
        const response = await fetch('/api/moralis/token-prices?tokenAddresses=So11111111111111111111111111111111111111112&chain=solana')
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        const contentType = response.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Response is not JSON')
        }
        
        const data = await response.json()
        if (data.success && data.data && data.data.length > 0) {
          const price = data.data[0].usdPrice || 0
          this.cache.set(cacheKey, { data: price, timestamp: Date.now() })
          return price
        }
      } catch (error) {
        console.warn('Moralis SOL price fetch failed:', error)
      }

      // Fallback to Jupiter API endpoint
      try {
        const response = await fetch('/api/jupiter/price?address=So11111111111111111111111111111111111111112')
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        const contentType = response.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Response is not JSON')
        }
        
        const data = await response.json()
        if (data.success && data.price) {
          this.cache.set(cacheKey, { data: data.price, timestamp: Date.now() })
          return data.price
        }
      } catch (error) {
        console.warn('Jupiter SOL price fetch failed:', error)
      }

      // Final fallback - return cached price or 0
      if (cached?.data) {
        return cached.data
      }
      
      // Return 0 if all APIs fail - no mock data
      console.warn('All SOL price APIs failed')
      return 0
    } catch (error) {
      console.error('Error fetching SOL price:', error)
      return 0
    }
  }

  // Get wallet balance (mock for now - would integrate with wallet connection)
  async getWalletBalance(): Promise<{ solBalance: number; usdValue: number }> {
    try {
      // This would integrate with your wallet connection system
      // Return zero balance if no wallet connected
      return {
        solBalance: 0,
        usdValue: 0
      }
    } catch (error) {
      console.error('Error fetching wallet balance:', error)
      return { solBalance: 0, usdValue: 0 }
    }
  }

  // Measure network latency
  async getNetworkLatency(): Promise<number> {
    const start = Date.now()
    try {
      const response = await fetch('/api/health', { 
        method: 'HEAD',
        cache: 'no-cache'
      })
      
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`)
      }
      
      return Date.now() - start
    } catch (error) {
      console.warn('Health check failed:', error)
      return 999 // High latency if error
    }
  }

  // Get system performance metrics
  async getSystemPerformance(): Promise<number> {
    try {
      // This could integrate with real system metrics
      // For now, return a performance score based on latency
      const latency = await this.getNetworkLatency()
      return Math.max(0, Math.min(100, 100 - (latency / 10)))
    } catch (error) {
      return 50 // Default performance
    }
  }

  // Get all live data
  async getLiveData(): Promise<FooterLiveData> {
    try {
      const [solPrice, walletData, latency, performance] = await Promise.all([
        this.getSolPrice(),
        this.getWalletBalance(),
        this.getNetworkLatency(),
        this.getSystemPerformance()
      ])

      return {
        solPrice,
        walletBalance: walletData.solBalance,
        portfolioValue: walletData.usdValue,
        networkLatency: latency,
        systemPerformance: performance,
        lastUpdate: Date.now()
      }
    } catch (error) {
      console.error('Error fetching live data:', error)
      return {
        solPrice: 0,
        walletBalance: 0,
        portfolioValue: 0,
        networkLatency: 999,
        systemPerformance: 0,
        lastUpdate: Date.now()
      }
    }
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear()
  }
}
