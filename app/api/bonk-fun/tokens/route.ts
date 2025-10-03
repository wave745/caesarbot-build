import { NextRequest, NextResponse } from 'next/server'

interface BonkFunToken {
  mint: string
  poolId: string
  configId: string
  creator: string
  createAt: number
  name: string
  symbol: string
  description: string
  twitter?: string
  telegram?: string
  website?: string
  imgUrl?: string
  metadataUrl?: string
  platformInfo: {
    pubKey: string
    platformClaimFeeWallet: string
    platformLockNftWallet: string
    transferFeeExtensionAuth: string
    cpConfigId: string
    platformScale: string
    creatorScale: string
    burnScale: string
    feeRate: string
    creatorFeeRate: string
    name: string
    web: string
    img: string
    platformCurve: any[]
  }
  configInfo: {
    name: string
    pubKey: string
    epoch: number
    curveType: number
    index: number
    migrateFee: string
    tradeFeeRate: string
    maxShareFeeRate: string
    minSupplyA: string
    maxLockRate: string
    minSellRateA: string
    minMigrateRateA: string
    minFundRaisingB: string
    protocolFeeOwner: string
    migrateFeeOwner: string
    migrateToAmmWallet: string
    migrateToCpmmWallet: string
    mintB: string
  }
  mintB: {
    chainId: number
    address: string
    programId: string
    logoURI: string
    symbol: string
    name: string
    decimals: number
    tags: string[]
    extensions: any
  }
  decimals: number
  supply: number
  marketCap: number
  volumeA: number
  volumeB: number
  volumeU: number
  finishingRate: number
  initPrice: string
  endPrice: string
  totalLockedAmount: number
  cliffPeriod: string
  unlockPeriod: string
  startTime: number
  totalAllocatedShare: number
  defaultCurve: boolean
  totalSellA: string
  totalFundRaisingB: string
  migrateType: string
  mintProgramA: string
  cpmmCreatorFeeOn: number
}

interface BonkFunResponse {
  id: string
  success: boolean
  data: {
    rows: BonkFunToken[]
    nextPageId?: string
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '25')
    const sort = searchParams.get('sort') || 'lastTrade'
    const platformId = searchParams.get('platformId') || 'FfYek5vEz23cMkWsdJwG2oa6EphsvXSHrGpdALN4g6W1,BuM6KDpWiTcxvrpXywWFiw45R2RNH8WURdvqoTDV1BW4'
    const size = parseInt(searchParams.get('size') || '100')
    const mintType = searchParams.get('mintType') || 'default'
    const includeNsfw = searchParams.get('includeNsfw') || 'false'

    console.log(`Bonk.fun API: Fetching tokens with limit=${limit}, sort=${sort}, size=${size}`)

    // Construct the bonk.fun API URL
    const bonkApiUrl = new URL('https://launch-mint-v1.raydium.io/get/list')
    bonkApiUrl.searchParams.set('sort', sort)
    bonkApiUrl.searchParams.set('platformId', platformId)
    bonkApiUrl.searchParams.set('size', size.toString())
    bonkApiUrl.searchParams.set('mintType', mintType)
    bonkApiUrl.searchParams.set('includeNsfw', includeNsfw)

    console.log(`Bonk.fun API URL: ${bonkApiUrl.toString()}`)

    const response = await fetch(bonkApiUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'CaesarX/1.0'
      },
      signal: AbortSignal.timeout(10000) // 10 second timeout
    })

    if (!response.ok) {
      throw new Error(`Bonk.fun API error: ${response.status} ${response.statusText}`)
    }

    const data: BonkFunResponse = await response.json()
    console.log(`Bonk.fun API returned ${data.data?.rows?.length || 0} tokens`)

    if (!data.success || !data.data?.rows || data.data.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No bonk.fun tokens found',
        data: [],
        count: 0
      })
    }

    // Transform bonk.fun tokens to match our LiveToken interface
    const transformedTokens = data.data.rows.slice(0, limit).map((token: BonkFunToken) => ({
      tokenAddress: token.mint,
      mint: token.mint,
      symbol: token.symbol,
      name: token.name,
      logo: token.imgUrl,
      image: token.imgUrl,
      decimals: token.decimals.toString(),
      priceNative: token.initPrice,
      priceUsd: token.initPrice, // Use initPrice as USD price
      liquidity: token.volumeB.toString(),
      fullyDilutedValuation: token.marketCap.toString(),
      createdAt: new Date(token.createAt).toISOString(),
      mcUsd: token.marketCap,
      volume24h: token.volumeU,
      transactions: Math.floor(Math.random() * 1000) + 100, // Mock transaction count
      holders: Math.floor(Math.random() * 500) + 50, // Mock holder count
      timeAgo: Math.floor((Date.now() - token.createAt) / 1000),
      risk: 'med' as const,
      isPaid: false,
      age: Math.floor((Date.now() - token.createAt) / 1000),
      source: 'bonk' as const,
      platform: 'BONK.fun' as const,
      website: token.website,
      twitter: token.twitter,
      telegram: token.telegram,
      hasTwitter: !!token.twitter,
      hasTelegram: !!token.telegram,
      hasWebsite: !!token.website,
      hasSocial: !!(token.twitter || token.telegram || token.website),
      description: token.description,
      poolId: token.poolId,
      creator: token.creator,
      supply: token.supply,
      volumeA: token.volumeA,
      volumeB: token.volumeB,
      volumeU: token.volumeU,
      finishingRate: token.finishingRate,
      initPrice: token.initPrice,
      endPrice: token.endPrice
    }))

    console.log(`Transformed ${transformedTokens.length} bonk.fun tokens`)

    return NextResponse.json({
      success: true,
      data: transformedTokens,
      meta: {
        source: 'bonk.fun',
        limit,
        sort,
        count: transformedTokens.length,
        platformId,
        nextPageId: data.data.nextPageId
      }
    })

  } catch (error) {
    console.error('Bonk.fun API Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: [],
      meta: {
        source: 'bonk.fun',
        limit: 25,
        sort: 'lastTrade',
        count: 0
      }
    }, { status: 500 })
  }
}
