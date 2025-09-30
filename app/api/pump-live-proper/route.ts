import { NextRequest, NextResponse } from 'next/server'
import { MoralisComprehensiveService } from '@/lib/services/moralis-comprehensive-service'

const moralisService = MoralisComprehensiveService.getInstance()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '100')
    const timeframe = searchParams.get('timeframe') || '1h'
    
    console.log(`API: Fetching new tokens (limit: ${limit}, timeframe: ${timeframe})`)
    
    const tokens = await moralisService.getNewTokens(limit, timeframe)
    const isConnected = true // Moralis API is always connected
    
    return NextResponse.json({
      success: true,
      tokens,
      isConnected,
      timestamp: Date.now()
    })
  } catch (error) {
    console.error('Error fetching new tokens:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      tokens: [],
      isConnected: false
    }, { status: 500 })
  }
}

// POST endpoint for reconnection
export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()
    
    if (action === 'reconnect') {
      // Re-fetch data from Moralis API
      const tokens = await moralisService.getNewTokens(100, '1h')
      return NextResponse.json({ 
        success: true, 
        tokens,
        isConnected: true 
      })
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error handling reconnect:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to reconnect',
      tokens: [],
      isConnected: false
    }, { status: 500 })
  }
}
