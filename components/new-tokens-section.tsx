import { useEffect, useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  Target, 
  ChefHat, 
  Crown, 
  ExternalLink,
  RefreshCw,
  Wifi,
  WifiOff,
  Eye,
  Search,
  Star,
  Link,
  Globe,
  Shield,
  Zap
} from "lucide-react"
import { LiveToken } from "@/lib/services/pumpportal-live"

export function NewTokensSection() {
  const [tokens, setTokens] = useState<LiveToken[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchNewTokens = async () => {
      try {
        const response = await fetch('/api/pump-live-proper')
        const data = await response.json()
        
        setTokens(data.tokens || [])
        setIsConnected(data.isConnected || false)
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching new tokens:', error)
        setIsLoading(false)
      }
    }

    // Initial fetch
    fetchNewTokens()

    // Poll every 3 seconds for updates
    const interval = setInterval(fetchNewTokens, 3000)

    return () => clearInterval(interval)
  }, [])

  const formatNumber = (num: number) => {
    if (num >= 1_000_000) {
      return (num / 1_000_000).toFixed(1) + 'M'
    }
    if (num >= 1_000) {
      return (num / 1_000).toFixed(1) + 'K'
    }
    return num.toFixed(2)
  }

  const formatTimeAgo = (timeAgo: number) => {
    if (timeAgo < 60) {
      return `${timeAgo}s`
    }
    const minutes = Math.floor(timeAgo / 60)
    if (minutes < 60) {
      return `${minutes}m`
    }
    const hours = Math.floor(minutes / 60)
    return `${hours}h`
  }

  const getTransactionBarColor = (tx: number) => {
    if (tx === 0) return 'bg-gray-600'
    if (tx < 5) return 'bg-green-500'
    if (tx < 20) return 'bg-green-400'
    return 'bg-green-300'
  }

  const getTransactionBarWidth = (tx: number) => {
    const maxTx = 50 // Max transactions for 100% width
    return Math.min((tx / maxTx) * 100, 100)
  }

  const handleBuy = (token: LiveToken) => {
    console.log(`Buying ${token.symbol} (${token.mint})`)
    // TODO: Integrate with Solana wallet adapter
  }

  const reconnect = async () => {
    setIsLoading(true)
    setIsConnected(false)
    try {
      await fetch('/api/pump-live-proper', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ action: 'reconnect' }) 
      })
      // Re-fetch data after reconnect attempt
      const response = await fetch('/api/pump-live-proper')
      const data = await response.json()
      setTokens(data.tokens || [])
      setIsConnected(data.isConnected || false)
    } catch (error) {
      console.error('Error during reconnect:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center shadow-lg">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">NEWLY CREATED</h2>
            <p className="text-sm text-gray-400">Fresh pump.fun token launches</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg">
            <div className="w-4 h-4 border-2 border-gray-400 rounded"></div>
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg">
            <div className="w-4 h-4 flex flex-col gap-1">
              <div className="w-full h-0.5 bg-gray-400 rounded"></div>
              <div className="w-full h-0.5 bg-gray-400 rounded"></div>
              <div className="w-full h-0.5 bg-gray-400 rounded"></div>
            </div>
          </Button>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 bg-[#111111] border border-[#282828] rounded-xl p-4">
        {/* Status */}
        <div className="flex items-center gap-3">
          <Badge variant={isConnected ? "default" : "secondary"} className={`flex items-center gap-1 ${isConnected ? 'bg-green-500' : 'bg-red-500'} shadow-lg`}>
            {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {isConnected ? "LIVE" : "OFFLINE"}
          </Badge>
          <span className="text-sm text-gray-400 font-medium">
            {tokens.length} tokens
          </span>
        </div>

        {/* Refresh Button */}
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={reconnect} 
            className="border-[#282828] text-gray-400 hover:text-white hover:border-yellow-500 hover:bg-gray-800"
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Reconnect
          </Button>
        </div>
      </div>

      {/* Tokens Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64 bg-[#111111] border border-[#282828] rounded-xl">
          <div className="flex flex-col items-center gap-3 text-gray-400">
            <RefreshCw className="w-8 h-8 animate-spin text-yellow-500" />
            <span className="text-lg font-medium">Loading new tokens...</span>
            <span className="text-sm">Fetching fresh pump.fun launches</span>
          </div>
        </div>
      ) : tokens.length === 0 ? (
        <div className="text-center py-16 bg-[#111111] border border-[#282828] rounded-xl">
          <div className="w-16 h-16 mx-auto mb-4 text-gray-500">
            <Zap className="w-16 h-16" />
          </div>
          <h3 className="text-lg font-semibold text-gray-400 mb-2">Waiting for New Tokens</h3>
          <p className="text-gray-500 mb-4">New pump.fun tokens will appear here as they launch</p>
          <p className="text-xs text-gray-600">Connected to PumpPortal WebSocket</p>
        </div>
      ) : (
        <div className="bg-[#111111] border border-[#282828] rounded-xl overflow-hidden shadow-lg">
          <div className="p-4 border-b border-[#282828] bg-gradient-to-r from-yellow-500/10 to-orange-500/10">
            <h2 className="text-white text-lg font-semibold">New Tokens</h2>
            <p className="text-sm text-gray-400">Fresh pump.fun token launches</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-[#0a0a0a]">
                <tr className="border-b border-[#282828]">
                  <th className="text-left py-4 px-6 text-gray-400 text-xs font-semibold uppercase tracking-wider">Pair info</th>
                  <th className="text-left py-4 px-6 text-gray-400 text-xs font-semibold uppercase tracking-wider">Market Cap</th>
                  <th className="text-left py-4 px-6 text-gray-400 text-xs font-semibold uppercase tracking-wider">Liquidity</th>
                  <th className="text-left py-4 px-6 text-gray-400 text-xs font-semibold uppercase tracking-wider">Volume</th>
                  <th className="text-left py-4 px-6 text-gray-400 text-xs font-semibold uppercase tracking-wider">Txns</th>
                  <th className="text-left py-4 px-6 text-gray-400 text-xs font-semibold uppercase tracking-wider">Token info</th>
                </tr>
              </thead>
              <tbody>
                {tokens.slice(0, 10).map((token) => (
                  <tr key={token.mint} className="border-b border-[#282828] hover:bg-gradient-to-r hover:from-yellow-500/5 hover:to-orange-500/5 transition-all duration-200 group">
                    {/* Pair info */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div className="relative flex-shrink-0">
                          {token.image ? (
                            <img 
                              src={token.image} 
                              alt={token.name} 
                              className="w-10 h-10 rounded-lg object-cover ring-2 ring-gray-700 group-hover:ring-yellow-500/50 transition-all"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                                target.nextElementSibling?.classList.remove('hidden')
                              }}
                            />
                          ) : null}
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-white text-sm font-bold ring-2 ring-gray-700 group-hover:ring-yellow-500/50 transition-all ${token.image ? 'hidden' : ''}`}>
                            {token.symbol.charAt(0)}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-white text-[10px] font-bold">✕</span>
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-semibold text-sm">{token.symbol}</span>
                            <span className="text-gray-400 text-xs truncate">{token.name}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-blue-400 text-xs font-medium">{formatTimeAgo(token.timeAgo)}</span>
                            <div className="flex items-center gap-1">
                              <Link className="w-3 h-3 text-gray-500 hover:text-yellow-400 transition-colors" />
                              <Eye className="w-3 h-3 text-gray-500 hover:text-yellow-400 transition-colors" />
                              <Search className="w-3 h-3 text-gray-500 hover:text-yellow-400 transition-colors" />
                              <Star className="w-3 h-3 text-gray-500 hover:text-yellow-400 transition-colors" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    {/* Market Cap */}
                    <td className="py-4 px-6">
                      <div>
                        <div className="text-white font-semibold text-sm">${formatNumber(token.mcUsd)}</div>
                        <div className="text-xs text-green-400 font-medium">0.0%</div>
                      </div>
                    </td>
                    
                    {/* Liquidity */}
                    <td className="py-4 px-6">
                      <div className="text-white font-semibold text-sm">${formatNumber(token.mcUsd * 0.5)}</div>
                    </td>
                    
                    {/* Volume */}
                    <td className="py-4 px-6">
                      <div className="text-white font-semibold text-sm">${formatNumber(token.volume24h)}</div>
                    </td>
                    
                    {/* Transactions */}
                    <td className="py-4 px-6">
                      <div>
                        <div className="text-white font-semibold text-sm">{token.transactions}</div>
                        <div className="text-xs flex items-center gap-1">
                          <span className="text-green-400 font-medium">{token.transactions}</span>
                          <span className="text-gray-500">/</span>
                          <span className="text-red-400 font-medium">0</span>
                        </div>
                      </div>
                    </td>
                    
                    {/* Token info */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-white text-xs font-medium">{token.holders}%</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Shield className="w-4 h-4 text-red-400" />
                          <span className="text-white text-xs font-medium">Unpaid</span>
                        </div>
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-3 py-1 text-xs h-7 shadow-lg"
                          onClick={() => handleBuy(token)}
                        >
                          <Zap className="w-3 h-3 mr-1" />
                          Buy
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
