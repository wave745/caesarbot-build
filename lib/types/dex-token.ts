export interface DexToken {
  pairAddress: string
  baseToken: {
    address: string
    name: string
    symbol: string
  }
  quoteToken: {
    address: string
    name: string
    symbol: string
  }
  priceUsd: string
  priceChange: {
    h24: number
  }
  volume: {
    h24: number
  }
  marketCap: number
  liquidity: {
    usd: number
  }
  txns: {
    h24: {
      buys: number
      sells: number
    }
  }
  pairCreatedAt: number
  info: {
    imageUrl?: string
  }
}




