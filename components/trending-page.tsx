"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { 
  SlidersHorizontal,
  Zap,
  EyeOff,
  Eye,
  BookmarkX,
  Check
} from "lucide-react"
import { NewTokensSection } from "@/components/new-tokens-section"
import { TrendingTokensSection } from "@/components/trending-tokens-section"
import { LiveTracker } from "@/components/live-tracker"
import { TopStreamTokens } from "@/components/top-stream-tokens"
import { TrendingFilterModal } from "@/components/trending-filter-modal"
import { PresetsModal } from "@/components/presets-modal"
import { BlacklistModal } from "@/components/blacklist-modal"

export function TrendingPage() {
  const [timeframe, setTimeframe] = useState("5m")
  const [activeTab, setActiveTab] = useState("trending")
  const [sortBy, setSortBy] = useState<'new' | 'volume' | 'marketCap' | 'change' | 'priceChange'>('new')
  const [pumpLiveOption, setPumpLiveOption] = useState<'live-tracker' | 'top-stream-tokens'>('live-tracker')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [solAmount, setSolAmount] = useState("0")
  const [isPresetsModalOpen, setIsPresetsModalOpen] = useState(false)
  const [isBlacklistModalOpen, setIsBlacklistModalOpen] = useState(false)
  const [isEyeDropdownOpen, setIsEyeDropdownOpen] = useState(false)
  const [hiddenOption, setHiddenOption] = useState<"hide-hidden" | "unhide-on-migration" | "show-hidden">("hide-hidden")
  const eyeDropdownRef = useRef<HTMLDivElement>(null)
  const [presets, setPresets] = useState({
    P1: { prio: "0.001", tip: "0.001", slippage: "1", mev: false },
    P2: { prio: "0.001", tip: "0.001", slippage: "1", mev: false },
    P3: { prio: "0.001", tip: "0.001", slippage: "1", mev: false }
  })

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (eyeDropdownRef.current && !eyeDropdownRef.current.contains(event.target as Node)) {
        setIsEyeDropdownOpen(false)
      }
    }

    if (isEyeDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isEyeDropdownOpen])

  return (
    <div className="max-w-7xl mx-auto">

      {/* Top Controls Bar - New Layout */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 sm:mb-6 gap-4 border-b border-[#282828] pb-4">
        {/* Left side - Trending title and sub-tabs with time filters */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("trending")}
            className={`px-4 py-2 text-xl transition-all ${
              activeTab === "trending"
                ? "text-white font-bold"
                : "text-gray-400 hover:text-white font-medium"
            }`}
          >
            Trending
          </button>
          <button
            onClick={() => setActiveTab("dex")}
            className={`px-4 py-2 text-xl transition-all ${
              activeTab === "dex"
                ? "text-white font-bold"
                : "text-gray-400 hover:text-white font-medium"
            }`}
          >
            Dex
          </button>
          <button
            onClick={() => setActiveTab("new")}
            className={`px-4 py-2 text-xl transition-all ${
              activeTab === "new"
                ? "text-white font-bold"
                : "text-gray-400 hover:text-white font-medium"
            }`}
          >
            New
          </button>
          <button
            onClick={() => setActiveTab("pump-live")}
            className={`px-4 py-2 text-xl transition-all ${
              activeTab === "pump-live"
                ? "text-white font-bold"
                : "text-gray-400 hover:text-white font-medium"
            }`}
          >
            Pump Live
          </button>
          
          {/* Time Filters - moved here to be closer to Pump Live */}
          <div className="flex items-center gap-2 ml-2">
          {['1m', '5m', '30m', '1h'].map((time) => (
            <button
              key={time}
              onClick={() => setTimeframe(time)}
              className={`px-3 py-1.5 text-sm transition-all ${
                timeframe === time
                  ? "text-white font-bold"
                  : "text-gray-400 hover:text-white font-medium"
              }`}
            >
              {time.toUpperCase()}
            </button>
          ))}
          </div>
          
          {/* Filter and Logos - moved closer to time filters */}
          <div className="flex items-center gap-2 ml-2">
            <button
              onClick={() => setIsFilterOpen(true)}
              className="px-3 py-1.5 text-gray-400 hover:text-white transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
            <button className="px-3 py-1.5 text-gray-400 hover:text-white transition-colors">
              <img src="/sol-logo.png" alt="Solana" className="w-4 h-4" />
            </button>
            <button className="px-1.5 py-1.5 text-gray-400 hover:text-white transition-colors">
              <img 
                src="/bnb-chain-binance-smart-chain-logo.svg" 
                alt="BNB Chain" 
                className="w-4 h-4"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                }}
              />
            </button>
          </div>
        </div>

        {/* Right side - Search and other icons */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-24 h-7 bg-[#111111] border border-[#282828] rounded text-white text-xs pl-2 pr-2"
            />
          </div>
          {/* Grouped container for lightning, SOL amount input, P1 */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#111111] border border-[#282828] rounded-lg">
            <Zap className="w-4 h-4 text-gray-400" />
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={solAmount}
                onChange={(e) => setSolAmount(e.target.value)}
                placeholder="0"
                className="w-10 bg-transparent text-white text-xs outline-none border-none focus:ring-0 p-0"
                min="0"
                step="0.01"
              />
              <img src="/sol-logo.png" alt="Solana" className="w-3.5 h-3.5" />
            </div>
            <button
              onClick={() => setIsPresetsModalOpen(true)}
              className="text-white text-xs hover:text-gray-300 transition-colors cursor-pointer"
            >
              P1
            </button>
          </div>
          <div className="relative" ref={eyeDropdownRef}>
            <button
              onClick={() => setIsEyeDropdownOpen(!isEyeDropdownOpen)}
              className={`p-1.5 transition-colors ${
                hiddenOption === "unhide-on-migration"
                  ? "text-yellow-500 hover:text-yellow-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {hiddenOption === "hide-hidden" ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
            {isEyeDropdownOpen && (
              <div 
                className="absolute right-0 top-full mt-2 w-48 bg-[#0b0b0b] border border-[#1f1f1f] rounded-lg shadow-xl z-50"
              >
                <div className="py-1">
                  <button
                    onClick={() => {
                      setHiddenOption("hide-hidden")
                      setIsEyeDropdownOpen(false)
                    }}
                    className="w-full px-4 py-2 text-sm text-white hover:bg-[#111111] flex items-center justify-between transition-colors"
                  >
                    <span>Hide hidden</span>
                    {hiddenOption === "hide-hidden" && (
                      <Check className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setHiddenOption("unhide-on-migration")
                      setIsEyeDropdownOpen(false)
                    }}
                    className="w-full px-4 py-2 text-sm text-white hover:bg-[#111111] flex items-center justify-between transition-colors"
                  >
                    <span>Unhide on migration</span>
                    {hiddenOption === "unhide-on-migration" && (
                      <Check className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setHiddenOption("show-hidden")
                      setIsEyeDropdownOpen(false)
                    }}
                    className="w-full px-4 py-2 text-sm text-white hover:bg-[#111111] flex items-center justify-between transition-colors"
                  >
                    <span>Show hidden</span>
                    {hiddenOption === "show-hidden" && (
                      <Check className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsBlacklistModalOpen(true)}
            className="p-1.5 bg-gray-800 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
          >
            <BookmarkX className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full">
        {activeTab === "trending" && <TrendingTokensSection sortBy={sortBy === 'priceChange' ? 'new' : sortBy as 'new' | 'volume' | 'marketCap' | 'change'} filters={appliedFilters} />}
        {activeTab === "new" && <NewTokensSection />}
        {activeTab === "dex" && <TrendingTokensSection sortBy={sortBy === 'change' ? 'new' : sortBy as 'new' | 'volume' | 'marketCap' | 'priceChange'} filters={appliedFilters} />}
        {activeTab === "pump-live" && pumpLiveOption === "live-tracker" && <LiveTracker />}
        {activeTab === "pump-live" && pumpLiveOption === "top-stream-tokens" && <TopStreamTokens />}
      </div>

      {/* Filter Modal */}
      <TrendingFilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApply={(filters) => {
          setAppliedFilters(filters)
          setIsFilterOpen(false)
        }}
        initialFilters={appliedFilters}
      />

      {/* Presets Modal */}
      <PresetsModal
        isOpen={isPresetsModalOpen}
        onClose={() => setIsPresetsModalOpen(false)}
        presets={presets}
        onSave={(newPresets) => {
          setPresets(newPresets)
        }}
      />

      {/* Blacklist Modal */}
      <BlacklistModal
        isOpen={isBlacklistModalOpen}
        onClose={() => setIsBlacklistModalOpen(false)}
      />
    </div>
  )
}
