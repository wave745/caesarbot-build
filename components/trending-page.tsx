"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  SlidersHorizontal,
  Wallet,
  ChevronDown,
  TrendingUp,
  Star,
  Leaf,
  Send,
  Users,
  Shield,
  Zap,
  Pause
} from "lucide-react"
import { PumpLiveStream } from "@/components/pump-live-stream"
import { PumpLiveGrid } from "@/components/pump-live-grid"
import { PumpLiveProper } from "@/components/pump-live-proper"
import { NewTokensSection } from "@/components/new-tokens-section"
import { TrendingTokensSection } from "@/components/trending-tokens-section"
import { DexTokensSection } from "@/components/dex-tokens-section"
import { PumpLiveDropdown } from "@/components/pump-live-dropdown"
import { LiveTracker } from "@/components/live-tracker"
import { TopStreamTokens } from "@/components/top-stream-tokens"
import { TrendingFilterModal } from "@/components/trending-filter-modal"
// Removed PumpPortal import - now using Moralis API
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function TrendingPage() {
  const [timeframe, setTimeframe] = useState("1m")
  const [quickBuyAmount, setQuickBuyAmount] = useState(5)
  const [selectedWallet, setSelectedWallet] = useState("Wallet 1")
  const [activeTab, setActiveTab] = useState("trending")
  const [isNewTabHovered, setIsNewTabHovered] = useState(false)
  const [sortBy, setSortBy] = useState<'new' | 'volume' | 'marketCap' | 'change' | 'priceChange'>('new')
  const [pumpLiveOption, setPumpLiveOption] = useState<'live-tracker' | 'top-stream-tokens'>('live-tracker')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState<any>(null)


  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toFixed(2)
  }

  return (
    <div className="max-w-7xl mx-auto">

      {/* Top Controls Bar with Tabs and Sort Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 sm:mb-6 gap-4 border-b border-[#282828] pb-4">
        {/* Left side - Tabs */}
        <div className="flex items-center gap-4">
          {/* Tabs */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab("trending")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-0 ${
                activeTab === "trending"
                  ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-black"
                  : "bg-[#111111] text-gray-400 hover:text-white border border-[#282828]"
              }`}
            >
              Trending
            </button>
            <button
              onClick={() => setActiveTab("new")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-0 ${
                activeTab === "new"
                  ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-black"
                  : "bg-[#111111] text-gray-400 hover:text-white border border-[#282828]"
              }`}
            >
              New
            </button>
            <button
              onClick={() => setActiveTab("dex")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-0 ${
                activeTab === "dex"
                  ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-black"
                  : "bg-[#111111] text-gray-400 hover:text-white border border-[#282828]"
              }`}
            >
              Dex
            </button>
            <PumpLiveDropdown
              onOptionSelect={(option) => {
                setPumpLiveOption(option)
                setActiveTab("pump-live")
              }}
              activeOption={activeTab === "pump-live" ? pumpLiveOption : undefined}
            />
          </div>
        </div>

        {/* Center - Sort Controls */}
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-sm font-medium">Sort by:</span>
          <div className="flex items-center gap-2 flex-wrap">
            {activeTab === "dex" ? (
              [
                { key: 'volume', label: 'Volume' },
                { key: 'marketCap', label: 'Market Cap' },
                { key: 'priceChange', label: 'Price Change' },
                { key: 'new', label: 'New' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setSortBy(key as any)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                    sortBy === key
                      ? 'bg-yellow-500 text-black'
                      : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  {label}
                </button>
              ))
            ) : (
              [
                { key: 'new', label: 'New' },
                { key: 'volume', label: 'Volume' },
                { key: 'marketCap', label: 'Market Cap' },
                { key: 'change', label: 'Change' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setSortBy(key as any)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                    sortBy === key
                      ? 'bg-yellow-500 text-black'
                      : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  {label}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right side - Controls */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFilterOpen(true)}
            className="border-[#282828] text-gray-400 hover:text-white hover:border-yellow-500"
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filter
            {appliedFilters && (
              <div className="ml-2 w-2 h-2 bg-blue-500 rounded-full" />
            )}
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">Quick Buy</span>
            <Input
              type="number"
              value={quickBuyAmount}
              onChange={(e) => setQuickBuyAmount(Number(e.target.value))}
              className="w-16 h-8 bg-[#111111] border-[#282828] text-white text-center text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-gray-400" />
            <select
              value={selectedWallet}
              onChange={(e) => setSelectedWallet(e.target.value)}
              className="bg-[#111111] border-[#282828] text-white text-sm px-3 py-1 rounded"
            >
              <option value="Wallet 1">Wallet 1</option>
              <option value="Wallet 2">Wallet 2</option>
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full">
        {activeTab === "trending" && <TrendingTokensSection sortBy={sortBy === 'priceChange' ? 'new' : sortBy as 'new' | 'volume' | 'marketCap' | 'change'} filters={appliedFilters} />}
        {activeTab === "new" && <NewTokensSection onHoverChange={setIsNewTabHovered} />}
        {activeTab === "dex" && <DexTokensSection sortBy={sortBy === 'change' ? 'new' : sortBy as 'new' | 'volume' | 'marketCap' | 'priceChange'} />}
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
    </div>
  )
}
