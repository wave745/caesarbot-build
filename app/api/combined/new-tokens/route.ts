import { NextRequest, NextResponse } from 'next/server'
import { MoralisComprehensiveService } from '@/lib/services/moralis-comprehensive-service'
import { pumpPortalAPI } from '@/lib/services/pumpportal-api'
import BitqueryService from '@/lib/services/bitquery-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '25')
    const timeframe = searchParams.get('timeframe') || '1h'
    const realtime = searchParams.get('realtime') === 'true'

    console.log(`API: Fetching combined new tokens (limit: ${limit}, realtime: ${realtime})`)
    
    // Fetch both Pump.fun (via Moralis) and BONK (via Bitquery) tokens in parallel
    const [moralisResult, bitqueryResult] = await Promise.allSettled([
      // Fetch Pump.fun tokens from Moralis
      (async () => {
        try {
          const moralisService = MoralisComprehensiveService.getInstance()
          const tokens = await moralisService.getNewTokens(Math.ceil(limit / 2), timeframe)
          return tokens.map(token => ({
            ...token,
            source: 'pumpfun',
            platform: 'Pump.fun'
          }))
        } catch (error) {
          console.error('Moralis API error:', error)
          return []
        }
      })(),
      
      // Fetch BONK tokens from Bitquery
      (async () => {
        try {
          const bitqueryService = BitqueryService.getInstance()
          const tokens = await bitqueryService.getNewBonkTokens(Math.ceil(limit / 2))
          return tokens.map(token => ({
            tokenAddress: token.mintAddress,
            address: token.mintAddress,
            mint: token.mintAddress,
            name: token.name,
            symbol: token.symbol,
            source: 'bonk',
            platform: 'BONK.fun',
            logo: '/icons/platforms/bonk-fun-logo.svg',
            priceUsd: '0',
            priceNative: '0',
            liquidity: '0',
            fullyDilutedValuation: '0',
            createdAt: new Date(token.createdAt * 1000).toISOString(),
            decimals: token.decimals.toString(),
            image: '/icons/platforms/bonk-fun-logo.svg',
            mcUsd: 0,
            volume24h: 0,
            transactions: 0,
            holders: 0,
            timeAgo: Math.floor((Date.now() / 1000) - token.createdAt),
            risk: 'low',
            isPaid: false,
            creator: token.creator,
            transactionSignature: token.transactionSignature,
            blockTime: token.blockTime,
            bondingCurveProgress: 0,
            isNew: true
          }))
        } catch (error) {
          console.error('Bitquery API error:', error)
          return []
        }
      })()
    ])

    const pumpfunTokens = moralisResult.status === 'fulfilled' ? moralisResult.value : []
    const bonkTokens = bitqueryResult.status === 'fulfilled' ? bitqueryResult.value : []

    // Combine and sort by creation time (newest first)
    let combinedTokens = [...pumpfunTokens, ...bonkTokens].sort((a, b) => {
      const timeA = new Date(a.createdAt || a.created_at || 0).getTime()
      const timeB = new Date(b.createdAt || b.created_at || 0).getTime()
      return timeB - timeA
    }).slice(0, limit)

    // Fetch metadata for tokens without logos
    try {
      const moralisService = MoralisComprehensiveService.getInstance()
      const tokensWithoutLogos = combinedTokens.filter(token => !token.logo && !token.image)
      
      if (tokensWithoutLogos.length > 0) {
        console.log(`Fetching metadata for ${tokensWithoutLogos.length} tokens without logos`)
        
        const metadataPromises = tokensWithoutLogos.map(async (token) => {
          try {
            console.log(`Fetching metadata for token: ${token.tokenAddress || token.address || token.mint}`)
            const metadata = await moralisService.getTokenMetadata(token.tokenAddress || token.address || token.mint)
            console.log(`Metadata result for ${token.symbol}:`, metadata?.logo ? 'Has logo' : 'No logo')
            return { token, metadata }
          } catch (error) {
            console.error(`Error fetching metadata for ${token.tokenAddress}:`, error)
            return { token, metadata: null }
          }
        })
        
        const metadataResults = await Promise.allSettled(metadataPromises)
        
        // Update tokens with metadata
        metadataResults.forEach((result, index) => {
          if (result.status === 'fulfilled' && result.value.metadata) {
            const { token, metadata } = result.value
            const tokenIndex = combinedTokens.findIndex(t => 
              (t.tokenAddress || t.address || t.mint) === (token.tokenAddress || token.address || token.mint)
            )
            if (tokenIndex !== -1) {
              combinedTokens[tokenIndex] = {
                ...combinedTokens[tokenIndex],
                logo: metadata.logo || combinedTokens[tokenIndex].logo,
                image: metadata.logo || combinedTokens[tokenIndex].image
              }
            }
          }
        })
      }
    } catch (error) {
      console.error('Error fetching token metadata:', error)
    }

    const response = {
      success: true,
      data: combinedTokens,
      meta: {
        limit,
        timeframe,
        count: combinedTokens.length,
        pumpfunCount: pumpfunTokens.length,
        bonkCount: bonkTokens.length,
        timestamp: Date.now(),
        realtime,
        pollingInterval: realtime ? 25 : 30000,
        sources: ['moralis-pumpfun', 'bitquery-bonk']
      }
    }

    // Add cache headers for real-time requests
    const headers = new Headers()
    if (realtime) {
      headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
      headers.set('Pragma', 'no-cache')
      headers.set('Expires', '0')
    }

    console.log(`API: Successfully fetched ${combinedTokens.length} combined tokens (${pumpfunTokens.length} Pump.fun + ${bonkTokens.length} BONK)`)
    
    return NextResponse.json(response, { headers })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: [],
      meta: {
        count: 0,
        pumpfunCount: 0,
        bonkCount: 0,
        timestamp: Date.now()
      }
    }, { status: 500 })
  }
}
