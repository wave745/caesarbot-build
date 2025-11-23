"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { 
  Copy,
  Zap
} from "lucide-react"
import Image from "next/image"
import { TrendingFilterModal } from "@/components/trending-filter-modal"
import { useColumnSound } from "@/hooks/use-column-sound"
import { SoundSelector } from "@/components/sound-selector"
import { getLaunchpadColor } from "@/components/echo-customize-modal"

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
  platform: 'pump.fun' | 'bonk.fun' | 'moon.it' | 'pumpswap' | 'moonshot' | 'boop.fun' | 'orca' | 'meteora' | 'raydium' | 'jupiter' | 'birdeye' | 'dexscreener' | 'solscan' | 'solana' | 'trends.fun' | 'rupert' | 'bags.fm' | 'believe.app' | 'unknown'
  platformLogo?: string
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
    pumpswap: boolean
    moonshot: boolean
    boop: boolean
    orca: boolean
    meteora: boolean
    raydium: boolean
    jupiter: boolean
    birdeye: boolean
    dexscreener: boolean
    solscan: boolean
    solana: boolean
    trends: boolean
    rupert: boolean
    unknown: boolean
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
  echoSettings?: any
}

export function TrenchesColumn({ title, tokens, loading = false, onFiltersChange, initialFilters, selectedChain = 'solana', echoSettings }: TrenchesColumnProps) {
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
      moonit: true,
      pumpswap: true,
      moonshot: true,
      boop: true,
      orca: true,
      meteora: true,
      raydium: true,
      jupiter: true,
      birdeye: true,
      dexscreener: true,
      solscan: true,
      solana: true,
      trends: true,
      rupert: true,
      unknown: true
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
  const seenTokenIdsRef = useRef<Set<string>>(new Set())

  // Initialize sound system with column ID based on title
  const columnId = title.toLowerCase().replace(/\s+/g, '-')
  const { sound, volume, playSound, updateSound, updateVolume } = useColumnSound(columnId)

  // Track individual tokens and play sound for each new unique token
  useEffect(() => {
    const currentTokenIds = new Set(tokens.map(t => `${t.platform}-${t.id}-${t.coinMint || t.contractAddress}`))
    const seenIds = seenTokenIdsRef.current
    
    // Find truly new tokens that haven't been seen before
    const newTokens = tokens.filter(token => {
      const tokenId = `${token.platform}-${token.id}-${token.coinMint || token.contractAddress}`
      return !seenIds.has(tokenId)
    })

    // Play sound for each new token (one per token)
    if (newTokens.length > 0 && seenIds.size > 0) {
      // Play sound once for each new token with slight delay between them
      newTokens.forEach((_, index) => {
        setTimeout(() => {
          playSound()
        }, index * 600) // 600ms delay between each sound
      })
    }

    // Update the seen tokens set
    seenTokenIdsRef.current = currentTokenIds
  }, [tokens, playSound])

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
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-1">
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
          
          <SoundSelector
            selectedSound={sound}
            volume={volume}
            onSoundChange={updateSound}
            onVolumeChange={updateVolume}
            onTestSound={playSound}
          />
          
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
        className="flex flex-col divide-y divide-zinc-800 overflow-y-auto overflow-x-visible max-h-[85vh] custom-scrollbar"
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
          tokens.map((token, index) => {
            // Use stable identifier: platform + coinMint (or id/contractAddress as fallback)
            // Add index as fallback to ensure uniqueness even if deduplication fails
            const tokenId = token.coinMint || token.id || token.contractAddress || `unknown-${index}`
            const stableKey = `${token.platform}-${tokenId}`
            return (
              <TrenchesTokenCard key={stableKey} token={token} solAmount={solAmount} echoSettings={echoSettings} />
            )
          })
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

// REMOVED memo() wrapper - trading platform needs continuous live updates, no memoization blocking
function TrenchesTokenCard({ token, solAmount, echoSettings }: { token: TrenchesToken; solAmount: string; echoSettings?: any }) {
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

  // Get background color based on settings
  const getBackgroundColor = () => {
    if (echoSettings?.toggles?.backgroundColor && echoSettings?.toggles?.launchpadColorMatching) {
      return getLaunchpadColor(token.platform)
    }
    return 'hover:bg-zinc-900/40'
  }

  return (
    <div className={`p-2 transition-all cursor-pointer min-h-[140px] w-full ${getBackgroundColor()}`}>
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
                  console.log('Image failed to load:', token.image);
                  // Try multiple fallback strategies
                  if (e.currentTarget.src.includes('solanatracker.io')) {
                    // If Solana Tracker image fails, try direct URL
                    const directUrl = token.image?.replace('https://image.solanatracker.io/proxy?url=', '');
                    if (directUrl) {
                      e.currentTarget.src = decodeURIComponent(directUrl);
                    } else {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${token.symbol}&background=6366f1&color=fff&size=64`;
                    }
                  } else {
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${token.symbol}&background=6366f1&color=fff&size=64`;
                  }
                }}
                onLoad={() => {
                  console.log('Image loaded successfully:', token.image);
                }}
              />
            </div>
            
            {/* Pill icon overlay */}
            <div className="absolute -bottom-1 -right-1 w-5 h-5">
              <Image 
                src={
                  token.platformLogo || (
                    token.platform === 'bonk.fun' ? "/icons/platforms/bonk.fun-logo.svg" :
                    token.platform === 'moon.it' ? "/icons/platforms/moon.it-logo.png" :
                    token.platform === 'pumpswap' ? "/icons/platforms/pumpswap-logo.svg" :
                    token.platform === 'moonshot' ? "/icons/platforms/moonshot-logo.svg" :
                    token.platform === 'boop.fun' ? "/icons/platforms/boop.fun-logo.svg" :
                    token.platform === 'orca' ? "/icons/platforms/orca.so-logo.svg" :
                    token.platform === 'meteora' ? "/icons/platforms/meteora.ag(met-dbc)-logo.png" :
                    token.platform === 'raydium' ? "/icons/platforms/raydium-launchlab-logo.svg" :
                    token.platform === 'jupiter' ? "/icons/platforms/jupiter-ag-jup-logo.svg" :
                    token.platform === 'birdeye' ? "/icons/platforms/birdeye-logo.svg" :
                    token.platform === 'dexscreener' ? "/icons/platforms/dexscreener-logo.svg" :
                    token.platform === 'solscan' ? "/icons/platforms/solscan-logo.svg" :
                    token.platform === 'solana' ? "/icons/platforms/solana-logo.svg" :
                    token.platform === 'trends.fun' ? "/icons/platforms/trends.fun-logo.svg" :
                  token.platform === 'rupert' ? "/icons/platforms/rupert-logo.svg" :
                  token.platform === 'bags.fm' ? "/icons/platforms/bags.fm-logo.png" :
                  token.platform === 'believe.app' ? "/icons/platforms/believe.app-logo.png" :
                  "/icons/platforms/pump.fun-logo.svg"
                  )
                } 
                alt={
                  token.platform === 'bonk.fun' ? "Bonk.fun" :
                  token.platform === 'moon.it' ? "Moon.it" :
                  token.platform === 'pumpswap' ? "PumpSwap" :
                  token.platform === 'moonshot' ? "Moonshot" :
                  token.platform === 'boop.fun' ? "Boop.fun" :
                  token.platform === 'orca' ? "Orca" :
                  token.platform === 'meteora' ? "Meteora" :
                  token.platform === 'raydium' ? "Raydium Launchpad" :
                  token.platform === 'jupiter' ? "Jupiter" :
                  token.platform === 'birdeye' ? "Birdeye" :
                  token.platform === 'dexscreener' ? "DexScreener" :
                  token.platform === 'solscan' ? "Solscan" :
                  token.platform === 'solana' ? "Solana" :
                  token.platform === 'trends.fun' ? "Trends.fun" :
                  token.platform === 'rupert' ? "Rupert" :
                  token.platform === 'bags.fm' ? "Bags.fm" :
                  token.platform === 'believe.app' ? "Believe.app" :
                  "Pump.fun"
                } 
                width={20} 
                height={20} 
                className="drop-shadow-sm brightness-150 contrast-125"
              />
            </div>
          </div>
          
          {/* Contract Address under the icon */}
          <div className="flex items-center gap-1 text-zinc-500 text-xs mt-1 w-16">
            <span 
              className="cursor-pointer hover:text-white transition-colors font-mono text-center flex-1"
              onClick={() => {
                if (token.contractAddress) {
                  navigator.clipboard.writeText(token.contractAddress);
                }
              }}
              title={token.contractAddress}
            >
              {(() => {
                if (!token.contractAddress) return 'N/A';
                if (token.contractAddress.length < 7) return token.contractAddress;
                
                // Clean the contract address to remove any extra spaces or characters
                const cleanAddress = token.contractAddress.trim().replace(/\s+/g, '');
                console.log('Contract Address Debug:', {
                  original: token.contractAddress,
                  clean: cleanAddress,
                  length: cleanAddress.length
                });
                
                return `${cleanAddress.substring(0, 3)}...${cleanAddress.substring(cleanAddress.length - 4)}`;
              })()}
            </span>
          </div>
        </div>

        {/* Center: Token Info and Metrics */}
        <div className="flex flex-col flex-1">
          {/* Top Row: Ticker (bold) then Name */}
          <div className="flex items-baseline gap-2 mb-1">
            <h3 className="font-bold text-white text-sm leading-tight">
              {token.symbol}
            </h3>
            <span className="text-zinc-500 text-xs leading-tight">
              {token.name}
            </span>
          </div>

          {/* Middle Row: Time and Social Icons */}
          <div className="flex items-center gap-2 mb-1">
            <div className="flex items-center gap-1.5">
              <span className={`text-xs font-medium ${getAgeColor(token.age)}`}>{token.age}</span>
            </div>
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

          {/* Counts Row: Holders */}
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
            {token.migratedTokens > 0 && (
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
            )}
          </div>

        </div>

        {/* Right: Key Metrics */}
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
            <div className="flex items-center gap-1 mb-1">
              <div className="flex items-center gap-1">
                <span className="text-zinc-400">F</span>
                <img 
                  src="/sol-logo.png" 
                  alt="Solana" 
                  className="w-2 h-2 mt-0.5"
                />
              </div>
              <span className="text-white">{token.fee}</span>
            </div>
            {/* Price Change 24h if available */}
            {(token as any).priceChange24h !== undefined && (token as any).priceChange24h !== 0 && (
              <div className="flex items-center gap-1">
                <span className="text-zinc-400">24h</span>
                <span className={`font-medium ${
                  (token as any).priceChange24h > 0 ? 'text-green-400' : 
                  (token as any).priceChange24h < 0 ? 'text-red-400' : 
                  'text-zinc-400'
                }`}>
                  {(token as any).priceChange24h > 0 ? '+' : ''}
                  {((token as any).priceChange24h || 0).toFixed(2)}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row: Engagement Metrics and Buy Button */}
      <div className="flex items-center justify-between mt-3 overflow-visible">
        {/* Engagement Metrics */}
        <div className="flex items-center gap-1 text-xs overflow-visible">
          {(() => {
            const top10HoldersValue = token.top10HoldersPercentage ?? token.top10Holders ?? 0
            // >= 16%: red, < 16%: green
            const isHigh = top10HoldersValue >= 16
            const iconStyle = isHigh
              ? { filter: 'brightness(0) saturate(100%) invert(27%) sepia(95%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)' } // Red filter
              : { filter: 'brightness(0) saturate(100%) invert(67%) sepia(61%) saturate(456%) hue-rotate(87deg) brightness(118%) contrast(119%)' } // Green filter
            const textColorClass = isHigh ? "text-red-400" : "text-green-400"
            
            return (
              <div className="relative group flex items-center justify-center gap-0.5 px-1.5 py-0.5 rounded-full border border-gray-400/30 min-w-fit">
                <Image 
                  src="/icons/ui/top10H-icon.svg" 
                  alt="Top 10 Holders" 
                  width={10} 
                  height={10} 
                  className="opacity-80"
                  style={iconStyle}
                />
                <span className={`${textColorClass} text-xs`}>+{top10HoldersValue.toFixed(1)}%</span>
                {/* Tooltip */}
                <div className="absolute top-full left-0 mt-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-none whitespace-nowrap z-[9999] pointer-events-none" style={{ willChange: 'opacity' }}>
                  Top 10 holders
                </div>
              </div>
            )
          })()}
          {(() => {
            // Green when dev is holding, blue when dev has sold
            const isDevSold = token.devSold
            const iconStyle = isDevSold
              ? { filter: 'brightness(0) saturate(100%) invert(48%) sepia(79%) saturate(2476%) hue-rotate(194deg) brightness(102%) contrast(101%)' } // Blue filter
              : { filter: 'brightness(0) saturate(100%) invert(67%) sepia(61%) saturate(456%) hue-rotate(87deg) brightness(118%) contrast(119%)' } // Green filter
            const textColorClass = isDevSold ? "text-blue-400" : "text-green-400"
            
            return (
              <div className="relative group flex items-center justify-center gap-0.5 px-1.5 py-0.5 rounded-full border border-gray-400/30 min-w-fit">
                <Image 
                  src="/icons/ui/dev-holding-icon.svg" 
                  alt="Dev Holding" 
                  width={10} 
                  height={10} 
                  className="opacity-80"
                  style={iconStyle}
                />
                <span className={`${textColorClass} text-xs`}>
                  {isDevSold ? 'DS' : `${(token.devPercentage ?? token.devHoldingsPercentage ?? 0).toFixed(1)}%`}
                </span>
                {/* Tooltip */}
                <div className="absolute top-full left-0 mt-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-none whitespace-nowrap z-[9999] pointer-events-none" style={{ willChange: 'opacity' }}>
                  Dev holding
                </div>
              </div>
            )
          })()}
          {(() => {
            const snipersValue = token.snipersTotalPercentage ?? token.snipers ?? 0
            // <= 5%: green, > 5%: red
            const isHigh = snipersValue > 5
            const iconStyle = isHigh
              ? { filter: 'brightness(0) saturate(100%) invert(27%) sepia(95%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)' } // Red filter
              : { filter: 'brightness(0) saturate(100%) invert(67%) sepia(61%) saturate(456%) hue-rotate(87deg) brightness(118%) contrast(119%)' } // Green filter
            const textColorClass = isHigh ? "text-red-400" : "text-green-400"
            
            return (
              <div className="relative group flex items-center justify-center gap-0.5 px-1.5 py-0.5 rounded-full border border-gray-400/30 min-w-fit">
                <Image 
                  src="/icons/ui/snipers-icon.svg" 
                  alt="Snipers" 
                  width={10} 
                  height={10} 
                  className="opacity-80"
                  style={iconStyle}
                />
                <span className={`${textColorClass} text-xs`}>{snipersValue.toFixed(1)}%</span>
                {/* Tooltip */}
                <div className="absolute top-full left-0 mt-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-none whitespace-nowrap z-[9999] pointer-events-none" style={{ willChange: 'opacity' }}>
                  Snipers
                </div>
              </div>
            )
          })()}
          <div className="relative group flex items-center justify-center gap-0.5 px-1.5 py-0.5 rounded-full border border-gray-400/30 min-w-fit">
            <Image 
              src="/icons/ui/insiders-icon.svg" 
              alt="Insiders" 
              width={10} 
              height={10} 
              className="opacity-80 brightness-0 invert"
            />
            <span className="text-white text-xs">{(token.insidersTotalPercentage ?? token.insiders ?? 0).toFixed(1)}%</span>
            {/* Tooltip */}
            <div className="absolute top-full left-0 mt-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-none whitespace-nowrap z-[9999] pointer-events-none" style={{ willChange: 'opacity' }}>
              Insiders
            </div>
          </div>
        </div>

        {/* Buy Button */}
        <button 
          className="flex items-center gap-1 px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-full text-xs transition-colors"
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
  )
}
