"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Filter,
  Wallet,
  ChevronDown,
  TrendingUp,
  Search
} from "lucide-react"

export function TrendingPage() {
  const [timeframe, setTimeframe] = useState("1m")
  const [quickBuyAmount, setQuickBuyAmount] = useState(5)
  const [selectedWallet, setSelectedWallet] = useState("Wallet 1")
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">TRENDING</h1>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-4 border-b border-[#282828] pb-4">
        {/* Left side - Timeframe buttons */}
        <div className="flex items-center gap-2">
          {["1m", "5m", "30m", "1h"].map((tf) => (
            <Button
              key={tf}
              variant={timeframe === tf ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeframe(tf)}
              className={`${
                timeframe === tf
                  ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-black hover:from-yellow-400 hover:to-orange-400"
                  : "border-[#282828] text-gray-400 hover:text-white hover:border-yellow-500"
              }`}
            >
              {tf}
            </Button>
          ))}
        </div>

        {/* Center - Search and controls */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search tokens..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-40 bg-[#111111] border-[#282828] text-white placeholder-gray-400 text-sm"
            />
          </div>
          
          <Button
            variant="outline"
            size="sm"
            className="border-[#282828] text-gray-400 hover:text-white hover:border-yellow-500"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filter
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
        </div>

        {/* Right side - Wallet selector */}
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

      {/* Main Content */}
      <Card className="bg-[#111111] border-[#282828]">
        <CardHeader>
          <CardTitle className="text-white text-lg sm:text-xl">Trending Tokens</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 sm:py-12">
            <TrendingUp className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <div className="text-gray-400 mb-2 text-lg">No trending tokens available</div>
            <p className="text-sm text-gray-500 mb-4">Trending tokens will appear here when data is available</p>
            <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black hover:from-yellow-400 hover:to-orange-400">
              Refresh Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
