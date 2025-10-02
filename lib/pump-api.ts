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

      // Use our server-side API route instead of direct external API call
      const response = await fetch('/api/pump-metas', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(15000) // 15 second timeout
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success && result.data) {
        // Update cache
        this.cache = {
          data: result.data,
          timestamp: now
        }

        return { 
          data: result.data,
          error: result.error // Include any error message from server
        }
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (error) {
      console.error('Error fetching metas from server API:', error)
      
      // Return cached data if available, even if stale
      if (this.cache.data) {
        console.log('Returning cached data due to API error')
        return { data: this.cache.data }
      }
      
      // Return fallback data when API fails
      const fallbackData: MetaData[] = [
        { word: "Halloween Fever", word_with_strength: "🔥🔥Halloween Fever🎃", score: 115 },
        { word: "Cat Craze", word_with_strength: "🔥Cat Craze🐱", score: 82 },
        { word: "Market Antics", word_with_strength: "🔥Market Antics📉", score: 70 },
        { word: "Justice Rally", word_with_strength: "🔥Justice Rally⚖️", score: 60 },
        { word: "AI Rush", word_with_strength: "🔥AI Rush🤖", score: 56 },
        { word: "Streaming Parody", word_with_strength: "🔥Streaming Parody🍿", score: 39 },
        { word: "Political Heat", word_with_strength: "🔥Political Heat🏛️", score: 36 },
        { word: "Dog Hype", word_with_strength: "Dog Hype🐶", score: 27 },
        { word: "Number Mania", word_with_strength: "Number Mania🔢", score: 26 },
        { word: "Paranormal Crew", word_with_strength: "Paranormal Crew👻", score: 20 },
        { word: "Wealth Dreamers", word_with_strength: "Wealth Dreamers💰", score: 14 },
        { word: "Meta Mashups", word_with_strength: "Meta Mashups🌀", score: 13 }
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
