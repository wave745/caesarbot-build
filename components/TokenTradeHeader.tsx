"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { 
  Star, 
  AlertCircle, 
  Link, 
  Zap, 
  MessageCircle, 
  Search, 
  Crown, 
  Globe, 
  Send, 
  ChevronLeft, 
  Settings,
  HelpCircle,
  Copy,
  MessageSquare
} from "lucide-react"

interface TokenTradeHeaderProps {
  token: {
    symbol: string
    name: string
    price: string
    marketCap: string
    liquidity: string
    volume24h: string
    totalFees: string
    supply: string
    taxes: string
    community?: string
    isFavorited?: boolean
    fullContractAddress: string
    priceChange24h?: number
    // Token metadata
    logo?: string
    website?: string
    twitter?: string
    telegram?: string
    discord?: string
    github?: string
    reddit?: string
    instagram?: string
    youtube?: string
    tiktok?: string
    twitch?: string
    facebook?: string
  }
  lastUpdate?: Date | null
}

export function TokenTradeHeader({ token, lastUpdate }: TokenTradeHeaderProps) {
  const [isFavorited, setIsFavorited] = useState(token.isFavorited || false)

  // Debug logging for token data (development only)
  if (process.env.NODE_ENV === 'development') {
    console.log('TokenTradeHeader received token data:', {
      symbol: token.symbol,
      name: token.name,
      fullContractAddress: token.fullContractAddress
    })
  }


  const handleFavorite = () => {
    setIsFavorited(!isFavorited)
  }

  const handleCopy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
    }
  }, [])

  // Utility function to format numbers with abbreviations
  const formatNumber = (value: string | number): string => {
    if (typeof value === 'string') {
      // Remove $ and other currency symbols for parsing
      const cleanValue = value.replace(/[$,]/g, '')
      const numValue = parseFloat(cleanValue)
      
      if (isNaN(numValue)) return value
      
      if (numValue >= 1e9) {
        return `$${(numValue / 1e9).toFixed(1)}B`
      } else if (numValue >= 1e6) {
        return `$${(numValue / 1e6).toFixed(1)}M`
      } else if (numValue >= 1e3) {
        return `$${(numValue / 1e3).toFixed(1)}K`
      } else {
        return value
      }
    }
    
    const numValue = typeof value === 'number' ? value : parseFloat(value.toString())
    
    if (isNaN(numValue)) return value.toString()
    
    if (numValue >= 1e9) {
      return `${(numValue / 1e9).toFixed(1)}B`
    } else if (numValue >= 1e6) {
      return `${(numValue / 1e6).toFixed(1)}M`
    } else if (numValue >= 1e3) {
      return `${(numValue / 1e3).toFixed(1)}K`
    } else {
      return numValue.toString()
    }
  }

  return (
    <div className="bg-[#0b0d0e] border-b border-zinc-800 p-4">
      <div className="flex items-center justify-start gap-8">
        {/* Left Section - Token Info */}
        <div className="flex items-center gap-4">
          {/* Favorite Star */}
          <button 
            onClick={handleFavorite}
            className="p-1 hover:bg-zinc-800 rounded-full transition-colors"
          >
            <Star 
              className={`w-5 h-5 ${isFavorited ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}`} 
            />
          </button>

          {/* Token Icon and Info */}
          <div className="flex items-center gap-3">
            {/* Token Icon */}
            <div className="relative">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-700 flex items-center justify-center">
                {token.logo ? (
                  <img 
                    src={token.logo} 
                    alt={token.symbol}
                    className="w-full h-full object-cover"
                    onLoad={() => console.log('✅ Token image loaded successfully:', token.logo)}
                    onError={(e) => {
                      console.log('❌ Token image failed to load:', token.logo, e)
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      target.nextElementSibling?.classList.remove('hidden')
                    }}
                  />
                ) : null}
                <div className={`w-full h-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-black font-bold text-lg ${token.logo ? 'hidden' : ''}`}>
                  {token.symbol.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>

          {/* Token Name and Community */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-white">{token.symbol}</h1>
              <span className="text-lg text-gray-300">{token.name}</span>
            </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-400">
                {/* Always show shortened contract address */}
                <button
                  onClick={() => handleCopy(token.fullContractAddress)}
                  className="p-0 hover:bg-zinc-800 rounded transition-colors text-white cursor-pointer"
                >
                  {token.fullContractAddress.slice(0, 4)}...{token.fullContractAddress.slice(-4)}
                </button>
                <button
                  onClick={() => handleCopy(token.fullContractAddress)}
                  className="p-1 hover:bg-zinc-800 rounded transition-colors"
                >
                  <Copy className="w-3 h-3 text-gray-400" />
                </button>
                <button 
                  onClick={() => handleCopy(window.location.href)}
                  className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <Link className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-2 ml-4">
            <div className="flex flex-col gap-2">
              <div className="flex gap-1">
                <button className="p-1.5 hover:bg-zinc-800 rounded transition-colors">
                  <img 
                    src="/icons/ui/top10H-icon.svg" 
                    alt="Top 10 Holders" 
                    className="w-4 h-4"
                  />
                </button>
                <button className="p-1.5 hover:bg-zinc-800 rounded transition-colors">
                  <img 
                    src="/icons/platforms/dexscreener-logo.svg" 
                    alt="DexScreener" 
                    className="w-4 h-4"
                  />
                </button>
                <button className="p-1.5 hover:bg-zinc-800 rounded transition-colors">
                  <Crown className="w-4 h-4 text-yellow-400" />
                </button>
              </div>
              
              {/* Token Metadata Icons - Dynamic Social Links */}
              <div className="flex gap-1 items-center">
                {token.website && (
                  <button 
                    className="p-1.5 hover:bg-zinc-800 rounded transition-colors"
                    title="Website"
                    onClick={() => window.open(token.website, '_blank')}
                  >
                    <Globe className="w-4 h-4 text-white" />
                  </button>
                )}
                {token.twitter && (
                  <button 
                    className="p-1.5 hover:bg-zinc-800 rounded transition-colors"
                    title="Twitter/X"
                    onClick={() => window.open(token.twitter, '_blank')}
                  >
                    <img 
                      src="/icons/social/x-logo.svg" 
                      alt="Twitter/X" 
                      className="w-4 h-4 brightness-0 invert"
                    />
                  </button>
                )}
                {token.telegram && (
                  <button 
                    className="p-1.5 hover:bg-zinc-800 rounded transition-colors"
                    title="Telegram"
                    onClick={() => window.open(token.telegram, '_blank')}
                  >
                    <img 
                      src="/icons/social/telegram-logo.svg" 
                      alt="Telegram" 
                      className="w-4 h-4 brightness-0 invert"
                    />
                  </button>
                )}
                {token.discord && (
                  <button 
                    className="p-1.5 hover:bg-zinc-800 rounded transition-colors"
                    title="Discord"
                    onClick={() => window.open(token.discord, '_blank')}
                  >
                    <MessageSquare className="w-4 h-4 text-white" />
                  </button>
                )}
                {token.github && (
                  <button 
                    className="p-1.5 hover:bg-zinc-800 rounded transition-colors"
                    title="GitHub"
                    onClick={() => window.open(token.github, '_blank')}
                  >
                    <img 
                      src="/icons/social/github-logo.svg" 
                      alt="GitHub" 
                      className="w-4 h-4 brightness-0 invert"
                    />
                  </button>
                )}
                {token.reddit && (
                  <button 
                    className="p-1.5 hover:bg-zinc-800 rounded transition-colors"
                    title="Reddit"
                    onClick={() => window.open(token.reddit, '_blank')}
                  >
                    <img 
                      src="/icons/social/reddit-icon.svg" 
                      alt="Reddit" 
                      className="w-4 h-4 brightness-0 invert"
                    />
                  </button>
                )}
                {token.instagram && (
                  <button 
                    className="p-1.5 hover:bg-zinc-800 rounded transition-colors"
                    title="Instagram"
                    onClick={() => window.open(token.instagram, '_blank')}
                  >
                    <img 
                      src="/icons/social/instagram-logo.svg" 
                      alt="Instagram" 
                      className="w-4 h-4 brightness-0 invert"
                    />
                  </button>
                )}
                {token.youtube && (
                  <button 
                    className="p-1.5 hover:bg-zinc-800 rounded transition-colors"
                    title="YouTube"
                    onClick={() => window.open(token.youtube, '_blank')}
                  >
                    <img 
                      src="/icons/social/youtube-icon.svg" 
                      alt="YouTube" 
                      className="w-4 h-4 brightness-0 invert"
                    />
                  </button>
                )}
                {token.tiktok && (
                  <button 
                    className="p-1.5 hover:bg-zinc-800 rounded transition-colors"
                    title="TikTok"
                    onClick={() => window.open(token.tiktok, '_blank')}
                  >
                    <img 
                      src="/icons/social/tiktok-icon.svg" 
                      alt="TikTok" 
                      className="w-4 h-4 brightness-0 invert"
                    />
                  </button>
                )}
                {token.twitch && (
                  <button 
                    className="p-1.5 hover:bg-zinc-800 rounded transition-colors"
                    title="Twitch"
                    onClick={() => window.open(token.twitch, '_blank')}
                  >
                    <img 
                      src="/icons/social/twitch-logo.svg" 
                      alt="Twitch" 
                      className="w-4 h-4 brightness-0 invert"
                    />
                  </button>
                )}
                {token.facebook && (
                  <button 
                    className="p-1.5 hover:bg-zinc-800 rounded transition-colors"
                    title="Facebook"
                    onClick={() => window.open(token.facebook, '_blank')}
                  >
                    <img 
                      src="/icons/social/facebook-logo.svg" 
                      alt="Facebook" 
                      className="w-4 h-4 brightness-0 invert"
                    />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Middle Section - Market Cap */}
        <div className="flex flex-col items-center">
          <div className="text-2xl font-bold text-white">{formatNumber(token.marketCap)}</div>
        </div>

        {/* Right Section - Trading Metrics */}
        <div className="flex items-center gap-4">
          {/* Trading Metrics Grid */}
          <div className="flex gap-4 text-xs">
            <div className="text-center">
              <div className="text-gray-400 mb-1">Price</div>
              <div className="text-white font-medium">{token.price}</div>
            </div>
            
            <div className="text-center">
              <div className="text-gray-400 mb-1">Liq</div>
              <div className="text-white font-medium">{formatNumber(token.liquidity)}</div>
            </div>
            
            <div className="text-center">
              <div className="text-gray-400 mb-1">24h Vol</div>
              <div className="text-white font-medium">{formatNumber(token.volume24h)}</div>
            </div>
            
            <div className="text-center">
              <div className="text-gray-400 mb-1">Total Fees</div>
              <div className="flex items-center justify-center gap-1">
                <img 
                  src="/sol-logo.png" 
                  alt="Solana" 
                  className="w-3 h-3"
                />
                <span className="text-white font-medium">{formatNumber(token.totalFees)}</span>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-gray-400 mb-1">Supply</div>
              <div className="text-white font-medium">{formatNumber(token.supply)}</div>
            </div>
            
            <div className="text-center">
              <div className="text-gray-400 mb-1">Taxes</div>
              <div className="flex items-center justify-center gap-1">
                <span className="text-white font-medium">{token.taxes}</span>
                <HelpCircle className="w-2.5 h-2.5 text-gray-400" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

