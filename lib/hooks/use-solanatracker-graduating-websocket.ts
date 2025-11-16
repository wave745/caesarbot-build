"use client"

import { useEffect, useState, useRef, useCallback } from 'react'

export interface SolanaTrackerGraduatingWebSocketToken {
  token: {
    name: string
    symbol: string
    mint: string
    uri?: string
    decimals: number
    hasFileMetaData: boolean
    createdOn: string
    description?: string
    image: string
    twitter?: string
    telegram?: string
    website?: string
    discord?: string
    strictSocials?: {
      twitter?: string
      telegram?: string
      website?: string
      discord?: string
    }
  }
  creation: {
    creator: string
    created_tx: string
    created_time: number
  }
  pools: Array<{
    marketCap?: { usd?: number }
    volume?: { h24?: number } | number
    price?: { usd?: number }
    priceChange?: { h24?: number }
    bondingCurveProgress?: number
    txns?: {
      buys?: number
      sells?: number
      volume?: number
      volume24h?: number
    }
  }>
  events?: {
    '1m'?: { volume?: number }
    '5m'?: { volume?: number }
    '15m'?: { volume?: number }
    '30m'?: { volume?: number }
    '1h'?: { volume?: number }
    '4h'?: { volume?: number }
    '24h'?: { volume?: number }
  }
  risk?: {
    snipers?: {
      count?: number
      totalBalance?: number
      totalPercentage?: number
      wallets?: any[]
    }
    insiders?: {
      count?: number
      totalBalance?: number
      totalPercentage?: number
      wallets?: any[]
    }
    top10?: number
    dev?: {
      percentage?: number
      amount?: number
    }
    rugged?: boolean
    risks?: any[]
    score?: number
    jupiterVerified?: boolean
    buys?: number
    sells?: number
    txns?: number
    fees?: {
      total?: number
      totalTrading?: number
      totalTips?: number
    }
  }
}

interface UseSolanaTrackerGraduatingWebSocketOptions {
  onMessage: (tokens: SolanaTrackerGraduatingWebSocketToken[]) => void
  onError?: (error: Error) => void
  maxTokens?: number
}

export function useSolanaTrackerGraduatingWebSocket({
  onMessage,
  onError,
  maxTokens = 30
}: UseSolanaTrackerGraduatingWebSocketOptions) {
  const [isConnected, setIsConnected] = useState(false)
  const [tokens, setTokens] = useState<SolanaTrackerGraduatingWebSocketToken[]>([])
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = 5
  const tokensMapRef = useRef<Map<string, SolanaTrackerGraduatingWebSocketToken>>(new Map())
  const wasConnectedRef = useRef(false) // Track if we ever successfully connected

  const connect = useCallback(() => {
    // Get datastream URL from environment variable
    // Should be full URL: wss://datastream.solanatracker.io/{key}
    // For client-side, we need NEXT_PUBLIC_ prefix or fetch from API
    let wsUrl: string | undefined
    
    // Try client-side env var first (must have NEXT_PUBLIC_ prefix)
    if (typeof window !== 'undefined') {
      wsUrl = (window as any).__NEXT_DATA__?.env?.NEXT_PUBLIC_SOLANATRACKER_WEBSOCKET_URL ||
              process.env.NEXT_PUBLIC_SOLANATRACKER_WEBSOCKET_URL
    }
    
    // Fallback: try to get from server via API (for server-side env vars)
    if (!wsUrl) {
      // For now, we'll construct it from the key if available
      // The key format from .env is: wss://datastream.solanatracker.io/{key}
      // We need to extract just the key part or use the full URL
      const envKey = process.env.NEXT_PUBLIC_SOLANATRACKER_WEBSOCKET_URL
      if (envKey?.startsWith('wss://')) {
        wsUrl = envKey
      } else if (envKey) {
        // If it's just the key, construct the full URL
        wsUrl = `wss://datastream.solanatracker.io/${envKey}`
      }
    }
    
    if (!wsUrl) {
      const errorMsg = 'Datastream URL not configured. Please set NEXT_PUBLIC_SOLANATRACKER_WEBSOCKET_URL environment variable.'
      console.warn('⚠️ SolanaTracker WebSocket:', errorMsg)
      // Don't call onError here - just log and return silently
      // The component can work without WebSocket (falls back to REST API)
      return
    }
    
    const maskedUrl = wsUrl.replace(/\/[^\/]+$/, '/***') // Hide key in logs
    console.log('🔌 Connecting to SolanaTracker WebSocket for graduating tokens...', maskedUrl)

    try {
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws
      
      // Set a connection timeout
      const connectionTimeout = setTimeout(() => {
        if (ws.readyState === WebSocket.CONNECTING) {
          console.warn('⚠️ WebSocket connection timeout after 10s')
          ws.close()
          setIsConnected(false)
          // Don't call onError - let onclose handle reconnection
        }
      }, 10000) // 10 second timeout
      
      // Clear timeout on successful connection
      ws.addEventListener('open', () => {
        clearTimeout(connectionTimeout)
      })

      ws.onopen = () => {
        console.log('✅ SolanaTracker WebSocket connected for graduating tokens')
        setIsConnected(true)
        wasConnectedRef.current = true // Mark that we successfully connected
        reconnectAttemptsRef.current = 0

        // Subscribe to graduating tokens
        try {
          ws.send(JSON.stringify({
            type: 'join',
            room: 'graduating'
          }))
          console.log('📡 Subscribed to graduating tokens room')
        } catch (sendError) {
          console.error('❌ Error sending subscription message:', sendError)
          onError?.(new Error('Failed to subscribe to graduating tokens room'))
        }
      }

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          
          // Handle subscription confirmation
          if (message.type === 'joined' && message.room === 'graduating') {
            console.log('✅ Successfully joined graduating tokens room')
            return
          }

          // Handle graduating token messages
          if (message.type === 'message' && message.room === 'graduating' && message.data) {
            const tokenData: SolanaTrackerGraduatingWebSocketToken = message.data
            
            // Use mint as unique identifier
            const mint = tokenData.token?.mint
            if (!mint) {
              console.warn('Received token without mint address')
              return
            }

            // Update tokens map (keep latest version of each token)
            tokensMapRef.current.set(mint, tokenData)

            // Convert map to array and limit to maxTokens
            const tokensArray = Array.from(tokensMapRef.current.values())
              .slice(0, maxTokens)

            // Update state
            setTokens(tokensArray)
            
            // Call onMessage callback
            onMessage(tokensArray)
            
            console.log('📨 Received graduating token:', tokenData.token?.symbol, `(${tokensArray.length} total)`)
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      ws.onerror = (error) => {
        // WebSocket error event doesn't provide detailed error info
        // Check readyState to determine the issue
        const state = ws.readyState
        let errorMessage = 'WebSocket connection error'
        
        if (state === WebSocket.CLOSED) {
          errorMessage = 'WebSocket connection closed unexpectedly'
        } else if (state === WebSocket.CONNECTING) {
          errorMessage = 'WebSocket connection failed to establish'
        }
        
        // Log as warning instead of error to reduce noise
        // The onclose handler will handle reconnection
        console.warn('⚠️ SolanaTracker WebSocket error:', errorMessage, 'ReadyState:', state)
        setIsConnected(false)
        // Don't call onError here - let onclose handle it
      }

      ws.onclose = (event) => {
        const reason = event.code !== 1000 ? ` (code: ${event.code}, reason: ${event.reason || 'none'})` : ''
        const wasConnected = wasConnectedRef.current
        
        if (wasConnected) {
          console.log('🔌 SolanaTracker WebSocket closed for graduating tokens' + reason)
        } else {
          console.warn('⚠️ SolanaTracker WebSocket failed to connect' + reason)
        }
        
        setIsConnected(false)
        wsRef.current = null

        // Only attempt to reconnect if we had a successful connection before
        // If we never connected, retry with longer delays but fewer attempts
        if (wasConnected && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000) // Exponential backoff, max 30s
          console.log(`🔄 Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`)
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, delay)
        } else if (!wasConnected && reconnectAttemptsRef.current < 3) {
          // For initial connection failures, only retry 3 times with longer delays
          reconnectAttemptsRef.current++
          const delay = Math.min(5000 * reconnectAttemptsRef.current, 30000) // Longer delays for initial failures
          console.log(`🔄 Retrying connection in ${delay}ms (attempt ${reconnectAttemptsRef.current}/3)...`)
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, delay)
        } else {
          // Max attempts reached - log as warning instead of error
          console.warn('⚠️ Max reconnection attempts reached for graduating tokens WebSocket. Falling back to REST API.')
          // Don't call onError - let the component work without WebSocket
        }
      }
    } catch (error) {
      console.error('Error creating WebSocket connection:', error)
      setIsConnected(false)
      onError?.(error instanceof Error ? error : new Error('Unknown WebSocket error'))
    }
  }, [onMessage, onError, maxTokens])

  useEffect(() => {
    connect()

    return () => {
      // Cleanup on unmount
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [connect])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    setIsConnected(false)
    tokensMapRef.current.clear()
    setTokens([])
  }, [])

  return {
    isConnected,
    tokens,
    disconnect,
    reconnect: connect
  }
}

