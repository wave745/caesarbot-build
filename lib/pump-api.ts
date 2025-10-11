export interface PumpFunCoin {
  coinMint: string
  dev: string
  name: string
  ticker: string
  imageUrl: string
  creationTime: number
  numHolders: number
  marketCap: number
  volume: number
  currentMarketPrice: number
  bondingCurveProgress: number
  sniperCount: number
  graduationDate: string | null
  holders: Array<{
    totalTokenAmountHeld: number
    isSniper: boolean
    ownedPercentage: number
    holderId: string
  }>
  allTimeHighMarketCap: number
  poolAddress: string | null
  twitter: string | null
  telegram: string | null
  website: string | null
  hasTwitter: boolean
  hasTelegram: boolean
  hasWebsite: boolean
  hasSocial: boolean
  twitterReuseCount: number
  devHoldingsPercentage: number
  buyTransactions: number
  sellTransactions: number
  transactions: number
  sniperOwnedPercentage: number
  topHoldersPercentage: number
}

export interface PumpFunResponse {
  coins: PumpFunCoin[]
  pagination: {
    lastScore: number
    hasMore: boolean
  }
}

// Bonk.fun interfaces
export interface BonkFunToken {
  mint: string
  poolId: string
  configId: string
  creator: string
  createAt: number
  name: string
  symbol: string
  description: string
  website?: string
  imgUrl?: string
  metadataUrl?: string
  platformInfo: {
    pubKey: string
    platformClaimFeeWallet: string
    platformLockNftWallet: string
    transferFeeExtensionAuth: string
    cpConfigId: string
    platformScale: string
    creatorScale: string
    burnScale: string
    feeRate: string
    creatorFeeRate: string
    name: string
    web: string
    img: string
    platformCurve: any[]
  }
  configInfo: {
    name: string
    pubKey: string
    epoch: number
    curveType: number
    index: number
    migrateFee: string
    tradeFeeRate: string
    maxShareFeeRate: string
    minSupplyA: string
    maxLockRate: string
    minSellRateA: string
    minMigrateRateA: string
    minFundRaisingB: string
    protocolFeeOwner: string
    migrateFeeOwner: string
    migrateToAmmWallet: string
    migrateToCpmmWallet: string
    mintB: string
  }
  mintB: {
    chainId: number
    address: string
    programId: string
    logoURI: string
    symbol: string
    name: string
    decimals: number
    tags: string[]
    extensions: any
  }
  decimals: number
  supply: number
  marketCap: number
  volumeA: number
  volumeB: number
  volumeU: number
  finishingRate: number
  initPrice: string
  endPrice: string
  totalLockedAmount: number
  cliffPeriod: string
  unlockPeriod: string
  startTime: number
  totalAllocatedShare: number
  defaultCurve: boolean
  totalSellA: string
  totalFundRaisingB: string
  migrateType: string
  mintProgramA: string
  cpmmCreatorFeeOn: number
}

export interface BonkFunResponse {
  id: string
  success: boolean
  data: {
    rows: BonkFunToken[]
    nextPageId?: string
  }
}

// Moon.it interfaces
export interface MoonItToken {
  id: string
  curve: {
    type: string
    symbol: string
    address: string
    feeBps: number
    totalSupply: string
    minAllocationTokenAmount: string
    maxAllocationTokenAmount: string
    marketCapThreshold: string
    marketCapCurrency: string
    collateralCurrency: string
    coefB: string
    collateralCollected: string
    priceIncrease: number
  }
  mintAddress: string
  symbol: string
  name: string
  decimals: number
  description: string
  uri: string
  creatorPK: string
  type: string
  blockchain: string
  state: string
  migrated: boolean
  disabled: boolean
  migrationDex: string
  isAirlock: boolean
  icon: string
  website?: string
  x?: string
  telegram?: string
  createdAt: string
  volumeCount: number
  volumeUSD: string
  progressPercent: number
  marketcap: string
  totalHolders: string
  top10HolderPercentage: string
  devHolding: string
  snipers: string
  moderated: boolean
  isFirstNineGagToken: boolean
  banner?: string
}

export interface MoonItResponse {
  data: MoonItToken[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export async function fetchPumpFunTokens(): Promise<PumpFunCoin[]> {
  try {
    console.log('Starting API call to our proxy...')
    const response = await fetch('/api/pump-tokens', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    })
    
    console.log('Response status:', response.status)
    
    const data = await response.json()
    
    if (!response.ok) {
      console.warn('API returned error:', data)
      // If the API returns an error but includes coins array, use it
      if (data && data.coins && Array.isArray(data.coins)) {
        console.log('Using fallback data from error response:', data.coins.length, 'coins')
        return data.coins
      }
      throw new Error(`HTTP error! status: ${response.status}: ${data?.error || 'Unknown error'}`)
    }
    
    // Check if the response has the expected structure
    if (!data.coins || !Array.isArray(data.coins)) {
      console.warn('Invalid response structure:', data)
      return []
    }
    
    console.log('Successfully fetched data:', data.coins.length, 'coins')
    return data.coins
  } catch (error) {
    console.warn('Error fetching Pump.fun tokens:', error)
    console.warn('Error details:', error instanceof Error ? error.message : 'Unknown error')
    return []
  }
}

export async function fetchPumpFunMCTokens(): Promise<PumpFunCoin[]> {
  try {
    console.log('Starting API call to MC proxy...')
    const response = await fetch('/api/pump-tokens-mc', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    })
    
    console.log('MC Response status:', response.status)
    
    const data = await response.json()
    
    if (!response.ok) {
      console.warn('MC API returned error:', data)
      if (data && data.coins && Array.isArray(data.coins)) {
        console.log('Using fallback MC data from error response:', data.coins.length, 'coins')
        return data.coins
      }
      throw new Error(`HTTP error! status: ${response.status}: ${data?.error || 'Unknown error'}`)
    }
    
    if (!data.coins || !Array.isArray(data.coins)) {
      console.warn('Invalid MC response structure:', data)
      return []
    }
    
    console.log('Successfully fetched MC data:', data.coins.length, 'coins')
    return data.coins
  } catch (error) {
    console.warn('Error fetching Pump.fun MC tokens:', error)
    console.warn('Error details:', error instanceof Error ? error.message : 'Unknown error')
    return []
  }
}

export async function fetchPumpFunGraduatedTokens(): Promise<PumpFunCoin[]> {
  try {
    console.log('Starting API call to graduated proxy...')
    const response = await fetch('/api/pump-tokens-graduated', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
      }
      })
      
    console.log('Graduated Response status:', response.status)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

    const data: PumpFunResponse = await response.json()
    console.log('Successfully fetched graduated data:', data.coins.length, 'coins')
    return data.coins
  } catch (error) {
    console.warn('Error fetching Pump.fun graduated tokens:', error)
    console.warn('Error details:', error instanceof Error ? error.message : 'Unknown error')
    return []
  }
}

export async function fetchBonkFunTokens(): Promise<BonkFunToken[]> {
  try {
    console.log('Starting API call to bonk.fun proxy...')
    const response = await fetch('/api/bonk-fun-tokens', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    })
    
    console.log('Bonk.fun Response status:', response.status)
    
    const data = await response.json()
    
    if (!response.ok) {
      // Log error safely without causing unhandled errors
      console.warn('Bonk.fun API returned error status:', response.status, 'Data:', data)
      // If the API returns an error but includes data array, use it
      if (data && data.data && Array.isArray(data.data)) {
        console.log('Using fallback data from error response:', data.data.length, 'tokens')
        return data.data
      }
      // Don't throw error, just return empty array to prevent crashes
      console.warn(`Bonk.fun API error (status ${response.status}): ${data?.error || 'Unknown error'}`)
      return []
    }
    
    // Check if the response has the expected structure
    if (!data.success || !data.data || !Array.isArray(data.data)) {
      console.warn('Invalid bonk.fun response structure:', data)
      return []
    }
    
    console.log('Successfully fetched bonk.fun data:', data.data.length, 'tokens')
    return data.data
    } catch (error) {
    console.warn('Error fetching bonk.fun tokens:', error)
    console.warn('Error details:', error instanceof Error ? error.message : 'Unknown error')
    return []
  }
}

export async function fetchBonkFunMCTokens(): Promise<BonkFunToken[]> {
  try {
    console.log('Starting API call to bonk.fun MC proxy...')
    const response = await fetch('/api/bonk-fun-tokens-mc', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    })
    
    console.log('Bonk.fun MC Response status:', response.status)
    
    const data = await response.json()
    
    if (!response.ok) {
      // Log error safely without causing unhandled errors
      console.warn('Bonk.fun MC API returned error status:', response.status, 'Data:', data)
      // If the API returns an error but includes data array, use it
      if (data && data.data && Array.isArray(data.data)) {
        console.log('Using fallback MC data from error response:', data.data.length, 'tokens')
        return data.data
      }
      // Don't throw error, just return empty array to prevent crashes
      console.warn(`Bonk.fun MC API error (status ${response.status}): ${data?.error || 'Unknown error'}`)
      return []
    }
    
    // Check if the response has the expected structure
    if (!data.success || !data.data || !Array.isArray(data.data)) {
      console.warn('Invalid bonk.fun MC response structure:', data)
      return []
    }
    
    console.log('Successfully fetched bonk.fun MC data:', data.data.length, 'tokens')
    return data.data
    } catch (error) {
    console.warn('Error fetching bonk.fun MC tokens:', error)
    console.warn('Error details:', error instanceof Error ? error.message : 'Unknown error')
    return []
  }
}

export async function fetchBonkFunGraduatedTokens(): Promise<BonkFunToken[]> {
  try {
    console.log('Starting API call to bonk.fun graduated proxy...')
    const response = await fetch('/api/bonk-fun-tokens-graduated', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    })
    
    console.log('Bonk.fun graduated Response status:', response.status)
    
    const data = await response.json()
    
    if (!response.ok) {
      // Log error safely without causing unhandled errors
      console.warn('Bonk.fun graduated API returned error status:', response.status, 'Data:', data)
      // If the API returns an error but includes data array, use it
      if (data && data.data && Array.isArray(data.data)) {
        console.log('Using fallback graduated data from error response:', data.data.length, 'tokens')
        return data.data
      }
      // Don't throw error, just return empty array to prevent crashes
      console.warn(`Bonk.fun graduated API error (status ${response.status}): ${data?.error || 'Unknown error'}`)
      return []
    }
    
    // Check if the response has the expected structure
    if (!data.success || !data.data || !Array.isArray(data.data)) {
      console.warn('Invalid bonk.fun graduated response structure:', data)
      return []
    }
    
    console.log('Successfully fetched bonk.fun graduated data:', data.data.length, 'tokens')
    return data.data
    } catch (error) {
    console.warn('Error fetching bonk.fun graduated tokens:', error)
    console.warn('Error details:', error instanceof Error ? error.message : 'Unknown error')
    return []
  }
}

export async function fetchMoonItTokens(): Promise<MoonItToken[]> {
  try {
    console.log('Starting API call to moon.it proxy...')
    const response = await fetch('/api/moon-it-tokens', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    })
    
    console.log('Moon.it Response status:', response.status)
    
    const data = await response.json()
    
    if (!response.ok) {
      // Log error safely without causing unhandled errors
      console.warn('Moon.it API returned error status:', response.status, 'Data:', data)
      // If the API returns an error but includes data array, use it
      if (data && data.data && Array.isArray(data.data)) {
        console.log('Using fallback data from error response:', data.data.length, 'tokens')
        return data.data
      }
      // Don't throw error, just return empty array to prevent crashes
      console.warn(`Moon.it API error (status ${response.status}): ${data?.error || 'Unknown error'}`)
      return []
    }
    
    // Check if the response has the expected structure
    if (!data.success || !data.data || !Array.isArray(data.data)) {
      console.warn('Invalid moon.it response structure:', data)
      return []
    }
    
    console.log('Successfully fetched moon.it data:', data.data.length, 'tokens')
    return data.data
    } catch (error) {
    console.warn('Error fetching moon.it tokens:', error)
    console.warn('Error details:', error instanceof Error ? error.message : 'Unknown error')
    return []
  }
}

export async function fetchMoonItMCTokens(): Promise<MoonItToken[]> {
  try {
    console.log('Starting API call to moon.it MC proxy...')
    const response = await fetch('/api/moon-it-tokens-mc', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    })
    
    console.log('Moon.it MC Response status:', response.status)
    
    const data = await response.json()
    
    if (!response.ok) {
      // Log error safely without causing unhandled errors
      console.warn('Moon.it MC API returned error status:', response.status, 'Data:', data)
      // If the API returns an error but includes data array, use it
      if (data && data.data && Array.isArray(data.data)) {
        console.log('Using fallback MC data from error response:', data.data.length, 'tokens')
        return data.data
      }
      // Don't throw error, just return empty array to prevent crashes
      console.warn(`Moon.it MC API error (status ${response.status}): ${data?.error || 'Unknown error'}`)
      return []
    }
    
    // Check if the response has the expected structure
    if (!data.success || !data.data || !Array.isArray(data.data)) {
      console.warn('Invalid moon.it MC response structure:', data)
      return []
    }
    
    console.log('Successfully fetched moon.it MC data:', data.data.length, 'tokens')
    return data.data
    } catch (error) {
    console.warn('Error fetching moon.it MC tokens:', error)
    console.warn('Error details:', error instanceof Error ? error.message : 'Unknown error')
    return []
  }
}

export async function fetchMoonItGraduatedTokens(): Promise<MoonItToken[]> {
  try {
    console.log('Starting API call to moon.it graduated proxy...')
    const response = await fetch('/api/moon-it-tokens-graduated', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    })
    
    console.log('Moon.it graduated Response status:', response.status)
    
    const data = await response.json()
    
    if (!response.ok) {
      // Log error safely without causing unhandled errors
      console.warn('Moon.it graduated API returned error status:', response.status, 'Data:', data)
      // If the API returns an error but includes data array, use it
      if (data && data.data && Array.isArray(data.data)) {
        console.log('Using fallback graduated data from error response:', data.data.length, 'tokens')
        return data.data
      }
      // Don't throw error, just return empty array to prevent crashes
      console.warn(`Moon.it graduated API error (status ${response.status}): ${data?.error || 'Unknown error'}`)
      return []
    }
    
    // Check if the response has the expected structure
    if (!data.success || !data.data || !Array.isArray(data.data)) {
      console.warn('Invalid moon.it graduated response structure:', data)
      return []
    }
    
    console.log('Successfully fetched moon.it graduated data:', data.data.length, 'tokens')
    return data.data
    } catch (error) {
    console.warn('Error fetching moon.it graduated tokens:', error)
    console.warn('Error details:', error instanceof Error ? error.message : 'Unknown error')
    return []
  }
}

export function formatMarketCap(marketCap: number): string {
  if (marketCap >= 1000000) {
    return `$${(marketCap / 1000000).toFixed(1)}M`
  } else if (marketCap >= 1000) {
    return `$${(marketCap / 1000).toFixed(1)}K`
  } else {
    return `$${marketCap.toFixed(0)}`
  }
}

// Cache for SOL price to avoid repeated API calls
let solPriceCache: { price: number; timestamp: number } | null = null
const CACHE_DURATION = 30 * 1000 // 30 seconds

async function getSolPrice(): Promise<number> {
  // Check cache first
  if (solPriceCache && Date.now() - solPriceCache.timestamp < CACHE_DURATION) {
    return solPriceCache.price
  }

  try {
    // Use Moralis API to get SOL price
    const response = await fetch('/api/moralis/token-prices?tokenAddresses=So11111111111111111111111111111111111111112&chain=solana')
    
    if (response.ok) {
      const data = await response.json()
      if (data.success && data.data && data.data.length > 0) {
        const price = data.data[0].usdPrice || 0
        solPriceCache = { price, timestamp: Date.now() }
        return price
      }
    }
  } catch (error) {
    console.warn('Failed to fetch SOL price from Moralis:', error)
  }

  // Fallback to Jupiter API
  try {
    const response = await fetch('/api/jupiter/price?address=So11111111111111111111111111111111111111112')
    
    if (response.ok) {
      const data = await response.json()
      if (data.success && data.price) {
        const price = data.price
        solPriceCache = { price, timestamp: Date.now() }
        return price
      }
    }
  } catch (error) {
    console.warn('Failed to fetch SOL price from Jupiter:', error)
  }

  // Final fallback - return cached price or default
  return solPriceCache?.price || 100 // Default SOL price if all APIs fail
}

// Synchronous volume formatting with cached SOL price
export function formatVolume(volumeInSol: number): string {
  try {
    // Use cached SOL price if available, otherwise use a reasonable default
    let solPrice = 220 // Default SOL price
    
    // Try to get from global cache first (client-side)
    if (typeof window !== 'undefined' && (window as any).solPriceCache) {
      solPrice = (window as any).solPriceCache.price
    } else if (solPriceCache?.price) {
      // Fallback to module cache (server-side)
      solPrice = solPriceCache.price
    }
    
    const volumeInUsd = volumeInSol * solPrice
    
    if (volumeInUsd >= 1000000) {
      return `$${(volumeInUsd / 1000000).toFixed(1)}M`
    } else if (volumeInUsd >= 1000) {
      return `$${(volumeInUsd / 1000).toFixed(1)}K`
    } else {
      return `$${volumeInUsd.toFixed(0)}`
    }
  } catch (error) {
    console.warn('Error converting volume to USD:', error)
    // Fallback to treating as USD if conversion fails
    if (volumeInSol >= 1000000) {
      return `$${(volumeInSol / 1000000).toFixed(1)}M`
    } else if (volumeInSol >= 1000) {
      return `$${(volumeInSol / 1000).toFixed(1)}K`
    } else {
      return `$${volumeInSol.toFixed(0)}`
    }
  }
}

export function formatTimeAgo(creationTime: number): string {
  const now = Date.now()
  const diff = now - creationTime
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days > 0) {
    return `${days}d`
  } else if (hours > 0) {
    return `${hours}h`
  } else if (minutes > 0) {
    return `${minutes}m`
  } else {
    return '0s'
  }
}

export function getContractAddress(coinMint: string): string {
  return `${coinMint.slice(0, 3)}...${coinMint.slice(-4)}`
}

// MetaData interface for meta-analysis components
export interface MetaData {
  id: string
  name: string
  symbol: string
  marketCap: number
  volume: number
  price: number
  change24h: number
  holders: number
  liquidity: number
  createdAt: number
  address: string
  logo?: string
  isPaid?: boolean
  twitter?: string
  telegram?: string
  website?: string
  // Additional properties used in meta-analysis components
  score?: number
  word?: string
  word_with_strength?: string
}

// PumpApiService for meta-analysis components
export const PumpApiService = {
  async getCurrentMetas(): Promise<{ data: MetaData[], error?: string }> {
    try {
      const response = await fetch('/api/pump-metas', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success && result.data) {
        return { data: result.data }
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error) {
      console.error('Error fetching meta data:', error)
      return { 
        data: [], 
        error: error instanceof Error ? error.message : 'Failed to fetch meta data' 
      }
    }
  },
  
  getCachedMetas(): MetaData[] {
    // Return empty array for cached data
    return []
  }
}