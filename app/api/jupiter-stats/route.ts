import { NextRequest, NextResponse } from 'next/server'

// In-memory cache for successful API responses
let cache: { data: any; timestamp: number } | null = null
const CACHE_TTL = 10 * 60 * 1000 // 10 minutes cache duration
const PRIMARY_API_URL = 'https://datapi.jup.ag/v3/launchpads/stats'
const MAX_RETRIES = 3
const INITIAL_TIMEOUT = 15000 // 15 seconds
const RETRY_DELAYS = [1000, 2000, 4000] // Exponential backoff delays in ms

// Validate response data structure
function validateResponseData(data: any): boolean {
  if (!data || typeof data !== 'object') return false
  if (!Array.isArray(data.launchpads)) return false
  if (data.launchpads.length === 0) return false
  
  // Validate each launchpad has required structure
  return data.launchpads.every((lp: any) => {
    return (
      lp.launchpad &&
      lp.stats1d &&
      lp.stats7d &&
      lp.stats30d &&
      typeof lp.stats1d.volume === 'number' &&
      typeof lp.stats7d.volume === 'number' &&
      typeof lp.stats30d.volume === 'number'
    )
  })
}

// Fetch with retry logic and exponential backoff
async function fetchWithRetry(
  url: string,
  retries: number = MAX_RETRIES
): Promise<Response> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      // Add delay before retry (except first attempt)
      if (attempt > 0) {
        const delay = RETRY_DELAYS[attempt - 1] || RETRY_DELAYS[RETRY_DELAYS.length - 1]
        await new Promise(resolve => setTimeout(resolve, delay))
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), INITIAL_TIMEOUT)

      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'User-Agent': 'CaesarX/1.0'
          },
          signal: controller.signal,
          // Add cache control to prevent stale responses
          cache: 'no-store'
        })

        clearTimeout(timeoutId)

        if (response.ok) {
          return response
        }

        // If not OK, throw error to trigger retry
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      } catch (fetchError: any) {
        clearTimeout(timeoutId)
        
        if (fetchError.name === 'AbortError') {
          throw new Error(`Request timeout after ${INITIAL_TIMEOUT}ms`)
        }
        throw fetchError
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      
      // Log retry attempt
      if (attempt < retries - 1) {
        console.log(`Jupiter API attempt ${attempt + 1}/${retries} failed, retrying...`, lastError.message)
      }
    }
  }

  // All retries failed
  throw lastError || new Error('All retry attempts failed')
}

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching Jupiter launchpad stats from primary source...')

    // Attempt to fetch from primary source with retries
    const response = await fetchWithRetry(PRIMARY_API_URL)
    const data = await response.json()

    // Validate response data structure
    if (!validateResponseData(data)) {
      throw new Error('Invalid response data structure from API')
    }

    // Update cache with fresh data
    cache = {
      data: data.launchpads,
      timestamp: Date.now()
    }

    console.log('✅ Successfully fetched Jupiter stats:', data.launchpads?.length || 0, 'launchpads')

    return NextResponse.json({
      success: true,
      data: { launchpads: data.launchpads },
      meta: {
        source: 'jupiter-api',
        timestamp: Date.now(),
        count: data.launchpads?.length || 0
      }
    })

  } catch (error) {
    console.error('❌ Error fetching Jupiter stats from primary source:', error)

    // Check if we have valid cached data
    if (cache && (Date.now() - cache.timestamp) < CACHE_TTL) {
      console.log('📦 Using cached data (age:', Math.round((Date.now() - cache.timestamp) / 1000), 'seconds)')
      
      return NextResponse.json({
        success: true,
        data: { launchpads: cache.data },
        meta: {
          source: 'cache',
          timestamp: cache.timestamp,
          cacheAge: Date.now() - cache.timestamp,
          note: 'Using cached data - primary API temporarily unavailable'
        }
      })
    }

    // No cache available or cache expired
    console.error('❌ No cached data available and primary API failed')
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null,
      meta: {
        source: 'error',
        timestamp: Date.now(),
        note: 'Primary API failed and no cached data available'
      }
    }, { status: 503 })
  }
}
