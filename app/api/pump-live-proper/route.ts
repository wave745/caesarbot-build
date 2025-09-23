import { NextRequest, NextResponse } from 'next/server'
import { PumpLiveService } from '@/lib/services/pumpportal-live'

const pumpLiveService = PumpLiveService.getInstance()

// Initialize connection on first request
let isInitialized = false
const initializeService = async () => {
  if (!isInitialized) {
    console.log('Initializing PumpLiveService...')
    await pumpLiveService.connect()
    isInitialized = true
    console.log('PumpLiveService initialized')
  }
}

export async function GET(request: NextRequest) {
  try {
    // Initialize service if not already done
    await initializeService()
    
    const tokens = pumpLiveService.getLiveTokens()
    const isConnected = pumpLiveService.getConnectionStatus()
    
    return NextResponse.json({
      tokens,
      isConnected,
      timestamp: Date.now()
    })
  } catch (error) {
    console.error('Error fetching live tokens:', error)
    return NextResponse.json(
      { error: 'Failed to fetch live tokens' },
      { status: 500 }
    )
  }
}

// WebSocket endpoint for real-time updates
export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()
    
    if (action === 'subscribe') {
      // This would be used for WebSocket subscriptions
      // For now, we'll use polling from the frontend
      return NextResponse.json({ success: true })
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error handling subscription:', error)
    return NextResponse.json(
      { error: 'Failed to handle subscription' },
      { status: 500 }
    )
  }
}
