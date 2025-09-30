import { NextRequest, NextResponse } from 'next/server'
import { MoralisComprehensiveService } from '@/lib/services/moralis-comprehensive-service'

export const dynamic = 'force-dynamic' // Ensure this route is dynamic

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder()
  const readableStream = new ReadableStream({
    async start(controller) {
      const moralisService = MoralisComprehensiveService.getInstance()

      const sendData = async () => {
        try {
          const tokens = await moralisService.getNewTokens(25, '1h') // Updated limit for more tokens
          const data = {
            success: true,
            data: tokens,
            meta: {
              limit: 25,
              timeframe: '1h',
              count: tokens.length,
              timestamp: Date.now(),
              realtime: true,
              pollingInterval: 10 // 10ms for INSTANT updates
            }
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
        } catch (error) {
          console.error('SSE Error fetching new tokens:', error)
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' })}\n\n`))
        }
      }

      // Send initial data immediately
      await sendData()

      // Send data every 10ms for INSTANT real-time updates
      const intervalId = setInterval(sendData, 10)

      request.signal.addEventListener('abort', () => {
        console.log('SSE connection aborted')
        clearInterval(intervalId)
        controller.close()
      })
    },
    cancel() {
      console.log('SSE stream cancelled')
    }
  })

  return new NextResponse(readableStream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Connection': 'keep-alive',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Cache-Control'
    }
  })
}