import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  RefreshCw,
  Eye,
  Zap
} from "lucide-react"

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

export function NewTokensSection() {
  const [tokens, setTokens] = useState<LiveToken[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [liveStream, setLiveStream] = useState<LiveToken[]>([])
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [useSSE, setUseSSE] = useState(false)
  const [sseConnected, setSseConnected] = useState(false)

  useEffect(() => {
    const fetchNewTokens = async () => {
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
            setLiveStream(prev => [...freshTokens, ...prev].slice(0, 25)) // Keep last 20 new tokens
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

    // Poll every 2 seconds for real-time token discovery
    const interval = setInterval(fetchNewTokens, 2000)

    return () => clearInterval(interval)
  }, [])

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
          <p className="text-xs text-gray-600">Connected to Moralis API</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Live Stream Banner */}
          {liveStream.length > 0 && (
            <div className="bg-gradient-to-r from-red-900/20 to-orange-900/20 border border-red-500/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-red-400 font-medium">
                    🔥 {liveStream.length} NEW TOKENS DISCOVERED
                  </span>
                  <span className="text-xs text-gray-400">
                    Last: {lastUpdate.toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-xs text-gray-500">
                    Polling: 2 seconds
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Live Stream Component */}
          {liveStream.length > 0 && (
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-red-400">LIVE STREAM</span>
                <span className="text-xs text-gray-500">New tokens as they launch</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-32 overflow-y-auto">
                {liveStream.slice(0, 6).map((token, index) => (
                  <div key={`${token.tokenAddress}-${index}`} className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-xs font-bold">
                        {token.symbol.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white text-sm truncate">{token.symbol}</div>
                        <div className="text-xs text-gray-400 truncate">{token.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-green-400">${formatNumber(parseFloat(token.priceUsd) || 0)}</div>
                        <div className="text-xs text-gray-500">{formatTimeAgo(getTimeAgo(token.createdAt))}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="bg-black border border-gray-800 rounded-lg overflow-hidden">
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
            <div className="max-h-[60vh] overflow-y-auto">
              <div className="divide-y divide-gray-800">
                {tokens.slice(0, 10).map((token) => (
                  <div key={token.tokenAddress} className="grid grid-cols-7 gap-4 px-4 py-3 hover:bg-gray-900/50 transition-colors">
                    {/* Pair info */}
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center">
                          {token.logo ? (
                            <img 
                              src={token.logo} 
                              alt={token.symbol}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                                target.nextElementSibling?.classList.remove('hidden')
                              }}
                            />
                          ) : null}
                          <div className={`w-full h-full bg-gray-600 flex items-center justify-center text-white text-sm font-bold ${token.logo ? 'hidden' : ''}`}>
                            {token.symbol.charAt(0)}
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
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-xs text-white">R</span>
                            </div>
                            <Eye className="w-3 h-3 text-gray-400" />
                          </div>
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
                      <div className="text-white font-medium text-sm">
                        {formatTimeAgo(getTimeAgo(token.createdAt))}
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white">P</span>
                          </div>
                          <span className="text-white">{token.holders || 0}%</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white">P</span>
                          </div>
                          <span className="text-white">{formatTimeAgo(getTimeAgo(token.createdAt))}%</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white">M</span>
                          </div>
                          <span className="text-white">0</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white">S</span>
                          </div>
                          <span className="text-white">0</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-gray-500 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white">H</span>
                          </div>
                          <span className="text-white">{token.holders || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-gray-500 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white">W</span>
                          </div>
                          <span className="text-white">{formatTimeAgo(getTimeAgo(token.createdAt))}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action */}
                    <div className="flex items-center">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-xs"
                        onClick={() => handleBuy(token)}
                      >
                        Buy 5 SOL
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}




