"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrenchesColumn } from "@/components/trenches-column"
import { TrendingFilterModal } from "@/components/trending-filter-modal"
import { EchoCustomizeModal, type EchoSettings } from "@/components/echo-customize-modal"
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
  platform: 'pump.fun' | 'bonk.fun' | 'moon.it' | 'pumpswap' | 'moonshot' | 'boop.fun' | 'orca' | 'meteora' | 'raydium' | 'jupiter' | 'birdeye' | 'dexscreener' | 'solscan' | 'solana' | 'trends.fun' | 'rupert' | 'bags.fm' | 'believe.app' | 'unknown'
  platformLogo?: string
  buyAmount: string
  totalFees?: number
  tradingFees?: number
  tipsFees?: number
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


// Function to convert Pump.fun data to our token format - moved inside component
const convertPumpFunToToken = (coin: PumpFunCoin, index: number, status: 'new' | 'about-to-graduate' | 'migrated' = 'new'): TrenchesToken => {
  const volumeInUsd = formatVolume(coin.volume)
  
  // Determine platform based on coin data
  const platform = coin.platform || 'unknown'
  const platformLogo = coin.platformLogo
  
  return {
    id: (index + 1).toString(),
    name: coin.name,
    symbol: coin.ticker,
    image: coin.imageUrl || `https://ui-avatars.com/api/?name=${coin.ticker}&background=6366f1&color=fff&size=48`,
    mc: formatMarketCap(coin.marketCap),
    volume: volumeInUsd,
    fee: typeof coin.totalFees === 'string' ? coin.totalFees : (coin.totalFees || 0).toFixed(3), // Use total fees from SolanaTracker (already formatted) - CACHE BUSTER
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
    platform: platform as any,
    platformLogo: platformLogo,
    buyAmount: "5.00",
    totalFees: typeof coin.totalFees === 'string' ? parseFloat(coin.totalFees) || 0 : coin.totalFees || 0,
    tradingFees: typeof coin.tradingFees === 'string' ? parseFloat(coin.tradingFees) || 0 : coin.tradingFees || 0,
    tipsFees: typeof coin.tipsFees === 'string' ? parseFloat(coin.tipsFees) || 0 : coin.tipsFees || 0,
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

// Function to convert Bonk.fun data to our token format - moved inside component
const convertBonkFunToToken = (token: BonkFunToken, index: number): TrenchesToken => {
  const volumeInUsd = formatVolume(token.volumeU)
  
  return {
    id: (index + 1).toString(),
    name: token.name,
    symbol: token.symbol,
    image: token.imgUrl || `https://ui-avatars.com/api/?name=${token.symbol}&background=6366f1&color=fff&size=48`,
    mc: formatMarketCap(token.marketCap),
    volume: volumeInUsd,
    fee: "0", // Bonk.fun doesn't provide fee data in this endpoint
    age: formatTimeAgo(new Date(token.createAt).getTime()),
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
    hasTwitter: !!(token as any).twitter,
    hasTelegram: false,
    hasWebsite: !!(token as any).website,
    twitter: (token as any).twitter,
    telegram: null,
    website: token.website
  }
}

// Function to convert Moon.it data to our token format - moved inside component
const convertMoonItToToken = (token: MoonItToken, index: number): TrenchesToken => {
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

// Function to convert Solana Tracker data to our token format
const convertSolanaTrackerToToken = (token: any, index: number, status: 'new' | 'about-to-graduate' | 'migrated' = 'new'): TrenchesToken => {
  const volumeInUsd = formatVolume(token.volume || 0)
  const marketCap = token.marketCap || 0
  const createdAt = token.creationTime || Date.now()
  
  return {
    id: token.id || (index + 1).toString(),
    name: token.name,
    symbol: token.symbol,
    image: token.image || `https://ui-avatars.com/api/?name=${token.symbol}&background=6366f1&color=fff&size=48`,
    mc: formatMarketCap(marketCap),
    volume: volumeInUsd,
    fee: typeof token.totalFees === 'string' ? token.totalFees : (token.totalFees || 0).toFixed(3),
    age: token.age || formatTimeAgo(createdAt),
    holders: token.holders || 0,
    buys: token.buyTransactions || 0,
    sells: token.sellTransactions || 0,
    status: status,
    tag: token.name, // Using name as tag for now
    contractAddress: token.contractAddress || '',
    migratedTokens: status === 'migrated' ? 1 : 0,
    devSold: (token.devPercentage || token.devHoldingsPercentage || 0) === 0,
    top10Holders: Math.round(token.topHoldersPercentage || 0),
    snipers: Math.round((token.sniperOwnedPercentage || 0) * 100) / 100,
    insiders: 0, // Not provided in Solana Tracker API
    platform: token.platform || 'unknown' as any,
    platformLogo: token.platformLogo,
    buyAmount: "5.00",
    totalFees: typeof token.totalFees === 'string' ? parseFloat(token.totalFees) || 0 : token.totalFees || 0,
    tradingFees: typeof token.tradingFees === 'string' ? parseFloat(token.tradingFees) || 0 : token.tradingFees || 0,
    tipsFees: typeof token.tipsFees === 'string' ? parseFloat(token.tipsFees) || 0 : token.tipsFees || 0,
    // Solana Tracker specific fields
    coinMint: token.contractAddress || '',
    dev: '', // Not provided in Solana Tracker API
    bondingCurveProgress: token.bondingCurveProgress || 0,
    sniperCount: token.sniperCount || 0,
    graduationDate: token.graduationDate || null,
    devHoldingsPercentage: token.devHoldingsPercentage || 0,
    sniperOwnedPercentage: token.sniperOwnedPercentage || 0,
    topHoldersPercentage: token.topHoldersPercentage || 0,
    hasTwitter: token.hasTwitter || false,
    hasTelegram: token.hasTelegram || false,
    hasWebsite: token.hasWebsite || false,
    twitter: token.twitter || null,
    telegram: token.telegram || null,
    website: token.website || null,
    // Risk data fields
    top10HoldersPercentage: token.top10HoldersPercentage || 0,
    devPercentage: token.devPercentage || 0,
    devAmount: token.devAmount || 0,
    insidersCount: token.insidersCount || 0,
    insidersTotalBalance: token.insidersTotalBalance || 0,
    insidersTotalPercentage: token.insidersTotalPercentage || 0,
    snipersCount: token.snipersCount || 0,
    snipersTotalBalance: token.snipersTotalBalance || 0,
    snipersTotalPercentage: token.snipersTotalPercentage || 0
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
    pumpswap: boolean
    moonshot: boolean
    boop: boolean
    orca: boolean
    meteora: boolean
    raydium: boolean
    jupiter: boolean
    birdeye: boolean
    dexscreener: boolean
    solscan: boolean
    solana: boolean
    trends: boolean
    rupert: boolean
    unknown: boolean
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
  const [migratedTokens, setMigratedTokens] = useState<TrenchesToken[]>([])
  const [solanaTrackerGraduatingTokens, setSolanaTrackerGraduatingTokens] = useState<TrenchesToken[]>([])
  const [solanaTrackerGraduatedTokens, setSolanaTrackerGraduatedTokens] = useState<TrenchesToken[]>([])
  const [bonkFunTokens, setBonkFunTokens] = useState<TrenchesToken[]>([])
  const [bonkFunMCTokens, setBonkFunMCTokens] = useState<TrenchesToken[]>([])
  const [bonkFunGraduatedTokens, setBonkFunGraduatedTokens] = useState<TrenchesToken[]>([])
  const [moonItTokens, setMoonItTokens] = useState<TrenchesToken[]>([])
  const [moonItMCTokens, setMoonItMCTokens] = useState<TrenchesToken[]>([])
  const [moonItGraduatedTokens, setMoonItGraduatedTokens] = useState<TrenchesToken[]>([])
  const [error, setError] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState<number>(Date.now())
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(Date.now())
  const [filters, setFilters] = useState<FilterState>({
    launchpads: {
      pumpfun: true,
      bonk: true,
      moonit: true,
      metdbc: true,
      bagsfm: true,
      believeapp: true,
      pumpswap: true,
      moonshot: true,
      boop: true,
      orca: true,
      meteora: true,
      raydium: true,
      jupiter: true,
      birdeye: true,
      dexscreener: true,
      solscan: true,
      solana: true,
      trends: true,
      rupert: true,
      unknown: true
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
  const [showCustomize, setShowCustomize] = useState(false)
  const [selectedChain, setSelectedChain] = useState<'solana' | 'bnb'>('solana')
  const [echoSettings, setEchoSettings] = useState<EchoSettings | undefined>(undefined)
  
  // BSC Token States
  const [bscRealTokens, setBscRealTokens] = useState<TrenchesToken[]>([])
  const [bscMcTokens, setBscMcTokens] = useState<TrenchesToken[]>([])
  const [bscGraduatedTokens, setBscGraduatedTokens] = useState<TrenchesToken[]>([])

  // Simple time formatter without caching
  const formatTimeAgo = (timestamp: number): string => {
    const now = Date.now()
    const diff = now - timestamp
    
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days}d`
    if (hours > 0) return `${hours}h`
    if (minutes > 0) return `${minutes}m`
    return `${seconds}s`
  }

  // Live time updater for token age display - optimized for performance
  useEffect(() => {
    let animationFrameId: number
    
    const updateTime = () => {
      setCurrentTime(Date.now())
      animationFrameId = requestAnimationFrame(updateTime)
    }
    
    // Start the animation loop
    animationFrameId = requestAnimationFrame(updateTime)
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [])

  // Background SOL price fetcher to keep cache updated - optimized
  useEffect(() => {
    let isUpdating = false
    
    const updateSolPrice = async () => {
      if (isUpdating) return // Prevent concurrent updates
      isUpdating = true
      
      try {
        const response = await fetch('/api/moralis/token-prices?tokenAddresses=So11111111111111111111111111111111111111112&chain=solana', {
          signal: AbortSignal.timeout(5000) // 5 second timeout
        })
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
      } finally {
        isUpdating = false
      }
    }

    // Update SOL price every 30 seconds in background
    const solPriceInterval = setInterval(updateSolPrice, 30000)
    updateSolPrice() // Initial fetch

    return () => clearInterval(solPriceInterval)
  }, [])

  // Fetch all trading data in parallel for immediate loading with live updates every 1 second
  // CACHE BUSTER - Force file change to resolve fetchPumpFunMigratedTokens error
  useEffect(() => {
    let isFetching = false // Prevent concurrent fetches
    let fetchTimeout: NodeJS.Timeout | null = null
    
    const fetchAllDataInParallel = async () => {
      if (isFetching) return // Skip if already fetching
      isFetching = true
      
      try {
        console.log('🚀 Fetching all trading data in parallel for immediate loading...')
        setLastUpdateTime(Date.now())
      
      // Fetch migrated tokens through API route to avoid exposing API keys
      const fetchMigratedTokensInline = async () => {
        try {
          const response = await fetch('/api/pump-tokens-migrated', {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            signal: AbortSignal.timeout(3000)
          })
          
          if (!response.ok) return []
          const data = await response.json()
          return Array.isArray(data.coins) ? data.coins.slice(0, 30) : []
        } catch (error) {
          console.warn('Error fetching migrated tokens:', error)
          return []
        }
      }

      // Fetch Solana Tracker tokens for NEW column
      const fetchSolanaTrackerNewTokens = async () => {
        try {
          const response = await fetch('/api/solanatracker/tokens?type=new&limit=30', {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            signal: AbortSignal.timeout(5000)
          })
          
          if (!response.ok) return []
          const data = await response.json()
          return data.success && Array.isArray(data.data) ? data.data : []
        } catch (error) {
          console.warn('Error fetching Solana Tracker new tokens:', error)
          return []
        }
      }

      // Fetch Solana Tracker graduating tokens for MC column
      const fetchSolanaTrackerGraduatingTokens = async () => {
        try {
          const response = await fetch('/api/solanatracker/tokens?type=graduating&limit=30', {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            signal: AbortSignal.timeout(5000)
          })
          
          if (!response.ok) return []
          const data = await response.json()
          return data.success && Array.isArray(data.data) ? data.data : []
        } catch (error) {
          console.warn('Error fetching Solana Tracker graduating tokens:', error)
          return []
        }
      }

      // Fetch Solana Tracker graduated tokens for 3rd column
      const fetchSolanaTrackerGraduatedTokens = async () => {
        try {
          const response = await fetch('/api/solanatracker/tokens?type=graduated&limit=30', {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            signal: AbortSignal.timeout(5000)
          })
          
          if (!response.ok) return []
          const data = await response.json()
          return data.success && Array.isArray(data.data) ? data.data : []
        } catch (error) {
          console.warn('Error fetching Solana Tracker graduated tokens:', error)
          return []
        }
      }
      
      // Execute all API calls in parallel for maximum speed
      const [
        solanaTrackerNewResult,
        solanaTrackerGraduatingResult,
        solanaTrackerGraduatedResult,
        pumpFunResult,
        pumpFunMCResult,
        pumpFunGraduatedResult,
        pumpFunMigratedResult,
        bonkFunResult,
        bonkFunMCResult,
        bonkFunGraduatedResult,
        moonItResult,
        moonItMCResult,
        moonItGraduatedResult
      ] = await Promise.allSettled([
        fetchSolanaTrackerNewTokens(),
        fetchSolanaTrackerGraduatingTokens(),
        fetchSolanaTrackerGraduatedTokens(),
        fetchPumpFunTokens(),
        fetchPumpFunMCTokens(),
        fetchPumpFunGraduatedTokens(),
        fetchMigratedTokensInline(),
        fetchBonkFunTokens(),
        fetchBonkFunMCTokens(),
        fetchBonkFunGraduatedTokens(),
        fetchMoonItTokens(),
        fetchMoonItMCTokens(),
        fetchMoonItGraduatedTokens()
      ])

      // Process results immediately as they come in
      let hasSolanaTrackerTokens = false
      
      if (solanaTrackerNewResult.status === 'fulfilled' && solanaTrackerNewResult.value.length > 0) {
        const convertedTokens = solanaTrackerNewResult.value.slice(0, 30).map((token: any, index: number) => 
          convertSolanaTrackerToToken(token, index, 'new')
        )
        setRealTokens(convertedTokens)
        hasSolanaTrackerTokens = true
        console.log('✅ Solana Tracker NEW tokens loaded:', convertedTokens.length)
      } else {
        console.log('⚠️ Solana Tracker NEW tokens not available, will use fallback')
      }

      if (solanaTrackerGraduatingResult.status === 'fulfilled' && solanaTrackerGraduatingResult.value.length > 0) {
        const convertedTokens = solanaTrackerGraduatingResult.value.slice(0, 30).map((token: any, index: number) => 
          convertSolanaTrackerToToken(token, index, 'about-to-graduate')
        )
        // Filter out Solana Tracker graduating tokens older than 3 days
        const threeDaysAgo = Date.now() - (3 * 24 * 60 * 60 * 1000)
        const filteredSolanaTrackerGraduatingTokens = convertedTokens.filter((token: any) => {
          const tokenAge = parseTimeToMinutes(token.age)
          const tokenAgeInMs = tokenAge * 60 * 1000
          const tokenCreatedAt = Date.now() - tokenAgeInMs
          return tokenCreatedAt > threeDaysAgo
        })
        setSolanaTrackerGraduatingTokens(filteredSolanaTrackerGraduatingTokens)
        console.log('✅ Solana Tracker GRADUATING tokens loaded:', filteredSolanaTrackerGraduatingTokens.length, '(filtered from', convertedTokens.length, 'to exclude tokens >3 days old)')
      } else {
        console.log('⚠️ Solana Tracker GRADUATING tokens not available')
      }

      if (solanaTrackerGraduatedResult.status === 'fulfilled' && solanaTrackerGraduatedResult.value.length > 0) {
        const convertedTokens = solanaTrackerGraduatedResult.value.slice(0, 30).map((token: any, index: number) => 
          convertSolanaTrackerToToken(token, index, 'migrated')
        )
        // Filter out Solana Tracker graduated tokens older than 3 days
        const threeDaysAgo = Date.now() - (3 * 24 * 60 * 60 * 1000)
        const filteredSolanaTrackerGraduatedTokens = convertedTokens.filter((token: any) => {
          const tokenAge = parseTimeToMinutes(token.age)
          const tokenAgeInMs = tokenAge * 60 * 1000
          const tokenCreatedAt = Date.now() - tokenAgeInMs
          return tokenCreatedAt > threeDaysAgo
        })
        setSolanaTrackerGraduatedTokens(filteredSolanaTrackerGraduatedTokens)
        console.log('✅ Solana Tracker GRADUATED tokens loaded:', filteredSolanaTrackerGraduatedTokens.length, '(filtered from', convertedTokens.length, 'to exclude tokens >3 days old)')
      } else {
        console.log('⚠️ Solana Tracker GRADUATED tokens not available')
      }

      if (pumpFunResult.status === 'fulfilled') {
        const convertedTokens = pumpFunResult.value.slice(0, 30).map((coin: any, index: number) => 
          convertPumpFunToToken(coin, index, 'new')
        )
        // Only use Pump.fun tokens if Solana Tracker failed or returned no data
        if (!hasSolanaTrackerTokens) {
        setRealTokens(convertedTokens)
          console.log('✅ Pump.fun tokens loaded (fallback):', convertedTokens.length)
        }
      }

      if (pumpFunMCResult.status === 'fulfilled') {
        const convertedMCTokens = pumpFunMCResult.value.slice(0, 30).map((coin: any, index: number) => 
          convertPumpFunToToken(coin, index, 'about-to-graduate')
        )
        setMcTokens(convertedMCTokens)
        console.log('✅ Pump.fun MC tokens loaded:', convertedMCTokens.length)
      }

      if (pumpFunGraduatedResult.status === 'fulfilled') {
        const convertedGraduatedTokens = pumpFunGraduatedResult.value.slice(0, 30).map((coin: any, index: number) => 
          convertPumpFunToToken(coin, index, 'migrated')
        )
        setGraduatedTokens(convertedGraduatedTokens)
        console.log('✅ Pump.fun graduated tokens loaded:', convertedGraduatedTokens.length)
      }

      if (pumpFunMigratedResult.status === 'fulfilled') {
        const convertedMigratedTokens = pumpFunMigratedResult.value.slice(0, 30).map((coin: any, index: number) => 
          convertPumpFunToToken(coin, index, 'migrated')
        )
        setMigratedTokens(convertedMigratedTokens)
        console.log('✅ Pump.fun migrated tokens loaded:', convertedMigratedTokens.length)
      }

      if (bonkFunResult.status === 'fulfilled') {
        const convertedBonkFunTokens = bonkFunResult.value.slice(0, 30).map((coin: any, index: number) => 
          convertBonkFunToToken(coin, index)
        )
        // Filter out Bonk.fun tokens older than 3 days
        const threeDaysAgo = Date.now() - (3 * 24 * 60 * 60 * 1000)
        const filteredBonkFunTokens = convertedBonkFunTokens.filter((token: any) => {
          const tokenAge = parseTimeToMinutes(token.age)
          const tokenAgeInMs = tokenAge * 60 * 1000
          const tokenCreatedAt = Date.now() - tokenAgeInMs
          return tokenCreatedAt > threeDaysAgo
        })
        setBonkFunTokens(filteredBonkFunTokens)
        console.log('✅ Bonk.fun tokens loaded:', filteredBonkFunTokens.length, '(filtered from', convertedBonkFunTokens.length, 'to exclude tokens >3 days old)')
      }

      if (bonkFunMCResult.status === 'fulfilled') {
        const convertedBonkFunMCTokens = bonkFunMCResult.value.slice(0, 30).map((coin: any, index: number) =>
          convertBonkFunToToken(coin, index)
        )
        // Filter out Bonk.fun MC tokens older than 3 days
        const threeDaysAgo = Date.now() - (3 * 24 * 60 * 60 * 1000)
        const filteredBonkFunMCTokens = convertedBonkFunMCTokens.filter((token: any) => {
          const tokenAge = parseTimeToMinutes(token.age)
          const tokenAgeInMs = tokenAge * 60 * 1000
          const tokenCreatedAt = Date.now() - tokenAgeInMs
          return tokenCreatedAt > threeDaysAgo
        })
        setBonkFunMCTokens(filteredBonkFunMCTokens)
        console.log('✅ Bonk.fun MC tokens loaded:', filteredBonkFunMCTokens.length, '(filtered from', convertedBonkFunMCTokens.length, 'to exclude tokens >3 days old)')
      }

      if (bonkFunGraduatedResult.status === 'fulfilled') {
        const convertedBonkFunGraduatedTokens = bonkFunGraduatedResult.value.slice(0, 30).map((coin: any, index: number) => 
          convertBonkFunToToken(coin, index)
        )
        // Filter out Bonk.fun graduated tokens older than 3 days
        const threeDaysAgo = Date.now() - (3 * 24 * 60 * 60 * 1000)
        const filteredBonkFunGraduatedTokens = convertedBonkFunGraduatedTokens.filter((token: any) => {
          const tokenAge = parseTimeToMinutes(token.age)
          const tokenAgeInMs = tokenAge * 60 * 1000
          const tokenCreatedAt = Date.now() - tokenAgeInMs
          return tokenCreatedAt > threeDaysAgo
        })
        setBonkFunGraduatedTokens(filteredBonkFunGraduatedTokens)
        console.log('✅ Bonk.fun graduated tokens loaded:', filteredBonkFunGraduatedTokens.length, '(filtered from', convertedBonkFunGraduatedTokens.length, 'to exclude tokens >3 days old)')
      }

      if (moonItResult.status === 'fulfilled') {
        const convertedMoonItTokens = moonItResult.value.slice(0, 30).map((coin: any, index: number) => 
          convertMoonItToToken(coin, index)
        )
        // Filter out Moon.it tokens older than 3 days
        const threeDaysAgo = Date.now() - (3 * 24 * 60 * 60 * 1000)
        const filteredMoonItTokens = convertedMoonItTokens.filter((token: any) => {
          const tokenAge = parseTimeToMinutes(token.age)
          const tokenAgeInMs = tokenAge * 60 * 1000
          const tokenCreatedAt = Date.now() - tokenAgeInMs
          return tokenCreatedAt > threeDaysAgo
        })
        setMoonItTokens(filteredMoonItTokens)
        console.log('✅ Moon.it tokens loaded:', filteredMoonItTokens.length, '(filtered from', convertedMoonItTokens.length, 'to exclude tokens >3 days old)')
      }

      if (moonItMCResult.status === 'fulfilled') {
        const convertedMoonItMCTokens = moonItMCResult.value.slice(0, 30).map((coin: any, index: number) => 
          convertMoonItToToken(coin, index)
        )
        // Filter out Moon.it MC tokens older than 3 days
        const threeDaysAgo = Date.now() - (3 * 24 * 60 * 60 * 1000)
        const filteredMoonItMCTokens = convertedMoonItMCTokens.filter((token: any) => {
          const tokenAge = parseTimeToMinutes(token.age)
          const tokenAgeInMs = tokenAge * 60 * 1000
          const tokenCreatedAt = Date.now() - tokenAgeInMs
          return tokenCreatedAt > threeDaysAgo
        })
        setMoonItMCTokens(filteredMoonItMCTokens)
        console.log('✅ Moon.it MC tokens loaded:', filteredMoonItMCTokens.length, '(filtered from', convertedMoonItMCTokens.length, 'to exclude tokens >3 days old)')
      }

      if (moonItGraduatedResult.status === 'fulfilled') {
        const convertedMoonItGraduatedTokens = moonItGraduatedResult.value.slice(0, 30).map((coin: any, index: number) => 
          convertMoonItToToken(coin, index)
        )
        // Filter out Moon.it graduated tokens older than 3 days
        const threeDaysAgo = Date.now() - (3 * 24 * 60 * 60 * 1000)
        const filteredMoonItGraduatedTokens = convertedMoonItGraduatedTokens.filter((token: any) => {
          const tokenAge = parseTimeToMinutes(token.age)
          const tokenAgeInMs = tokenAge * 60 * 1000
          const tokenCreatedAt = Date.now() - tokenAgeInMs
          return tokenCreatedAt > threeDaysAgo
        })
        setMoonItGraduatedTokens(filteredMoonItGraduatedTokens)
        console.log('✅ Moon.it graduated tokens loaded:', filteredMoonItGraduatedTokens.length, '(filtered from', convertedMoonItGraduatedTokens.length, 'to exclude tokens >3 days old)')
      }

      console.log('🚀 All trading data loaded in parallel!')
      
      } catch (error) {
        console.error('Error in fetchAllDataInParallel:', error)
      } finally {
        isFetching = false // Always reset fetching flag
      }
    }

    const fetchData = async () => {
      try {
        console.log('Fetching Pump.fun data...')
        const pumpFunCoins = await fetchPumpFunTokens()
        console.log('Received coins:', pumpFunCoins.length)
        const convertedTokens = pumpFunCoins.slice(0, 30).map((coin: any, index: number) => 
          convertPumpFunToToken(coin, index, 'new')
        )
        console.log('Converted tokens:', convertedTokens.length)
        setRealTokens(convertedTokens)
        setError(null) // Clear any previous errors
      } catch (error) {
        console.error('Error fetching real data:', error)
        setError(`Failed to fetch new tokens: ${error instanceof Error ? error.message : 'Unknown error'}`)
        // Keep realTokens empty if API fails
        setRealTokens([])
      }
    }

    const fetchMCData = async () => {
      try {
        console.log('Fetching Pump.fun MC data...')
        const pumpFunMCCoins = await fetchPumpFunMCTokens()
        console.log('Received MC coins:', pumpFunMCCoins.length)
        const convertedMCTokens = pumpFunMCCoins.slice(0, 30).map((coin: any, index: number) => 
          convertPumpFunToToken(coin, index, 'about-to-graduate')
        )
        console.log('Converted MC tokens:', convertedMCTokens.length)
        setMcTokens(convertedMCTokens)
        setError(null) // Clear any previous errors
      } catch (error) {
        console.error('Error fetching MC data:', error)
        setError(`Failed to fetch MC tokens: ${error instanceof Error ? error.message : 'Unknown error'}`)
        // Keep mcTokens empty if API fails
        setMcTokens([])
      }
    }

    const fetchGraduatedData = async () => {
      try {
        console.log('Fetching Pump.fun graduated data...')
        const pumpFunGraduatedCoins = await fetchPumpFunGraduatedTokens()
        console.log('Received graduated coins:', pumpFunGraduatedCoins.length)
        const convertedGraduatedTokens = pumpFunGraduatedCoins.slice(0, 30).map((coin: any, index: number) => 
          convertPumpFunToToken(coin, index, 'migrated')
        )
        console.log('Converted graduated tokens:', convertedGraduatedTokens.length)
        setGraduatedTokens(convertedGraduatedTokens)
        setError(null) // Clear any previous errors
      } catch (error) {
        console.error('Error fetching graduated data:', error)
        setError(`Failed to fetch graduated tokens: ${error instanceof Error ? error.message : 'Unknown error'}`)
        // Keep graduatedTokens empty if API fails
        setGraduatedTokens([])
      }
    }

    const fetchMigratedData = async () => {
      try {
        console.log('Fetching Pump.fun migrated data...')
        const response = await fetch('/api/pump-tokens-migrated', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        })
        
        console.log('Migrated response status:', response.status)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        
        if (!data.coins || !Array.isArray(data.coins)) {
          console.warn('Invalid migrated response structure:', data)
          setMigratedTokens([])
          return
        }
        
        console.log('Received migrated coins:', data.coins.length)
        const convertedMigratedTokens = data.coins.slice(0, 30).map((coin: any, index: number) => 
          convertPumpFunToToken(coin, index, 'migrated')
        )
        console.log('Converted migrated tokens:', convertedMigratedTokens.length)
        setMigratedTokens(convertedMigratedTokens)
        setError(null) // Clear any previous errors
      } catch (error) {
        console.error('Error fetching migrated data:', error)
        setError(`Failed to fetch migrated tokens: ${error instanceof Error ? error.message : 'Unknown error'}`)
        // Keep migratedTokens empty if API fails
        setMigratedTokens([])
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
        // Filter out Bonk.fun tokens older than 3 days
        const threeDaysAgo = Date.now() - (3 * 24 * 60 * 60 * 1000)
        const filteredBonkFunTokens = convertedBonkFunTokens.filter((token: any) => {
          const tokenAge = parseTimeToMinutes(token.age)
          const tokenAgeInMs = tokenAge * 60 * 1000
          const tokenCreatedAt = Date.now() - tokenAgeInMs
          return tokenCreatedAt > threeDaysAgo
        })
        console.log('Converted bonk.fun tokens:', filteredBonkFunTokens.length, '(filtered from', convertedBonkFunTokens.length, 'to exclude tokens >3 days old)')
        setBonkFunTokens(filteredBonkFunTokens)
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
        // Filter out Bonk.fun MC tokens older than 3 days
        const threeDaysAgo = Date.now() - (3 * 24 * 60 * 60 * 1000)
        const filteredBonkFunMCTokens = convertedBonkFunMCTokens.filter((token: any) => {
          const tokenAge = parseTimeToMinutes(token.age)
          const tokenAgeInMs = tokenAge * 60 * 1000
          const tokenCreatedAt = Date.now() - tokenAgeInMs
          return tokenCreatedAt > threeDaysAgo
        })
        console.log('Converted bonk.fun MC tokens:', filteredBonkFunMCTokens.length, '(filtered from', convertedBonkFunMCTokens.length, 'to exclude tokens >3 days old)')
        setBonkFunMCTokens(filteredBonkFunMCTokens)
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
        // Filter out Bonk.fun graduated tokens older than 3 days
        const threeDaysAgo = Date.now() - (3 * 24 * 60 * 60 * 1000)
        const filteredBonkFunGraduatedTokens = convertedBonkFunGraduatedTokens.filter((token: any) => {
          const tokenAge = parseTimeToMinutes(token.age)
          const tokenAgeInMs = tokenAge * 60 * 1000
          const tokenCreatedAt = Date.now() - tokenAgeInMs
          return tokenCreatedAt > threeDaysAgo
        })
        console.log('Converted bonk.fun graduated tokens:', filteredBonkFunGraduatedTokens.length, '(filtered from', convertedBonkFunGraduatedTokens.length, 'to exclude tokens >3 days old)')
        setBonkFunGraduatedTokens(filteredBonkFunGraduatedTokens)
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
        // Filter out Moon.it tokens older than 3 days
        const threeDaysAgo = Date.now() - (3 * 24 * 60 * 60 * 1000)
        const filteredMoonItTokens = convertedMoonItTokens.filter((token: any) => {
          const tokenAge = parseTimeToMinutes(token.age)
          const tokenAgeInMs = tokenAge * 60 * 1000
          const tokenCreatedAt = Date.now() - tokenAgeInMs
          return tokenCreatedAt > threeDaysAgo
        })
        console.log('Converted moon.it tokens:', filteredMoonItTokens.length, '(filtered from', convertedMoonItTokens.length, 'to exclude tokens >3 days old)')
        setMoonItTokens(filteredMoonItTokens)
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
        // Filter out Moon.it MC tokens older than 3 days
        const threeDaysAgo = Date.now() - (3 * 24 * 60 * 60 * 1000)
        const filteredMoonItMCTokens = convertedMoonItMCTokens.filter((token: any) => {
          const tokenAge = parseTimeToMinutes(token.age)
          const tokenAgeInMs = tokenAge * 60 * 1000
          const tokenCreatedAt = Date.now() - tokenAgeInMs
          return tokenCreatedAt > threeDaysAgo
        })
        console.log('Converted moon.it MC tokens:', filteredMoonItMCTokens.length, '(filtered from', convertedMoonItMCTokens.length, 'to exclude tokens >3 days old)')
        setMoonItMCTokens(filteredMoonItMCTokens)
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
        // Filter out Moon.it graduated tokens older than 3 days
        const threeDaysAgo = Date.now() - (3 * 24 * 60 * 60 * 1000)
        const filteredMoonItGraduatedTokens = convertedMoonItGraduatedTokens.filter((token: any) => {
          const tokenAge = parseTimeToMinutes(token.age)
          const tokenAgeInMs = tokenAge * 60 * 1000
          const tokenCreatedAt = Date.now() - tokenAgeInMs
          return tokenCreatedAt > threeDaysAgo
        })
        console.log('Converted moon.it graduated tokens:', filteredMoonItGraduatedTokens.length, '(filtered from', convertedMoonItGraduatedTokens.length, 'to exclude tokens >3 days old)')
        setMoonItGraduatedTokens(filteredMoonItGraduatedTokens)
        setError(null) // Clear any previous errors
      } catch (error) {
        console.error('Error fetching moon.it graduated data:', error)
        setError(`Failed to fetch moon.it graduated tokens: ${error instanceof Error ? error.message : 'Unknown error'}`)
        // Keep moonItGraduatedTokens empty if API fails
        setMoonItGraduatedTokens([])
      }
    }

    // Initial parallel fetch for immediate trading data
    fetchAllDataInParallel()

    // Set up optimized auto-refresh with staggered updates to prevent API overload
    const interval = setInterval(() => {
      // Clear any pending timeout
      if (fetchTimeout) {
        clearTimeout(fetchTimeout)
      }
      
      // Use timeout to prevent overlapping requests
      fetchTimeout = setTimeout(() => {
        console.log('Auto-refreshing token data in parallel...')
        fetchAllDataInParallel()
      }, 100) // Small delay to prevent overlapping
    }, 1000) // 1 second for real-time trading

    // Cleanup interval and timeout on component unmount
    return () => {
      clearInterval(interval)
      if (fetchTimeout) {
        clearTimeout(fetchTimeout)
      }
    }
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



  // Helper functions - memoized for performance
  const parseTimeToMinutes = useCallback((timeStr: string): number => {
    if (timeStr.includes('s')) return 0
    if (timeStr.includes('m')) return parseInt(timeStr) || 0
    if (timeStr.includes('h')) return (parseInt(timeStr) || 0) * 60
    if (timeStr.includes('d')) return (parseInt(timeStr) || 0) * 60 * 24
    return 0
  }, [])

  const parseMarketCap = useCallback((mcStr: string): number => {
    if (!mcStr) return 0
    const cleanStr = mcStr.replace('$', '').replace(',', '')
    if (cleanStr.includes('M')) {
      return parseFloat(cleanStr.replace('M', '')) * 1000000
    } else if (cleanStr.includes('K')) {
      return parseFloat(cleanStr.replace('K', '')) * 1000
    } else {
      return parseFloat(cleanStr) || 0
    }
  }, [])

  // Memoized filter function for better performance
  const applyFilters = useCallback((tokens: TrenchesToken[]) => {
    return tokens.filter((token: any) => {
      const platformMap = {
        'pump.fun': 'pumpfun',
        'bonk.fun': 'bonk',
        'moon.it': 'moonit',
        'pumpswap': 'pumpswap',
        'moonshot': 'moonshot',
        'boop.fun': 'boop',
        'orca': 'orca',
        'meteora': 'meteora',
        'raydium': 'raydium',
        'jupiter': 'jupiter',
        'birdeye': 'birdeye',
        'dexscreener': 'dexscreener',
        'solscan': 'solscan',
        'solana': 'solana',
        'trends.fun': 'trends',
        'rupert': 'rupert',
        'bags.fm': 'bagsfm',
        'believe.app': 'believeapp',
        'unknown': 'unknown'
      }
      const platformKey = platformMap[token.platform as keyof typeof platformMap] as keyof typeof filters.launchpads
      if (!platformKey || !filters.launchpads[platformKey]) return false

      if (filters.atLeastOneSocial && !token.hasTwitter && !token.hasTelegram && !token.hasWebsite) {
        return false
      }

      if (filters.includeKeywords) {
        const includeKeywords = filters.includeKeywords.toLowerCase().split(',').map(k => k.trim())
        const tokenText = `${token.name} ${token.symbol} ${token.tag}`.toLowerCase()
        if (!includeKeywords.some(keyword => tokenText.includes(keyword))) return false
      }

      if (filters.excludeKeywords) {
        const excludeKeywords = filters.excludeKeywords.toLowerCase().split(',').map(k => k.trim())
        const tokenText = `${token.name} ${token.symbol} ${token.tag}`.toLowerCase()
        if (excludeKeywords.some(keyword => tokenText.includes(keyword))) return false
      }

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
  }, [filters, parseMarketCap])

  // Memoized token processing for each category
  const newTokens = useMemo(() => {
    // Combine all tokens and sort by time (newest first)
    const combinedTokens = [...realTokens, ...bonkFunTokens, ...moonItTokens]
    console.log('🔍 NEW tokens - combined:', combinedTokens.length, 'realTokens (SolanaTracker):', realTokens.length, 'bonkFun:', bonkFunTokens.length, 'moonIt:', moonItTokens.length)
    
    const filteredTokens = applyFilters(combinedTokens)
    console.log('🔍 NEW tokens - after filtering:', filteredTokens.length)
    
    // Sort all tokens by time (newest first)
    const sortedTokens = filteredTokens.sort((a, b) => {
        const aTime = parseTimeToMinutes(a.age)
        const bTime = parseTimeToMinutes(b.age)
      return aTime - bTime // Newest first (lowest time = newest)
      })
    
    return sortedTokens.slice(0, 30)
  }, [realTokens, bonkFunTokens, moonItTokens, applyFilters, parseTimeToMinutes])

  const mcCategoryTokens = useMemo(() => {
    // Focus on graduating/migrating tokens, not market cap
    const combinedGraduatingTokens = [...solanaTrackerGraduatingTokens, ...graduatedTokens, ...migratedTokens, ...bonkFunGraduatedTokens, ...moonItGraduatedTokens]
    console.log('🔍 GRADUATING tokens - combined:', combinedGraduatingTokens.length, 'solanaTrackerGraduating:', solanaTrackerGraduatingTokens.length, 'graduated:', graduatedTokens.length, 'migrated:', migratedTokens.length, 'bonkFunGraduated:', bonkFunGraduatedTokens.length, 'moonItGraduated:', moonItGraduatedTokens.length)
    
    const filteredGraduatingTokens = applyFilters(combinedGraduatingTokens)
    console.log('🔍 GRADUATING tokens - after filtering:', filteredGraduatingTokens.length)
    
    // Sort by time (newest first) for graduating tokens
    return filteredGraduatingTokens
      .sort((a, b) => {
        const aTime = parseTimeToMinutes(a.age)
        const bTime = parseTimeToMinutes(b.age)
        return aTime - bTime // Newest first
      })
      .slice(0, 30)
  }, [solanaTrackerGraduatingTokens, graduatedTokens, migratedTokens, bonkFunGraduatedTokens, moonItGraduatedTokens, applyFilters, parseTimeToMinutes])

  const graduatedCategoryTokens = useMemo(() => {
    const combinedGraduatedTokens = [...solanaTrackerGraduatedTokens, ...migratedTokens, ...bonkFunGraduatedTokens, ...moonItGraduatedTokens]
    console.log('🔍 GRADUATED tokens - combined:', combinedGraduatedTokens.length, 'solanaTrackerGraduated:', solanaTrackerGraduatedTokens.length, 'migrated:', migratedTokens.length, 'bonkFunGraduated:', bonkFunGraduatedTokens.length, 'moonItGraduated:', moonItGraduatedTokens.length)
    // For graduating tokens, show all tokens regardless of age since they are actively graduating
    const recentGraduatedTokens = combinedGraduatedTokens.filter((token: any) => {
      // If token has graduationDate, it's a graduating token - show all
      if (token.graduationDate) {
        return true
      }
      // For regular graduated tokens, apply the 3-day filter
      const threeDaysAgo = Date.now() - (3 * 24 * 60 * 60 * 1000)
      const tokenTime = parseTimeToMinutes(token.age)
      const tokenTimestamp = Date.now() - (tokenTime * 60 * 1000)
      return tokenTimestamp >= threeDaysAgo
    })
    console.log('🔍 GRADUATED tokens - after time filter:', recentGraduatedTokens.length)
    const filteredGraduatedTokens = applyFilters(recentGraduatedTokens)
    console.log('🔍 GRADUATED tokens - after filtering:', filteredGraduatedTokens.length)
    return filteredGraduatedTokens
      .sort((a, b) => {
        const aTime = parseTimeToMinutes(a.age)
        const bTime = parseTimeToMinutes(b.age)
        return aTime - bTime
      })
      .slice(0, 30)
  }, [solanaTrackerGraduatedTokens, migratedTokens, bonkFunGraduatedTokens, moonItGraduatedTokens, applyFilters, parseTimeToMinutes])

  // Memoized filter handler
  const handleFiltersChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters)
  }, [])

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

        {/* Engagement Indicators - Removed as not part of TrenchesToken interface */}

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
    <div className="min-h-screen text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-end space-x-4">
          <h1 className="text-2xl font-bold">Echo</h1>
          
          {/* Chain Toggle */}
          <div className="flex items-center rounded-lg p-1 pb-0.5">
            <button
              onClick={() => setSelectedChain('solana')}
              className="flex items-center justify-center p-1.5 transition-all hover:bg-zinc-800/30 rounded-md"
            >
              <img 
                src="/sol-logo.png" 
                alt="Solana" 
                className={`w-3 h-3 transition-all ${
                  selectedChain === 'solana' ? 'opacity-100' : 'opacity-50 grayscale'
                }`}
              />
            </button>
            <button
              onClick={() => setSelectedChain('bnb')}
              className="flex items-center justify-center p-1.5 transition-all hover:bg-zinc-800/30 rounded-md"
            >
              <img 
                src="/bnb-chain-binance-smart-chain-logo.svg" 
                alt="BNB Chain" 
                className={`w-3 h-3 transition-all ${
                  selectedChain === 'bnb' ? 'opacity-100' : 'opacity-50 grayscale'
                }`}
              />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Customize"
            onClick={() => setShowCustomize(!showCustomize)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-zinc-900/60 border border-zinc-700 text-zinc-200 hover:bg-zinc-800/60 transition-colors shadow-sm"
          >
            <Settings className="w-3 h-3 text-zinc-400" />
            <span className="text-xs">Customize</span>
          </button>
        </div>
      </div>




      {/* Three Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 items-start w-full">
        {selectedChain === 'solana' ? (
          <>
            <div className="px-1">
              <TrenchesColumn 
                title="New" 
                tokens={newTokens} 
                onFiltersChange={handleFiltersChange}
                initialFilters={filters}
                selectedChain={selectedChain}
                echoSettings={echoSettings}
              />
            </div>
            <div>
              <TrenchesColumn 
                title="% MC" 
                tokens={mcCategoryTokens} 
                onFiltersChange={handleFiltersChange}
                initialFilters={filters}
                selectedChain={selectedChain}
                echoSettings={echoSettings}
              />
            </div>
            <div className="px-1">
              <TrenchesColumn 
                title="Migrated" 
                tokens={graduatedCategoryTokens} 
                onFiltersChange={handleFiltersChange}
                initialFilters={filters}
                selectedChain={selectedChain}
                echoSettings={echoSettings}
              />
            </div>
          </>
        ) : (
          <>
            <div className="px-1">
              <TrenchesColumn 
                title="New" 
                tokens={bscRealTokens} 
                onFiltersChange={handleFiltersChange}
                initialFilters={filters}
                selectedChain={selectedChain}
                echoSettings={echoSettings}
              />
            </div>
            <div>
              <TrenchesColumn 
                title="% MC" 
                tokens={bscMcTokens} 
                onFiltersChange={handleFiltersChange}
                initialFilters={filters}
                selectedChain={selectedChain}
                echoSettings={echoSettings}
              />
            </div>
            <div className="px-1">
              <TrenchesColumn 
                title="Migrated" 
                tokens={bscGraduatedTokens} 
                onFiltersChange={handleFiltersChange}
                initialFilters={filters}
                selectedChain={selectedChain}
                echoSettings={echoSettings}
              />
            </div>
          </>
        )}
      </div>

      {/* Customize Modal */}
      <EchoCustomizeModal 
        isOpen={showCustomize}
        onClose={() => setShowCustomize(false)}
        settings={echoSettings}
        onApply={(s) => setEchoSettings(s)}
      />

    </div>
  )
}
