import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching metas from pump.fun API...')
    
    const response = await fetch('https://frontend-api-v3.pump.fun/metas/current', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'CaesarX/1.0'
      },
      // Vercel serverless functions have longer timeouts
      signal: AbortSignal.timeout(30000) // 30 seconds
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log('Successfully fetched metas:', data.length, 'items')
    
    return NextResponse.json({
      success: true,
      data: data,
      meta: {
        source: 'pump.fun',
        timestamp: Date.now(),
        count: data.length
      }
    })
    
  } catch (error) {
    console.error('Error fetching metas from pump.fun API:', error)
    
    // Return fallback data when API fails
    const fallbackData = [
      { word: "Affordable Hype", word_with_strength: "🔥Affordable Hype💲", score: 77 },
      { word: "Solana Spark", word_with_strength: "🔥Solana Spark🌞", score: 63 },
      { word: "Pump Fun", word_with_strength: "🔥🔥Pump Fun💥", score: 49 },
      { word: "Pepeverse", word_with_strength: "🔥Pepeverse🐸", score: 37 },
      { word: "Animal Parade", word_with_strength: "🔥Animal Parade🐾", score: 35 },
      { word: "Crypto Power", word_with_strength: "🔥Crypto Power⚡", score: 32 },
      { word: "AI Surge", word_with_strength: "🔥AI Surge🤖", score: 21 },
      { word: "Just Lucky", word_with_strength: "🔥Just Lucky🍀", score: 18 },
      { word: "Celebrity Parody", word_with_strength: "🔥Celebrity Parody🎭", score: 17 },
      { word: "Degens United", word_with_strength: "Degens United💀", score: 12 },
      { word: "Matrix Mindset", word_with_strength: "Matrix Mindset🕶️", score: 7 },
      { word: "Justice Calls", word_with_strength: "Justice Calls⚖️", score: 6 }
    ]
    
    return NextResponse.json({
      success: true,
      data: fallbackData,
      meta: {
        source: 'fallback',
        timestamp: Date.now(),
        note: 'Using fallback data due to API error'
      }
    })
  }
}
