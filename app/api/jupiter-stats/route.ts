import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching Jupiter launchpad stats...')
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout
    
    const response = await fetch('https://datapi.jup.ag/v3/launchpads/stats', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'CaesarX/1.0'
      },
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('Successfully fetched Jupiter stats:', data.launchpads?.length || 0, 'launchpads')
    
    return NextResponse.json({
      success: true,
      data: data,
      meta: {
        source: 'jupiter-api',
        timestamp: Date.now(),
        count: data.launchpads?.length || 0
      }
    })
    
  } catch (error) {
    console.error('Error fetching Jupiter stats:', error)
    
    // Check if it's a timeout error
    const isTimeout = error instanceof Error && (
      error.name === 'AbortError' || 
      error.message.includes('timeout') ||
      error.message.includes('signal timed out')
    )
    
    console.log('Is timeout error:', isTimeout)
    
    // Return fallback data when API fails
    const fallbackData = {
      launchpads: [
        {
          launchpad: "pump.fun",
          stats1d: {
            newMarketShare: 73.4,
            newVolume: 251624023,
            newTraders: 207835,
            volume: 486717790,
            traders: 325269,
            marketShare: 69.7,
            runners: 1,
            mints: 18813,
            graduates: 127
          },
          stats7d: {
            newMarketShare: 70.8,
            newVolume: 1608031147,
            newTraders: 692859,
            volume: 2841667366,
            traders: 1143389,
            marketShare: 67.1,
            runners: 5,
            mints: 127810,
            graduates: 740
          },
          stats30d: {
            newMarketShare: 80.3,
            newVolume: 9777224134,
            newTraders: 2719315,
            volume: 14579638771,
            traders: 3864615,
            marketShare: 75.1,
            runners: 23,
            mints: 645109,
            graduates: 3972
          },
          newDailyStats: [],
          dailyStats: [],
          runners: []
        },
        {
          launchpad: "raydium",
          stats1d: {
            newMarketShare: 15.2,
            newVolume: 45000000,
            newTraders: 25000,
            volume: 120000000,
            traders: 75000,
            marketShare: 18.5,
            runners: 0,
            mints: 500,
            graduates: 25
          },
          stats7d: {
            newMarketShare: 18.1,
            newVolume: 320000000,
            newTraders: 180000,
            volume: 850000000,
            traders: 450000,
            marketShare: 22.3,
            runners: 2,
            mints: 3500,
            graduates: 150
          },
          stats30d: {
            newMarketShare: 12.8,
            newVolume: 1200000000,
            newTraders: 650000,
            volume: 3500000000,
            traders: 1200000,
            marketShare: 18.2,
            runners: 8,
            mints: 15000,
            graduates: 800
          },
          newDailyStats: [],
          dailyStats: [],
          runners: []
        },
        {
          launchpad: "jupiter",
          stats1d: {
            newMarketShare: 8.1,
            newVolume: 25000000,
            newTraders: 15000,
            volume: 75000000,
            traders: 45000,
            marketShare: 9.8,
            runners: 0,
            mints: 300,
            graduates: 12
          },
          stats7d: {
            newMarketShare: 7.9,
            newVolume: 180000000,
            newTraders: 120000,
            volume: 520000000,
            traders: 280000,
            marketShare: 8.5,
            runners: 1,
            mints: 2200,
            graduates: 85
          },
          stats30d: {
            newMarketShare: 5.2,
            newVolume: 650000000,
            newTraders: 380000,
            volume: 1800000000,
            traders: 750000,
            marketShare: 6.8,
            runners: 3,
            mints: 8500,
            graduates: 420
          },
          newDailyStats: [],
          dailyStats: [],
          runners: []
        }
      ]
    }
    
    return NextResponse.json({
      success: true,
      data: fallbackData,
      error: isTimeout ? 'API timeout - using fallback data' : 'API error - using fallback data',
      meta: {
        source: 'fallback',
        timestamp: Date.now(),
        note: 'Using fallback data due to API error'
      }
    })
  }
}
