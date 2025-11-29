"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from "react"
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
  // Live age update
  creationTime?: number // Timestamp in milliseconds for live age calculation
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
    fee: typeof coin.totalFees === 'string' ? coin.totalFees : (coin.totalFees || 0).toFixed(3),
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
    website: coin.website,
    // Store creation time for live age updates
    creationTime: coin.creationTime
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
    // Store creation time for live age updates
    creationTime: new Date(token.createAt).getTime(),
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
    website: token.website,
    // Store creation time for live age updates
    creationTime: createdAt
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
  const [bonkFunTokens, setBonkFunTokens] = useState<TrenchesToken[]>([])
  const [bonkFunMCTokens, setBonkFunMCTokens] = useState<TrenchesToken[]>([])
  const [bonkFunGraduatedTokens, setBonkFunGraduatedTokens] = useState<TrenchesToken[]>([])
  const [moonItTokens, setMoonItTokens] = useState<TrenchesToken[]>([])
  const [moonItMCTokens, setMoonItMCTokens] = useState<TrenchesToken[]>([])
  const [moonItGraduatedTokens, setMoonItGraduatedTokens] = useState<TrenchesToken[]>([])
  const [pumpFunTokens, setPumpFunTokens] = useState<TrenchesToken[]>([]) // Direct pump.fun API tokens
  // Track if polling is in progress to prevent concurrent polls
  const isPollingRef = useRef(false)
  const isPollingMCTokensRef = useRef(false)
  const isPollingBonkFunRef = useRef(false)
  const isPollingMoonItRef = useRef(false)
  const isPollingGraduatedRef = useRef(false)
  // Track recently seen tokens to prevent disappearing (simple Map for speed)
  const recentTokensRef = useRef<Map<string, { token: TrenchesToken, lastSeen: number }>>(new Map())
  // Track recently seen MC tokens to prevent disappearing
  const recentMCTokensRef = useRef<Map<string, { token: TrenchesToken, lastSeen: number }>>(new Map())
  // Track recently seen Graduated tokens to prevent disappearing
  const recentGraduatedTokensRef = useRef<Map<string, { token: TrenchesToken, lastSeen: number }>>(new Map())
  const [error, setError] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState<number>(Date.now())
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(Date.now())
  
  // Live timer to update token ages in real-time - ULTRA-FAST for live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now())
    }, 100) // Update every 100ms for live, non-stop updates
    
    // Also update immediately to ensure instant display
    setCurrentTime(Date.now())
    
    return () => clearInterval(interval)
  }, [])

  // Fetch pump.fun tokens directly from their API via Next.js API route (to avoid CORS)
  // ULTRA-OPTIMIZED: Parallel requests, minimal timeouts, cached SOL price
  const fetchPumpFunTokensDirect = useCallback(async () => {
    try {
      // Get SOL price from cache first (updated by background fetcher every 10ms)
      let solPrice = 150 // Default fallback
      if (typeof window !== 'undefined' && (window as any).solPriceCache) {
        const cache = (window as any).solPriceCache
        solPrice = cache.price || 150
      }
      
      // Fetch tokens with optimized timeout - fast but reliable
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 2000) // 2 second timeout - faster initial load
      
      try {
        // Fetch tokens with minimal timeout
        const response = await fetch('/api/pump-fun/coins?sortBy=creationTime&limit=30&_=' + Date.now(), {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache',
          },
          cache: 'no-store',
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        if (!response.ok) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('⚠️ Pump.fun API returned error:', response.status, response.statusText)
          }
          return []
        }
        
        const data = await response.json()
        
        // Enhanced logging to debug why tokens aren't displaying
        if (process.env.NODE_ENV === 'development') {
          if (!data.success) {
            console.warn('⚠️ Pump.fun API returned success: false', data)
          }
          if (!data.coins || !Array.isArray(data.coins)) {
            console.warn('⚠️ Pump.fun API response missing coins array', data)
          } else {
            console.log('✅ Pump.fun API returned', data.coins.length, 'coins')
          }
        }
        
        const coins = data.success ? (data.coins || []) : []
        
        if (coins.length === 0) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('⚠️ No coins returned from pump.fun API - response:', data)
          }
          return []
        }
        
        // Filter out invalid tokens before conversion
        const validCoins = coins.filter((coin: any) => {
          // Exclude tokens with missing required fields
          if (!coin.coinMint || !coin.name || !coin.ticker) {
            return false
          }
          // Exclude tokens with empty/invalid data
          if (coin.name === '' || coin.ticker === '' || coin.coinMint === '') {
            return false
          }
          return true
        })
        
        // ULTRA-FAST conversion: Pre-allocate array, minimal processing
        const convertedTokens: TrenchesToken[] = new Array(Math.min(validCoins.length, 30))
        const now = Date.now()
        
        for (let i = 0; i < convertedTokens.length; i++) {
          const coin = validCoins[i]
          const creationTime = coin.creationTime || now
          const ageDiff = now - creationTime
          const initialAge = ageDiff < 1000 ? '0s' : formatTimeAgo(creationTime)
          
          // Convert volume from SOL to USD (pump.fun API returns volume in SOL)
          const volumeInSol = typeof coin.volume === 'number' ? coin.volume : parseFloat(coin.volume || '0') || 0
          const volumeInUsd = volumeInSol * solPrice
          
          convertedTokens[i] = {
            id: coin.coinMint || (i + 1).toString(),
            name: coin.name || '',
            symbol: coin.ticker || '',
            image: coin.imageUrl || `https://ui-avatars.com/api/?name=${coin.ticker || 'TOKEN'}&background=6366f1&color=fff&size=48`,
            mc: formatMarketCap(coin.marketCap || 0),
            volume: formatVolume(volumeInUsd),
            fee: '0', // Pump.fun API doesn't provide fee data
            age: initialAge,
            holders: coin.numHolders || 0,
            buys: coin.buyTransactions || 0,
            sells: coin.sellTransactions || 0,
            status: 'new' as const,
            tag: coin.name || '',
            contractAddress: coin.coinMint || '',
            migratedTokens: 0,
            devSold: (coin.devHoldingsPercentage || 0) === 0,
            top10Holders: Math.round(coin.topHoldersPercentage || 0),
            snipers: Math.round((coin.sniperOwnedPercentage || 0) * 100) / 100,
            insiders: 0,
            platform: 'pump.fun' as const,
            platformLogo: '/icons/platforms/pump.fun-logo.svg',
            buyAmount: "5.00",
            totalFees: 0,
            tradingFees: 0,
            tipsFees: 0,
            coinMint: coin.coinMint || '',
            dev: coin.dev || '',
            bondingCurveProgress: coin.bondingCurveProgress || 0,
            sniperCount: coin.sniperCount || 0,
            graduationDate: coin.graduationDate || null,
            devHoldingsPercentage: coin.devHoldingsPercentage || 0,
            sniperOwnedPercentage: coin.sniperOwnedPercentage || 0,
            topHoldersPercentage: coin.topHoldersPercentage || 0,
            hasTwitter: coin.hasTwitter || false,
            hasTelegram: coin.hasTelegram || false,
            hasWebsite: coin.hasWebsite || false,
            twitter: coin.twitter || null,
            telegram: coin.telegram || null,
            website: coin.website || null,
            priceChange24h: coin.priceChange24h || coin.priceChange || 0, // Live price change
            creationTime: creationTime > now ? now : creationTime // Ensure creationTime is not in the future
          } as any
        }
        
        return convertedTokens
      } catch (fetchError: any) {
        clearTimeout(timeoutId)
        if (fetchError.name === 'AbortError') {
          if (process.env.NODE_ENV === 'development') {
            console.warn('⏱️ Pump.fun API request timed out')
          }
          return []
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.error('❌ Pump.fun API fetch error:', fetchError)
          }
          throw fetchError // Re-throw other errors
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Error fetching pump.fun tokens directly:', error)
      }
      return []
    }
  }, [formatMarketCap, formatVolume]) // formatTimeAgo is imported, not a local function

  // Fetch pump.fun MC tokens (about to graduate) directly from their API via Next.js API route
  // ULTRA-OPTIMIZED: Parallel requests, minimal timeouts, cached SOL price
  const fetchPumpFunMCTokensDirect = useCallback(async () => {
    try {
      // Get SOL price from cache first (updated by background fetcher every 10ms)
      let solPrice = 150 // Default fallback
      if (typeof window !== 'undefined' && (window as any).solPriceCache) {
        const cache = (window as any).solPriceCache
        solPrice = cache.price || 150
      }
      
      // Fetch tokens with optimized timeout - fast but reliable
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 2000) // 2 second timeout - faster initial load
      
      try {
        // Fetch MC tokens (sorted by marketCap) with minimal timeout
        // Request more tokens to increase chances of finding tokens in 70-99% range
        const response = await fetch('/api/pump-fun/coins-mc?limit=100&_=' + Date.now(), {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache',
          },
          cache: 'no-store',
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        if (!response.ok) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('⚠️ Pump.fun MC API returned error:', response.status, response.statusText)
          }
          return []
        }
        
        const data = await response.json()
        
        // Enhanced logging to debug why tokens aren't displaying
        if (process.env.NODE_ENV === 'development') {
          if (!data.success) {
            console.warn('⚠️ Pump.fun MC API returned success: false', data)
          }
          if (!data.coins || !Array.isArray(data.coins)) {
            console.warn('⚠️ Pump.fun MC API response missing coins array', data)
          } else {
            console.log('✅ Pump.fun MC API returned', data.coins.length, 'coins')
          }
        }
        
        const coins = data.success ? (data.coins || []) : []
        
        if (coins.length === 0) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('⚠️ No coins returned from pump.fun MC API - response:', data)
          }
          return []
        }
        
        // Convert all coins from API response - no filtering, no sorting, display exactly as returned
        const now = Date.now()
        const convertedTokens: TrenchesToken[] = new Array(Math.min(coins.length, 30))
        
        for (let i = 0; i < convertedTokens.length; i++) {
          const coin = coins[i]
          const creationTime = coin.creationTime || now
          const ageDiff = now - creationTime
          const initialAge = ageDiff < 1000 ? '0s' : formatTimeAgo(creationTime)
          
          // Convert volume from SOL to USD (pump.fun API returns volume in SOL)
          const volumeInSol = typeof coin.volume === 'number' ? coin.volume : parseFloat(coin.volume || '0') || 0
          const volumeInUsd = volumeInSol * solPrice
          
          convertedTokens[i] = {
            id: coin.coinMint || (i + 1).toString(),
            name: coin.name || '',
            symbol: coin.ticker || '',
            image: coin.imageUrl || `https://ui-avatars.com/api/?name=${coin.ticker || 'TOKEN'}&background=6366f1&color=fff&size=48`,
            mc: formatMarketCap(coin.marketCap || 0),
            volume: formatVolume(volumeInUsd),
            fee: '0', // Pump.fun API doesn't provide fee data
            age: initialAge,
            holders: coin.numHolders || 0,
            buys: coin.buyTransactions || 0,
            sells: coin.sellTransactions || 0,
            status: 'about-to-graduate' as const,
            tag: coin.name || '',
            contractAddress: coin.coinMint || '',
            migratedTokens: 0,
            devSold: (coin.devHoldingsPercentage || 0) === 0,
            top10Holders: Math.round(coin.topHoldersPercentage || 0),
            snipers: Math.round((coin.sniperOwnedPercentage || 0) * 100) / 100,
            insiders: 0,
            platform: 'pump.fun' as const,
            platformLogo: '/icons/platforms/pump.fun-logo.svg',
            buyAmount: "5.00",
            totalFees: 0,
            tradingFees: 0,
            tipsFees: 0,
            coinMint: coin.coinMint || '',
            dev: coin.dev || '',
            bondingCurveProgress: coin.bondingCurveProgress || 0,
            sniperCount: coin.sniperCount || 0,
            graduationDate: coin.graduationDate || null,
            devHoldingsPercentage: coin.devHoldingsPercentage || 0,
            sniperOwnedPercentage: coin.sniperOwnedPercentage || 0,
            topHoldersPercentage: coin.topHoldersPercentage || 0,
            hasTwitter: coin.hasTwitter || false,
            hasTelegram: coin.hasTelegram || false,
            hasWebsite: coin.hasWebsite || false,
            twitter: coin.twitter || null,
            telegram: coin.telegram || null,
            website: coin.website || null,
            priceChange24h: coin.priceChange24h || coin.priceChange || 0, // Live price change
            creationTime: creationTime > now ? now : creationTime // Ensure creationTime is not in the future
          } as any
        }
        
        return convertedTokens
      } catch (fetchError: any) {
        clearTimeout(timeoutId)
        if (fetchError.name === 'AbortError') {
          if (process.env.NODE_ENV === 'development') {
            console.warn('⏱️ Pump.fun MC API request timed out')
          }
          return []
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.error('❌ Pump.fun MC API fetch error:', fetchError)
          }
          throw fetchError // Re-throw other errors
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Error fetching pump.fun MC tokens directly:', error)
      }
      return []
    }
  }, [formatMarketCap, formatVolume]) // formatTimeAgo is imported, not a local function

  // Fetch pump.fun Graduated tokens directly from their API via Next.js API route
  // ULTRA-OPTIMIZED: Parallel requests, minimal timeouts, cached SOL price
  const fetchPumpFunGraduatedTokensDirect = useCallback(async () => {
    try {
      // Get SOL price from cache first (updated by background fetcher every 10ms)
      let solPrice = 150 // Default fallback
      if (typeof window !== 'undefined' && (window as any).solPriceCache) {
        const cache = (window as any).solPriceCache
        solPrice = cache.price || 150
      }
      
      // Fetch tokens with optimized timeout - faster for initial load
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 2000) // 2 second timeout - faster initial load
      
      try {
        // Fetch Graduated tokens (sorted by creationTime) with minimal timeout
        const response = await fetch('/api/pump-fun/coins-graduated?limit=30&_=' + Date.now(), {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache',
          },
          cache: 'no-store',
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        if (!response.ok) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('⚠️ Pump.fun Graduated API returned error:', response.status, response.statusText)
          }
          return []
        }
        
        const data = await response.json()
        
        // Enhanced logging to debug why tokens aren't displaying
        if (process.env.NODE_ENV === 'development') {
          if (!data.success) {
            console.warn('⚠️ Pump.fun Graduated API returned success: false', data)
          }
          if (!data.coins || !Array.isArray(data.coins)) {
            console.warn('⚠️ Pump.fun Graduated API response missing coins array', data)
          } else {
            console.log('✅ Pump.fun Graduated API returned', data.coins.length, 'coins')
          }
        }
        
        const coins = data.success ? (data.coins || []) : []
        
        if (coins.length === 0) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('⚠️ No coins returned from pump.fun Graduated API - response:', data)
          }
          return []
        }
        
        // Filter out invalid/error tokens before conversion
        const validCoins = coins.filter((coin: any) => {
          // Exclude tokens with missing required fields
          if (!coin.coinMint || !coin.name || !coin.ticker) {
            return false
          }
          // Exclude specific error token
          if (coin.coinMint === 'HrPDWdTBieYzze6vuAwZMPBBvoKKEPpMmkABUbmpump') {
            return false
          }
          // Exclude tokens with empty/invalid data
          if (coin.name === '' || coin.ticker === '' || coin.coinMint === '') {
            return false
          }
          return true
        })
        
        // ULTRA-FAST conversion: Pre-allocate array, minimal processing
        const convertedTokens: TrenchesToken[] = new Array(Math.min(validCoins.length, 30))
        const now = Date.now()
        
        for (let i = 0; i < convertedTokens.length; i++) {
          const coin = validCoins[i]
          const creationTime = coin.creationTime || now
          const ageDiff = now - creationTime
          const initialAge = ageDiff < 1000 ? '0s' : formatTimeAgo(creationTime)
          
          // Convert volume from SOL to USD (pump.fun API returns volume in SOL)
          const volumeInSol = typeof coin.volume === 'number' ? coin.volume : parseFloat(coin.volume || '0') || 0
          const volumeInUsd = volumeInSol * solPrice
          
          convertedTokens[i] = {
            id: coin.coinMint || (i + 1).toString(),
            name: coin.name || '',
            symbol: coin.ticker || '',
            image: coin.imageUrl || `https://ui-avatars.com/api/?name=${coin.ticker || 'TOKEN'}&background=6366f1&color=fff&size=48`,
            mc: formatMarketCap(coin.marketCap || 0),
            volume: formatVolume(volumeInUsd),
            fee: '0', // Pump.fun API doesn't provide fee data
            age: initialAge,
            holders: coin.numHolders || 0,
            buys: coin.buyTransactions || 0,
            sells: coin.sellTransactions || 0,
            status: 'migrated' as const,
            tag: coin.name || '',
            contractAddress: coin.coinMint || '',
            migratedTokens: 1, // Graduated tokens have migrated
            devSold: (coin.devHoldingsPercentage || 0) === 0,
            top10Holders: Math.round(coin.topHoldersPercentage || 0),
            snipers: Math.round((coin.sniperOwnedPercentage || 0) * 100) / 100,
            insiders: 0,
            platform: 'pump.fun' as const,
            platformLogo: '/icons/platforms/pump.fun-logo.svg',
            buyAmount: "5.00",
            totalFees: 0,
            tradingFees: 0,
            tipsFees: 0,
            coinMint: coin.coinMint || '',
            dev: coin.dev || '',
            bondingCurveProgress: coin.bondingCurveProgress || 100, // Graduated tokens are at 100%
            sniperCount: coin.sniperCount || 0,
            graduationDate: coin.graduationDate || null,
            devHoldingsPercentage: coin.devHoldingsPercentage || 0,
            sniperOwnedPercentage: coin.sniperOwnedPercentage || 0,
            topHoldersPercentage: coin.topHoldersPercentage || 0,
            hasTwitter: coin.hasTwitter || false,
            hasTelegram: coin.hasTelegram || false,
            hasWebsite: coin.hasWebsite || false,
            twitter: coin.twitter || null,
            telegram: coin.telegram || null,
            website: coin.website || null,
            priceChange24h: coin.priceChange24h || coin.priceChange || 0, // Live price change
            creationTime: creationTime > now ? now : creationTime // Ensure creationTime is not in the future
          } as any
        }
        
        return convertedTokens
      } catch (fetchError: any) {
        clearTimeout(timeoutId)
        if (fetchError.name === 'AbortError') {
          if (process.env.NODE_ENV === 'development') {
            console.warn('⏱️ Pump.fun Graduated API request timed out')
          }
          return []
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.error('❌ Pump.fun Graduated API fetch error:', fetchError)
          }
          throw fetchError // Re-throw other errors
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Error fetching pump.fun Graduated tokens directly:', error)
      }
      return []
    }
  }, [formatMarketCap, formatVolume]) // formatTimeAgo is imported, not a local function

  // Live streaming for pump.fun tokens - ULTRA-FAST for live, non-stop updates
  useEffect(() => {
    const pollPumpFunTokens = async () => {
      // Allow concurrent requests for live updates - don't block
      isPollingRef.current = true
      
      try {
        const tokens = await fetchPumpFunTokensDirect()
        
        if (process.env.NODE_ENV === 'development') {
          if (tokens.length === 0) {
            console.warn('⚠️ fetchPumpFunTokensDirect returned 0 tokens')
          } else {
            console.log('✅ fetchPumpFunTokensDirect returned', tokens.length, 'tokens')
          }
        }
        
        const now = Date.now()
        
        if (tokens.length > 0) {
          // Filter and sort tokens directly - minimal processing
          const filteredTokens = tokens.filter((token: TrenchesToken) => {
            const tokenId = token.coinMint || token.id
            return !!tokenId
          })
          
          // Sort by creation time (newest first), limit to 30
          const result = filteredTokens
            .map(token => ({ 
              ...token,
              _updateTimestamp: now
            }))
            .sort((a, b) => (b.creationTime || 0) - (a.creationTime || 0))
            .slice(0, 30)
          
          // DIRECT UPDATE: Always replace array - forces React to re-render with fresh data
          setPumpFunTokens(result)
          
          // Update tracking map for stability (non-blocking)
          for (let i = 0; i < result.length; i++) {
            const token = result[i]
            const tokenId = token.coinMint || token.id
            if (tokenId) {
              recentTokensRef.current.set(tokenId, { token, lastSeen: now })
            }
          }
        } else {
          // If no tokens returned, only clear state if we have no existing tokens
          setPumpFunTokens(prev => {
            return prev.length > 0 ? prev : []
          })
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ Error polling pump.fun tokens:', error)
        }
      } finally {
        isPollingRef.current = false
      }
    }
    
    // Initial fetch - IMMEDIATE for fast first load
    pollPumpFunTokens()
    
    // Poll every 1 second for live, non-stop updates
    const interval = setInterval(() => {
      pollPumpFunTokens()
    }, 1000)
    
    return () => {
      clearInterval(interval)
      isPollingRef.current = false
    }
  }, [fetchPumpFunTokensDirect])

  // Live streaming for bonk.fun tokens - ULTRA-FAST for live, non-stop updates
  useEffect(() => {
    const pollBonkFunTokens = async () => {
      // Allow concurrent requests for live updates - don't block
      isPollingBonkFunRef.current = true
      
      try {
        const tokens = await fetchBonkFunTokens()
        if (tokens && tokens.length > 0) {
          const now = Date.now()
          // Increased from 4 minutes to 1 hour to show more tokens and reduce filtering overhead
          const oneHourAgo = now - (60 * 60 * 1000)
          
          // Convert and filter tokens - show tokens created within last hour
          const convertedTokens = tokens
            .slice(0, 30)
            .map((token: any, index: number) => convertBonkFunToToken(token, index))
            .filter((token: TrenchesToken) => {
              // Filter out invalid tokens
              if (!token.coinMint || !token.name || !token.symbol) {
                return false
              }
              // Filter by creation time
              return token.creationTime && token.creationTime > oneHourAgo
            })
            .sort((a, b) => (b.creationTime || 0) - (a.creationTime || 0))
          
          // Update with fresh data
          if (convertedTokens.length > 0) {
            setBonkFunTokens(convertedTokens)
          } else {
            // Keep existing tokens if no new ones found
            setBonkFunTokens(prev => prev.length > 0 ? prev : [])
          }
        } else {
          // Keep existing tokens if API returns empty
          setBonkFunTokens(prev => prev.length > 0 ? prev : [])
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ Error polling bonk.fun tokens:', error)
        }
        // Keep existing tokens on error
        setBonkFunTokens(prev => prev.length > 0 ? prev : [])
      } finally {
        isPollingBonkFunRef.current = false
      }
    }
    
    // Initial fetch - IMMEDIATE for fast first load
    pollBonkFunTokens()
    
    // Poll every 1 second for live, non-stop updates
    const interval = setInterval(() => {
      pollBonkFunTokens()
    }, 1000)
    
    return () => {
      clearInterval(interval)
      isPollingBonkFunRef.current = false
    }
  }, [])

  // Live streaming for moon.it tokens - CONTINUOUS updates
  useEffect(() => {
    const pollMoonItTokens = async () => {
      // REMOVED: Polling guard - allow continuous updates for live trading
      isPollingMoonItRef.current = true
      
      try {
        const tokens = await fetchMoonItTokens()
        if (tokens && tokens.length > 0) {
          const now = Date.now()
          const fourMinutesAgo = now - (4 * 60 * 1000) // 4 minutes for "New" section only
          
          // Convert and filter tokens - only show tokens created within last 4 minutes
          // ALWAYS create new objects to force React updates
          const convertedTokens = tokens
            .slice(0, 30)
            .map((token: any, index: number) => ({ ...convertMoonItToToken(token, index) })) // Create new objects
            .filter((token: TrenchesToken) => token.creationTime && token.creationTime > fourMinutesAgo)
            .sort((a, b) => (b.creationTime || 0) - (a.creationTime || 0))
          
          // ALWAYS update with fresh data - direct replacement for live trading
          // New array forces React to detect changes and re-render
          // Add update timestamp to force React to detect changes even if values are the same
          const updateTimestamp = Date.now()
          setMoonItTokens(convertedTokens.length > 0 ? convertedTokens.map(t => ({ ...t, _updateTimestamp: updateTimestamp })) : [])
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ Error polling moon.it tokens:', error)
        }
      } finally {
        isPollingMoonItRef.current = false
      }
    }
    
    pollMoonItTokens()
    // Poll every 1 second for live, non-stop updates
    const interval = setInterval(() => {
      pollMoonItTokens()
    }, 1000)
    
    return () => {
      clearInterval(interval)
      isPollingMoonItRef.current = false
    }
  }, [])

  // Live streaming for pump.fun MC tokens (about to graduate) - CONTINUOUS updates
  useEffect(() => {
    const pollPumpFunMCTokens = async () => {
      // REMOVED: Polling guard - allow continuous updates even if previous request is pending
      // Trading platform needs maximum update frequency - let requests overlap if needed
      isPollingMCTokensRef.current = true
      
      try {
        const tokens = await fetchPumpFunMCTokensDirect()
        
        // Always log to debug why tokens aren't displaying
        if (process.env.NODE_ENV === 'development') {
          if (tokens.length === 0) {
            console.warn('⚠️ fetchPumpFunMCTokensDirect returned 0 tokens')
          } else {
            console.log('✅ fetchPumpFunMCTokensDirect returned', tokens.length, 'tokens')
          }
        }
        
        // Display exactly what API returns - no filtering, no sorting, no merging
        // Just update with fresh tokens from API
        if (tokens.length > 0) {
          setMcTokens(tokens)
        } else {
          // Keep existing tokens if API returns empty
          setMcTokens(prev => prev.length > 0 ? prev : [])
        }
      } catch (error) {
        // NEVER clear tokens on error - preserve existing tokens
        // Update timestamps to keep tokens visible
        const now = Date.now()
        setMcTokens(prev => {
          if (prev.length > 0) {
            // Update timestamps to force React updates, keep tokens visible
            return prev.map(t => ({ ...t, _updateTimestamp: now }))
          }
          return prev
        })
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ Error polling pump.fun MC tokens:', error)
        }
      } finally {
        // Don't reset isPollingMCTokensRef - allow concurrent requests
      }
    }
    
    // Initial fetch - IMMEDIATE for fast first load
    pollPumpFunMCTokens()
    
    // Poll every 1 second for live, non-stop updates
    const interval = setInterval(() => {
      pollPumpFunMCTokens()
    }, 1000)
    
    return () => {
      clearInterval(interval)
      isPollingMCTokensRef.current = false
    }
  }, [fetchPumpFunMCTokensDirect])

  // Live streaming for pump.fun Graduated tokens - OPTIMIZED for faster initial load
  useEffect(() => {
    const pollPumpFunGraduatedTokens = async () => {
      // Allow concurrent requests for live updates - don't block
      isPollingGraduatedRef.current = true
      
      try {
        const tokens = await fetchPumpFunGraduatedTokensDirect()
        
        // Always log to debug why tokens aren't displaying
        if (process.env.NODE_ENV === 'development') {
          if (tokens.length === 0) {
            console.warn('⚠️ fetchPumpFunGraduatedTokensDirect returned 0 tokens')
          } else {
            console.log('✅ fetchPumpFunGraduatedTokensDirect returned', tokens.length, 'tokens')
          }
        }
        
        // ALWAYS merge with existing tokens - never replace completely
        // Trading platform needs continuous updates - React will handle efficient rendering
        const now = Date.now()
        
        // Update tracking map with new tokens (exclude error token)
        if (tokens.length > 0) {
          for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i]
            const tokenId = token.coinMint || token.id
            // Skip error token and invalid tokens
            if (tokenId && tokenId !== 'HrPDWdTBieYzze6vuAwZMPBBvoKKEPpMmkABUbmpump' && token.name && token.symbol) {
              recentGraduatedTokensRef.current.set(tokenId, { token, lastSeen: now })
            }
          }
        }
        
        // Clean up old entries (older than 5 minutes) - keep recent tokens visible
        const fiveMinutesAgo = now - (5 * 60 * 1000)
        for (const [key, value] of recentGraduatedTokensRef.current.entries()) {
          if (value.lastSeen < fiveMinutesAgo) {
            recentGraduatedTokensRef.current.delete(key)
          }
        }
        
        // Merge: Combine new tokens with recently seen tokens
        // This ensures tokens don't disappear even if API temporarily doesn't return them
        const tokenMap = new Map<string, TrenchesToken>()
        
        // First, add all recently seen tokens (preserves tokens that might not be in current API response)
        // Filter out error token from recent tokens
        for (const [tokenId, { token }] of recentGraduatedTokensRef.current.entries()) {
          // Skip error token
          if (tokenId === 'HrPDWdTBieYzze6vuAwZMPBBvoKKEPpMmkABUbmpump') {
            continue
          }
          // Skip invalid tokens
          if (!token.name || !token.symbol) {
            continue
          }
          const uniqueKey = `${token.platform}-${tokenId}`
          tokenMap.set(uniqueKey, token)
        }
        
        // Then, add/update with new tokens from API (overwrites with latest data)
        if (tokens.length > 0) {
          const filteredTokens = tokens.filter((token: TrenchesToken) => {
            const tokenId = token.coinMint || token.id
            // Exclude invalid tokens
            if (!tokenId || !token.name || !token.symbol) {
              return false
            }
            // Exclude specific error token
            if (tokenId === 'HrPDWdTBieYzze6vuAwZMPBBvoKKEPpMmkABUbmpump') {
              return false
            }
            return true
          })
          
          for (let i = 0; i < filteredTokens.length; i++) {
            const token = filteredTokens[i]
            const tokenId = token.coinMint || token.id
            const uniqueKey = `pump.fun-${tokenId}`
            tokenMap.set(uniqueKey, token) // Overwrite with latest data
          }
        }
        
        // Convert to array and sort
        const mergedTokens = Array.from(tokenMap.values())
          .map(token => ({ 
            ...token,
            _updateTimestamp: now // Force React to detect changes for live updates
          }))
          .sort((a, b) => {
            // Sort by creation time (newest first) for graduated tokens
            return (b.creationTime || 0) - (a.creationTime || 0)
          })
          .slice(0, 30)
        
        // ALWAYS update - even if empty, merge ensures we keep existing tokens
        setGraduatedTokens(mergedTokens)
      } catch (error) {
        // NEVER clear tokens on error - preserve existing tokens
        // Update timestamps to keep tokens visible
        const now = Date.now()
        setGraduatedTokens(prev => {
          if (prev.length > 0) {
            // Update timestamps to force React updates, keep tokens visible
            return prev.map(t => ({ ...t, _updateTimestamp: now }))
          }
          return prev
        })
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ Error polling pump.fun Graduated tokens:', error)
        }
      } finally {
        isPollingGraduatedRef.current = false
      }
    }
    
    // Initial fetch - IMMEDIATE for fast first load
    pollPumpFunGraduatedTokens()
    
    // Poll every 1 second for live, non-stop updates
    const interval = setInterval(() => {
      pollPumpFunGraduatedTokens()
    }, 1000)
    
    return () => {
      clearInterval(interval)
      isPollingGraduatedRef.current = false
    }
  }, [fetchPumpFunGraduatedTokensDirect])

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

  // REMOVED: requestAnimationFrame loop - already have setInterval timer above that updates every second
  // This was causing infinite re-renders

  // Background SOL price fetcher to keep cache updated - using pump.fun API
  useEffect(() => {
    let isUpdating = false
    
    const updateSolPrice = async () => {
      if (isUpdating) return // Prevent concurrent updates
      isUpdating = true
      
      try {
        const response = await fetch('/api/pump-fun/sol-price?_=' + Date.now(), {
          cache: 'no-store',
          signal: AbortSignal.timeout(2000) // 2 second timeout for faster updates
        })
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.solPrice) {
            // Update the global cache
            if (typeof window !== 'undefined') {
              (window as any).solPriceCache = { 
                price: data.solPrice, 
                timestamp: Date.now() 
              }
            }
          }
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
        console.warn('Background SOL price update failed:', error)
        }
      } finally {
        isUpdating = false
      }
    }

    // Update SOL price every 10ms to match token polling frequency for live updates
    const solPriceInterval = setInterval(updateSolPrice, 10)
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
            signal: AbortSignal.timeout(2000)
          })
          
          if (!response.ok) return []
          const data = await response.json()
          return Array.isArray(data.coins) ? data.coins.slice(0, 30) : []
        } catch (error) {
          console.warn('Error fetching migrated tokens:', error)
          return []
        }
      }

      
      // Execute all API calls in parallel for maximum speed
      const [
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
        // REMOVED: fetchPumpFunTokensDirect() - now handled by live polling useEffect
      ])

      // Process results immediately as they come in

      // REMOVED: pumpFunResult fallback for NEW column - we now use direct pump.fun API (pumpFunDirectResult)
      // pumpFunResult is no longer used for NEW column

      // REMOVED: Old MC tokens fetch - now handled by live polling useEffect
      // MC tokens are now streamed live every 50ms via separate useEffect

      // REMOVED: Old graduated tokens fetch - now handled by live polling useEffect
      // Graduated tokens are now streamed live every 50ms via separate useEffect
      // This prevents overwriting live polling updates

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

      // REMOVED: pump.fun direct API fetch from parallel fetch - now handled by live polling useEffect
      // pump.fun tokens are now streamed live every 2 seconds via separate useEffect

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

    // REMOVED: fetchMCData - now handled by live polling useEffect
    // MC tokens are now streamed live every 50ms via separate useEffect
    // No fallback needed - live polling handles all updates

    // REMOVED: fetchGraduatedData - now handled by live polling useEffect
    // Graduated tokens are now streamed live every 50ms via separate useEffect
    // No fallback needed - live polling handles all updates and preserves tokens

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

    // Set up optimized auto-refresh - WebSocket handles NEW tokens in real-time
    // Only refresh REST API data periodically (other columns and fallback)
    const interval = setInterval(() => {
      // Auto-refresh token data
      console.log('Auto-refreshing token data...')
        fetchAllDataInParallel()
    }, 5000) // 5 seconds for REST API fallback only (WebSocket is instant)

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

  // Removed debug logging for performance

  // Live-updated tokens with real-time age calculation - OPTIMIZED for speed
  // DEDUPLICATE: Remove duplicate tokens but ALWAYS keep the most recent/updated version for live trading
  const tokensWithLiveAge = useMemo(() => {
    // Priority order: pumpFunTokens (most live) > bonkFunTokens > moonItTokens > realTokens
    // Process in reverse order so higher priority sources overwrite lower priority ones
    // OPTIMIZED: Direct array concatenation for speed - pumpFunTokens first for fastest display
    const allTokens = [...moonItTokens, ...bonkFunTokens, ...realTokens, ...pumpFunTokens]
    
    // FAST deduplication - use Map for O(1) lookups
    const tokenMap = new Map<string, TrenchesToken>()
    
    // Single pass deduplication - later tokens overwrite earlier ones
    for (let i = 0; i < allTokens.length; i++) {
      const token = allTokens[i]
      const tokenId = token.coinMint || token.id || token.contractAddress || ''
      const uniqueKey = `${token.platform}-${tokenId}`
      tokenMap.set(uniqueKey, token) // Always overwrite - latest data wins
    }
    
    // Convert Map to array - pre-allocate for speed
    const deduplicatedTokens = new Array(tokenMap.size)
    let idx = 0
    for (const token of tokenMap.values()) {
      deduplicatedTokens[idx++] = token
    }
    
    // ULTRA-FAST age calculation - inline, pre-allocated array
    const now = currentTime
    const updatedTokens = new Array(deduplicatedTokens.length)
    
    for (let i = 0; i < deduplicatedTokens.length; i++) {
      const token = deduplicatedTokens[i]
      // ALWAYS create new object to ensure React detects changes
      // Preserve _updateTimestamp to force React updates
      const updateTimestamp = (token as any)._updateTimestamp || now
      if (token.creationTime) {
        const diff = now - token.creationTime
        const seconds = Math.floor(diff / 1000)
        
        // Fast age formatting - minimal branching
        let age: string
        if (seconds < 0) age = '0s'
        else if (seconds < 60) age = `${seconds}s`
        else {
          const minutes = Math.floor(seconds / 60)
          if (minutes < 60) age = `${minutes}m`
          else {
            const hours = Math.floor(minutes / 60)
            age = hours < 24 ? `${hours}h` : `${Math.floor(hours / 24)}d`
          }
        }
        updatedTokens[i] = { ...token, age, _updateTimestamp: updateTimestamp }
      } else {
        updatedTokens[i] = { ...token, _updateTimestamp: updateTimestamp }
      }
    }
    
    return updatedTokens
  }, [realTokens, pumpFunTokens, bonkFunTokens, moonItTokens, currentTime])

  // OPTIMIZED: Memoized token processing for NEW column - only recalculate when data changes
  const newTokens = useMemo(() => {
    if (tokensWithLiveAge.length === 0) {
      return []
    }
    
    // FAST: Pre-allocate arrays, avoid multiple map operations
    const combinedTokens = new Array(tokensWithLiveAge.length)
    for (let i = 0; i < tokensWithLiveAge.length; i++) {
      combinedTokens[i] = tokensWithLiveAge[i]
    }
    
    // Apply filters - single pass
    const filteredTokens = applyFilters(combinedTokens)
    
    // FAST sort - in-place for speed, then slice
    filteredTokens.sort((a, b) => {
      return (b.creationTime || 0) - (a.creationTime || 0) // Descending (newest first)
    })
    
    // Return slice with new references - limit to 30 for performance
    const result = new Array(Math.min(30, filteredTokens.length))
    for (let i = 0; i < result.length; i++) {
      result[i] = { ...filteredTokens[i] }
    }
    return result
  }, [tokensWithLiveAge, applyFilters])

  // Live-updated graduating tokens with real-time age calculation
  // STABLE: Deduplicate and preserve tokens to prevent disappearing
  const graduatingTokensWithLiveAge = useMemo(() => {
    // Display ALL tokens from API - no filtering, no sorting, display exactly as returned
    // Priority: mcTokens (pump.fun - most live) > bonkFunMCTokens > moonItMCTokens
    // Process in reverse order so higher priority sources overwrite lower priority ones
    const allTokens = [...moonItMCTokens, ...bonkFunMCTokens, ...mcTokens]
    
    // FAST deduplication - use Map for O(1) lookups, preserve latest data
    const tokenMap = new Map<string, TrenchesToken>()
    
    // Single pass deduplication - later tokens (higher priority) overwrite earlier ones
    for (let i = 0; i < allTokens.length; i++) {
      const token = allTokens[i]
      const tokenId = token.coinMint || token.id || token.contractAddress || ''
      const uniqueKey = `${token.platform}-${tokenId}`
      tokenMap.set(uniqueKey, token) // Always overwrite - latest data wins
    }
    
    // Convert Map to array - pre-allocate for speed
    const deduplicatedTokens = new Array(tokenMap.size)
    let idx = 0
    for (const token of tokenMap.values()) {
      deduplicatedTokens[idx++] = token
    }
    
    // Update ages based on currentTime and creationTime
    // Preserve _updateTimestamp to force React updates
    const now = currentTime
    const updatedTokens = new Array(deduplicatedTokens.length)
    
    for (let i = 0; i < deduplicatedTokens.length; i++) {
      const token = deduplicatedTokens[i]
      const updateTimestamp = (token as any)._updateTimestamp || now
      
      if (token.creationTime) {
        const diff = currentTime - token.creationTime
        const seconds = Math.floor(diff / 1000)
        const minutes = Math.floor(seconds / 60)
        const hours = Math.floor(minutes / 60)
        const days = Math.floor(hours / 24)
        
        let age = ''
        if (days > 0) age = `${days}d`
        else if (hours > 0) age = `${hours}h`
        else if (minutes > 0) age = `${minutes}m`
        else age = `${seconds}s`
        
        updatedTokens[i] = { ...token, age, _updateTimestamp: updateTimestamp }
      } else {
        updatedTokens[i] = { ...token, _updateTimestamp: updateTimestamp }
      }
    }
    
    return updatedTokens
  }, [mcTokens, bonkFunMCTokens, moonItMCTokens, currentTime])

  const mcCategoryTokens = useMemo(() => {
    // STABLE: Focus on graduating/migrating tokens with stable sorting
    if (graduatingTokensWithLiveAge.length === 0) {
      return []
    }
    
    // Apply filters - single pass
    const filteredGraduatingTokens = applyFilters(graduatingTokensWithLiveAge)
    
    // STABLE sort: Sort by market cap (highest first) or bonding curve progress
    // This ensures tokens don't disappear when their age changes
    const sorted = filteredGraduatingTokens
      .map(token => ({ ...token })) // Create new objects to ensure React detects changes
      .sort((a, b) => {
        // Primary sort: Market cap (highest first) - most stable
        const aMc = parseFloat((a.mc || '0').replace(/[$,]/g, '')) || 0
        const bMc = parseFloat((b.mc || '0').replace(/[$,]/g, '')) || 0
        if (bMc !== aMc) return bMc - aMc
        
        // Secondary sort: Bonding curve progress (highest first)
        const aProgress = a.bondingCurveProgress || 0
        const bProgress = b.bondingCurveProgress || 0
        if (bProgress !== aProgress) return bProgress - aProgress
        
        // Tertiary sort: Creation time (newest first) for stability
        return (b.creationTime || 0) - (a.creationTime || 0)
      })
      .slice(0, 30)
    
    // Always create new array with update timestamps to force React updates
    const now = Date.now()
    return sorted.map(token => ({ 
      ...token, 
      _updateTimestamp: (token as any)._updateTimestamp || now 
    }))
  }, [graduatingTokensWithLiveAge, applyFilters])

  // Live-updated graduated tokens with real-time age calculation
  // STABLE: Deduplicate and preserve tokens to prevent disappearing
  const graduatedTokensWithLiveAge = useMemo(() => {
    // Include graduatedTokens (pump.fun graduated tokens) for "graduated" section
    // Priority: graduatedTokens (pump.fun - most live) > others
    // Process in reverse order so higher priority sources overwrite lower priority ones
    const allTokens = [...moonItGraduatedTokens, ...bonkFunGraduatedTokens, ...migratedTokens, ...graduatedTokens]
    
    // FAST deduplication - use Map for O(1) lookups, preserve latest data
    const tokenMap = new Map<string, TrenchesToken>()
    
    // Single pass deduplication - later tokens (higher priority) overwrite earlier ones
    for (let i = 0; i < allTokens.length; i++) {
      const token = allTokens[i]
      const tokenId = token.coinMint || token.id || token.contractAddress || ''
      const uniqueKey = `${token.platform}-${tokenId}`
      tokenMap.set(uniqueKey, token) // Always overwrite - latest data wins
    }
    
    // Convert Map to array - pre-allocate for speed
    const deduplicatedTokens = new Array(tokenMap.size)
    let idx = 0
    for (const token of tokenMap.values()) {
      deduplicatedTokens[idx++] = token
    }
    
    // Update ages based on currentTime and creationTime
    // Preserve _updateTimestamp to force React updates
    const now = currentTime
    const updatedTokens = new Array(deduplicatedTokens.length)
    
    for (let i = 0; i < deduplicatedTokens.length; i++) {
      const token = deduplicatedTokens[i]
      const updateTimestamp = (token as any)._updateTimestamp || now
      
      if (token.creationTime) {
        const diff = currentTime - token.creationTime
        const seconds = Math.floor(diff / 1000)
        const minutes = Math.floor(seconds / 60)
        const hours = Math.floor(minutes / 60)
        const days = Math.floor(hours / 24)
        
        let age = ''
        if (days > 0) age = `${days}d`
        else if (hours > 0) age = `${hours}h`
        else if (minutes > 0) age = `${minutes}m`
        else age = `${seconds}s`
        
        updatedTokens[i] = { ...token, age, _updateTimestamp: updateTimestamp }
      } else {
        updatedTokens[i] = { ...token, _updateTimestamp: updateTimestamp }
      }
    }
    
    return updatedTokens
  }, [graduatedTokens, migratedTokens, bonkFunGraduatedTokens, moonItGraduatedTokens, currentTime])

  const graduatedCategoryTokens = useMemo(() => {
    // STABLE: Focus on graduated/migrated tokens with stable sorting
    if (graduatedTokensWithLiveAge.length === 0) {
      return []
    }
    
    // Apply filters - single pass
    const filteredGraduatedTokens = applyFilters(graduatedTokensWithLiveAge)
    
    // STABLE sort: Sort by creation time (newest first) for graduated tokens
    // This ensures tokens don't disappear when their age changes
    const sorted = filteredGraduatedTokens
      .map(token => ({ ...token })) // Create new objects to ensure React detects changes
      .sort((a, b) => {
        // Primary sort: Creation time (newest first) - most stable
        return (b.creationTime || 0) - (a.creationTime || 0)
      })
      .slice(0, 30)
    
    // Always create new array with update timestamps to force React updates
    const now = Date.now()
    return sorted.map(token => ({ 
      ...token, 
      _updateTimestamp: (token as any)._updateTimestamp || now 
    }))
  }, [graduatedTokensWithLiveAge, applyFilters])

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
                title="Nearly there" 
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

