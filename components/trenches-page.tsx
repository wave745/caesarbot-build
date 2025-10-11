"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrenchesColumn } from "@/components/trenches-column"
import { TrendingFilterModal } from "@/components/trending-filter-modal"
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
import { 
  fetchPumpFunTokens, 
  fetchPumpFunMCTokens,
  fetchPumpFunGraduatedTokens,
  fetchBonkFunTokens,
  fetchBonkFunMCTokens,
  fetchBonkFunGraduatedTokens,
  fetchMoonItTokens,
  fetchMoonItMCTokens,
  fetchMoonItGraduatedTokens,
  formatMarketCap, 
  formatVolume, 
  formatTimeAgo, 
  getContractAddress,
  type PumpFunCoin,
  type BonkFunToken,
  type MoonItToken
} from "@/lib/pump-api"

interface TrenchesToken {
  id: string
  name: string
  symbol: string
  image: string
  mc: string
  volume: string
  fee: string
  age: string
  holders: number
  buys: number
  sells: number
  status: 'new' | 'about-to-graduate' | 'migrated'
  tag: string
  contractAddress: string
  migratedTokens: number
  devSold: boolean
  top10Holders: number
  snipers: number
  insiders: number
  platform: 'pump.fun' | 'bonk.fun' | 'moon.it'
  buyAmount: string
  // Pump.fun specific fields
  coinMint?: string
  dev?: string
  bondingCurveProgress?: number
  sniperCount?: number
  graduationDate?: string | null
  devHoldingsPercentage?: number
  sniperOwnedPercentage?: number
  topHoldersPercentage?: number
  hasTwitter?: boolean
  hasTelegram?: boolean
  hasWebsite?: boolean
  twitter?: string | null
  telegram?: string | null
  website?: string | null
}

// Function to convert Pump.fun data to our token format
function convertPumpFunToToken(coin: PumpFunCoin, index: number, status: 'new' | 'about-to-graduate' | 'migrated' = 'new'): TrenchesToken {
  const volumeInUsd = formatVolume(coin.volume)
  
  return {
    id: (index + 1).toString(),
    name: coin.name,
    symbol: coin.ticker,
    image: coin.imageUrl || `https://ui-avatars.com/api/?name=${coin.ticker}&background=6366f1&color=fff&size=48`,
    mc: formatMarketCap(coin.marketCap),
    volume: volumeInUsd,
    fee: "0", // Pump.fun doesn't provide fee data in this endpoint
    age: formatTimeAgo(coin.creationTime),
    holders: coin.numHolders,
    buys: coin.buyTransactions,
    sells: coin.sellTransactions,
    status: status,
    tag: coin.name, // Using name as tag for now
    contractAddress: getContractAddress(coin.coinMint),
    migratedTokens: status === 'migrated' ? 1 : 0, // Graduated tokens have migrated
    devSold: coin.devHoldingsPercentage === 0,
    top10Holders: Math.round(coin.topHoldersPercentage),
    snipers: Math.round(coin.sniperOwnedPercentage * 100) / 100,
    insiders: 0, // Not provided in API
    platform: 'pump.fun' as const,
    buyAmount: "5.00",
    // Pump.fun specific fields
    coinMint: coin.coinMint,
    dev: coin.dev,
    bondingCurveProgress: coin.bondingCurveProgress,
    sniperCount: coin.sniperCount,
    graduationDate: coin.graduationDate,
    devHoldingsPercentage: coin.devHoldingsPercentage,
    sniperOwnedPercentage: coin.sniperOwnedPercentage,
    topHoldersPercentage: coin.topHoldersPercentage,
    hasTwitter: coin.hasTwitter,
    hasTelegram: coin.hasTelegram,
    hasWebsite: coin.hasWebsite,
    twitter: coin.twitter,
    telegram: coin.telegram,
    website: coin.website
  }
}

// Function to convert Bonk.fun data to our token format
function convertBonkFunToToken(token: BonkFunToken, index: number): TrenchesToken {
  const volumeInUsd = formatVolume(token.volumeU)
  
  return {
    id: (index + 1).toString(),
    name: token.name,
    symbol: token.symbol,
    image: token.imgUrl || `https://ui-avatars.com/api/?name=${token.symbol}&background=6366f1&color=fff&size=48`,
    mc: formatMarketCap(token.marketCap),
    volume: volumeInUsd,
    fee: "0", // Bonk.fun doesn't provide fee data in this endpoint
    age: formatTimeAgo(token.createAt),
    holders: 0, // Not provided in bonk.fun API
    buys: 0, // Not provided in bonk.fun API
    sells: 0, // Not provided in bonk.fun API
    status: 'new' as const,
    tag: token.name, // Using name as tag for now
    contractAddress: getContractAddress(token.mint),
    migratedTokens: 0, // New tokens haven't migrated
    devSold: false, // Not provided in bonk.fun API
    top10Holders: 0, // Not provided in bonk.fun API
    snipers: 0, // Not provided in bonk.fun API
    insiders: 0, // Not provided in bonk.fun API
    platform: 'bonk.fun' as const,
    buyAmount: "5.00",
    bondingCurveProgress: token.finishingRate * 100, // Convert to percentage
    // Bonk.fun specific fields
    coinMint: token.mint,
    dev: token.creator,
    sniperCount: 0,
    graduationDate: null,
    devHoldingsPercentage: 0,
    sniperOwnedPercentage: 0,
    topHoldersPercentage: 0,
    hasTwitter: !!token.twitter,
    hasTelegram: false,
    hasWebsite: !!token.website,
    twitter: token.twitter,
    telegram: null,
    website: token.website
  }
}

// Function to convert Moon.it data to our token format
function convertMoonItToToken(token: MoonItToken, index: number): TrenchesToken {
  const volumeInUsd = formatVolume(parseFloat(token.volumeUSD))
  const marketCap = parseFloat(token.marketcap)
  const createdAt = new Date(token.createdAt).getTime()
  
  return {
    id: (index + 1).toString(),
    name: token.name,
    symbol: token.symbol,
    image: token.icon || `https://ui-avatars.com/api/?name=${token.symbol}&background=6366f1&color=fff&size=48`,
    mc: formatMarketCap(marketCap),
    volume: volumeInUsd,
    fee: "0", // Moon.it doesn't provide fee data in this endpoint
    age: formatTimeAgo(createdAt),
    holders: parseInt(token.totalHolders) || 0,
    buys: 0, // Not provided in moon.it API
    sells: 0, // Not provided in moon.it API
    status: 'new' as const,
    tag: token.name, // Using name as tag for now
    contractAddress: getContractAddress(token.mintAddress),
    migratedTokens: 0, // New tokens haven't migrated
    devSold: parseFloat(token.devHolding) === 0,
    top10Holders: Math.round(parseFloat(token.top10HolderPercentage)),
    snipers: parseInt(token.snipers) || 0,
    insiders: 0, // Not provided in moon.it API
    platform: 'moon.it' as const,
    buyAmount: "5.00",
    bondingCurveProgress: token.progressPercent,
    // Moon.it specific fields
    coinMint: token.mintAddress,
    dev: token.creatorPK,
    sniperCount: parseInt(token.snipers) || 0,
    graduationDate: null,
    devHoldingsPercentage: parseFloat(token.devHolding),
    sniperOwnedPercentage: 0, // Not provided in moon.it API
    topHoldersPercentage: parseFloat(token.top10HolderPercentage),
    hasTwitter: !!token.x,
    hasTelegram: !!token.telegram,
    hasWebsite: !!token.website,
    twitter: token.x,
    telegram: token.telegram,
    website: token.website
  }
}

// Filter state interface matching the trending filter modal
interface FilterState {
  launchpads: {
    pumpfun: boolean
    bonk: boolean
    metdbc: boolean
    bagsfm: boolean
    believeapp: boolean
    moonit: boolean
  }
  atLeastOneSocial: boolean
  originalSocials: boolean
  originalAvatar: boolean
  dexPaid: boolean
  devStillHolding: boolean
  pumpLive: boolean
  includeKeywords: string
  excludeKeywords: string
  marketCap: { min: string; max: string }
  volume: { min: string; max: string }
  liquidity: { min: string; max: string }
  top10Holders: { min: string; max: string }
  insidersHoldings: { min: string; max: string }
  snipersHoldings: { min: string; max: string }
  curveProgress: { min: string; max: string }
  buys: { min: string; max: string }
  sells: { min: string; max: string }
  devBonded: { min: string; max: string }
  totalFees: { min: string; max: string }
  freshWalletsBuys: { min: string; max: string }
  tokenAge: { min: string; max: string }
  holders: { min: string; max: string }
  proHolders: { min: string; max: string }
  bundlesHolding: { min: string; max: string }
  devHolding: { min: string; max: string }
  alphaGroupMentions: { min: string; max: string }
}

export function TrenchesPage() {
  const [selectedColumn, setSelectedColumn] = useState<'new' | 'about-to-graduate' | 'graduated'>('new')
  const [realTokens, setRealTokens] = useState<TrenchesToken[]>([])
  const [mcTokens, setMcTokens] = useState<TrenchesToken[]>([])
  const [graduatedTokens, setGraduatedTokens] = useState<TrenchesToken[]>([])
  const [bonkFunTokens, setBonkFunTokens] = useState<TrenchesToken[]>([])
  const [bonkFunMCTokens, setBonkFunMCTokens] = useState<TrenchesToken[]>([])
  const [bonkFunGraduatedTokens, setBonkFunGraduatedTokens] = useState<TrenchesToken[]>([])
  const [moonItTokens, setMoonItTokens] = useState<TrenchesToken[]>([])
  const [moonItMCTokens, setMoonItMCTokens] = useState<TrenchesToken[]>([])
  const [moonItGraduatedTokens, setMoonItGraduatedTokens] = useState<TrenchesToken[]>([])
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterState>({
    launchpads: {
      pumpfun: true,
      bonk: true,
      metdbc: false,
      bagsfm: false,
      believeapp: false,
      moonit: true
    },
    atLeastOneSocial: false,
    originalSocials: false,
    originalAvatar: false,
    dexPaid: false,
    devStillHolding: false,
    pumpLive: false,
    includeKeywords: '',
    excludeKeywords: '',
    marketCap: { min: '', max: '' },
    volume: { min: '', max: '' },
    liquidity: { min: '', max: '' },
    top10Holders: { min: '', max: '' },
    insidersHoldings: { min: '', max: '' },
    snipersHoldings: { min: '', max: '' },
    curveProgress: { min: '', max: '' },
    buys: { min: '', max: '' },
    sells: { min: '', max: '' },
    devBonded: { min: '', max: '' },
    totalFees: { min: '', max: '' },
    freshWalletsBuys: { min: '', max: '' },
    tokenAge: { min: '', max: '' },
    holders: { min: '', max: '' },
    proHolders: { min: '', max: '' },
    bundlesHolding: { min: '', max: '' },
    devHolding: { min: '', max: '' },
    alphaGroupMentions: { min: '', max: '' }
  })

  // Background SOL price fetcher to keep cache updated
  useEffect(() => {
    const updateSolPrice = async () => {
      try {
        const response = await fetch('/api/moralis/token-prices?tokenAddresses=So11111111111111111111111111111111111111112&chain=solana')
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.data && data.data.length > 0) {
            // Update the global cache
            if (typeof window !== 'undefined') {
              (window as any).solPriceCache = { 
                price: data.data[0].usdPrice, 
                timestamp: Date.now() 
              }
            }
          }
        }
      } catch (error) {
        console.warn('Background SOL price update failed:', error)
      }
    }

    // Update SOL price every 30 seconds in background
    const solPriceInterval = setInterval(updateSolPrice, 30000)
    updateSolPrice() // Initial fetch

    return () => clearInterval(solPriceInterval)
  }, [])

  // Fetch real data from Pump.fun API with auto-refresh
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching Pump.fun data...')
        const pumpFunCoins = await fetchPumpFunTokens()
        console.log('Received coins:', pumpFunCoins.length)
        const convertedTokens = pumpFunCoins.slice(0, 30).map((coin, index) => 
          convertPumpFunToToken(coin, index, 'new')
        )
        console.log('Converted tokens:', convertedTokens.length)
        setRealTokens(convertedTokens)
        setError(null) // Clear any previous errors
      } catch (error) {
        console.error('Error fetching real data:', error)
        setError(`Failed to fetch new tokens: ${error.message}`)
        // Keep realTokens empty if API fails
        setRealTokens([])
      }
    }

    const fetchMCData = async () => {
      try {
        console.log('Fetching Pump.fun MC data...')
        const pumpFunMCCoins = await fetchPumpFunMCTokens()
        console.log('Received MC coins:', pumpFunMCCoins.length)
        const convertedMCTokens = pumpFunMCCoins.slice(0, 30).map((coin, index) => 
          convertPumpFunToToken(coin, index, 'about-to-graduate')
        )
        console.log('Converted MC tokens:', convertedMCTokens.length)
        setMcTokens(convertedMCTokens)
        setError(null) // Clear any previous errors
      } catch (error) {
        console.error('Error fetching MC data:', error)
        setError(`Failed to fetch MC tokens: ${error.message}`)
        // Keep mcTokens empty if API fails
        setMcTokens([])
      }
    }

    const fetchGraduatedData = async () => {
      try {
        console.log('Fetching Pump.fun graduated data...')
        const pumpFunGraduatedCoins = await fetchPumpFunGraduatedTokens()
        console.log('Received graduated coins:', pumpFunGraduatedCoins.length)
        const convertedGraduatedTokens = pumpFunGraduatedCoins.slice(0, 30).map((coin, index) => 
          convertPumpFunToToken(coin, index, 'migrated')
        )
        console.log('Converted graduated tokens:', convertedGraduatedTokens.length)
        setGraduatedTokens(convertedGraduatedTokens)
        setError(null) // Clear any previous errors
      } catch (error) {
        console.error('Error fetching graduated data:', error)
        setError(`Failed to fetch graduated tokens: ${error.message}`)
        // Keep graduatedTokens empty if API fails
        setGraduatedTokens([])
      }
    }

    const fetchBonkFunData = async () => {
      try {
        console.log('Fetching bonk.fun data...')
        const bonkFunTokensData = await fetchBonkFunTokens()
        console.log('Received bonk.fun tokens:', bonkFunTokensData.length)
        const convertedBonkFunTokens = bonkFunTokensData.slice(0, 30).map((token, index) => 
          convertBonkFunToToken(token, index)
        )
        console.log('Converted bonk.fun tokens:', convertedBonkFunTokens.length)
        setBonkFunTokens(convertedBonkFunTokens)
        setError(null) // Clear any previous errors
      } catch (error) {
        console.error('Error fetching bonk.fun data:', error)
        setError(`Failed to fetch bonk.fun tokens: ${error instanceof Error ? error.message : 'Unknown error'}`)
        // Keep bonkFunTokens empty if API fails
        setBonkFunTokens([])
      }
    }

    const fetchBonkFunMCData = async () => {
      try {
        console.log('Fetching bonk.fun MC data...')
        const bonkFunMCTokensData = await fetchBonkFunMCTokens()
        console.log('Received bonk.fun MC tokens:', bonkFunMCTokensData.length)

        const convertedBonkFunMCTokens = bonkFunMCTokensData.slice(0, 30).map((token, index) =>
          convertBonkFunToToken(token, index)
        )
        console.log('Converted bonk.fun MC tokens:', convertedBonkFunMCTokens.length)
        setBonkFunMCTokens(convertedBonkFunMCTokens)
        setError(null) // Clear any previous errors
      } catch (error) {
        console.error('Error fetching bonk.fun MC data:', error)
        setError(`Failed to fetch bonk.fun MC tokens: ${error instanceof Error ? error.message : 'Unknown error'}`)
        // Keep bonkFunMCTokens empty if API fails
        setBonkFunMCTokens([])
      }
    }

    const fetchBonkFunGraduatedData = async () => {
      try {
        console.log('Fetching bonk.fun graduated data...')
        const bonkFunGraduatedTokensData = await fetchBonkFunGraduatedTokens()
        console.log('Received bonk.fun graduated tokens:', bonkFunGraduatedTokensData.length)
        const convertedBonkFunGraduatedTokens = bonkFunGraduatedTokensData.slice(0, 30).map((token, index) => 
          convertBonkFunToToken(token, index)
        )
        console.log('Converted bonk.fun graduated tokens:', convertedBonkFunGraduatedTokens.length)
        setBonkFunGraduatedTokens(convertedBonkFunGraduatedTokens)
        setError(null) // Clear any previous errors
      } catch (error) {
        console.error('Error fetching bonk.fun graduated data:', error)
        setError(`Failed to fetch bonk.fun graduated tokens: ${error instanceof Error ? error.message : 'Unknown error'}`)
        // Keep bonkFunGraduatedTokens empty if API fails
        setBonkFunGraduatedTokens([])
      }
    }

    const fetchMoonItData = async () => {
      try {
        console.log('Fetching moon.it data...')
        const moonItTokensData = await fetchMoonItTokens()
        console.log('Received moon.it tokens:', moonItTokensData.length)
        const convertedMoonItTokens = moonItTokensData.slice(0, 30).map((token, index) => 
          convertMoonItToToken(token, index)
        )
        console.log('Converted moon.it tokens:', convertedMoonItTokens.length)
        setMoonItTokens(convertedMoonItTokens)
        setError(null) // Clear any previous errors
      } catch (error) {
        console.error('Error fetching moon.it data:', error)
        setError(`Failed to fetch moon.it tokens: ${error instanceof Error ? error.message : 'Unknown error'}`)
        // Keep moonItTokens empty if API fails
        setMoonItTokens([])
      }
    }

    const fetchMoonItMCData = async () => {
      try {
        console.log('Fetching moon.it MC data...')
        const moonItMCTokensData = await fetchMoonItMCTokens()
        console.log('Received moon.it MC tokens:', moonItMCTokensData.length)
        const convertedMoonItMCTokens = moonItMCTokensData.slice(0, 30).map((token, index) => 
          convertMoonItToToken(token, index)
        )
        console.log('Converted moon.it MC tokens:', convertedMoonItMCTokens.length)
        setMoonItMCTokens(convertedMoonItMCTokens)
        setError(null) // Clear any previous errors
      } catch (error) {
        console.error('Error fetching moon.it MC data:', error)
        setError(`Failed to fetch moon.it MC tokens: ${error instanceof Error ? error.message : 'Unknown error'}`)
        // Keep moonItMCTokens empty if API fails
        setMoonItMCTokens([])
      }
    }

    const fetchMoonItGraduatedData = async () => {
      try {
        console.log('Fetching moon.it graduated data...')
        const moonItGraduatedTokensData = await fetchMoonItGraduatedTokens()
        console.log('Received moon.it graduated tokens:', moonItGraduatedTokensData.length)
        const convertedMoonItGraduatedTokens = moonItGraduatedTokensData.slice(0, 30).map((token, index) => 
          convertMoonItToToken(token, index)
        )
        console.log('Converted moon.it graduated tokens:', convertedMoonItGraduatedTokens.length)
        setMoonItGraduatedTokens(convertedMoonItGraduatedTokens)
        setError(null) // Clear any previous errors
      } catch (error) {
        console.error('Error fetching moon.it graduated data:', error)
        setError(`Failed to fetch moon.it graduated tokens: ${error instanceof Error ? error.message : 'Unknown error'}`)
        // Keep moonItGraduatedTokens empty if API fails
        setMoonItGraduatedTokens([])
      }
    }

    // Initial fetch
    fetchData()
    fetchMCData()
    fetchGraduatedData()
    fetchBonkFunData()
    fetchBonkFunMCData()
    fetchBonkFunGraduatedData()
    fetchMoonItData()
    fetchMoonItMCData()
    fetchMoonItGraduatedData()

    // Set up auto-refresh every 5 seconds for very fast updates
    const interval = setInterval(() => {
      console.log('Auto-refreshing token data...')
      fetchData()
      fetchMCData()
      fetchGraduatedData()
      fetchBonkFunData()
      fetchBonkFunMCData()
      fetchBonkFunGraduatedData()
      fetchMoonItData()
      fetchMoonItMCData()
      fetchMoonItGraduatedData()
    }, 5000) // 5 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(interval)
  }, [])

  // Removed all mock data - only showing real data from API

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

  // Helper function to apply filters to tokens
  const applyFilters = (tokens: TrenchesToken[]) => {
    return tokens.filter(token => {
      // Platform filter
      const platformMap = {
        'pump.fun': 'pumpfun',
        'bonk.fun': 'bonk',
        'moon.it': 'moonit'
      }
      const platformKey = platformMap[token.platform] as keyof typeof filters.launchpads
      if (!filters.launchpads[platformKey]) {
        return false
      }

      // Social filters
      if (filters.atLeastOneSocial && !token.hasTwitter && !token.hasTelegram && !token.hasWebsite) {
        return false
      }

      // Keyword filters
      if (filters.includeKeywords) {
        const includeKeywords = filters.includeKeywords.toLowerCase().split(',').map(k => k.trim())
        const tokenText = `${token.name} ${token.symbol} ${token.tag}`.toLowerCase()
        if (!includeKeywords.some(keyword => tokenText.includes(keyword))) {
          return false
        }
      }

      if (filters.excludeKeywords) {
        const excludeKeywords = filters.excludeKeywords.toLowerCase().split(',').map(k => k.trim())
        const tokenText = `${token.name} ${token.symbol} ${token.tag}`.toLowerCase()
        if (excludeKeywords.some(keyword => tokenText.includes(keyword))) {
          return false
        }
      }

      // Range filters
      const marketCapValue = parseMarketCap(token.mc)
      if (filters.marketCap.min && marketCapValue < parseFloat(filters.marketCap.min)) return false
      if (filters.marketCap.max && marketCapValue > parseFloat(filters.marketCap.max)) return false

      const volumeValue = parseFloat(token.volume.replace(/[$,]/g, '')) || 0
      if (filters.volume.min && volumeValue < parseFloat(filters.volume.min)) return false
      if (filters.volume.max && volumeValue > parseFloat(filters.volume.max)) return false

      if (filters.top10Holders.min && token.top10Holders < parseFloat(filters.top10Holders.min)) return false
      if (filters.top10Holders.max && token.top10Holders > parseFloat(filters.top10Holders.max)) return false

      if (filters.holders.min && token.holders < parseFloat(filters.holders.min)) return false
      if (filters.holders.max && token.holders > parseFloat(filters.holders.max)) return false

      if (filters.curveProgress.min && (token.bondingCurveProgress || 0) < parseFloat(filters.curveProgress.min)) return false
      if (filters.curveProgress.max && (token.bondingCurveProgress || 0) > parseFloat(filters.curveProgress.max)) return false

      if (filters.devHolding.min && (token.devHoldingsPercentage || 0) < parseFloat(filters.devHolding.min)) return false
      if (filters.devHolding.max && (token.devHoldingsPercentage || 0) > parseFloat(filters.devHolding.max)) return false

      return true
    })
  }

  const getTokensByCategory = (category: 'new' | 'about-to-graduate' | 'graduated') => {
    // Helper function to filter tokens not older than 3 days
    const filterRecentTokens = (tokens: TrenchesToken[]) => {
      const threeDaysAgo = Date.now() - (3 * 24 * 60 * 60 * 1000) // 3 days in milliseconds
      return tokens.filter(token => {
        const tokenTime = parseTimeToMinutes(token.age)
        const tokenTimestamp = Date.now() - (tokenTime * 60 * 1000) // Convert minutes to milliseconds
        return tokenTimestamp >= threeDaysAgo
      })
    }

    if (category === 'new') {
      // Combine Pump.fun, bonk.fun, and moon.it tokens for the new column
      const combinedTokens = [...realTokens, ...bonkFunTokens, ...moonItTokens]
      // Filter tokens not older than 3 days
      const recentTokens = filterRecentTokens(combinedTokens)
      // Apply user filters
      const filteredTokens = applyFilters(recentTokens)
      // Sort by creation time (newest first) and limit to 30 tokens
      return filteredTokens
        .sort((a, b) => {
          // Sort by age (newest first) - assuming age is in format like "2m", "1h", etc.
          const aTime = parseTimeToMinutes(a.age)
          const bTime = parseTimeToMinutes(b.age)
          return aTime - bTime
        })
        .slice(0, 30)
    }
    
    if (category === 'about-to-graduate') {
      // Combine Pump.fun, bonk.fun, and moon.it MC tokens for the % MC column
      const combinedMCTokens = [...mcTokens, ...bonkFunMCTokens, ...moonItMCTokens]
      // Filter tokens not older than 3 days
      const recentMCTokens = filterRecentTokens(combinedMCTokens)
      // Apply user filters
      const filteredMCTokens = applyFilters(recentMCTokens)
      // Sort by market cap (highest first) and limit to 30 tokens
      return filteredMCTokens
        .sort((a, b) => {
          // Parse market cap for sorting
          const aMC = parseMarketCap(a.mc)
          const bMC = parseMarketCap(b.mc)
          return bMC - aMC
        })
        .slice(0, 30)
    }
    
    if (category === 'graduated') {
      // Combine Pump.fun, bonk.fun, and moon.it graduated tokens for the Migrated column
      const combinedGraduatedTokens = [...graduatedTokens, ...bonkFunGraduatedTokens, ...moonItGraduatedTokens]
      // Filter tokens not older than 3 days
      const recentGraduatedTokens = filterRecentTokens(combinedGraduatedTokens)
      // Apply user filters
      const filteredGraduatedTokens = applyFilters(recentGraduatedTokens)
      // Sort by creation time (newest first) and limit to 30 tokens
      return filteredGraduatedTokens
        .sort((a, b) => {
          // Sort by age (newest first)
          const aTime = parseTimeToMinutes(a.age)
          const bTime = parseTimeToMinutes(b.age)
          return aTime - bTime
        })
        .slice(0, 30)
    }
    
    // Return empty arrays for other categories - no mock data
    return []
  }

  // Helper function to parse time strings to minutes for sorting
  const parseTimeToMinutes = (timeStr: string): number => {
    if (timeStr.includes('s')) return 0 // seconds = 0 minutes
    if (timeStr.includes('m')) return parseInt(timeStr) || 0
    if (timeStr.includes('h')) return (parseInt(timeStr) || 0) * 60
    if (timeStr.includes('d')) return (parseInt(timeStr) || 0) * 60 * 24
    return 0
  }

  // Helper function to parse market cap strings to numbers for sorting
  const parseMarketCap = (mcStr: string): number => {
    if (!mcStr) return 0
    const cleanStr = mcStr.replace('$', '').replace(',', '')
    if (cleanStr.includes('M')) {
      return parseFloat(cleanStr.replace('M', '')) * 1000000
    } else if (cleanStr.includes('K')) {
      return parseFloat(cleanStr.replace('K', '')) * 1000
    } else {
      return parseFloat(cleanStr) || 0
    }
  }

  // Filter handler
  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters)
  }

  const TokenCard = ({ token }: { token: TrenchesToken }) => (
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
              <span className="text-blue-400">{token.mc}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">V</span>
              <span className="text-white">{token.volume}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">F</span>
              <span className="text-white flex items-center">
                <Square className="w-3 h-3 mr-1" />
                {token.fee || "0"}
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
          {token.engagementIndicators?.map((indicator: any, index: number) => (
            <div key={index} className="flex items-center space-x-1">
              <span className={`text-xs ${indicator.color}`}>{indicator.value}</span>
            </div>
          ))}
        </div>

        {/* Bottom Section - Address and Action Button */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-300 text-xs">{token.symbol.slice(0, 3)}...pump</p>
            {token.tag && (
              <p className="text-blue-400 text-xs">{token.tag}</p>
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 items-start w-full">
        <div className="px-1">
          <TrenchesColumn 
            title="New" 
            tokens={getTokensByCategory('new')} 
            onFiltersChange={handleFiltersChange}
            initialFilters={filters}
          />
        </div>
        <div>
          <TrenchesColumn 
            title="% MC" 
            tokens={getTokensByCategory('about-to-graduate')} 
            onFiltersChange={handleFiltersChange}
            initialFilters={filters}
          />
        </div>
        <div className="px-1">
          <TrenchesColumn 
            title="Migrated" 
            tokens={getTokensByCategory('graduated')} 
            onFiltersChange={handleFiltersChange}
            initialFilters={filters}
          />
        </div>
      </div>

    </div>
  )
}
