import { NextResponse } from 'next/server'
import { fetchPumpFunMCTokens } from '@/lib/pump-api'

export async function GET() {
  try {
    console.log('Fetching multi-platform MC tokens using SolanaTracker integration...')
    
    const tokens = await fetchPumpFunMCTokens()
    console.log(`Successfully fetched ${tokens.length} multi-platform MC tokens`)
    
    return NextResponse.json({ coins: tokens })
    
  } catch (error) {
    console.error('Error fetching multi-platform MC tokens:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch MC tokens',
      details: error instanceof Error ? error.message : 'Unknown error',
      coins: [] // Return empty array to prevent client crashes
    }, { status: 500 })
  }
}
