import { NextRequest, NextResponse } from 'next/server'
import MoralisMetadataService from '@/lib/services/moralis-metadata-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tokenAddress = searchParams.get('tokenAddress')
    const network = searchParams.get('network') || 'mainnet'

    if (!tokenAddress) {
      return NextResponse.json(
        { error: 'Missing tokenAddress parameter' },
        { status: 400 }
      )
    }

    console.log(`API: Fetching token metadata for ${tokenAddress} on ${network}`)

    const metadataService = MoralisMetadataService.getInstance()
    const metadata = await metadataService.getTokenMetadata(tokenAddress, network)

    if (!metadata) {
      return NextResponse.json(
        { error: 'Token metadata not found' },
        { status: 404 }
      )
    }

    // Extract social links
    const socialLinks = metadataService.extractSocialLinks(metadata)

    return NextResponse.json({
      success: true,
      data: {
        ...metadata,
        socialLinks
      }
    })
  } catch (error) {
    console.error('Error fetching token metadata:', error)
    return NextResponse.json(
      { error: 'Failed to fetch token metadata' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tokenAddresses, network = 'mainnet' } = body

    if (!tokenAddresses || !Array.isArray(tokenAddresses)) {
      return NextResponse.json(
        { error: 'Invalid tokenAddresses array provided' },
        { status: 400 }
      )
    }

    console.log(`API: Batch fetching token metadata for ${tokenAddresses.length} tokens`)

    const metadataService = MoralisMetadataService.getInstance()
    const metadataMap = await metadataService.batchGetTokenMetadata(tokenAddresses, network)

    // Convert Map to object and extract social links
    const results: Record<string, any> = {}
    metadataMap.forEach((metadata, tokenAddress) => {
      const socialLinks = metadataService.extractSocialLinks(metadata)
      results[tokenAddress] = {
        ...metadata,
        socialLinks
      }
    })

    return NextResponse.json({
      success: true,
      data: results
    })
  } catch (error) {
    console.error('Error batch fetching token metadata:', error)
    return NextResponse.json(
      { error: 'Failed to batch fetch token metadata' },
      { status: 500 }
    )
  }
}
