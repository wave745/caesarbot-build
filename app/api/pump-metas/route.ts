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
      data: data
    })
    
  } catch (error) {
    console.error('Error fetching metas from pump.fun API:', error)
    
    // Return fallback data when API fails
    const fallbackData = [
      { word: "Halloween Fever", word_with_strength: "🔥🔥Halloween Fever🎃", score: 115 },
      { word: "Cat Craze", word_with_strength: "🔥Cat Craze🐱", score: 82 },
      { word: "Market Antics", word_with_strength: "🔥Market Antics📉", score: 70 },
      { word: "Justice Rally", word_with_strength: "🔥Justice Rally⚖️", score: 60 },
      { word: "AI Rush", word_with_strength: "🔥AI Rush🤖", score: 56 },
      { word: "Streaming Parody", word_with_strength: "🔥Streaming Parody🍿", score: 39 },
      { word: "Political Heat", word_with_strength: "🔥Political Heat🏛️", score: 36 },
      { word: "Dog Hype", word_with_strength: "Dog Hype🐶", score: 27 },
      { word: "Number Mania", word_with_strength: "Number Mania🔢", score: 26 },
      { word: "Paranormal Crew", word_with_strength: "Paranormal Crew👻", score: 20 },
      { word: "Wealth Dreamers", word_with_strength: "Wealth Dreamers💰", score: 14 },
      { word: "Meta Mashups", word_with_strength: "Meta Mashups🌀", score: 13 }
    ]
    
    return NextResponse.json({
      success: true,
      data: fallbackData,
      error: 'Using fallback data due to API timeout'
    })
  }
}
