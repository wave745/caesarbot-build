/**
 * BundlerIntegration - Main integration service that ties everything together
 * 
 * This service provides a unified interface for executing bundles across
 * Copy, Snipe, and Bundler automations. It handles the complete flow
 * from preparation to execution with proper safety checks.
 */

// Mock Solana types
interface Connection {
  // Mock connection interface - placeholder for Solana connection
  rpcEndpoint?: string;
}

interface PublicKey {
  toString(): string
}

const MockPublicKey = class MockPublicKey implements PublicKey {
  constructor(public address: string) {}
  toString() { return this.address }
}
import { getBundleExecutor, BundleExecutionOptions, BundleExecutionResult } from './bundle-executor'
import { getPortfolioSigner, createMockSigner } from './portfolio-signer'
import { getCapsManager, initializeCapsFromWallets } from './caps-manager'
import { getBundleAPI, mockBundleAPI } from './bundle-api'
import { BundleStep, ExecParams, Automation } from '@/lib/types/automation'
import { WalletInfo } from '@/lib/types/automation'

export interface BundlerIntegrationConfig {
  connection: Connection
  useMockAPI?: boolean
  enableSafetyChecks?: boolean
  maxRetries?: number
}

export interface ExecutionContext {
  automationId: string
  automationType: 'copy' | 'snipe' | 'bundler'
  walletId: string
  tokenAddress?: string
  amount?: number
  metadata?: Record<string, any>
}

export class BundlerIntegration {
  private bundleExecutor: ReturnType<typeof getBundleExecutor>
  private portfolioSigner: ReturnType<typeof getPortfolioSigner>
  private capsManager: ReturnType<typeof getCapsManager>
  private bundleAPI: ReturnType<typeof getBundleAPI>
  private config: BundlerIntegrationConfig

  constructor(config: BundlerIntegrationConfig) {
    this.config = {
      useMockAPI: true,
      enableSafetyChecks: true,
      maxRetries: 3,
      ...config
    }

    this.bundleExecutor = getBundleExecutor(config.connection)
    this.portfolioSigner = getPortfolioSigner(config.connection)
    this.capsManager = getCapsManager()
    this.bundleAPI = this.config.useMockAPI ? mockBundleAPI : getBundleAPI()
  }

  /**
   * Initialize the integration with wallet data
   */
  async initialize(wallets: WalletInfo[]): Promise<void> {
    // Initialize caps from wallet data
    initializeCapsFromWallets(wallets)

    // Register mock signers for development
    if (this.config.useMockAPI) {
      wallets.forEach(wallet => {
        const mockSigner = createMockSigner(wallet.id, new MockPublicKey(wallet.address))
        this.portfolioSigner.registerWalletSigner(wallet.id, mockSigner)
      })
    }

    console.log(`BundlerIntegration initialized with ${wallets.length} wallets`)
  }

  /**
   * Execute a copy trading automation as a bundle
   */
  async executeCopyAsBundle(
    context: ExecutionContext,
    targetWallet: string,
    buyPercent: number,
    exec: ExecParams
  ): Promise<BundleExecutionResult> {
    const recipe: BundleStep[] = [
      { kind: "approve", program: "token" },
      { kind: "buy", route: "jupiter", pctCap: buyPercent },
      { kind: "guard", minOutPct: 95, maxImpactPct: 5 }
    ]

    return this.executeBundle(context, recipe, exec)
  }

  /**
   * Execute a snipe automation as a bundle
   */
  async executeSnipeAsBundle(
    context: ExecutionContext,
    tokenAddress: string,
    amount: number,
    exec: ExecParams
  ): Promise<BundleExecutionResult> {
    const recipe: BundleStep[] = [
      { kind: "approve", program: "token" },
      { kind: "buy", route: "raydium", amountSol: amount },
      { kind: "guard", minOutPct: 98, maxImpactPct: 3, minLp: 1000 }
    ]

    return this.executeBundle(context, recipe, exec, { tokenAddress })
  }

  /**
   * Execute a bundler automation
   */
  async executeBundlerAutomation(
    context: ExecutionContext,
    recipe: BundleStep[],
    exec: ExecParams
  ): Promise<BundleExecutionResult> {
    return this.executeBundle(context, recipe, exec)
  }

  /**
   * Core bundle execution method
   */
  private async executeBundle(
    context: ExecutionContext,
    recipe: BundleStep[],
    exec: ExecParams,
    additionalContext: Record<string, any> = {}
  ): Promise<BundleExecutionResult> {
    try {
      // Step 1: Safety checks
      if (this.config.enableSafetyChecks) {
        const estimatedAmount = this.estimateBundleAmount(recipe, context.amount || 0)
        const safetyCheck = this.capsManager.performSafetyCheck(
          context.walletId,
          estimatedAmount,
          context.automationId
        )

        if (!safetyCheck.passed) {
          return {
            success: false,
            error: `Safety check failed: ${safetyCheck.errors.join(', ')}`,
            details: {
              chunksProcessed: 0,
              totalTxs: 0,
              failedChunks: 0
            }
          }
        }

        // Reserve spending
        if (!this.capsManager.reserveSpending(context.walletId, estimatedAmount, context.automationId)) {
          return {
            success: false,
            error: 'Failed to reserve spending amount',
            details: {
              chunksProcessed: 0,
              totalTxs: 0,
              failedChunks: 0
            }
          }
        }
      }

      // Step 2: Execute bundle
      const executionOptions: BundleExecutionOptions = {
        walletId: context.walletId,
        recipe,
        exec,
        context: {
          ...additionalContext,
          automationId: context.automationId,
          automationType: context.automationType,
          tokenAddress: context.tokenAddress,
          amount: context.amount,
          ...context.metadata
        }
      }

      const result = await this.bundleExecutor.executeBundle(executionOptions)

      // Step 3: Record execution for rate limiting
      if (this.config.enableSafetyChecks) {
        this.capsManager.recordExecution(context.walletId)
      }

      // Step 4: Handle failures
      if (!result.success && this.config.enableSafetyChecks) {
        const estimatedAmount = this.estimateBundleAmount(recipe, context.amount || 0)
        this.capsManager.releaseSpending(context.walletId, estimatedAmount)
      }

      return result

    } catch (error) {
      // Release reserved spending on error
      if (this.config.enableSafetyChecks) {
        const estimatedAmount = this.estimateBundleAmount(recipe, context.amount || 0)
        this.capsManager.releaseSpending(context.walletId, estimatedAmount)
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown execution error',
        details: {
          chunksProcessed: 0,
          totalTxs: 0,
          failedChunks: 0
        }
      }
    }
  }

  /**
   * Simulate bundle execution
   */
  async simulateBundle(
    context: ExecutionContext,
    recipe: BundleStep[],
    exec: ExecParams
  ): Promise<{
    impact: number
    fees: number
    warnings: string[]
    safetyCheck: any
  }> {
    try {
      // Get simulation from API
      const simulation = await this.bundleAPI.simulateBundle({
        walletId: context.walletId,
        recipe,
        exec,
        context: {
          automationId: context.automationId,
          automationType: context.automationType,
          tokenAddress: context.tokenAddress,
          amount: context.amount,
          ...context.metadata
        }
      })

      // Perform safety check
      const estimatedAmount = this.estimateBundleAmount(recipe, context.amount || 0)
      const safetyCheck = this.capsManager.performSafetyCheck(
        context.walletId,
        estimatedAmount,
        context.automationId
      )

      return {
        impact: simulation.impact,
        fees: simulation.fees,
        warnings: [...simulation.warnings, ...safetyCheck.warnings],
        safetyCheck
      }

    } catch (error) {
      throw new Error(`Simulation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get spending cap information for a wallet
   */
  getWalletCap(walletId: string) {
    return this.capsManager.getSpendingCap(walletId)
  }

  /**
   * Get rate limit information for a wallet
   */
  getWalletRateLimit(walletId: string) {
    return this.capsManager.getRateLimit(walletId)
  }

  /**
   * Update spending caps for a wallet
   */
  updateWalletCaps(walletId: string, caps: { dailyCap?: number; perBundleCap?: number }) {
    this.capsManager.updateSpendingCap(walletId, caps)
  }

  /**
   * Update rate limits for a wallet
   */
  updateWalletRateLimit(walletId: string, limits: { cooldownMs?: number; maxExecutionsPerMinute?: number }) {
    this.capsManager.updateRateLimit(walletId, limits)
  }

  /**
   * Get integration statistics
   */
  getStats() {
    return {
      bundleExecutor: this.bundleExecutor.getStats(),
      registeredWallets: this.portfolioSigner.getRegisteredWallets().length,
      capsConfigured: this.capsManager.getAllCaps().length,
      config: this.config
    }
  }

  /**
   * Estimate the SOL amount for a bundle recipe
   */
  private estimateBundleAmount(recipe: BundleStep[], baseAmount: number): number {
    let totalAmount = baseAmount

    recipe.forEach(step => {
      switch (step.kind) {
        case 'buy':
          if (step.amountSol) {
            totalAmount += step.amountSol
          } else if (step.pctCap) {
            // Estimate based on percentage of wallet balance
            totalAmount += baseAmount * (step.pctCap / 100)
          }
          break
        case 'approve':
          // Approve transactions are typically free
          break
        case 'guard':
        case 'list':
        case 'sell':
          // These don't add to the spending amount
          break
      }
    })

    return totalAmount
  }
}

// Singleton instance
let bundlerIntegrationInstance: BundlerIntegration | null = null

export function getBundlerIntegration(config?: BundlerIntegrationConfig): BundlerIntegration {
  if (!bundlerIntegrationInstance && config) {
    bundlerIntegrationInstance = new BundlerIntegration(config)
  }
  if (!bundlerIntegrationInstance) {
    throw new Error('BundlerIntegration must be initialized with config')
  }
  return bundlerIntegrationInstance
}

export function initializeBundlerIntegration(config: BundlerIntegrationConfig): BundlerIntegration {
  bundlerIntegrationInstance = new BundlerIntegration(config)
  return bundlerIntegrationInstance
}
