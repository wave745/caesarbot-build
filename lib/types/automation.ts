export type ExecParams = {
  expiresInSec: number
  prio: number
  tip: number
  slippage: number
  mev: boolean
}

export type BundleStep =
  | { kind: "approve"; program: "token" | "router" }
  | { kind: "buy"; route: "raydium" | "jupiter" | "pump"; amountSol?: number; pctCap?: number }
  | { kind: "guard"; minOutPct?: number; maxImpactPct?: number; minLp?: number }
  | { kind: "list"; tpPct?: number; slPct?: number; trailingPct?: number }
  | { kind: "sell"; pct?: number; amountSol?: number }

export type BundleTrigger =
  | { mode: "manual" }
  | { mode: "signal"; type: "liquidity_add" | "trading_enabled" | "ticker" | "copy_wallet_buy" | "volume_spike"; args?: Record<string, any> }

export type BundlerAutomation = {
  id: string
  walletId: string
  trigger: BundleTrigger
  recipe: BundleStep[]
  limits: { maxSol: number; retries: number; cooldownSec: number; dailyCap: number }
  exec: ExecParams
  status: "active" | "paused" | "expired"
  createdAt: number
  expiresAt?: number
}

export type PreparedBundle = { txsBase58: string[]; routeMeta?: any }
export type RelayResult = { ok: boolean; bundleId?: string; txids?: string[]; reason?: string }

export type Automation = {
  id: string
  mode: "copy" | "snipe" | "bundler"
  walletId: string
  status: "active" | "paused" | "expired"
  createdAt: number
  expiresAt?: number
  exec: ExecParams
  // copy-only
  copy?: {
    target: string
    limits: { maxSingleBuy: number; maxPerToken: number }
    buy: {
      once: boolean
      skipLaunchpads: boolean
      mcapMin?: number
      mcapMax?: number
      buyPercent?: number
      minBuySize?: number
      mintAuthDisabled?: boolean
      freezeAuthDisabled?: boolean
      devPct?: { min?: number; max?: number }
      top10Pct?: { min?: number; max?: number }
      tokenAgeMin?: number
      tokenAgeMax?: number
      holdersMin?: number
      holdersMax?: number
      minDevFund?: number
      devFundSource?: "any" | "cex" | "dex" | "fresh"
    }
    sell: { copySells: boolean }
  }
  // snipe-only
  snipe?: {
    tickers: { value: string; op: "eq" | "contains" | "regex" }[]
    budgetSol: number
    maxSpendSol: number
    maxSnipes: number
    hasSocials?: boolean
    devParams?: {
      tokensCreated?: { min?: number; max?: number }
      bondedCount?: { min?: number; max?: number }
      creatorBuy?: { min?: number; max?: number }
      bundleBuy?: { min?: number; max?: number }
    }
    blacklist?: string[]
    whitelist?: string[]
  }
  // bundler-only
  bundler?: {
    trigger: BundleTrigger
    recipe: BundleStep[]
    limits: { maxSol: number; retries: number; cooldownSec: number; dailyCap: number }
  }
}

export type AutomationLog = {
  id: string
  automationId: string
  timestamp: number
  type: "trigger" | "gate_check" | "route_build" | "order_sent" | "order_confirmed" | "order_failed" | "auto_pause"
  message: string
  data?: any
}

export type WalletInfo = {
  id: string
  address: string
  balance: number
  name?: string
}

export type TargetWalletStats = {
  address: string
  winrate: number
  pnl7d: number
  avgSize: number
  totalTrades: number
}
