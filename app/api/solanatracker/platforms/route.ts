import { NextRequest, NextResponse } from 'next/server'
import { SolanaTrackerService } from '@/lib/services/solanatracker-service'

export async function GET(request: NextRequest) {
  try {
    console.log('API: Fetching supported platforms from SolanaTracker')
    
    const solanaTrackerService = SolanaTrackerService.getInstance()
    const platforms = solanaTrackerService.getPlatforms()
    const supportedPlatforms = solanaTrackerService.getSupportedPlatforms()

    return NextResponse.json({
      success: true,
      data: {
        platforms,
        supported: supportedPlatforms,
        count: supportedPlatforms.length
      },
      meta: {
        timestamp: Date.now()
      }
    })
  } catch (error) {
    console.error('SolanaTracker Platforms API Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: {}
    }, { status: 500 })
  }
}
