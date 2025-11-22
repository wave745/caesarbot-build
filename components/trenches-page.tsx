"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrenchesColumn } from "@/components/trenches-column"
import { TrendingFilterModal } from "@/components/trending-filter-modal"
import { EchoCustomizeModal, type EchoSettings } from "@/components/echo-customize-modal"
import { useSolanaTrackerWebSocket } from "@/lib/hooks/use-solanatracker-websocket"
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
    // Store creation time for live age updates and sorting
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
  const [solanaTrackerGraduatingTokens, setSolanaTrackerGraduatingTokens] = useState<TrenchesToken[]>([])
  const [solanaTrackerGraduatedTokens, setSolanaTrackerGraduatedTokens] = useState<TrenchesToken[]>([])
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
  // Track recently seen tokens to prevent disappearing (simple Map for speed)
  const recentTokensRef = useRef<Map<string, { token: TrenchesToken, lastSeen: number }>>(new Map())
  // Track recently seen MC tokens to prevent disappearing
  const recentMCTokensRef = useRef<Map<string, { token: TrenchesToken, lastSeen: number }>>(new Map())
  const [error, setError] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState<number>(Date.now())
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(Date.now())
  
  // Live timer to update token ages in real-time - ULTRA-FAST for trading platform
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now())
    }, 10) // Update every 10ms for ultra-fast live age updates (100 updates per second)
    
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
      const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 second timeout - fast response for live trading
      
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
        
        // ULTRA-FAST conversion: Pre-allocate array, minimal processing
        const convertedTokens: TrenchesToken[] = new Array(Math.min(coins.length, 30))
        const now = Date.now()
        
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
      const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 second timeout - fast response for live trading
      
      try {
        // Fetch MC tokens (sorted by marketCap) with minimal timeout
        const response = await fetch('/api/pump-fun/coins-mc?limit=30&_=' + Date.now(), {
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
        
        // ULTRA-FAST conversion: Pre-allocate array, minimal processing
        const convertedTokens: TrenchesToken[] = new Array(Math.min(coins.length, 30))
        const now = Date.now()
        
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

  // Live streaming for pump.fun tokens - STABLE updates with smart merging
  useEffect(() => {
    const pollPumpFunTokens = async () => {
      // REMOVED: Polling guard - allow continuous updates even if previous request is pending
      // Trading platform needs maximum update frequency - let requests overlap if needed
      // The API will handle concurrent requests, and we want fresh data every 25ms
      isPollingRef.current = true
      
      try {
        const tokens = await fetchPumpFunTokensDirect()
        
        // Always log to debug why tokens aren't displaying
        if (process.env.NODE_ENV === 'development') {
          if (tokens.length === 0) {
            console.warn('⚠️ fetchPumpFunTokensDirect returned 0 tokens')
          } else {
            console.log('✅ fetchPumpFunTokensDirect returned', tokens.length, 'tokens')
          }
        }
        
        // ALWAYS update state - even if empty, to ensure React knows about the fetch
        // Trading platform needs continuous updates - React will handle efficient rendering
        const now = Date.now()
        const threeDaysAgo = now - (3 * 24 * 60 * 60 * 1000)
        
        if (tokens.length > 0) {
          // Filter and sort tokens directly - minimal processing
          // Only require tokenId - don't filter by creationTime to ensure all tokens display
          const filteredTokens = tokens.filter((token: TrenchesToken) => {
            const tokenId = token.coinMint || token.id
            // Only require tokenId - include all tokens that have an identifier
            // Creation time filter removed to ensure tokens display even if timestamp is missing/invalid
            return !!tokenId
          })
          
          if (process.env.NODE_ENV === 'development') {
            if (filteredTokens.length === 0 && tokens.length > 0) {
              console.warn('⚠️ All tokens filtered out - tokens:', tokens.length, 'filtered:', filteredTokens.length)
            } else if (filteredTokens.length < tokens.length) {
              console.log(`ℹ️ Filtered ${tokens.length - filteredTokens.length} tokens (missing tokenId)`)
            }
          }
          
          // Sort by creation time (newest first), limit to 30
          // ALWAYS create new array to ensure React detects changes
          // Add update timestamp to force React to detect changes even if values are the same
          const result = filteredTokens
            .map(token => ({ 
              ...token,
              _updateTimestamp: now // Force React to detect changes for live updates
            })) // Create new objects to force React update
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
          // This prevents clearing tokens on temporary API failures
          setPumpFunTokens(prev => {
            // Keep existing tokens if we have them, otherwise clear
            return prev.length > 0 ? prev : []
          })
        }
      } catch (error) {
        // Silently handle errors - don't clear tokens on error
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ Error polling pump.fun tokens:', error)
        }
      } finally {
        // Don't reset isPollingRef - allow concurrent requests
      }
    }
    
    // Initial fetch - IMMEDIATE (don't wait for interval)
    // Use setTimeout(0) to ensure it runs after component mount
    const initialTimeout = setTimeout(() => {
      pollPumpFunTokens()
    }, 0)
    
    // Poll every 50ms for FAST live updates (20 updates per second) - trading platform needs real-time data
    // Balance between speed and API rate limits - pump.fun API can handle this frequency
    const interval = setInterval(() => {
      pollPumpFunTokens()
    }, 50)
    
    return () => {
      clearTimeout(initialTimeout)
      clearInterval(interval)
      isPollingRef.current = false
    }
  }, [fetchPumpFunTokensDirect])

  // Live streaming for bonk.fun tokens - CONTINUOUS updates
  useEffect(() => {
    const pollBonkFunTokens = async () => {
      // REMOVED: Polling guard - allow continuous updates for live trading
      isPollingBonkFunRef.current = true
      
      try {
        const tokens = await fetchBonkFunTokens()
        if (tokens && tokens.length > 0) {
          const now = Date.now()
          const fourMinutesAgo = now - (4 * 60 * 1000) // 4 minutes for "New" section only
          
          // Convert and filter tokens - only show tokens created within last 4 minutes
          // ALWAYS create new objects to force React updates
          const convertedTokens = tokens
            .slice(0, 30)
            .map((token: any, index: number) => ({ ...convertBonkFunToToken(token, index) })) // Create new objects
            .filter((token: TrenchesToken) => token.creationTime && token.creationTime > fourMinutesAgo)
            .sort((a, b) => (b.creationTime || 0) - (a.creationTime || 0))
          
          // ALWAYS update with fresh data - direct replacement for live trading
          // New array forces React to detect changes and re-render
          // Add update timestamp to force React to detect changes even if values are the same
          const updateTimestamp = Date.now()
          setBonkFunTokens(convertedTokens.length > 0 ? convertedTokens.map(t => ({ ...t, _updateTimestamp: updateTimestamp })) : [])
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ Error polling bonk.fun tokens:', error)
        }
      } finally {
        isPollingBonkFunRef.current = false
      }
    }
    
    pollBonkFunTokens()
    // Poll every 50ms for FAST live updates (20 updates per second) - balance speed and API reliability
    const interval = setInterval(() => {
      pollBonkFunTokens()
    }, 50)
    
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
    // Poll every 50ms for FAST live updates (20 updates per second) - balance speed and API reliability
    const interval = setInterval(() => {
      pollMoonItTokens()
    }, 50)
    
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
        
        // ALWAYS merge with existing tokens - never replace completely
        // Trading platform needs continuous updates - React will handle efficient rendering
        const now = Date.now()
        
        // Update tracking map with new tokens
        if (tokens.length > 0) {
          for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i]
            const tokenId = token.coinMint || token.id
            if (tokenId) {
              recentMCTokensRef.current.set(tokenId, { token, lastSeen: now })
            }
          }
        }
        
        // Clean up old entries (older than 5 minutes) - keep recent tokens visible
        const fiveMinutesAgo = now - (5 * 60 * 1000)
        for (const [key, value] of recentMCTokensRef.current.entries()) {
          if (value.lastSeen < fiveMinutesAgo) {
            recentMCTokensRef.current.delete(key)
          }
        }
        
        // Merge: Combine new tokens with recently seen tokens
        // This ensures tokens don't disappear even if API temporarily doesn't return them
        const tokenMap = new Map<string, TrenchesToken>()
        
        // First, add all recently seen tokens (preserves tokens that might not be in current API response)
        for (const [tokenId, { token }] of recentMCTokensRef.current.entries()) {
          const uniqueKey = `${token.platform}-${tokenId}`
          tokenMap.set(uniqueKey, token)
        }
        
        // Then, add/update with new tokens from API (overwrites with latest data)
        if (tokens.length > 0) {
          const filteredTokens = tokens.filter((token: TrenchesToken) => {
            const tokenId = token.coinMint || token.id
            return !!tokenId
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
              // Sort by market cap (highest first) or bonding curve progress
              const aMc = parseFloat((a.mc || '0').replace(/[$,]/g, '')) || 0
              const bMc = parseFloat((b.mc || '0').replace(/[$,]/g, '')) || 0
              if (bMc !== aMc) return bMc - aMc
              return (b.bondingCurveProgress || 0) - (a.bondingCurveProgress || 0)
            })
          .slice(0, 30)
        
        // ALWAYS update - even if empty, merge ensures we keep existing tokens
        setMcTokens(mergedTokens)
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
    
    // Initial fetch - IMMEDIATE (don't wait for interval)
    // Use setTimeout(0) to ensure it runs after component mount
    const initialTimeout = setTimeout(() => {
      pollPumpFunMCTokens()
    }, 0)
    
    // Poll every 50ms for FAST live updates (20 updates per second) - trading platform needs real-time data
    // Balance between speed and API rate limits - pump.fun API can handle this frequency
    const interval = setInterval(() => {
      pollPumpFunMCTokens()
    }, 50)
    
    return () => {
      clearTimeout(initialTimeout)
      clearInterval(interval)
      isPollingMCTokensRef.current = false
    }
  }, [fetchPumpFunMCTokensDirect])

  // Use WebSocket for SolanaTracker NEW tokens - always keep tokens visible
  const { tokens: solanaTrackerWebSocketTokens, isConnected: isWebSocketConnected } = useSolanaTrackerWebSocket({
    filterType: 'new',
    limit: 30,
    onMessage: (tokens) => {
      // LIVE UPDATE: Always update with fresh token data - ALL metrics update live
      // This ensures market cap, volume, fees, holders, dev holdings, etc. all update in real-time
      console.log('📨 WebSocket: Received new tokens:', tokens.length)
      
      // FAST CONVERSION: Inline loop for maximum speed
      const convertedTokens: TrenchesToken[] = []
      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i]
        // Extract and format volume - ensure it's a number (LIVE DATA from WebSocket)
        const volumeValue = typeof token.volume === 'number' ? token.volume : (typeof token.volume === 'string' ? parseFloat(token.volume) || 0 : 0)
        const volumeInUsd = formatVolume(volumeValue)
        const marketCap = token.marketCap || 0 // LIVE market cap from WebSocket
        const createdAt = token.creationTime || Date.now()
        const totalFeesNum = typeof token.totalFees === 'string' ? parseFloat(token.totalFees) || 0 : token.totalFees || 0 // LIVE fees from WebSocket
        
        // Debug: Log volume for first token to verify it's being extracted
        if (i === 0) {
          console.log('📊 Volume extraction:', {
            raw: token.volume,
            parsed: volumeValue,
            formatted: volumeInUsd,
            tokenName: token.name
          })
        }
        
        // Calculate initial age - start from 0s for brand new tokens
        const now = Date.now()
        const ageDiff = now - createdAt
        const initialAge = ageDiff < 1000 ? '0s' : formatTimeAgo(createdAt)
        
        convertedTokens.push({
          id: token.id || (i + 1).toString(),
          name: token.name,
          symbol: token.symbol,
          image: token.image || `https://ui-avatars.com/api/?name=${token.symbol}&background=6366f1&color=fff&size=48`,
          mc: formatMarketCap(marketCap),
          volume: volumeInUsd,
          fee: totalFeesNum.toFixed(3),
          age: initialAge, // Start from 0s for new tokens
          holders: token.holders || 0,
          buys: token.buyTransactions || 0,
          sells: token.sellTransactions || 0,
          status: 'new' as const,
          tag: token.name,
          contractAddress: token.contractAddress || '',
          migratedTokens: 0,
          devSold: (token.devHoldingsPercentage || 0) === 0,
          top10Holders: Math.round(token.topHoldersPercentage || 0),
          snipers: Math.round((token.sniperOwnedPercentage || 0) * 100) / 100,
          insiders: 0,
          platform: token.platform as any,
          platformLogo: token.platformLogo,
          buyAmount: "5.00",
          totalFees: totalFeesNum,
          tradingFees: typeof token.tradingFees === 'string' ? parseFloat(token.tradingFees) || 0 : token.tradingFees || 0,
          tipsFees: typeof token.tipsFees === 'string' ? parseFloat(token.tipsFees) || 0 : token.tipsFees || 0,
          coinMint: token.contractAddress || '',
          dev: '',
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
          // Add price change 24h for display
          priceChange24h: token.priceChange24h || 0,
          // Store creation time for live age updates - use current time for brand new tokens
          creationTime: createdAt > now ? now : createdAt // Ensure creationTime is not in the future
        } as any)
      }
      
      // ULTRA-FAST update: Immediate state update with optimized merge
      // New tokens at front, no sorting overhead
      setRealTokens((prevTokens) => {
        // Fast merge: Build Set of new token IDs for O(1) lookup
        const newTokenIds = new Set<string>()
        for (let i = 0; i < convertedTokens.length; i++) {
          newTokenIds.add(convertedTokens[i].id)
        }
        
        // Build result: new tokens first (instant visibility), then existing
        const allTokens: TrenchesToken[] = []
        
        // Add new tokens first - they appear instantly
        // ALWAYS create new objects to force React updates
        for (let i = 0; i < convertedTokens.length; i++) {
          allTokens.push({ ...convertedTokens[i] }) // Create new object for React
        }
        
        // Add existing tokens that aren't in new tokens
        // CRITICAL: New tokens from WebSocket ALWAYS overwrite existing tokens with fresh data
        // This ensures ALL metrics (mc, volume, fees, holders, dev, etc.) update live
        for (let i = 0; i < prevTokens.length; i++) {
          if (!newTokenIds.has(prevTokens[i].id)) {
            allTokens.push({ ...prevTokens[i] }) // Create new object for React
          }
          // If token exists in both, new token data (from WebSocket) already overwrote it above
        }
        
        // Limit to 30 - new tokens already at front, no sorting needed
        // Return new array to force React update
        return allTokens.slice(0, 30).map(t => ({ ...t }))
      })
      setLastUpdateTime(Date.now())
    },
    onError: (err) => {
      // Log error but don't block UI - REST API fallback will handle it
      console.warn('⚠️ WebSocket error (REST API fallback will be used):', err.message)
      // Don't set error state - let REST API handle data fetching
      // The component will automatically use REST API when WebSocket is not connected
    }
  })
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

      // Fetch Solana Tracker tokens for NEW column (fallback if WebSocket fails)
      const fetchSolanaTrackerNewTokens = async () => {
        // Only fetch via REST API if WebSocket is not connected
        if (isWebSocketConnected) {
          console.log('⏭️ Skipping REST API call - WebSocket is connected')
          return []
        }
        
        try {
          console.log('🔄 Fallback: Fetching NEW tokens via REST API...')
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
          console.warn('Error fetching Solana Tracker new tokens (fallback):', error)
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
        // REMOVED: fetchPumpFunTokensDirect() - now handled by live polling useEffect
      ])

      // Process results immediately as they come in
      let hasSolanaTrackerTokens = false
      
      // Always use REST API as primary source for now since WebSocket is having issues
      // WebSocket will update in real-time if it works
      // IMPORTANT: Filter out pump.fun tokens - they come from direct pump.fun API only
      if (solanaTrackerNewResult.status === 'fulfilled' && solanaTrackerNewResult.value.length > 0) {
        // Filter out pump.fun tokens BEFORE conversion
        const filteredTokens = solanaTrackerNewResult.value.filter((token: any) => {
          // Check platform in token data - pump.fun tokens should be excluded
          const createdOn = token.token?.createdOn?.toLowerCase() || 
                           token.createdOn?.toLowerCase() || 
                           token.pools?.[0]?.market?.toLowerCase() || 
                           ''
          return !createdOn.includes('pump.fun') && !createdOn.includes('pump')
        })
        
        const convertedTokens = filteredTokens
          .slice(0, 30)
          .map((token: any, index: number) => 
            convertSolanaTrackerToToken(token, index, 'new')
          )
          .filter((token: TrenchesToken) => token.platform !== 'pump.fun') // Double filter after conversion
        
        // Only update if WebSocket hasn't provided tokens yet, or if REST API has newer data
        if (realTokens.length === 0 || !isWebSocketConnected) {
        setRealTokens(convertedTokens)
        hasSolanaTrackerTokens = true
          console.log('✅ Solana Tracker NEW tokens loaded (REST API, pump.fun filtered):', convertedTokens.length)
      } else {
          console.log('✅ Solana Tracker NEW tokens from WebSocket:', realTokens.length, '(REST API also available)')
          hasSolanaTrackerTokens = true
        }
      } else if (isWebSocketConnected && realTokens.length > 0) {
        // Use WebSocket tokens if REST API failed but WebSocket has data
        console.log('✅ Solana Tracker NEW tokens from WebSocket (REST API failed):', realTokens.length)
        hasSolanaTrackerTokens = true
      } else if (isWebSocketConnected && realTokens.length === 0) {
        console.log('⚠️ WebSocket connected but no tokens received yet, waiting...')
      } else {
        console.log('⚠️ Solana Tracker NEW tokens not available from WebSocket or REST API')
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

      // REMOVED: pumpFunResult fallback for NEW column - we now use direct pump.fun API (pumpFunDirectResult)
      // pumpFunResult is no longer used for NEW column to avoid fetching pump.fun tokens from SolanaTracker

      // REMOVED: Old MC tokens fetch - now handled by live polling useEffect
      // MC tokens are now streamed live every 50ms via separate useEffect

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

    // Set up optimized auto-refresh - WebSocket handles NEW tokens in real-time
    // Only refresh REST API data periodically (other columns and fallback)
    const interval = setInterval(() => {
      // Only refresh if WebSocket is not connected (fallback mode)
      // WebSocket updates happen instantly, no need to poll
      if (!isWebSocketConnected) {
        console.log('Auto-refreshing token data (WebSocket not connected)...')
        fetchAllDataInParallel()
      }
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
    // Priority order: realTokens (WebSocket - most live) > pumpFunTokens > bonkFunTokens > moonItTokens
    // Process in reverse order so higher priority sources overwrite lower priority ones
    // OPTIMIZED: Direct array concatenation for speed
    const allTokens = [...moonItTokens, ...bonkFunTokens, ...pumpFunTokens, ...realTokens]
    
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

  // ULTRA-OPTIMIZED: Fast token processing - NO MEMOIZATION for maximum speed
  // ALWAYS recalculate on every render - trading platform needs instant updates
  // Removed useMemo to ensure no caching delays updates
  const newTokens = (() => {
    if (tokensWithLiveAge.length === 0) {
      return []
    }
    
    // FAST: Pre-allocate arrays, avoid multiple map operations
    const combinedTokens = new Array(tokensWithLiveAge.length)
    for (let i = 0; i < tokensWithLiveAge.length; i++) {
      combinedTokens[i] = { 
        ...tokensWithLiveAge[i], 
        _updateTimestamp: currentTime // Force update detection - changes every 10ms
      }
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
  })()

  // Live-updated graduating tokens with real-time age calculation
  // STABLE: Deduplicate and preserve tokens to prevent disappearing
  const graduatingTokensWithLiveAge = useMemo(() => {
    // Include mcTokens (pump.fun MC tokens) for "about to graduate" section
    // Priority: mcTokens (pump.fun - most live) > solanaTrackerGraduatingTokens > others
    // Process in reverse order so higher priority sources overwrite lower priority ones
    const allTokens = [...moonItGraduatedTokens, ...bonkFunGraduatedTokens, ...migratedTokens, ...graduatedTokens, ...solanaTrackerGraduatingTokens, ...mcTokens]
    
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
  }, [mcTokens, solanaTrackerGraduatingTokens, graduatedTokens, migratedTokens, bonkFunGraduatedTokens, moonItGraduatedTokens, currentTime])

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

