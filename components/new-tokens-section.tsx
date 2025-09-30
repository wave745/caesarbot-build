import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  RefreshCw,
  Eye,
  Zap
} from "lucide-react"
import { tokenCache } from "@/lib/services/token-cache"
import { useRouter } from "next/navigation"

// Define LiveToken interface for combined Pump.fun + BONK tokens
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
  // New fields for combined tokens
  source?: 'pumpfun' | 'bonk'
  platform?: 'Pump.fun' | 'BONK.fun'
}

interface NewTokensSectionProps {
  onHoverChange?: (isHovered: boolean) => void
}

export function NewTokensSection({ onHoverChange }: NewTokensSectionProps) {
  const [tokens, setTokens] = useState<LiveToken[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [dexPaidStatus, setDexPaidStatus] = useState<Map<string, boolean>>(new Map())
  const [tokenMetadata, setTokenMetadata] = useState<Map<string, any>>(new Map())
  const [eventSource, setEventSource] = useState<EventSource | null>(null)
  const router = useRouter()

  const fetchDexPaidStatus = async (tokens: LiveToken[]) => {
    try {
      console.log('Fetching Dex paid status for new tokens...')
      
      const tokensToCheck = tokens.map(token => ({
        chainId: 'solana', // New tokens are on Solana
        tokenAddress: token.tokenAddress || token.mint || token.address
      }))

      const response = await fetch('/api/dexscreener/check-paid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tokens: tokensToCheck })
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
      console.error('Error fetching Dex paid status for new tokens:', error)
    }
  }

  const fetchTokenMetadata = async (tokens: LiveToken[]) => {
    try {
      console.log('Fetching token metadata for new tokens...')
      
      const tokenAddresses = tokens.map(token => token.tokenAddress || token.mint || token.address)

      const response = await fetch('/api/moralis/token-metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tokenAddresses })
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
      }
    } catch (error) {
      console.error('Error fetching token metadata for new tokens:', error)
    }
  }

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
    console.log(`Buying ${token.symbol} (${token.tokenAddress || token.address || token.mint})`)
  }

  // Real-time streaming with EventSource
  useEffect(() => {
    console.log('🚀 NewTokensSection: Starting real-time token stream...')
    
    // Skip cache check - use SSE stream directly for instant updates
    console.log('📦 NewTokensSection: Skipping cache, using SSE stream for instant updates')
    
    // Create EventSource for real-time streaming
    const es = new EventSource('/api/live-tokens?limit=30')
    setEventSource(es)
    
    es.onopen = () => {
      console.log('✅ NewTokensSection: EventSource connected')
      setIsConnected(true)
      setIsLoading(false)
    }
    
    es.onmessage = (event) => {
      try {
        const parseStart = Date.now()
        console.log('📡 NewTokensSection: Received live update at', parseStart)
        
        const data = JSON.parse(event.data)
        const parseEnd = Date.now()
        console.log('📊 NewTokensSection: JSON parsed in', parseEnd - parseStart, 'ms')
        console.log('📡 NewTokensSection: Received live update:', data.data?.length || 0, 'tokens')
        
        if (data.success && data.data) {
          const setStateStart = Date.now()
          console.log('🔄 NewTokensSection: Setting tokens at', setStateStart)
          
          // Update tokens with live data
          setTokens(data.data)
          setLastUpdate(new Date())
          
          const setStateEnd = Date.now()
          console.log('✅ NewTokensSection: State updated in', setStateEnd - setStateStart, 'ms')
          console.log('⏱️ NewTokensSection: TOTAL TIME from message to state:', setStateEnd - parseStart, 'ms')
          
          // Fetch Dex paid status and metadata for new tokens
          fetchDexPaidStatus(data.data)
          fetchTokenMetadata(data.data)
          
          // Skip cache - we're using SSE for instant updates
        } else {
          console.error('❌ NewTokensSection: Live stream error:', data.error)
        }
      } catch (error) {
        console.error('❌ NewTokensSection: Error parsing live data:', error)
      }
    }
    
    es.onerror = (error) => {
      console.error('❌ NewTokensSection: EventSource error:', error)
      setIsConnected(false)
      setIsLoading(false)
    }
    
    // Cleanup on unmount
    return () => {
      console.log('🧹 NewTokensSection: Cleaning up EventSource')
      es.close()
    }
  }, [])

  // Cleanup EventSource on unmount
  useEffect(() => {
    return () => {
      if (eventSource) {
        console.log('🧹 NewTokensSection: Cleaning up EventSource on unmount')
        eventSource.close()
      }
    }
  }, [eventSource])

  return (
    <div className="w-full">
      {/* Tokens Table */}
      <div className="space-y-4">
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
                <div 
                  key={token.tokenAddress || token.address || token.mint} 
                  className="grid grid-cols-7 gap-4 px-4 py-3 hover:bg-gray-900/50 transition-colors cursor-pointer"
                  onClick={() => {
                    console.log('Clicking new token:', token.tokenAddress || token.address || token.mint)
                    router.push(`/trade/${token.tokenAddress || token.address || token.mint}`)
                  }}
                >
                  {/* Pair info */}
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center">
                        {(() => {
                          const tokenAddress = token.tokenAddress || token.address || token.mint
                          const metadata = tokenMetadata.get(tokenAddress)
                          const logoUrl = metadata?.logo || token.logo
                          
                          return logoUrl ? (
                            <img 
                              src={logoUrl} 
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
                          )
                        })()}
                      </div>
                      {/* Platform logo badge */}
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full overflow-hidden border border-white/20">
                        {token.source === 'pumpfun' ? (
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
                        ) : token.source === 'bonk' ? (
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
                        ) : (
                          <div className="w-full h-full bg-green-500 rounded-full"></div>
                        )}
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
                    {(() => {
                      const tokenAddress = token.tokenAddress || token.address || token.mint
                      const metadata = tokenMetadata.get(tokenAddress)
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
                          <a href={`https://solscan.io/token/${tokenAddress}`} target="_blank" rel="noopener noreferrer" className="w-3 h-3 text-white hover:text-gray-300">
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
                            filter: dexPaidStatus.get(token.tokenAddress || token.address || token.mint) 
                              ? 'brightness(0) saturate(100%) invert(48%) sepia(79%) saturate(2476%) hue-rotate(86deg) brightness(118%) contrast(119%)' // Green for paid
                              : 'brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)' // Red for unpaid
                          }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            const isPaid = dexPaidStatus.get(token.tokenAddress || token.address || token.mint) || false
                            target.parentElement!.innerHTML = `<div class="w-full h-full ${isPaid ? 'bg-green-500' : 'bg-red-500'} rounded-full flex items-center justify-center"><span class="text-xs text-white">D</span></div>`
                          }}
                        />
                      </div>
                      <span className={dexPaidStatus.get(token.tokenAddress || token.address || token.mint) ? "text-green-400" : "text-red-400"}>
                        {dexPaidStatus.get(token.tokenAddress || token.address || token.mint) ? "Paid" : "Unpaid"}
                      </span>
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
  )
}
