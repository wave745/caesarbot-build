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
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    let retryCount = 0
    const maxRetries = 3
    const retryDelay = 2000 // 2 seconds
    let isMounted = true

    const fetchTopStreams = async (attemptNumber = 0) => {
      if (!isMounted) return
      
      try {
        if (attemptNumber > 0) {
          console.log(`🔄 TopStreamTokens: Retry attempt ${attemptNumber}/${maxRetries}...`)
        } else {
          console.log('🚀 TopStreamTokens: Fetching currently live pump.fun streams...')
        }
        
        // Timeout will be handled by Promise.race
        
        // Use our local API proxy to avoid CORS issues
        const apiUrl = '/api/pump-live-streams?limit=48&offset=0&includeNsfw=false&order=DESC'
        
        console.log('🌐 TopStreamTokens: Fetching from local API:', apiUrl)
        
        let response
        try {
          // Use Promise.race for timeout instead of AbortController
          const fetchPromise = fetch(apiUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
            },
            cache: 'no-cache'
          })
          
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), 10000)
          )
          
          response = await Promise.race([fetchPromise, timeoutPromise]) as Response
          
          console.log('📡 TopStreamTokens: Response status:', response.status, response.statusText)
        } catch (fetchError) {
          console.error('❌ TopStreamTokens: Fetch failed:', fetchError)
          
          // If the API route fails, show fallback data immediately
          console.log('🔄 TopStreamTokens: API route failed, no fallback data')
          
          if (!isMounted) return
          
          setTokens([])
          setHasError(true)
          setErrorMessage('API temporarily unavailable')
          setIsLoading(false)
          return
        }
        
        // Timeout is handled by Promise.race
        
        if (!response) {
          throw new Error('No response received from server')
        }
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        let apiResponse
        try {
          apiResponse = await response.json()
          console.log('📊 TopStreamTokens: Parsed API response:', apiResponse)
        } catch (jsonError) {
          console.error('❌ TopStreamTokens: JSON parsing failed:', jsonError)
          throw new Error('Invalid JSON response from server')
        }
        
        if (!isMounted) return
        
        // Handle our API response format
        if (!apiResponse.success && !apiResponse.data) {
          console.error('❌ TopStreamTokens: API returned error:', apiResponse.error)
          throw new Error(apiResponse.error || 'API request failed')
        }
        
        const data = apiResponse.data
        if (!Array.isArray(data)) {
          console.error('❌ TopStreamTokens: Expected array but got:', typeof data)
          throw new Error('Invalid data format from server')
        }
        
        console.log('✅ TopStreamTokens: Successfully loaded', data.length, 'currently live tokens from', apiResponse.source || 'API')
        
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
        
        if (!isMounted) return
        
        setTokens(transformedTokens)
        setHasError(false) // Clear any previous errors
        setErrorMessage('')
        console.log('✅ TopStreamTokens: Successfully processed', transformedTokens.length, 'live stream tokens')
        
      } catch (error) {
        if (!isMounted) return
        
        console.error('❌ TopStreamTokens: Error fetching live streams:', error)
        
        // Check if this is a retryable error
        const isRetryableError = (
          error.name === 'AbortError' || 
          error.message.includes('Failed to fetch') ||
          error.message.includes('NetworkError') ||
          error.message.includes('TypeError') ||
          error.message.includes('Network request failed')
        )
        
        // Retry logic for network errors
        if (attemptNumber < maxRetries && isRetryableError) {
          console.log(`🔄 TopStreamTokens: Retrying in ${retryDelay}ms... (attempt ${attemptNumber + 1}/${maxRetries})`)
          setTimeout(() => {
            if (isMounted) {
              fetchTopStreams(attemptNumber + 1)
            }
          }, retryDelay)
          return
        }
        
        // If all retries failed or it's a different error, show fallback
        console.error('❌ TopStreamTokens: All retry attempts failed or non-retryable error')
        setHasError(true)
        setErrorMessage('Unable to load live streams. Please check your connection and try again.')
        
        // Don't clear tokens on error, keep showing last successful data
        // Only clear if this is the initial load and we have no data
        if (tokens.length === 0) {
          // Show fallback mock data for demonstration
          const mockTokens: LiveToken[] = [
            {
              tokenAddress: 'mock1',
              mint: 'mock1',
              symbol: 'DEMO',
              name: 'Demo Token',
              logo: '/icons/platforms/pump.fun-logo.svg',
              image: '/icons/platforms/pump.fun-logo.svg',
              decimals: '6',
              priceNative: '0.001',
              priceUsd: '0.15',
              liquidity: '1000',
              fullyDilutedValuation: '15000',
              createdAt: new Date().toISOString(),
              mcUsd: 15000,
              volume24h: 0,
              transactions: 0,
              holders: 0,
              timeAgo: 0,
              risk: 'med' as const,
              isPaid: false,
              age: 0,
              source: 'pumpfun' as const,
              platform: 'Pump.fun' as const,
              hasTwitter: false,
              hasTelegram: false,
              hasWebsite: false,
              hasSocial: false,
              isCurrentlyLive: true,
              numParticipants: 0,
              complete: false,
              initialized: true,
              rank: 1
            }
          ]
          setTokens(mockTokens)
        }
      } finally {
        if (!isMounted) return
        
        if (attemptNumber === 0) {
          setIsLoading(false)
        }
      }
    }

    // Initial fetch
    fetchTopStreams()
    
    // Set up polling every 30 seconds for live updates (increased interval to reduce load)
    const interval = setInterval(() => {
      if (isMounted) {
        fetchTopStreams()
      }
    }, 30000)
    
    // Listen for retry events
    const handleRetryEvent = () => {
      if (isMounted) {
        fetchTopStreams()
      }
    }
    
    window.addEventListener('retry-fetch', handleRetryEvent)
    
    return () => {
      isMounted = false
      clearInterval(interval)
      window.removeEventListener('retry-fetch', handleRetryEvent)
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

  const handleQuickBuy = (token: LiveToken) => {
    console.log(`Quick buying ${token.symbol} (${token.tokenAddress || token.mint})`)
    // TODO: Integrate with Solana wallet adapter for quick buy functionality
    // For now, redirect to trade page with buy intent
    const tokenAddress = token.tokenAddress || token.mint
    try {
      window.location.href = `/trade/${tokenAddress}?action=buy`
    } catch (error) {
      console.error('Quick buy navigation failed:', error)
    }
  }

  const handleRetry = () => {
    setHasError(false)
    setErrorMessage('')
    setIsLoading(true)
    // Trigger a new fetch by calling the effect again
    // We'll use a key to force re-mount the component
    const event = new CustomEvent('retry-fetch')
    window.dispatchEvent(event)
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
        
        {hasError && (
          <Button 
            onClick={handleRetry}
            variant="outline" 
            size="sm"
            className="bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        )}
      </div>

      {/* Error Message */}
      {hasError && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <Activity className="w-4 h-4" />
            {errorMessage}
          </div>
        </div>
      )}

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

                {/* Social links and Buy button */}
                <div className="flex items-center justify-between pt-1 border-t border-white/10">
                  <div className="flex items-center gap-1">
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
                  
                  {/* Quick Buy Button */}
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleQuickBuy(token)
                    }}
                    className="bg-blue-500 hover:bg-blue-400 text-white font-bold px-2 py-1 rounded-md transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/25 flex items-center gap-1"
                  >
                    <Zap className="w-2.5 h-2.5" />
                    <span className="text-xs">BUY</span>
                  </Button>
                </div>
              </div>
            </div>
          ))
        ) : hasError ? (
          <div className="col-span-full text-center py-8">
            <div className="text-red-400 text-sm mb-2">Failed to load live stream tokens</div>
            <Button 
              onClick={handleRetry}
              variant="outline" 
              size="sm"
              className="bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        ) : (
          <div className="col-span-full text-center py-8">
            <div className="text-gray-400 text-sm">No live stream tokens available</div>
          </div>
        )}
      </div>
    </div>
  )
}
