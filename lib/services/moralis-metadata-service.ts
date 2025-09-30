interface MoralisTokenMetadata {
  address: string
  name: string
  symbol: string
  decimals: number
  logo?: string
  logoHash?: string
  thumbnail?: string
  blockNumber?: string
  validated?: boolean
  possibleSpam?: boolean
  verifiedContract?: boolean
  metadata?: {
    name?: string
    symbol?: string
    description?: string
    image?: string
    external_url?: string
    attributes?: Array<{
      trait_type: string
      value: string | number
    }>
    properties?: {
      files?: Array<{
        uri: string
        type: string
      }>
      category?: string
      creators?: Array<{
        address: string
        share: number
      }>
    }
  }
  socials?: {
    website?: string
    twitter?: string
    telegram?: string
    discord?: string
    reddit?: string
    github?: string
    instagram?: string
    facebook?: string
    youtube?: string
    tiktok?: string
    twitch?: string
  }
}

export class MoralisMetadataService {
  private static instance: MoralisMetadataService
  private baseUrl = 'https://solana-gateway.moralis.io'
  private apiKey: string

  constructor() {
    this.apiKey = process.env.MORALIS_API_KEY || process.env.NEXT_PUBLIC_MORALIS_API_KEY || ''
    if (!this.apiKey) {
      console.warn('Moralis API key not found in environment variables')
    }
  }

  public static getInstance(): MoralisMetadataService {
    if (!MoralisMetadataService.instance) {
      MoralisMetadataService.instance = new MoralisMetadataService()
    }
    return MoralisMetadataService.instance
  }

  /**
   * Fetch token metadata from Moralis
   * @param tokenAddress - The token contract address
   * @param network - The network (default: 'mainnet')
   * @returns Promise<MoralisTokenMetadata>
   */
  async getTokenMetadata(tokenAddress: string, network: string = 'mainnet'): Promise<MoralisTokenMetadata | null> {
    try {
      console.log(`Fetching token metadata for ${tokenAddress} on ${network}`)
      
      const url = `${this.baseUrl}/token/${network}/${tokenAddress}/metadata`
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'X-API-Key': this.apiKey
        }
      })

      if (!response.ok) {
        console.warn(`Moralis metadata API error for ${tokenAddress}: ${response.status} ${response.statusText}`)
        return null
      }

      const data: MoralisTokenMetadata = await response.json()
      
      // If no logo is provided, try to fetch from metadata URI
      if (!data.logo && data.metaplex?.metadataUri) {
        try {
          const metadataResponse = await fetch(data.metaplex.metadataUri)
          if (metadataResponse.ok) {
            const metadataContent = await metadataResponse.json()
            if (metadataContent.image) {
              data.logo = metadataContent.image
            }
          }
        } catch (error) {
          console.warn(`Could not fetch metadata from URI for ${tokenAddress}:`, error)
        }
      }
      
      return data
    } catch (error) {
      console.error(`Error fetching token metadata for ${tokenAddress}:`, error)
      return null
    }
  }

  /**
   * Batch fetch metadata for multiple tokens
   * @param tokenAddresses - Array of token addresses
   * @param network - The network (default: 'mainnet')
   * @returns Promise<Map<string, MoralisTokenMetadata>>
   */
  async batchGetTokenMetadata(tokenAddresses: string[], network: string = 'mainnet'): Promise<Map<string, MoralisTokenMetadata>> {
    const results = new Map<string, MoralisTokenMetadata>()
    
    // Process in batches to avoid rate limiting
    const batchSize = 3
    for (let i = 0; i < tokenAddresses.length; i += batchSize) {
      const batch = tokenAddresses.slice(i, i + batchSize)
      
      const promises = batch.map(async (tokenAddress) => {
        const metadata = await this.getTokenMetadata(tokenAddress, network)
        return { tokenAddress, metadata }
      })

      try {
        const batchResults = await Promise.all(promises)
        batchResults.forEach(({ tokenAddress, metadata }) => {
          if (metadata) {
            results.set(tokenAddress, metadata)
          }
        })
      } catch (error) {
        console.error(`Error in batch metadata fetch for tokens ${i}-${i + batchSize}:`, error)
      }

      // Add delay between batches to respect rate limits
      if (i + batchSize < tokenAddresses.length) {
        await new Promise(resolve => setTimeout(resolve, 200))
      }
    }

    return results
  }

  /**
   * Extract social links from token metadata
   * @param metadata - Token metadata from Moralis
   * @returns Object with social links
   */
  extractSocialLinks(metadata: any) {
    const socials = metadata.socials || {}
    const links = metadata.links || {}
    const externalUrl = metadata.metadata?.external_url
    
    return {
      website: socials.website || links.website || externalUrl || null,
      twitter: socials.twitter || links.twitter || null,
      telegram: socials.telegram || links.telegram || null,
      reddit: socials.reddit || links.reddit || null,
      discord: socials.discord || links.discord || null,
      github: socials.github || links.github || null,
      instagram: socials.instagram || links.instagram || null,
      facebook: socials.facebook || links.facebook || null,
      youtube: socials.youtube || links.youtube || null,
      tiktok: socials.tiktok || links.tiktok || null,
      twitch: socials.twitch || links.twitch || null
    }
  }
}

export default MoralisMetadataService
