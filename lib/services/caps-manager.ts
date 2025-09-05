/**
 * CapsManager - Safety rails and spending limits management
 * 
 * This service manages spending caps, rate limits, and safety checks
 * to prevent excessive spending and ensure safe automation execution.
 */

import { WalletInfo } from '@/lib/types/automation'

export interface SpendingCap {
  walletId: string
  dailyCap: number
  dailyUsed: number
  perBundleCap: number
  lastReset: number
  transactions: Array<{
    timestamp: number
    amount: number
    type: 'bundle' | 'single'
    automationId?: string
  }>
}

export interface RateLimit {
  walletId: string
  lastExecution: number
  cooldownMs: number
  maxExecutionsPerMinute: number
  executions: number[]
}

export interface SafetyCheck {
  passed: boolean
  warnings: string[]
  errors: string[]
  recommendations: string[]
}

export class CapsManager {
  private spendingCaps: Map<string, SpendingCap> = new Map()
  private rateLimits: Map<string, RateLimit> = new Map()
  private readonly DAILY_RESET_HOUR = 0 // UTC

  /**
   * Initialize spending cap for a wallet
   */
  initializeWalletCap(walletId: string, dailyCap: number, perBundleCap: number): void {
    const now = Date.now()
    const today = this.getTodayTimestamp()
    
    this.spendingCaps.set(walletId, {
      walletId,
      dailyCap,
      dailyUsed: 0,
      perBundleCap,
      lastReset: today,
      transactions: []
    })

    this.rateLimits.set(walletId, {
      walletId,
      lastExecution: 0,
      cooldownMs: 30000, // 30 seconds default
      maxExecutionsPerMinute: 2,
      executions: []
    })
  }

  /**
   * Check if a spending amount is allowed
   */
  checkSpendingCap(walletId: string, amount: number, automationId?: string): SafetyCheck {
    const cap = this.spendingCaps.get(walletId)
    if (!cap) {
      return {
        passed: false,
        warnings: [],
        errors: [`No spending cap configured for wallet ${walletId}`],
        recommendations: ['Initialize wallet cap before executing transactions']
      }
    }

    // Reset daily cap if needed
    this.resetDailyCapIfNeeded(cap)

    const warnings: string[] = []
    const errors: string[] = []
    const recommendations: string[] = []

    // Check per-bundle cap
    if (amount > cap.perBundleCap) {
      errors.push(`Amount ${amount} SOL exceeds per-bundle cap of ${cap.perBundleCap} SOL`)
    }

    // Check daily cap
    if (cap.dailyUsed + amount > cap.dailyCap) {
      errors.push(`Amount would exceed daily cap. Used: ${cap.dailyUsed} SOL, Cap: ${cap.dailyCap} SOL`)
    }

    // Check if approaching daily cap (80% threshold)
    const dailyUsagePercent = (cap.dailyUsed / cap.dailyCap) * 100
    if (dailyUsagePercent > 80) {
      warnings.push(`Daily cap usage at ${dailyUsagePercent.toFixed(1)}%`)
      recommendations.push('Consider increasing daily cap or reducing transaction amounts')
    }

    // Check if approaching per-bundle cap (90% threshold)
    const bundleUsagePercent = (amount / cap.perBundleCap) * 100
    if (bundleUsagePercent > 90) {
      warnings.push(`Per-bundle cap usage at ${bundleUsagePercent.toFixed(1)}%`)
    }

    return {
      passed: errors.length === 0,
      warnings,
      errors,
      recommendations
    }
  }

  /**
   * Reserve spending amount (call before executing)
   */
  reserveSpending(walletId: string, amount: number, automationId?: string): boolean {
    const check = this.checkSpendingCap(walletId, amount, automationId)
    if (!check.passed) {
      return false
    }

    const cap = this.spendingCaps.get(walletId)!
    cap.dailyUsed += amount
    cap.transactions.push({
      timestamp: Date.now(),
      amount,
      type: 'bundle',
      automationId
    })

    return true
  }

  /**
   * Release reserved spending (call if execution fails)
   */
  releaseSpending(walletId: string, amount: number): void {
    const cap = this.spendingCaps.get(walletId)
    if (cap) {
      cap.dailyUsed = Math.max(0, cap.dailyUsed - amount)
      // Remove the most recent transaction of this amount
      const index = cap.transactions.findLastIndex(tx => tx.amount === amount)
      if (index !== -1) {
        cap.transactions.splice(index, 1)
      }
    }
  }

  /**
   * Check rate limiting
   */
  checkRateLimit(walletId: string): SafetyCheck {
    const rateLimit = this.rateLimits.get(walletId)
    if (!rateLimit) {
      return {
        passed: false,
        warnings: [],
        errors: [`No rate limit configured for wallet ${walletId}`],
        recommendations: ['Initialize rate limit before executing transactions']
      }
    }

    const now = Date.now()
    const warnings: string[] = []
    const errors: string[] = []
    const recommendations: string[] = []

    // Check cooldown
    const timeSinceLastExecution = now - rateLimit.lastExecution
    if (timeSinceLastExecution < rateLimit.cooldownMs) {
      const remainingCooldown = rateLimit.cooldownMs - timeSinceLastExecution
      errors.push(`Rate limit cooldown active. Wait ${Math.ceil(remainingCooldown / 1000)} seconds`)
    }

    // Check executions per minute
    const oneMinuteAgo = now - 60000
    const recentExecutions = rateLimit.executions.filter(timestamp => timestamp > oneMinuteAgo)
    if (recentExecutions.length >= rateLimit.maxExecutionsPerMinute) {
      errors.push(`Rate limit exceeded. Max ${rateLimit.maxExecutionsPerMinute} executions per minute`)
    }

    // Warning if approaching rate limit
    if (recentExecutions.length >= rateLimit.maxExecutionsPerMinute * 0.8) {
      warnings.push(`Approaching rate limit: ${recentExecutions.length}/${rateLimit.maxExecutionsPerMinute} executions in last minute`)
    }

    return {
      passed: errors.length === 0,
      warnings,
      errors,
      recommendations
    }
  }

  /**
   * Record execution for rate limiting
   */
  recordExecution(walletId: string): void {
    const rateLimit = this.rateLimits.get(walletId)
    if (rateLimit) {
      const now = Date.now()
      rateLimit.lastExecution = now
      rateLimit.executions.push(now)
      
      // Clean up old executions (older than 1 minute)
      rateLimit.executions = rateLimit.executions.filter(timestamp => timestamp > now - 60000)
    }
  }

  /**
   * Get spending cap information for a wallet
   */
  getSpendingCap(walletId: string): SpendingCap | null {
    const cap = this.spendingCaps.get(walletId)
    if (cap) {
      this.resetDailyCapIfNeeded(cap)
    }
    return cap || null
  }

  /**
   * Get rate limit information for a wallet
   */
  getRateLimit(walletId: string): RateLimit | null {
    return this.rateLimits.get(walletId) || null
  }

  /**
   * Update spending cap
   */
  updateSpendingCap(walletId: string, updates: Partial<Pick<SpendingCap, 'dailyCap' | 'perBundleCap'>>): void {
    const cap = this.spendingCaps.get(walletId)
    if (cap) {
      if (updates.dailyCap !== undefined) {
        cap.dailyCap = updates.dailyCap
      }
      if (updates.perBundleCap !== undefined) {
        cap.perBundleCap = updates.perBundleCap
      }
    }
  }

  /**
   * Update rate limit
   */
  updateRateLimit(walletId: string, updates: Partial<Pick<RateLimit, 'cooldownMs' | 'maxExecutionsPerMinute'>>): void {
    const rateLimit = this.rateLimits.get(walletId)
    if (rateLimit) {
      if (updates.cooldownMs !== undefined) {
        rateLimit.cooldownMs = updates.cooldownMs
      }
      if (updates.maxExecutionsPerMinute !== undefined) {
        rateLimit.maxExecutionsPerMinute = updates.maxExecutionsPerMinute
      }
    }
  }

  /**
   * Comprehensive safety check before execution
   */
  performSafetyCheck(walletId: string, amount: number, automationId?: string): SafetyCheck {
    const spendingCheck = this.checkSpendingCap(walletId, amount, automationId)
    const rateLimitCheck = this.checkRateLimit(walletId)

    return {
      passed: spendingCheck.passed && rateLimitCheck.passed,
      warnings: [...spendingCheck.warnings, ...rateLimitCheck.warnings],
      errors: [...spendingCheck.errors, ...rateLimitCheck.errors],
      recommendations: [...spendingCheck.recommendations, ...rateLimitCheck.recommendations]
    }
  }

  /**
   * Get all wallet caps
   */
  getAllCaps(): SpendingCap[] {
    return Array.from(this.spendingCaps.values()).map(cap => {
      this.resetDailyCapIfNeeded(cap)
      return cap
    })
  }

  /**
   * Reset daily cap if it's a new day
   */
  private resetDailyCapIfNeeded(cap: SpendingCap): void {
    const today = this.getTodayTimestamp()
    if (cap.lastReset < today) {
      cap.dailyUsed = 0
      cap.lastReset = today
      cap.transactions = cap.transactions.filter(tx => tx.timestamp >= today)
    }
  }

  /**
   * Get timestamp for start of today (UTC)
   */
  private getTodayTimestamp(): number {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), this.DAILY_RESET_HOUR, 0, 0, 0)
    return today.getTime()
  }

  /**
   * Clear all caps (for testing)
   */
  clearAllCaps(): void {
    this.spendingCaps.clear()
    this.rateLimits.clear()
  }
}

// Singleton instance
let capsManagerInstance: CapsManager | null = null

export function getCapsManager(): CapsManager {
  if (!capsManagerInstance) {
    capsManagerInstance = new CapsManager()
  }
  return capsManagerInstance
}

// Helper function to initialize caps from wallet info
export function initializeCapsFromWallets(wallets: WalletInfo[]): void {
  const capsManager = getCapsManager()
  
  wallets.forEach(wallet => {
    // Set reasonable defaults based on wallet balance
    const dailyCap = Math.min(wallet.balance * 0.5, 5.0) // 50% of balance, max 5 SOL
    const perBundleCap = Math.min(wallet.balance * 0.1, 1.0) // 10% of balance, max 1 SOL
    
    capsManager.initializeWalletCap(wallet.id, dailyCap, perBundleCap)
  })
}
