import { NextResponse } from 'next/server'
import { fetchPumpFunTokens } from '@/lib/pump-api'

export async function GET() {
  try {
    console.log('Fetching multi-platform tokens...')
    
    const tokens = await fetchPumpFunTokens()
    console.log(`Successfully fetched ${tokens.length} multi-platform tokens`)
    
    return NextResponse.json({ coins: tokens })
    
  } catch (error) {
    console.error('Error fetching multi-platform tokens:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch tokens',
      details: error instanceof Error ? error.message : 'Unknown error',
      coins: [] // Return empty array to prevent client crashes
    }, { status: 500 })
  }
}
