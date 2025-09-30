"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { TokenTradeHeader } from "@/components/TokenTradeHeader"
import { TokenChart } from "@/components/TokenChart"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, TrendingUp, TrendingDown } from "lucide-react"
import Link from "next/link"

interface TokenData {
  symbol: string
  name: string
  price: string
  marketCap: string
  liquidity: string
  volume24h: string
  totalFees: string
  supply: string
  taxes: string
  community?: string
  isFavorited?: boolean
  priceChange24h?: number
  fullContractAddress: string
}

export default function TradePage() {
  const params = useParams()
  const mint = params.mint as string
  const [tokenData, setTokenData] = useState<TokenData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Mock data for now - in real implementation, fetch from API
    const mockTokenData: TokenData = {
      symbol: "Q4",
      name: "The Final Quarter",
      price: "$0.03441",
      marketCap: "$441.80K",
      liquidity: "$100.9K",
      volume24h: "$795.1K",
      totalFees: "177.08",
      supply: "1B",
      taxes: "Dex 1.15%",
      community: "4d Bqnd...pump",
      isFavorited: false,
      priceChange24h: 12.5,
      fullContractAddress: "BqndqeBCNSEftBKmbTbLVx1RX5zd5J3AGL9sG55Jpump"
    }

    // Simulate API call
    setTimeout(() => {
      setTokenData(mockTokenData)
      setIsLoading(false)
    }, 1000)
  }, [mint])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading token data...</p>
        </div>
      </div>
    )
  }

  if (!tokenData) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Token not found</p>
          <Link href="/">
            <Button className="bg-yellow-500 text-black hover:bg-yellow-400">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-[#0a0a0a] flex flex-col">

      {/* Token Trade Header */}
      <TokenTradeHeader token={tokenData} />

      {/* Chart Section */}
      <div className="flex-grow min-h-0">
        <TokenChart contractAddress="BqndqeBCNSEftBKmbTbLVx1RX5zd5J3AGL9sG55Jpump" />
      </div>

    </div>
  )
}




