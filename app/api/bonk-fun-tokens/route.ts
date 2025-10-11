import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const maxRetries = 3
  let lastError: Error | null = null
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const { searchParams } = new URL(request.url)
      const size = searchParams.get('size') || '100'
      const sort = searchParams.get('sort') || 'new'
      
      console.log(`Attempt ${attempt} to fetch bonk.fun tokens...`)
      
      const response = await fetch(
        `https://launch-mint-v1.raydium.io/get/list?platformId=FfYek5vEz23cMkWsdJwG2oa6EphsvXSHrGpdALN4g6W1,BuM6KDpWiTcxvrpXywWFiw45R2RNH8WURdvqoTDV1BW4&sort=${sort}&size=${size}&mintType=default&includeNsfw=true`,
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'CaesarX/1.0'
          },
          signal: AbortSignal.timeout(10000) // 10 second timeout
        }
      )

      if (!response.ok) {
        throw new Error(`Bonk.fun API responded with status: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      if (!data.success || !data.data?.rows) {
        throw new Error('Invalid response format from bonk.fun API')
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
      
    } catch (error) {
      lastError = error as Error
      console.error(`Bonk.fun Attempt ${attempt} failed:`, error)
      
      if (attempt < maxRetries) {
        const delay = attempt * 1000
        console.log(`Waiting ${delay}ms before bonk.fun retry...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  
  console.error('All attempts to fetch bonk.fun tokens failed:', lastError)
  return NextResponse.json({
    success: false,
    error: 'Failed to fetch bonk.fun tokens after multiple attempts',
    details: lastError?.message || 'Unknown error',
    data: []
  }, { status: 500 })
}
