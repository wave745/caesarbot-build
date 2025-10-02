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
import { DexScreenerService } from "@/lib/services/dexscreener-api"
import { DexToken } from "@/lib/types/dex-token"
import { useRouter } from "next/navigation"

interface DexTokensSectionProps {
  sortBy?: 'new' | 'volume' | 'marketCap' | 'priceChange'
}

export function DexTokensSection({ sortBy: propSortBy }: DexTokensSectionProps = {}) {
  const [tokens, setTokens] = useState<DexToken[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'new' | 'volume' | 'marketCap' | 'priceChange'>(propSortBy || 'new')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
 
  const dexAPI = DexScreenerService.getInstance()

  // Update local sortBy when prop changes
  useEffect(() => {
    if (propSortBy) {
      setSortBy(propSortBy)
    }
  }, [propSortBy])

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        console.log(`Fetching DEX tokens with sortBy: ${sortBy}`)
        
        // Use DexScreener's trending pairs API
        const response = await fetch('https://api.dexscreener.com/latest/dex/tokens/solana', {
          method: 'GET',
          headers: {
            'Accept': '*/*',
            'User-Agent': 'CaesarBot/1.0'
          }
        })
        
        console.log(`DexScreener API response status: ${response.status}`)
        
        if (!response.ok) {
          throw new Error(`DexScreener API error: ${response.status}`)
        }
        
        const apiData = await response.json()
        console.log(`DexScreener API response data:`, apiData)
        
        let data: DexToken[] = []
        
        if (apiData.pairs && Array.isArray(apiData.pairs) && apiData.pairs.length > 0) {
          // All pairs from this endpoint are already Solana pairs
          const solanaTokens = apiData.pairs.filter((pair: any) => 
            pair.baseToken && 
            pair.quoteToken
          )
          
          // Sort based on selected criteria
          let sortedTokens = [...solanaTokens]
          switch (sortBy) {
            case 'volume':
              sortedTokens.sort((a, b) => (b.volume?.h24 || 0) - (a.volume?.h24 || 0))
              break
            case 'marketCap':
              sortedTokens.sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0))
              break
            case 'new':
            default:
              sortedTokens.sort((a, b) => (b.pairCreatedAt || 0) - (a.pairCreatedAt || 0))
              break
          }
          
          data = sortedTokens.slice(0, 20) // Limit to 20 tokens
          console.log(`Got ${data.length} Solana DEX tokens`)
        } else {
          // Fallback: Try to get trending Solana pairs using search
          console.log('No data from tokens endpoint, trying search fallback...')
          const fallbackResponse = await fetch('https://api.dexscreener.com/latest/dex/search/?q=chainId:solana', {
            method: 'GET',
            headers: {
              'Accept': '*/*',
              'User-Agent': 'CaesarBot/1.0'
            }
          })
          
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json()
            if (fallbackData.pairs && Array.isArray(fallbackData.pairs) && fallbackData.pairs.length > 0) {
              const solanaTokens = fallbackData.pairs.filter((pair: any) => 
                pair.chainId === 'solana' && 
                pair.baseToken && 
                pair.quoteToken
              )
              
              // Sort based on selected criteria
              let sortedTokens = [...solanaTokens]
              switch (sortBy) {
                case 'volume':
                  sortedTokens.sort((a, b) => (b.volume?.h24 || 0) - (a.volume?.h24 || 0))
                  break
                case 'marketCap':
                  sortedTokens.sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0))
                  break
                case 'new':
                default:
                  sortedTokens.sort((a, b) => (b.pairCreatedAt || 0) - (a.pairCreatedAt || 0))
                  break
              }
              
              data = sortedTokens.slice(0, 20) // Limit to 20 tokens
              console.log(`Got ${data.length} Solana DEX tokens from fallback`)
            } else {
              throw new Error('No Solana pairs found in DexScreener API')
            }
          } else {
            throw new Error('DexScreener API fallback failed')
          }
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
      console.log(`Refreshing DEX tokens with sortBy: ${sortBy}`)
      
      // Use DexScreener's trending pairs API
      const response = await fetch('https://api.dexscreener.com/latest/dex/tokens/solana', {
        method: 'GET',
        headers: {
          'Accept': '*/*',
          'User-Agent': 'CaesarBot/1.0'
        }
      })
      
      if (!response.ok) {
        throw new Error(`DexScreener API error: ${response.status}`)
      }
      
      const apiData = await response.json()
      
      let data: DexToken[] = []
      
      if (apiData.pairs && Array.isArray(apiData.pairs) && apiData.pairs.length > 0) {
        // All pairs from this endpoint are already Solana pairs
        const solanaTokens = apiData.pairs.filter((pair: any) => 
          pair.baseToken && 
          pair.quoteToken
        )
        
        // Sort based on selected criteria
        let sortedTokens = [...solanaTokens]
        switch (sortBy) {
          case 'volume':
            sortedTokens.sort((a, b) => (b.volume?.h24 || 0) - (a.volume?.h24 || 0))
            break
          case 'marketCap':
            sortedTokens.sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0))
            break
          case 'new':
          default:
            sortedTokens.sort((a, b) => (b.pairCreatedAt || 0) - (a.pairCreatedAt || 0))
            break
        }
        
        data = sortedTokens.slice(0, 20) // Limit to 20 tokens
        console.log(`Refreshed ${data.length} Solana DEX tokens`)
      } else {
        // Fallback: Try to get trending Solana pairs using search
        console.log('No data from tokens endpoint, trying search fallback...')
        const fallbackResponse = await fetch('https://api.dexscreener.com/latest/dex/search/?q=chainId:solana', {
          method: 'GET',
          headers: {
            'Accept': '*/*',
            'User-Agent': 'CaesarBot/1.0'
          }
        })
        
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json()
          if (fallbackData.pairs && Array.isArray(fallbackData.pairs) && fallbackData.pairs.length > 0) {
            const solanaTokens = fallbackData.pairs.filter((pair: any) => 
              pair.chainId === 'solana' && 
              pair.baseToken && 
              pair.quoteToken
            )
            
            // Sort based on selected criteria
            let sortedTokens = [...solanaTokens]
            switch (sortBy) {
              case 'volume':
                sortedTokens.sort((a, b) => (b.volume?.h24 || 0) - (a.volume?.h24 || 0))
                break
              case 'marketCap':
                sortedTokens.sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0))
                break
              case 'new':
              default:
                sortedTokens.sort((a, b) => (b.pairCreatedAt || 0) - (a.pairCreatedAt || 0))
                break
            }
            
            data = sortedTokens.slice(0, 20) // Limit to 20 tokens
            console.log(`Refreshed ${data.length} Solana DEX tokens from fallback`)
          } else {
            throw new Error('No Solana pairs found in DexScreener API')
          }
        } else {
          throw new Error('DexScreener API fallback failed')
        }
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
        <div className="bg-black border border-gray-800 rounded-lg overflow-hidden">
          {/* Table Header - Fixed */}
          <div className="grid grid-cols-6 gap-4 px-4 py-3 bg-gray-900 border-b border-gray-800 sticky top-0 z-10">
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">Pair info</div>
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">Price</div>
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">Market Cap</div>
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">Volume</div>
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">TXNS</div>
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">Token info</div>
          </div>

          {/* Scrollable Table Body */}
          <div className="max-h-[60vh] overflow-y-auto">
            <div className="divide-y divide-gray-800">
              {tokens.length > 0 ? tokens.map((token, index) => (
                <div 
                  key={token.pairAddress} 
                  className="grid grid-cols-6 gap-4 px-4 py-3 hover:bg-gray-900/50 transition-colors cursor-pointer"
                  onClick={() => {
                    try {
                      window.location.href = `/trade/${token.baseToken.address}`
                    } catch (error) {
                      console.error('Navigation failed:', error)
                    }
                  }}
                >
                  {/* Pair info */}
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {token.info?.imageUrl ? (
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
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-white text-sm font-bold ring-2 ring-gray-700 group-hover:ring-blue-500/50 transition-all ${token.info?.imageUrl ? 'hidden' : ''}`}>
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
                          <Link className="w-3 h-3 text-white hover:text-blue-400 transition-colors" />
                          <Eye className="w-3 h-3 text-white hover:text-blue-400 transition-colors" />
                          <Search className="w-3 h-3 text-white hover:text-blue-400 transition-colors" />
                          <Star className="w-3 h-3 text-white hover:text-blue-400 transition-colors" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Price */}
                  <div>
                    <div className="text-white font-semibold text-sm">${parseFloat(token.priceUsd).toFixed(6)}</div>
                    <div className={`text-xs flex items-center gap-1 font-medium ${getPriceChangeColor(token.priceChange.h24)}`}>
                      {getPriceChangeIcon(token.priceChange.h24)}
                      {token.priceChange.h24 > 0 ? '+' : ''}{token.priceChange.h24.toFixed(2)}%
                    </div>
                  </div>
                  
                  {/* Market Cap */}
                  <div>
                    <div className="text-white font-semibold text-sm">${formatNumber(token.marketCap)}</div>
                  </div>
                  
                  {/* Volume */}
                  <div>
                    <div className="text-white font-semibold text-sm">${formatNumber(token.volume.h24)}</div>
                  </div>
                  
                  {/* Transactions */}
                  <div>
                    <div className="text-white font-semibold text-sm">{token.txns.h24.buys + token.txns.h24.sells}</div>
                    <div className="text-xs flex items-center gap-1">
                      <span className="text-green-400 font-medium">{token.txns.h24.buys}</span>
                      <span className="text-gray-500">/</span>
                      <span className="text-red-400 font-medium">{token.txns.h24.sells}</span>
                    </div>
                  </div>
                  
                  {/* Token info */}
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-white" />
                        <span className="text-white text-xs font-medium">{formatNumber(token.liquidity.usd)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Shield className="w-4 h-4 text-green-400" />
                        <span className="text-white text-xs font-medium">Verified</span>
                      </div>
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-3 py-1 text-xs h-7 shadow-lg"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleBuy(token)
                        }}
                      >
                        <Zap className="w-3 h-3 mr-1" />
                        Trade
                      </Button>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-400">
                  No tokens available
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}



