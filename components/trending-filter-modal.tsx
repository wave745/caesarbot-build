"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  X, 
  RotateCcw, 
  Download, 
  Upload, 
  Save,
  Info,
  Check
} from "lucide-react"

interface FilterState {
  // Launchpads
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
  
  // Checkbox filters
  atLeastOneSocial: boolean
  originalSocials: boolean
  originalAvatar: boolean
  dexPaid: boolean
  devStillHolding: boolean
  pumpLive: boolean
  
  // Keyword filters
  includeKeywords: string
  excludeKeywords: string
  
  // Range filters
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

interface TrendingFilterModalProps {
  isOpen: boolean
  onClose: () => void
  onApply: (filters: FilterState) => void
  initialFilters?: Partial<FilterState>
  selectedChain?: 'solana' | 'bnb'
}

const launchpadData = [
  { id: 'pumpfun', name: 'Pump.fun', color: 'bg-green-500', icon: '/icons/platforms/pump.fun-logo.svg' },
  { id: 'bonk', name: 'Bonk.fun', color: 'bg-orange-500', icon: '/icons/platforms/bonk.fun-logo.svg' },
  { id: 'moonit', name: 'Moon.it', color: 'bg-yellow-500', icon: '/icons/platforms/moon.it-logo.png' },
  { id: 'pumpswap', name: 'Pumpswap', color: 'bg-blue-500', icon: '/icons/platforms/pumpswap-logo.svg' },
  { id: 'moonshot', name: 'Moonshot', color: 'bg-purple-500', icon: '/icons/platforms/moonshot-logo.svg' },
  { id: 'boop', name: 'Boop.fun', color: 'bg-blue-400', icon: '/icons/platforms/boop.fun-logo.svg' },
  { id: 'orca', name: 'Orca', color: 'bg-teal-500', icon: '/icons/platforms/orca.so-logo.svg' },
  { id: 'meteora', name: 'Meteora', color: 'bg-red-500', icon: '/icons/platforms/meteora.ag(met-dbc)-logo.png' },
  { id: 'raydium', name: 'Raydium', color: 'bg-red-600', icon: '/icons/platforms/raydium-launchlab-logo.svg' },
  { id: 'bagsfm', name: 'Bags.fm', color: 'bg-green-600', icon: '/icons/platforms/bags.fm-logo.png' },
  { id: 'believeapp', name: 'Believe.app', color: 'bg-green-500', icon: '/icons/platforms/believe.app-logo.png' },
  { id: 'jupiter', name: 'Jupiter', color: 'bg-blue-500', icon: '/icons/platforms/jupiter-ag-jup-logo.svg' }
]

export function TrendingFilterModal({ isOpen, onClose, onApply, initialFilters, selectedChain = 'solana' }: TrendingFilterModalProps) {
  const [activeTab, setActiveTab] = useState<'manual' | 'saved'>('manual')
  const [filters, setFilters] = useState<FilterState>({
    launchpads: {
      pumpfun: true,
      bonk: true,
      metdbc: true,
      bagsfm: true,
      believeapp: true,
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
    alphaGroupMentions: { min: '', max: '' },
    ...initialFilters
  })

  const updateFilter = (path: string, value: any) => {
    setFilters(prev => {
      const keys = path.split('.')
      const newFilters = { ...prev }
      let current = newFilters as any
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]] = { ...current[keys[i]] }
      }
      
      current[keys[keys.length - 1]] = value
      return newFilters
    })
  }

  const selectAllLaunchpads = () => {
    const allSelected = Object.values(filters.launchpads).every(Boolean)
    const newLaunchpads = Object.keys(filters.launchpads).reduce((acc, key) => {
      acc[key as keyof typeof filters.launchpads] = !allSelected
      return acc
    }, {} as typeof filters.launchpads)
    
    updateFilter('launchpads', newLaunchpads)
  }

  const handleApply = () => {
    onApply(filters)
    onClose()
  }

  const handleReset = () => {
    setFilters({
      launchpads: {
        pumpfun: false,
        bonk: false,
        moonit: false,
        pumpswap: false,
        moonshot: false,
        boop: false,
        orca: false,
        meteora: false,
        raydium: false,
        bagsfm: false,
        believeapp: false,
        jupiter: false
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
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0b0b0b] border border-[#1e1e1e] rounded-2xl max-w-[460px] w-full max-h-[85vh] flex flex-col backdrop-blur-xl shadow-[0_0_20px_rgba(0,0,0,0.6)]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#282828]">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-white">Filters</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-gray-400 hover:text-white h-7 w-7 p-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white h-7 w-7 p-0"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
            {/* Protocols Section */}
            {selectedChain === 'solana' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-medium text-white">Protocols</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={selectAllLaunchpads}
                    className="text-xs text-gray-400 hover:text-white"
                  >
                    {Object.values(filters.launchpads).every(Boolean) ? 'Unselect All' : 'Select All'}
                  </Button>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  {launchpadData.map((launchpad) => (
                    <button
                      key={launchpad.id}
                      onClick={() => updateFilter(`launchpads.${launchpad.id}`, !filters.launchpads[launchpad.id as keyof typeof filters.launchpads])}
                      className={`flex items-center gap-2 px-3 py-2 rounded-full border transition-all duration-300 text-xs ${
                        filters.launchpads[launchpad.id as keyof typeof filters.launchpads]
                          ? launchpad.id === 'pumpfun' 
                            ? 'border-green-500 bg-green-500/10'
                            : launchpad.id === 'bonk'
                            ? 'border-orange-500 bg-orange-500/10'
                            : launchpad.id === 'moonit'
                            ? 'border-yellow-500 bg-yellow-500/10'
                            : launchpad.id === 'pumpswap'
                            ? 'border-blue-500 bg-blue-500/10'
                            : launchpad.id === 'moonshot'
                            ? 'border-purple-500 bg-purple-500/10'
                            : launchpad.id === 'boop'
                            ? 'border-blue-400 bg-blue-400/10'
                            : launchpad.id === 'orca'
                            ? 'border-teal-500 bg-teal-500/10'
                            : launchpad.id === 'meteora'
                            ? 'border-red-500 bg-red-500/10'
                            : launchpad.id === 'raydium'
                            ? 'border-red-600 bg-red-600/10'
                            : launchpad.id === 'bagsfm'
                            ? 'border-green-600 bg-green-600/10'
                            : launchpad.id === 'believeapp'
                            ? 'border-green-500 bg-green-500/10'
                            : launchpad.id === 'jupiter'
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-green-500 bg-green-500/10'
                          : 'border-[#282828] hover:border-gray-600'
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full flex items-center justify-center">
                        <img 
                          src={launchpad.icon} 
                          alt={launchpad.name}
                          className="w-4 h-4 object-contain"
                        />
                      </div>
                      <span className="text-xs font-medium text-white">{launchpad.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Keyword Filters */}
            <div className="space-y-3">
              <h3 className="text-base font-medium text-white">Keywords</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-2 block">Search Keywords</label>
                  <Input
                    value={filters.includeKeywords}
                    onChange={(e) => updateFilter('includeKeywords', e.target.value)}
                    placeholder="keyword1, keyword2..."
                    className="bg-[#111111] border-[#282828] text-white h-9 text-xs"
                  />
                </div>
                
                <div>
                  <label className="text-xs text-gray-400 mb-2 block">Exclude Keywords</label>
                  <Input
                    value={filters.excludeKeywords}
                    onChange={(e) => updateFilter('excludeKeywords', e.target.value)}
                    placeholder="keyword1, keyword2..."
                    className="bg-[#111111] border-[#282828] text-white h-9 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Range Filters */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-white">Range Filters</h3>
              
              {[
                { key: 'marketCap', label: 'Market cap', symbol: '$' },
                { key: 'volume', label: 'Volume', symbol: '$' },
                { key: 'liquidity', label: 'Liquidity', symbol: '$' },
                { key: 'top10Holders', label: 'Top 10 holders', symbol: '%' },
                { key: 'insidersHoldings', label: 'Insiders holdings', symbol: '%' },
                { key: 'snipersHoldings', label: 'Snipers holdings', symbol: '%' },
                { key: 'curveProgress', label: 'Curve progress', symbol: '%' },
                { key: 'buys', label: 'Buys', symbol: '' },
                { key: 'sells', label: 'Sells', symbol: '' },
                { key: 'devBonded', label: 'Dev bonded', symbol: '' },
                { key: 'totalFees', label: 'Total fees (SOL)', symbol: '' },
                { key: 'freshWalletsBuys', label: 'Fresh wallets buys (SOL)', symbol: '' },
                { key: 'tokenAge', label: 'Token age (mins)', symbol: '' },
                { key: 'holders', label: 'Holders', symbol: '' },
                { key: 'proHolders', label: 'Pro holders', symbol: '' },
                { key: 'bundlesHolding', label: 'Bundles holding', symbol: '%' },
                { key: 'devHolding', label: 'Dev holding', symbol: '%' },
                { key: 'alphaGroupMentions', label: 'Alpha group mentions', symbol: '', hasInfo: true }
              ].map((filter) => (
                <div key={filter.key} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-300">{filter.label}</span>
                    {filter.hasInfo && <Info className="w-3 h-3 text-gray-500" />}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <Input
                        value={filters[filter.key as keyof FilterState].min}
                        onChange={(e) => updateFilter(`${filter.key}.min`, e.target.value)}
                        placeholder="Min"
                        className="bg-[#111111] border-[#282828] text-white text-xs"
                      />
                    </div>
                    <span className="text-gray-400 text-xs">{filter.symbol}</span>
                    <div className="flex-1">
                      <Input
                        value={filters[filter.key as keyof FilterState].max}
                        onChange={(e) => updateFilter(`${filter.key}.max`, e.target.value)}
                        placeholder="Max"
                        className="bg-[#111111] border-[#282828] text-white text-xs"
                      />
                    </div>
                    <span className="text-gray-400 text-xs">{filter.symbol}</span>
                  </div>
                </div>
              ))}
            </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-center gap-2 px-4 py-2.5 border-t border-[#282828]">
          <Button
            variant="outline"
            size="sm"
            className="bg-[#111111] border-[#282828] text-white hover:bg-[#282828] px-4 py-1.5 text-xs h-8"
          >
            <Upload className="w-3 h-3 mr-1.5" />
            Import
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="bg-[#111111] border-[#282828] text-white hover:bg-[#282828] px-4 py-1.5 text-xs h-8"
          >
            <Download className="w-3 h-3 mr-1.5" />
            Export
          </Button>
          <Button
            onClick={handleApply}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 text-xs h-8"
          >
            Apply All
          </Button>
        </div>
      </div>
    </div>
  )
}
