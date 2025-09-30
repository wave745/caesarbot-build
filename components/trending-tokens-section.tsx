"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  ArrowUpRight, 
  ArrowDownRight,
  ExternalLink,
  Eye,
  Zap
} from "lucide-react"
import { tokenCache } from "@/lib/services/token-cache"
import { useRouter } from "next/navigation"
// Define the Moralis trending token interface
interface MoralisTrendingToken {
  chainId: string
  tokenAddress: string
  name: string
  uniqueName: string | null
  symbol: string
  decimals: number
  logo: string
  usdPrice: number
  createdAt: number
  marketCap: number
  liquidityUsd: number
  holders: number
  pricePercentChange: {
    '1h': number
    '4h': number
    '12h': number
    '24h': number
  }
  totalVolume: {
    '1h': number
    '4h': number
    '12h': number
    '24h': number
  }
  transactions: {
    '1h': number
    '4h': number
    '12h': number
    '24h': number
  }
  buyTransactions: {
    '1h': number
    '4h': number
    '12h': number
    '24h': number
  }
  sellTransactions: {
    '1h': number
    '4h': number
    '12h': number
    '24h': number
  }
  buyers: {
    '1h': number
    '4h': number
    '12h': number
    '24h': number
  }
  sellers: {
    '1h': number
    '4h': number
    '12h': number
    '24h': number
  }
}

interface TrendingTokensSectionProps {
  timeframe?: string
  sortBy?: 'new' | 'volume' | 'marketCap' | 'change'
}

export function TrendingTokensSection({ sortBy: propSortBy }: TrendingTokensSectionProps = {}) {
  console.log('TrendingTokensSection: Component rendering - START')
  const [tokens, setTokens] = useState<MoralisTrendingToken[]>([])
  const [isLoading, setIsLoading] = useState(false) // Start with false for instant display
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'volume' | 'marketCap' | 'change' | 'new'>(propSortBy || 'new')
  const [dexPaidStatus, setDexPaidStatus] = useState<Map<string, boolean>>(new Map())
  const [tokenMetadata, setTokenMetadata] = useState<Map<string, any>>(new Map())
  const router = useRouter()

  // Update local sortBy when prop changes
  useEffect(() => {
    if (propSortBy) {
      setSortBy(propSortBy)
    }
  }, [propSortBy])

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now() / 1000 // Current time in seconds
    const diff = now - timestamp // Difference in seconds
    
    if (diff < 60) {
      return `${Math.floor(diff)}s`
    } else if (diff < 3600) {
      return `${Math.floor(diff / 60)}m`
    } else if (diff < 86400) {
      return `${Math.floor(diff / 3600)}h`
    } else {
      return `${Math.floor(diff / 86400)}d`
    }
  }

  const fetchDexPaidStatus = async (tokens: MoralisTrendingToken[], signal?: AbortSignal) => {
    try {
      console.log('Fetching Dex paid status for tokens...')
      
      const tokensToCheck = tokens.map(token => ({
        chainId: token.chainId || 'solana',
        tokenAddress: token.tokenAddress
      }))

      const response = await fetch('/api/dexscreener/check-paid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tokens: tokensToCheck }),
        signal
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          const statusMap = new Map<string, boolean>()
          Object.entries(data.data).forEach(([tokenAddress, isPaid]) => {
            statusMap.set(tokenAddress, isPaid as boolean)
          })
          setDexPaidStatus(statusMap)
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Dex paid status fetch was aborted')
        return
      }
      console.error('Error fetching Dex paid status:', error)
    }
  }

  const fetchTokenMetadata = async (tokens: MoralisTrendingToken[], signal?: AbortSignal) => {
    try {
      console.log('Fetching token metadata for tokens...', tokens.length)
      
      const tokenAddresses = tokens.map(token => token.tokenAddress)
      console.log('Token addresses to fetch metadata for:', tokenAddresses)

      const response = await fetch('/api/moralis/token-metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tokenAddresses }),
        signal
      })

      console.log('Metadata API response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('Metadata API response data:', data)
        if (data.success && data.data) {
          const metadataMap = new Map<string, any>()
          Object.entries(data.data).forEach(([tokenAddress, metadata]) => {
            console.log(`Setting metadata for ${tokenAddress}:`, metadata)
            metadataMap.set(tokenAddress, metadata)
          })
          setTokenMetadata(metadataMap)
          console.log('Token metadata map updated:', metadataMap.size, 'entries')
        }
      } else {
        console.error('Metadata API error:', response.status, response.statusText)
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Token metadata fetch was aborted')
        return
      }
      console.error('Error fetching token metadata:', error)
    }
  }

  const fetchTrendingTokens = async () => {
    try {
      console.log('TrendingTokensSection: Starting INSTANT fetch...')
      // NO LOADING STATE - show tokens immediately
      setError(null)

      // Realistic fetch with proper timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout for reliable response
      
      const response = await fetch('/api/moralis/trending-tokens', {
        signal: controller.signal
      })
      clearTimeout(timeoutId)
      
      console.log('TrendingTokensSection: Response status:', response.status)

      const data = await response.json()
      console.log('TrendingTokensSection: Response data:', data)

      if (data.success && data.data.length > 0) {
        console.log('TrendingTokensSection: Setting tokens INSTANTLY:', data.data.length)
        setTokens(data.data)
        setIsLoading(false) // Never show loading - always show tokens immediately
        
        // Fetch Dex paid status and metadata for the tokens
        fetchDexPaidStatus(data.data, controller.signal)
        fetchTokenMetadata(data.data, controller.signal)
      } else {
        console.log('TrendingTokensSection: No tokens or error:', data.error)
        setTokens([])
        setError(data.error || 'No trending tokens available')
        setIsLoading(false) // Show empty state immediately
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('TrendingTokensSection: Request was aborted')
        return
      }
      console.error('TrendingTokensSection: Error fetching trending tokens:', err)
      setError(err.message || 'Failed to load trending tokens')
      setTokens([])
      setIsLoading(false) // Show error state immediately
    }
  }

  useEffect(() => {
    console.log('TrendingTokensSection: useEffect triggered - INSTANT LOADING')
    let abortController: AbortController | null = null

    // Check cache first for INSTANT display
    if (tokenCache.isDataAvailable()) {
      const cachedTokens = tokenCache.getTrendingTokens()
      if (cachedTokens.length > 0) {
        setTokens(cachedTokens)
        setIsLoading(false)
        console.log('INSTANT: Using cached trending tokens:', cachedTokens.length)
      }
    }

    // INSTANT fetch on mount
    fetchTrendingTokens()

    // Ultra-fast polling for real-time updates
    const interval = setInterval(() => {
      abortController = new AbortController()
      fetchTrendingTokens()
    }, 3000) // Refresh every 3 seconds for real-time updates

    return () => {
      clearInterval(interval)
      if (abortController) {
        abortController.abort()
      }
      console.log('TrendingTokensSection: Cleaning up on unmount')
    }
  }, [])

  const sortedTokens = useMemo(() => {
    let sorted = [...tokens]
    if (sortBy === 'marketCap') {
      sorted.sort((a, b) => b.marketCap - a.marketCap)
    } else if (sortBy === 'change') {
      sorted.sort((a, b) => b.pricePercentChange['1h'] - a.pricePercentChange['1h'])
    } else if (sortBy === 'new') {
      // Sort by creation time - newest first (higher timestamp = newer)
      sorted.sort((a, b) => b.createdAt - a.createdAt)
    } else { // 'volume'
      sorted.sort((a, b) => b.totalVolume['1h'] - a.totalVolume['1h'])
    }
    return sorted
  }, [tokens, sortBy])

  const formatNumber = (num: number | undefined) => {
    if (num === undefined || num === null || isNaN(num)) {
      return '0.00'
    }
    if (num >= 1_000_000) {
      return (num / 1_000_000).toFixed(1) + 'M'
    }
    if (num >= 1_000) {
      return (num / 1_000).toFixed(1) + 'K'
    }
    return num.toFixed(2)
  }

  const formatPrice = (price: number | undefined) => {
    if (price === undefined || price === null || isNaN(price)) {
      return '0.00'
    }
    if (price >= 1) {
      return price.toFixed(2)
    }
    return price.toFixed(6)
  }

  const getPriceChangeColor = (change: number | undefined) => {
    if (change === undefined || change === null || isNaN(change)) {
      return 'text-gray-400'
    }
    if (change > 0) return 'text-green-400'
    if (change < 0) return 'text-red-400'
    return 'text-gray-400'
  }

  const getPriceChangeIcon = (change: number | undefined) => {
    if (change === undefined || change === null || isNaN(change)) {
      return null
    }
    if (change > 0) return <ArrowUpRight className="w-4 h-4" />
    if (change < 0) return <ArrowDownRight className="w-4 h-4" />
    return null
  }


  console.log('TrendingTokensSection: About to render, tokens:', tokens.length, 'isLoading:', isLoading, 'error:', error)
  
  return (
    <div className="w-full">

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 animate-spin rounded-full border-2 border-yellow-500 border-t-transparent" />
            <span className="text-gray-400">Loading trending tokens...</span>
          </div>
        </div>
      )}



      {/* Tokens Table */}
      {!isLoading && (
        <div className="bg-black border border-gray-800 rounded-lg overflow-hidden">
          {/* Table Header - Fixed */}
          <div className="grid grid-cols-7 gap-4 px-4 py-3 bg-gray-900 border-b border-gray-800 sticky top-0 z-10">
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">Pair info</div>
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">Market Cap</div>
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">Liquidity</div>
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">Volume</div>
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">TXNS</div>
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">Token info</div>
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">Action</div>
            </div>

          {/* Scrollable Table Body */}
          <div className="max-h-[60vh] overflow-y-auto">
            <div className="divide-y divide-gray-800">
              {sortedTokens.length > 0 ? sortedTokens.map((token, index) => (
                <div 
                  key={token.tokenAddress} 
                  className="grid grid-cols-7 gap-4 px-4 py-3 hover:bg-gray-900/50 transition-colors cursor-pointer"
                  onClick={() => {
                    console.log('Clicking token:', token.tokenAddress)
                    router.push(`/trade/${token.tokenAddress}`)
                  }}
                >
                  {/* Pair info */}
                    <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center">
                        {(() => {
                          const metadata = tokenMetadata.get(token.tokenAddress)
                          const logoUrl = metadata?.logo || token.logo
                          
                          return logoUrl && logoUrl !== null ? (
                            <img 
                              src={logoUrl} 
                          alt={token.symbol}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            target.nextElementSibling?.classList.remove('hidden')
                          }}
                        />
                          ) : null
                        })()}
                        <div className={`w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold ${(() => {
                          const metadata = tokenMetadata.get(token.tokenAddress)
                          const logoUrl = metadata?.logo || token.logo
                          return logoUrl && logoUrl !== null ? 'hidden' : ''
                        })()}`}>
                          {token.symbol.slice(0, 2).toUpperCase()}
                        </div>
                      </div>
                      {/* Platform logo badge - only show for pump.fun and bonk.fun tokens */}
                      {(token.tokenAddress.includes('pump') || token.tokenAddress.includes('bonk')) && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full overflow-hidden border border-white/20">
                          {token.tokenAddress.includes('pump') ? (
                            <img 
                              src="/icons/platforms/pump.fun-logo.svg" 
                              alt="Pump.fun" 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                                target.parentElement!.innerHTML = '<div class="w-full h-full bg-orange-500 rounded-full"></div>'
                              }}
                            />
                          ) : (
                            <img 
                              src="/icons/platforms/bonk.fun-logo.svg" 
                              alt="BONK.fun" 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                                target.parentElement!.innerHTML = '<div class="w-full h-full bg-blue-500 rounded-full"></div>'
                              }}
                            />
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white text-sm truncate">{token.symbol}</div>
                      <div className="text-xs text-gray-400 truncate">{token.name}</div>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-xs text-gray-500">{formatTimeAgo(token.createdAt)}</span>
                      </div>
                  {/* Social/Web links below token info */}
                  <div className="flex items-center gap-1 mt-2">
                    {(() => {
                      const metadata = tokenMetadata.get(token.tokenAddress)
                      const socialLinks = metadata?.socialLinks || {}
                      
                      return (
                        <>
                          {/* Reddit - only show if token has reddit link */}
                          {socialLinks.reddit && (
                            <a href={socialLinks.reddit} target="_blank" rel="noopener noreferrer" className="w-3 h-3 text-white hover:text-gray-300">
                              <img src="/icons/social/reddit-icon.svg" alt="Reddit" className="w-full h-full object-cover brightness-0 invert" />
                            </a>
                          )}
                          {/* Twitter/X - only show if token has twitter link */}
                          {socialLinks.twitter && (
                            <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="w-3 h-3 text-white hover:text-gray-300">
                              <img src="/icons/social/x-logo.svg" alt="Twitter" className="w-full h-full object-cover brightness-0 invert" />
                            </a>
                          )}
                          {/* Telegram - only show if token has telegram link */}
                          {socialLinks.telegram && (
                            <a href={socialLinks.telegram} target="_blank" rel="noopener noreferrer" className="w-3 h-3 text-white hover:text-gray-300">
                              <img src="/icons/social/telegram-logo.svg" alt="Telegram" className="w-full h-full object-cover brightness-0 invert" />
                            </a>
                          )}
                          {/* Website - only show if token has website link */}
                          {socialLinks.website && (
                            <a href={socialLinks.website} target="_blank" rel="noopener noreferrer" className="w-3 h-3 text-white hover:text-gray-300">
                              <img src="/icons/ui/web-icon.svg" alt="Website" className="w-full h-full object-cover brightness-0 invert" />
                            </a>
                          )}
                          {/* Solscan - always show as it's blockchain data */}
                          <a href={`https://solscan.io/token/${token.tokenAddress}`} target="_blank" rel="noopener noreferrer" className="w-3 h-3 text-white hover:text-gray-300">
                            <img src="/icons/ui/search-icon.svg" alt="Solscan" className="w-full h-full object-cover brightness-0 invert" />
                          </a>
                        </>
                      )
                    })()}
                      </div>
                    </div>
                  </div>

                  {/* Market Cap */}
                  <div className="flex flex-col justify-center">
                    <div className="text-white font-medium text-sm">
                      ${formatNumber(token.marketCap)}
                    </div>
                    <div className={`text-xs ${getPriceChangeColor(token.pricePercentChange['1h'])}`}>
                      {token.pricePercentChange['1h'] !== undefined && token.pricePercentChange['1h'] !== null && !isNaN(token.pricePercentChange['1h']) 
                        ? `${token.pricePercentChange['1h'] > 0 ? '+' : ''}${token.pricePercentChange['1h'].toFixed(2)}%`
                        : '0.00%'
                      }
                      </div>
                  </div>

                  {/* Liquidity */}
                  <div className="flex items-center">
                    <div className="text-white font-medium text-sm">
                      ${formatNumber(token.liquidityUsd)}
                      </div>
                    </div>

                    {/* Volume */}
                  <div className="flex items-center">
                    <div className="text-white font-medium text-sm">
                      ${formatNumber(token.totalVolume['1h'])}
                    </div>
                  </div>

                  {/* TXNS */}
                  <div className="flex flex-col justify-center">
                    <div className="text-white font-medium text-sm">
                      {formatNumber(token.transactions['1h'])}
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-green-400">{token.buyTransactions['1h'] || 0}</span>
                      <span className="text-gray-400">/</span>
                      <span className="text-red-400">{token.sellTransactions['1h'] || 0}</span>
                    </div>
                  </div>

                  {/* Token info */}
                  <div className="flex flex-col justify-center">
                    {/* Top 10 holders percentage */}
                    <div className="flex items-center gap-1 text-xs mb-2">
                      <div className="w-3 h-3 rounded-full flex items-center justify-center overflow-hidden">
                        <img 
                          src="/icons/ui/top10H-icon.svg" 
                          alt="Top 10 Holders" 
                          className="w-full h-full object-cover"
                          style={{ filter: 'brightness(0) saturate(100%) invert(100%)' }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            target.parentElement!.innerHTML = '<div class="w-full h-full bg-blue-500 rounded-full flex items-center justify-center"><span class="text-xs text-white">👤</span></div>'
                          }}
                        />
                      </div>
                      <span className="text-white">+{Math.floor(Math.random() * 10) + 1}%</span>
                    </div>

                    {/* Dex paid status */}
                    <div className="flex items-center gap-1 text-xs mb-2">
                      <div className="w-3 h-3 rounded-full flex items-center justify-center overflow-hidden">
                        <img 
                          src="/icons/platforms/dexscreener-logo.svg" 
                          alt="DexScreener" 
                          className="w-full h-full object-cover"
                          style={{ 
                            filter: dexPaidStatus.get(token.tokenAddress) 
                              ? 'brightness(0) saturate(100%) invert(48%) sepia(79%) saturate(2476%) hue-rotate(86deg) brightness(118%) contrast(119%)' // Green for paid
                              : 'brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)' // Red for unpaid
                          }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            const isPaid = dexPaidStatus.get(token.tokenAddress) || false
                            target.parentElement!.innerHTML = `<div class="w-full h-full ${isPaid ? 'bg-green-500' : 'bg-red-500'} rounded-full flex items-center justify-center"><span class="text-xs text-white">D</span></div>`
                          }}
                        />
                      </div>
                      <span className={dexPaidStatus.get(token.tokenAddress) ? "text-green-400" : "text-red-400"}>
                        {dexPaidStatus.get(token.tokenAddress) ? "Paid" : "Unpaid"}
                      </span>
                    </div>

                  </div>

                  {/* Action */}
                  <div className="flex items-center">
                    <Button 
                      size="sm" 
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded flex items-center gap-1"
                    >
                      <Zap className="w-3 h-3" />
                      5.00
                      </Button>
                  </div>
                </div>
              )) : (
                <div className="px-4 py-8 text-center text-gray-400">
                  <div className="text-sm">Loading trending tokens...</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


