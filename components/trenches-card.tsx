"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { 
  ExternalLink, 
  Search, 
  Activity, 
  Star,
  Square,
  Zap,
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingCart,
  DollarSign
} from "lucide-react"

interface TrenchesToken {
  id: string
  symbol: string
  name: string
  image: string
  marketCap: number
  volume: number
  fees: string
  holders: number
  age: string
  address: string
  social?: string
  status: 'live' | 'dead' | 'migrated'
  engagementIndicators: Array<{
    value: string
    color: string
    icon?: string
  }>
}

interface TrenchesCardProps {
  token: TrenchesToken
  isHovered?: boolean
}

export function TrenchesCard({ token, isHovered = false }: TrenchesCardProps) {
  const [isGlowing, setIsGlowing] = useState(false)

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'border-green-400'
      case 'dead': return 'border-red-400'
      case 'migrated': return 'border-blue-400'
      default: return 'border-gray-400'
    }
  }

  const getAgeColor = (age: string) => {
    if (age.includes('d')) return 'text-pink-400'
    if (age.includes('h')) return 'text-yellow-400'
    if (age.includes('m')) return 'text-green-400'
    return 'text-gray-400'
  }

  return (
    <Card 
      className={`
        bg-zinc-900/50 border border-zinc-800/60 hover:bg-zinc-800/50 
        transition-all duration-300 cursor-pointer group
        ${isGlowing ? 'shadow-lg shadow-green-500/20' : ''}
        ${isHovered ? 'scale-[1.02] shadow-xl' : ''}
      `}
      onMouseEnter={() => setIsGlowing(true)}
      onMouseLeave={() => setIsGlowing(false)}
    >
      <CardContent className="p-4">
        {/* Main Content Row */}
        <div className="flex items-start justify-between mb-3">
          {/* Left: Token Avatar + Info */}
          <div className="flex items-center space-x-3">
            {/* Token Avatar with Status Border */}
            <div className={`relative w-14 h-14 rounded-lg border-2 ${getStatusColor(token.status)} overflow-hidden`}>
              <img 
                src={token.image} 
                alt={token.name} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${token.symbol}&background=6366f1&color=fff&size=56`
                }}
              />
              {/* Status Overlay */}
              <div className="absolute bottom-1 right-1 w-3 h-3 bg-green-500 rounded-full border border-black flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              </div>
            </div>

            {/* Token Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-white text-sm">{token.symbol}</span>
                <span className="text-zinc-500 text-xs">{token.name}</span>
              </div>
              
              {/* Age and Icons */}
              <div className="flex items-center space-x-2 mb-2">
                <span className={`text-xs font-medium ${getAgeColor(token.age)}`}>
                  {token.age}
                </span>
                <ExternalLink className="w-3 h-3 text-zinc-500 hover:text-zinc-300 transition-colors" />
                <Search className="w-3 h-3 text-zinc-500 hover:text-zinc-300 transition-colors" />
              </div>

              {/* Engagement Metrics */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Users className="w-3 h-3 text-zinc-500" />
                  <span className="text-zinc-400 text-xs">{token.holders}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-3 h-3 text-zinc-500" />
                  <span className="text-zinc-400 text-xs">0</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Market Stats */}
          <div className="text-right space-y-1">
            <div className="flex justify-between text-xs min-w-[80px]">
              <span className="text-zinc-400">MC</span>
              <span className="text-yellow-400 font-medium">${formatNumber(token.marketCap)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-zinc-400">V</span>
              <span className="text-blue-400 font-medium">${formatNumber(token.volume)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-zinc-400">F</span>
              <span className="text-white font-medium flex items-center">
                <Square className="w-3 h-3 mr-1" />
                {token.fees}
              </span>
            </div>
          </div>
        </div>

        {/* Engagement Indicators Row */}
        <div className="flex flex-wrap gap-2 mb-3">
          {token.engagementIndicators.map((indicator, index) => (
            <div 
              key={index}
              className={`
                px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1
                ${indicator.color.includes('green') ? 'bg-green-900/30 text-green-400' : ''}
                ${indicator.color.includes('red') ? 'bg-red-900/30 text-red-400' : ''}
                ${indicator.color.includes('pink') ? 'bg-pink-900/30 text-pink-400' : ''}
                ${indicator.color.includes('yellow') ? 'bg-yellow-900/30 text-yellow-400' : ''}
                ${indicator.color.includes('blue') ? 'bg-blue-900/30 text-blue-400' : ''}
                ${!indicator.color.includes('green') && !indicator.color.includes('red') && !indicator.color.includes('pink') && !indicator.color.includes('yellow') && !indicator.color.includes('blue') ? 'bg-zinc-800/50 text-zinc-400' : ''}
              `}
            >
              {indicator.icon && (
                <span className="text-xs">{indicator.icon}</span>
              )}
              {indicator.value}
            </div>
          ))}
        </div>

        {/* Bottom: Address and Action */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-zinc-300 text-xs font-mono">{token.address}</p>
            {token.social && (
              <p className="text-blue-400 text-xs hover:text-blue-300 transition-colors">
                @{token.social}
              </p>
            )}
          </div>
          
          {/* Action Button */}
          <div className="flex items-center space-x-2">
            <button className="bg-zinc-700 hover:bg-zinc-600 text-white px-3 py-1.5 rounded-lg flex items-center space-x-1 transition-all duration-200 group-hover:bg-zinc-600">
              <Zap className="w-3 h-3 text-yellow-400" />
              <span className="text-white text-xs font-medium">5.00</span>
            </button>
          </div>
        </div>

        {/* Optional: Glow Effect for Live Tokens */}
        {token.status === 'live' && isGlowing && (
          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-green-500/10 to-blue-500/10 pointer-events-none animate-pulse"></div>
        )}
      </CardContent>
    </Card>
  )
}

// Example usage with mock data
export const mockTrenchesToken: TrenchesToken = {
  id: "rspin-1",
  symbol: "RSPIN",
  name: "Roger Spins",
  image: "/placeholder-token.png",
  marketCap: 4100,
  volume: 0,
  fees: "0",
  holders: 99,
  age: "3d",
  address: "Cs7...pump",
  social: "roger_spins",
  status: 'live',
  engagementIndicators: [
    { value: "+ 37%", color: "text-pink-400", icon: "👥" },
    { value: "5%", color: "text-green-400", icon: "👨‍🍳" },
    { value: "1.0%", color: "text-green-400", icon: "🎯" },
    { value: "32%", color: "text-pink-400", icon: "☁️" }
  ]
}
