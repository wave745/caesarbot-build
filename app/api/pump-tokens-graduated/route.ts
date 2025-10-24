import { NextResponse } from 'next/server'
import { fetchPumpFunGraduatedTokens } from '@/lib/pump-api'

export async function GET() {
  try {
    console.log('Fetching multi-platform graduated tokens using SolanaTracker integration...')
    
    const tokens = await fetchPumpFunGraduatedTokens()
    console.log(`Successfully fetched ${tokens.length} multi-platform graduated tokens`)
    
    return NextResponse.json({ coins: tokens })
    
  } catch (error) {
    console.error('Error fetching multi-platform graduated tokens:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch graduated tokens',
      details: error instanceof Error ? error.message : 'Unknown error',
      coins: [] // Return empty array to prevent client crashes
    }, { status: 500 })
  }
}
