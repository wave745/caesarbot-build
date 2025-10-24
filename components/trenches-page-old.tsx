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
  platform: 'pump.fun' | 'bonk.fun' | 'moon.it' | 'pumpswap' | 'moonshot' | 'boop.fun' | 'orca' | 'meteora' | 'raydium'
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


// Function to convert SolanaTracker data to our token format
const convertSolanaTrackerToToken = (token: any, index: number, status: 'new' | 'about-to-graduate' | 'migrated' = 'new'): TrenchesToken => {
  const volumeInUsd = formatVolume(token.volume24h || 0)
  
  // Determine platform based on token data
  const platform = token.platform || 'pump.fun'
  const platformLogo = token.platformLogo
  
  return {
    id: (index + 1).toString(),
    name: token.name,
    symbol: token.symbol,
    image: token.logoURI || '/placeholder-token.png',
    mc: formatMarketCap(token.marketCap || 0),
    volume: volumeInUsd,
    fee: "0.1%", // Default fee
    age: formatTimeAgo(token.createdAt || Date.now()),
    holders: token.holders || 0,
    buys: 0, // Not provided in SolanaTracker API
    sells: 0, // Not provided in SolanaTracker API
    status: status,
    tag: token.name,
    contractAddress: token.address,
    migratedTokens: 0,
    devSold: false, // Not provided in SolanaTracker API
    top10Holders: 0, // Not provided in SolanaTracker API
    snipers: 0, // Not provided in SolanaTracker API
    insiders: 0, // Not provided in SolanaTracker API
    platform: platform as any,
    platformLogo: platformLogo,
    buyAmount: "5.00",
    // SolanaTracker specific fields
    coinMint: token.address,
    dev: null, // Not provided in SolanaTracker API
    bondingCurveProgress: 0, // Not provided in SolanaTracker API
    sniperCount: 0, // Not provided in SolanaTracker API
    graduationDate: null,
    devHoldingsPercentage: 0, // Not provided in SolanaTracker API
    sniperOwnedPercentage: 0, // Not provided in SolanaTracker API
    topHoldersPercentage: 0, // Not provided in SolanaTracker API
    hasTwitter: !!token.socialLinks?.twitter,
    hasTelegram: !!token.socialLinks?.telegram,
    hasWebsite: !!token.socialLinks?.website,
    twitter: token.socialLinks?.twitter,
    telegram: token.socialLinks?.telegram,
    website: token.socialLinks?.website
  }
}

// Function to convert Pump.fun data to our token format - moved inside component
const convertPumpFunToToken = (coin: PumpFunCoin, index: number, status: 'new' | 'about-to-graduate' | 'migrated' = 'new'): TrenchesToken => {
  const volumeInUsd = formatVolume(coin.volume)
  
  // Determine platform based on coin data
  const platform = coin.platform || 'pump.fun'
  const platformLogo = coin.platformLogo
  
  return {
    id: (index + 1).toString(),
    name: coin.name,
    symbol: coin.ticker,
    image: coin.imageUrl || `https://ui-avatars.com/api/?name=${coin.ticker}&background=6366f1&color=fff&size=48`,
    mc: formatMarketCap(coin.marketCap),
    volume: volumeInUsd,
    fee: typeof coin.totalFees === 'string' ? coin.totalFees : (coin.totalFees || 0).toString(), // Use total fees from SolanaTracker (already formatted) - CACHE BUSTER
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
  const [migratedTokens, setMigratedTokens] = useState<TrenchesToken[]>([])
  const [bonkFunTokens, setBonkFunTokens] = useState<TrenchesToken[]>([])
  const [bonkFunMCTokens, setBonkFunMCTokens] = useState<TrenchesToken[]>([])
  const [bonkFunGraduatedTokens, setBonkFunGraduatedTokens] = useState<TrenchesToken[]>([])
  const [moonItTokens, setMoonItTokens] = useState<TrenchesToken[]>([])
  const [moonItMCTokens, setMoonItMCTokens] = useState<TrenchesToken[]>([])
  const [moonItGraduatedTokens, setMoonItGraduatedTokens] = useState<TrenchesToken[]>([])
  const [error, setError] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState<number>(Date.now())
  const [filters, setFilters] = useState<FilterState>({
    launchpads: {
      pumpfun: true,
      bonk: true,
      moonit: true,
      metdbc: true,
      bagsfm: true,
      believeapp: true
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

  // Live time updater for token age display
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(Date.now())
    }
    
    updateTime()
    const interval = setInterval(updateTime, 1000) // Update every second
    return () => clearInterval(interval)
  }, [])

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

  // Fetch SolanaTracker data using clean API
  useEffect(() => {
    const fetchSolanaTrackerData = async () => {
      console.log('🚀 Fetching SolanaTracker data...')
      
      try {
        // Fetch all three types of tokens in parallel
        const [newTokensRes, graduatingTokensRes, graduatedTokensRes] = await Promise.allSettled([
          fetch('/api/solanatracker?type=new&limit=30'),
          fetch('/api/solanatracker?type=graduating&limit=30'),
          fetch('/api/solanatracker?type=graduated&limit=30')
        ])

        // Process new tokens
        if (newTokensRes.status === 'fulfilled') {
          const newData = await newTokensRes.value.json()
          if (newData.success && newData.data) {
            const convertedTokens = newData.data.map((token: any, index: number) => 
              convertSolanaTrackerToToken(token, index, 'new')
            )
            setRealTokens(convertedTokens)
            console.log('✅ New tokens loaded:', convertedTokens.length)
          }
        }

        // Process graduating tokens
        if (graduatingTokensRes.status === 'fulfilled') {
          const graduatingData = await graduatingTokensRes.value.json()
          if (graduatingData.success && graduatingData.data) {
            const convertedTokens = graduatingData.data.map((token: any, index: number) => 
              convertSolanaTrackerToToken(token, index, 'about-to-graduate')
            )
            setMcTokens(convertedTokens)
            console.log('✅ Graduating tokens loaded:', convertedTokens.length)
          }
        }

        // Process graduated tokens
        if (graduatedTokensRes.status === 'fulfilled') {
          const graduatedData = await graduatedTokensRes.value.json()
          if (graduatedData.success && graduatedData.data) {
            const convertedTokens = graduatedData.data.map((token: any, index: number) => 
              convertSolanaTrackerToToken(token, index, 'migrated')
            )
            setGraduatedTokens(convertedTokens)
            console.log('✅ Graduated tokens loaded:', convertedTokens.length)
          }
        }

        // Also fetch other platform data for BSC chain
        const [
          bonkFunResult,
          bonkFunMCResult,
          bonkFunGraduatedResult,
          moonItResult,
          moonItMCResult,
          moonItGraduatedResult
        ] = await Promise.allSettled([
          fetchBonkFunTokens(),
          fetchBonkFunMCTokens(),
          fetchBonkFunGraduatedTokens(),
          fetchMoonItTokens(),
          fetchMoonItMCTokens(),
          fetchMoonItGraduatedTokens()
        ])

        // Process BSC chain tokens
        if (bonkFunResult.status === 'fulfilled') {
          const convertedBonkFunTokens = bonkFunResult.value.slice(0, 30).map((coin, index) => 
            convertBonkFunToToken(coin, index)
          )
          setBonkFunTokens(convertedBonkFunTokens)
          console.log('✅ Bonk.fun tokens loaded:', convertedBonkFunTokens.length)
        }

        if (bonkFunMCResult.status === 'fulfilled') {
          const convertedBonkFunMCTokens = bonkFunMCResult.value.slice(0, 30).map((coin, index) => 
            convertBonkFunToToken(coin, index)
          )
          setBonkFunMCTokens(convertedBonkFunMCTokens)
          console.log('✅ Bonk.fun MC tokens loaded:', convertedBonkFunMCTokens.length)
        }

        if (bonkFunGraduatedResult.status === 'fulfilled') {
          const convertedBonkFunGraduatedTokens = bonkFunGraduatedResult.value.slice(0, 30).map((coin, index) => 
            convertBonkFunToToken(coin, index)
          )
          setBonkFunGraduatedTokens(convertedBonkFunGraduatedTokens)
          console.log('✅ Bonk.fun graduated tokens loaded:', convertedBonkFunGraduatedTokens.length)
        }

        if (moonItResult.status === 'fulfilled') {
          const convertedMoonItTokens = moonItResult.value.slice(0, 30).map((token, index) => 
            convertMoonItToToken(token, index)
          )
          setMoonItTokens(convertedMoonItTokens)
          console.log('✅ Moon.it tokens loaded:', convertedMoonItTokens.length)
        }

        if (moonItMCResult.status === 'fulfilled') {
          const convertedMoonItMCTokens = moonItMCResult.value.slice(0, 30).map((token, index) => 
            convertMoonItToToken(token, index)
          )
          setMoonItMCTokens(convertedMoonItMCTokens)
          console.log('✅ Moon.it MC tokens loaded:', convertedMoonItMCTokens.length)
        }

        if (moonItGraduatedResult.status === 'fulfilled') {
          const convertedMoonItGraduatedTokens = moonItGraduatedResult.value.slice(0, 30).map((token, index) => 
            convertMoonItToToken(token, index)
          )
          setMoonItGraduatedTokens(convertedMoonItGraduatedTokens)
          console.log('✅ Moon.it graduated tokens loaded:', convertedMoonItGraduatedTokens.length)
        }

        console.log('🚀 All SolanaTracker data loaded!')
      } catch (error) {
        console.error('Error fetching SolanaTracker data:', error)
        setError('Failed to load token data')
      }
    }

    fetchSolanaTrackerData()
  }, [])

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
        const convertedMCTokens = pumpFunMCCoins.slice(0, 30).map((coin, index) => 
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
        const convertedGraduatedTokens = pumpFunGraduatedCoins.slice(0, 30).map((coin, index) => 
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

    // Initial parallel fetch for immediate trading data
    fetchAllDataInParallel()

    // Set up auto-refresh every 2 seconds for ultra-fast trading updates
    const interval = setInterval(() => {
      console.log('Auto-refreshing token data in parallel...')
      fetchAllDataInParallel()
    }, 2000) // 2 seconds for real-time trading

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
    return tokens.filter(token => {
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
        'jupiter': 'jupiter'
      }
      const platformKey = platformMap[token.platform] as keyof typeof filters.launchpads
      if (!filters.launchpads[platformKey]) return false

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
    const combinedTokens = [...realTokens, ...bonkFunTokens, ...moonItTokens]
    console.log('🔍 NEW tokens - combined:', combinedTokens.length, 'realTokens:', realTokens.length, 'bonkFun:', bonkFunTokens.length, 'moonIt:', moonItTokens.length)
    // Temporarily remove 3-day filtering to test if that's the issue
    const filteredTokens = applyFilters(combinedTokens)
    console.log('🔍 NEW tokens - after filtering:', filteredTokens.length)
    return filteredTokens
      .sort((a, b) => {
        const aTime = parseTimeToMinutes(a.age)
        const bTime = parseTimeToMinutes(b.age)
        return aTime - bTime
      })
      .slice(0, 30)
  }, [realTokens, bonkFunTokens, moonItTokens, applyFilters, parseTimeToMinutes])

  const mcCategoryTokens = useMemo(() => {
    const combinedMCTokens = [...mcTokens, ...bonkFunMCTokens, ...moonItMCTokens, ...graduatedTokens]
    console.log('🔍 MC tokens - combined:', combinedMCTokens.length, 'mcTokens:', mcTokens.length, 'bonkFunMC:', bonkFunMCTokens.length, 'moonItMC:', moonItMCTokens.length, 'graduated:', graduatedTokens.length)
    // Temporarily remove 3-day filtering to test if that's the issue
    const filteredMCTokens = applyFilters(combinedMCTokens)
    console.log('🔍 MC tokens - after filtering:', filteredMCTokens.length)
    return filteredMCTokens
      .sort((a, b) => {
        const aMC = parseMarketCap(a.mc)
        const bMC = parseMarketCap(b.mc)
        return bMC - aMC
      })
      .slice(0, 30)
  }, [mcTokens, bonkFunMCTokens, moonItMCTokens, graduatedTokens, applyFilters, parseTimeToMinutes, parseMarketCap])

  const graduatedCategoryTokens = useMemo(() => {
    const combinedGraduatedTokens = [...migratedTokens, ...bonkFunGraduatedTokens, ...moonItGraduatedTokens]
    console.log('🔍 GRADUATED tokens - combined:', combinedGraduatedTokens.length, 'migrated:', migratedTokens.length, 'bonkFunGraduated:', bonkFunGraduatedTokens.length, 'moonItGraduated:', moonItGraduatedTokens.length)
    // For graduating tokens, show all tokens regardless of age since they are actively graduating
    const recentGraduatedTokens = combinedGraduatedTokens.filter(token => {
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
  }, [migratedTokens, bonkFunGraduatedTokens, moonItGraduatedTokens, applyFilters, parseTimeToMinutes])

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
                title="Graduating" 
                tokens={mcCategoryTokens} 
                onFiltersChange={handleFiltersChange}
                initialFilters={filters}
                selectedChain={selectedChain}
                echoSettings={echoSettings}
              />
            </div>
            <div className="px-1">
              <TrenchesColumn 
                title="Graduated" 
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
                title="Graduating" 
                tokens={bscMcTokens} 
                onFiltersChange={handleFiltersChange}
                initialFilters={filters}
                selectedChain={selectedChain}
                echoSettings={echoSettings}
              />
            </div>
            <div className="px-1">
              <TrenchesColumn 
                title="Graduated" 
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
