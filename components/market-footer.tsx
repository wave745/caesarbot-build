"use client"

import React, { useState, useEffect } from 'react'
import { 
  TrendingUp,
  Star,
  Volume2,
  Trophy,
  ArrowRightLeft,
  BarChart3,
  Sparkles,
  Lightbulb,
  Users,
  ChevronDown,
  Circle
} from 'lucide-react'

interface MarketData {
  solPrice: number
  priceChange: number
  marketCap: number
  status: 'stable' | 'unstable' | 'connecting'
}

export function MarketFooter() {
  const [marketData, setMarketData] = useState<MarketData>({
    solPrice: 219.03,
    priceChange: 0.00,
    marketCap: 90000,
    status: 'stable'
  })

  const [showAbout, setShowAbout] = useState(false)

  // Simulate live data updates
  useEffect(() => {
    const interval = setInterval(() => {
      // You can replace this with actual API calls
      setMarketData(prev => ({
        ...prev,
        solPrice: 219.03 + (Math.random() - 0.5) * 0.1,
        priceChange: (Math.random() - 0.5) * 0.1,
        marketCap: 90000 + (Math.random() - 0.5) * 1000
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const formatPrice = (price: number) => {
    return price.toFixed(2)
  }

  const formatMarketCap = (cap: number) => {
    if (cap >= 1000) {
      return `${(cap / 1000).toFixed(1)}K`
    }
    return cap.toFixed(0)
  }

  const formatPercentage = (change: number) => {
    const sign = change >= 0 ? '+' : ''
    return `${sign}${change.toFixed(2)}%`
  }

  return (
    <footer className="fixed bottom-0 left-0 w-full h-11 bg-[#0a0a0a]/95 border-t border-[#1a1a1a] backdrop-blur-xl shadow-[0_-1px_12px_rgba(0,0,0,0.4)] z-50 flex items-center justify-between px-4 text-xs text-white font-medium select-none">
      {/* Left Section - Navigation Links */}
      <div className="flex items-center gap-4">
        <button className="flex items-center gap-1 hover:text-blue-400 transition-colors text-white">
          <TrendingUp className="w-3 h-3" />
          <span>Holding</span>
        </button>

        <button className="flex items-center gap-1 hover:text-blue-400 transition-colors text-white">
          <Star className="w-3 h-3" />
          <span>Watchlist</span>
        </button>

        <button className="flex items-center gap-1 hover:text-blue-400 transition-colors text-white">
          <Volume2 className="w-3 h-3" />
          <span>Trade</span>
        </button>

        <button className="flex items-center gap-1 hover:text-blue-400 transition-colors text-white">
          <Trophy className="w-3 h-3" />
          <span>Rank</span>
        </button>

        <button className="flex items-center gap-1 hover:text-blue-400 transition-colors text-white">
          <ArrowRightLeft className="w-3 h-3" />
          <span>Quick Bridge</span>
        </button>

        <button className="flex items-center gap-1 hover:text-blue-400 transition-colors text-white">
          <BarChart3 className="w-3 h-3" />
          <span>PnL</span>
        </button>

        <button className="flex items-center gap-1 hover:text-blue-400 transition-colors text-white">
          <Sparkles className="w-3 h-3" />
          <span>Meta</span>
        </button>
      </div>

      {/* Center Section - Market Lighthouse */}
      <div className="flex items-center gap-3 font-mono">
        <div className="flex items-center gap-1.5">
          <Lightbulb className="w-3 h-3 text-white" />
          <span className="text-white">Market Lighthouse</span>
        </div>

        {/* Solana-like gradient icon placeholder */}
        <div className="w-3 h-3 rounded-full bg-gradient-to-br from-teal-400 via-purple-500 to-pink-500"></div>

        {/* SOL Price - using font-mono for consistent number width */}
        <span className="text-blue-400 font-mono">
          ${formatPrice(marketData.solPrice)}
        </span>

        {/* Price Change - using font-mono */}
        <span className="text-green-400 font-mono">
          {formatPercentage(marketData.priceChange)}
        </span>

        {/* Small capsule icon placeholder */}
        <div className="w-2 h-3 rounded-full bg-green-400/30 border border-green-400/50"></div>

        {/* Market Cap - using font-mono */}
        <span className="text-blue-400 font-mono">
          ${formatMarketCap(marketData.marketCap)}
        </span>
      </div>

      {/* Right Section - Status & About */}
      <div className="flex items-center gap-4">
        {/* Status Indicator */}
        <div className="flex items-center gap-1 text-green-400">
          <Circle className="w-2 h-2 fill-green-400" />
          <span className="text-green-400">Stable</span>
        </div>

        {/* About Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowAbout(!showAbout)}
            className="flex items-center gap-1 hover:text-blue-400 transition-colors text-white"
          >
            <Users className="w-3 h-3" />
            <span>About</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${showAbout ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {showAbout && (
            <div className="absolute bottom-full right-0 mb-2 w-48 bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg shadow-lg py-2 z-50">
              <a href="#" className="block px-4 py-2 text-xs text-gray-300 hover:text-white hover:bg-[#1a1a1a]">
                Documentation
              </a>
              <a href="#" className="block px-4 py-2 text-xs text-gray-300 hover:text-white hover:bg-[#1a1a1a]">
                Support
              </a>
              <a href="#" className="block px-4 py-2 text-xs text-gray-300 hover:text-white hover:bg-[#1a1a1a]">
                Terms of Service
              </a>
              <a href="#" className="block px-4 py-2 text-xs text-gray-300 hover:text-white hover:bg-[#1a1a1a]">
                Privacy Policy
              </a>
            </div>
          )}
        </div>
      </div>
    </footer>
  )
}

