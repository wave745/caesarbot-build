"use client"

import { useState, useEffect, useRef, memo } from "react"
import { Button } from "@/components/ui/button"
import { 
  Copy,
  Zap
} from "lucide-react"
import Image from "next/image"
import { TrendingFilterModal } from "@/components/trending-filter-modal"

interface TrenchesToken {
  id: string
  name: string
  symbol: string
  image: string
  mc: string
  volume: string
  fee: string
  age: string
  holders: number
  buys: number
  sells: number
  status: 'new' | 'about-to-graduate' | 'migrated'
  tag: string
  contractAddress: string
  migratedTokens: number
  devSold: boolean
  top10Holders: number
  snipers: number
  insiders: number
  platform: 'pump.fun' | 'bonk.fun' | 'moon.it'
  buyAmount: string
  // Pump.fun specific fields
  coinMint?: string
  dev?: string
  bondingCurveProgress?: number
  sniperCount?: number
  graduationDate?: string | null
  devHoldingsPercentage?: number
  sniperOwnedPercentage?: number
  topHoldersPercentage?: number
  hasTwitter?: boolean
  hasTelegram?: boolean
  hasWebsite?: boolean
  twitter?: string | null
  telegram?: string | null
  website?: string | null
  engagementIndicators?: any
}

// Filter state interface matching the trending filter modal
interface FilterState {
  launchpads: {
    pumpfun: boolean
    bonk: boolean
    metdbc: boolean
    bagsfm: boolean
    believeapp: boolean
    moonit: boolean
  }
  atLeastOneSocial: boolean
  originalSocials: boolean
  originalAvatar: boolean
  dexPaid: boolean
  devStillHolding: boolean
  pumpLive: boolean
  includeKeywords: string
  excludeKeywords: string
  marketCap: { min: string; max: string }
  volume: { min: string; max: string }
  liquidity: { min: string; max: string }
  top10Holders: { min: string; max: string }
  insidersHoldings: { min: string; max: string }
  snipersHoldings: { min: string; max: string }
  curveProgress: { min: string; max: string }
  buys: { min: string; max: string }
  sells: { min: string; max: string }
  devBonded: { min: string; max: string }
  totalFees: { min: string; max: string }
  freshWalletsBuys: { min: string; max: string }
  tokenAge: { min: string; max: string }
  holders: { min: string; max: string }
  proHolders: { min: string; max: string }
  bundlesHolding: { min: string; max: string }
  devHolding: { min: string; max: string }
  alphaGroupMentions: { min: string; max: string }
}

interface TrenchesColumnProps {
  title: string
  tokens: TrenchesToken[]
  loading?: boolean
  onFiltersChange?: (filters: FilterState) => void
  initialFilters?: FilterState
  selectedChain?: 'solana' | 'bnb'
}

export function TrenchesColumn({ title, tokens, loading = false, onFiltersChange, initialFilters, selectedChain = 'solana' }: TrenchesColumnProps) {
  const [solAmount, setSolAmount] = useState("5")
  const [isEditing, setIsEditing] = useState(false)
  const [showPresets, setShowPresets] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState("P1")
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [filters, setFilters] = useState<FilterState>(initialFilters || {
    launchpads: {
      pumpfun: true,
      bonk: true,
      metdbc: false,
      bagsfm: false,
      believeapp: false,
      moonit: true
    },
    atLeastOneSocial: false,
    originalSocials: false,
    originalAvatar: false,
    dexPaid: false,
    devStillHolding: false,
    pumpLive: false,
    includeKeywords: '',
    excludeKeywords: '',
    marketCap: { min: '', max: '' },
    volume: { min: '', max: '' },
    liquidity: { min: '', max: '' },
    top10Holders: { min: '', max: '' },
    insidersHoldings: { min: '', max: '' },
    snipersHoldings: { min: '', max: '' },
    curveProgress: { min: '', max: '' },
    buys: { min: '', max: '' },
    sells: { min: '', max: '' },
    devBonded: { min: '', max: '' },
    totalFees: { min: '', max: '' },
    freshWalletsBuys: { min: '', max: '' },
    tokenAge: { min: '', max: '' },
    holders: { min: '', max: '' },
    proHolders: { min: '', max: '' },
    bundlesHolding: { min: '', max: '' },
    devHolding: { min: '', max: '' },
    alphaGroupMentions: { min: '', max: '' }
  })
  const presetRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (presetRef.current && !presetRef.current.contains(event.target as Node)) {
        setShowPresets(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Filter modal handlers
  const handleFilterApply = (newFilters: FilterState) => {
    setFilters(newFilters)
    if (onFiltersChange) {
      onFiltersChange(newFilters)
    }
  }

  const handleFilterClose = () => {
    setIsFilterModalOpen(false)
  }

  const presets = [
    {
      id: "P1",
      gasPump: "0.003",
      handCoins: "0.004", 
      personFalling: "20%",
      robot: "On",
      robotActive: true
    },
    {
      id: "P2",
      gasPump: "0.008",
      handCoins: "0.012",
      personFalling: "10%", 
      robot: "Off",
      robotActive: false
    },
    {
      id: "P3",
      gasPump: "0.012",
      handCoins: "0.03",
      personFalling: "10%",
      robot: "Off", 
      robotActive: false
    }
  ]

  return (
    <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
        <div className="flex items-center gap-3">
          <h2 className="font-semibold text-zinc-200 tracking-wide text-lg">
            {title}
          </h2>
        </div>
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-1 px-2 py-1 bg-zinc-800 rounded text-xs hover:bg-zinc-700 transition-colors">
            <Zap className="w-3 h-3 text-gray-400" />
            {isEditing ? (
              <input
                type="number"
                value={solAmount}
                onChange={(e) => setSolAmount(e.target.value)}
                onBlur={() => setIsEditing(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setIsEditing(false)
                  }
                }}
                className="w-8 bg-transparent text-white font-medium text-xs border-none outline-none"
                autoFocus
              />
            ) : (
              <span 
                className="text-white font-medium cursor-pointer"
                onClick={() => setIsEditing(true)}
              >
                {solAmount}
              </span>
            )}
            <img 
              src={selectedChain === 'solana' ? "/sol-logo.png" : "/bnb-chain-binance-smart-chain-logo.svg"} 
              alt={selectedChain === 'solana' ? "SOL" : "BNB"} 
              className="w-3 h-3" 
            />
          </div>
          
          <div className="relative" ref={presetRef}>
            <button 
              className="px-2 py-1 bg-zinc-800 rounded text-xs hover:bg-zinc-700 transition-colors"
              onClick={() => setShowPresets(!showPresets)}
            >
              <span className="text-white font-medium">{selectedPreset}</span>
            </button>
            
            {showPresets && (
              <div className="absolute top-full left-0 mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg z-50 min-w-[200px]">
                {presets.map((preset) => (
                  <div 
                    key={preset.id}
                    className={`px-3 py-2 flex items-center justify-between cursor-pointer hover:bg-zinc-700 transition-colors ${
                      selectedPreset === preset.id ? 'bg-zinc-700' : ''
                    } ${preset.id === 'P1' ? 'rounded-t-lg' : ''} ${preset.id === 'P3' ? 'rounded-b-lg' : ''}`}
                    onClick={() => {
                      setSelectedPreset(preset.id)
                      setShowPresets(false)
                    }}
                  >
                    <span className="text-white font-medium text-sm">{preset.id}</span>
                    <div className="flex items-center gap-3 text-xs text-zinc-300">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-zinc-600 rounded-sm"></div>
                        <span>{preset.gasPump}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-zinc-600 rounded-sm"></div>
                        <span>{preset.handCoins}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-zinc-600 rounded-sm"></div>
                        <span>{preset.personFalling}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className={`w-3 h-3 rounded-sm ${preset.robotActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span>{preset.robot}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <button 
            className="p-1 bg-zinc-800 rounded hover:bg-zinc-700 transition-colors"
            onClick={() => setIsFilterModalOpen(true)}
          >
            <Image 
              src="/icons/ui/filter-icon.svg" 
              alt="Filter" 
              width={12} 
              height={12} 
              className="opacity-60"
            />
          </button>
        </div>
      </div>

      {/* Tokens List */}
      <div 
        className="flex flex-col divide-y divide-zinc-800 overflow-y-auto max-h-[85vh] custom-scrollbar pr-2"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#18181b #09090b',
          willChange: 'scroll-position'
        }}
      >
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
            <span className="ml-2 text-zinc-400">Loading tokens...</span>
          </div>
        ) : (
          tokens.map((token, idx) => (
            <TrenchesTokenCard key={`${token.platform}-${token.id}-${idx}`} token={token} solAmount={solAmount} />
          ))
        )}
      </div>

      {/* Filter Modal */}
      <TrendingFilterModal
        isOpen={isFilterModalOpen}
        onClose={handleFilterClose}
        onApply={handleFilterApply}
        initialFilters={filters}
        selectedChain={selectedChain}
      />
    </div>
  )
}

const TrenchesTokenCard = memo(function TrenchesTokenCard({ token, solAmount }: { token: TrenchesToken; solAmount: string }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'migrated': return 'border-red-500/60'
      case 'about-to-graduate': return 'border-yellow-400/50'
      case 'new': return 'border-green-400/50'
      default: return 'border-zinc-400/50'
    }
  }

  const getAgeColor = (age: string) => {
    if (age.includes('d')) return 'text-pink-400'
    if (age.includes('h')) return 'text-yellow-400'
    if (age.includes('m')) return 'text-green-400'
    return 'text-zinc-400'
  }

  return (
    <div className="p-2 hover:bg-zinc-900/40 transition-all cursor-pointer min-h-[140px]">
      <div className="flex items-start gap-3 h-full">
        {/* Left: Large Token Icon and Contract Address */}
        <div className="flex flex-col items-start">
          <div className="relative">
            <div className={`w-16 h-16 rounded-lg overflow-hidden border ${getStatusColor(token.status)}`}>
              <img
                src={token.image || `https://ui-avatars.com/api/?name=${token.symbol}&background=6366f1&color=fff&size=64`}
                alt={token.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${token.symbol}&background=6366f1&color=fff&size=64`
                }}
              />
            </div>
            {/* Pill icon overlay */}
            <div className="absolute -bottom-1 -right-1 w-5 h-5">
              <Image 
                src={
                  token.platform === 'bonk.fun' ? "/icons/platforms/bonk.fun-logo.svg" :
                  token.platform === 'moon.it' ? "/icons/platforms/moon.it-logo.png" :
                  "/icons/platforms/pump.fun-logo.svg"
                } 
                alt={
                  token.platform === 'bonk.fun' ? "Bonk.fun" :
                  token.platform === 'moon.it' ? "Moon.it" :
                  "Pump.fun"
                } 
                width={20} 
                height={20} 
                className="drop-shadow-sm brightness-150 contrast-125"
              />
            </div>
          </div>
          
          {/* Contract Address under the icon */}
          <div className="flex items-center gap-1 text-zinc-500 text-xs mt-1">
            <span className="cursor-pointer hover:text-white transition-colors">
              {token.contractAddress}
            </span>
            <Copy 
              size={10} 
              className="cursor-pointer hover:text-white transition-colors opacity-60 hover:opacity-100" 
              onClick={() => navigator.clipboard.writeText(token.contractAddress)}
            />
          </div>
        </div>

        {/* Center: Token Info and Metrics */}
        <div className="flex flex-col flex-1">
          {/* Top Row: Token Name */}
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-white text-sm">
              {token.name}
            </h3>
            <span className="text-zinc-500 text-xs">
              {token.tag}
            </span>
          </div>

          {/* Middle Row: Time and Social Icons */}
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs ${getAgeColor(token.age)}`}>{token.age}</span>
            <div className="flex items-center gap-1">
              {token.hasTwitter && (
                <Image 
                  src="/icons/social/x-logo.svg" 
                  alt="Twitter" 
                  width={12} 
                  height={12} 
                  className="opacity-80 brightness-0 invert cursor-pointer hover:opacity-100"
                  onClick={() => window.open(token.twitter || '#', '_blank')}
                />
              )}
              {token.hasWebsite && (
                <Image 
                  src="/icons/ui/web-icon.svg" 
                  alt="Website" 
                  width={12} 
                  height={12} 
                  className="opacity-80 brightness-0 invert cursor-pointer hover:opacity-100"
                  onClick={() => window.open(token.website || '#', '_blank')}
                />
              )}
              {token.hasTelegram && (
                <Image 
                  src="/icons/social/telegram-logo.svg" 
                  alt="Telegram" 
                  width={12} 
                  height={12} 
                  className="opacity-80 brightness-0 invert cursor-pointer hover:opacity-100"
                  onClick={() => window.open(token.telegram || '#', '_blank')}
                />
              )}
              <Image 
                src="/icons/ui/search-icon.svg" 
                alt="Search" 
                width={12} 
                height={12} 
                className="opacity-80 brightness-0 invert cursor-pointer hover:opacity-100"
              />
            </div>
          </div>

          {/* Counts Row */}
          <div className="flex items-center gap-3 text-xs text-zinc-400 mb-2">
            <div className="flex items-center gap-1">
              <Image 
                src="/icons/ui/totalholders-icon.svg" 
                alt="Holders" 
                width={12} 
                height={12} 
                className="opacity-80 brightness-0 invert"
              />
              <span>{token.holders}</span>
            </div>
            <div className="flex items-center gap-1">
              <Image 
                src="/icons/ui/dev-migrated-icon.svg" 
                alt="Migrated" 
                width={12} 
                height={12} 
                className="opacity-80 brightness-0 invert"
              />
              <span>{token.migratedTokens}</span>
            </div>
          </div>

          {/* Bottom Row: Engagement Metrics */}
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1 px-2 py-1 rounded border border-green-400/30">
              <Image 
                src="/icons/ui/top10H-icon.svg" 
                alt="Top 10 Holders" 
                width={10} 
                height={10} 
                className="opacity-80 brightness-0 invert"
              />
              <span className="text-green-400">+{token.top10Holders}%</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded border border-green-400/30">
              <Image 
                src="/icons/ui/dev-holding-icon.svg" 
                alt="Dev Holding" 
                width={10} 
                height={10} 
                className="opacity-80 brightness-0 invert"
              />
              <span className="text-green-400">
                {token.devSold ? 'DS' : token.devHoldingsPercentage ? `${token.devHoldingsPercentage.toFixed(1)}%` : '0.0%'}
              </span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded border border-green-400/30">
              <Image 
                src="/icons/ui/snipers-icon.svg" 
                alt="Snipers" 
                width={10} 
                height={10} 
                className="opacity-80 brightness-0 invert"
              />
              <span className="text-white">{token.snipers}%</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded border border-green-400/30">
              <Image 
                src="/icons/ui/insiders-icon.svg" 
                alt="Insiders" 
                width={10} 
                height={10} 
                className="opacity-80 brightness-0 invert"
              />
              <span className="text-white">{token.insiders}%</span>
            </div>
          </div>
        </div>

        {/* Right: Key Metrics and Buy Amount */}
        <div className="flex flex-col items-end text-right text-xs flex-shrink-0">
          {/* Key Metrics */}
          <div className="mb-2">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-zinc-400">MC</span>
              <span className="text-cyan-400 font-medium">{token.mc}</span>
            </div>
            <div className="flex items-center gap-1 mb-1">
              <span className="text-zinc-400">V</span>
              <span className="text-white">{token.volume}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-zinc-400">F</span>
              <span className="text-white">≈ {token.fee}</span>
            </div>
          </div>
          
          {/* Buy Button */}
          <button 
            className="flex items-center gap-1 px-2 py-1 bg-zinc-800 hover:bg-zinc-700 rounded text-xs transition-colors"
            onClick={() => {
              // TODO: Implement buy functionality
              console.log(`Buying ${solAmount} SOL worth of ${token.symbol}`)
            }}
          >
            <Zap className="w-3 h-3 text-zinc-400" />
            <span className="text-white text-xs">{solAmount}</span>
          </button>
        </div>
      </div>
    </div>
  )
})
