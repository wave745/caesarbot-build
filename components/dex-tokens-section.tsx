import { useEffect, useState } from "react"
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
  Zap,
  TrendingUp,
  TrendingDown,
  BarChart3
} from "lucide-react"
import { DexScreenerAPI, DexToken } from "@/lib/services/dexscreener-api"

export function DexTokensSection() {
  const [tokens, setTokens] = useState<DexToken[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'new' | 'volume' | 'marketCap'>('new')
  const [error, setError] = useState<string | null>(null)

  const dexAPI = DexScreenerAPI.getInstance()

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        let data: DexToken[] = []
        
        if (sortBy === 'new') {
          data = await dexAPI.getNewTokens(20)
        } else if (sortBy === 'volume') {
          data = await dexAPI.getTrendingTokens(20)
        } else {
          data = await dexAPI.getTrendingTokens(20)
          data.sort((a, b) => b.marketCap - a.marketCap)
        }
        
        setTokens(data)
      } catch (err) {
        console.error('Error fetching DEX tokens:', err)
        setError('Failed to fetch tokens from DexScreener')
        setTokens([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchTokens()

    // Refresh every 30 seconds
    const interval = setInterval(fetchTokens, 30000)

    return () => clearInterval(interval)
  }, [sortBy])

  const formatNumber = (num: number) => {
    if (num >= 1_000_000) {
      return (num / 1_000_000).toFixed(1) + 'M'
    }
    if (num >= 1_000) {
      return (num / 1_000).toFixed(1) + 'K'
    }
    return num.toFixed(2)
  }

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days > 0) return `${days}d`
    if (hours > 0) return `${hours}h`
    if (minutes > 0) return `${minutes}m`
    return '0m'
  }

  const getPriceChangeColor = (change: number) => {
    if (change > 0) return 'text-green-400'
    if (change < 0) return 'text-red-400'
    return 'text-gray-400'
  }

  const getPriceChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-3 h-3" />
    if (change < 0) return <TrendingDown className="w-3 h-3" />
    return null
  }

  const handleBuy = (token: DexToken) => {
    console.log(`Buying ${token.baseToken.symbol} (${token.pairAddress})`)
    // TODO: Integrate with Solana wallet adapter
  }

  const handleRefresh = async () => {
    setIsLoading(true)
    setError(null)
    try {
      let data: DexToken[] = []
      
      if (sortBy === 'new') {
        data = await dexAPI.getNewTokens(20)
      } else if (sortBy === 'volume') {
        data = await dexAPI.getTrendingTokens(20)
      } else {
        data = await dexAPI.getTrendingTokens(20)
        data.sort((a, b) => b.marketCap - a.marketCap)
      }
      
      setTokens(data)
    } catch (err) {
      console.error('Error refreshing DEX tokens:', err)
      setError('Failed to refresh tokens')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center shadow-lg">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">DEX TOKENS</h2>
            <p className="text-sm text-gray-400">Solana DEX trading pairs</p>
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
        {/* Sort Controls */}
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-sm font-medium">Sort by:</span>
          <div className="flex items-center gap-2">
            <Button 
              variant={sortBy === 'new' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setSortBy('new')}
              className={`${
                sortBy === 'new'
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-400 hover:to-purple-400 shadow-lg"
                  : "border-[#282828] text-gray-400 hover:text-white hover:border-blue-500 hover:bg-gray-800"
              }`}
            >
              New
            </Button>
            <Button 
              variant={sortBy === 'volume' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setSortBy('volume')}
              className={`${
                sortBy === 'volume'
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-400 hover:to-purple-400 shadow-lg"
                  : "border-[#282828] text-gray-400 hover:text-white hover:border-blue-500 hover:bg-gray-800"
              }`}
            >
              Volume
            </Button>
            <Button 
              variant={sortBy === 'marketCap' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setSortBy('marketCap')}
              className={`${
                sortBy === 'marketCap'
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-400 hover:to-purple-400 shadow-lg"
                  : "border-[#282828] text-gray-400 hover:text-white hover:border-blue-500 hover:bg-gray-800"
              }`}
            >
              Market Cap
            </Button>
          </div>
        </div>

        {/* Status and Refresh */}
        <div className="flex items-center gap-3">
          <Badge variant="default" className="bg-blue-500 text-white shadow-lg">
            <Wifi className="w-3 h-3 mr-1" />
            LIVE
          </Badge>
          <span className="text-sm text-gray-400">
            {tokens.length} tokens
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh} 
            className="border-[#282828] text-gray-400 hover:text-white hover:border-blue-500 hover:bg-gray-800"
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Tokens Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64 bg-[#111111] border border-[#282828] rounded-xl">
          <div className="flex flex-col items-center gap-3 text-gray-400">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
            <span className="text-lg font-medium">Loading DEX tokens...</span>
            <span className="text-sm">Fetching data from DexScreener</span>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-16 bg-[#111111] border border-[#282828] rounded-xl">
          <div className="w-16 h-16 mx-auto mb-4 text-red-500">
            <WifiOff className="w-16 h-16" />
          </div>
          <h3 className="text-lg font-semibold text-red-400 mb-2">Connection Error</h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      ) : tokens.length === 0 ? (
        <div className="text-center py-16 bg-[#111111] border border-[#282828] rounded-xl">
          <div className="w-16 h-16 mx-auto mb-4 text-gray-500">
            <BarChart3 className="w-16 h-16" />
          </div>
          <h3 className="text-lg font-semibold text-gray-400 mb-2">No DEX Tokens</h3>
          <p className="text-gray-500 mb-4">No trading pairs available at the moment</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            className="border-gray-500 text-gray-400 hover:bg-gray-800"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      ) : (
        <div className="bg-[#111111] border border-[#282828] rounded-xl overflow-hidden shadow-lg">
          <div className="p-4 border-b border-[#282828] bg-gradient-to-r from-blue-500/10 to-purple-500/10">
            <h2 className="text-white text-lg font-semibold">DEX Tokens</h2>
            <p className="text-sm text-gray-400">Solana trading pairs from various DEXs</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-[#0a0a0a]">
                <tr className="border-b border-[#282828]">
                  <th className="text-left py-4 px-6 text-gray-400 text-xs font-semibold uppercase tracking-wider">Pair info</th>
                  <th className="text-left py-4 px-6 text-gray-400 text-xs font-semibold uppercase tracking-wider">Price</th>
                  <th className="text-left py-4 px-6 text-gray-400 text-xs font-semibold uppercase tracking-wider">Market Cap</th>
                  <th className="text-left py-4 px-6 text-gray-400 text-xs font-semibold uppercase tracking-wider">Volume (24h)</th>
                  <th className="text-left py-4 px-6 text-gray-400 text-xs font-semibold uppercase tracking-wider">Txns</th>
                  <th className="text-left py-4 px-6 text-gray-400 text-xs font-semibold uppercase tracking-wider">Token info</th>
                </tr>
              </thead>
              <tbody>
                {tokens.map((token) => (
                  <tr key={token.pairAddress} className="border-b border-[#282828] hover:bg-gradient-to-r hover:from-blue-500/5 hover:to-purple-500/5 transition-all duration-200 group">
                    {/* Pair info */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div className="relative flex-shrink-0">
                          {token.info.imageUrl ? (
                            <img 
                              src={token.info.imageUrl} 
                              alt={token.baseToken.name} 
                              className="w-10 h-10 rounded-lg object-cover ring-2 ring-gray-700 group-hover:ring-blue-500/50 transition-all"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                                target.nextElementSibling?.classList.remove('hidden')
                              }}
                            />
                          ) : null}
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-white text-sm font-bold ring-2 ring-gray-700 group-hover:ring-blue-500/50 transition-all ${token.info.imageUrl ? 'hidden' : ''}`}>
                            {token.baseToken.symbol.charAt(0)}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-white text-[10px] font-bold">D</span>
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-semibold text-sm">{token.baseToken.symbol}</span>
                            <span className="text-gray-400 text-xs truncate">{token.baseToken.name}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-blue-400 text-xs font-medium">{formatTimeAgo(token.pairCreatedAt)}</span>
                            <div className="flex items-center gap-1">
                              <Link className="w-3 h-3 text-gray-500 hover:text-blue-400 transition-colors" />
                              <Eye className="w-3 h-3 text-gray-500 hover:text-blue-400 transition-colors" />
                              <Search className="w-3 h-3 text-gray-500 hover:text-blue-400 transition-colors" />
                              <Star className="w-3 h-3 text-gray-500 hover:text-blue-400 transition-colors" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    {/* Price */}
                    <td className="py-4 px-6">
                      <div>
                        <div className="text-white font-semibold text-sm">${parseFloat(token.priceUsd).toFixed(6)}</div>
                        <div className={`text-xs flex items-center gap-1 font-medium ${getPriceChangeColor(token.priceChange.h24)}`}>
                          {getPriceChangeIcon(token.priceChange.h24)}
                          {token.priceChange.h24 > 0 ? '+' : ''}{token.priceChange.h24.toFixed(2)}%
                        </div>
                      </div>
                    </td>
                    
                    {/* Market Cap */}
                    <td className="py-4 px-6">
                      <div className="text-white font-semibold text-sm">${formatNumber(token.marketCap)}</div>
                    </td>
                    
                    {/* Volume */}
                    <td className="py-4 px-6">
                      <div className="text-white font-semibold text-sm">${formatNumber(token.volume.h24)}</div>
                    </td>
                    
                    {/* Transactions */}
                    <td className="py-4 px-6">
                      <div>
                        <div className="text-white font-semibold text-sm">{token.txns.h24.buys + token.txns.h24.sells}</div>
                        <div className="text-xs flex items-center gap-1">
                          <span className="text-green-400 font-medium">{token.txns.h24.buys}</span>
                          <span className="text-gray-500">/</span>
                          <span className="text-red-400 font-medium">{token.txns.h24.sells}</span>
                        </div>
                      </div>
                    </td>
                    
                    {/* Token info */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-white text-xs font-medium">{formatNumber(token.liquidity.usd)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Shield className="w-4 h-4 text-green-400" />
                          <span className="text-white text-xs font-medium">Verified</span>
                        </div>
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-3 py-1 text-xs h-7 shadow-lg"
                          onClick={() => handleBuy(token)}
                        >
                          <Zap className="w-3 h-3 mr-1" />
                          Trade
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


