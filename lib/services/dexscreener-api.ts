interface DexScreenerOrderResponse {
  success: boolean
  data?: {
    paid: boolean
    orderId?: string
    status?: string
  }
  error?: string
}

export class DexScreenerService {
  private static instance: DexScreenerService
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.DEXSCREENER_API_BASE_URL || 'https://api.dexscreener.com'
  }

  public static getInstance(): DexScreenerService {
    if (!DexScreenerService.instance) {
      DexScreenerService.instance = new DexScreenerService()
    }
    return DexScreenerService.instance
  }

  /**
   * Check if a token's Dex is paid on DexScreener
   * @param chainId - The blockchain chain ID (e.g., 'solana')
   * @param tokenAddress - The token contract address
   * @returns Promise<boolean> - true if paid, false if unpaid
   */
  async checkDexPaidStatus(chainId: string, tokenAddress: string): Promise<boolean> {
    try {
      console.log(`Checking DexScreener paid status for ${tokenAddress} on ${chainId}`)
      
      const url = `${this.baseUrl}/orders/v1/${chainId}/${tokenAddress}`
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': '*/*',
          'User-Agent': 'CaesarBot/1.0'
        }
      })

      if (!response.ok) {
        console.warn(`DexScreener API error for ${tokenAddress}: ${response.status} ${response.statusText}`)
        return false // Default to unpaid if API fails
      }

      const data: DexScreenerOrderResponse = await response.json()
      
      if (data.success && data.data) {
        return data.data.paid || false
      }

      return false
    } catch (error) {
      console.error(`Error checking DexScreener paid status for ${tokenAddress}:`, error)
      return false // Default to unpaid on error
    }
  }

  /**
   * Batch check multiple tokens' Dex paid status
   * @param tokens - Array of objects with chainId and tokenAddress
   * @returns Promise<Map<string, boolean>> - Map of tokenAddress to paid status
   */
  async batchCheckDexPaidStatus(tokens: Array<{chainId: string, tokenAddress: string}>): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>()
    
    // Process in batches to avoid rate limiting
    const batchSize = 5
    for (let i = 0; i < tokens.length; i += batchSize) {
      const batch = tokens.slice(i, i + batchSize)
      
      const promises = batch.map(async (token) => {
        const isPaid = await this.checkDexPaidStatus(token.chainId, token.tokenAddress)
        return { tokenAddress: token.tokenAddress, isPaid }
      })

      try {
        const batchResults = await Promise.all(promises)
        batchResults.forEach(({ tokenAddress, isPaid }) => {
          results.set(tokenAddress, isPaid)
        })
      } catch (error) {
        console.error(`Error in batch check for tokens ${i}-${i + batchSize}:`, error)
        // Set all tokens in this batch to unpaid on error
        batch.forEach(token => {
          results.set(token.tokenAddress, false)
        })
      }

      // Add small delay between batches to respect rate limits
      if (i + batchSize < tokens.length) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    return results
  }
}

export default DexScreenerService