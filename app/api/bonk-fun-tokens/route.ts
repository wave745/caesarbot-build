import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    try {
      const { searchParams } = new URL(request.url)
      const size = searchParams.get('size') || '100'
      const sort = searchParams.get('sort') || 'new'
      
    // Single attempt with fast timeout for faster initial load
      const response = await fetch(
        `https://launch-mint-v1.raydium.io/get/list?platformId=FfYek5vEz23cMkWsdJwG2oa6EphsvXSHrGpdALN4g6W1,BuM6KDpWiTcxvrpXywWFiw45R2RNH8WURdvqoTDV1BW4&sort=${sort}&size=${size}&mintType=default&includeNsfw=true`,
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'CaesarX/1.0'
          },
        signal: AbortSignal.timeout(2000) // 2 second timeout - faster for initial load
        }
      )

      if (!response.ok) {
      console.warn(`Bonk.fun API responded with status: ${response.status} ${response.statusText}`)
      return NextResponse.json({
        success: false,
        error: `Bonk.fun API error: ${response.status}`,
        data: []
      }, { status: response.status })
      }

      const data = await response.json()
      
      if (!data.success || !data.data?.rows) {
      console.warn('Invalid response format from bonk.fun API')
      return NextResponse.json({
        success: false,
        error: 'Invalid response format from bonk.fun API',
        data: []
      }, { status: 500 })
      }
      
      console.log(`Successfully fetched ${data.data.rows.length} tokens from bonk.fun`)
      
      return NextResponse.json({
        success: true,
        data: data.data.rows,
        meta: {
          size: parseInt(size),
          sort,
          count: data.data.rows.length,
          timestamp: Date.now(),
          source: 'bonk.fun',
          nextPageId: data.data.nextPageId
        }
      })
      
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.warn('⏱️ Bonk.fun API request timed out')
      return NextResponse.json({
        success: false,
        error: 'Request timeout',
        data: []
      }, { status: 408 })
  }
  
    console.error('Error fetching bonk.fun tokens:', error)
  return NextResponse.json({
    success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    data: []
  }, { status: 500 })
  }
}
