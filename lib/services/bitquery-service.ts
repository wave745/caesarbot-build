interface BitqueryToken {
  mintAddress: string
  name: string
  symbol: string
  decimals: number
  createdAt: number
  creator: string
  transactionSignature: string
  blockTime: string
}

interface BitqueryResponse {
  data: {
    Solana: {
      InstructionBalanceUpdates: Array<{
        BalanceUpdate: {
          Currency: {
            MintAddress: string
            Name: string
            Symbol: string
            Decimals: number
          }
        }
        Block: {
          Time: string
        }
        Transaction: {
          Signature: string
          Signer: string
        }
      }>
    }
  }
}

export class BitqueryService {
  private static instance: BitqueryService
  private baseUrl = 'https://graphql.bitquery.io'
  private apiKey: string

  constructor() {
    this.apiKey = process.env.BITQUERY_API_KEY || ''
    if (!this.apiKey) {
      console.warn('Bitquery API key not found in environment variables - using mock data for testing')
    }
  }

  public static getInstance(): BitqueryService {
    if (!BitqueryService.instance) {
      BitqueryService.instance = new BitqueryService()
    }
    return BitqueryService.instance
  }

  /**
   * Fetch new Bonk.fun tokens using Bitquery GraphQL
   * @param limit - Number of tokens to fetch (default: 30)
   * @returns Promise<BitqueryToken[]>
   */
  async getNewBonkTokens(limit: number = 30): Promise<BitqueryToken[]> {
    try {
      console.log(`Fetching new Bonk.fun tokens from Bitquery (limit: ${limit})`)
      
      // If no API key, return mock data for testing
      if (!this.apiKey) {
        console.log('No Bitquery API key - returning mock data for testing')
        return this.getMockBonkTokens(limit)
      }
      
      console.log('Using Bitquery API for data fetching...')
      
      const query = `
        query GetNewBonkTokens($limit: Int!) {
          Solana {
            InstructionBalanceUpdates(
              where: {
                Instruction: {
                  Program: {
                    Address: { is: "LanMV9sAd7wArD4vJFi2qDdfnVhFxYSUg6eADduJ3uj" }
                    Method: { is: "initialize" }
                  }
                }
                Transaction: { Result: { Success: true } }
              }
              orderBy: { descending: Block_Time }
              limit: { count: $limit }
            ) {
              BalanceUpdate {
                Currency {
                  MintAddress
                  Name
                  Symbol
                  Decimals
                }
              }
              Block {
                Time
              }
              Transaction {
                Signature
                Signer
              }
            }
          }
        }
      `

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          query,
          variables: { limit }
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.warn(`Bitquery API error: ${response.status} ${response.statusText}`)
        console.warn('Bitquery API error response:', errorText)
        
        if (response.status === 402) {
          console.warn('Bitquery API: No active billing period - using mock data')
        } else if (response.status === 401) {
          console.warn('Bitquery API: Invalid API key - using mock data')
        }
        
        return this.getMockBonkTokens(limit)
      }

      const data: BitqueryResponse = await response.json()
      console.log('Bitquery API response:', JSON.stringify(data, null, 2))
      
      if (!data.data?.Solana?.InstructionBalanceUpdates) {
        console.warn('No Bonk.fun tokens found in Bitquery response')
        console.log('Available data keys:', Object.keys(data.data || {}))
        return this.getMockBonkTokens(limit)
      }

      const tokens: BitqueryToken[] = data.data.Solana.InstructionBalanceUpdates.map(update => ({
        mintAddress: update.BalanceUpdate.Currency.MintAddress,
        name: update.BalanceUpdate.Currency.Name,
        symbol: update.BalanceUpdate.Currency.Symbol,
        decimals: update.BalanceUpdate.Currency.Decimals,
        createdAt: new Date(update.Block.Time).getTime() / 1000,
        creator: update.Transaction.Signer,
        transactionSignature: update.Transaction.Signature,
        blockTime: update.Block.Time
      }))

      console.log(`Successfully fetched ${tokens.length} new Bonk.fun tokens from Bitquery`)
      return tokens

    } catch (error) {
      console.error('Error fetching new Bonk.fun tokens from Bitquery:', error)
      return this.getMockBonkTokens(limit)
    }
  }

  private getMockBonkTokens(limit: number): BitqueryToken[] {
    // Return empty array instead of mock data
    return []
  }

  /**
   * Get bonding curve progress for a specific token
   * @param mintAddress - Token mint address
   * @returns Promise<number> - Progress percentage (0-100)
   */
  async getBondingCurveProgress(mintAddress: string): Promise<number> {
    try {
      const query = `
        query GetBondingCurveProgress($mintAddress: String!) {
          Solana {
            DEXPools(
              where: {
                Pool: {
                  Market: {
                    BaseCurrency: { MintAddress: { is: $mintAddress } }
                  }
                  Dex: {
                    ProgramAddress: { is: "LanMV9sAd7wArD4vJFi2qDdfnVhFxYSUg6eADduJ3uj" }
                  }
                }
                Transaction: { Result: { Success: true } }
              }
              orderBy: { descending: Block_Time }
              limit: { count: 1 }
            ) {
              Pool {
                Base {
                  PostAmount
                }
                Quote {
                  PostAmount
                }
              }
            }
          }
        }
      `

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          query,
          variables: { mintAddress }
        })
      })

      if (!response.ok) {
        return 0
      }

      const data = await response.json()
      const pools = data.data?.Solana?.DEXPools || []
      
      if (pools.length === 0) {
        return 0
      }

      const pool = pools[0]
      const baseAmount = parseFloat(pool.Pool.Base.PostAmount) || 0
      const quoteAmount = parseFloat(pool.Pool.Quote.PostAmount) || 0
      
      // Calculate progress (graduation happens at ~206.9M tokens sold)
      const graduationThreshold = 206900000
      const progress = Math.min((baseAmount / graduationThreshold) * 100, 100)
      
      return Math.round(progress * 100) / 100

    } catch (error) {
      console.error(`Error fetching bonding curve progress for ${mintAddress}:`, error)
      return 0
    }
  }

  /**
   * Get recent trading data for a token
   * @param mintAddress - Token mint address
   * @param limit - Number of trades to fetch (default: 10)
   * @returns Promise<any[]>
   */
  async getTokenTrades(mintAddress: string, limit: number = 10): Promise<any[]> {
    try {
      const query = `
        query GetTokenTrades($mintAddress: String!, $limit: Int!) {
          Solana {
            DEXTradeByTokens(
              where: {
                Trade: {
                  Dex: { ProtocolName: { is: "raydium_launchpad" } }
                  Currency: { MintAddress: { is: $mintAddress } }
                }
                Transaction: { Result: { Success: true } }
              }
              orderBy: { descending: Block_Time }
              limit: { count: $limit }
            ) {
              Trade {
                Currency {
                  MintAddress
                  Name
                  Symbol
                }
                Amount
                Price
                PriceInUSD
                Side {
                  Type
                  AmountInUSD
                }
              }
              Block {
                Time
              }
              Transaction {
                Signer
              }
            }
          }
        }
      `

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          query,
          variables: { mintAddress, limit }
        })
      })

      if (!response.ok) {
        return []
      }

      const data = await response.json()
      return data.data?.Solana?.DEXTradeByTokens || []

    } catch (error) {
      console.error(`Error fetching trades for ${mintAddress}:`, error)
      return []
    }
  }
}

export default BitqueryService
