import { NextResponse } from 'next/server'
import { fetchMigratedTokens } from '@/lib/pump-api'

export async function GET() {
  try {
    console.log('Fetching multi-platform migrated tokens...')
    
    const tokens = await fetchMigratedTokens()
    console.log(`Successfully fetched ${tokens.length} multi-platform migrated tokens`)
    
    return NextResponse.json({ coins: tokens })
    
  } catch (error) {
    console.error('Error fetching multi-platform migrated tokens:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch migrated tokens',
      details: error instanceof Error ? error.message : 'Unknown error',
      coins: [] // Return empty array to prevent client crashes
    }, { status: 500 })
  }
}
