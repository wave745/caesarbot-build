"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  TrendingUp,
  BarChart3,
  CandlestickChart as Candlestick,
  Activity,
  Settings,
  Maximize2,
  Volume2,
  Menu,
  X,
} from "lucide-react"

export function TradingChart() {
  const [selectedPair, setSelectedPair] = useState("BTC/USDT")
  const [orderType, setOrderType] = useState("limit")
  const [side, setSide] = useState("buy")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const tradingPairs: any[] = []

  return (
    <div className="h-screen bg-black text-white overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 h-full gap-1">
        {/* Mobile Menu Toggle */}
        <div className="lg:hidden p-4 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">{selectedPair}</h2>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Left Sidebar - Trading Pairs */}
        <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} lg:block lg:col-span-2 bg-gray-900 border-r border-gray-800 lg:relative absolute top-0 left-0 z-50 w-full lg:w-auto h-full`}>
          <div className="p-3 sm:p-4 border-b border-gray-800">
            <div className="flex items-center justify-between lg:block">
              <h3 className="text-white font-semibold mb-3 text-sm sm:text-base">Markets</h3>
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden text-gray-400 hover:text-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <Input placeholder="Search pairs..." className="bg-gray-800 border-gray-700 text-white text-xs sm:text-sm" />
          </div>
          <div className="p-4 text-center">
            <BarChart3 className="w-8 h-8 sm:w-12 sm:h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 text-xs sm:text-sm">No markets available</p>
          </div>
        </div>

        {/* Main Chart Area */}
        <div className="col-span-1 lg:col-span-7 bg-gray-900">
          {/* Chart Header */}
          <div className="p-3 sm:p-4 border-b border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-4">
              <h2 className="text-lg sm:text-xl font-bold text-white">{selectedPair}</h2>
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-2xl font-bold text-gray-400">--</span>
                <span className="text-gray-400 flex items-center gap-1 text-sm sm:text-base">
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                  --%
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
                <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
                <Candlestick className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
                <Activity className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
                <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
                <Maximize2 className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </div>
          </div>

          {/* Chart */}
          <div className="h-64 sm:h-96 p-3 sm:p-4 flex items-center justify-center">
            <div className="text-center">
              <Candlestick className="w-12 h-12 sm:w-20 sm:h-20 text-gray-600 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">No Chart Data</h3>
              <p className="text-gray-400 text-sm sm:text-base">Chart data will appear when markets are available</p>
            </div>
          </div>

          {/* Chart Controls */}
          <div className="p-3 sm:p-4 border-t border-gray-800">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                <span className="text-gray-400 text-xs sm:text-sm whitespace-nowrap">Timeframe:</span>
                {["1m", "5m", "15m", "1h", "4h", "1d"].map((tf) => (
                  <Button
                    key={tf}
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white hover:bg-gray-800 text-xs sm:text-sm whitespace-nowrap"
                  >
                    {tf}
                  </Button>
                ))}
              </div>
              <div className="flex items-center gap-2 sm:ml-auto">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
                  <Volume2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline ml-1">Volume</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Bottom Trading Info */}
          <div className="p-3 sm:p-4 border-t border-gray-800">
            <Tabs defaultValue="positions" className="w-full">
              <TabsList className="bg-gray-800 border-gray-700">
                <TabsTrigger value="positions" className="data-[state=active]:bg-gray-700 text-xs sm:text-sm">
                  Positions
                </TabsTrigger>
                <TabsTrigger value="orders" className="data-[state=active]:bg-gray-700 text-xs sm:text-sm">
                  Orders
                </TabsTrigger>
                <TabsTrigger value="history" className="data-[state=active]:bg-gray-700 text-xs sm:text-sm">
                  History
                </TabsTrigger>
              </TabsList>
              <TabsContent value="positions" className="mt-4">
                <div className="text-center text-gray-400 py-6 sm:py-8 text-sm sm:text-base">No open positions</div>
              </TabsContent>
              <TabsContent value="orders" className="mt-4">
                <div className="text-center text-gray-400 py-6 sm:py-8 text-sm sm:text-base">No active orders</div>
              </TabsContent>
              <TabsContent value="history" className="mt-4">
                <div className="text-center text-gray-400 py-6 sm:py-8 text-sm sm:text-base">No trading history</div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Right Sidebar - Order Book & Trading */}
        <div className="col-span-1 lg:col-span-3 bg-gray-900 border-l border-gray-800">
          {/* Order Book */}
          <div className="p-3 sm:p-4 border-b border-gray-800">
            <h3 className="text-white font-semibold mb-3 text-sm sm:text-base">Order Book</h3>
            <div className="text-center py-6 sm:py-8">
              <p className="text-gray-400 text-xs sm:text-sm">No order book data</p>
            </div>
          </div>

          {/* Trading Panel */}
          <div className="p-3 sm:p-4">
            <Tabs value={side} onValueChange={setSide} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-800">
                <TabsTrigger value="buy" className="data-[state=active]:bg-green-600 data-[state=active]:text-white text-xs sm:text-sm">
                  Buy
                </TabsTrigger>
                <TabsTrigger value="sell" className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-xs sm:text-sm">
                  Sell
                </TabsTrigger>
              </TabsList>

              <TabsContent value="buy" className="space-y-3 sm:space-y-4 mt-4">
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Button
                      variant={orderType === "limit" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setOrderType("limit")}
                      className="flex-1 text-xs sm:text-sm"
                    >
                      Limit
                    </Button>
                    <Button
                      variant={orderType === "market" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setOrderType("market")}
                      className="flex-1 text-xs sm:text-sm"
                    >
                      Market
                    </Button>
                  </div>

                  <div>
                    <label className="text-gray-400 text-xs sm:text-sm">Price</label>
                    <Input placeholder="0.00" className="bg-gray-800 border-gray-700 text-white mt-1 text-xs sm:text-sm" />
                  </div>

                  <div>
                    <label className="text-gray-400 text-xs sm:text-sm">Amount</label>
                    <Input placeholder="0.00" className="bg-gray-800 border-gray-700 text-white mt-1 text-xs sm:text-sm" />
                  </div>

                  <div>
                    <label className="text-gray-400 text-xs sm:text-sm">Total</label>
                    <Input placeholder="0.00 USDT" className="bg-gray-800 border-gray-700 text-white mt-1 text-xs sm:text-sm" />
                  </div>

                  <div className="grid grid-cols-4 gap-1 sm:gap-2">
                    {["25%", "50%", "75%", "100%"].map((percent) => (
                      <Button
                        key={percent}
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-white hover:bg-gray-800 text-xs sm:text-sm"
                      >
                        {percent}
                      </Button>
                    ))}
                  </div>

                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm" disabled>
                    Connect Wallet
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="sell" className="space-y-3 sm:space-y-4 mt-4">
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Button
                      variant={orderType === "limit" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setOrderType("limit")}
                      className="flex-1 text-xs sm:text-sm"
                    >
                      Limit
                    </Button>
                    <Button
                      variant={orderType === "market" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setOrderType("market")}
                      className="flex-1 text-xs sm:text-sm"
                    >
                      Market
                    </Button>
                  </div>

                  <div>
                    <label className="text-gray-400 text-xs sm:text-sm">Price</label>
                    <Input placeholder="0.00" className="bg-gray-800 border-gray-700 text-white mt-1 text-xs sm:text-sm" />
                  </div>

                  <div>
                    <label className="text-gray-400 text-xs sm:text-sm">Amount</label>
                    <Input placeholder="0.00" className="bg-gray-800 border-gray-700 text-white mt-1 text-xs sm:text-sm" />
                  </div>

                  <div>
                    <label className="text-gray-400 text-xs sm:text-sm">Total</label>
                    <Input placeholder="0.00 USDT" className="bg-gray-800 border-gray-700 text-white mt-1 text-xs sm:text-sm" />
                  </div>

                  <div className="grid grid-cols-4 gap-1 sm:gap-2">
                    {["25%", "50%", "75%", "100%"].map((percent) => (
                      <Button
                        key={percent}
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-white hover:bg-gray-800 text-xs sm:text-sm"
                      >
                        {percent}
                      </Button>
                    ))}
                  </div>

                  <Button className="w-full bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm" disabled>
                    Connect Wallet
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Account Info */}
          <div className="p-3 sm:p-4 border-t border-gray-800">
            <h4 className="text-white font-medium mb-3 text-sm sm:text-base">Account</h4>
            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Available:</span>
                <span className="text-gray-400">-- USDT</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">In Orders:</span>
                <span className="text-gray-400">-- USDT</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
