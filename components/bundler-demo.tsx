"use client"

import { useState, useEffect } from "react"
import { Play, Package, Shield, Zap, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { initializeBundlerIntegration, getBundlerIntegration } from "@/lib/services/bundler-integration"
// Mock Connection type
interface Connection {
  // Mock connection interface
}

const MockConnection = class MockConnection implements Connection {}
import { BundleStep, ExecParams } from "@/lib/types/automation"

export function BundlerDemo() {
  const [isInitialized, setIsInitialized] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionResult, setExecutionResult] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)

  // Initialize the bundler integration
  useEffect(() => {
    const init = async () => {
      try {
        // Mock connection for demo
        const connection = new MockConnection()
        
        const integration = initializeBundlerIntegration({
          connection,
          useMockAPI: true,
          enableSafetyChecks: true
        })

        // Mock wallet data
        const mockWallets = [
          {
            id: "wallet_1",
            address: "DemoWallet1Address123456789",
            balance: 2.5,
            name: "Demo Wallet 1"
          },
          {
            id: "wallet_2", 
            address: "DemoWallet2Address987654321",
            balance: 1.8,
            name: "Demo Wallet 2"
          }
        ]

        await integration.initialize(mockWallets)
        setIsInitialized(true)
        setStats(integration.getStats())
      } catch (error) {
        console.error("Failed to initialize bundler integration:", error)
      }
    }

    init()
  }, [])

  const executeDemoBundle = async () => {
    if (!isInitialized) return

    setIsExecuting(true)
    setExecutionResult(null)

    try {
      const integration = getBundlerIntegration()
      
      // Demo recipe: Approve → Buy → Guard
      const recipe: BundleStep[] = [
        { kind: "approve", program: "token" },
        { kind: "buy", route: "jupiter", amountSol: 0.1 },
        { kind: "guard", minOutPct: 95, maxImpactPct: 5, minLp: 1000 }
      ]

      const exec: ExecParams = {
        expiresInSec: 30,
        prio: 0.001,
        tip: 0.0001,
        slippage: 5,
        mev: false
      }

      const context = {
        automationId: "demo_bundler_1",
        automationType: "bundler" as const,
        walletId: "wallet_1",
        tokenAddress: "DemoTokenAddress123456789",
        amount: 0.1,
        metadata: { demo: true }
      }

      const result = await integration.executeBundlerAutomation(context, recipe, exec)
      setExecutionResult(result)
      setStats(integration.getStats())

    } catch (error) {
      setExecutionResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      })
    } finally {
      setIsExecuting(false)
    }
  }

  const simulateDemoBundle = async () => {
    if (!isInitialized) return

    try {
      const integration = getBundlerIntegration()
      
      const recipe: BundleStep[] = [
        { kind: "approve", program: "token" },
        { kind: "buy", route: "jupiter", amountSol: 0.1 },
        { kind: "guard", minOutPct: 95, maxImpactPct: 5, minLp: 1000 }
      ]

      const exec: ExecParams = {
        expiresInSec: 30,
        prio: 0.001,
        tip: 0.0001,
        slippage: 5,
        mev: false
      }

      const context = {
        automationId: "demo_simulation",
        automationType: "bundler" as const,
        walletId: "wallet_1",
        tokenAddress: "DemoTokenAddress123456789",
        amount: 0.1,
        metadata: { demo: true }
      }

      const simulation = await integration.simulateBundle(context, recipe, exec)
      setExecutionResult({
        success: true,
        simulation,
        type: "simulation"
      })

    } catch (error) {
      setExecutionResult({
        success: false,
        error: error instanceof Error ? error.message : "Simulation failed"
      })
    }
  }

  if (!isInitialized) {
    return (
      <div className="cb-panel p-6 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p style={{ color: "var(--cb-text)" }}>Initializing Bundler Integration...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="cb-panel p-6">
        <div className="flex items-center gap-3 mb-4">
          <Package className="w-6 h-6" style={{ color: "var(--cb-gold)" }} />
          <h2 className="text-xl font-semibold" style={{ color: "var(--cb-text)" }}>
            Bundler Integration Demo
          </h2>
        </div>
        <p style={{ color: "var(--cb-subtext)" }}>
          This demo shows the complete bundler integration pipeline: Portfolio signer, 
          safety caps, bundle executor, and Jito relay.
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="cb-panel p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4" style={{ color: "var(--cb-info)" }} />
              <span className="text-sm font-medium" style={{ color: "var(--cb-text)" }}>
                Safety Caps
              </span>
            </div>
            <p className="text-2xl font-bold" style={{ color: "var(--cb-gold)" }}>
              {stats.capsConfigured}
            </p>
            <p className="text-xs" style={{ color: "var(--cb-subtext)" }}>
              Wallets configured
            </p>
          </Card>

          <Card className="cb-panel p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4" style={{ color: "var(--cb-ok)" }} />
              <span className="text-sm font-medium" style={{ color: "var(--cb-text)" }}>
                Registered Wallets
              </span>
            </div>
            <p className="text-2xl font-bold" style={{ color: "var(--cb-gold)" }}>
              {stats.registeredWallets}
            </p>
            <p className="text-xs" style={{ color: "var(--cb-subtext)" }}>
              With signers
            </p>
          </Card>

          <Card className="cb-panel p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4" style={{ color: "var(--cb-warn)" }} />
              <span className="text-sm font-medium" style={{ color: "var(--cb-text)" }}>
                Max Bundle Size
              </span>
            </div>
            <p className="text-2xl font-bold" style={{ color: "var(--cb-gold)" }}>
              {stats.bundleExecutor.maxTxsPerBundle}
            </p>
            <p className="text-xs" style={{ color: "var(--cb-subtext)" }}>
              Transactions
            </p>
          </Card>
        </div>
      )}

      {/* Demo Controls */}
      <div className="cb-panel p-6">
        <h3 className="text-lg font-medium mb-4" style={{ color: "var(--cb-text)" }}>
          Demo Controls
        </h3>
        
        <div className="flex gap-3 mb-4">
          <Button
            onClick={simulateDemoBundle}
            variant="outline"
            className="cb-hover"
            disabled={isExecuting}
          >
            <Play className="w-4 h-4 mr-2" />
            Simulate Bundle
          </Button>
          
          <Button
            onClick={executeDemoBundle}
            variant="gold"
            disabled={isExecuting}
          >
            <Package className="w-4 h-4 mr-2" />
            {isExecuting ? "Executing..." : "Execute Bundle"}
          </Button>
        </div>

        <div className="text-sm" style={{ color: "var(--cb-subtext)" }}>
          <p><strong>Recipe:</strong> Approve → Buy (0.1 SOL via Jupiter) → Guard (95% min out, 5% max impact)</p>
          <p><strong>Safety:</strong> Caps enabled, rate limiting active, mock signing</p>
        </div>
      </div>

      {/* Results */}
      {executionResult && (
        <div className="cb-panel p-6">
          <h3 className="text-lg font-medium mb-4" style={{ color: "var(--cb-text)" }}>
            Execution Result
          </h3>
          
          {executionResult.type === "simulation" ? (
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <Badge className={`cb-badge ${
                  executionResult.simulation.impact < 1 ? "cb-ok" : 
                  executionResult.simulation.impact < 2 ? "cb-warn" : "cb-err"
                }`}>
                  Impact {executionResult.simulation.impact.toFixed(1)}%
                </Badge>
                <Badge className="cb-badge cb-info">
                  Fee {executionResult.simulation.fees.toFixed(4)} SOL
                </Badge>
              </div>
              
              {executionResult.simulation.warnings.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2" style={{ color: "var(--cb-warn)" }}>
                    Warnings:
                  </p>
                  <ul className="text-sm space-y-1" style={{ color: "var(--cb-subtext)" }}>
                    {executionResult.simulation.warnings.map((warning: string, index: number) => (
                      <li key={index}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge className={`cb-badge ${executionResult.success ? "cb-ok" : "cb-err"}`}>
                  {executionResult.success ? "Success" : "Failed"}
                </Badge>
                {executionResult.bundleIds && (
                  <Badge className="cb-badge cb-info">
                    {executionResult.bundleIds.length} Bundle(s)
                  </Badge>
                )}
              </div>
              
              {executionResult.success && executionResult.details && (
                <div className="text-sm" style={{ color: "var(--cb-subtext)" }}>
                  <p>Chunks: {executionResult.details.chunksProcessed}</p>
                  <p>Total TXs: {executionResult.details.totalTxs}</p>
                  <p>Failed: {executionResult.details.failedChunks}</p>
                  {executionResult.totalFees && (
                    <p>Total Fees: {executionResult.totalFees.toFixed(4)} SOL</p>
                  )}
                </div>
              )}
              
              {!executionResult.success && executionResult.error && (
                <p className="text-sm" style={{ color: "var(--cb-err)" }}>
                  Error: {executionResult.error}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
