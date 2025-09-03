"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Search } from "lucide-react"
import { useState } from "react"

export function DashboardContent() {
  const [selectedView, setSelectedView] = useState<"price" | "volume" | "wallet">("price")
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">DASHBOARD</h1>
      </div>

      {/* Secondary Navigation */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 border-b border-[#282828] pb-4">
        <div className="flex items-center gap-6">
          {["Overview", "Assets", "Liquidity"].map((item, index) => (
            <button
              key={item}
              className={`text-sm font-medium transition-colors hover:text-[#d7ab54] ${
                index === 0 ? "text-white border-b-2 border-[#d7ab54] pb-1 sm:pb-2" : "text-gray-400"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Pool Performance */}
        <Card className="lg:col-span-2 bg-[#282828] border-[#282828]">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <CardTitle className="text-white text-lg sm:text-xl">Market Overview</CardTitle>
              <div className="relative bg-[#1a1a1a] rounded-lg p-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search tokens..."
                  className="pl-10 w-40 bg-transparent border-0 text-white placeholder-gray-400 text-sm focus:ring-0 focus:ring-offset-0"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2 text-sm">
                <div className="flex bg-[#1a1a1a] rounded-lg p-1">
                  <button 
                    onClick={() => setSelectedView("price")}
                    className={`px-3 py-1 rounded-md text-sm transition-colors ${
                      selectedView === "price" 
                        ? "bg-[#282828] text-white" 
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Price
                  </button>
                  <button 
                    onClick={() => setSelectedView("volume")}
                    className={`px-3 py-1 rounded-md text-sm transition-colors ${
                      selectedView === "volume" 
                        ? "bg-[#282828] text-white" 
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Volume
                  </button>
                  <button 
                    onClick={() => setSelectedView("wallet")}
                    className={`px-3 py-1 rounded-md text-sm transition-colors ${
                      selectedView === "wallet" 
                        ? "bg-[#282828] text-white" 
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Wallet
                  </button>
                </div>
              </div>
              <div className="bg-[#1a1a1a] rounded-lg p-1">
                <select className="bg-transparent text-white text-sm px-3 py-1 border-0 w-full sm:w-auto focus:ring-0 focus:ring-offset-0">
                  <option>24H</option>
                  <option>1H</option>
                  <option>7D</option>
                  <option>30D</option>
                </select>
              </div>

            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 sm:py-12">
              {selectedView === "price" ? (
                <>
                  <div className="text-gray-400 mb-4">No price data available</div>
                  <p className="text-sm text-gray-500">Connect your wallet to view price performance</p>
                </>
              ) : selectedView === "volume" ? (
                <>
                  <div className="text-gray-400 mb-4">No volume data available</div>
                  <p className="text-sm text-gray-500">Connect your wallet to view volume performance</p>
                </>
              ) : (
                <>
                  <div className="text-gray-400 mb-4">No wallet data available</div>
                  <p className="text-sm text-gray-500">Connect your wallet to view wallet performance</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Overview Stats */}
        <Card className="bg-[#282828] border-[#282828]">
          <CardHeader>
            <CardTitle className="text-white text-lg sm:text-xl">Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            {[
              { label: "XX HOUR VOLUME", value: "--" },
              { label: "ACTIVE WALLETS", value: "--" },
              { label: "HOUR TRADES", value: "--" },
              { label: "TOTAL HOLDERS", value: "--" },
              { label: "MARKET RANK", value: "--" },
            ].map((stat, index) => (
                                <div key={index} className="flex justify-between items-center py-2 border-b border-[#282828]">
                <span className="text-gray-400 text-xs sm:text-sm">{stat.label}</span>
                <span className="text-white font-semibold text-sm sm:text-base">{stat.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* META Section */}
        <Card className="bg-[#282828] border-[#282828]">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <CardTitle className="text-white text-lg sm:text-xl">Meta</CardTitle>
              <Button
                variant="outline"
                size="sm"
                className="w-fit bg-[#d7ab54] text-black border-[#d7ab54] hover:bg-[#c49730] text-xs sm:text-sm"
              >
                View all
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6 sm:py-8">
              <div className="text-gray-400 mb-2">No meta analysis available</div>
              <p className="text-sm text-gray-500 mb-4">Analysis will appear here when data is available</p>
              <Link href="/meta">
                <Button className="bg-[#d7ab54] text-black hover:bg-[#c49730] w-full sm:w-auto text-sm">
                  View Full Analysis
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recently Added */}
        <Card className="bg-[#282828] border-[#282828]">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <CardTitle className="text-white text-lg sm:text-xl">Recently Added</CardTitle>
              <Button
                variant="outline"
                size="sm"
                className="text-[#d7a834] border-[#d7a834] bg-transparent hover:bg-[#d7a834] hover:text-black text-xs sm:text-sm"
              >
                Quick Trading
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6 sm:py-8">
              <div className="text-gray-400 mb-2">No recent tokens</div>
              <p className="text-sm text-gray-500">New tokens will appear here</p>
            </div>
          </CardContent>
        </Card>

        {/* Wallet Tracker */}
        <Card className="bg-[#282828] border-[#282828] md:col-span-2 lg:col-span-1">
          <CardHeader>
                          <CardTitle className="text-white text-lg sm:text-xl">Wallet Tracker</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6 sm:py-8">
              <div className="text-gray-400 mb-2">No wallets tracked</div>
              <p className="text-sm text-gray-500 mb-4">Add wallets to start tracking</p>
              <Link href="/tracker">
                <Button className="bg-[#d7a834] text-black hover:bg-[#c49730] w-full sm:w-auto text-sm">
                  Add Wallet
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
