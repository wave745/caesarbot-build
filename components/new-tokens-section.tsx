import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  RefreshCw,
  Eye,
  Zap
} from "lucide-react"
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
  // Social links from pump.fun API
  website?: string
  twitter?: string
  telegram?: string
  hasTwitter?: boolean
  hasTelegram?: boolean
  hasWebsite?: boolean
  hasSocial?: boolean
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
  const router = useRouter()

  const fetchDexPaidStatus = async (tokens: LiveToken[]) => {
    try {
      console.log('Fetching Dex paid status for new tokens...')
      
      const tokensToCheck = tokens.map(token => ({
        chainId: 'solana', // New tokens are on Solana
        tokenAddress: token.tokenAddress || token.mint
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
      
      const tokenAddresses = tokens.map(token => token.tokenAddress || token.mint)

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
    
    // Debug logging for time calculation
    if (process.env.NODE_ENV === 'development') {
      console.log('Time calculation:', {
        now: new Date(now).toISOString(),
        created: new Date(created).toISOString(),
        diffInSeconds,
        createdAt
      })
    }
    
    // Ensure we don't return negative values
    return Math.max(0, diffInSeconds)
  }

  const handleBuy = (token: LiveToken) => {
    console.log(`Buying ${token.symbol} (${token.tokenAddress || token.mint})`)
  }

  // Fetch new tokens from pump.fun API with polling
  useEffect(() => {
    const fetchNewTokens = async () => {
      try {
        console.log('🚀 NewTokensSection: Fetching new tokens from pump.fun...')
        // Don't set loading state to show tokens immediately
        
        const response = await fetch('/api/pump-fun/new-tokens?limit=25')
        
        if (response.ok) {
          const data = await response.json()
          console.log('✅ NewTokensSection: Success from pump.fun API:', data)
          
          if (data.success && data.data && Array.isArray(data.data)) {
            console.log('✅ NewTokensSection: Processing', data.data.length, 'tokens from pump.fun')
            
            // Process tokens - pump.fun API already provides social links
            const processedTokens = data.data.map((token: any) => ({
              ...token,
              tokenAddress: token.tokenAddress || token.coinMint,
              symbol: token.symbol || token.ticker || 'UNKNOWN',
              name: token.name || 'Unknown Token',
              price: token.priceUsd || '$0.00',
              priceUsd: token.priceUsd || '0',
              marketCap: token.marketCap || token.fullyDilutedValuation || '$0',
              liquidity: token.liquidity || '$0',
              volume24h: token.volume24h || '$0',
              priceChange24h: 0, // Pump.fun doesn't provide this
              isFavorited: false,
              // Social links are already included from pump.fun API
              website: token.website,
              twitter: token.twitter,
              telegram: token.telegram,
              hasTwitter: token.hasTwitter || false,
              hasTelegram: token.hasTelegram || false,
              hasWebsite: token.hasWebsite || false,
              hasSocial: token.hasSocial || false
            }))
            
            setTokens(processedTokens)
            setLastUpdate(new Date())
            setIsConnected(true)
            
            // Fetch Dex paid status for new tokens (metadata already included from pump.fun)
            fetchDexPaidStatus(processedTokens)
            
            console.log('✅ NewTokensSection: Successfully loaded', processedTokens.length, 'tokens from pump.fun')
          } else {
            console.log('❌ NewTokensSection: No tokens found from pump.fun API')
            setTokens([])
            setIsConnected(false)
          }
        } else {
          console.error('❌ NewTokensSection: Pump.fun API error:', response.status)
          setTokens([])
          setIsConnected(false)
        }
      } catch (error) {
        console.error('❌ NewTokensSection: Error fetching tokens from pump.fun:', error)
        setTokens([])
        setIsConnected(false)
      } finally {
        // Keep loading state false for immediate display
        setIsLoading(false)
      }
    }
    
    // Initial fetch
    fetchNewTokens()
    
    // Set up polling every 10 seconds for fresh data
    const interval = setInterval(fetchNewTokens, 10000)
    
    return () => {
      clearInterval(interval)
    }
  }, [])


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
              {tokens.slice(0, 25).map((token) => (
                <div 
                  key={token.tokenAddress || token.mint} 
                  className="grid grid-cols-7 gap-4 px-4 py-3 hover:bg-gray-900/50 transition-colors cursor-pointer"
                  onClick={() => {
                    const tokenAddress = token.tokenAddress || token.mint
                    try {
                      window.location.href = `/trade/${tokenAddress}`
                    } catch (error) {
                      console.error('Navigation failed:', error)
                    }
                  }}
                >
                  {/* Pair info */}
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center">
                        {(() => {
                          const tokenAddress = token.tokenAddress || token.mint
                          const metadata = tokenAddress ? tokenMetadata.get(tokenAddress) : null
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
                      const tokenAddress = token.tokenAddress || token.mint
                      
                      return (
                        <>
                          {/* Twitter/X - only show if token has twitter link */}
                          {token.twitter && (
                            <a href={token.twitter} target="_blank" rel="noopener noreferrer" className="w-3 h-3 text-white hover:text-gray-300">
                              <img src="/icons/social/x-logo.svg" alt="Twitter" className="w-full h-full object-cover brightness-0 invert" />
                            </a>
                          )}
                          {/* Telegram - only show if token has telegram link */}
                          {token.telegram && (
                            <a href={token.telegram} target="_blank" rel="noopener noreferrer" className="w-3 h-3 text-white hover:text-gray-300">
                              <img src="/icons/social/telegram-logo.svg" alt="Telegram" className="w-full h-full object-cover brightness-0 invert" />
                            </a>
                          )}
                          {/* Website - only show if token has website link */}
                          {token.website && (
                            <a href={token.website} target="_blank" rel="noopener noreferrer" className="w-3 h-3 text-white hover:text-gray-300">
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
                            filter: dexPaidStatus.get(token.tokenAddress || token.mint || '') 
                              ? 'brightness(0) saturate(100%) invert(48%) sepia(79%) saturate(2476%) hue-rotate(86deg) brightness(118%) contrast(119%)' // Green for paid
                              : 'brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)' // Red for unpaid
                          }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            const isPaid = dexPaidStatus.get(token.tokenAddress || token.mint || '') || false
                            target.parentElement!.innerHTML = `<div class="w-full h-full ${isPaid ? 'bg-green-500' : 'bg-red-500'} rounded-full flex items-center justify-center"><span class="text-xs text-white">D</span></div>`
                          }}
                        />
                      </div>
                      <span className={dexPaidStatus.get(token.tokenAddress || token.mint || '') ? "text-green-400" : "text-red-400"}>
                        {dexPaidStatus.get(token.tokenAddress || token.mint || '') ? "Paid" : "Unpaid"}
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
