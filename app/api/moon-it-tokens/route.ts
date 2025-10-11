import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const maxRetries = 3
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const { searchParams } = new URL(request.url)
      const page = searchParams.get('page') || '1'
      const pageSize = searchParams.get('pageSize') || '40'
      const sortBy = searchParams.get('sortBy') || 'NEW'
      const state = searchParams.get('state') || 'NOT_GRADUATED'
      const vanityExtension = searchParams.get('vanityExtension') || 'moon'

      console.log(`Attempt ${attempt} to fetch moon.it tokens...`)

      const response = await fetch(
        `https://api.mintlp.io/v1/fun/advanced?page=${page}&pageSize=${pageSize}&sortBy=${sortBy}&state=${state}&vanityExtension=${vanityExtension}`,
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'CaesarX/1.0'
          },
          signal: AbortSignal.timeout(10000) // 10 second timeout
        }
      )

      if (!response.ok) {
        throw new Error(`Moon.it API responded with status: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      if (!data.data || !Array.isArray(data.data)) {
        throw new Error('Invalid response format from moon.it API')
      }

      console.log(`Successfully fetched ${data.data.length} tokens from moon.it`)

      return NextResponse.json({
        success: true,
        data: data.data,
        meta: {
          page: parseInt(page),
          pageSize: parseInt(pageSize),
          sortBy,
          state,
          vanityExtension,
          count: data.data.length,
          timestamp: Date.now(),
          source: 'moon.it',
          pagination: data.pagination
        }
      })

    } catch (error) {
      lastError = error as Error
      console.error(`Moon.it Attempt ${attempt} failed:`, error)

      if (attempt < maxRetries) {
        const delay = attempt * 1000
        console.log(`Waiting ${delay}ms before moon.it retry...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  console.error('All attempts to fetch moon.it tokens failed:', lastError)
  return NextResponse.json({
    success: false,
    error: 'Failed to fetch moon.it tokens after multiple attempts',
    details: lastError?.message || 'Unknown error',
    data: []
  }, { status: 500 })
}
