import { useEffect, useRef, useState, useCallback } from 'react'

export interface SolanaTrackerWebSocketToken {
  id: string
  name: string
  symbol: string
  image: string
  marketCap: number
  volume: number
  price: number
  priceChange24h: number
  holders: number
  age: string
  platform: string
  platformLogo?: string
  contractAddress: string
  twitter?: string
  telegram?: string
  website?: string
  hasTwitter: boolean
  hasTelegram: boolean
  hasWebsite: boolean
  totalFees?: number
  tradingFees?: number
  tipsFees?: number
  devHoldingsPercentage?: number
  sniperOwnedPercentage?: number
  topHoldersPercentage?: number
  bondingCurveProgress?: number
  graduationDate?: string | null
  buyTransactions?: number
  sellTransactions?: number
  sniperCount?: number
  creationTime?: number
}

interface UseSolanaTrackerWebSocketOptions {
  onMessage?: (tokens: SolanaTrackerWebSocketToken[]) => void
  onError?: (error: Error) => void
  limit?: number
  filterType?: 'new' | 'graduating' | 'graduated'
}

export function useSolanaTrackerWebSocket(options: UseSolanaTrackerWebSocketOptions = {}) {
  const { onMessage, onError, limit = 30, filterType = 'new' } = options
  // Keep tokens in state - never clear them to prevent flickering
  const [tokens, setTokens] = useState<SolanaTrackerWebSocketToken[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = 10 // Increased to 10 attempts for better stability
  const baseReconnectDelay = 1000 // 1 second base delay
  const maxReconnectDelay = 10000 // 10 seconds max delay (exponential backoff)
  const dataTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const dataTimeoutDelay = 30000 // 30 seconds - if no data received, consider WebSocket not working
  const keepAliveIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const keepAliveDelay = 30000 // Send keepalive every 30 seconds
  const lastPongTimeRef = useRef<number>(Date.now())
  const connectionHealthCheckRef = useRef<NodeJS.Timeout | null>(null)
  // Track if we've ever received tokens to prevent clearing on reconnection
  const hasReceivedTokensRef = useRef(false)
  // Track current tokens for merging outside of setState
  const currentTokensRef = useRef<SolanaTrackerWebSocketToken[]>([])
  
  // Sync ref with state
  useEffect(() => {
    currentTokensRef.current = tokens
  }, [tokens])

  const convertToToken = useCallback((item: any, index: number): SolanaTrackerWebSocketToken => {
    // SolanaTracker WebSocket format: item has { token: {...}, pools: [...], events: {...}, risk: {...} }
    // Extract the token and related data
    const token = item.token || item
    const pools = item.pools || []
    const risk = item.risk || {}
    const events = item.events || {}
    
    // Extract platform information
    let platform = 'unknown'
    let platformLogo = undefined
    
    if (token?.createdOn) {
      const createdOn = token.createdOn.toLowerCase()
      if (createdOn.includes('pump.fun') || createdOn.includes('pump')) platform = 'pump.fun'
      else if (createdOn.includes('bonk.fun') || createdOn.includes('bonk') || createdOn.includes('letsbonk')) platform = 'bonk.fun'
      else if (createdOn.includes('moon.it') || createdOn.includes('moon')) platform = 'moon.it'
      else if (createdOn.includes('meteora')) platform = 'meteora'
      else if (createdOn.includes('pumpswap')) platform = 'pumpswap'
      else if (createdOn.includes('moonshot')) platform = 'moonshot'
      else if (createdOn.includes('boop')) platform = 'boop.fun'
      else if (createdOn.includes('orca')) platform = 'orca'
      else if (createdOn.includes('raydium')) platform = 'raydium'
      else if (createdOn.includes('jupiter')) platform = 'jupiter'
      else if (createdOn.includes('birdeye')) platform = 'birdeye'
      else if (createdOn.includes('dexscreener')) platform = 'dexscreener'
      else if (createdOn.includes('solscan')) platform = 'solscan'
      else if (createdOn.includes('solana')) platform = 'solana'
      else if (createdOn.includes('trends')) platform = 'trends.fun'
      else if (createdOn.includes('rupert')) platform = 'rupert'
      else if (createdOn.includes('bags.fm') || createdOn.includes('bags')) platform = 'bags.fm'
      else if (createdOn.includes('believe.app') || createdOn.includes('believe')) platform = 'believe.app'
      else platform = 'unknown'
    }

    // Also check pools[0].market for additional platform detection
    if (pools?.[0]?.market) {
      const market = pools[0].market.toLowerCase()
      if (market.includes('pump.fun') || market.includes('pump')) platform = 'pump.fun'
      else if (market.includes('bonk.fun') || market.includes('bonk') || market.includes('letsbonk')) platform = 'bonk.fun'
      else if (market.includes('moon.it') || market.includes('moon')) platform = 'moon.it'
      else if (market.includes('meteora')) platform = 'meteora'
      else if (market.includes('pumpswap')) platform = 'pumpswap'
      else if (market.includes('moonshot')) platform = 'moonshot'
      else if (market.includes('boop')) platform = 'boop.fun'
      else if (market.includes('orca')) platform = 'orca'
      else if (market.includes('raydium')) platform = 'raydium'
      else if (market.includes('jupiter')) platform = 'jupiter'
      else if (market.includes('birdeye')) platform = 'birdeye'
      else if (market.includes('dexscreener')) platform = 'dexscreener'
      else if (market.includes('solscan')) platform = 'solscan'
      else if (market.includes('solana')) platform = 'solana'
      else if (market.includes('trends')) platform = 'trends.fun'
      else if (market.includes('rupert')) platform = 'rupert'
      else if (market.includes('bags.fm') || market.includes('bags')) platform = 'bags.fm'
      else if (market.includes('believe.app') || market.includes('believe')) platform = 'believe.app'
    }

    // Get creation time from token.creation.created_time (in seconds) or token.createdAt
    const createdAt = token?.creation?.created_time 
      ? token.creation.created_time * 1000 // Convert seconds to milliseconds
      : (token?.createdAt ? new Date(token.createdAt).getTime() : Date.now())
    
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
    
    // Get pool data (first pool if available)
    const pool = pools?.[0] || {}
    
    // Extract volume from multiple possible locations in SolanaTracker WebSocket data
    // Match the comprehensive extraction from REST API service
    // Try all possible paths: pool.volume.h24, pool.volume, pool.txns.volume, events.24h.volume, token.volume, etc.
    let volume = 0
    
    // Try all possible volume paths (matching REST API service logic)
    if (pool?.volume?.h24) {
      volume = typeof pool.volume.h24 === 'number' ? pool.volume.h24 : parseFloat(String(pool.volume.h24)) || 0
    } else if (pool?.volume) {
      volume = typeof pool.volume === 'number' ? pool.volume : parseFloat(String(pool.volume)) || 0
    } else if (pool?.txns?.volume) {
      volume = typeof pool.txns.volume === 'number' ? pool.txns.volume : parseFloat(String(pool.txns.volume)) || 0
    } else if (pool?.txns?.volume24h) {
      volume = typeof pool.txns.volume24h === 'number' ? pool.txns.volume24h : parseFloat(String(pool.txns.volume24h)) || 0
    } else if (pool?.volume24h) {
      volume = typeof pool.volume24h === 'number' ? pool.volume24h : parseFloat(String(pool.volume24h)) || 0
    } else if (item?.pools?.[0]?.volume?.h24) {
      volume = typeof item.pools[0].volume.h24 === 'number' ? item.pools[0].volume.h24 : parseFloat(String(item.pools[0].volume.h24)) || 0
    } else if (item?.pools?.[0]?.volume) {
      volume = typeof item.pools[0].volume === 'number' ? item.pools[0].volume : parseFloat(String(item.pools[0].volume)) || 0
    } else if (item?.pools?.[0]?.txns?.volume) {
      volume = typeof item.pools[0].txns.volume === 'number' ? item.pools[0].txns.volume : parseFloat(String(item.pools[0].txns.volume)) || 0
    } else if (item?.pools?.[0]?.txns?.volume24h) {
      volume = typeof item.pools[0].txns.volume24h === 'number' ? item.pools[0].txns.volume24h : parseFloat(String(item.pools[0].txns.volume24h)) || 0
    } else if (item?.pools?.[0]?.volume24h) {
      volume = typeof item.pools[0].volume24h === 'number' ? item.pools[0].volume24h : parseFloat(String(item.pools[0].volume24h)) || 0
    } else if (item?.txns?.volume) {
      volume = typeof item.txns.volume === 'number' ? item.txns.volume : parseFloat(String(item.txns.volume)) || 0
    } else if (item?.volume24h) {
      volume = typeof item.volume24h === 'number' ? item.volume24h : parseFloat(String(item.volume24h)) || 0
    } else if (events?.['24h']?.volume) {
      volume = typeof events['24h'].volume === 'number' ? events['24h'].volume : parseFloat(String(events['24h'].volume)) || 0
    } else if (token?.volume) {
      volume = typeof token.volume === 'number' ? token.volume : parseFloat(String(token.volume)) || 0
    } else if (item?.volume) {
      volume = typeof item.volume === 'number' ? item.volume : parseFloat(String(item.volume)) || 0
    }
    
    // Debug: Log full data structure for first token to understand WebSocket format
    if (index === 0) {
      console.log('📊 Volume extraction debug:', {
        tokenName: token?.name || item?.name,
        extractedVolume: volume,
        'pool?.volume?.h24': pool?.volume?.h24,
        'pool?.volume': pool?.volume,
        'pool?.txns?.volume': pool?.txns?.volume,
        'pool?.txns?.volume24h': pool?.txns?.volume24h,
        'pool?.volume24h': pool?.volume24h,
        'item?.pools?.[0]?.volume?.h24': item?.pools?.[0]?.volume?.h24,
        'item?.pools?.[0]?.volume': item?.pools?.[0]?.volume,
        'item?.pools?.[0]?.txns?.volume': item?.pools?.[0]?.txns?.volume,
        'item?.volume': item?.volume,
        'item?.volume24h': item?.volume24h,
        'token?.volume': token?.volume,
        fullPool: pool,
        fullItem: JSON.stringify(item).substring(0, 500) // First 500 chars to see structure
      })
    }
    
    return {
      id: token?.mint || item.mint || `token-${index}`,
      name: token?.name || item.name || 'Unknown',
      symbol: token?.symbol || item.symbol || 'UNK',
      image: token?.image || item.image || `https://ui-avatars.com/api/?name=${token?.symbol || item.symbol || 'T'}&background=6366f1&color=fff&size=48`,
      marketCap: pool?.marketCap?.usd || item.marketCap || 0,
      volume: volume,
      price: pool?.price?.usd || item.price || 0,
      priceChange24h: pool?.priceChange?.h24 || events?.['24h']?.priceChangePercentage || item.priceChange24h || 0,
      holders: token?.holders || item.holders || 0,
      age: formatTimeAgo(createdAt),
      platform,
      platformLogo,
      contractAddress: token?.mint || item.mint || '',
      twitter: token?.twitter || item.twitter || null,
      telegram: token?.telegram || item.telegram || null,
      website: token?.website || item.website || null,
      hasTwitter: !!(token?.twitter || item.twitter),
      hasTelegram: !!(token?.telegram || item.telegram),
      hasWebsite: !!(token?.website || item.website),
      totalFees: parseFloat((risk?.fees?.total || 0).toFixed(3)),
      tradingFees: parseFloat((risk?.fees?.totalTrading || 0).toFixed(3)),
      tipsFees: parseFloat((risk?.fees?.totalTips || 0).toFixed(3)),
      devHoldingsPercentage: risk?.dev?.percentage || item.devHoldingsPercentage || 0,
      sniperOwnedPercentage: risk?.snipers?.totalPercentage || item.sniperOwnedPercentage || 0,
      topHoldersPercentage: risk?.top10 || item.topHoldersPercentage || 0,
      bondingCurveProgress: pool?.bondingCurveProgress || item.bondingCurveProgress || 0,
      graduationDate: item.graduationDate || null,
      buyTransactions: pool?.txns?.buys || item.buyTransactions || 0,
      sellTransactions: pool?.txns?.sells || item.sellTransactions || 0,
      sniperCount: risk?.snipers?.count || item.sniperCount || 0,
      creationTime: createdAt
    }
  }, [])

  const processMessage = useCallback((data: any) => {
    try {
      // Minimal logging for speed - only in dev mode
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Processing WebSocket message')
      }
      
      let tokenData: any[] = []
      
      // SolanaTracker WebSocket format: data contains { token: {...}, pools: [...], events: {...}, risk: {...} }
      // The entire data object IS the token data (it has token, pools, risk, events)
      if (data.token) {
        // SolanaTracker format: { token: {...}, pools: [...], risk: {...}, events: {...} }
        // The whole data object is what we need, not just data.token
        tokenData = [data] // Use the full data object which contains token, pools, risk, events
      } else if (Array.isArray(data)) {
        tokenData = data
      } else if (data.data && Array.isArray(data.data)) {
        tokenData = data.data
      } else if (data.tokens && Array.isArray(data.tokens)) {
        tokenData = data.tokens
      } else if (data.type === 'token' || data.type === 'new_token' || data.type === 'update') {
        // Single token update
        tokenData = [data]
      } else if (data.mint || data.contractAddress || data.id || data.pools) {
        // Might be a token object directly (has pools, so it's SolanaTracker format)
        tokenData = [data]
      }

      if (tokenData.length === 0) {
        console.log('⚠️ No token data found in message:', data)
        return
      }

      // FAST FILTER: Inline loops for maximum speed
      if (filterType === 'new') {
        // Quick filter for new tokens - inline for speed
        const filtered: any[] = []
        for (let i = 0; i < tokenData.length; i++) {
          const item = tokenData[i]
          const isGraduated = item.graduationDate || item.pools?.[0]?.graduated
          const isGraduating = item.pools?.[0]?.bondingCurveProgress && item.pools[0].bondingCurveProgress > 90
          if (!isGraduated && !isGraduating) {
            filtered.push(item)
          }
        }
        tokenData = filtered
      } else if (filterType === 'graduating') {
        const filtered: any[] = []
        for (let i = 0; i < tokenData.length; i++) {
          const item = tokenData[i]
          const isGraduating = item.pools?.[0]?.bondingCurveProgress && item.pools[0].bondingCurveProgress > 90
          if (isGraduating && !item.graduationDate) {
            filtered.push(item)
          }
        }
        tokenData = filtered
      } else if (filterType === 'graduated') {
        const filtered: any[] = []
        for (let i = 0; i < tokenData.length; i++) {
          const item = tokenData[i]
          if (item.graduationDate || item.pools?.[0]?.graduated) {
            filtered.push(item)
          }
        }
        tokenData = filtered
      }

      // FAST CONVERT: Inline loop, minimize allocations
      // EXCLUDE pump.fun tokens - they will be fetched directly from pump.fun API
      const convertedTokens: SolanaTrackerWebSocketToken[] = []
      for (let i = 0; i < tokenData.length; i++) {
        try {
          const token = convertToToken(tokenData[i], i)
          // Filter out pump.fun tokens - they come from direct API
          if (token && token.id && token.name !== 'Unknown' && token.platform !== 'pump.fun') {
            convertedTokens.push(token)
          }
        } catch (err) {
          // Skip invalid tokens silently for speed
        }
      }

      if (convertedTokens.length > 0) {
        // Mark that we've received tokens - prevents clearing on reconnection
        hasReceivedTokensRef.current = true
        
        // Update last activity time - receiving data means connection is alive
        lastPongTimeRef.current = Date.now()
        
        // Clear the data timeout since we received data
        if (dataTimeoutRef.current) {
          clearTimeout(dataTimeoutRef.current)
          dataTimeoutRef.current = null
        }
        
        // ULTRA-FAST: Process immediately with no delays - instant updates
        // Optimized merge: New tokens at front, no sorting overhead
        // Calculate merged tokens OUTSIDE of setState to avoid React lifecycle conflicts
        const prevTokens = currentTokensRef.current
        
        // Fast merge: Build Set of new token IDs for O(1) lookup
        const newTokenIds = new Set<string>()
        for (let i = 0; i < convertedTokens.length; i++) {
          newTokenIds.add(convertedTokens[i].id)
        }
        
        // Build array: new tokens first (instant visibility), then existing
        const allTokens: SolanaTrackerWebSocketToken[] = []
        
        // Add new tokens first - they appear instantly
        for (let i = 0; i < convertedTokens.length; i++) {
          allTokens.push(convertedTokens[i])
        }
        
        // Add existing tokens that aren't in new tokens
        for (let i = 0; i < prevTokens.length; i++) {
          if (!newTokenIds.has(prevTokens[i].id)) {
            allTokens.push(prevTokens[i])
          }
        }
        
        // Sort ALL tokens by creation time (newest first) - highest timestamp = newest
        allTokens.sort((a, b) => {
          const aTime = a.creationTime || 0
          const bTime = b.creationTime || 0
          return bTime - aTime // Descending order (newest first)
        })
        
        // Limit to specified limit
        const mergedTokens = allTokens.slice(0, limit)
        
        // Update ref with merged tokens
        currentTokensRef.current = mergedTokens
        
        // Update state
        setTokens(mergedTokens)
        
        // Call onMessage callback AFTER state update - use queueMicrotask to avoid React lifecycle conflicts
        // This ensures the callback runs outside of React's render cycle
        if (onMessage && mergedTokens.length > 0) {
          queueMicrotask(() => {
            onMessage(mergedTokens)
          })
        }
      } else {
        console.log('⚠️ No valid tokens after conversion')
        // Don't clear existing tokens - keep them visible
        // The existing tokens in state will remain visible
      }
    } catch (err) {
      console.error('Error processing WebSocket message:', err, data)
      const error = err instanceof Error ? err : new Error('Unknown error processing message')
      setError(error)
      if (onError) {
        onError(error)
      }
    }
  }, [filterType, limit, convertToToken, onMessage, onError])

  // Store connect function in ref to avoid dependency issues
  const connectRef = useRef<() => void>()
  
  const connect = useCallback(() => {
    try {
      // Get WebSocket URL - use NEXT_PUBLIC_ prefix for client-side access
      // Fallback to the hardcoded URL from .env
      const wsUrl = process.env.NEXT_PUBLIC_SOLANATRACKER_WEBSOCKET_URL || 
        'wss://datastream.solanatracker.io/d84342d9-217e-4f86-8f0c-3f7a04a67498'
      
      console.log('🔌 Connecting to SolanaTracker WebSocket...', wsUrl)
      
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        console.log('✅ SolanaTracker WebSocket connected')
        setIsConnected(true)
        setError(null)
        reconnectAttemptsRef.current = 0
        lastPongTimeRef.current = Date.now()
        
        // Clear any existing timeouts
        if (dataTimeoutRef.current) {
          clearTimeout(dataTimeoutRef.current)
          dataTimeoutRef.current = null
        }
        if (connectionHealthCheckRef.current) {
          clearInterval(connectionHealthCheckRef.current)
          connectionHealthCheckRef.current = null
        }
        
        // Set up keepalive ping mechanism
        if (keepAliveIntervalRef.current) {
          clearInterval(keepAliveIntervalRef.current)
        }
        keepAliveIntervalRef.current = setInterval(() => {
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            try {
              const pingMessage = JSON.stringify({ type: 'ping' })
              wsRef.current.send(pingMessage)
              console.log('📤 Sent keepalive ping')
            } catch (err) {
              console.warn('Error sending keepalive ping:', err)
            }
          }
        }, keepAliveDelay)
        
        // Set up connection health check
        connectionHealthCheckRef.current = setInterval(() => {
          const timeSinceLastPong = Date.now() - lastPongTimeRef.current
          if (timeSinceLastPong > 60000) { // 60 seconds without pong
            console.warn('⚠️ No pong received for 60 seconds, reconnecting...')
            if (wsRef.current) {
              wsRef.current.close(1000, 'Health check timeout')
            }
          }
        }, 10000) // Check every 10 seconds
        
        // Set a timeout to check if we receive data
        dataTimeoutRef.current = setTimeout(() => {
          if (currentTokensRef.current.length === 0) {
            console.warn('⚠️ WebSocket connected but no data received within timeout')
          }
        }, dataTimeoutDelay)
        
        // Subscribe to latest tokens stream using SolanaTracker's format
        // Format: { type: "join", room: "latest" }
        try {
          const subscribeMessage = JSON.stringify({
            type: 'join',
            room: 'latest'
          })
          ws.send(subscribeMessage)
          console.log('📤 Sent subscription message:', subscribeMessage)
        } catch (err) {
          console.error('Error sending subscription message:', err)
        }
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          console.log('📨 Received WebSocket message:', data)
          
          // Handle ping messages - respond with pong to keep connection alive
          if (data.type === 'ping' || data.type === 'PING') {
            try {
              const pongMessage = JSON.stringify({ type: 'pong' })
              ws.send(pongMessage)
              console.log('📤 Sent pong response')
            } catch (err) {
              console.warn('Error sending pong:', err)
            }
            return // Don't process ping as a token message
          }
          
          // Handle pong messages - update last pong time for health check
          if (data.type === 'pong' || data.type === 'PONG') {
            lastPongTimeRef.current = Date.now()
            return // Don't process pong as a token message
          }
          
          // Handle subscription confirmation
          if (data.type === 'joined' && data.room === 'latest') {
            console.log('✅ Successfully subscribed to latest tokens stream')
            return
          }
          
          // Handle actual token messages
          // Format: { type: "message", room: "latest", data: { token: {...}, pools: [...], ... } }
          if (data.type === 'message' && data.room === 'latest' && data.data) {
            console.log('📦 Received token data from WebSocket')
            // Log the full structure of the first message to understand data format
            if (data.data && typeof data.data === 'object') {
              const dataStr = JSON.stringify(data.data)
              console.log('📋 Full WebSocket message structure (first 1000 chars):', dataStr.substring(0, 1000))
              // Also log volume-related fields specifically
              if (data.data.pools?.[0]) {
                console.log('💧 Pool volume data:', {
                  'pools[0].volume': data.data.pools[0].volume,
                  'pools[0].volume.h24': data.data.pools[0].volume?.h24,
                  'pools[0].txns': data.data.pools[0].txns,
                  'pools[0].txns.volume': data.data.pools[0].txns?.volume,
                  'pools[0].txns.volume24h': data.data.pools[0].txns?.volume24h
                })
              }
            }
            processMessage(data.data) // Process the data object, not the wrapper
            return
          }
          
          // Fallback: try to process the message directly
          console.log('📨 Received WebSocket message (raw, first 500 chars):', JSON.stringify(data).substring(0, 500))
          processMessage(data)
        } catch (err) {
          console.error('Error parsing WebSocket message:', err, event.data)
        }
      }

      ws.onerror = (error) => {
        // Don't log as error immediately - wait for onclose to get the actual error code
        console.warn('⚠️ SolanaTracker WebSocket error event:', error)
        // The actual error details will be in onclose
      }

      ws.onclose = (event) => {
        console.log('🔌 SolanaTracker WebSocket closed:', event.code, event.reason || 'No reason provided')
        // DON'T set isConnected to false immediately - keep showing tokens during reconnection
        // Only mark as disconnected after a brief delay to prevent flickering
        wsRef.current = null

        // Log the close code for debugging
        if (event.code === 1006) {
          console.warn('⚠️ Abnormal closure (1006) - connection closed without close frame. This might indicate:')
          console.warn('   - Network issues')
          console.warn('   - Server-side connection reset')
          console.warn('   - Authentication/authorization issues')
          console.warn('   - Invalid subscription message format')
        } else if (event.code === 1000) {
          console.log('✅ Normal closure')
        } else {
          console.warn(`⚠️ WebSocket closed with code: ${event.code}`)
        }

        // Clear keepalive interval on close
        if (keepAliveIntervalRef.current) {
          clearInterval(keepAliveIntervalRef.current)
          keepAliveIntervalRef.current = null
        }
        if (connectionHealthCheckRef.current) {
          clearInterval(connectionHealthCheckRef.current)
          connectionHealthCheckRef.current = null
        }
        
        // Attempt to reconnect if not a normal closure
        if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++
          
          // Exponential backoff: delay = baseDelay * 2^(attempt-1), capped at maxDelay
          const delay = Math.min(
            baseReconnectDelay * Math.pow(2, reconnectAttemptsRef.current - 1),
            maxReconnectDelay
          )
          
          console.log(`🔄 Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts}) in ${delay}ms...`)
          
          // Keep tokens visible during reconnection - don't clear state
          // Only mark as disconnected after reconnection fails
          reconnectTimeoutRef.current = setTimeout(() => {
            // Use ref to call connect to avoid dependency issues
            if (connectRef.current) {
              connectRef.current()
            }
            // If reconnection takes too long, mark as disconnected but keep tokens
            setTimeout(() => {
              if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
                setIsConnected(false)
                // Try again if still not connected
                if (reconnectAttemptsRef.current < maxReconnectAttempts) {
                  reconnectAttemptsRef.current++
                  if (connectRef.current) {
                    connectRef.current()
                  }
                }
              }
            }, 5000) // Give 5 seconds for reconnection
          }, delay)
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          // Only mark as disconnected after max attempts - keep tokens visible
          setIsConnected(false)
          const maxAttemptsError = new Error(`Max reconnection attempts reached. Last close code: ${event.code}. Falling back to REST API.`)
          setError(maxAttemptsError)
          console.warn('⚠️ Max reconnection attempts reached. WebSocket will fall back to REST API. Tokens will still be displayed.')
          // Don't call onError here - let the component handle REST API fallback gracefully
          // The error is set in state so the component can check it if needed
        } else {
          // Normal closure - mark as disconnected
          setIsConnected(false)
        }
      }
    } catch (err) {
      console.error('Error creating WebSocket connection:', err)
      const error = err instanceof Error ? err : new Error('Failed to create WebSocket connection')
      setError(error)
      if (onError) {
        onError(error)
      }
    }
  }, [processMessage, onError, dataTimeoutDelay])
  
  // Update ref whenever connect changes
  useEffect(() => {
    connectRef.current = connect
  }, [connect])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    if (keepAliveIntervalRef.current) {
      clearInterval(keepAliveIntervalRef.current)
      keepAliveIntervalRef.current = null
    }
    if (connectionHealthCheckRef.current) {
      clearInterval(connectionHealthCheckRef.current)
      connectionHealthCheckRef.current = null
    }
    if (dataTimeoutRef.current) {
      clearTimeout(dataTimeoutRef.current)
      dataTimeoutRef.current = null
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Client disconnecting')
      wsRef.current = null
    }
    
    setIsConnected(false)
  }, [])

  useEffect(() => {
    // Only connect once on mount
    connect()

    return () => {
      disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty deps - only run on mount/unmount

  return {
    tokens,
    isConnected,
    error,
    reconnect: connect,
    disconnect
  }
}


