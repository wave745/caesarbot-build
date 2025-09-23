"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  ExternalLink,
  RefreshCw,
  Wifi,
  WifiOff,
  Clock,
  Users,
  Activity
} from "lucide-react"
import { LiveToken } from "@/lib/services/pumpportal-live"

export function PumpLiveProper() {
  const [tokens, setTokens] = useState<LiveToken[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'time' | 'mc' | 'volume'>('time')

  useEffect(() => {
    const fetchLiveTokens = async () => {
      try {
        const response = await fetch('/api/pump-live-proper')
        const data = await response.json()
        
        setTokens(data.tokens || [])
        setIsConnected(data.isConnected || false)
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching live tokens:', error)
        setIsLoading(false)
      }
    }

    // Initial fetch
    fetchLiveTokens()

    // Poll every 5 seconds for updates
    const interval = setInterval(fetchLiveTokens, 5000)

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

  const formatTimeAgo = (seconds: number) => {
    if (seconds < 60) return `${seconds}s ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    return `${Math.floor(seconds / 3600)}h ago`
  }

  const getChangeColor = (change: number) => {
    if (change > 0) return "text-green-400"
    if (change < 0) return "text-red-400"
    return "text-gray-400"
  }

  const sortedTokens = [...tokens].sort((a, b) => {
    switch (sortBy) {
      case 'mc':
        return b.mcUsd - a.mcUsd
      case 'volume':
        return b.volume24h - a.volume24h
      case 'time':
      default:
        return b.timestamp - a.timestamp
    }
  })

  const handleBuy = (token: LiveToken) => {
    console.log(`Buying ${token.symbol} (${token.mint})`)
    // TODO: Integrate with Solana wallet adapter
  }

  const reconnect = () => {
    setIsLoading(true)
    setIsConnected(false)
    // The useEffect will handle reconnection
    window.location.reload()
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            PUMP LIVE
          </h2>
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
        </div>
        
        <div className="flex items-center gap-2">
          {/* Sort buttons */}
          <div className="flex gap-1">
            {[
              { key: 'time', label: 'Time' },
              { key: 'mc', label: 'MC' },
              { key: 'volume', label: 'Volume' }
            ].map(({ key, label }) => (
              <Button
                key={key}
                variant={sortBy === key ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy(key as any)}
                className={`text-xs h-7 ${
                  sortBy === key
                    ? "bg-yellow-500 text-black hover:bg-yellow-400"
                    : "border-zinc-700 text-gray-400 hover:text-white hover:border-yellow-500"
                }`}
              >
                {label}
              </Button>
            ))}
          </div>
          
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

      {/* Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2 text-gray-400">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Connecting to Pump.fun...</span>
          </div>
        </div>
      ) : tokens.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Zap className="w-12 h-12 mx-auto mb-4 text-gray-600" />
          <p>Waiting for live pumps...</p>
          <p className="text-sm">New pump.fun tokens will appear here as they launch</p>
          <p className="text-xs mt-2 text-gray-500">Connected to PumpPortal WebSocket</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sortedTokens.map((token) => (
            <Card key={token.mint} className="bg-[#0b0d0e] border-zinc-800 hover:border-yellow-500/50 transition-colors group">
              <CardContent className="p-4">
                {/* Token Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="relative flex-shrink-0">
                      {token.image ? (
                        <img 
                          src={token.image} 
                          alt={token.symbol}
                          className="w-12 h-12 rounded-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                            e.currentTarget.nextElementSibling?.classList.remove('hidden')
                          }}
                        />
                      ) : null}
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-black font-bold text-lg ${token.image ? 'hidden' : ''}`}>
                        {token.symbol.charAt(0)}
                      </div>
                      {token.isPaid && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                          <span className="text-black text-xs font-bold">$</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-white text-lg truncate">{token.symbol}</h3>
                        <Badge variant="secondary" className="bg-green-500 text-white text-xs">
                          LIVE
                        </Badge>
                      </div>
                      <p className="text-gray-400 text-sm truncate">{token.name}</p>
                    </div>
                  </div>
                  
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-yellow-500 transition-colors" />
                </div>

                {/* Market Data */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Market Cap</span>
                    <div className="text-right">
                      <div className="text-white font-medium">${formatNumber(token.mcUsd)}</div>
                      <div className="text-xs text-gray-400">{formatNumber(token.mcSol)} SOL</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Price</span>
                    <span className="text-white font-medium">${token.price.toFixed(8)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Volume 24h</span>
                    <span className="text-white font-medium">${formatNumber(token.volume24h)}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between mb-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatTimeAgo(token.timeAgo)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    <span>{formatNumber(token.transactions)} txns</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>{formatNumber(token.holders)} holders</span>
                  </div>
                </div>

                {/* Buy Button */}
                <Button
                  onClick={() => handleBuy(token)}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold hover:from-yellow-400 hover:to-orange-400 transition-all duration-200"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Buy {token.symbol}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
