import { NextRequest, NextResponse } from 'next/server'
import BitqueryService from '@/lib/services/bitquery-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '30')

    console.log(`API: Fetching new Bonk.fun tokens from Bitquery (limit: ${limit})`)

    const bitqueryService = BitqueryService.getInstance()
    const tokens = await bitqueryService.getNewBonkTokens(limit)

    if (tokens.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        message: 'No new Bonk.fun tokens found'
      })
    }

    // Transform tokens to match the expected format
    const transformedTokens = tokens.map(token => ({
      tokenAddress: token.mintAddress,
      address: token.mintAddress,
      mint: token.mintAddress,
      name: token.name,
      symbol: token.symbol,
      platform: 'bonk.fun',
      logo: '/icons/platforms/bonk-fun-logo.svg', // Default logo
      priceUsd: 0, // Will be fetched separately if needed
      usdPrice: 0,
      marketCap: 0,
      volume24h: 0,
      holders: 0,
      createdAt: token.createdAt,
      creator: token.creator,
      transactionSignature: token.transactionSignature,
      blockTime: token.blockTime,
      bondingCurveProgress: 0, // Will be calculated separately
      isNew: true
    }))

    console.log(`API: Successfully fetched ${transformedTokens.length} new Bonk.fun tokens`)

    return NextResponse.json({
      success: true,
      data: transformedTokens,
      count: transformedTokens.length
    })

  } catch (error) {
    console.error('Error fetching new Bonk.fun tokens from Bitquery:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch new Bonk.fun tokens',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { limit = 30, includeProgress = false } = body

    console.log(`API: Batch fetching new Bonk.fun tokens (limit: ${limit}, includeProgress: ${includeProgress})`)

    const bitqueryService = BitqueryService.getInstance()
    const tokens = await bitqueryService.getNewBonkTokens(limit)

    if (tokens.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        message: 'No new Bonk.fun tokens found'
      })
    }

    // Transform tokens
    const transformedTokens = await Promise.all(tokens.map(async (token) => {
      const baseToken = {
        tokenAddress: token.mintAddress,
        address: token.mintAddress,
        mint: token.mintAddress,
        name: token.name,
        symbol: token.symbol,
        platform: 'bonk.fun',
        logo: '/icons/platforms/bonk-fun-logo.svg',
        priceUsd: 0,
        usdPrice: 0,
        marketCap: 0,
        volume24h: 0,
        holders: 0,
        createdAt: token.createdAt,
        creator: token.creator,
        transactionSignature: token.transactionSignature,
        blockTime: token.blockTime,
        isNew: true
      }

      // Optionally include bonding curve progress
      if (includeProgress) {
        const progress = await bitqueryService.getBondingCurveProgress(token.mintAddress)
        return {
          ...baseToken,
          bondingCurveProgress: progress
        }
      }

      return baseToken
    }))

    console.log(`API: Successfully processed ${transformedTokens.length} new Bonk.fun tokens`)

    return NextResponse.json({
      success: true,
      data: transformedTokens,
      count: transformedTokens.length
    })

  } catch (error) {
    console.error('Error batch fetching new Bonk.fun tokens:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to batch fetch new Bonk.fun tokens',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
