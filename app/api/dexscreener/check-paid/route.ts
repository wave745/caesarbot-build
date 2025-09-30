import { NextRequest, NextResponse } from 'next/server'
import DexScreenerService from '@/lib/services/dexscreener-api'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const chainId = searchParams.get('chainId')
    const tokenAddress = searchParams.get('tokenAddress')

    if (!chainId || !tokenAddress) {
      return NextResponse.json(
        { error: 'Missing chainId or tokenAddress parameter' },
        { status: 400 }
      )
    }

    console.log(`API: Checking DexScreener paid status for ${tokenAddress} on ${chainId}`)

    const dexScreenerService = DexScreenerService.getInstance()
    const isPaid = await dexScreenerService.checkDexPaidStatus(chainId, tokenAddress)

    return NextResponse.json({
      success: true,
      data: {
        tokenAddress,
        chainId,
        isPaid
      }
    })
  } catch (error) {
    console.error('Error checking DexScreener paid status:', error)
    return NextResponse.json(
      { error: 'Failed to check Dex paid status' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tokens } = body

    if (!tokens || !Array.isArray(tokens)) {
      return NextResponse.json(
        { error: 'Invalid tokens array provided' },
        { status: 400 }
      )
    }

    console.log(`API: Batch checking DexScreener paid status for ${tokens.length} tokens`)

    const dexScreenerService = DexScreenerService.getInstance()
    const results = await dexScreenerService.batchCheckDexPaidStatus(tokens)

    // Convert Map to object for JSON response
    const resultsObject = Object.fromEntries(results)

    return NextResponse.json({
      success: true,
      data: resultsObject
    })
  } catch (error) {
    console.error('Error batch checking DexScreener paid status:', error)
    return NextResponse.json(
      { error: 'Failed to batch check Dex paid status' },
      { status: 500 }
    )
  }
}

