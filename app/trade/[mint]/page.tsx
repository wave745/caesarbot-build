"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { TokenTradeHeader } from "@/components/TokenTradeHeader"
import { TokenChart } from "@/components/TokenChart"
import { TradesTable } from "@/components/TradesTable"
import { ResizableSplitPanel } from "@/components/ResizableSplitPanel"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { SolanaDataService } from "@/lib/services/solana-data"
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
  // Token metadata
  logo?: string
  website?: string
  twitter?: string
  telegram?: string
  discord?: string
  github?: string
  reddit?: string
  instagram?: string
  youtube?: string
  tiktok?: string
  twitch?: string
  facebook?: string
}

export default function TradePage() {
  const params = useParams()
  const mint = params.mint as string
  const [tokenData, setTokenData] = useState<TokenData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  useEffect(() => {
  const fetchTokenData = async () => {
    // Use the mint address from URL params
    const contractAddress = mint
    
    try {
      setIsLoading(true)
        
        console.log('🔍 Fetching token data for:', contractAddress)
        
        // Fetch metadata, trading data, and pump.fun data in parallel
        const [metadataResponse, tradingDataResponse, pumpFunResponse] = await Promise.all([
          // Get token metadata (logo, name, symbol, social links)
          fetch('/api/moralis/token-metadata', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              tokenAddresses: [contractAddress],
              network: 'mainnet'
            })
          }),
          // Get trading data (price, market cap, volume, etc.)
          fetch(`/api/dexscreener/token/${contractAddress}`),
          // Get pump.fun data (for new tokens with social links)
          fetch(`/api/pump-fun/token/${contractAddress}`)
        ])

        console.log('📡 Metadata API response status:', metadataResponse.status)
        console.log('📡 Trading data API response status:', tradingDataResponse.status)
        console.log('📡 Pump.fun API response status:', pumpFunResponse.status)

        let metadata = null
        let tradingData = null
        let pumpFunData = null

        // Process metadata response
        if (metadataResponse.ok) {
          const metadataResult = await metadataResponse.json()
          console.log('✅ Metadata API response data:', metadataResult)
          
          if (metadataResult.success && metadataResult.data && metadataResult.data[contractAddress]) {
            metadata = metadataResult.data[contractAddress]
            console.log('🎯 Token metadata received:', metadata)
          }
        }

        // Process trading data response
        if (tradingDataResponse.ok) {
          const tradingResult = await tradingDataResponse.json()
          console.log('✅ Trading data API response:', tradingResult)
          
          if (tradingResult.success && tradingResult.data) {
            tradingData = tradingResult.data
            console.log('🎯 Trading data received:', tradingData)
          }
        }

        // Process pump.fun data response
        if (pumpFunResponse.ok) {
          const pumpFunResult = await pumpFunResponse.json()
          console.log('✅ Pump.fun API response:', pumpFunResult)
          
          if (pumpFunResult.success && pumpFunResult.data) {
            pumpFunData = pumpFunResult.data
            console.log('🎯 Pump.fun data received:', pumpFunData)
          }
        }

        // Create a better fallback symbol from contract address
        const fallbackSymbol = contractAddress.slice(0, 4).toUpperCase()
        const fallbackName = `Token ${contractAddress.slice(0, 8)}`
        
        // Transform the data to match our TokenData interface
        const tokenData: TokenData = {
          symbol: metadata?.symbol && metadata.symbol !== "UNKNOWN" ? metadata.symbol : (pumpFunData?.symbol || fallbackSymbol),
          name: metadata?.name && metadata.name !== "Unknown Token" ? metadata.name : (pumpFunData?.name || fallbackName),
          price: tradingData?.price ? `$${tradingData.price}` : (pumpFunData?.priceUsd ? `$${pumpFunData.priceUsd}` : "$0.00"),
          marketCap: tradingData?.marketCap ? `$${tradingData.marketCap}` : (pumpFunData?.marketCap ? `$${pumpFunData.marketCap}` : "$0"),
          liquidity: tradingData?.liquidity ? `$${tradingData.liquidity}` : (pumpFunData?.liquidity ? `$${pumpFunData.liquidity}` : "$0"),
          volume24h: tradingData?.volume24h ? `$${tradingData.volume24h}` : (pumpFunData?.volume24h ? `$${pumpFunData.volume24h}` : "$0"),
          totalFees: tradingData?.totalFees || "0",
          supply: tradingData?.supply || "0",
          taxes: tradingData?.taxes || "Unknown",
          community: tradingData?.community || `Unknown ${contractAddress.slice(0, 4)}...${contractAddress.slice(-4)}`,
          isFavorited: false,
          priceChange24h: tradingData?.priceChange24h || 0,
          fullContractAddress: contractAddress,
          // Token metadata - prioritize pump.fun data for new tokens, fallback to Moralis
          logo: pumpFunData?.logo || metadata?.logo,
          website: pumpFunData?.website || metadata?.socialLinks?.website,
          twitter: pumpFunData?.twitter || metadata?.socialLinks?.twitter,
          telegram: pumpFunData?.telegram || metadata?.socialLinks?.telegram,
          discord: metadata?.socialLinks?.discord,
          github: metadata?.socialLinks?.github,
          reddit: metadata?.socialLinks?.reddit,
          instagram: metadata?.socialLinks?.instagram,
          youtube: metadata?.socialLinks?.youtube,
          tiktok: metadata?.socialLinks?.tiktok,
          twitch: metadata?.socialLinks?.twitch,
          facebook: metadata?.socialLinks?.facebook
        }
        
        console.log('🎯 Final token data with metrics:', {
          symbol: tokenData.symbol,
          name: tokenData.name,
          logo: tokenData.logo,
          price: tokenData.price,
          marketCap: tokenData.marketCap,
          liquidity: tokenData.liquidity,
          volume24h: tokenData.volume24h
        })
        
        setTokenData(tokenData)
        setLastUpdate(new Date())
        return
        
      } catch (error) {
        console.error('❌ Error fetching token data:', error)
        
        // Create minimal fallback data with just basic info
        const fallbackSymbol = contractAddress.slice(0, 4).toUpperCase()
        const fallbackName = `Token ${contractAddress.slice(0, 8)}`
        
        const fallbackTokenData: TokenData = {
          symbol: fallbackSymbol,
          name: fallbackName,
          price: "$0.00",
          marketCap: "$0",
          liquidity: "$0",
          volume24h: "$0",
          totalFees: "0",
          supply: "0",
          taxes: "Unknown",
          community: `Unknown ${contractAddress.slice(0, 4)}...${contractAddress.slice(-4)}`,
          isFavorited: false,
          priceChange24h: 0,
          fullContractAddress: contractAddress,
          logo: undefined,
          website: undefined,
          twitter: undefined,
          telegram: undefined,
          discord: undefined,
          github: undefined,
          reddit: undefined,
          instagram: undefined,
          youtube: undefined,
          tiktok: undefined,
          twitch: undefined,
          facebook: undefined
        }
        
        console.log('⚠️ Using fallback data due to API error')
        setTokenData(fallbackTokenData)
      } finally {
        setIsLoading(false)
      }
    }

    if (mint) {
      fetchTokenData()
    }
  }, [mint])

  // Live data updates - poll every 5 seconds for trading data
  useEffect(() => {
    if (!mint || !tokenData) return

    const interval = setInterval(async () => {
      try {
        // Only fetch trading data for live updates (price, volume, etc.)
        const tradingDataResponse = await fetch(`/api/dexscreener/token/${mint}`)
        
        if (tradingDataResponse.ok) {
          const tradingResult = await tradingDataResponse.json()
          
          if (tradingResult.success && tradingResult.data) {
            const tradingData = tradingResult.data
            
            // Update only the trading-related fields
            setTokenData(prev => prev ? {
              ...prev,
              price: tradingData?.price ? `$${tradingData.price}` : prev.price,
              marketCap: tradingData?.marketCap ? `$${tradingData.marketCap}` : prev.marketCap,
              liquidity: tradingData?.liquidity ? `$${tradingData.liquidity}` : prev.liquidity,
              volume24h: tradingData?.volume24h ? `$${tradingData.volume24h}` : prev.volume24h,
              totalFees: tradingData?.totalFees || prev.totalFees,
              supply: tradingData?.supply || prev.supply,
              taxes: tradingData?.taxes || prev.taxes,
              priceChange24h: tradingData?.priceChange24h || prev.priceChange24h
            } : prev)
            
            setLastUpdate(new Date())
          }
        }
      } catch (error) {
        console.error('Live data update failed:', error)
      }
    }, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [mint, tokenData])

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
        <TokenTradeHeader token={tokenData} lastUpdate={lastUpdate} />

      {/* Main Content Area */}
      <div className="flex-1 min-h-0">
        <ResizableSplitPanel 
          initialSplit={75}
          minSize={30}
          maxSize={85}
        >
          {/* Chart Section */}
          <TokenChart contractAddress={mint} />
          
          {/* Trades Table */}
          <TradesTable contractAddress={mint} />
        </ResizableSplitPanel>
      </div>

    </div>
  )
}




