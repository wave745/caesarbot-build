import WebSocket from 'ws'
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
import bs58 from 'bs58'

const WS_URL = 'wss://pumpportal.fun/api/data'
const SOLANA_RPC = process.env.NEXT_PUBLIC_HELIUS_RPC_URL || 'https://api.mainnet-beta.solana.com'

export interface LiveToken {
  mint: string
  name: string
  symbol: string
  description: string
  image: string
  mcSol: number
  mcUsd: number
  timestamp: number
  timeAgo: number
  vSolInBondingCurve: number
  vTokensInBondingCurve: number
  isPaid: boolean
  price: number
  volume24h: number
  transactions: number
  holders: number
}

export class PumpLiveService {
  private static instance: PumpLiveService
  private ws: WebSocket | null = null
  private connection: Connection
  private liveTokens: Map<string, LiveToken> = new Map()
  private subscribers: Set<(tokens: LiveToken[]) => void> = new Set()
  private isConnected = false
  private solPrice = 150 // Default SOL price, will be fetched from API

  static getInstance(): PumpLiveService {
    if (!PumpLiveService.instance) {
      PumpLiveService.instance = new PumpLiveService()
    }
    return PumpLiveService.instance
  }

  constructor() {
    this.connection = new Connection(SOLANA_RPC)
    this.fetchSolPrice()
  }

  private async fetchSolPrice() {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd')
      const data = await response.json()
      this.solPrice = data.solana?.usd || 150
    } catch (error) {
      console.error('Failed to fetch SOL price:', error)
    }
  }

  async connect(): Promise<void> {
    return new Promise((resolve) => {
      try {
        console.log('Attempting to connect to PumpPortal WebSocket...')
        this.ws = new WebSocket(WS_URL)
        
        this.ws.on('open', () => {
          console.log('Connected to PumpPortal WebSocket')
          this.isConnected = true
          
          // Subscribe to new tokens
          this.ws?.send(JSON.stringify({ method: 'subscribeNewToken' }))
          
          // Subscribe to migrations
          this.ws?.send(JSON.stringify({ method: 'subscribeMigration' }))
          
          resolve()
        })

        this.ws.on('message', async (data) => {
          try {
            const event = JSON.parse(data.toString())
            console.log('Received PumpPortal message:', event)
            await this.handleMessage(event)
          } catch (error) {
            console.error('Error parsing PumpPortal message:', error)
          }
        })

        this.ws.on('error', (error) => {
          console.error('PumpPortal WebSocket error:', error)
          this.isConnected = false
          resolve()
        })

        this.ws.on('close', () => {
          console.log('PumpPortal WebSocket disconnected')
          this.isConnected = false
          this.handleReconnect()
        })

        // Fallback: if no connection after 5 seconds, resolve anyway
        setTimeout(() => {
          if (!this.isConnected) {
            console.log('WebSocket timeout, but continuing...')
            resolve()
          }
        }, 5000)
      } catch (error) {
        console.error('WebSocket setup failed:', error)
        resolve()
      }
    })
  }


  private async handleMessage(event: any) {
    console.log('Processing message with txType:', event.txType)
    
    if (event.txType === 'create') {
      // Filter out bonk tokens - only show pump.fun tokens
      if (event.pool === 'bonk') {
        console.log(`Skipping bonk token: ${event.mint}`)
        return
      }
      
      // New live token (pump.fun only)
      const mint = event.mint
      const mcSol = event.marketCapSol || 0
      const timestamp = Date.now()
      
      console.log(`New live pump: ${mint} (${mcSol} SOL MC) - ${event.name} (${event.symbol})`)
      
      // Use the data directly from PumpPortal instead of fetching metadata
      const liveToken: LiveToken = {
        mint,
        name: event.name || 'Unknown Token',
        symbol: event.symbol || 'UNK',
        description: '',
        image: event.uri ? await this.fetchImageFromUri(event.uri) : '',
        mcSol,
        mcUsd: mcSol * this.solPrice,
        timestamp,
        timeAgo: 0,
        vSolInBondingCurve: event.vSolInBondingCurve || 0,
        vTokensInBondingCurve: event.vTokensInBondingCurve || 0,
        isPaid: event.pool === 'pump', // pump.fun tokens are paid
        price: this.calculatePrice(event),
        volume24h: 0,
        transactions: 1, // Initial transaction
        holders: 1 // Initial holder
      }
      
      this.liveTokens.set(mint, liveToken)
      console.log(`Added token to live list. Total tokens: ${this.liveTokens.size}`)
      
      // Keep only top 20 recent tokens
      if (this.liveTokens.size > 20) {
        const sorted = Array.from(this.liveTokens.entries())
          .sort(([,a], [,b]) => b.timestamp - a.timestamp)
        this.liveTokens = new Map(sorted.slice(0, 20))
      }
      
      this.notifySubscribers()
      
    } else if (event.txType === 'migration') {
      // Remove completed token
      const mint = event.mint
      this.liveTokens.delete(mint)
      console.log(`Live pump completed: ${mint}`)
      this.notifySubscribers()
    } else {
      console.log('Unknown message type:', event.txType)
    }
  }

  private calculatePrice(event: any): number {
    if (event.vSolInBondingCurve && event.vTokensInBondingCurve) {
      return event.vSolInBondingCurve / event.vTokensInBondingCurve
    }
    return 0
  }

  private async fetchImageFromUri(uri: string): Promise<string> {
    try {
      const response = await fetch(uri)
      const data = await response.json()
      return data.image || ''
    } catch (error) {
      console.error('Error fetching image from URI:', error)
      return ''
    }
  }

  private async fetchTokenMetadata(mintStr: string): Promise<{
    name: string
    symbol: string
    description: string
    image: string
  }> {
    try {
      const mintPubkey = new PublicKey(mintStr)
      const [metadataPDA] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('metadata'),
          new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s').toBuffer(),
          mintPubkey.toBuffer()
        ],
        new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')
      )
      
      const metadataAccount = await this.connection.getAccountInfo(metadataPDA)
      if (!metadataAccount) {
        return {
          name: 'Unknown Token',
          symbol: mintStr.slice(0, 8),
          description: '',
          image: ''
        }
      }
      
      // For now, return basic data without parsing metadata
      // The Metadata.deserialize is causing TypeScript issues
      return {
        name: 'Unknown Token',
        symbol: mintStr.slice(0, 8),
        description: '',
        image: ''
      }
    } catch (error) {
      console.error(`Metadata fetch failed for ${mintStr}:`, error)
      return {
        name: 'Unknown Token',
        symbol: mintStr.slice(0, 8),
        description: '',
        image: ''
      }
    }
  }

  private handleReconnect() {
    setTimeout(() => {
      console.log('Attempting to reconnect to PumpPortal...')
      this.connect().catch(console.error)
    }, 5000)
  }

  subscribe(callback: (tokens: LiveToken[]) => void) {
    this.subscribers.add(callback)
    // Immediately call with current data
    callback(this.getLiveTokens())
  }

  unsubscribe(callback: (tokens: LiveToken[]) => void) {
    this.subscribers.delete(callback)
  }

  private notifySubscribers() {
    const tokens = this.getLiveTokens()
    this.subscribers.forEach(callback => {
      try {
        callback(tokens)
      } catch (error) {
        console.error('Error notifying subscriber:', error)
      }
    })
  }

  getLiveTokens(): LiveToken[] {
    const now = Date.now()
    const tokens = Array.from(this.liveTokens.values())
      .map(token => ({
        ...token,
        timeAgo: Math.floor((now - token.timestamp) / 1000)
      }))
      .sort((a, b) => b.timestamp - a.timestamp)
    
    return tokens
  }

  getConnectionStatus(): boolean {
    return this.isConnected
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.isConnected = false
    this.subscribers.clear()
  }
}
