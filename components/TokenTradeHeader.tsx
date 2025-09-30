"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { 
  Star, 
  AlertCircle, 
  Users, 
  Edit, 
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
  Share,
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
  }
}

export function TokenTradeHeader({ token }: TokenTradeHeaderProps) {
  const [isFavorited, setIsFavorited] = useState(token.isFavorited || false)

  const handleFavorite = () => {
    setIsFavorited(!isFavorited)
  }

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text)
    // Optionally, add a toast notification here
  }, [])

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
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center border border-green-400">
                <span className="text-white font-bold text-lg">{token.symbol}</span>
              </div>
              
              {/* Community Pill */}
              <div className="absolute -bottom-1 -right-1 w-5 h-2.5 bg-green-500 rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              </div>
            </div>

            {/* Token Name and Community */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-white">{token.symbol}</h1>
                <span className="text-lg text-gray-300">{token.name}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-400">
                {token.community && (
                  <>
                    <span>{token.community.split(' ')[0]}</span> {/* Age */}
                    <button
                      onClick={() => handleCopy(token.fullContractAddress)}
                      className="p-0 hover:bg-zinc-800 rounded transition-colors text-white cursor-pointer"
                    >
                      {token.community.split(' ').slice(1).join(' ')} {/* Shortened address */}
                    </button>
                    <button
                      onClick={() => handleCopy(token.fullContractAddress)}
                      className="p-1 hover:bg-zinc-800 rounded transition-colors"
                    >
                      <Copy className="w-3 h-3 text-gray-400" />
                    </button>
                  </>
                )}
                <div className="flex items-center gap-1 text-blue-400">
                  <Users className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-2 ml-4">
            <div className="flex flex-col gap-2">
              <div className="flex gap-1">
                <button className="p-1.5 hover:bg-zinc-800 rounded transition-colors">
                  <Edit className="w-3.5 h-3.5 text-gray-400" />
                </button>
                <button className="p-1.5 hover:bg-zinc-800 rounded transition-colors">
                  <Copy className="w-3.5 h-3.5 text-gray-400" />
                </button>
                <button className="p-1.5 hover:bg-zinc-800 rounded transition-colors">
                  <Share className="w-3.5 h-3.5 text-gray-400" />
                </button>
              </div>
              
              {/* Action Icons - Row 2 with Community Stats */}
              <div className="flex gap-1 items-center">
                <button className="p-1.5 hover:bg-zinc-800 rounded transition-colors">
                  <Globe className="w-3.5 h-3.5 text-gray-400" />
                </button>
                <button className="p-1.5 hover:bg-zinc-800 rounded transition-colors">
                  <Send className="w-3.5 h-3.5 text-gray-400" />
                </button>
                <button className="p-1.5 hover:bg-zinc-800 rounded transition-colors">
                  <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
                </button>
                
                {/* Community Stats inline */}
                <div className="flex items-center gap-2 text-sm ml-2">
                  <Search className="w-3.5 h-3.5 text-gray-400" />
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">DS</span>
                  </div>
                  <Crown className="w-3.5 h-3.5 text-yellow-400" />
                  <span className="text-white font-medium">1</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Section - Market Cap */}
        <div className="flex flex-col items-center">
          <div className="text-2xl font-bold text-white">{token.marketCap}</div>
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
              <div className="text-white font-medium">{token.liquidity}</div>
            </div>
            
            <div className="text-center">
              <div className="text-gray-400 mb-1">24h Vol</div>
              <div className="text-white font-medium">{token.volume24h}</div>
            </div>
            
            <div className="text-center">
              <div className="text-gray-400 mb-1">Total Fees</div>
              <div className="flex items-center justify-center gap-1">
                <img 
                  src="/sol-logo.png" 
                  alt="Solana" 
                  className="w-3 h-3"
                />
                <span className="text-white font-medium">{token.totalFees}</span>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-gray-400 mb-1">Supply</div>
              <div className="text-white font-medium">{token.supply}</div>
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

