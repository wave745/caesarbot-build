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
  WifiOff
} from "lucide-react"
import { PumpToken, PumpPortalAPI } from "@/lib/services/pumpportal-api"

export function PumpLiveGrid() {
  const [tokens, setTokens] = useState<PumpToken[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'mc' | 'volume' | 'time'>('time')

  useEffect(() => {
    // Use the PumpPortalAPI directly instead of SSE for now
    const pumpAPI = PumpPortalAPI.getInstance()
    
    const handleDataUpdate = (tokens: PumpToken[]) => {
      setTokens(tokens.slice(0, 50)) // Keep last 50 tokens
      setIsLoading(false)
    }

    // Connect to PumpPortal
    pumpAPI.connect()
      .then(() => {
        setIsConnected(true)
        setIsLoading(false)
        // Subscribe to updates
        pumpAPI.subscribe(handleDataUpdate)
      })
      .catch((error) => {
        console.error('Failed to connect to PumpPortal:', error)
        setIsConnected(false)
        setIsLoading(false)
        // Still subscribe to get demo data
        pumpAPI.subscribe(handleDataUpdate)
      })

    // Check connection status periodically
    const statusInterval = setInterval(() => {
      setIsConnected(pumpAPI.getConnectionStatus())
    }, 1000)

    return () => {
      pumpAPI.unsubscribe(handleDataUpdate)
      clearInterval(statusInterval)
    }
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
    return `${sign}${num.toFixed(1)}%`
  }

  const getChangeColor = (change: number) => {
    if (change > 0) return "text-green-400"
    if (change < 0) return "text-red-400"
    return "text-gray-400"
  }

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-3 h-3" />
    if (change < 0) return <TrendingDown className="w-3 h-3" />
    return null
  }

  const sortedTokens = [...tokens].sort((a, b) => {
    switch (sortBy) {
      case 'mc':
        return b.marketCap - a.marketCap
      case 'volume':
        return b.volume - a.volume
      case 'time':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
  })

  const handleBuy = (token: PumpToken) => {
    console.log(`Buying ${token.symbol} (${token.address})`)
    // TODO: Integrate with Solana wallet adapter
  }

  const reconnect = () => {
    setIsLoading(true)
    setIsConnected(false)
    
    const pumpAPI = PumpPortalAPI.getInstance()
    pumpAPI.disconnect()
    
    pumpAPI.connect()
      .then(() => {
        setIsConnected(true)
        setIsLoading(false)
      })
      .catch(() => {
        setIsConnected(false)
        setIsLoading(false)
      })
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
          <p>No live tokens yet...</p>
          <p className="text-sm">New tokens will appear here as they launch</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sortedTokens.map((token) => (
            <Card key={token.address} className="bg-[#0b0d0e] border-zinc-800 hover:border-yellow-500/50 transition-colors group">
              <CardContent className="p-4">
                {/* Token Logo and Info */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="relative flex-shrink-0">
                    {token.logo ? (
                      <img 
                        src={token.logo} 
                        alt={token.symbol}
                        className="w-12 h-12 rounded-full object-cover"
                        onError={(e) => {
                          // Fallback to pill SVG if image fails to load
                          e.currentTarget.style.display = 'none'
                          e.currentTarget.nextElementSibling?.classList.remove('hidden')
                        }}
                      />
                    ) : null}
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-black font-bold text-lg ${token.logo ? 'hidden' : ''}`}>
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
                      <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-yellow-500 transition-colors" />
                    </div>
                    <p className="text-gray-400 text-sm truncate">{token.name}</p>
                  </div>
                </div>

                {/* Market Data */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Market Cap</span>
                    <div className="text-right">
                      <div className="text-white font-medium">${formatNumber(token.marketCap)}</div>
                      <div className={`flex items-center gap-1 text-xs ${getChangeColor(token.marketCapChange)}`}>
                        {getChangeIcon(token.marketCapChange)}
                        <span>{formatPercentage(token.marketCapChange)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Volume</span>
                    <span className="text-white font-medium">${formatNumber(token.volume)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Liquidity</span>
                    <span className="text-white font-medium">${formatNumber(token.liquidity)}</span>
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

                {/* Additional Info */}
                <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                  <span>{formatNumber(token.transactions)} txns</span>
                  <span>{new Date(token.createdAt).toLocaleTimeString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
