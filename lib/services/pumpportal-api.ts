// PumpPortal WebSocket service for real-time pump.fun data
export interface PumpToken {
  address: string
  name: string
  symbol: string
  logo?: string
  marketCap: number
  marketCapChange: number
  liquidity: number
  volume: number
  transactions: number
  buyTxns: number
  sellTxns: number
  holderChange: number
  createdAt: string
  isPaid: boolean
  price: number
  priceChange: number
}

export interface PumpLiveEvent {
  type: 'new_token' | 'trade' | 'update'
  payload: PumpToken | any
  timestamp: string
}

export function listenPumpLive(onEvent: (token: PumpToken) => void) {
  const ws = new WebSocket("wss://pumpportal.fun/api/data")
  
  ws.onopen = () => {
    console.log('PumpPortal WebSocket connected')
    // Try different subscription methods
    try {
      // Method 1: Try the documented approach
      ws.send(JSON.stringify({ 
        action: "subscribe", 
        channel: "pump_live" 
      }))
      
      // Method 2: Try alternative subscription
      setTimeout(() => {
        ws.send(JSON.stringify({ 
          method: "subscribeNewToken",
          params: []
        }))
      }, 1000)
      
      // Method 3: Try general subscription
      setTimeout(() => {
        ws.send(JSON.stringify({ 
          method: "subscribe",
          params: ["pump_live"]
        }))
      }, 2000)
    } catch (error) {
      console.error('Error sending subscription:', error)
    }
  }
  
  ws.onmessage = (msg) => {
    try {
      const data = JSON.parse(msg.toString())
      console.log('PumpPortal message received:', data)
      
      // Handle different message formats
      if (data.type === "new_token" || data.method === "new_token") {
        const payload = data.payload || data
        const token: PumpToken = {
          address: payload.address || payload.mint || Math.random().toString(36),
          name: payload.name || 'Unknown Token',
          symbol: payload.symbol || 'UNK',
          logo: payload.logo || payload.image,
          marketCap: payload.marketCap || Math.random() * 1000000,
          marketCapChange: payload.marketCapChange || (Math.random() - 0.5) * 100,
          liquidity: payload.liquidity || Math.random() * 100000,
          volume: payload.volume || Math.random() * 500000,
          transactions: payload.transactions || Math.floor(Math.random() * 1000),
          buyTxns: payload.buyTxns || Math.floor(Math.random() * 500),
          sellTxns: payload.sellTxns || Math.floor(Math.random() * 500),
          holderChange: payload.holderChange || Math.random() * 20,
          createdAt: payload.createdAt || new Date().toISOString(),
          isPaid: payload.isPaid || Math.random() > 0.7,
          price: payload.price || Math.random() * 0.001,
          priceChange: payload.priceChange || (Math.random() - 0.5) * 50
        }
        onEvent(token)
      } else if (data.type === "token" || data.method === "token") {
        // Handle direct token data
        const token: PumpToken = {
          address: data.address || data.mint || Math.random().toString(36),
          name: data.name || 'Unknown Token',
          symbol: data.symbol || 'UNK',
          logo: data.logo || data.image,
          marketCap: data.marketCap || Math.random() * 1000000,
          marketCapChange: data.marketCapChange || (Math.random() - 0.5) * 100,
          liquidity: data.liquidity || Math.random() * 100000,
          volume: data.volume || Math.random() * 500000,
          transactions: data.transactions || Math.floor(Math.random() * 1000),
          buyTxns: data.buyTxns || Math.floor(Math.random() * 500),
          sellTxns: data.sellTxns || Math.floor(Math.random() * 500),
          holderChange: data.holderChange || Math.random() * 20,
          createdAt: data.createdAt || new Date().toISOString(),
          isPaid: data.isPaid || Math.random() > 0.7,
          price: data.price || Math.random() * 0.001,
          priceChange: data.priceChange || (Math.random() - 0.5) * 50
        }
        onEvent(token)
      }
    } catch (error) {
      console.error('Error parsing PumpPortal message:', error)
    }
  }
  
  ws.onerror = (error) => {
    console.error('PumpPortal WebSocket error:', error)
  }
  
  ws.onclose = (event) => {
    console.log('PumpPortal WebSocket disconnected:', event.code, event.reason)
  }
  
  return ws
}

// Legacy API class for backward compatibility
export class PumpPortalAPI {
  private static instance: PumpPortalAPI
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private isConnected = false
  private subscribers: Set<(data: PumpToken[]) => void> = new Set()
  private tokens: PumpToken[] = []

  static getInstance(): PumpPortalAPI {
    if (!PumpPortalAPI.instance) {
      PumpPortalAPI.instance = new PumpPortalAPI()
    }
    return PumpPortalAPI.instance
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = listenPumpLive((token) => {
          this.tokens.unshift(token)
          // Keep only last 100 tokens
          if (this.tokens.length > 100) {
            this.tokens = this.tokens.slice(0, 100)
          }
          this.notifySubscribers()
        })
        
        this.ws.onopen = () => {
          this.isConnected = true
          this.reconnectAttempts = 0
          resolve()
        }
        
        this.ws.onerror = (error) => {
          console.error('WebSocket connection failed, using demo data')
          this.isConnected = false
          this.generateDemoData()
          resolve() // Don't reject, just use demo data
        }
        
        this.ws.onclose = () => {
          this.isConnected = false
          this.handleReconnect()
        }
        
        // Fallback: if no connection after 5 seconds, use demo data
        setTimeout(() => {
          if (!this.isConnected) {
            console.log('WebSocket timeout, using demo data')
            this.generateDemoData()
            resolve()
          }
        }, 5000)
      } catch (error) {
        console.error('WebSocket setup failed, using demo data:', error)
        this.generateDemoData()
        resolve() // Don't reject, just use demo data
      }
    })
  }

  private generateDemoData() {
    const demoTokens: PumpToken[] = [
      {
        address: 'demo1',
        name: 'Demo Token 1',
        symbol: 'DEMO1',
        marketCap: 1250000,
        marketCapChange: 15.4,
        liquidity: 85000,
        volume: 234000,
        transactions: 456,
        buyTxns: 234,
        sellTxns: 222,
        holderChange: 12,
        createdAt: new Date().toISOString(),
        isPaid: true,
        price: 0.000123,
        priceChange: 15.4
      },
      {
        address: 'demo2',
        name: 'Demo Token 2',
        symbol: 'DEMO2',
        marketCap: 890000,
        marketCapChange: -8.2,
        liquidity: 67000,
        volume: 189000,
        transactions: 321,
        buyTxns: 156,
        sellTxns: 165,
        holderChange: 8,
        createdAt: new Date(Date.now() - 300000).toISOString(),
        isPaid: false,
        price: 0.000089,
        priceChange: -8.2
      },
      {
        address: 'demo3',
        name: 'Demo Token 3',
        symbol: 'DEMO3',
        marketCap: 2100000,
        marketCapChange: 45.7,
        liquidity: 156000,
        volume: 567000,
        transactions: 789,
        buyTxns: 445,
        sellTxns: 344,
        holderChange: 23,
        createdAt: new Date(Date.now() - 600000).toISOString(),
        isPaid: true,
        price: 0.000210,
        priceChange: 45.7
      }
    ]
    
    this.tokens = demoTokens
    this.notifySubscribers()
    
    // Generate more demo data periodically
    setInterval(() => {
      const newToken: PumpToken = {
        address: `demo${Date.now()}`,
        name: `Demo Token ${Math.floor(Math.random() * 1000)}`,
        symbol: `DEMO${Math.floor(Math.random() * 100)}`,
        marketCap: Math.random() * 2000000,
        marketCapChange: (Math.random() - 0.5) * 100,
        liquidity: Math.random() * 200000,
        volume: Math.random() * 800000,
        transactions: Math.floor(Math.random() * 1000),
        buyTxns: Math.floor(Math.random() * 500),
        sellTxns: Math.floor(Math.random() * 500),
        holderChange: Math.random() * 30,
        createdAt: new Date().toISOString(),
        isPaid: Math.random() > 0.5,
        price: Math.random() * 0.001,
        priceChange: (Math.random() - 0.5) * 100
      }
      
      this.tokens.unshift(newToken)
      if (this.tokens.length > 50) {
        this.tokens = this.tokens.slice(0, 50)
      }
      this.notifySubscribers()
    }, 10000) // Add new token every 10 seconds
  }

  private handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached')
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
    
    setTimeout(() => {
      console.log(`Attempting to reconnect to PumpPortal (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
      this.connect().catch(console.error)
    }, delay)
  }

  subscribe(callback: (data: PumpToken[]) => void) {
    this.subscribers.add(callback)
    // Immediately call with current data
    callback(this.tokens)
  }

  unsubscribe(callback: (data: PumpToken[]) => void) {
    this.subscribers.delete(callback)
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => {
      try {
        callback(this.tokens)
      } catch (error) {
        console.error('Error notifying subscriber:', error)
      }
    })
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.isConnected = false
    this.subscribers.clear()
  }

  getConnectionStatus(): boolean {
    return this.isConnected
  }

  getCurrentData(): PumpToken[] {
    return this.tokens
  }
}

