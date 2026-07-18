// CaesarX Data API — client-side token stream.
//
// The service (datastream.caesarx.trade) publishes the same full token payload
// from its Socket.IO rooms and its REST endpoints, wrapped in a { type, room, data }
// envelope. This module holds the pure mapping from that payload to the shape the
// Echo page renders (TrenchesToken); the live socket lives in hooks/useDatastream.ts.

export const DATASTREAM_URL = "https://datastream.caesarx.trade"

// Room -> Echo column status. The rooms map 1:1 onto the three columns.
export type DatastreamRoom = "new" | "graduating" | "graduated"
export type EchoStatus = "new" | "about-to-graduate" | "migrated"

export const ROOM_STATUS: Record<DatastreamRoom, EchoStatus> = {
  new: "new",
  graduating: "about-to-graduate",
  graduated: "migrated",
}

// The stream's `pools[0].market` / `token.createdOn` uses launchpad slugs; Echo's
// platform union uses display names. Anything unmapped renders as 'unknown'.
const PLATFORM_MAP: Record<string, string> = {
  pumpfun: "pump.fun",
  "pump.fun": "pump.fun",
  pumpswap: "pumpswap",
  letsbonk: "bonk.fun",
  bonk: "bonk.fun",
  bonkfun: "bonk.fun",
  "bonk.fun": "bonk.fun",
  moonit: "moon.it",
  "moon.it": "moon.it",
  moonshot: "moonshot",
  meteora_dbc: "meteora",
  meteora: "meteora",
  raydium_launchlab: "raydium",
  raydium: "raydium",
  boop: "boop.fun",
  "boop.fun": "boop.fun",
  believe: "believe.app",
  bags: "bags.fm",
  orca: "orca",
  jupiter: "jupiter",
}

export function normalizePlatform(raw?: string): string {
  if (!raw) return "unknown"
  let key = raw.toLowerCase().trim()
  // token.createdOn is sometimes a URL (e.g. "https://meteora.ag").
  if (key.startsWith("http")) {
    if (key.includes("pump.fun")) return "pump.fun"
    if (key.includes("bonk")) return "bonk.fun"
    if (key.includes("moon")) return "moon.it"
    if (key.includes("meteora")) return "meteora"
    if (key.includes("raydium")) return "raydium"
    if (key.includes("believe")) return "believe.app"
    if (key.includes("bags")) return "bags.fm"
    return "unknown"
  }
  return PLATFORM_MAP[key] || "unknown"
}

const clampCurve = (v: unknown): number | undefined => {
  const n = typeof v === "number" ? v : NaN
  return Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : undefined
}

const nonEmpty = (s: unknown): boolean => typeof s === "string" && s.trim().length > 0

// A token payload as it arrives from the stream (partial by design — the service
// enriches over time and marks completeness in meta.dataQuality).
export interface DatastreamPayload {
  token?: any
  pools?: any[]
  quote?: any
  risk?: any
  graduation?: { status?: string }
  holderCount?: number
  [k: string]: any
}

// Unwrap a { type, room, data } envelope to the payload. Snapshot arrays are
// arrays of envelopes; live `message` events are a single envelope.
export function unwrapEnvelope(x: any): DatastreamPayload {
  return x && x.type && x.data ? x.data : x
}

export function getMint(payload: DatastreamPayload): string | undefined {
  return payload?.token?.mint || payload?.pools?.[0]?.tokenAddress || undefined
}

export function getCreationTime(payload: DatastreamPayload): number | undefined {
  const pool = payload?.pools?.[0]
  if (pool?.createdAt) return pool.createdAt // ms
  const ct = payload?.token?.creation?.created_time
  if (ct) return ct < 1e12 ? ct * 1000 : ct // created_time is seconds
  return undefined
}

// These formatters live in lib/pump-api and expect USD numbers / ms timestamps,
// which is exactly what the datastream quote block provides.
import { formatMarketCap, formatVolume, formatTimeAgo } from "@/lib/pump-api"

// Map a datastream payload to the object Echo renders. Cast to TrenchesToken at
// the call site — TS is structural and every required field is set here.
export function datastreamToToken(payload: DatastreamPayload, status: EchoStatus): any {
  const token = payload.token || {}
  const pool = payload.pools?.[0] || {}
  const quote = payload.quote || {}
  const risk = payload.risk || {}
  const txns = pool.txns || {}
  const socials = token.strictSocials || {}
  const dev = risk.dev || {}
  const snipers = risk.snipers || {}
  const insiders = risk.insiders || {}

  const mint = getMint(payload) || ""
  const creationTime = getCreationTime(payload)
  const platform = normalizePlatform(pool.market || token.createdOn)

  return {
    id: mint,
    name: token.name || "",
    symbol: token.symbol || "",
    image:
      token.image ||
      `https://ui-avatars.com/api/?name=${token.symbol || "?"}&background=6366f1&color=fff&size=48`,
    mc: formatMarketCap(quote.marketCapInUsd || 0),
    volume: formatVolume(quote.volumeInUsd || 0),
    fee: (quote.feesInSOL || 0).toFixed(3),
    age: creationTime ? formatTimeAgo(creationTime) : "0s",
    holders: payload.holderCount || 0,
    buys: txns.buys || 0,
    sells: txns.sells || 0,
    status,
    tag: token.name || "",
    contractAddress: mint,
    migratedTokens: status === "migrated" ? 1 : 0,
    devSold: (dev.sellSol || 0) > 0,
    top10Holders: Math.round(risk.top10 || 0),
    snipers: snipers.totalPercentage || 0,
    insiders: insiders.count || 0,
    platform,
    buyAmount: "5.00",

    // Extended fields Echo reads when present.
    coinMint: mint,
    dev: token.creation?.creator || pool.deployer,
    bondingCurveProgress: clampCurve(pool.curvePercentage),
    sniperCount: snipers.count || 0,
    graduationDate: status === "migrated" ? payload.graduation?.status || null : null,
    devHoldingsPercentage: dev.percentage,
    sniperOwnedPercentage: snipers.totalPercentage,
    topHoldersPercentage: risk.top10,
    hasTwitter: nonEmpty(socials.twitter),
    hasTelegram: nonEmpty(socials.telegram),
    hasWebsite: nonEmpty(socials.website),
    twitter: nonEmpty(socials.twitter) ? socials.twitter : null,
    telegram: nonEmpty(socials.telegram) ? socials.telegram : null,
    website: nonEmpty(socials.website) ? socials.website : null,
    creationTime,
  }
}

export function getSolPriceUsd(payload: DatastreamPayload): number | undefined {
  const p = payload?.quote?.solPriceUsd
  return typeof p === "number" && p > 0 ? p : undefined
}
