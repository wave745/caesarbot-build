import { NextRequest, NextResponse } from 'next/server'
import { MoralisComprehensiveService } from '@/lib/services/moralis-comprehensive-service'
import { pumpPortalAPI } from '@/lib/services/pumpportal-api'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '25')
    const timeframe = searchParams.get('timeframe') || '1h'

    console.log(`API: Starting combined new tokens stream (limit: ${limit})`)

    // Set up Server-Sent Events
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        const sendData = async () => {
          try {
            // Fetch both Pump.fun and BONK tokens in parallel
            const [moralisResult, pumpPortalResult] = await Promise.allSettled([
              // Fetch Pump.fun tokens from Moralis
              (async () => {
                try {
                  const moralisService = MoralisComprehensiveService.getInstance()
                  const tokens = await moralisService.getNewTokens(Math.ceil(limit / 2), timeframe)
                  return tokens.map(token => ({
                    ...token,
                    source: 'pumpfun',
                    platform: 'Pump.fun'
                  }))
                } catch (error) {
                  console.error('Moralis API error in stream:', error)
                  return []
                }
              })(),
              
              // Fetch BONK tokens from PumpPortal
              (async () => {
                try {
                  const tokens = await pumpPortalAPI.getBonkTokens(Math.ceil(limit / 2), timeframe)
                  return tokens.map(token => ({
                    ...token,
                    source: 'bonk',
                    platform: 'BONK.fun',
                    tokenAddress: token.address,
                    priceUsd: token.price.toString(),
                    priceNative: (token.price / 100).toString(),
                    liquidity: token.liquidity.toString(),
                    fullyDilutedValuation: token.marketCap.toString(),
                    createdAt: token.createdAt,
                    logo: token.image,
                    symbol: token.symbol,
                    name: token.name,
                    decimals: token.decimals.toString(),
                    mint: token.address,
                    image: token.image,
                    mcUsd: token.marketCap,
                    volume24h: token.volume24h,
                    transactions: token.transactions,
                    holders: token.holders,
                    timeAgo: token.age,
                    risk: token.risk,
                    isPaid: token.isPaid
                  }))
                } catch (error) {
                  console.error('PumpPortal API error in stream:', error)
                  return []
                }
              })()
            ])

            const pumpfunTokens = moralisResult.status === 'fulfilled' ? moralisResult.value : []
            const bonkTokens = pumpPortalResult.status === 'fulfilled' ? pumpPortalResult.value : []

            // Combine and sort by creation time
            const combinedTokens = [...pumpfunTokens, ...bonkTokens].sort((a, b) => {
              const timeA = new Date(a.createdAt || 0).getTime()
              const timeB = new Date(b.createdAt || 0).getTime()
              return timeB - timeA
            }).slice(0, limit)

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
                pollingInterval: 10, // 10ms for ultra-fast updates
                sources: ['moralis-pumpfun', 'pumpportal-bonk']
              }
            }

            // Send data as SSE
            const sseData = `data: ${JSON.stringify(data)}\n\n`
            controller.enqueue(encoder.encode(sseData))

            console.log(`Stream: Sent ${combinedTokens.length} combined tokens (${pumpfunTokens.length} Pump.fun + ${bonkTokens.length} BONK)`)
          } catch (error) {
            console.error('Stream error:', error)
            const errorData = {
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error',
              data: [],
              meta: {
                count: 0,
                pumpfunCount: 0,
                bonkCount: 0,
                timestamp: Date.now()
              }
            }
            const sseData = `data: ${JSON.stringify(errorData)}\n\n`
            controller.enqueue(encoder.encode(sseData))
          }
        }

        // Send initial data immediately
        sendData()

        // Set up interval for continuous updates
        const interval = setInterval(sendData, 10) // 10ms for ultra-fast updates

        // Cleanup on close
        return () => {
          clearInterval(interval)
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Cache-Control'
      }
    })
  } catch (error) {
    console.error('Stream setup error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
