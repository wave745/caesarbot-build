"use client"

import React, { useState, useEffect } from 'react'
import { 
  Star, 
  Wallet, 
  BarChart3, 
  Bell, 
  BookOpen, 
  MessageSquare, 
  Send,
  Wifi,
  Shield,
  Zap,
  TrendingUp,
  Activity,
  X,
  Globe,
  RefreshCw,
  ArrowRightLeft
} from 'lucide-react'
import { FooterLiveDataService, FooterLiveData } from '@/lib/services/footer-live-data'
import { WatchlistCard } from './watchlist-card'
import { VolumeCard } from './volume-card'
import { BridgeModal } from './bridge-modal'
import PnLCardModal from './pnl-card-modal'

interface SystemStats {
  fps: number
  latency: number
  solBalance: number
  usdValue: number
  networkStatus: 'stable' | 'unstable' | 'connecting'
  solPrice: number
  lastUpdate: number
}

interface LiveData {
  solPrice: number
  walletBalance: number
  portfolioValue: number
  networkLatency: number
  systemPerformance: number
}

export function CaesarXFooter() {
  const [stats, setStats] = useState<SystemStats>({
    fps: 60,
    latency: 12,
    solBalance: 232.48,
    usdValue: 95520,
    networkStatus: 'stable',
    solPrice: 0,
    lastUpdate: Date.now()
  })

  const [liveData, setLiveData] = useState<FooterLiveData>({
    solPrice: 0,
    walletBalance: 0,
    portfolioValue: 0,
    networkLatency: 0,
    systemPerformance: 0,
    lastUpdate: 0
  })

  const [activeTrackers, setActiveTrackers] = useState<string[]>(['watchlist'])
  const [isLoading, setIsLoading] = useState(false)
  const [liveDataService] = useState(() => FooterLiveDataService.getInstance())
  const [showWatchlist, setShowWatchlist] = useState(false)
  const [showVolume, setShowVolume] = useState(false)
  const [showBridge, setShowBridge] = useState(false)
  const [showPnL, setShowPnL] = useState(false)

  // Update live data using the service
  const updateLiveData = async () => {
    setIsLoading(true)
    try {
      const data = await liveDataService.getLiveData()
      setLiveData(data)

      setStats(prev => ({
        ...prev,
        solPrice: data.solPrice,
        solBalance: data.walletBalance,
        usdValue: data.portfolioValue,
        latency: data.networkLatency,
        lastUpdate: data.lastUpdate
      }))
    } catch (error) {
      console.error('Error updating live data:', error)
      // Don't set fallback data - let the UI show the actual state
    } finally {
      setIsLoading(false)
    }
  }

  // Initial data fetch
  useEffect(() => {
    updateLiveData()
  }, [])

  // Simulate live FPS updates and periodic data refresh
  useEffect(() => {
    const fpsInterval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        fps: Math.floor(Math.random() * 10) + 55, // 55-65 FPS
      }))
    }, 2000)

    const dataInterval = setInterval(() => {
      updateLiveData()
    }, 30000) // Update every 30 seconds

    return () => {
      clearInterval(fpsInterval)
      clearInterval(dataInterval)
    }
  }, [])

  const toggleTracker = (tracker: string) => {
    if (tracker === 'watchlist') {
      setShowWatchlist(!showWatchlist)
    } else if (tracker === 'volume') {
      setShowVolume(!showVolume)
    } else if (tracker === 'bridge') {
      setShowBridge(!showBridge)
    } else if (tracker === 'pnl') {
      setShowPnL(!showPnL)
    }
    setActiveTrackers(prev => 
      prev.includes(tracker) 
        ? prev.filter(t => t !== tracker)
        : [...prev, tracker]
    )
  }

  const getStatusColor = (latency: number) => {
    if (latency < 100) return 'text-green-400'
    if (latency < 500) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getStatusIcon = (latency: number) => {
    if (latency < 100) return <Wifi className="w-3 h-3" />
    if (latency < 500) return <Activity className="w-3 h-3" />
    return <Zap className="w-3 h-3" />
  }

  const getStatusText = (latency: number) => {
    if (latency < 100) return 'Stable'
    if (latency < 500) return 'Unstable'
    return 'Connecting'
  }

  return (
    <>
      <footer className="fixed bottom-0 left-0 w-full h-11 bg-[#0a0a0a]/95 border-t border-[#1a1a1a] backdrop-blur-xl shadow-[0_-1px_12px_rgba(0,0,0,0.4)] z-50 flex items-center justify-between px-4 text-xs text-gray-400 font-medium select-none">
      {/* Left Section - Status Indicators & Trackers */}
      <div className="flex items-center gap-4">
        {/* Network Status */}
        <div className={`flex items-center gap-1 ${getStatusColor(liveData.networkLatency)}`}>
          {getStatusIcon(liveData.networkLatency)}
          <span>{getStatusText(liveData.networkLatency)}</span>
        </div>

        {/* FPS Counter */}
        <span className="text-gray-500 font-mono">
          {stats.fps} FPS
        </span>

        {/* Tracker Buttons */}
        <button 
          onClick={() => toggleTracker('watchlist')}
          className={`flex items-center gap-1 hover:text-white transition-colors ${
            activeTrackers.includes('watchlist') ? 'text-green-400' : 'text-gray-400'
          }`}
        >
          <Star className="w-3 h-3" />
          <span>Watchlist</span>
        </button>

        <button 
          onClick={() => toggleTracker('wallet')}
          className={`flex items-center gap-1 hover:text-white transition-colors ${
            activeTrackers.includes('wallet') ? 'text-green-400' : 'text-gray-400'
          }`}
        >
          <Wallet className="w-3 h-3" />
          <span>Wallet Tracker</span>
        </button>

        <button 
          onClick={() => toggleTracker('pnl')}
          className={`flex items-center gap-1 hover:text-white transition-colors ${
            activeTrackers.includes('pnl') ? 'text-green-400' : 'text-gray-400'
          }`}
        >
          <BarChart3 className="w-3 h-3" />
          <span>PnL Tracker</span>
        </button>



        <button 
          onClick={() => toggleTracker('trenches')}
          className={`flex items-center gap-1 hover:text-white transition-colors ${
            activeTrackers.includes('trenches') ? 'text-green-400' : 'text-gray-400'
          }`}
        >
          <Shield className="w-3 h-3" />
          <span>Echo</span>
        </button>

        <button 
          onClick={() => toggleTracker('volume')}
          className={`flex items-center gap-1 hover:text-white transition-colors ${
            activeTrackers.includes('volume') ? 'text-green-400' : 'text-gray-400'
          }`}
        >
          <Activity className="w-3 h-3" />
          <span>Volume</span>
        </button>

        <button 
          onClick={() => toggleTracker('bridge')}
          className={`flex items-center gap-1 hover:text-white transition-colors ${
            activeTrackers.includes('bridge') ? 'text-green-400' : 'text-gray-400'
          }`}
        >
          <ArrowRightLeft className="w-3 h-3" />
          <span>Quick Bridge</span>
        </button>
      </div>

      {/* Center Section - Live System Stats */}
      <div className="flex items-center gap-4 font-mono">
        {/* SOL Price */}
        <div className="flex items-center gap-1">
          <img src="/sol-logo.png" alt="SOL" className="w-3 h-3" />
          <span className="text-white">${stats.solPrice > 0 ? stats.solPrice.toFixed(2) : '--'}</span>
        </div>

        {/* PumpFun Bond Market Cap - SOL Price × 411 */}
        <div className="flex items-center gap-1 relative group">
          <img 
            src="/icons/platforms/pump.fun-logo.svg" 
            alt="PumpFun" 
            className="w-3 h-3 object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <span className="text-white">
            ${stats.solPrice > 0 ? ((stats.solPrice * 411) / 1000).toFixed(1) : '--'}K
          </span>
          
          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
            Estimated PumpFun Bond Market Cap
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
          </div>
        </div>


      </div>

      {/* Right Section - Controls & Links */}
      <div className="flex items-center gap-3">
        {/* Manual Refresh */}
        <button 
          onClick={updateLiveData}
          disabled={isLoading}
          className="flex items-center gap-1 hover:text-white transition-colors disabled:opacity-50"
          title="Refresh data"
        >
          <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
        </button>

        {/* Documentation */}
        <button className="flex items-center gap-1 hover:text-white transition-colors" title="Documentation">
          <BookOpen className="w-3 h-3" />
        </button>

        {/* Social Links */}
        <button className="flex items-center gap-1 hover:text-white transition-colors" title="X (Twitter)">
          <img src="/icons/social/x-logo.svg" alt="X" className="w-3 h-3 brightness-0 invert" />
        </button>

        <button className="flex items-center gap-1 hover:text-white transition-colors" title="Telegram">
          <img src="/icons/social/telegram-logo.svg" alt="Telegram" className="w-3 h-3 brightness-0 invert" />
        </button>


        {/* Language Selector */}
        <div className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
          <Globe className="w-3 h-3" />
          <span className="text-gray-400 text-xs">English</span>
        </div>
      </div>
      </footer>
      
      {/* Watchlist Card Modal */}
      <WatchlistCard 
        isOpen={showWatchlist} 
        onClose={() => setShowWatchlist(false)} 
      />
      
      {/* Volume Card Modal */}
      <VolumeCard 
        isOpen={showVolume} 
        onClose={() => setShowVolume(false)} 
      />
      
      {/* Bridge Modal */}
      <BridgeModal 
        isOpen={showBridge} 
        onClose={() => setShowBridge(false)} 
      />
      
      {/* PnL Card Modal */}
      <PnLCardModal
        isOpen={showPnL}
        onClose={() => setShowPnL(false)}
        size="small"
      />
    </>
  )
}
