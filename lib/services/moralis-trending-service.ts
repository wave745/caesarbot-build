// import https from 'https'

interface MoralisTrendingToken {
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
}

interface TrendingToken {
  ca: string
  symbol: string
  name: string
  image: string
  marketCap: number
  liquidity: number
  volume: number
  txns: number
  price: number
  change: number
  holders: number
  age: number
  isPaid: boolean
  risk: 'low' | 'med' | 'high'
  buyTxns: number
  sellTxns: number
  holderChange: string
}

export class MoralisTrendingService {
  private static instance: MoralisTrendingService
  private apiKey: string
  private baseUrl = 'https://deep-index.moralis.io/api/v2.2'

  constructor() {
    this.apiKey = process.env.MORALIS_API_KEY || process.env.NEXT_PUBLIC_MORALIS_API_KEY || ''
    if (!this.apiKey) {
      console.warn('Moralis API key not found in environment variables')
    }
  }

  static getInstance(): MoralisTrendingService {
    if (!MoralisTrendingService.instance) {
      MoralisTrendingService.instance = new MoralisTrendingService()
    }
    return MoralisTrendingService.instance
  }

  async getTrendingTokens(limit: number = 100): Promise<TrendingToken[]> {
    try {
      console.log(`Fetching ${limit} trending tokens from Moralis...`)
      
      // Use the working curl command approach via child_process
      const { exec } = require('child_process')
      const util = require('util')
      const execAsync = util.promisify(exec)
      
      const curlCommand = `curl --request GET --url 'https://deep-index.moralis.io/api/v2.2/tokens/trending?chain=solana&limit=${limit}' --header 'accept: application/json' --header 'X-API-Key: ${this.apiKey}'`
      
      console.log('Executing curl command...')
      const { stdout, stderr } = await execAsync(curlCommand)
      
      if (stderr) {
        console.error('Curl stderr:', stderr)
      }
      
      console.log('Curl output length:', stdout.length)
      
      const data: MoralisTrendingToken[] = JSON.parse(stdout)
      console.log(`Received ${data.length} trending tokens from Moralis`)
      
      const convertedTokens = data.map(token => {
        console.log('Converting token:', token.symbol, token.name)
        return this.convertToTrendingToken(token)
      })
      
      console.log(`Converted ${convertedTokens.length} tokens`)
      return convertedTokens
    } catch (error) {
      console.error('Error fetching trending tokens from Moralis:', error)
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined
      })
      // Return empty array instead of throwing to prevent API failure
      console.log('Returning empty array due to error')
      return []
    }
  }

  private convertToTrendingToken(token: MoralisTrendingToken): TrendingToken {
    // Calculate age in minutes
    const createdAt = new Date(token.createdAt * 1000)
    const now = new Date()
    const ageMinutes = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60))
    
    // Calculate holder change (simplified - using buyers vs sellers ratio)
    const buyers1h = token.buyers['1h']
    const sellers1h = token.sellers['1h']
    const holderChange = buyers1h > sellers1h ? 
      `+${Math.round(((buyers1h - sellers1h) / Math.max(sellers1h, 1)) * 100)}%` : 
      `${Math.round(((buyers1h - sellers1h) / Math.max(sellers1h, 1)) * 100)}%`

    // Determine risk level based on market cap and age
    let risk: 'low' | 'med' | 'high' = 'med'
    if (token.marketCap > 1000000) risk = 'low'
    else if (token.marketCap < 100000 || ageMinutes < 60) risk = 'high'

    // Determine if token is "paid" (DEX status) - simplified logic
    const isPaid = token.marketCap > 500000 && token.liquidityUsd > 50000

    return {
      ca: token.tokenAddress,
      symbol: token.symbol,
      name: token.name,
      image: token.logo,
      marketCap: Math.round(token.marketCap),
      liquidity: Math.round(token.liquidityUsd),
      volume: Math.round(token.totalVolume['1h']),
      txns: token.transactions['1h'],
      price: token.usdPrice,
      change: Math.round(token.pricePercentChange['1h'] * 100) / 100,
      holders: token.holders,
      age: ageMinutes,
      isPaid,
      risk,
      buyTxns: token.buyTransactions['1h'],
      sellTxns: token.sellTransactions['1h'],
      holderChange
    }
  }

  async searchTokens(query: string, limit: number = 100): Promise<TrendingToken[]> {
    try {
      console.log(`Searching tokens with query: ${query}`)
      
      // Use curl command for search as well
      const { exec } = require('child_process')
      const util = require('util')
      const execAsync = util.promisify(exec)
      
      const curlCommand = `curl --request GET --url 'https://deep-index.moralis.io/api/v2.2/tokens/search?chain=solana&q=${encodeURIComponent(query)}&limit=${limit}' --header 'accept: application/json' --header 'X-API-Key: ${this.apiKey}'`
      
      console.log('Executing search curl command...')
      const { stdout, stderr } = await execAsync(curlCommand)
      
      if (stderr) {
        console.error('Search curl stderr:', stderr)
      }
      
      const data: MoralisTrendingToken[] = JSON.parse(stdout)
      console.log(`Found ${data.length} tokens matching "${query}"`)
      
      return data.map(token => this.convertToTrendingToken(token))
    } catch (error) {
      console.error('Error searching tokens with Moralis:', error)
      console.log('Returning empty array due to search error')
      return []
    }
  }
}



