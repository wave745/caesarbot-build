"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import Link from "next/link"

export function DashboardContent() {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">DASHBOARD</h1>
      </div>

      {/* Secondary Navigation */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 border-b border-[#282828] pb-4">
        <div className="flex flex-wrap items-center gap-2 sm:gap-6">
          {["Overview", "Assets", "Liquidity", "Reports", "Data", "Fees"].map((item, index) => (
            <button
              key={item}
                          className={`text-sm font-medium transition-colors hover:text-[#d7ab54] px-2 py-1 sm:px-0 sm:py-0 ${
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
            <CardTitle className="text-white text-lg sm:text-xl">Pool Performance</CardTitle>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-400">Price</span>
                <span className="text-gray-400">APY</span>
              </div>
              <select className="bg-[#282828] text-white text-sm px-3 py-1 rounded border border-[#282828] w-full sm:w-auto">
                <option>Drop down filter for changing time frame metric</option>
                <option>1H</option>
                <option>24H</option>
                <option>7D</option>
                <option>30D</option>
              </select>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white w-full sm:w-auto">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 sm:py-12">
              <div className="text-gray-400 mb-4">No pool data available</div>
              <p className="text-sm text-gray-500">Connect your wallet to view pool performance</p>
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
              <CardTitle className="text-white text-lg sm:text-xl">META</CardTitle>
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
            <CardTitle className="text-white text-lg sm:text-xl">WALLET TRACKER</CardTitle>
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
