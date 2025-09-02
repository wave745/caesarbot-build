"use client"

import { useState } from "react"
import { Plus, Download, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function PortfolioContent() {
  const [activeTab, setActiveTab] = useState<"portfolio" | "wallets">("portfolio")
  const [activePortfolioTab, setActivePortfolioTab] = useState("overview")

  return (
    <div className="max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Portfolio/Wallets Toggle */}
          <div className="flex bg-[#282828] rounded-lg p-1 w-fit">
            <button
              onClick={() => setActiveTab("portfolio")}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "portfolio" ? "bg-[#d7ab54] text-black" : "text-gray-400 hover:text-white"
              }`}
            >
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border border-current" />
              <span className="hidden sm:inline">Wallet Operations</span>
              <span className="sm:hidden">Wallet</span>
            </button>
            <button
              onClick={() => setActiveTab("wallets")}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "wallets" ? "bg-[#d7ab54] text-black" : "text-gray-400 hover:text-white"
              }`}
            >
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-[#d7ab54] rounded" />
              <span className="hidden sm:inline">Wallets</span>
              <span className="sm:hidden">Wallets</span>
            </button>
          </div>

          {/* Balance and PNL (Portfolio tab only) */}
          {activeTab === "portfolio" && (
            <div className="flex items-center gap-4 sm:gap-8">
              <div>
                <div className="text-xs sm:text-sm text-gray-400">Balance 📅</div>
                <div className="text-base sm:text-lg font-medium text-white">$0.00</div>
              </div>
              <div>
                <div className="text-xs sm:text-sm text-gray-400">Unrealized PNL</div>
                <div className="text-base sm:text-lg font-medium text-white">$0.00</div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {activeTab === "portfolio" ? (
            <div className="text-gray-400 text-xs sm:text-sm">No wallet connected</div>
          ) : (
            <div className="text-gray-400 text-xs sm:text-sm">No wallets available</div>
          )}
        </div>
      </div>

      {/* Portfolio Tab Content */}
      {activeTab === "portfolio" && (
        <>
          {/* Portfolio Sub-tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-4">
            <div className="flex gap-2 sm:gap-6 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
              {["Overview", "Open positions (0)", "Closed positions", "Trades", "Open orders (0)"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActivePortfolioTab(tab.toLowerCase().replace(/\s+/g, "-"))}
                  className={`text-xs sm:text-sm font-medium pb-2 border-b-2 transition-colors whitespace-nowrap ${
                    (tab === "Overview" && activePortfolioTab === "overview") ||
                    activePortfolioTab === tab.toLowerCase().replace(/\s+/g, "-")
                      ? "text-[#d7ab54] border-[#d7ab54]"
                      : "text-gray-400 border-transparent hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="bg-[#282828] border-[#282828] text-white hover:bg-[#282828] p-2 sm:px-3">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-[#d7ab54] rounded mr-1 sm:mr-2" />
              </Button>
              <Button variant="outline" size="sm" className="bg-[#282828] border-[#282828] text-white hover:bg-[#282828] p-2 sm:px-3">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-[#282828] rounded-full mr-1 sm:mr-2" />
              </Button>
              <Button variant="outline" size="sm" className="bg-[#282828] border-[#282828] text-white hover:bg-[#282828] p-2 sm:px-3">
                <Filter className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Filter</span>
              </Button>
            </div>
          </div>

          {/* Portfolio Content */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <Card className="bg-[#282828] border-[#282828] p-4 sm:p-8">
              <div className="text-center">
                <div className="text-gray-400 mb-2 text-sm sm:text-base">You don't have assets in any of the selected wallets</div>
              </div>
            </Card>
            <Card className="bg-[#282828] border-[#282828] p-4 sm:p-8">
              <div className="text-center">
                <div className="text-gray-400 mb-2 text-sm sm:text-base">You don't have assets in any of the selected wallets</div>
              </div>
            </Card>
          </div>
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
                <span className="bg-[#282828] text-gray-300 px-2 py-1 rounded text-xs sm:text-sm">0</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="bg-[#d7ab54] hover:bg-[#c49730] text-black text-xs sm:text-sm">
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Create
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-[#282828] border-[#282828] text-white hover:bg-[#282828] text-xs sm:text-sm"
                >
                  <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Import
                </Button>
              </div>
            </div>

            <Card className="bg-[#282828] border-[#282828] p-4 sm:p-8">
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
                <span className="bg-[#282828] text-gray-300 px-2 py-1 rounded text-xs sm:text-sm">0</span>
              </div>
              <Button size="sm" className="bg-[#d7ab54] hover:bg-[#c49730] text-black text-xs sm:text-sm">
                <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Add
              </Button>
            </div>

            <Card className="bg-[#282828] border-[#282828] p-4 sm:p-8">
              <div className="text-center">
                <div className="text-gray-400 mb-2 text-sm sm:text-base">You don't have SOL withdrawal wallets</div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
