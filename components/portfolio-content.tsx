"use client"

import { useState } from "react"
import Image from "next/image"
import { Plus, SlidersHorizontal, ChevronDown, Grid3x3, RefreshCw, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { PNLChartInteractive } from "@/components/pnl-chart-interactive"
import { PNLCalendarModal } from "@/components/pnl-calendar-modal"
import { PNLCardsModal } from "@/components/pnl-cards-modal"

export function PortfolioContent() {
  const [activeTab, setActiveTab] = useState<"portfolio" | "wallets">("portfolio")
  const [activePortfolioTab, setActivePortfolioTab] = useState("overview")
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false)
  const [isCardsModalOpen, setIsCardsModalOpen] = useState(false)
  const [isMonthlyCard, setIsMonthlyCard] = useState(false)
  const [selectedCurrency, setSelectedCurrency] = useState<"SOL" | "BNB" | "USD">("SOL")
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date())

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Top Header */}
      <div className="mb-6">
        {/* Portfolio/Wallets Tabs */}
        <div className="flex items-center gap-6 mb-4">
          <button
            onClick={() => setActiveTab("portfolio")}
            className={`text-base font-medium transition-colors ${
              activeTab === "portfolio" ? "text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            Portfolio
          </button>
          <button
            onClick={() => setActiveTab("wallets")}
            className={`text-base font-medium transition-colors ${
              activeTab === "wallets" ? "text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            Wallets
          </button>
        </div>

        {/* Balance, PNL, and Wallet Selector Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Left: Balance and PNL */}
          {activeTab === "portfolio" && (
            <div className="flex items-center gap-4 sm:gap-8 flex-wrap">
              <div>
                <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-400">
                  <span>Balance</span>
                  <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </div>
                <div className="text-base sm:text-lg font-medium text-white">$0.00</div>
              </div>
              <div>
                <div className="text-xs sm:text-sm text-gray-400">Unrealized PNL</div>
                <div className="text-base sm:text-lg font-medium text-white">$0.00</div>
              </div>
            </div>
          )}

          {/* Right: Wallet Selector and Icons */}
          {activeTab === "portfolio" && (
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              {/* Wallet Selector */}
              <button className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-[#111111] border border-[#282828] rounded-lg hover:bg-[#1a1a1a] transition-colors flex-1 sm:flex-initial min-w-0">
                <Image 
                  src="/sol-logo.png" 
                  alt="Solana" 
                  width={14} 
                  height={14} 
                  className="rounded flex-shrink-0 sm:w-4 sm:h-4"
                />
                <span className="text-xs sm:text-sm text-white font-medium truncate">Starting Solana Wallet</span>
                <span className="text-xs text-gray-400 hidden sm:inline">$0.00</span>
                <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
              </button>

              {/* Icon Buttons */}
              <Button variant="outline" size="sm" className="bg-[#111111] border-[#282828] text-white hover:bg-[#1a1a1a] p-2 h-8 w-8 sm:h-9 sm:w-9">
                <Grid3x3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Button>
              <Button variant="outline" size="sm" className="bg-[#111111] border-[#282828] text-white hover:bg-[#1a1a1a] p-2 h-8 w-8 sm:h-9 sm:w-9">
                <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Button>
              <Button variant="outline" size="sm" className="bg-[#111111] border-[#282828] text-white hover:bg-[#1a1a1a] px-2 sm:px-3 h-8 sm:h-9 relative">
                <SlidersHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2" />
                <span className="text-xs sm:text-sm hidden sm:inline">Filters</span>
                <span className="absolute -top-1 -right-1 bg-yellow-500 text-black text-xs font-bold rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[10px] sm:text-xs">1</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Portfolio Tab Content */}
      {activeTab === "portfolio" && (
        <>
          {/* Portfolio Sub-tabs */}
          <div className="flex items-center justify-between mb-4 sm:mb-6 border-b border-[#282828]">
            <div className="flex gap-3 sm:gap-6 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
              {["Overview", "Open positions (0)", "Closed positions", "Trades", "Open orders (0)"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActivePortfolioTab(tab.toLowerCase().replace(/\s+/g, "-"))}
                  className={`text-xs sm:text-sm font-medium pb-2 border-b-2 transition-colors whitespace-nowrap ${
                    (tab === "Overview" && activePortfolioTab === "overview") ||
                    activePortfolioTab === tab.toLowerCase().replace(/\s+/g, "-")
                      ? "text-blue-500 border-blue-500"
                      : "text-gray-400 border-transparent hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Portfolio Content - Two Column Layout */}
          {activePortfolioTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Empty State */}
              <div className="lg:col-span-1">
                <Card className="bg-[#111111] border-[#282828] p-6 h-full">
                  <div className="text-gray-400 text-sm text-center">
                    You don&apos;t have assets in any of the selected wallets
                  </div>
                </Card>
              </div>

              {/* Right Column - PNL Chart */}
              <div className="lg:col-span-2">
                <Card className="bg-[#111111] border-[#282828] p-6 h-full">
                  <div className="h-full flex flex-col">
                    <PNLChartInteractive 
                      onCalendarClick={() => setIsCalendarModalOpen(true)}
                    />
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Other Tabs Content */}
          {activePortfolioTab !== "overview" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <Card className="bg-[#111111] border-[#282828] p-4 sm:p-8">
                <div className="text-center">
                  <div className="text-gray-400 mb-2 text-sm sm:text-base">You don&apos;t have assets in any of the selected wallets</div>
                </div>
              </Card>
              <Card className="bg-[#111111] border-[#282828] p-4 sm:p-8">
                <div className="text-center">
                  <div className="text-gray-400 mb-2 text-sm sm:text-base">You don&apos;t have assets in any of the selected wallets</div>
                </div>
              </Card>
            </div>
          )}
        </>
      )}

      {/* Wallets Tab Content */}
      {activeTab === "wallets" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Trading Wallets */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-medium text-white">Trading Wallets</h2>
                <span className="bg-[#111111] text-gray-300 px-2 py-1 rounded text-xs sm:text-sm">0</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black text-xs sm:text-sm">
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Create
                </Button>

              </div>
            </div>

            <Card className="bg-[#111111] border-[#282828] p-4 sm:p-8">
              <div className="text-center">
                <div className="text-gray-400 mb-4 text-sm sm:text-base">No trading wallets connected</div>
                <div className="text-xs sm:text-sm text-gray-500">Create or import a wallet to get started</div>
              </div>
            </Card>
          </div>

          {/* Withdrawal Wallets */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-medium text-white">Withdrawal Wallets</h2>
                <span className="bg-[#111111] text-gray-300 px-2 py-1 rounded text-xs sm:text-sm">0</span>
              </div>
              <Button size="sm" className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black text-xs sm:text-sm">
                <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Add
              </Button>
            </div>

            <Card className="bg-[#111111] border-[#282828] p-4 sm:p-8">
              <div className="text-center">
                <div className="text-gray-400 mb-2 text-sm sm:text-base">You don&apos;t have SOL withdrawal wallets</div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* PNL Calendar Modal */}
      <PNLCalendarModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        currency={selectedCurrency}
        onCurrencyChange={setSelectedCurrency}
        onDayClick={(date) => {
          setSelectedDate(date)
          setIsMonthlyCard(false)
          setIsCardsModalOpen(true)
        }}
        onMonthlyPNLClick={(month) => {
          setSelectedMonth(month)
          setIsMonthlyCard(true)
          setIsCardsModalOpen(true)
        }}
      />

      {/* PNL Cards Modal */}
      <PNLCardsModal
        isOpen={isCardsModalOpen}
        onClose={() => setIsCardsModalOpen(false)}
        selectedDate={selectedDate}
        currency={selectedCurrency}
        isMonthly={isMonthlyCard}
        monthData={isMonthlyCard ? {
          month: selectedMonth,
          totalPNL: 0.00, // Replace with actual monthly PNL data
          totalBought: 0.00, // Replace with actual monthly data
          totalSold: 0.00, // Replace with actual monthly data
          pnlPercentage: 0.00 // Replace with actual monthly data
        } : undefined}
      />
    </div>
  )
}
