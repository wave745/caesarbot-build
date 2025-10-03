// Global token cache for instant loading
interface CachedTokens {
  newTokens: any[]
  trendingTokens: any[]
  lastFetch: number
  isFetching: boolean
}

class TokenCache {
  private cache: CachedTokens = {
    newTokens: [],
    trendingTokens: [],
    lastFetch: 0,
    isFetching: false
  }

  private readonly CACHE_DURATION = 5000 // 5 seconds cache
  private readonly FETCH_INTERVAL = 2000 // 2 seconds refresh

  // Start preloading tokens immediately
  startPreloading() {
    if (this.cache.isFetching) return

    this.cache.isFetching = true
    
    // Fetch new tokens
    this.fetchNewTokens()
    
    // Fetch trending tokens
    this.fetchTrendingTokens()
    
    // Set up interval for continuous preloading
    setInterval(() => {
      if (Date.now() - this.cache.lastFetch > this.FETCH_INTERVAL) {
        this.fetchNewTokens()
        this.fetchTrendingTokens()
      }
    }, this.FETCH_INTERVAL)
  }

  private async fetchNewTokens() {
    try {
      const response = await fetch('/api/combined/new-tokens?realtime=true&limit=25')
      const data = await response.json()
      
      if (data.success) {
        this.cache.newTokens = data.data || []
        this.cache.lastFetch = Date.now()
        console.log(`Cache: Fetched ${data.data?.length || 0} combined tokens (${data.meta?.pumpfunCount || 0} Pump.fun + ${data.meta?.bonkCount || 0} BONK)`)
      }
    } catch (error) {
      console.error('Cache: Error fetching combined new tokens:', error)
    }
  }

  private async fetchTrendingTokens() {
    try {
      const response = await fetch('/api/trending')
      const data = await response.json()
      
      if (data.success) {
        this.cache.trendingTokens = data.data || []
        this.cache.lastFetch = Date.now()
      }
    } catch (error) {
      console.error('Cache: Error fetching trending tokens:', error)
    }
  }

  getNewTokens(): any[] {
    return this.cache.newTokens
  }

  getTrendingTokens(): any[] {
    return this.cache.trendingTokens
  }

  isCacheValid(): boolean {
    return Date.now() - this.cache.lastFetch < this.CACHE_DURATION
  }

  isDataAvailable(): boolean {
    return this.cache.newTokens.length > 0 || this.cache.trendingTokens.length > 0
  }
}

// Global instance
export const tokenCache = new TokenCache()

// Start preloading immediately when module loads
if (typeof window !== 'undefined') {
  tokenCache.startPreloading()
}


