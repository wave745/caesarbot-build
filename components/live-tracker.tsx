"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  ExternalLink,
  RefreshCw,
  Clock,
  Users,
  Activity,
  Star
} from "lucide-react"
import { useRouter } from "next/navigation"

interface LiveToken {
  tokenAddress: string
  symbol: string
  name: string
  logo?: string
  decimals: string
  priceNative: string
  priceUsd: string
  liquidity: string
  fullyDilutedValuation: string
  createdAt: string
  mint?: string
  image?: string
  mcUsd?: number
  volume24h?: number
  transactions?: number
  holders?: number
  timeAgo?: number
  risk?: 'low' | 'med' | 'high'
  isPaid?: boolean
  age?: number
  source?: 'pumpfun' | 'bonk'
  platform?: 'Pump.fun' | 'BONK.fun'
  website?: string
  twitter?: string
  telegram?: string
  hasTwitter?: boolean
  hasTelegram?: boolean
  hasWebsite?: boolean
  hasSocial?: boolean
}

export function LiveTracker() {
  const [newStreams, setNewStreams] = useState<LiveToken[]>([])
  const [topStreams, setTopStreams] = useState<LiveToken[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchLiveData = async () => {
      try {
        console.log('🚀 LiveTracker: Fetching live stream data...')
        
        // Use Promise.allSettled to handle failures gracefully
        const [newStreamsResult, topStreamsResult] = await Promise.allSettled([
          fetch('/api/pump-fun/new-tokens?limit=10', { 
            signal: AbortSignal.timeout(5000) // 5 second timeout
          }),
          fetch('/api/moralis/trending-tokens?limit=10', { 
            signal: AbortSignal.timeout(5000) // 5 second timeout
          })
        ])
        
        // Handle new streams
        if (newStreamsResult.status === 'fulfilled' && newStreamsResult.value.ok) {
          const newStreamsData = await newStreamsResult.value.json()
          if (newStreamsData.success && newStreamsData.data) {
            setNewStreams(newStreamsData.data)
            console.log('✅ LiveTracker: Loaded new streams:', newStreamsData.data.length)
          }
        } else {
          console.log('⚠️ LiveTracker: New streams API failed, using fallback')
          // Use pump.fun live API as fallback
          try {
            const fallbackResponse = await fetch('https://frontend-api-v3.pump.fun/coins/currently-live?offset=0&limit=10&sort=currently_live&order=DESC&includeNsfw=true', {
              signal: AbortSignal.timeout(5000)
            })
            if (fallbackResponse.ok) {
              const fallbackData = await fallbackResponse.json()
              const transformedTokens = fallbackData.slice(0, 10).map((token: any) => ({
                tokenAddress: token.mint,
                symbol: token.symbol,
                name: token.name,
                logo: token.image_uri,
                priceUsd: token.usd_market_cap ? (token.usd_market_cap / token.total_supply).toString() : '0',
                fullyDilutedValuation: token.usd_market_cap ? token.usd_market_cap.toString() : '0',
                createdAt: new Date(token.created_timestamp).toISOString(),
                mcUsd: token.usd_market_cap || 0,
                source: 'pumpfun' as const,
                platform: 'Pump.fun' as const,
                website: token.website,
                twitter: token.twitter,
                telegram: token.telegram,
                hasTwitter: !!token.twitter,
                hasTelegram: !!token.telegram,
                hasWebsite: !!token.website,
                hasSocial: !!(token.twitter || token.telegram || token.website)
              }))
              setNewStreams(transformedTokens)
              console.log('✅ LiveTracker: Used pump.fun fallback for new streams')
            }
          } catch (fallbackError) {
            console.log('❌ LiveTracker: Fallback also failed:', fallbackError)
          }
        }
        
        // Handle top streams
        if (topStreamsResult.status === 'fulfilled' && topStreamsResult.value.ok) {
          const topStreamsData = await topStreamsResult.value.json()
          if (topStreamsData.success && topStreamsData.data) {
            setTopStreams(topStreamsData.data)
            console.log('✅ LiveTracker: Loaded top streams:', topStreamsData.data.length)
          }
        } else {
          console.log('⚠️ LiveTracker: Top streams API failed, using fallback')
          // Use pump.fun live API as fallback for top streams too
          try {
            const fallbackResponse = await fetch('https://frontend-api-v3.pump.fun/coins/currently-live?offset=0&limit=10&sort=currently_live&order=DESC&includeNsfw=true', {
              signal: AbortSignal.timeout(5000)
            })
            if (fallbackResponse.ok) {
              const fallbackData = await fallbackResponse.json()
              const transformedTokens = fallbackData.slice(0, 10).map((token: any) => ({
                tokenAddress: token.mint,
                symbol: token.symbol,
                name: token.name,
                logo: token.image_uri,
                priceUsd: token.usd_market_cap ? (token.usd_market_cap / token.total_supply).toString() : '0',
                fullyDilutedValuation: token.usd_market_cap ? token.usd_market_cap.toString() : '0',
                createdAt: new Date(token.created_timestamp).toISOString(),
                mcUsd: token.usd_market_cap || 0,
                source: 'pumpfun' as const,
                platform: 'Pump.fun' as const,
                website: token.website,
                twitter: token.twitter,
                telegram: token.telegram,
                hasTwitter: !!token.twitter,
                hasTelegram: !!token.telegram,
                hasWebsite: !!token.website,
                hasSocial: !!(token.twitter || token.telegram || token.website)
              }))
              setTopStreams(transformedTokens)
              console.log('✅ LiveTracker: Used pump.fun fallback for top streams')
            }
          } catch (fallbackError) {
            console.log('❌ LiveTracker: Top streams fallback also failed:', fallbackError)
          }
        }
        
        setIsLoading(false)
        
        console.log('✅ LiveTracker: Live data fetch completed')
      } catch (error) {
        console.error('❌ LiveTracker: Error fetching live data:', error)
        setIsLoading(false)
      }
    }

    // Initial fetch
    fetchLiveData()
    
    // Set up polling every 10 seconds for live updates (reduced frequency to avoid overwhelming)
    const interval = setInterval(fetchLiveData, 10000)
    
    return () => {
      clearInterval(interval)
    }
  }, [])

  const formatNumber = (num: number | string | undefined) => {
    // Convert to number if it's a string
    let numericValue: number
    if (typeof num === 'string') {
      numericValue = parseFloat(num)
    } else if (typeof num === 'number') {
      numericValue = num
    } else {
      return '0.00'
    }
    
    // Check if the conversion was successful
    if (isNaN(numericValue) || numericValue === null || numericValue === undefined) {
      return '0.00'
    }
    
    if (numericValue >= 1_000_000) {
      return (numericValue / 1_000_000).toFixed(1) + 'M'
    }
    if (numericValue >= 1_000) {
      return (numericValue / 1_000).toFixed(1) + 'K'
    }
    return numericValue.toFixed(2)
  }

  const formatTimeAgo = (timeAgo: number | undefined) => {
    if (timeAgo === undefined || timeAgo === null || isNaN(timeAgo) || timeAgo < 0) {
      return 'now'
    }
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

  const getTimeAgo = (createdAt: string) => {
    const now = new Date().getTime()
    const created = new Date(createdAt).getTime()
    const diffInSeconds = Math.floor((now - created) / 1000)
    return Math.max(0, diffInSeconds)
  }

  const handleTokenClick = (token: LiveToken) => {
    const tokenAddress = token.tokenAddress || token.mint
    try {
      window.location.href = `/trade/${tokenAddress}`
    } catch (error) {
      console.error('Navigation failed:', error)
    }
  }

  const currentTokens = newStreams

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            LIVE TRACKER
          </h2>
        </div>
        
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="bg-white/5 backdrop-blur-lg border border-white/20 rounded-2xl overflow-hidden">
              <CardContent className="p-3 bg-black/60 backdrop-blur-sm">
                <div className="animate-pulse">
                  <div className="h-3 bg-white/10 rounded mb-2"></div>
                  <div className="h-2 bg-white/10 rounded mb-4"></div>
                  <div className="h-4 bg-white/10 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : currentTokens.length > 0 ? (
          currentTokens.slice(0, 12).map((token) => (
            <Card 
              key={token.tokenAddress || token.mint} 
              className="bg-white/5 backdrop-blur-lg border border-white/20 rounded-2xl hover:border-yellow-500/60 hover:bg-white/10 hover:shadow-2xl hover:shadow-yellow-500/30 hover:backdrop-blur-xl transition-all duration-500 cursor-pointer group"
              onClick={() => handleTokenClick(token)}
            >
              <CardContent className="p-3 bg-black/60 backdrop-blur-sm">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center">
                        {token.logo || token.image ? (
                          <img 
                            src={token.logo || token.image} 
                            alt={token.symbol}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-white text-sm font-bold">
                            {token.symbol.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      {/* Platform badge */}
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full overflow-hidden border border-white/20">
                        {token.source === 'pumpfun' ? (
                          <div className="w-full h-full bg-orange-500 rounded-full"></div>
                        ) : token.source === 'bonk' ? (
                          <div className="w-full h-full bg-blue-500 rounded-full"></div>
                        ) : (
                          <div className="w-full h-full bg-green-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold text-white text-sm">{token.symbol}</div>
                      <div className="text-xs text-gray-400 truncate max-w-24">{token.name}</div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-xs text-gray-500">
                      {formatTimeAgo(getTimeAgo(token.createdAt))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">Price</span>
                    <span className="text-sm font-medium text-white">
                      ${formatNumber(parseFloat(token.priceUsd) || 0)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">Market Cap</span>
                    <span className="text-sm font-medium text-white">
                      ${formatNumber(parseFloat(token.fullyDilutedValuation) || 0)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">Volume</span>
                    <span className="text-sm font-medium text-white">
                      ${formatNumber(token.volume24h || 0)}
                    </span>
                  </div>
                </div>

                {/* Social links */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10">
                  {token.twitter && (
                    <a href={token.twitter} target="_blank" rel="noopener noreferrer" className="w-4 h-4 text-gray-400 hover:text-white transition-colors">
                      <img src="/icons/social/x-logo.svg" alt="Twitter" className="w-full h-full object-cover brightness-0 invert" />
                    </a>
                  )}
                  {token.telegram && (
                    <a href={token.telegram} target="_blank" rel="noopener noreferrer" className="w-4 h-4 text-gray-400 hover:text-white transition-colors">
                      <img src="/icons/social/telegram-logo.svg" alt="Telegram" className="w-full h-full object-cover brightness-0 invert" />
                    </a>
                  )}
                  {token.tiktok && (
                    <a href={token.tiktok} target="_blank" rel="noopener noreferrer" className="w-4 h-4 text-gray-400 hover:text-white transition-colors">
                      <img src="/icons/social/tiktok-icon.svg" alt="TikTok" className="w-full h-full object-cover" />
                    </a>
                  )}
                  {token.website && (
                    <a href={token.website} target="_blank" rel="noopener noreferrer" className="w-4 h-4 text-gray-400 hover:text-white transition-colors">
                      {token.website.includes('tiktok.com') ? (
                        <img src="/icons/social/tiktok-icon.svg" alt="TikTok" className="w-full h-full object-cover" />
                      ) : (
                        <img src="/icons/ui/web-icon.svg" alt="Website" className="w-full h-full object-cover brightness-0 invert" />
                      )}
                    </a>
                  )}
                  <a href={`https://solscan.io/token/${token.tokenAddress || token.mint}`} target="_blank" rel="noopener noreferrer" className="w-4 h-4 text-gray-400 hover:text-white transition-colors">
                    <img src="/icons/ui/search-icon.svg" alt="Solscan" className="w-full h-full object-cover brightness-0 invert" />
                  </a>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <div className="text-gray-400 text-sm">No live streams available</div>
          </div>
        )}
      </div>
    </div>
  )
}
