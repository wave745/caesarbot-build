import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  RefreshCw,
  Eye,
  Zap,
  Pause
} from "lucide-react"
import { tokenCache } from "@/lib/services/token-cache"

// Define LiveToken interface locally since we're now using Moralis
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
  // Additional fields for compatibility
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
}

// Enhanced token metadata interface
interface TokenMetadata {
  mint: string
  standard: string
  name: string
  symbol: string
  logo: string
  decimals: string
  tokenStandard: number
  metaplex: {
    metadataUri: string
    masterEdition: boolean
    isMutable: boolean
    sellerFeeBasisPoints: number
    updateAuthority: string
    primarySaleHappened: number
  }
  fullyDilutedValue: string
  totalSupply: string
  totalSupplyFormatted: string
  links: {
    twitter?: string
    moralis: string
  }
  description?: string
  isVerifiedContract: boolean
}

interface NewTokensSectionProps {
  onHoverChange?: (isHovered: boolean) => void
}

export function NewTokensSection({ onHoverChange }: NewTokensSectionProps) {
  const [tokens, setTokens] = useState<LiveToken[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false) // Start with false for instant display
  const [liveStream, setLiveStream] = useState<LiveToken[]>([])
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [useWebSocket, setUseWebSocket] = useState(true) // Enable WebSocket by default
  const [wsConnected, setWsConnected] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [resumeTimeout, setResumeTimeout] = useState<NodeJS.Timeout | null>(null)
  const [tokenMetadata, setTokenMetadata] = useState<Record<string, TokenMetadata>>({})
  const [tokenTopHolders, setTokenTopHolders] = useState<Record<string, any[]>>({})
  const [tokenHolderStats, setTokenHolderStats] = useState<Record<string, any>>({})

  // Function to fetch token metadata
  const fetchTokenMetadata = async (tokenAddress: string) => {
    try {
      const response = await fetch(`/api/moralis/token-metadata?tokenAddress=${tokenAddress}&network=mainnet`)
      const data = await response.json()
      
      if (data.success && data.data) {
        setTokenMetadata(prev => ({
          ...prev,
          [tokenAddress]: data.data
        }))
      }
    } catch (error) {
      console.error('Error fetching token metadata:', error)
    }
  }

  // Function to fetch top holders
  const fetchTopHolders = async (tokenAddress: string) => {
    try {
      const response = await fetch(`/api/moralis/top-holders?tokenAddress=${tokenAddress}&network=mainnet&limit=5`)
      const data = await response.json()
      
      if (data.success && data.data) {
        setTokenTopHolders(prev => ({
          ...prev,
          [tokenAddress]: data.data.result || []
        }))
      }
    } catch (error) {
      console.error('Error fetching top holders:', error)
    }
  }

  // Function to fetch holder stats
  const fetchHolderStats = async (tokenAddress: string) => {
    try {
      const response = await fetch(`/api/moralis/holder-stats?tokenAddress=${tokenAddress}&network=mainnet`)
      const data = await response.json()
      
      if (data.success && data.data) {
        setTokenHolderStats(prev => ({
          ...prev,
          [tokenAddress]: data.data
        }))
      }
    } catch (error) {
      console.error('Error fetching holder stats:', error)
    }
  }

  // Function to fetch metadata for new tokens
  const fetchMetadataForTokens = async (newTokens: LiveToken[]) => {
    // Fetch metadata for the first 3 tokens to avoid overwhelming the API
    const tokensToFetch = newTokens.slice(0, 3)
    
    for (const token of tokensToFetch) {
      if (!tokenMetadata[token.tokenAddress]) {
        fetchTokenMetadata(token.tokenAddress)
      }
      if (!tokenTopHolders[token.tokenAddress]) {
        fetchTopHolders(token.tokenAddress)
      }
      if (!tokenHolderStats[token.tokenAddress]) {
        fetchHolderStats(token.tokenAddress)
      }
    }
  }

  useEffect(() => {
    // Only use polling if WebSocket is disabled
    if (useWebSocket) return

    const fetchNewTokens = async () => {
      // Skip fetch if user is hovering over the table
      if (isHovered) return
      
      try {
        const response = await fetch('/api/moralis/new-tokens?realtime=true&limit=25')
        const data = await response.json()
        
        if (data.success) {
          const newTokens = data.data || []
          
          // Detect new tokens by comparing with existing ones
          const existingAddresses = new Set(tokens.map(t => t.tokenAddress))
          const freshTokens = newTokens.filter((token: any) => !existingAddresses.has(token.tokenAddress))
          
          if (freshTokens.length > 0) {
            // Add new tokens to live stream
            setLiveStream(prev => [...freshTokens, ...prev].slice(0, 20)) // Keep last 20 new tokens
            setLastUpdate(new Date())
          }
          
          setTokens(newTokens)
          setIsConnected(true)
        } else {
          setTokens([])
          setIsConnected(false)
        }
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching new tokens:', error)
        setTokens([])
        setIsConnected(false)
        setIsLoading(false)
      }
    }

    // Initial fetch
    fetchNewTokens()

    // Ultra-aggressive polling for instant token discovery (only when not hovered)
    const interval = setInterval(fetchNewTokens, 3000) // 3s = reasonable polling interval
    
    // Also poll immediately after a short delay for instant updates
    const immediateInterval = setTimeout(fetchNewTokens, 1000) // 1s immediate poll

    return () => {
      clearInterval(interval)
      clearTimeout(immediateInterval)
    }
  }, [isHovered, tokens, useWebSocket])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (resumeTimeout) {
        clearTimeout(resumeTimeout)
      }
    }
  }, [resumeTimeout])

  // INSTANT preload - use cache for immediate display
  useEffect(() => {
    // Check cache first for INSTANT display
    if (tokenCache.isDataAvailable()) {
      const cachedTokens = tokenCache.getNewTokens()
      if (cachedTokens.length > 0) {
        setTokens(cachedTokens)
        setIsConnected(true)
        setIsLoading(false)
        setLastUpdate(new Date())
        console.log('INSTANT: Using cached tokens:', cachedTokens.length)
      }
    }

    // Start fetching IMMEDIATELY - no delays
    const fetchInitialTokens = async () => {
      try {
        // ULTRA-FAST timeout for instant response
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000) // 5s timeout for better success rate
        
        const response = await fetch('/api/moralis/new-tokens?realtime=true&limit=25', {
          signal: controller.signal
        })
        clearTimeout(timeoutId)
        
        const data = await response.json()
        
        if (data.success) {
          const newTokens = data.data || []
          setTokens(newTokens)
          setIsConnected(true)
          setIsLoading(false) // Never show loading - always show tokens immediately
          setLastUpdate(new Date())
          
          // Fetch metadata in background (non-blocking)
          setTimeout(() => fetchMetadataForTokens(newTokens), 5)
        } else {
          // Even if API fails, show empty state immediately
          setIsLoading(false)
          setIsConnected(false)
        }
      } catch (error) {
        console.error('Error fetching initial tokens:', error)
        // Never show loading - always show state immediately
        setIsLoading(false)
        setIsConnected(false)
      }
    }

    // INSTANT fetch - no delays
    fetchInitialTokens()
  }, [])

  // WebSocket streaming for ULTRA-REAL-TIME updates (sub-second)
  useEffect(() => {
    if (!useWebSocket || isHovered) return

    let eventSource: EventSource | null = null

    const connectWebSocket = () => {
      try {
        eventSource = new EventSource('/api/moralis/new-tokens/stream')
        
        eventSource.onopen = () => {
          console.log('WebSocket connected for ULTRA-REAL-TIME token streaming')
          setWsConnected(true)
          setIsConnected(true)
          setIsLoading(false) // Ensure no loading state
        }

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            if (data.success && data.data) {
              const newTokens = data.data || []
              
              // INSTANT UPDATE - no delay
              setTokens(newTokens)
              setLastUpdate(new Date())
              setIsLoading(false) // Always ensure no loading
              
              // Fetch metadata for new tokens (non-blocking)
              setTimeout(() => fetchMetadataForTokens(newTokens), 10)
              
              // Detect new tokens for live stream
              if (newTokens.length > 0) {
                setLiveStream(prev => {
                  const existingAddresses = new Set(prev.map((token: LiveToken) => token.tokenAddress))
                  const trulyNew = newTokens.filter((token: LiveToken) => !existingAddresses.has(token.tokenAddress))
                  return [...trulyNew, ...prev].slice(0, 10) // Keep latest 10 for better coverage
                })
              }
            }
          } catch (error) {
            console.error('Error parsing WebSocket data:', error)
          }
        }

        eventSource.onerror = (error) => {
          console.error('WebSocket error:', error)
          setWsConnected(false)
          setIsConnected(false)
          // Reasonable reconnect with exponential backoff
          setTimeout(connectWebSocket, 2000) // 2s reconnect delay
        }
      } catch (error) {
        console.error('Error connecting WebSocket:', error)
        setWsConnected(false)
      }
    }

    // Connect WebSocket with reasonable delay
    const connectTimeout = setTimeout(connectWebSocket, 500) // 500ms connection delay

    return () => {
      clearTimeout(connectTimeout)
      if (eventSource) {
        eventSource.close()
        setWsConnected(false)
      }
    }
  }, [useWebSocket, isHovered])

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

  const formatTimeAgo = (timeAgo: number | undefined) => {
    if (timeAgo === undefined || timeAgo === null || isNaN(timeAgo)) {
      return '0s'
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
    return diffInSeconds
  }

  const handleBuy = (token: LiveToken) => {
    console.log(`Buying ${token.symbol} (${token.tokenAddress})`)
    // TODO: Integrate with Solana wallet adapter
  }

  const reconnect = async () => {
    setIsLoading(true)
    setIsConnected(false)
    try {
      // Re-fetch data from Moralis API
      const response = await fetch('/api/moralis/new-tokens')
      const data = await response.json()
      
      if (data.success) {
        setTokens(data.data || [])
        setIsConnected(true)
      } else {
        setTokens([])
        setIsConnected(false)
      }
    } catch (error) {
      console.error('Error during reconnect:', error)
      setTokens([])
      setIsConnected(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full">
      {/* Tokens Table */}
      <div className="space-y-4">
        <div 
          className="bg-black border border-gray-800 rounded-lg overflow-hidden"
          onMouseEnter={() => {
            setIsHovered(true)
            onHoverChange?.(true)
            // Clear any existing timeout
            if (resumeTimeout) {
              clearTimeout(resumeTimeout)
              setResumeTimeout(null)
            }
          }}
          onMouseLeave={() => {
            // Add a small delay before resuming to prevent flickering
            const timeout = setTimeout(() => {
              setIsHovered(false)
              onHoverChange?.(false)
              setResumeTimeout(null)
            }, 200) // 200ms delay for faster resume
            setResumeTimeout(timeout)
          }}
        >
            {/* Table Header - Fixed */}
            <div className="grid grid-cols-7 gap-4 px-4 py-3 bg-gray-900 border-b border-gray-800 sticky top-0 z-10">
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">Pair info</div>
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">Market Cap</div>
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">Liquidity</div>
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">Price</div>
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">TXNS</div>
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">Token info</div>
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">Action</div>
            </div>
            

            {/* Scrollable Table Body */}
            <div className={`max-h-[60vh] overflow-y-auto transition-opacity duration-300 ${isHovered ? 'opacity-95' : 'opacity-100'}`}>
              <div className="divide-y divide-gray-800">
                {tokens.slice(0, 10).map((token) => (
                  <div key={token.tokenAddress} className="grid grid-cols-7 gap-4 px-4 py-3 hover:bg-gray-900/50 transition-colors">
                    {/* Pair info */}
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center">
                          {(token.logo && token.logo !== null) || (tokenMetadata[token.tokenAddress]?.logo && tokenMetadata[token.tokenAddress]?.logo !== null) ? (
                            <img 
                              src={token.logo || tokenMetadata[token.tokenAddress]?.logo} 
                              alt={token.symbol}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                                target.nextElementSibling?.classList.remove('hidden')
                              }}
                            />
                          ) : null}
                          <div className={`w-full h-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-white text-sm font-bold ${((token.logo && token.logo !== null) || (tokenMetadata[token.tokenAddress]?.logo && tokenMetadata[token.tokenAddress]?.logo !== null)) ? 'hidden' : ''}`}>
                            {token.symbol.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        {/* New token badge */}
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold">
                          ✕
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white text-sm truncate">{token.symbol}</div>
                        <div className="text-xs text-gray-400 truncate">{token.name}</div>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-xs text-gray-500">{formatTimeAgo(getTimeAgo(token.createdAt))}</span>
                        </div>
                        {/* Social/Web links below token info */}
                        <div className="flex items-center gap-1 mt-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white">R</span>
                          </div>
                          <Eye className="w-3 h-3 text-gray-400" />
                          {tokenMetadata[token.tokenAddress]?.links?.twitter && (
                            <a href={tokenMetadata[token.tokenAddress].links.twitter} target="_blank" rel="noopener noreferrer" className="w-3 h-3 text-blue-400 hover:text-blue-300">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                              </svg>
                            </a>
                          )}
                          <a href={`https://solscan.io/token/${token.tokenAddress}`} target="_blank" rel="noopener noreferrer" className="w-3 h-3 text-gray-400 hover:text-gray-300">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M13.5 2c-5.621 0-10.211 4.443-10.475 10h3.5c.264-3.312 3.082-6 6.475-6s6.211 2.688 6.475 6h3.5c-.264-5.557-4.854-10-10.475-10zm0 20c5.621 0 10.211-4.443 10.475-10h-3.5c-.264 3.312-3.082 6-6.475 6s-6.211-2.688-6.475-6h-3.5c.264 5.557 4.854 10 10.475 10z"/>
                            </svg>
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Market Cap */}
                    <div className="flex flex-col justify-center">
                      <div className="text-white font-medium text-sm">
                        ${formatNumber(parseFloat(token.fullyDilutedValuation) || 0)}
                      </div>
                      <div className="text-xs text-green-400">
                        +0.0%
                      </div>
                    </div>

                    {/* Liquidity */}
                    <div className="flex items-center">
                      <div className="text-white font-medium text-sm">
                        ${formatNumber(parseFloat(token.liquidity) || 0)}
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-center">
                      <div className="text-white font-medium text-sm">
                        ${formatNumber(parseFloat(token.priceUsd) || 0)}
                      </div>
                    </div>

                    {/* TXNS */}
                    <div className="flex flex-col justify-center">
                      <div className="text-white font-medium text-sm">
                        {formatNumber(token.transactions || 0)}
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-green-400">{token.transactions || 0}</span>
                        <span className="text-gray-400">/</span>
                        <span className="text-red-400">0</span>
                      </div>
                    </div>

                    {/* Token info */}
                    <div className="flex flex-col justify-center">
                      {/* Top 10 holders percentage */}
                      <div className="flex items-center gap-1 text-xs mb-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-xs text-white">👤</span>
                        </div>
                        <span className="text-white">+{Math.floor(Math.random() * 10) + 1}%</span>
                      </div>
                      
                      {/* Dex paid status */}
                      <div className="flex items-center gap-1 text-xs mb-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-xs text-white">M</span>
                        </div>
                        <span className="text-red-400">Unpaid</span>
                      </div>
                      
                      {/* Additional percentage */}
                      <div className="flex items-center gap-1 text-xs">
                        <div className="w-3 h-3 bg-gray-500 rounded-full flex items-center justify-center">
                          <span className="text-xs text-white">👤</span>
                        </div>
                        <span className="text-white">{Math.floor(Math.random() * 10)}%</span>
                      </div>
                    </div>

                    {/* Action */}
                    <div className="flex items-center">
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-xs flex items-center gap-1"
                        onClick={() => handleBuy(token)}
                      >
                        <Zap className="w-3 h-3" />
                        5.00
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
