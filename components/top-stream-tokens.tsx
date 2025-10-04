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
  Crown,
  DollarSign
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
  priceChange24h?: number
  // Live stream specific fields
  isCurrentlyLive?: boolean
  numParticipants?: number
  thumbnail?: string
  lastTradeTimestamp?: number
  kingOfTheHillTimestamp?: number
  marketCap?: number
  athMarketCap?: number
  athMarketCapTimestamp?: number
  complete?: boolean
  initialized?: boolean
  rank?: number
}

export function TopStreamTokens() {
  const [tokens, setTokens] = useState<LiveToken[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchTopStreams = async () => {
      try {
        console.log('🚀 TopStreamTokens: Fetching currently live pump.fun streams...')
        
        // Fetch currently live tokens from pump.fun API with timeout
        const response = await fetch('https://frontend-api-v3.pump.fun/coins/currently-live?offset=0&limit=48&sort=currently_live&order=DESC&includeNsfw=true', {
          signal: AbortSignal.timeout(8000) // 8 second timeout
        })
        
        if (response.ok) {
          const data = await response.json()
          console.log('✅ TopStreamTokens: Successfully loaded', data.length, 'currently live tokens')
          
          // Transform pump.fun live data to match our interface
          const transformedTokens = data.map((token: any, index: number) => ({
            tokenAddress: token.mint,
            mint: token.mint,
            symbol: token.symbol,
            name: token.name,
            logo: token.image_uri,
            image: token.image_uri,
            decimals: '6', // Default for pump.fun tokens
            priceNative: token.virtual_sol_reserves ? (token.virtual_sol_reserves / token.virtual_token_reserves).toString() : '0',
            priceUsd: token.usd_market_cap ? (token.usd_market_cap / token.total_supply).toString() : '0',
            liquidity: token.virtual_sol_reserves ? (token.virtual_sol_reserves / 1e9).toString() : '0',
            fullyDilutedValuation: token.usd_market_cap ? token.usd_market_cap.toString() : '0',
            createdAt: new Date(token.created_timestamp).toISOString(),
            mcUsd: token.usd_market_cap || 0,
            volume24h: 0, // Not provided by this API
            transactions: token.reply_count || 0,
            holders: token.num_participants || 0,
            timeAgo: Math.floor((Date.now() - token.created_timestamp) / 1000),
            risk: 'med' as const,
            isPaid: false,
            age: Math.floor((Date.now() - token.created_timestamp) / 1000),
            source: 'pumpfun' as const,
            platform: 'Pump.fun' as const,
            website: token.website,
            twitter: token.twitter,
            telegram: token.telegram,
            hasTwitter: !!token.twitter,
            hasTelegram: !!token.telegram,
            hasWebsite: !!token.website,
            hasSocial: !!(token.twitter || token.telegram || token.website),
            description: token.description,
            // Live stream specific data
            isCurrentlyLive: token.is_currently_live,
            numParticipants: token.num_participants,
            thumbnail: token.thumbnail,
            lastTradeTimestamp: token.last_trade_timestamp,
            kingOfTheHillTimestamp: token.king_of_the_hill_timestamp,
            marketCap: token.market_cap,
            athMarketCap: token.ath_market_cap,
            athMarketCapTimestamp: token.ath_market_cap_timestamp,
            complete: token.complete,
            initialized: token.initialized,
            rank: index + 1
          }))
          
          setTokens(transformedTokens)
          console.log('✅ TopStreamTokens: Successfully processed', transformedTokens.length, 'live stream tokens')
        } else {
          console.log('❌ TopStreamTokens: API error:', response.status)
          setTokens([])
        }
      } catch (error) {
        console.error('❌ TopStreamTokens: Error fetching live streams:', error)
        // Don't clear tokens on error, keep showing last successful data
      } finally {
        setIsLoading(false)
      }
    }

    // Initial fetch
    fetchTopStreams()
    
    // Set up polling every 15 seconds for live updates (reduced frequency)
    const interval = setInterval(fetchTopStreams, 15000)
    
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

  const getChangeColor = (change: number | undefined) => {
    if (change === undefined || change === null || isNaN(change)) {
      return "text-gray-400"
    }
    if (change > 0) return "text-green-400"
    if (change < 0) return "text-red-400"
    return "text-gray-400"
  }

  const handleTokenClick = (token: LiveToken) => {
    const tokenAddress = token.tokenAddress || token.mint
    try {
      window.location.href = `/trade/${tokenAddress}`
    } catch (error) {
      console.error('Navigation failed:', error)
    }
  }


  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            TOP STREAM TOKENS
          </h2>
        </div>
        
      </div>

      {/* Tokens Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="bg-white/5 backdrop-blur-lg border border-white/20 rounded-2xl overflow-hidden">
              <div className="animate-pulse">
                <div className="h-32 bg-white/10"></div>
                <div className="p-3 space-y-2 bg-black/60 backdrop-blur-sm">
                  <div className="h-3 bg-white/10 rounded"></div>
                  <div className="h-2 bg-white/10 rounded"></div>
                  <div className="h-4 bg-white/10 rounded"></div>
                </div>
              </div>
            </div>
          ))
        ) : tokens.length > 0 ? (
          tokens.slice(0, 24).map((token, index) => (
            <div 
              key={token.tokenAddress || token.mint} 
              className="bg-white/5 backdrop-blur-lg border border-white/20 rounded-2xl overflow-hidden hover:border-yellow-500/60 hover:bg-white/10 hover:shadow-2xl hover:shadow-yellow-500/30 hover:backdrop-blur-xl transition-all duration-500 cursor-pointer group"
              onClick={() => handleTokenClick(token)}
            >
              {/* Thumbnail Cover */}
              <div className="relative h-32 overflow-hidden">
                {token.thumbnail ? (
                  <img 
                    src={token.thumbnail} 
                    alt={token.symbol}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      target.parentElement!.innerHTML = `
                        <div class="w-full h-full bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center">
                          <img src="/icons/platforms/pump.fun-logo.svg" alt="Pump.fun" class="w-16 h-16" />
                        </div>
                      `
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-orange-500/30 to-yellow-500/30 backdrop-blur-sm flex items-center justify-center">
                    <img src="/icons/platforms/pump.fun-logo.svg" alt="Pump.fun" className="w-16 h-16 opacity-90" />
                  </div>
                )}
                
                
                {/* Participants count */}
                {token.numParticipants && (
                  <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs flex items-center gap-1 border border-white/20">
                    <Users className="w-3 h-3" />
                    {token.numParticipants}
                  </div>
                )}
              </div>
              
              {/* Token Info */}
              <div className="p-3 space-y-2 bg-black/60 backdrop-blur-sm">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white text-base truncate">{token.symbol}</div>
                    <div className="text-xs text-gray-400 truncate">{token.name}</div>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">Market Cap</span>
                    <span className="text-xs font-medium text-white">
                      ${formatNumber(token.mcUsd || token.marketCap || 0)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">Price</span>
                    <span className="text-xs font-medium text-white">
                      ${formatNumber(parseFloat(token.priceUsd) || 0)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">Participants</span>
                    <span className="text-xs font-medium text-white">
                      {token.numParticipants || 0}
                    </span>
                  </div>
                </div>

                {/* Social links */}
                <div className="flex items-center gap-1 pt-1 border-t border-white/10">
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
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <div className="text-gray-400 text-sm">No live stream tokens available</div>
          </div>
        )}
      </div>
    </div>
  )
}
