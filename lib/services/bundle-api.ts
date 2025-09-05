/**
 * BundleAPI - Backend API client for bundle operations
 * 
 * This service handles communication with the backend for bundle
 * preparation and relay operations. It provides a clean interface
 * for the frontend to interact with bundle endpoints.
 */

import { PreparedBundle, RelayResult, BundleStep, ExecParams } from '@/lib/types/automation'

export interface BundlePrepareRequest {
  walletId: string
  recipe: BundleStep[]
  exec: ExecParams
  context?: Record<string, any>
}

export interface BundleRelayRequest {
  walletId: string
  signedBase58: string[]
  prio: number
  tip: number
  mev: boolean
}

export interface BundleAutomationRequest {
  walletId: string
  trigger: any
  recipe: BundleStep[]
  limits: {
    maxSol: number
    retries: number
    cooldownSec: number
    dailyCap: number
  }
  exec: ExecParams
}

export class BundleAPI {
  private baseUrl: string

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl
  }

  /**
   * Prepare unsigned transactions for a bundle recipe
   */
  async prepareBundle(request: BundlePrepareRequest): Promise<PreparedBundle> {
    try {
      const response = await fetch(`${this.baseUrl}/bundles/prepare`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to prepare bundle')
      }

      return await response.json()
    } catch (error) {
      console.error('Bundle preparation failed:', error)
      throw error
    }
  }

  /**
   * Relay signed transactions to Jito
   */
  async relayBundle(request: BundleRelayRequest): Promise<RelayResult> {
    try {
      const response = await fetch(`${this.baseUrl}/bundles/relay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to relay bundle')
      }

      return await response.json()
    } catch (error) {
      console.error('Bundle relay failed:', error)
      throw error
    }
  }

  /**
   * Get all bundler automations
   */
  async getBundlers(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/bundlers`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch bundlers')
      }

      return await response.json()
    } catch (error) {
      console.error('Failed to fetch bundlers:', error)
      throw error
    }
  }

  /**
   * Create a new bundler automation
   */
  async createBundler(request: BundleAutomationRequest): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/bundlers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create bundler')
      }

      return await response.json()
    } catch (error) {
      console.error('Failed to create bundler:', error)
      throw error
    }
  }

  /**
   * Update a bundler automation
   */
  async updateBundler(id: string, updates: Partial<BundleAutomationRequest>): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/bundlers/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update bundler')
      }

      return await response.json()
    } catch (error) {
      console.error('Failed to update bundler:', error)
      throw error
    }
  }

  /**
   * Delete a bundler automation
   */
  async deleteBundler(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/bundlers/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to delete bundler')
      }
    } catch (error) {
      console.error('Failed to delete bundler:', error)
      throw error
    }
  }

  /**
   * Get logs for a bundler automation
   */
  async getBundlerLogs(id: string, limit: number = 50): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/bundlers/${id}/logs?limit=${limit}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch bundler logs')
      }

      return await response.json()
    } catch (error) {
      console.error('Failed to fetch bundler logs:', error)
      throw error
    }
  }

  /**
   * Simulate a bundle execution
   */
  async simulateBundle(request: BundlePrepareRequest): Promise<{
    impact: number
    fees: number
    route: any
    warnings: string[]
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/bundles/simulate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to simulate bundle')
      }

      return await response.json()
    } catch (error) {
      console.error('Bundle simulation failed:', error)
      throw error
    }
  }

  /**
   * Get bundle execution statistics
   */
  async getBundleStats(walletId?: string): Promise<{
    totalBundles: number
    successfulBundles: number
    failedBundles: number
    totalFees: number
    avgExecutionTime: number
  }> {
    try {
      const url = walletId 
        ? `${this.baseUrl}/bundles/stats?walletId=${walletId}`
        : `${this.baseUrl}/bundles/stats`
        
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error('Failed to fetch bundle stats')
      }

      return await response.json()
    } catch (error) {
      console.error('Failed to fetch bundle stats:', error)
      throw error
    }
  }
}

// Singleton instance
let bundleAPIInstance: BundleAPI | null = null

export function getBundleAPI(baseUrl?: string): BundleAPI {
  if (!bundleAPIInstance) {
    bundleAPIInstance = new BundleAPI(baseUrl)
  }
  return bundleAPIInstance
}

// Mock implementation for development
export class MockBundleAPI extends BundleAPI {
  async prepareBundle(request: BundlePrepareRequest): Promise<PreparedBundle> {
    // Mock delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Generate mock transactions
    const mockTxs = request.recipe.map((step, index) => {
      const mockTxData = {
        step: index,
        timestamp: Date.now(),
        ...step,
        ...request.context
      }
      return Buffer.from(JSON.stringify(mockTxData)).toString('base64')
    })

    return {
      txsBase58: mockTxs,
      routeMeta: {
        totalSteps: request.recipe.length,
        estimatedGas: request.recipe.length * 5000,
        routes: request.recipe.map(step => ({
          kind: step.kind,
          estimatedTime: 1000
        }))
      }
    }
  }

  async relayBundle(request: BundleRelayRequest): Promise<RelayResult> {
    // Mock delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Simulate occasional failures
    if (Math.random() < 0.1) {
      return {
        ok: false,
        reason: 'Jito relay rejected bundle - tip too low or busy'
      }
    }

    const mockBundleId = `bundle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const mockTxids = request.signedBase58.map((_, index) => 
      `tx_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`
    )

    return {
      ok: true,
      bundleId: mockBundleId,
      txids: mockTxids
    }
  }

  async simulateBundle(request: BundlePrepareRequest): Promise<{
    impact: number
    fees: number
    route: any
    warnings: string[]
  }> {
    // Mock delay
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const mockImpact = Math.random() * 3 + 0.5 // 0.5-3.5%
    const mockFees = request.recipe.length * 0.0005 + request.exec.prio + request.exec.tip
    
    return {
      impact: mockImpact,
      fees: mockFees,
      route: {
        steps: request.recipe.length,
        estimatedTime: request.recipe.length * 1000
      },
      warnings: mockImpact > 2 ? ['High price impact detected'] : []
    }
  }
}

// Export mock instance for development
export const mockBundleAPI = new MockBundleAPI()
