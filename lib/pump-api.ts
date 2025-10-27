export interface PumpFunCoin {
  coinMint: string
  dev: string
  name: string
  ticker: string
  imageUrl: string
  creationTime: number
  numHolders: number
  marketCap: number
  volume: number | string
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
  platform?: string
  platformLogo?: string
  totalFees?: number | string
  tradingFees?: number | string
  tipsFees?: number | string
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

// Cache for SolanaTracker responses to improve loading speed
const solanaTrackerCache = new Map<string, { data: any, timestamp: number }>()
const CACHE_DURATION_MAIN = 10000 // 10 seconds cache

// Helper function to convert SolanaTracker data to PumpFunCoin format
function convertSolanaTrackerToPumpFunCoins(data: any[]): PumpFunCoin[] {
  return data.map((token: any, index: number) => {
    // Determine platform based on the token data
    let platform = 'pump.fun'
    let platformLogo = '/icons/platforms/pump.fun-logo.svg'
    
    if (token.token?.createdOn) {
      const createdOn = token.token.createdOn.toLowerCase()
      if (createdOn.includes('pump.fun')) {
        platform = 'pump.fun'
        platformLogo = '/icons/platforms/pump.fun-logo.svg'
      } else if (createdOn.includes('bonk.fun')) {
        platform = 'bonk.fun'
        platformLogo = '/icons/platforms/bonk.fun-logo.svg'
      } else if (createdOn.includes('moon.it')) {
        platform = 'moon.it'
        platformLogo = '/icons/platforms/moon.it-logo.png'
      } else if (createdOn.includes('meteora')) {
        platform = 'meteora'
        platformLogo = '/icons/platforms/meteora.ag(met-dbc)-logo.png'
      } else if (createdOn.includes('pumpswap')) {
        platform = 'pumpswap'
        platformLogo = '/icons/platforms/pumpswap-logo.svg'
      } else if (createdOn.includes('moonshot')) {
        platform = 'moonshot'
        platformLogo = '/icons/platforms/moonshot-logo.svg'
      } else if (createdOn.includes('boop')) {
        platform = 'boop'
        platformLogo = '/icons/platforms/boop-logo.svg'
      } else if (createdOn.includes('orca')) {
        platform = 'orca'
        platformLogo = '/icons/platforms/orca-logo.svg'
      } else if (createdOn.includes('raydium')) {
        platform = 'raydium'
        platformLogo = '/icons/platforms/raydium-logo.svg'
      } else if (createdOn.includes('jupiter')) {
        platform = 'jupiter'
        platformLogo = '/icons/platforms/jupiter-logo.svg'
      }
    }
    
    // Also check pools[0].market for additional platform detection
    if (token.pools?.[0]?.market) {
      const market = token.pools[0].market.toLowerCase()
      if (market.includes('pump.fun')) {
        platform = 'pump.fun'
        platformLogo = '/icons/platforms/pump.fun-logo.svg'
      } else if (market.includes('bonk.fun')) {
        platform = 'bonk.fun'
        platformLogo = '/icons/platforms/bonk.fun-logo.svg'
      } else if (market.includes('moon.it')) {
        platform = 'moon.it'
        platformLogo = '/icons/platforms/moon.it-logo.png'
      }
    }
    
    return {
      coinMint: token.token?.mint || token.mint || `token-${index}`,
      dev: token.token?.dev || token.dev || 'Unknown',
      name: token.token?.name || token.name || 'Unknown Token',
      ticker: token.token?.symbol || token.symbol || 'UNKNOWN',
      imageUrl: token.token?.image || token.image || '/placeholder-token.png',
      creationTime: token.token?.createdAt ? new Date(token.token.createdAt).getTime() : Date.now(),
      numHolders: token.token?.holders || token.holders || 0,
      marketCap: token.pools?.[0]?.marketCap?.usd || token.marketCap || 0,
      volume: formatVolume(token.pools?.[0]?.txns?.volume || token.txns?.volume || token.pools?.[0]?.txns?.volume24h || token.pools?.[0]?.volume || token.txns?.volume24h || token.volume || token.pools?.[0]?.volume24h || token.volume24h || 0),
      currentMarketPrice: token.pools?.[0]?.price?.usd || token.price || 0,
      bondingCurveProgress: token.pools?.[0]?.bondingCurveProgress || token.bondingCurveProgress || 0,
      sniperCount: token.sniperCount || 0,
      graduationDate: token.graduationDate || null,
      holders: token.holders || [],
      allTimeHighMarketCap: token.pools?.[0]?.marketCap?.usd || token.marketCap || 0,
      poolAddress: token.pools?.[0]?.address || token.poolAddress || '',
      twitter: token.token?.twitter || token.twitter || null,
      telegram: token.token?.telegram || token.telegram || null,
      website: token.token?.website || token.website || null,
      hasTwitter: !!(token.token?.twitter || token.twitter),
      hasTelegram: !!(token.token?.telegram || token.telegram),
      hasWebsite: !!(token.token?.website || token.website),
      hasSocial: !!(token.token?.twitter || token.twitter || token.token?.telegram || token.telegram),
      twitterReuseCount: 0,
      devHoldingsPercentage: token.devHoldingsPercentage || 0,
      buyTransactions: token.buyTransactions || 0,
      sellTransactions: token.sellTransactions || 0,
      transactions: token.transactions || 0,
      sniperOwnedPercentage: token.sniperOwnedPercentage || 0,
      topHoldersPercentage: token.topHoldersPercentage || 0,
      platform,
      platformLogo,
      totalFees: formatFees(token.risk?.fees?.total || 0),
      tradingFees: formatFees(token.risk?.fees?.totalTrading || 0),
      tipsFees: formatFees(token.risk?.fees?.totalTips || 0)
    }
  })
}

export async function fetchPumpFunTokens(): Promise<PumpFunCoin[]> {
  try {
    console.log('Starting direct API call to SolanaTracker for multi-platform tokens...')
    
    // Check cache first
    const cacheKey = 'tokens-latest'
    const cached = solanaTrackerCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION_MAIN) {
      console.log('Using cached SolanaTracker data for immediate display')
      return convertSolanaTrackerToPumpFunCoins(cached.data)
    }
    
    // Call through our backend API route which has the API key
    const response = await fetch('/api/solanatracker/tokens?type=new&limit=30', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(8000) // 8 second timeout for better reliability
    })
    
    console.log('SolanaTracker proxy response status:', response.status)
    
    if (!response.ok) {
      console.warn('SolanaTracker proxy returned error:', response.status)
      // Fallback to original pump.fun API
      return await fetchPumpFunTokensFallback()
    }
    
    const responseData = await response.json()
    const data = responseData.data || []
    
    // Store in cache for immediate future requests
    solanaTrackerCache.set(cacheKey, { data, timestamp: Date.now() })
    
    // Check if the response has the expected structure
    if (!Array.isArray(data)) {
      console.warn('Invalid SolanaTracker response structure:', data)
      return await fetchPumpFunTokensFallback()
    }
    
    // Convert SolanaTracker tokens to PumpFunCoin format using helper function
    const convertedTokens = convertSolanaTrackerToPumpFunCoins(data)
    
    console.log('Successfully converted SolanaTracker data:', convertedTokens.length, 'tokens')
    return convertedTokens
  } catch (error) {
    console.warn('Error fetching tokens from SolanaTracker:', error)
    console.warn('Falling back to original pump.fun API')
    return await fetchPumpFunTokensFallback()
  }
}

// Fallback function - return empty array to avoid circular dependency
async function fetchPumpFunTokensFallback(): Promise<PumpFunCoin[]> {
  try {
    console.log('SolanaTracker API failed, returning empty array for fallback...')
    return []
  } catch (error) {
    console.warn('Error in fallback:', error)
    return []
  }
}

export async function fetchPumpFunMCTokens(): Promise<PumpFunCoin[]> {
  try {
    console.log('Starting direct API call to SolanaTracker for graduating tokens...')
    
    // Check cache first
    const cacheKey = 'tokens-graduating'
    const cached = solanaTrackerCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION_MAIN) {
      console.log('Using cached SolanaTracker graduating data for immediate display')
      return convertSolanaTrackerToPumpFunCoins(cached.data)
    }
    
    // Call through our backend API route which has the API key
    const response = await fetch('/api/solanatracker/tokens?type=graduating&limit=30', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(8000)
    })
    
    console.log('SolanaTracker Graduating proxy response status:', response.status)
    
    if (!response.ok) {
      console.warn('SolanaTracker Graduating proxy returned error:', response.status)
      // Fallback to original MC API
      return await fetchPumpFunMCTokensFallback()
    }
    
    const responseData = await response.json()
    const data = responseData.data || []
    
    // Store in cache for immediate future requests
    solanaTrackerCache.set(cacheKey, { data, timestamp: Date.now() })
    
    // Check if the response has the expected structure
    if (!Array.isArray(data)) {
      console.warn('Invalid SolanaTracker Graduating response structure:', data)
      return await fetchPumpFunMCTokensFallback()
    }
    
    // Convert graduating tokens to PumpFunCoin format using helper function
    const convertedTokens = convertSolanaTrackerToPumpFunCoins(data)
    
    console.log('Successfully converted SolanaTracker Graduating data:', convertedTokens.length, 'tokens')
    return convertedTokens
  } catch (error) {
    console.warn('Error fetching graduating tokens from SolanaTracker:', error)
    console.warn('Falling back to original API')
    return await fetchPumpFunMCTokensFallback()
  }
}

export async function fetchPumpFunGraduatedTokens(): Promise<PumpFunCoin[]> {
  try {
    console.log('Starting direct API call to SolanaTracker for graduated tokens...')
    
    // Check cache first
    const cacheKey = 'tokens-graduated'
    const cached = solanaTrackerCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION_MAIN) {
      console.log('Using cached SolanaTracker graduated data for immediate display')
      return convertSolanaTrackerToPumpFunCoins(cached.data)
    }
    
    // Call through our backend API route which has the API key
    const response = await fetch('/api/solanatracker/tokens?type=graduated&limit=30', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(8000) // 8 second timeout for better reliability
    })
    
    console.log('SolanaTracker Graduated proxy response status:', response.status)
    
    if (!response.ok) {
      console.warn('SolanaTracker Graduated proxy returned error:', response.status)
      // Fallback to original pump.fun graduated API
      return await fetchPumpFunGraduatedTokensFallback()
    }
    
    const responseData = await response.json()
    const data = responseData.data || []
    
    // Store in cache for immediate future requests
    solanaTrackerCache.set(cacheKey, { data, timestamp: Date.now() })
    
    // Check if the response has the expected structure
    if (!Array.isArray(data)) {
      console.warn('Invalid SolanaTracker Graduated response structure:', data)
      return await fetchPumpFunGraduatedTokensFallback()
    }
    
    // Convert graduated tokens to PumpFunCoin format using helper function
    const graduatedTokens = convertSolanaTrackerToPumpFunCoins(data.slice(0, 30))
    
    console.log('Successfully converted SolanaTracker Graduated data:', graduatedTokens.length, 'tokens')
    return graduatedTokens
  } catch (error) {
    console.warn('Error fetching graduated tokens from SolanaTracker:', error)
    console.warn('Falling back to original pump.fun graduated API')
    return await fetchPumpFunGraduatedTokensFallback()
  }
}

// Function to fetch graduated/migrated tokens from SolanaTracker
// CACHE BUSTER - Force rebuild for import fix - v3
export async function fetchPumpFunMigratedTokens(): Promise<PumpFunCoin[]> {
  try {
    console.log('Starting direct API call to SolanaTracker for migrated tokens...')
    
    // Call through our backend API route which has the API key
    const response = await fetch('/api/solanatracker/tokens?type=graduated&limit=30', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(8000) // 8 second timeout for better reliability
    })
    
    console.log('SolanaTracker Migrated proxy response status:', response.status)

      if (!response.ok) {
      console.warn('SolanaTracker Migrated proxy returned error:', response.status)
      // Fallback to empty array for now
      return []
    }
    
    const responseData = await response.json()
    const data = responseData.data || []
    
    // Check if the response has the expected structure
    if (!Array.isArray(data)) {
      console.warn('Invalid SolanaTracker Migrated response structure:', data)
      return []
    }
    
    // Convert migrated tokens to PumpFunCoin format
    const migratedTokens = data.slice(0, 30).map((token: any, index: number) => {
      // Determine platform based on the token data
      let platform = 'pump.fun'
      let platformLogo = '/icons/platforms/pump.fun-logo.svg'
      
      if (token.token?.createdOn) {
        const createdOn = token.token.createdOn.toLowerCase()
        if (createdOn.includes('pump.fun')) {
          platform = 'pump.fun'
          platformLogo = '/icons/platforms/pump.fun-logo.svg'
        } else if (createdOn.includes('bonk.fun')) {
          platform = 'bonk.fun'
          platformLogo = '/icons/platforms/bonk.fun-logo.svg'
        } else if (createdOn.includes('moon.it')) {
          platform = 'moon.it'
          platformLogo = '/icons/platforms/moon.it-logo.png'
        }
      }
      
      // Check pools for platform identification
      if (token.pools && token.pools.length > 0) {
        const pool = token.pools[0]
        if (pool.market === 'meteora-dyn-v2' || pool.market === 'meteora-curve' || pool.market === 'meteora-dyn') {
          platform = 'meteora'
          platformLogo = '/icons/platforms/meteora.ag(met-dbc)-logo.png'
        } else if (pool.market === 'raydium-clmm' || pool.market === 'raydium-launchpad') {
          platform = 'raydium'
          platformLogo = '/icons/platforms/raydium-launchlab-logo.svg'
        } else if (pool.market === 'pumpfun-amm') {
          platform = 'pumpswap'
          platformLogo = '/icons/platforms/pumpswap-logo.svg'
        }
      }
      
      return {
        coinMint: token.token?.mint || '',
        dev: token.token?.creation?.creator || '',
        name: token.token?.name || '',
        ticker: token.token?.symbol || '',
        imageUrl: token.token?.image || '',
        creationTime: token.token?.creation?.created_time ? token.token.creation.created_time * 1000 : Date.now(),
        numHolders: token.holders || 0,
        marketCap: token.pools?.[0]?.marketCap?.usd || 0,
        volume: formatVolume(token.pools?.[0]?.txns?.volume || token.txns?.volume || token.pools?.[0]?.txns?.volume24h || token.pools?.[0]?.volume || token.txns?.volume24h || token.volume || token.pools?.[0]?.volume24h || token.volume24h || 0),
        currentMarketPrice: token.pools?.[0]?.price?.usd || 0,
        bondingCurveProgress: token.pools?.[0]?.curvePercentage || 0,
        sniperCount: token.risk?.snipers?.count || 0,
        graduationDate: new Date().toISOString(), // Mark as migrated
        holders: [],
        allTimeHighMarketCap: token.pools?.[0]?.marketCap?.usd || 0,
        poolAddress: token.pools?.[0]?.poolId || null,
        twitter: token.token?.twitter || null,
        telegram: token.token?.telegram || null,
        website: token.token?.website || null,
        hasTwitter: !!token.token?.twitter,
        hasTelegram: !!token.token?.telegram,
        hasWebsite: !!token.token?.website,
        hasSocial: !!(token.token?.twitter || token.token?.telegram || token.token?.website),
        twitterReuseCount: 0,
        devHoldingsPercentage: token.risk?.dev?.percentage || 0,
        buyTransactions: token.buys || 0,
        sellTransactions: token.sells || 0,
        transactions: token.txns || 0,
        sniperOwnedPercentage: token.risk?.snipers?.totalPercentage || 0,
        topHoldersPercentage: token.risk?.top10 || 0,
        platform: platform,
        platformLogo: platformLogo,
        totalFees: formatFees(token.risk?.fees?.total || 0),
        tradingFees: formatFees(token.risk?.fees?.totalTrading || 0),
        tipsFees: formatFees(token.risk?.fees?.totalTips || 0)
      }
    })
    
    console.log('Successfully converted SolanaTracker Migrated data:', migratedTokens.length, 'tokens')
    return migratedTokens
  } catch (error) {
    console.warn('Error fetching migrated tokens from SolanaTracker:', error)
    console.warn('Falling back to empty array')
    return []
  }
}

// Alias function to ensure import works
export const fetchMigratedTokens = fetchPumpFunMigratedTokens

// Alternative function with different name to bypass cache issues
export async function fetchMigratedTokensAlt(): Promise<PumpFunCoin[]> {
  return await fetchPumpFunMigratedTokens()
}

// Fallback function for graduated tokens - return empty array to avoid circular dependency
async function fetchPumpFunGraduatedTokensFallback(): Promise<PumpFunCoin[]> {
  try {
    console.log('SolanaTracker Graduated API failed, returning empty array for fallback...')
    return []
  } catch (error) {
    console.warn('Error in graduated fallback:', error)
    return []
  }
}

// Fallback function to original MC API
async function fetchPumpFunMCTokensFallback(): Promise<PumpFunCoin[]> {
  try {
    console.log('SolanaTracker MC API failed, returning empty array for fallback...')
    return []
  } catch (error) {
    console.warn('Error in MC fallback:', error)
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
    return `$${Math.round(marketCap / 1000000 * 10) / 10}M`
  } else if (marketCap >= 1000) {
    return `$${Math.round(marketCap / 1000 * 10) / 10}K`
  } else {
    return `$${Math.round(marketCap)}`
  }
}

// Cache for SOL price to avoid repeated API calls
let solPriceCache: { price: number; timestamp: number } | null = null
const CACHE_DURATION_SECOND = 30 * 1000 // 30 seconds

async function getSolPrice(): Promise<number> {
  // Check cache first
  if (solPriceCache && Date.now() - solPriceCache.timestamp < CACHE_DURATION_SECOND) {
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
export function formatVolume(volumeInUsd: number | string): string {
  try {
    // If it's already a formatted string, return it
    if (typeof volumeInUsd === 'string') {
      return volumeInUsd
    }
    
    // If it's a number, format it
    const volume = Number(volumeInUsd)
    if (!Number.isFinite(volume) || volume < 0) {
      return '$0'
    }
    
    // Volume from SolanaTracker API is already in USD, no conversion needed
    if (volume >= 1000000) {
      return `$${Math.round(volume / 1000000 * 10) / 10}M`
    } else if (volume >= 1000) {
      return `$${Math.round(volume / 1000 * 10) / 10}K`
    } else {
      return `$${Math.round(volume)}`
    }
  } catch (error) {
    console.warn('Error formatting volume:', error)
    return typeof volumeInUsd === 'string' ? volumeInUsd : '$0'
  }
}

export function formatFees(fees: number): string {
  try {
    if (fees === 0) {
      return '0'
    }
    
    // Always limit to maximum 3 decimal places, no scientific notation
    if (fees >= 1) {
      return Math.round(fees * 100) / 100 + ''
    } else if (fees >= 0.01) {
      return Math.round(fees * 1000) / 1000 + ''
    } else if (fees >= 0.001) {
      return Math.round(fees * 1000) / 1000 + ''
    } else {
      // For very small numbers, just show 3 decimal places (will show 0.000)
      return Math.round(fees * 1000) / 1000 + ''
    }
  } catch (error) {
    console.warn('Error formatting fees:', error)
    return fees.toString()
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