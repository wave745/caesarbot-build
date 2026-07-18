"use client"

import { useEffect, useRef, useState } from "react"
import { io, type Socket } from "socket.io-client"
import {
  DATASTREAM_URL,
  ROOM_STATUS,
  datastreamToToken,
  getMint,
  getCreationTime,
  getSolPriceUsd,
  unwrapEnvelope,
  type DatastreamRoom,
} from "@/lib/datastream"

// How often batched room state is pushed to React. The stream emits ~150 msg/s
// across the three rooms; converting and re-rendering per message would melt the
// main thread, so we accumulate raw payloads and flush on this cadence.
const FLUSH_MS = 700

// Cap per room. Downstream memos sort and slice to 30; a little headroom lets
// filtering still have something to work with without unbounded Map growth.
const MAX_PER_ROOM = 80

const ROOMS: DatastreamRoom[] = ["new", "graduating", "graduated"]

interface DatastreamState {
  newTokens: any[]
  graduatingTokens: any[]
  graduatedTokens: any[]
  connected: boolean
}

export function useDatastream(enabled: boolean): DatastreamState {
  const [state, setState] = useState<DatastreamState>({
    newTokens: [],
    graduatingTokens: [],
    graduatedTokens: [],
    connected: false,
  })

  // Raw payloads keyed by mint, one Map per room. Kept in a ref so the high-rate
  // socket handler never triggers a render — only the flush interval does.
  const poolsRef = useRef<Record<DatastreamRoom, Map<string, any>>>({
    new: new Map(),
    graduating: new Map(),
    graduated: new Map(),
  })
  const solPriceRef = useRef<number | undefined>(undefined)
  const dirtyRef = useRef(false)

  useEffect(() => {
    if (!enabled) return

    const pools = poolsRef.current

    const upsert = (room: DatastreamRoom, raw: any) => {
      const payload = unwrapEnvelope(raw)
      const mint = getMint(payload)
      if (!mint) return
      pools[room].set(mint, payload)
      const price = getSolPriceUsd(payload)
      if (price) solPriceRef.current = price
      dirtyRef.current = true
    }

    const socket: Socket = io(DATASTREAM_URL, {
      transports: ["websocket"],
      reconnection: true,
    })

    socket.on("connect", () => {
      ROOMS.forEach((r) => socket.emit("join", r))
      setState((s) => ({ ...s, connected: true }))
    })
    socket.on("disconnect", () => setState((s) => ({ ...s, connected: false })))

    // Snapshot on join: data is an array of envelopes.
    socket.on("snapshot", (p: any) => {
      const room = p?.room as DatastreamRoom
      if (!room || !pools[room] || !Array.isArray(p.data)) return
      p.data.forEach((item: any) => upsert(room, item))
    })

    // Live updates: a single envelope carrying the full token payload.
    socket.on("message", (p: any) => {
      const room = p?.room as DatastreamRoom
      if (room && pools[room]) upsert(room, p)
    })

    // Convert + publish the bounded newest set for each room.
    const flush = () => {
      if (!dirtyRef.current) return
      dirtyRef.current = false

      const build = (room: DatastreamRoom) => {
        const entries = Array.from(pools[room].values())
        entries.sort((a, b) => (getCreationTime(b) || 0) - (getCreationTime(a) || 0))
        // Evict the overflow so the Map tracks the newest MAX_PER_ROOM tokens.
        if (entries.length > MAX_PER_ROOM) {
          const map = pools[room]
          for (const stale of entries.slice(MAX_PER_ROOM)) {
            const m = getMint(stale)
            if (m) map.delete(m)
          }
          entries.length = MAX_PER_ROOM
        }
        return entries.map((p) => datastreamToToken(p, ROOM_STATUS[room]))
      }

      if (solPriceRef.current && typeof window !== "undefined") {
        ;(window as any).solPriceCache = { price: solPriceRef.current, timestamp: Date.now() }
      }

      setState((s) => ({
        ...s,
        newTokens: build("new"),
        graduatingTokens: build("graduating"),
        graduatedTokens: build("graduated"),
      }))
    }

    const interval = setInterval(flush, FLUSH_MS)

    return () => {
      clearInterval(interval)
      socket.removeAllListeners()
      socket.disconnect()
      pools.new.clear()
      pools.graduating.clear()
      pools.graduated.clear()
      dirtyRef.current = false
    }
  }, [enabled])

  return state
}
