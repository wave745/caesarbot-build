import { NextRequest, NextResponse } from 'next/server'
import { listenPumpLive } from '@/lib/services/pumpportal-api'

export async function GET(request: NextRequest) {
  // Set up Server-Sent Events headers
  const headers = new Headers({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET',
    'Access-Control-Allow-Headers': 'Cache-Control',
  })

  // Create a readable stream
  const stream = new ReadableStream({
    start(controller) {
      // Set up PumpPortal WebSocket connection
      const ws = listenPumpLive((token) => {
        try {
          // Send token data as SSE
          const data = `data: ${JSON.stringify(token)}\n\n`
          controller.enqueue(new TextEncoder().encode(data))
        } catch (error) {
          console.error('Error sending SSE data:', error)
        }
      })

      // Handle connection errors
      ws.onerror = (error) => {
        console.error('PumpPortal WebSocket error:', error)
        const errorData = `data: ${JSON.stringify({ error: 'Connection error' })}\n\n`
        controller.enqueue(new TextEncoder().encode(errorData))
      }

      // Handle connection close
      ws.onclose = () => {
        console.log('PumpPortal WebSocket closed')
        controller.close()
      }

      // Handle client disconnect
      request.signal.addEventListener('abort', () => {
        console.log('Client disconnected, closing WebSocket')
        ws.close()
        controller.close()
      })
    }
  })

  return new Response(stream, { headers })
}


