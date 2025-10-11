import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const response = await fetch('https://advanced-api-v2.pump.fun/coins/graduated?sortBy=creationTime', {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'CaesarX/1.0'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching Pump.fun graduated tokens:', error)
    return NextResponse.json({ error: 'Failed to fetch graduated tokens' }, { status: 500 })
  }
}
