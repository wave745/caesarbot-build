// Comprehensive Moralis API service with all features
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

// Moralis API Response Interfaces
export interface MoralisTokenMetadata {
  chainId: string
  tokenAddress: string
  name: string
  uniqueName: string | null
  symbol: string
  decimals: number
  logo: string
  usdPrice: number
  createdAt: number
  marketCap: number
  liquidityUsd: number
  holders: number
  pricePercentChange: {
    '1h': number
    '4h': number
    '12h': number
    '24h': number
  }
  totalVolume: {
    '1h': number
    '4h': number
    '12h': number
    '24h': number
  }
  transactions: {
    '1h': number
    '4h': number
    '12h': number
    '24h': number
  }
  buyTransactions: {
    '1h': number
    '4h': number
    '12h': number
    '24h': number
  }
  sellTransactions: {
    '1h': number
    '4h': number
    '12h': number
    '24h': number
  }
  buyers: {
    '1h': number
    '4h': number
    '12h': number
    '24h': number
  }
  sellers: {
    '1h': number
    '4h': number
    '12h': number
    '24h': number
  }
  risk: 'low' | 'med' | 'high'
  isPaid: boolean
  age: number
}

export interface MoralisTokenBalance {
  chainId: string
  tokenAddress: string
  name: string
  symbol: string
  decimals: number
  logo: string
  balance: string
  balanceFormatted: string
  usdPrice: number
  usdValue: number
  percentage: number
}

export interface MoralisPumpFunNewToken {
  tokenAddress: string
  name: string
  symbol: string
  logo?: string
  decimals: string
  priceNative: string
  priceUsd: string
  liquidity: string
  fullyDilutedValuation: string
  createdAt: string
}

export interface MoralisPumpFunToken {
  chainId: string
  tokenAddress: string
  name: string
  symbol: string
  decimals: number
  logo: string
  usdPrice: number
  createdAt: number
  marketCap: number
  liquidityUsd: number
  holders: number
  pricePercentChange: {
    '1h': number
    '4h': number
    '12h': number
    '24h': number
  }
  totalVolume: {
    '1h': number
    '4h': number
    '12h': number
    '24h': number
  }
  transactions: {
    '1h': number
    '4h': number
    '12h': number
    '24h': number
  }
  buyTransactions: {
    '1h': number
    '4h': number
    '12h': number
    '24h': number
  }
  sellTransactions: {
    '1h': number
    '4h': number
    '12h': number
    '24h': number
  }
  buyers: {
    '1h': number
    '4h': number
    '12h': number
    '24h': number
  }
  sellers: {
    '1h': number
    '4h': number
    '12h': number
    '24h': number
  }
  risk: 'low' | 'med' | 'high'
  isPaid: boolean
  age: number
}

export interface MoralisTokenHolder {
  chainId: string
  tokenAddress: string
  holderAddress: string
  balance: string
  balanceFormatted: string
  usdValue: number
  percentage: number
  isContract: boolean
  firstTransactionAt: number
  lastTransactionAt: number
}

export interface MoralisTokenSwap {
  chainId: string
  transactionHash: string
  blockNumber: number
  timestamp: number
  tokenAddress: string
  fromAddress: string
  toAddress: string
  amount: string
  amountFormatted: string
  usdValue: number
  type: 'buy' | 'sell'
  dex: string
  price: number
  slippage: number
}

export interface MoralisPair {
  chainId: string
  pairAddress: string
  token0Address: string
  token1Address: string
  token0Symbol: string
  token1Symbol: string
  token0Name: string
  token1Name: string
  token0Decimals: number
  token1Decimals: number
  liquidityUsd: number
  volume24h: number
  priceChange24h: number
  fee: number
  createdAt: number
}

export interface MoralisTokenAnalytics {
  chainId: string
  tokenAddress: string
  timeframe: string
  priceData: Array<{
    timestamp: number
    price: number
    volume: number
    marketCap: number
  }>
  volumeData: Array<{
    timestamp: number
    volume: number
    buyVolume: number
    sellVolume: number
  }>
  holderData: Array<{
    timestamp: number
    holders: number
    newHolders: number
    lostHolders: number
  }>
  transactionData: Array<{
    timestamp: number
    transactions: number
    buyTransactions: number
    sellTransactions: number
  }>
}

export interface MoralisVolumeStats {
  chainId: string
  tokenAddress: string
  timeframe: string
  totalVolume: number
  buyVolume: number
  sellVolume: number
  volumeChange: number
  averageVolume: number
  peakVolume: number
  volumeDistribution: Array<{
    hour: number
    volume: number
  }>
}

export interface MoralisTokenPrice {
  chainId: string
  tokenAddress: string
  price: number
  priceChange24h: number
  priceChange7d: number
  priceChange30d: number
  marketCap: number
  volume24h: number
  liquidity: number
  timestamp: number
}

export interface MoralisTokenSniper {
  chainId: string
  tokenAddress: string
  sniperAddress: string
  amount: string
  amountFormatted: string
  usdValue: number
  timestamp: number
  transactionHash: string
  blockNumber: number
  gasUsed: number
  gasPrice: number
  priorityFee: number
}

export interface MoralisFilteredToken {
  chainId: string
  tokenAddress: string
  name: string
  symbol: string
  decimals: number
  logo: string
  usdPrice: number
  createdAt: number
  marketCap: number
  liquidityUsd: number
  holders: number
  pricePercentChange: {
    '1h': number
    '4h': number
    '12h': number
    '24h': number
  }
  totalVolume: {
    '1h': number
    '4h': number
    '12h': number
    '24h': number
  }
  transactions: {
    '1h': number
    '4h': number
    '12h': number
    '24h': number
  }
  buyTransactions: {
    '1h': number
    '4h': number
    '12h': number
    '24h': number
  }
  sellTransactions: {
    '1h': number
    '4h': number
    '12h': number
    '24h': number
  }
  buyers: {
    '1h': number
    '4h': number
    '12h': number
    '24h': number
  }
  sellers: {
    '1h': number
    '4h': number
    '12h': number
    '24h': number
  }
  risk: 'low' | 'med' | 'high'
  isPaid: boolean
  age: number
  filters: string[]
}

export class MoralisComprehensiveService {
  private static instance: MoralisComprehensiveService
  private apiKey: string
  private baseUrl = 'https://solana-gateway.moralis.io'

  constructor() {
    this.apiKey = process.env.MORALIS_API_KEY || process.env.NEXT_PUBLIC_MORALIS_API_KEY || ''
    if (!this.apiKey) {
      console.warn('Moralis API key not found in environment variables')
    }
  }

  static getInstance(): MoralisComprehensiveService {
    if (!MoralisComprehensiveService.instance) {
      MoralisComprehensiveService.instance = new MoralisComprehensiveService()
    }
    return MoralisComprehensiveService.instance
  }

  // Helper method to execute curl commands with retry logic
  private async executeCurlCommand(url: string, params: Record<string, any> = {}, retries: number = 3): Promise<any> {
    const queryString = new URLSearchParams(params).toString()
    const fullUrl = queryString ? `${url}?${queryString}` : url
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const curlCommand = `curl --request GET --url '${fullUrl}' --header 'accept: application/json' --header 'X-API-Key: ${this.apiKey}' --connect-timeout 10 --max-time 30 --retry 0 --no-keepalive --compressed --silent --show-error`
        
        console.log(`Executing curl command (attempt ${attempt}/${retries}):`, curlCommand)
        const { stdout, stderr } = await execAsync(curlCommand)
        
        if (stderr) {
          console.error('Curl stderr:', stderr)
        }
        
        return JSON.parse(stdout)
      } catch (error) {
        console.error(`Error executing curl command (attempt ${attempt}/${retries}):`, error)
        
        if (attempt === retries) {
          throw error
        }
        
        // Exponential backoff: wait 1s, 2s, 4s between retries
        const delay = Math.pow(2, attempt - 1) * 1000
        console.log(`Retrying in ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  // 1. Get Token Metadata
  async getTokenMetadata(tokenAddress: string, network: string = 'mainnet'): Promise<MoralisTokenMetadata> {
    try {
      console.log(`Fetching metadata for token: ${tokenAddress} on network: ${network}`)
      
      const url = `${this.baseUrl}/token/${network}/${tokenAddress}/metadata`
      const data = await this.executeCurlCommand(url, {})
      
      return data
    } catch (error) {
      console.error('Error fetching token metadata:', error)
      throw error
    }
  }

  // 2. Get Token Balances
  async getTokenBalances(walletAddress: string, chain: string = 'solana', limit: number = 100): Promise<MoralisTokenBalance[]> {
    try {
      console.log(`Fetching token balances for wallet: ${walletAddress}`)
      
      const url = `${this.baseUrl}/account/${chain}/${walletAddress}/tokens`
      const data = await this.executeCurlCommand(url, { limit })
      
      return data
    } catch (error) {
      console.error('Error fetching token balances:', error)
      throw error
    }
  }

  // 3. Get Pump Fun Tokens
  async getPumpFunTokens(limit: number = 100, timeframe: string = '1h'): Promise<MoralisPumpFunToken[]> {
    try {
      console.log(`Fetching Pump Fun tokens (limit: ${limit}, timeframe: ${timeframe})`)
      
      const url = `${this.baseUrl}/tokens/pump-fun`
      const data = await this.executeCurlCommand(url, { limit, timeframe })
      
      return data
    } catch (error) {
      console.error('Error fetching Pump Fun tokens:', error)
      throw error
    }
  }

  // 4. Get Token Holders
  async getTokenHolders(tokenAddress: string, network: string = 'mainnet', limit: number = 100): Promise<MoralisTokenHolder[]> {
    try {
      console.log(`Fetching holders for token: ${tokenAddress} on network: ${network}`)
      
      const url = `${this.baseUrl}/token/${network}/${tokenAddress}/holders`
      const data = await this.executeCurlCommand(url, { limit })
      
      return data
    } catch (error) {
      console.error('Error fetching token holders:', error)
      throw error
    }
  }

  // 4.1. Get Top Token Holders
  async getTopTokenHolders(tokenAddress: string, network: string = 'mainnet', limit: number = 15): Promise<MoralisTokenHolder[]> {
    try {
      console.log(`Fetching top holders for token: ${tokenAddress} on network: ${network}`)
      
      const url = `${this.baseUrl}/token/${network}/${tokenAddress}/top-holders`
      const data = await this.executeCurlCommand(url, { limit })
      
      return data
    } catch (error) {
      console.error('Error fetching top token holders:', error)
      throw error
    }
  }

  // 4.2. Get Token Holder Stats
  async getTokenHolderStats(tokenAddress: string, network: string = 'mainnet'): Promise<any> {
    try {
      console.log(`Fetching holder stats for token: ${tokenAddress} on network: ${network}`)
      
      const url = `${this.baseUrl}/token/${network}/holders/${tokenAddress}`
      const data = await this.executeCurlCommand(url, {})
      
      return data
    } catch (error) {
      console.error('Error fetching token holder stats:', error)
      throw error
    }
  }

  // 5. Get Token Swaps
  async getTokenSwaps(tokenAddress: string, chain: string = 'solana', limit: number = 100, timeframe: string = '24h'): Promise<MoralisTokenSwap[]> {
    try {
      console.log(`Fetching swaps for token: ${tokenAddress}`)
      
      const url = `${this.baseUrl}/tokens/${tokenAddress}/swaps`
      const data = await this.executeCurlCommand(url, { chain, limit, timeframe })
      
      return data
    } catch (error) {
      console.error('Error fetching token swaps:', error)
      throw error
    }
  }

  // 6. Get Pairs & Liquidity
  async getPairsAndLiquidity(tokenAddress: string, chain: string = 'solana'): Promise<MoralisPair[]> {
    try {
      console.log(`Fetching pairs for token: ${tokenAddress}`)
      
      const url = `${this.baseUrl}/tokens/${tokenAddress}/pairs`
      const data = await this.executeCurlCommand(url, { chain })
      
      return data
    } catch (error) {
      console.error('Error fetching pairs:', error)
      throw error
    }
  }

  // 7. Get Token Analytics
  async getTokenAnalytics(tokenAddress: string, chain: string = 'solana', timeframe: string = '24h'): Promise<MoralisTokenAnalytics> {
    try {
      console.log(`Fetching analytics for token: ${tokenAddress}`)
      
      const url = `${this.baseUrl}/tokens/${tokenAddress}/analytics`
      const data = await this.executeCurlCommand(url, { chain, timeframe })
      
      return data
    } catch (error) {
      console.error('Error fetching token analytics:', error)
      throw error
    }
  }

  // 8. Get Volume Stats
  async getVolumeStats(tokenAddress: string, chain: string = 'solana', timeframe: string = '24h'): Promise<MoralisVolumeStats> {
    try {
      console.log(`Fetching volume stats for token: ${tokenAddress}`)
      
      const url = `${this.baseUrl}/tokens/${tokenAddress}/volume`
      const data = await this.executeCurlCommand(url, { chain, timeframe })
      
      return data
    } catch (error) {
      console.error('Error fetching volume stats:', error)
      throw error
    }
  }

  // 9. Get Token Prices
  async getTokenPrices(tokenAddresses: string[], chain: string = 'solana'): Promise<MoralisTokenPrice[]> {
    try {
      console.log(`Fetching prices for ${tokenAddresses.length} tokens`)
      
      const url = `${this.baseUrl}/token/${chain}/${tokenAddresses[0]}/price`
      const data = await this.executeCurlCommand(url, {})
      
      return data
    } catch (error) {
      console.error('Error fetching token prices:', error)
      throw error
    }
  }

  // 10. Get Token Snipers
  async getTokenSnipers(tokenAddress: string, chain: string = 'solana', limit: number = 100): Promise<MoralisTokenSniper[]> {
    try {
      console.log(`Fetching snipers for token: ${tokenAddress}`)
      
      const url = `${this.baseUrl}/tokens/${tokenAddress}/snipers`
      const data = await this.executeCurlCommand(url, { chain, limit })
      
      return data
    } catch (error) {
      console.error('Error fetching token snipers:', error)
      throw error
    }
  }

  // 11. Get Filtered Tokens
  async getFilteredTokens(filters: Record<string, any>, limit: number = 100): Promise<MoralisFilteredToken[]> {
    try {
      console.log(`Fetching filtered tokens with filters:`, filters)
      
      const url = `${this.baseUrl}/tokens/filtered`
      const data = await this.executeCurlCommand(url, { ...filters, limit })
      
      return data
    } catch (error) {
      console.error('Error fetching filtered tokens:', error)
      throw error
    }
  }

  // 12. Get Trending Tokens (enhanced)
  async getTrendingTokens(limit: number = 100, timeframe: string = '1h'): Promise<MoralisTokenMetadata[]> {
    try {
      console.log(`Fetching ${limit} trending tokens from Moralis...`)
      
      const url = `https://deep-index.moralis.io/api/v2.2/tokens/trending`
      const data = await this.executeCurlCommand(url, { 
        chain: 'solana', 
        limit, 
        timeframe 
      })
      
      return data
    } catch (error) {
      console.error('Error fetching trending tokens:', error)
      throw error
    }
  }

  // 13. Search Tokens (enhanced)
  async searchTokens(query: string, limit: number = 100): Promise<MoralisTokenMetadata[]> {
    try {
      console.log(`Searching tokens with query: ${query}`)
      
      const url = `${this.baseUrl}/tokens/search`
      const data = await this.executeCurlCommand(url, { 
        chain: 'solana', 
        q: query, 
        limit 
      })
      
      return data
    } catch (error) {
      console.error('Error searching tokens:', error)
      throw error
    }
  }

  // 14. Get New Tokens (replaces PumpPortal) - Use Pump.fun new tokens endpoint
  async getNewTokens(limit: number = 100, timeframe: string = '1h'): Promise<MoralisPumpFunNewToken[]> {
    try {
      console.log(`Fetching new Pump.fun tokens (limit: ${limit})`)
      
      // Use the dedicated Pump.fun new tokens endpoint
      const url = `https://solana-gateway.moralis.io/token/mainnet/exchange/pumpfun/new`
      const data = await this.executeCurlCommand(url, { 
        limit 
      })
      
      return data.result || []
    } catch (error) {
      console.error('Error fetching new tokens:', error)
      throw error
    }
  }

  // 15. Get Token Details (comprehensive)
  async getTokenDetails(tokenAddress: string, chain: string = 'solana'): Promise<{
    metadata: MoralisTokenMetadata
    analytics: MoralisTokenAnalytics
    volumeStats: MoralisVolumeStats
    holders: MoralisTokenHolder[]
    pairs: MoralisPair[]
  }> {
    try {
      console.log(`Fetching comprehensive details for token: ${tokenAddress}`)
      
      const [metadata, analytics, volumeStats, holders, pairs] = await Promise.all([
        this.getTokenMetadata(tokenAddress, chain),
        this.getTokenAnalytics(tokenAddress, chain),
        this.getVolumeStats(tokenAddress, chain),
        this.getTokenHolders(tokenAddress, chain),
        this.getPairsAndLiquidity(tokenAddress, chain)
      ])
      
      return {
        metadata,
        analytics,
        volumeStats,
        holders,
        pairs
      }
    } catch (error) {
      console.error('Error fetching token details:', error)
      throw error
    }
  }
}

