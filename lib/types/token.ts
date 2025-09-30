export interface TokenInfo {
  name: string
  symbol: string
  mint: string
  imageUrl?: string
  age: string
  chain: string
  isWatched: boolean
}

export interface TokenMetrics {
  price: number
  priceChange: number
  liquidity: number
  fdv: number
  taxes: {
    buy: number
    sell: number
  }
}

export interface TradeData {
  id: string
  timestamp: number
  type: 'Buy' | 'Sell'
  amount: number
  price: number
  value: number
  trader: string
  signature: string
}

export interface HolderData {
  address: string
  balance: number
  percentage: number
  change: number
}

export interface PositionData {
  id: string
  side: 'Long' | 'Short'
  size: number
  entryPrice: number
  currentPrice: number
  pnl: number
  timestamp: number
}

export interface OrderData {
  id: string
  side: 'Buy' | 'Sell'
  type: 'Market' | 'Limit' | 'Stop'
  amount: number
  price: number
  status: 'Pending' | 'Active' | 'Filled' | 'Cancelled'
  timestamp: number
}

export interface DevTokenData {
  address: string
  symbol: string
  name: string
  price: number
  priceChange: number
  volume: number
  marketCap: number
}

export interface TopTraderData {
  address: string
  rank: number
  pnl: number
  volume: number
  trades: number
}

export interface SecurityBadge {
  type: 'Mint Frozen' | 'Transfer Fee' | 'LP Unlocked' | 'Verified'
  status: 'warning' | 'error' | 'success'
}

export interface TradeFormData {
  side: 'Buy' | 'Sell'
  orderType: 'Market' | 'Limit' | 'Stop'
  amount: number
  exitStrategy: boolean
  gasFee: number
  priorityFee: number
  estimatedReceive: number
}

export interface PerformanceStats {
  '5m': number
  '15m': number
  '30m': number
  '1h': number
}

export interface SecurityData {
  top10Holders: number
  devHolding: number
  snipers: number
  insiders: number
  bundles: number
  burnedLiquidity: number
  freshBuys: number
  freshHolding: string
  mintAuth: boolean
  freezeAuth: boolean
}

export type TabType = 'Trades' | 'Positions' | 'Orders' | 'Holders' | 'Top Traders' | 'Dev Tokens'




