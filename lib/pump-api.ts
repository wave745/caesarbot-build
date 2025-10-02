export interface MetaData {
  word: string
  word_with_strength: string
  score: number
}

export interface PumpApiResponse {
  data: MetaData[]
  error?: string
}

export class PumpApiService {
  private static readonly BASE_URL = 'https://frontend-api-v3.pump.fun'
  private static readonly CACHE_DURATION = 60000 // 60 seconds

  private static cache: {
    data: MetaData[] | null
    timestamp: number
  } = {
    data: null,
    timestamp: 0
  }

  static async getCurrentMetas(): Promise<PumpApiResponse> {
    try {
      // Check cache first
      const now = Date.now()
      if (this.cache.data && (now - this.cache.timestamp) < this.CACHE_DURATION) {
        return { data: this.cache.data }
      }

      // Try with a shorter timeout first
      let response
      try {
        response = await fetch(`${this.BASE_URL}/metas/current`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(8000) // Shorter timeout
        })
      } catch (timeoutError) {
        console.log('First attempt timed out, trying with longer timeout...')
        // If first attempt times out, try with longer timeout
        response = await fetch(`${this.BASE_URL}/metas/current`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(20000) // Longer timeout for retry
        })
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: MetaData[] = await response.json()
      
      // Update cache
      this.cache = {
        data,
        timestamp: now
      }

      return { data }
    } catch (error) {
      console.error('Error fetching metas from pump.fun API:', error)
      
      // Return cached data if available, even if stale
      if (this.cache.data) {
        console.log('Returning cached data due to API error')
        return { data: this.cache.data }
      }
      
      // Handle specific timeout errors
      if (error instanceof Error && (error.name === 'TimeoutError' || error.message.includes('timeout'))) {
        // Return sample data as fallback when API consistently times out
        const fallbackData: MetaData[] = [
          { word: "Quarter Flip", word_with_strength: "🔥🔥Quarter Flip🪙", score: 120 },
          { word: "Edgy Trolling", word_with_strength: "🔥Edgy Trolling🃏", score: 105 },
          { word: "Animal Antics", word_with_strength: "🔥Animal Antics🐾", score: 95 },
          { word: "Streaming Parody", word_with_strength: "🔥Streaming Parody🍿", score: 70 },
          { word: "Spirit World", word_with_strength: "🔥Spirit World👻", score: 58 },
          { word: "AI Rush", word_with_strength: "🔥AI Rush🤖", score: 46 },
          { word: "Justice Calls", word_with_strength: "Justice Calls⚖️", score: 41 },
          { word: "Market Antics", word_with_strength: "Market Antics📉", score: 37 },
          { word: "Meta Mashups", word_with_strength: "Meta Mashups🌀", score: 28 },
          { word: "Political Insiders", word_with_strength: "Political Insiders🏛️", score: 18 },
          { word: "Wealth Dreamers", word_with_strength: "Wealth Dreamers💰", score: 16 },
          { word: "Cat Craze", word_with_strength: "Cat Craze🐱", score: 13 }
        ]
        
        // Cache the fallback data
        this.cache = {
          data: fallbackData,
          timestamp: now
        }
        
        return { 
          data: fallbackData, 
          error: 'Using sample data due to API timeout. Real-time updates unavailable.'
        }
      }
      
      // Return fallback data when API fails
      const fallbackData: MetaData[] = [
        { word: "Quarter Flip", word_with_strength: "🔥🔥Quarter Flip🪙", score: 120 },
        { word: "Edgy Trolling", word_with_strength: "🔥Edgy Trolling🃏", score: 105 },
        { word: "Animal Antics", word_with_strength: "🔥Animal Antics🐾", score: 95 },
        { word: "Streaming Parody", word_with_strength: "🔥Streaming Parody🍿", score: 70 },
        { word: "Spirit World", word_with_strength: "🔥Spirit World👻", score: 58 },
        { word: "AI Rush", word_with_strength: "🔥AI Rush🤖", score: 46 },
        { word: "Justice Calls", word_with_strength: "Justice Calls⚖️", score: 41 },
        { word: "Market Antics", word_with_strength: "Market Antics📉", score: 37 },
        { word: "Meta Mashups", word_with_strength: "Meta Mashups🌀", score: 28 },
        { word: "Political Insiders", word_with_strength: "Political Insiders🏛️", score: 18 },
        { word: "Wealth Dreamers", word_with_strength: "Wealth Dreamers💰", score: 16 },
        { word: "Cat Craze", word_with_strength: "Cat Craze🐱", score: 13 }
      ]
      
      return { 
        data: fallbackData, 
        error: 'Using sample data due to API error. Real-time updates unavailable.'
      }
    }
  }

  static getCachedMetas(): MetaData[] {
    return this.cache.data || []
  }

  static clearCache(): void {
    this.cache = {
      data: null,
      timestamp: 0
    }
  }
}
