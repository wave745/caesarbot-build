"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Wallet, TrendingUp, Plus, Search, SlidersHorizontal } from "lucide-react"

export function WalletTracker() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">WALLET TRACKER</h1>
          <p className="text-gray-400">Track and analyze wallet performance</p>
        </div>
        <div className="flex items-center gap-4">
                  <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black hover:from-yellow-400 hover:to-orange-400">
          <Plus className="w-4 h-4 mr-2" />
          Add Wallet
        </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
        {/* Left Sidebar - Wallet List */}
        <div className="col-span-4 bg-[#111111] rounded-lg border border-[#282828]">
                      <div className="p-4 border-b border-[#282828]">
            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white w-4 h-4" />
                <Input
                  placeholder="Search wallets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-[#111111] border-[#282828] text-white"
                />
              </div>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                <SlidersHorizontal className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white font-medium">Tracked Wallets</span>
              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black">0</Badge>
            </div>
          </div>

          <div className="p-8 text-center">
            <Wallet className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Wallets Tracked</h3>
            <p className="text-gray-400 mb-4">Add wallets to start tracking their performance</p>
            <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black hover:from-yellow-400 hover:to-orange-400">
              <Plus className="w-4 h-4 mr-2" />
              Add First Wallet
            </Button>
          </div>
        </div>

        {/* Main Content - Empty State */}
        <div className="col-span-8 space-y-6">
          <Card className="bg-[#111111] border-[#282828]">
            <CardContent className="p-12 text-center">
              <TrendingUp className="w-20 h-20 text-gray-600 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-white mb-4">Start Tracking Wallets</h2>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                Add wallet addresses to monitor their trading activity, token holdings, and performance metrics in
                real-time.
              </p>
              <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black hover:from-yellow-400 hover:to-orange-400">
                <Plus className="w-4 h-4 mr-2" />
                Add Wallet to Track
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
