import { NextRequest } from 'next/server'
import { MoralisComprehensiveService } from '@/lib/services/moralis-comprehensive-service'
import BitqueryService from '@/lib/services/bitquery-service'

// Global cache for instant responses
declare global {
  var cachedTokens: { pumpfun: any[], bonk: any[] } | null
  var cacheTimestamp: number
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '25')
  const timeframe = searchParams.get('timeframe') || '1h'

  // Set up Server-Sent Events headers
  const headers = new Headers({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  })

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    start(controller) {
      console.log(`SSE: Starting live token stream (limit: ${limit})`)
      
      const sendUpdate = async () => {
        try {
          const updateStart = Date.now()
          console.log('SSE: Starting update at', updateStart)
          
          // Use global cache for instant response
          let pumpfunTokens: any[] = []
          let bonkTokens: any[] = []
          
          // Check if we have cached data
          if (global.cachedTokens && Date.now() - global.cacheTimestamp < 30000) { // 30 second cache
            console.log('SSE: Using cached data for instant response')
            pumpfunTokens = global.cachedTokens.pumpfun || []
            bonkTokens = global.cachedTokens.bonk || []
          } else {
            console.log('SSE: Cache expired, fetching fresh data in background...')
            
            // Fetch fresh data in background (non-blocking)
            setImmediate(async () => {
              try {
                const fetchStart = Date.now()
                console.log('SSE: Starting background fetch at', fetchStart)
                
                // Fetch from Moralis directly for speed
                const moralisApiKey = process.env.MORALIS_API_KEY || process.env.NEXT_PUBLIC_MORALIS_API_KEY
                if (!moralisApiKey) {
                  console.error('Moralis API key not found in environment variables')
                  return
                }
                
                const response = await fetch(`https://solana-gateway.moralis.io/token/mainnet/exchange/pumpfun/new?limit=${Math.ceil(limit / 2)}`, {
                  headers: {
                    'accept': 'application/json',
                    'X-API-Key': moralisApiKey
                  }
                })
                
                const fetchEnd = Date.now()
                console.log('SSE: Moralis fetch completed in', fetchEnd - fetchStart, 'ms')
                
                if (response.ok) {
                  const data = await response.json()
                  const freshTokens = (data.result || []).map((token: any) => ({
                    ...token,
                    source: 'pumpfun',
                    platform: 'Pump.fun'
                  }))
                  
                  // Update global cache
                  global.cachedTokens = { pumpfun: freshTokens, bonk: [] }
                  global.cacheTimestamp = Date.now()
                  console.log('SSE: Updated cache with fresh data:', freshTokens.length, 'tokens')
                }
              } catch (error) {
                console.error('SSE: Background fetch error:', error)
              }
            })
            
            // Return cached data or empty array for instant response
            pumpfunTokens = global.cachedTokens?.pumpfun || []
            bonkTokens = global.cachedTokens?.bonk || []
          }

          // Combine and sort by creation time (newest first)
          let combinedTokens = [...pumpfunTokens, ...bonkTokens].sort((a, b) => {
            const timeA = new Date(a.createdAt || a.created_at || 0).getTime()
            const timeB = new Date(b.createdAt || b.created_at || 0).getTime()
            return timeB - timeA
          }).slice(0, limit)

          // Send the data as SSE
          const sendStart = Date.now()
          console.log('SSE: Preparing response at', sendStart)
          
          const data = {
            success: true,
            data: combinedTokens,
            meta: {
              limit,
              timeframe,
              count: combinedTokens.length,
              pumpfunCount: pumpfunTokens.length,
              bonkCount: bonkTokens.length,
              timestamp: Date.now(),
              realtime: true,
              pollingInterval: 2000,
              sources: ['moralis-pumpfun', 'bitquery-bonk'],
              streamType: 'live'
            }
          }

          const message = `data: ${JSON.stringify(data)}\n\n`
          controller.enqueue(encoder.encode(message))
          
          const sendEnd = Date.now()
          console.log(`SSE: Sent ${combinedTokens.length} tokens in`, sendEnd - sendStart, 'ms')
          console.log(`SSE: TOTAL UPDATE TIME:`, sendEnd - updateStart, 'ms')
          
        } catch (error) {
          console.error('SSE: Error fetching tokens:', error)
          const errorData = {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            data: [],
            meta: {
              limit,
              timeframe,
              count: 0,
              pumpfunCount: 0,
              bonkCount: 0,
              timestamp: Date.now(),
              realtime: true,
              pollingInterval: 2000,
              sources: ['error'],
              streamType: 'live'
            }
          }
          const message = `data: ${JSON.stringify(errorData)}\n\n`
          controller.enqueue(encoder.encode(message))
        }
      }

      // Send initial data immediately
      sendUpdate()

      // Set up interval for continuous updates
      const interval = setInterval(sendUpdate, 1000) // Every 1 second for ultra-fast updates

      // Clean up on client disconnect
      request.signal.addEventListener('abort', () => {
        console.log('SSE: Client disconnected, cleaning up...')
        clearInterval(interval)
        controller.close()
      })
    }
  })

  return new Response(stream, { headers })
}
