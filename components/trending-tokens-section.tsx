"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink,
  Eye
} from "lucide-react"
import { tokenCache } from "@/lib/services/token-cache"
import { useRouter } from "next/navigation"
import Link from "next/link"
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
  filters?: any
}

export function TrendingTokensSection({ sortBy: propSortBy, filters }: TrendingTokensSectionProps = {}) {
  const [tokens, setTokens] = useState<MoralisTrendingToken[]>([])
  const [isLoading, setIsLoading] = useState(false) // Start with false for instant display
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'volume' | 'marketCap' | 'change' | 'new'>(propSortBy || 'new')
  const [dexPaidStatus, setDexPaidStatus] = useState<Map<string, boolean>>(new Map())
  const [tokenMetadata, setTokenMetadata] = useState<Map<string, any>>(new Map())
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [updateTrigger, setUpdateTrigger] = useState<number>(0) // Force re-render trigger
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
        return
      }
      console.error('Error fetching Dex paid status:', error)
    }
  }

  const fetchTokenMetadata = async (tokens: MoralisTrendingToken[], signal?: AbortSignal) => {
    try {

      const tokenAddresses = tokens.map(token => token.tokenAddress)

      const response = await fetch('/api/moralis/token-metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tokenAddresses }),
        signal
      })


      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          const metadataMap = new Map<string, any>()
          Object.entries(data.data).forEach(([tokenAddress, metadata]) => {
            metadataMap.set(tokenAddress, metadata)
          })
          setTokenMetadata(metadataMap)
        }
      } else {
        console.error('Metadata API error:', response.status, response.statusText)
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return
      }
      console.error('Error fetching token metadata:', error)
    }
  }

  // Smart update function that merges new data with existing tokens
  const updateTokensSmart = useCallback((newTokens: MoralisTrendingToken[]) => {
    setTokens(prevTokens => {
      // Create a map of existing tokens by address for fast lookup
      const tokenMap = new Map<string, MoralisTrendingToken>()
      prevTokens.forEach(token => {
        tokenMap.set(token.tokenAddress, token)
      })

      // Merge new tokens with existing ones, updating metrics while preserving order
      const updatedTokens = newTokens.map(newToken => {
        const existingToken = tokenMap.get(newToken.tokenAddress)
        const updateKey = Date.now() + Math.random() // Unique key for each update
        if (existingToken) {
          // Token exists - create COMPLETELY NEW object to force React re-render
          // Don't spread existingToken - create fresh object with all properties
          return {
            // Copy all existing properties
            chainId: existingToken.chainId || newToken.chainId,
            tokenAddress: newToken.tokenAddress,
            name: existingToken.name || newToken.name,
            uniqueName: existingToken.uniqueName || newToken.uniqueName,
            symbol: existingToken.symbol || newToken.symbol,
            decimals: newToken.decimals,
            logo: existingToken.logo || newToken.logo,
            usdPrice: newToken.usdPrice,
            createdAt: newToken.createdAt,
            // Update live metrics - create NEW objects/arrays
            marketCap: newToken.marketCap,
            liquidityUsd: newToken.liquidityUsd,
            holders: newToken.holders,
            pricePercentChange: {
              '1h': newToken.pricePercentChange?.['1h'] ?? 0,
              '4h': newToken.pricePercentChange?.['4h'] ?? 0,
              '12h': newToken.pricePercentChange?.['12h'] ?? 0,
              '24h': newToken.pricePercentChange?.['24h'] ?? 0
            },
            totalVolume: {
              '1h': newToken.totalVolume?.['1h'] ?? 0,
              '4h': newToken.totalVolume?.['4h'] ?? 0,
              '12h': newToken.totalVolume?.['12h'] ?? 0,
              '24h': newToken.totalVolume?.['24h'] ?? 0
            },
            transactions: {
              '1h': newToken.transactions?.['1h'] ?? 0,
              '4h': newToken.transactions?.['4h'] ?? 0,
              '12h': newToken.transactions?.['12h'] ?? 0,
              '24h': newToken.transactions?.['24h'] ?? 0
            },
            buyTransactions: {
              '1h': newToken.buyTransactions?.['1h'] ?? 0,
              '4h': newToken.buyTransactions?.['4h'] ?? 0,
              '12h': newToken.buyTransactions?.['12h'] ?? 0,
              '24h': newToken.buyTransactions?.['24h'] ?? 0
            },
            sellTransactions: {
              '1h': newToken.sellTransactions?.['1h'] ?? 0,
              '4h': newToken.sellTransactions?.['4h'] ?? 0,
              '12h': newToken.sellTransactions?.['12h'] ?? 0,
              '24h': newToken.sellTransactions?.['24h'] ?? 0
            },
            buyers: {
              '1h': newToken.buyers?.['1h'] ?? 0,
              '4h': newToken.buyers?.['4h'] ?? 0,
              '12h': newToken.buyers?.['12h'] ?? 0,
              '24h': newToken.buyers?.['24h'] ?? 0
            },
            sellers: {
              '1h': newToken.sellers?.['1h'] ?? 0,
              '4h': newToken.sellers?.['4h'] ?? 0,
              '12h': newToken.sellers?.['12h'] ?? 0,
              '24h': newToken.sellers?.['24h'] ?? 0
            },
            // Update timestamp and unique key for live updates
            _lastUpdate: Date.now(),
            _updateKey: updateKey, // Force React to see this as a new object
            _updateTimestamp: Date.now() // Additional timestamp for reactivity
          } as any
        } else {
          // New token - add it with all properties
          return {
            ...newToken,
            _lastUpdate: Date.now(),
            _updateKey: updateKey,
            _updateTimestamp: Date.now()
          } as any
        }
      })

      // Add any existing tokens that weren't in the new data (they might have dropped out)
      // But only keep them for a short time (30 seconds) to prevent stale data
      const thirtySecondsAgo = Date.now() - 30000
      prevTokens.forEach(token => {
        if (!tokenMap.has(token.tokenAddress) && (token as any)._lastUpdate && (token as any)._lastUpdate > thirtySecondsAgo) {
          updatedTokens.push({
            ...token,
            _updateTimestamp: Date.now()
          } as any)
        }
      })

      // Force update trigger
      setUpdateTrigger(Date.now())
      
      return updatedTokens
    })
  }, [])

  const fetchTrendingTokens = useCallback(async () => {
    try {
      // NO LOADING STATE - show tokens immediately
      setError(null)

      // Build query parameters from filters
      const queryParams = new URLSearchParams()

      if (filters) {
        // Add range filters
        if (filters.marketCap?.min) queryParams.append('minMarketCap', filters.marketCap.min)
        if (filters.marketCap?.max) queryParams.append('maxMarketCap', filters.marketCap.max)
        if (filters.volume?.min) queryParams.append('minVolume', filters.volume.min)
        if (filters.volume?.max) queryParams.append('maxVolume', filters.volume.max)
        if (filters.liquidity?.min) queryParams.append('minLiquidity', filters.liquidity.min)
        if (filters.liquidity?.max) queryParams.append('maxLiquidity', filters.liquidity.max)
        if (filters.holders?.min) queryParams.append('minHolders', filters.holders.min)
        if (filters.holders?.max) queryParams.append('maxHolders', filters.holders.max)

        // Add boolean filters
        if (filters.dexPaid) queryParams.append('isPaid', 'true')
        if (filters.devStillHolding) queryParams.append('devStillHolding', 'true')
        if (filters.pumpLive) queryParams.append('pumpLive', 'true')

        // Add keyword filters
        if (filters.includeKeywords) queryParams.append('includeKeywords', filters.includeKeywords)
        if (filters.excludeKeywords) queryParams.append('excludeKeywords', filters.excludeKeywords)
      }

      // Fast fetch with shorter timeout for live updates
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5s timeout for faster updates

      // Add cache-busting timestamp to ensure fresh data
      const cacheBuster = `_t=${Date.now()}`
      const baseUrl = filters ? `/api/moralis/filtered-tokens?${queryParams.toString()}` : '/api/moralis/trending-tokens'
      const url = baseUrl.includes('?') ? `${baseUrl}&${cacheBuster}` : `${baseUrl}?${cacheBuster}`

      // Reduced logging for performance in production
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Fetching trending tokens from:', url)
      }

      const response = await fetch(url, {
        signal: controller.signal,
        cache: 'no-store', // Disable caching
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
      clearTimeout(timeoutId)

      if (!response.ok) {
        console.error('❌ API response not OK:', response.status, response.statusText)
        throw new Error(`API returned ${response.status}: ${response.statusText}`)
      }

      // Check if response has content
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text()
        console.error('❌ Response is not JSON. Content-Type:', contentType, 'Body:', text.substring(0, 200))
        throw new Error('API returned non-JSON response')
      }

      // Get response text first to check if it's empty
      const responseText = await response.text()
      if (!responseText || responseText.trim() === '') {
        console.error('❌ Empty response from API')
        throw new Error('API returned empty response')
      }

      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error('❌ Failed to parse JSON response:', parseError, 'Response text:', responseText.substring(0, 200))
        throw new Error('Failed to parse API response as JSON')
      }

      // Reduced logging for performance
      if (process.env.NODE_ENV === 'development') {
        console.log('📦 API response:', { success: data.success, dataLength: data.data?.length, hasData: !!data.data })
      }

      // Handle the response - check if it has the expected structure
      if (data && typeof data === 'object') {
        if (data.success && data.data && Array.isArray(data.data)) {
          if (data.data.length > 0) {
            // Reduced logging for performance
            if (process.env.NODE_ENV === 'development') {
              console.log('✅ Updating tokens:', data.data.length, 'Update trigger:', updateTrigger)
              // Log first token's market cap to verify it's changing
              if (data.data.length > 0) {
                console.log('📊 First token Market Cap:', data.data[0].marketCap, 'Volume:', data.data[0].totalVolume?.['1h'])
              }
            }
            // Use smart update to merge with existing tokens for smooth live updates
            updateTokensSmart(data.data)
            setLastUpdate(new Date())
            setIsLoading(false)

            // Fetch Dex paid status and metadata for the tokens (non-blocking)
            fetchDexPaidStatus(data.data, controller.signal).catch(() => {})
            fetchTokenMetadata(data.data, controller.signal).catch(() => {})
          } else {
            console.warn('⚠️ API returned empty array')
            setTokens([])
            setError('No trending tokens available')
            setIsLoading(false)
          }
        } else if (data.success === false || (data.error && !data.data)) {
          // API explicitly returned an error
          console.error('❌ API returned error:', data.error || 'Unknown error')
          // Don't clear existing tokens on error - keep them visible
          setError(data.error || 'Failed to load trending tokens')
          setIsLoading(false)
        } else {
          // Unexpected response format - but still try to use data if it exists
          console.error('❌ Invalid API response format. Expected {success, data[]}, got:', data)
          // If data exists but isn't in expected format, try to use it
          if (Array.isArray(data)) {
            console.log('⚠️ Response is array, using directly')
            updateTokensSmart(data)
            setLastUpdate(new Date())
            setIsLoading(false)
          } else {
            setError('Invalid response format from API')
            setIsLoading(false)
          }
        }
      } else {
        console.error('❌ Response is not an object:', typeof data, data)
        // Don't clear tokens on error - keep existing data visible
        setError('Invalid response from API')
        setIsLoading(false)
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return
      }
      console.error('Error fetching trending tokens:', err)
      setError(err.message || 'Failed to load trending tokens')
      // Don't clear tokens on error - keep existing data visible
      setIsLoading(false) // Show error state immediately
    }
  }, [filters, updateTokensSmart])

  // Main effect: Check cache, fetch on mount, and set up ultra-fast polling
  useEffect(() => {
    let abortController: AbortController | null = null
    let intervalId: NodeJS.Timeout | null = null

    // Check cache first for INSTANT display
    if (tokenCache.isDataAvailable()) {
      const cachedTokens = tokenCache.getTrendingTokens()
      if (cachedTokens.length > 0) {
        setTokens(cachedTokens)
        setIsLoading(false)
      }
    }

    // INSTANT fetch on mount
    fetchTrendingTokens()

    // ULTRA-FAST polling for live, non-stop updates
    // Poll every 500ms for maximum responsiveness
    intervalId = setInterval(() => {
      fetchTrendingTokens()
    }, 500) // Refresh every 500ms for live updates

    // Additional live update trigger - force re-render every 100ms for ultra-responsive UI
    // This ensures values update even if API response is slightly delayed
    const liveUpdateInterval = setInterval(() => {
      setUpdateTrigger(prev => prev + 1)
      // Force update tokens with completely new objects to trigger React re-render
      setTokens(prevTokens => {
        if (prevTokens.length === 0) return prevTokens
        const now = Date.now()
        // Create completely new objects to force React to detect changes
        return prevTokens.map(token => {
          // Create a brand new object with all properties
          return {
            chainId: token.chainId,
            tokenAddress: token.tokenAddress,
            name: token.name,
            uniqueName: token.uniqueName,
            symbol: token.symbol,
            decimals: token.decimals,
            logo: token.logo,
            usdPrice: token.usdPrice,
            createdAt: token.createdAt,
            marketCap: token.marketCap,
            liquidityUsd: token.liquidityUsd,
            holders: token.holders,
            pricePercentChange: token.pricePercentChange ? { ...token.pricePercentChange } : {},
            totalVolume: token.totalVolume ? { ...token.totalVolume } : {},
            transactions: token.transactions ? { ...token.transactions } : {},
            buyTransactions: token.buyTransactions ? { ...token.buyTransactions } : {},
            sellTransactions: token.sellTransactions ? { ...token.sellTransactions } : {},
            buyers: token.buyers ? { ...token.buyers } : {},
            sellers: token.sellers ? { ...token.sellers } : {},
            _lastUpdate: (token as any)._lastUpdate || now,
            _updateKey: (token as any)._updateKey || Math.random(),
            _updateTimestamp: now // Always update timestamp
          } as any
        })
      })
    }, 100) // Update every 100ms for ultra-smooth live updates

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
      if (liveUpdateInterval) {
        clearInterval(liveUpdateInterval)
      }
      if (abortController) {
        abortController.abort()
      }
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
      if (abortController) {
        abortController.abort()
      }
    }
  }, [fetchTrendingTokens])

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
  }, [tokens, sortBy, updateTrigger]) // Include updateTrigger to force re-computation and re-render

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


  return (
    <div className="w-full">
      {/* Tokens Table */}
      <div className="bg-black border border-gray-800 rounded-lg overflow-hidden">
        {/* Table Header - Fixed */}
        <div className="grid py-3 bg-[#1f1f1f] border-b border-gray-800 sticky top-0 z-10" style={{ gridTemplateColumns: 'auto 120px 120px 120px 80px auto' }}>
          <div className="text-xs font-medium text-gray-400 tracking-wide pl-4">Pair info</div>
          <div className="text-xs font-medium text-gray-400 tracking-wide text-right pr-4">Market Cap</div>
          <div className="text-xs font-medium text-gray-400 tracking-wide text-right pr-4">Liquidity</div>
          <div className="text-xs font-medium text-gray-400 tracking-wide text-right pr-4">Volume</div>
          <div className="text-xs font-medium text-gray-400 tracking-wide text-right pr-4">Txns</div>
          <div className="text-xs font-medium text-gray-400 tracking-wide pl-12 pr-4">Token info</div>
        </div>

        {/* Scrollable Table Body */}
        <div className="max-h-[60vh] overflow-y-auto bg-black">
          {isLoading ? (
            <>
              <div className="flex items-center justify-center py-12">
                <span className="text-white">Loading trending tokens...</span>
              </div>
              {/* Show empty rows when loading */}
              <div className="divide-y divide-gray-800">
                {Array.from({ length: 9 }).map((_, index) => (
                  <div key={index} className="grid py-3 min-h-[60px] border-b border-gray-800" style={{ gridTemplateColumns: 'auto 120px 120px 120px 80px auto' }}>
                    <div className="flex items-center pl-4"></div>
                    <div className="flex items-center justify-end pr-4"></div>
                    <div className="flex items-center justify-end pr-4"></div>
                    <div className="flex items-center justify-end pr-4"></div>
                    <div className="flex items-center justify-end pr-4"></div>
                    <div className="flex items-center pl-12 pr-4"></div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="divide-y divide-gray-800">
              {sortedTokens.length > 0 ? sortedTokens.map((token, index) => (
                <div
                  key={token.tokenAddress}
                  className="grid py-3 hover:bg-gray-900/50 transition-colors cursor-pointer"
                  style={{ gridTemplateColumns: 'auto 120px 120px 120px 80px auto' }}
                  onClick={() => {
                    try {
                      window.location.href = `/trade/${token.tokenAddress}`
                    } catch (error) {
                      console.error('Navigation failed:', error)
                    }
                  }}
                >
                  {/* Pair info */}
                  <div className="flex items-center gap-3 pl-4">
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

                  {/* Market Cap - Live updating - Force re-render */}
                  <div className="flex flex-col justify-center items-end pr-4" key={`mc-${token.tokenAddress}-${updateTrigger}`}>
                    <div className="text-white font-medium text-sm text-right" key={`mc-val-${updateTrigger}`}>
                      {/* Include updateTrigger in render to force update */}
                      {`$${formatNumber(token.marketCap)}`}
                    </div>
                    <div className={`text-xs text-right ${getPriceChangeColor(token.pricePercentChange?.['1h'])}`} key={`mc-pct-${updateTrigger}`}>
                      {token.pricePercentChange?.['1h'] !== undefined && token.pricePercentChange['1h'] !== null && !isNaN(token.pricePercentChange['1h'])
                        ? `${token.pricePercentChange['1h'] > 0 ? '+' : ''}${token.pricePercentChange['1h'].toFixed(2)}%`
                        : '0.00%'}
                    </div>
                  </div>

                  {/* Liquidity - Live updating - Force re-render */}
                  <div className="flex items-center justify-end pr-4" key={`liq-${token.tokenAddress}-${updateTrigger}`}>
                    <div className="text-white font-medium text-sm text-right" key={`liq-val-${updateTrigger}`}>
                      {`$${formatNumber(token.liquidityUsd)}`}
                    </div>
                  </div>

                  {/* Volume - Live updating - Force re-render */}
                  <div className="flex items-center justify-end pr-4" key={`vol-${token.tokenAddress}-${updateTrigger}`}>
                    <div className="text-white font-medium text-sm text-right" key={`vol-val-${updateTrigger}`}>
                      {`$${formatNumber(token.totalVolume?.['1h'])}`}
                    </div>
                  </div>

                  {/* TXNS - Live updating - Force re-render */}
                  <div className="flex flex-col justify-center items-end pr-4" key={`txns-${token.tokenAddress}-${updateTrigger}`}>
                    <div className="text-white font-medium text-sm text-right" key={`txns-val-${updateTrigger}`}>
                      {formatNumber(token.transactions?.['1h'])}
                    </div>
                    <div className="flex items-center justify-end gap-1 text-xs" key={`txns-breakdown-${updateTrigger}`}>
                      <span className="text-green-400">{token.buyTransactions?.['1h'] || 0}</span>
                      <span className="text-gray-400">/</span>
                      <span className="text-red-400">{token.sellTransactions?.['1h'] || 0}</span>
                    </div>
                  </div>

                  {/* Token info */}
                  <div className="flex flex-col justify-center pl-12 pr-4">
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
                </div>
              )) : (
                <div className="px-4 py-8 text-center text-gray-400">
                  <div className="text-sm">Loading trending tokens...</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


