"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrenchesCard } from "@/components/trenches-card"
import { 
  Search,
  Zap,
  TrendingUp,
  Eye,
  Menu,
  Settings,
  Copy,
  ExternalLink,
  Clock,
  Star,
  TrendingDown,
  Activity,
  Square,
  Plus
} from "lucide-react"

interface TokenData {
  id: string
  name: string
  symbol: string
  image: string
  marketCap: number
  volume: number
  priceChange: number
  holders: number
  age: string
  address: string
  social?: string
  category: 'new' | 'about-to-graduate' | 'graduated'
  fees?: string
  status: 'live' | 'dead' | 'migrated'
  engagementIndicators?: Array<{
    value: string
    color: string
    icon?: string
  }>
}

export function TrenchesPage() {
  const [selectedColumn, setSelectedColumn] = useState<'new' | 'about-to-graduate' | 'graduated'>('new')

  // Mock data for demonstration
  const mockTokens: TokenData[] = [
    {
      id: "1",
      name: "STONKGOLD",
      symbol: "STONKGOLD",
      image: "/placeholder-token.png",
      marketCap: 5100,
      volume: 0,
      priceChange: 0,
      holders: 1,
      age: "0s",
      address: "7Bq...moon",
      category: 'new',
      fees: "0",
      status: 'live',
      engagementIndicators: [
        { value: "2+ 0%", color: "text-green-400", icon: "👥" },
        { value: "0%", color: "text-green-400", icon: "👨‍🍳" },
        { value: "0.0%", color: "text-green-400", icon: "🎯" },
        { value: "0%", color: "text-green-400", icon: "☁️" }
      ]
    },
    {
      id: "2", 
      name: "Btracker",
      symbol: "BTRACKER",
      image: "/placeholder-token.png",
      marketCap: 4200,
      volume: 17,
      priceChange: 0,
      holders: 1,
      age: "0s",
      address: "513...bonk",
      category: 'new',
      fees: "0",
      status: 'live',
      engagementIndicators: [
        { value: "2+ 0%", color: "text-green-400", icon: "👥" },
        { value: "0%", color: "text-green-400", icon: "👨‍🍳" },
        { value: "0.0%", color: "text-green-400", icon: "🎯" },
        { value: "0%", color: "text-green-400", icon: "☁️" }
      ]
    },
    {
      id: "3",
      name: "PEACE",
      symbol: "PEACE",
      image: "/placeholder-token.png", 
      marketCap: 7600,
      volume: 675,
      priceChange: 0,
      holders: 1,
      age: "0s",
      address: "C9c...pump",
      social: "@cryptosavingexp",
      category: 'new',
      fees: "0",
      status: 'live',
      engagementIndicators: [
        { value: "2+ 0%", color: "text-green-400", icon: "👥" },
        { value: "0%", color: "text-green-400", icon: "👨‍🍳" },
        { value: "0.0%", color: "text-green-400", icon: "🎯" },
        { value: "0%", color: "text-green-400", icon: "☁️" }
      ]
    },
    // % MC Column
    {
      id: "4",
      name: "RSPIN Roger Spins",
      symbol: "RSPIN",
      image: "/placeholder-token.png",
      marketCap: 4100,
      volume: 0,
      priceChange: 0,
      holders: 99,
      age: "3d",
      address: "Cs7...pump",
      category: 'about-to-graduate',
      fees: "0",
      status: 'live',
      engagementIndicators: [
        { value: "+ 37%", color: "text-pink-400", icon: "👥" },
        { value: "5%", color: "text-green-400", icon: "👨‍🍳" },
        { value: "1.0%", color: "text-green-400", icon: "🎯" },
        { value: "32%", color: "text-pink-400", icon: "☁️" }
      ]
    },
    {
      id: "5",
      name: "ICM",
      symbol: "ICM",
      image: "/placeholder-token.png",
      marketCap: 74000,
      volume: 20000,
      priceChange: 0,
      holders: 1,
      age: "0s",
      address: "DCJ...pump",
      category: 'about-to-graduate',
      fees: "0.071",
      engagementIndicators: [
        { value: "2+ 20%", color: "text-green-400" },
        { value: "2%", color: "text-green-400" },
        { value: "10.12%", color: "text-green-400" },
        { value: "6%", color: "text-red-400" },
        { value: "15%", color: "text-red-400" }
      ]
    },
    {
      id: "6",
      name: "Barrels",
      symbol: "BARRELS",
      image: "/placeholder-token.png",
      marketCap: 68000,
      volume: 17000,
      priceChange: 0,
      holders: 1,
      age: "0s",
      address: "A1T...pump",
      social: "@getappai",
      category: 'about-to-graduate',
      fees: "0.122",
      engagementIndicators: [
        { value: "2+ 0%", color: "text-green-400" },
        { value: "0%", color: "text-green-400" },
        { value: "0.0%", color: "text-green-400" },
        { value: "0%", color: "text-green-400" }
      ]
    },
    // Migrated Column
    {
      id: "7",
      name: "Telegram",
      symbol: "TELEGRAM",
      image: "/placeholder-token.png",
      marketCap: 45000,
      volume: 11000,
      priceChange: 0,
      holders: 1,
      age: "0s",
      address: "FTb...Jv2Q",
      category: 'graduated',
      fees: "0",
      engagementIndicators: [
        { value: "2+ 76%", color: "text-green-400" },
        { value: "DS 1.76%", color: "text-green-400" },
        { value: "76%", color: "text-green-400" }
      ]
    },
    {
      id: "8",
      name: "LIS",
      symbol: "LIS",
      image: "/placeholder-token.png",
      marketCap: 76000,
      volume: 41000,
      priceChange: 0,
      holders: 1,
      age: "0s",
      address: "zw7...daos",
      social: "@binanceus",
      category: 'graduated',
      fees: "0.011",
      engagementIndicators: [
        { value: "2+ 5%", color: "text-green-400" },
        { value: "DS 0.0%", color: "text-green-400" },
        { value: "35%", color: "text-red-400" },
        { value: "1%", color: "text-green-400" }
      ]
    },
    {
      id: "9",
      name: "抖音",
      symbol: "DOUYIN",
      image: "/placeholder-token.png",
      marketCap: 14000,
      volume: 11000,
      priceChange: 0,
      holders: 1,
      age: "0s",
      address: "2nP...WHA4",
      category: 'graduated',
      fees: "0",
      engagementIndicators: [
        { value: "2+ 0%", color: "text-green-400" },
        { value: "0%", color: "text-green-400" },
        { value: "0.0%", color: "text-green-400" },
        { value: "0%", color: "text-green-400" }
      ]
    }
  ]

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const formatPriceChange = (change: number) => {
    const isPositive = change >= 0
    return (
      <span className={`text-sm font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
        {isPositive ? '+' : ''}{change.toFixed(1)}%
      </span>
    )
  }

  const getTokensByCategory = (category: 'new' | 'about-to-graduate' | 'graduated') => {
    return mockTokens.filter(token => token.category === category)
  }

  const TokenCard = ({ token }: { token: TokenData }) => (
    <Card className="bg-gray-800/30 border border-gray-600 hover:bg-gray-700/30 transition-colors cursor-pointer">
      <CardContent className="p-4">
        {/* Top Section - Token Image, Name, Age, and Metrics */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {token.symbol.charAt(0)}
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✏️</span>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">{token.name}</h3>
              <div className="flex items-center space-x-2">
                <p className="text-gray-400 text-xs">{token.age}</p>
                <ExternalLink className="w-3 h-3 text-gray-400" />
                <Search className="w-3 h-3 text-gray-400" />
              </div>
            </div>
          </div>
          <div className="text-right space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">MC</span>
              <span className="text-blue-400">${formatNumber(token.marketCap)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">V</span>
              <span className="text-white">${formatNumber(token.volume)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">F</span>
              <span className="text-white flex items-center">
                <Square className="w-3 h-3 mr-1" />
                {token.fees || "0"}
              </span>
            </div>
          </div>
        </div>

        {/* Middle Section - Engagement Metrics */}
        <div className="flex items-center space-x-4 mb-3">
          <div className="flex items-center space-x-1">
            <Activity className="w-3 h-3 text-gray-400" />
            <span className="text-gray-400 text-xs">{token.holders}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Star className="w-3 h-3 text-gray-400" />
            <span className="text-gray-400 text-xs">0</span>
          </div>
        </div>

        {/* Engagement Indicators */}
        <div className="flex items-center space-x-3 mb-3">
          {token.engagementIndicators?.map((indicator, index) => (
            <div key={index} className="flex items-center space-x-1">
              <span className={`text-xs ${indicator.color}`}>{indicator.value}</span>
            </div>
          ))}
        </div>

        {/* Bottom Section - Address and Action Button */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-300 text-xs">{token.address}</p>
            {token.social && (
              <p className="text-blue-400 text-xs">@{token.social}</p>
            )}
          </div>
          <Button className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded-lg flex items-center space-x-1">
            <Zap className="w-3 h-3 text-white" />
            <span className="text-white text-xs">5.00</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const ColumnHeader = ({ title, count, buttonLabel = "5 P1" }: { title: string; count: string | number; buttonLabel?: string }) => (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-3">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <span className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded">
          {count}
        </span>
      </div>
      <div className="flex items-center space-x-2">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-2 top-1/2 transform -translate-y-1/2" />
          <Input 
            placeholder="Search" 
            className="pl-8 w-32 h-8 bg-gray-800 border-gray-600 text-white text-xs"
          />
        </div>
        <Button variant="ghost" size="sm" className="h-8 px-2 hover:bg-gray-700 text-xs">
          <Zap className="w-3 h-3 text-gray-400 mr-1" />
          {buttonLabel}
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-700">
          <TrendingUp className="w-4 h-4 text-gray-400" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-700">
          <Menu className="w-4 h-4 text-gray-400" />
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Positions</span>
          </Button>
          <h1 className="text-2xl font-bold">Trenches</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="hover:bg-gray-800">
            Customize
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-800">
            <div className="relative">
              <Square className="w-4 h-4" />
              <Plus className="w-3 h-3 absolute -top-1 -right-1" />
            </div>
          </Button>
        </div>
      </div>

      {/* Three Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* New Tokens Column */}
        <div className="space-y-4">
          <ColumnHeader title="New" count="5" buttonLabel="5 P1" />
          <div className="divide-y divide-zinc-800">
            {getTokensByCategory('new').map((token) => (
              <div key={token.id} className="py-3">
                <TrenchesCard token={token} />
              </div>
            ))}
          </div>
        </div>

        {/* % MC Column */}
        <div className="space-y-4">
          <ColumnHeader title="% MC" count="0" buttonLabel="0 P1" />
          <div className="divide-y divide-zinc-800">
            {getTokensByCategory('about-to-graduate').map((token) => (
              <div key={token.id} className="py-3">
                <TrenchesCard token={token} />
              </div>
            ))}
          </div>
        </div>

        {/* Migrated Column */}
        <div className="space-y-4">
          <ColumnHeader title="Migrated" count="0" buttonLabel="0 P1" />
          <div className="divide-y divide-zinc-800">
            {getTokensByCategory('graduated').map((token) => (
              <div key={token.id} className="py-3">
                <TrenchesCard token={token} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <span className="text-gray-400 text-sm">Stable</span>
            <span className="text-gray-400 text-sm">60 FPS</span>
            <span className="text-gray-400 text-sm">Watchlist</span>
            <span className="text-gray-400 text-sm">Wallet Tracker</span>
            <span className="text-gray-400 text-sm">PnL Tracker</span>
            <span className="text-gray-400 text-sm">X Tracker</span>
            <span className="text-blue-400 text-sm font-medium">Trenches</span>
            <span className="text-gray-400 text-sm">Alpha Tracker</span>
            <span className="text-gray-400 text-sm">Price Alerts</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-white text-sm">226.24</span>
            <span className="text-white text-sm">0.0485</span>
            <span className="text-white text-sm">$92.96K</span>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Copy className="w-4 h-4 text-gray-400" />
              </Button>
              <span className="text-gray-400 text-sm">English GB</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
