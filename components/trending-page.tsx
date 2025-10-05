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
  Search,
  Star,
  Leaf,
  Send,
  Users,
  Shield,
  Zap
} from "lucide-react"
import { PumpLiveStream } from "@/components/pump-live-stream"
import { PumpLiveGrid } from "@/components/pump-live-grid"
import { PumpLiveProper } from "@/components/pump-live-proper"
import { NewTokensSection } from "@/components/new-tokens-section"
import { DexTokensSection } from "@/components/dex-tokens-section"
import { PumpPortalAPI } from "@/lib/services/pumpportal-api"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function TrendingPage() {
  const [timeframe, setTimeframe] = useState("1m")
  const [quickBuyAmount, setQuickBuyAmount] = useState(5)
  const [selectedWallet, setSelectedWallet] = useState("Wallet 1")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("trending")

  // Real data will be fetched from APIs
  const [trendingTokens, setTrendingTokens] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Convert API data to trending tokens format
  const convertToTrendingTokens = (apiData: any) => {
    try {
      // Handle API data structure
      const tokens = Array.isArray(apiData) ? apiData : []
      
      if (tokens.length === 0) {
        console.log('convertToTrendingTokens: no tokens available')
        return []
      }
      
      return tokens.map((token, index) => ({
        id: token.ca || index + 1,
        symbol: token.symbol || 'UNK',
        name: token.name || 'Unknown',
        icon: (token.symbol || 'U').charAt(0),
        marketCap: `$${formatNumber(token.marketCap || 0)}`,
        marketCapChange: `${(token.change || 0) >= 0 ? '+' : ''}${(token.change || 0).toFixed(1)}%`,
        liquidity: `$${formatNumber(token.liquidity || 0)}`,
        volume: `$${formatNumber(token.volume || 0)}`,
        transactions: formatNumber(token.txns || 0),
        buyTxns: (token.buyTxns || 0).toString(),
        sellTxns: (token.sellTxns || 0).toString(),
        holderChange: token.holderChange || '0.0%',
        isPaid: token.isPaid || false,
        quickBuyAmount: 0,
        age: token.age || 0,
        risk: token.risk || 'med'
      }))
    } catch (error) {
      console.error('Error in convertToTrendingTokens:', error, 'apiData:', apiData)
      return []
    }
  }

  // Fetch tokens data from our API based on active tab
  useEffect(() => {
    const fetchTokens = async () => {
      try {
        setIsLoading(true)
        console.log(`Fetching ${activeTab} data from API...`)
        
        const apiType = activeTab === 'trending' ? 'trending' : activeTab === 'dex' ? 'dex' : activeTab === 'new' ? 'new' : 'trending'
        const response = await fetch(`/api/trending?type=${apiType}&timeframe=${timeframe}&limit=20`)
        const data = await response.json()
        
        if (data.success && data.data) {
          console.log(`${activeTab} data received:`, data.data)
          const tokens = convertToTrendingTokens(data.data)
          setTrendingTokens(tokens)
        } else {
          console.error('API returned error:', data.error)
          setTrendingTokens([])
        }
      } catch (error) {
        console.error(`Error fetching ${activeTab} tokens:`, error)
        setTrendingTokens([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchTokens()
  }, [timeframe, activeTab])

  // Handle search
  useEffect(() => {
    if (searchQuery && searchQuery.length > 2) {
      const searchTokens = async () => {
        try {
          setIsLoading(true)
          const response = await fetch(`/api/trending?search=${encodeURIComponent(searchQuery)}&limit=20`)
          const data = await response.json()
          
          if (data.success && data.data) {
            const tokens = convertToTrendingTokens(data.data)
            setTrendingTokens(tokens)
          } else {
            setTrendingTokens([])
          }
        } catch (error) {
          console.error('Error searching tokens:', error)
          setTrendingTokens([])
        } finally {
          setIsLoading(false)
        }
      }
      
      searchTokens()
    } else if (searchQuery === '') {
      // If search is cleared, fetch data for current tab
      const fetchTokens = async () => {
        try {
          setIsLoading(true)
          const apiType = activeTab === 'trending' ? 'trending' : activeTab === 'dex' ? 'dex' : activeTab === 'new' ? 'new' : 'trending'
          const response = await fetch(`/api/trending?type=${apiType}&timeframe=${timeframe}&limit=20`)
          const data = await response.json()
          
          if (data.success && data.data) {
            const tokens = convertToTrendingTokens(data.data)
            setTrendingTokens(tokens)
          } else {
            setTrendingTokens([])
          }
        } catch (error) {
          console.error(`Error fetching ${activeTab} tokens:`, error)
          setTrendingTokens([])
        } finally {
          setIsLoading(false)
        }
      }
      
      fetchTokens()
    }
  }, [searchQuery, timeframe, activeTab])

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
            <SlidersHorizontal className="w-4 h-4 mr-2" />
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

      {/* Main Content with Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-[#111111] border border-[#282828] rounded-xl mb-6">
          <TabsTrigger value="trending" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black">
            Trending
          </TabsTrigger>
          <TabsTrigger value="dex" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black">
            Dex
          </TabsTrigger>
          <TabsTrigger value="new" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black">
            New
          </TabsTrigger>
          <TabsTrigger value="pump-live" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black">
            Pump Live
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trending" className="mt-0">
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
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center">
                    <div className="flex items-center justify-center gap-2 text-gray-400">
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                      Loading trending tokens...
                    </div>
                  </td>
                </tr>
              ) : trendingTokens.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    No trending tokens available. Check the live stream above for real-time data.
                  </td>
                </tr>
              ) : (
                trendingTokens.map((token) => (
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
                ))
              )}
            </tbody>
          </table>
        </div>
          </div>
        </TabsContent>

                <TabsContent value="dex" className="mt-0">
                  <div className="bg-[#111111] border border-[#282828] rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-[#282828]">
                      <h2 className="text-white text-lg font-semibold">DEX Tokens</h2>
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
                          {isLoading ? (
                            <tr>
                              <td colSpan={6} className="py-8 text-center">
                                <div className="flex items-center justify-center gap-2 text-gray-400">
                                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                  Loading DEX tokens...
                                </div>
                              </td>
                            </tr>
                          ) : trendingTokens.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="py-8 text-center text-gray-400">
                                No DEX tokens available.
                              </td>
                            </tr>
                          ) : (
                            trendingTokens.map((token) => (
                            <tr key={token.id} className="border-b border-[#282828] hover:bg-[#1a1a1a]/50 transition-colors">
                              {/* Pair info */}
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="relative flex-shrink-0">
                                    <div className="w-8 h-8 bg-white rounded flex items-center justify-center text-black font-bold text-xs">
                                      {token.icon}
                                    </div>
                                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                                      <span className="text-white text-[10px]">D</span>
                                    </div>
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-white font-medium text-sm">{token.symbol}</span>
                                      <Star className="w-3 h-3 text-yellow-400 fill-current flex-shrink-0" />
                                      <span className="text-gray-400 text-xs truncate">{token.name}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                      <span className="text-blue-400 text-xs">{token.age || '0'}m</span>
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
                                    <Shield className="w-3 h-3 text-green-400" />
                                    <span className="text-white text-xs">Paid</span>
                                  </div>
                                  <Button
                                    size="sm"
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 text-xs h-6 ml-2"
                                    onClick={() => {
                                      console.log(`Quick buy ${quickBuyAmount} SOL of ${token.symbol}`)
                                    }}
                                  >
                                    <Zap className="w-3 h-3 mr-1" />
                                    {quickBuyAmount.toFixed(2)}
                                  </Button>
                                </div>
                              </td>
                            </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="new" className="mt-0">
                  <NewTokensSection />
                </TabsContent>

        <TabsContent value="pump-live" className="mt-0">
          <PumpLiveProper />
        </TabsContent>
      </Tabs>
    </div>
  )
}
