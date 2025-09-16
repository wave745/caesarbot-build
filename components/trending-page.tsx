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
  Search,
  Star,
  Leaf,
  Send,
  Users,
  Shield,
  Zap
} from "lucide-react"

export function TrendingPage() {
  const [timeframe, setTimeframe] = useState("1m")
  const [quickBuyAmount, setQuickBuyAmount] = useState(5)
  const [selectedWallet, setSelectedWallet] = useState("Wallet 1")
  const [searchQuery, setSearchQuery] = useState("")

  // Mock data for trending tokens
  const trendingTokens = [
    {
      id: 1,
      symbol: "ZKC",
      name: "Boundless",
      icon: "⚡",
      marketCap: "$2.1M",
      marketCapChange: "-3.0%",
      liquidity: "$100K",
      volume: "$257K",
      transactions: "1.3K",
      buyTxns: "746",
      sellTxns: "547",
      holderChange: "19%",
      isPaid: false,
      quickBuyAmount: 0
    },
    {
      id: 2,
      symbol: "GAZA",
      name: "GAZA COIN",
      icon: "G",
      marketCap: "$1.2M",
      marketCapChange: "+295.4%",
      liquidity: "$123K",
      volume: "$239K",
      transactions: "769",
      buyTxns: "405",
      sellTxns: "364",
      holderChange: "14%",
      isPaid: false,
      quickBuyAmount: 0
    },
    {
      id: 3,
      symbol: "Bagwork",
      name: "Bagwork",
      icon: "BAGWORK",
      marketCap: "$7.0M",
      marketCapChange: "+10.4%",
      liquidity: "$183K",
      volume: "$201K",
      transactions: "1.5K",
      buyTxns: "846",
      sellTxns: "661",
      holderChange: "20%",
      isPaid: false,
      quickBuyAmount: 0
    },
    {
      id: 4,
      symbol: "RBR",
      name: "Robert Redford",
      icon: "👤",
      marketCap: "$977K",
      marketCapChange: "+97.9%",
      liquidity: "$68K",
      volume: "$177K",
      transactions: "2.0K",
      buyTxns: "985",
      sellTxns: "984",
      holderChange: "16%",
      isPaid: false,
      quickBuyAmount: 0
    }
  ]

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
      <div className="bg-[#111111] border border-[#282828] rounded-xl overflow-hidden">
        <div className="p-4 border-b border-[#282828]">
          <h2 className="text-white text-lg font-semibold">Trending Tokens</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-[#282828]">
                <th className="text-left py-3 px-4 text-gray-400 text-xs font-medium uppercase tracking-wide">Pair info</th>
                <th className="text-left py-3 px-4 text-gray-400 text-xs font-medium uppercase tracking-wide">Market Cap</th>
                <th className="text-left py-3 px-4 text-gray-400 text-xs font-medium uppercase tracking-wide">Liquidity</th>
                <th className="text-left py-3 px-4 text-gray-400 text-xs font-medium uppercase tracking-wide">Volume</th>
                <th className="text-left py-3 px-4 text-gray-400 text-xs font-medium uppercase tracking-wide">Txns</th>
                <th className="text-left py-3 px-4 text-gray-400 text-xs font-medium uppercase tracking-wide">Token info</th>
              </tr>
            </thead>
            <tbody>
              {trendingTokens.map((token) => (
                <tr key={token.id} className="border-b border-[#282828] hover:bg-[#1a1a1a]/50 transition-colors">
                  {/* Pair info */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="relative flex-shrink-0">
                        <div className="w-8 h-8 bg-white rounded flex items-center justify-center text-black font-bold text-xs">
                          {token.icon}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-[10px]">✕</span>
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-white font-medium text-sm">{token.symbol}</span>
                          <Star className="w-3 h-3 text-yellow-400 fill-current flex-shrink-0" />
                          <span className="text-gray-400 text-xs truncate">{token.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-blue-400 text-xs">30m</span>
                          <Leaf className="w-3 h-3 text-green-400" />
                          <Send className="w-3 h-3 text-gray-400" />
                          <Search className="w-3 h-3 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  {/* Market Cap */}
                  <td className="py-3 px-4">
                    <div>
                      <div className="text-white font-medium text-sm">{token.marketCap}</div>
                      <div className={`text-xs ${token.marketCapChange.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                        {token.marketCapChange}
                      </div>
                    </div>
                  </td>
                  
                  {/* Liquidity */}
                  <td className="py-3 px-4">
                    <div className="text-white font-medium text-sm">{token.liquidity}</div>
                  </td>
                  
                  {/* Volume */}
                  <td className="py-3 px-4">
                    <div className="text-white font-medium text-sm">{token.volume}</div>
                  </td>
                  
                  {/* Transactions */}
                  <td className="py-3 px-4">
                    <div>
                      <div className="text-white font-medium text-sm">{token.transactions}</div>
                      <div className="text-xs">
                        <span className="text-green-400">{token.buyTxns}</span>
                        <span className="text-gray-400 mx-1">/</span>
                        <span className="text-red-400">{token.sellTxns}</span>
                      </div>
                    </div>
                  </td>
                  
                  {/* Token info */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-gray-400" />
                        <span className="text-white text-xs">{token.holderChange}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Shield className="w-3 h-3 text-red-400" />
                        <span className="text-white text-xs">Unpaid</span>
                      </div>
                      <Button
                        size="sm"
                        className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 text-xs h-6 ml-2"
                        onClick={() => {
                          console.log(`Quick buy ${quickBuyAmount} SOL of ${token.symbol}`)
                        }}
                      >
                        <Zap className="w-3 h-3 mr-1" />
                        {token.quickBuyAmount}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
