export type ExecParams = {
  expiresInSec: number
  prio: number
  tip: number
  slippage: number
  mev: boolean
}

export type Automation = {
  id: string
  mode: "copy" | "snipe"
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
      skipPumpfun: boolean
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
