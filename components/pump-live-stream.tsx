"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Users, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Wifi,
  WifiOff,
  RefreshCw
} from "lucide-react"
// Define interfaces locally since we're now using Moralis
interface PumpToken {
  mint: string
  symbol: string
  name: string
  image?: string
  mcUsd: number
  volume24h: number
  transactions: number
  holders: number
  timeAgo: number
}

interface PumpTrade {
  id: string
  token: string
  type: 'buy' | 'sell'
  amount: number
  price: number
  timestamp: number
  user: string
}

interface PumpLiveStreamData {
  tokens: PumpToken[]
  trades: PumpTrade[]
  timestamp: number
}

export function PumpLiveStream() {
  const [data, setData] = useState<PumpLiveStreamData>({
    tokens: [],
    trades: [],
    timestamp: Date.now()
  })
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("new-tokens")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/moralis/new-tokens')
        const result = await response.json()
        
        if (result.success) {
          setData({
            tokens: result.tokens,
            trades: [], // No trades data from Moralis new tokens endpoint
            timestamp: Date.now()
          })
          setIsConnected(true)
        } else {
          setData({
            tokens: [],
            trades: [],
            timestamp: Date.now()
          })
          setIsConnected(false)
        }
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching data:', error)
        setData({
          tokens: [],
          trades: [],
          timestamp: Date.now()
        })
        setIsConnected(false)
        setIsLoading(false)
      }
    }

    // Initial fetch
    fetchData()

    // Poll every 30 seconds for updates
    const interval = setInterval(fetchData, 30000)

    return () => clearInterval(interval)
  }, [])

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toFixed(2)
  }

  const formatPercentage = (num: number) => {
    const sign = num >= 0 ? '+' : ''
    return `${sign}${num.toFixed(2)}%`
  }

  const getChangeColor = (change: number) => {
    if (change > 0) return "text-green-400"
    if (change < 0) return "text-red-400"
    return "text-gray-400"
  }

  const getChangeIcon = (change: number) => {
    if (change > 0) return <ArrowUpRight className="w-3 h-3" />
    if (change < 0) return <ArrowDownRight className="w-3 h-3" />
    return null
  }

  const reconnect = async () => {
    try {
      const response = await fetch('/api/moralis/new-tokens')
      const result = await response.json()
      
      if (result.success) {
        setData({
          tokens: result.tokens,
          trades: [],
          timestamp: Date.now()
        })
        setIsConnected(true)
      } else {
        setData({
          tokens: [],
          trades: [],
          timestamp: Date.now()
        })
        setIsConnected(false)
      }
    } catch (error) {
      console.error('Error during reconnect:', error)
      setData({
        tokens: [],
        trades: [],
        timestamp: Date.now()
      })
      setIsConnected(false)
    }
  }

  return (
    <Card className="bg-black border-zinc-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            PUMP.FUN LIVE STREAM
          </CardTitle>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <div className="flex items-center gap-1 text-green-400">
                <Wifi className="w-4 h-4" />
                <span className="text-xs">LIVE</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-red-400">
                <WifiOff className="w-4 h-4" />
                <span className="text-xs">OFFLINE</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={reconnect}
              className="text-gray-400 hover:text-white"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-zinc-900">
            <TabsTrigger value="new-tokens" className="text-xs">New Tokens</TabsTrigger>
            <TabsTrigger value="trades" className="text-xs">Live Trades</TabsTrigger>
            <TabsTrigger value="gainers" className="text-xs">Top Gainers</TabsTrigger>
            <TabsTrigger value="losers" className="text-xs">Top Losers</TabsTrigger>
          </TabsList>

          <TabsContent value="new-tokens" className="mt-4">
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : data.newTokens.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  No new tokens yet...
                </div>
              ) : (
                data.newTokens.map((token, index) => (
                  <div key={`${token.mint}-${index}`} className="flex items-center justify-between p-3 bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-black font-bold text-xs">
                        {token.symbol.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">{token.symbol}</span>
                          <span className="text-gray-400 text-sm">{token.name}</span>
                          {token.isPaid && (
                            <Badge variant="secondary" className="bg-yellow-500 text-black text-xs">
                              PAID
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-gray-400">
                          {formatNumber(token.marketCap)} • {formatNumber(token.volume)} vol
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`flex items-center gap-1 ${getChangeColor(token.marketCapChange)}`}>
                        {getChangeIcon(token.marketCapChange)}
                        <span className="font-medium">{formatPercentage(token.marketCapChange)}</span>
                      </div>
                      <div className="text-xs text-gray-400">
                        {formatNumber(token.liquidity)} liq
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="trades" className="mt-4">
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : data.recentTrades.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  No recent trades...
                </div>
              ) : (
                data.recentTrades.map((trade, index) => (
                  <div key={`${trade.txHash}-${index}`} className="flex items-center justify-between p-3 bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        trade.type === 'buy' ? 'bg-green-500' : 'bg-red-500'
                      }`}>
                        {trade.type === 'buy' ? (
                          <ArrowUpRight className="w-4 h-4 text-white" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-white">
                          {trade.type.toUpperCase()} {trade.symbol || 'UNK'}
                        </div>
                        <div className="text-xs text-gray-400">
                          {formatNumber(trade.amount)} tokens
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-white">
                        ${formatNumber(trade.price)}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(trade.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="gainers" className="mt-4">
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : data.topGainers.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  No gainers yet...
                </div>
              ) : (
                data.topGainers.map((token, index) => (
                  <div key={`gainer-${token.mint}-${index}`} className="flex items-center justify-between p-3 bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-black font-bold text-xs">
                        {index + 1}
                      </div>
                      <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-black font-bold text-xs">
                        {token.symbol.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-white">{token.symbol}</div>
                        <div className="text-xs text-gray-400">{token.name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-green-400">
                        <TrendingUp className="w-3 h-3" />
                        <span className="font-medium">{formatPercentage(token.marketCapChange)}</span>
                      </div>
                      <div className="text-xs text-gray-400">
                        {formatNumber(token.marketCap)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="losers" className="mt-4">
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : data.topLosers.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  No losers yet...
                </div>
              ) : (
                data.topLosers.map((token, index) => (
                  <div key={`loser-${token.mint}-${index}`} className="flex items-center justify-between p-3 bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                        {index + 1}
                      </div>
                      <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-black font-bold text-xs">
                        {token.symbol.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-white">{token.symbol}</div>
                        <div className="text-xs text-gray-400">{token.name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-red-400">
                        <TrendingDown className="w-3 h-3" />
                        <span className="font-medium">{formatPercentage(token.marketCapChange)}</span>
                      </div>
                      <div className="text-xs text-gray-400">
                        {formatNumber(token.marketCap)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}



