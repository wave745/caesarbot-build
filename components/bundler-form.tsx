"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, GripVertical, Play, AlertTriangle, Package } from "lucide-react"
import { useSniperStore } from "@/stores/sniper"
import { Automation, BundleStep, BundleTrigger } from "@/lib/types/automation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface BundlerFormProps {
  automation?: Automation | null
  onSubmit: (data: any) => void
  isSubmitting: boolean
  onClose: () => void
}

export function BundlerForm({ automation, onSubmit, isSubmitting, onClose }: BundlerFormProps) {
  const { wallets } = useSniperStore()
  
  const [formData, setFormData] = useState({
    walletId: "",
    trigger: { mode: "manual" as const } as BundleTrigger,
    recipe: [] as BundleStep[],
    limits: {
      maxSol: 0.5,
      retries: 3,
      cooldownSec: 30,
      dailyCap: 2.0
    },
    exec: {
      expiresInSec: 30,
      prio: 0.001,
      tip: 0.0001,
      slippage: 5,
      mev: false
    }
  })

  const [simulationResult, setSimulationResult] = useState<{
    impact: number
    fees: number
    status: "idle" | "simulating" | "success" | "error"
  }>({ impact: 0, fees: 0, status: "idle" })

  // Initialize form data
  useEffect(() => {
    if (automation && automation.bundler) {
      setFormData({
        walletId: automation.walletId,
        trigger: automation.bundler.trigger,
        recipe: automation.bundler.recipe,
        limits: automation.bundler.limits,
        exec: automation.exec
      })
    }
  }, [automation])

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    } as any))
  }

  const updateNestedFormData = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent as keyof typeof prev] as any),
        [field]: value
      }
    }))
  }

  const addRecipeStep = (kind: BundleStep["kind"]) => {
    const newStep: BundleStep = (() => {
      switch (kind) {
        case "approve":
          return { kind: "approve", program: "token" }
        case "buy":
          return { kind: "buy", route: "jupiter", amountSol: 0.1 }
        case "guard":
          return { kind: "guard", minOutPct: 95, maxImpactPct: 5, minLp: 1000 }
        case "list":
          return { kind: "list", tpPct: 12, slPct: 6 }
        case "sell":
          return { kind: "sell", pct: 100 }
        default:
          return { kind: "approve", program: "token" }
      }
    })()

    setFormData(prev => ({
      ...prev,
      recipe: [...prev.recipe, newStep]
    }))
  }

  const removeRecipeStep = (index: number) => {
    setFormData(prev => ({
      ...prev,
      recipe: prev.recipe.filter((_, i) => i !== index)
    }))
  }

  const updateRecipeStep = (index: number, updates: Partial<BundleStep>) => {
    setFormData(prev => ({
      ...prev,
      recipe: prev.recipe.map((step, i) => 
        i === index ? { ...step, ...updates } : step
      )
    } as any))
  }

  const simulateBundle = async () => {
    setSimulationResult(prev => ({ ...prev, status: "simulating" }))
    
    // Mock simulation - in real implementation, this would call the backend
    setTimeout(() => {
      const mockImpact = Math.random() * 3 + 0.5 // 0.5-3.5%
      const mockFees = formData.recipe.length * 0.0005 + formData.exec.prio + formData.exec.tip
      
      setSimulationResult({
        impact: mockImpact,
        fees: mockFees,
        status: "success"
      })
    }, 1500)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      bundler: {
        trigger: formData.trigger,
        recipe: formData.recipe,
        limits: formData.limits
      }
    })
  }

  const getStepIcon = (kind: BundleStep["kind"]) => {
    switch (kind) {
      case "approve": return "✓"
      case "buy": return "📈"
      case "guard": return "🛡️"
      case "list": return "📋"
      case "sell": return "📉"
      default: return "•"
    }
  }

  const getStepDescription = (step: BundleStep) => {
    switch (step.kind) {
      case "approve":
        return `Approve ${step.program}`
      case "buy":
        return `Buy via ${step.route}${step.amountSol ? ` (${step.amountSol} SOL)` : ""}`
      case "guard":
        return `Guard (min ${step.minOutPct}%, max ${step.maxImpactPct}% impact)`
      case "list":
        return `List (TP ${step.tpPct}%, SL ${step.slPct}%)`
      case "sell":
        return `Sell ${step.pct}%`
      default:
        return "Unknown step"
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Wallet Selection */}
      <div className="space-y-2">
        <Label style={{ color: "var(--cb-text)" }}>Wallet to Use</Label>
        <Select value={formData.walletId} onValueChange={(value) => updateFormData("walletId", value)}>
          <SelectTrigger className="cb-input cb-hover">
            <SelectValue placeholder="Select wallet" />
          </SelectTrigger>
          <SelectContent>
            {wallets.map((wallet) => (
              <SelectItem key={wallet.id} value={wallet.id}>
                <div className="flex items-center justify-between w-full">
                  <span>{wallet.name || wallet.address.slice(0, 8)}...</span>
                  <span className="text-xs ml-2" style={{ color: "var(--cb-subtext)" }}>
                    {wallet.balance.toFixed(2)} SOL
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Trigger Configuration */}
      <div className="space-y-4">
        <Label style={{ color: "var(--cb-text)" }}>Trigger</Label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => updateFormData("trigger", { mode: "manual" })}
            className={`cb-chip px-3 py-2 text-sm ${
              formData.trigger.mode === "manual" ? 'cb-chip[data-on="true"]' : ''
            }`}
            data-on={formData.trigger.mode === "manual"}
          >
            Manual
          </button>
          <button
            type="button"
            onClick={() => updateFormData("trigger", { mode: "signal", type: "liquidity_add" })}
            className={`cb-chip px-3 py-2 text-sm ${
              formData.trigger.mode === "signal" ? 'cb-chip[data-on="true"]' : ''
            }`}
            data-on={formData.trigger.mode === "signal"}
          >
            Signal
          </button>
        </div>
        
        {formData.trigger.mode === "signal" && (
          <Select 
            value={(formData.trigger as any).type} 
            onValueChange={(value) => updateFormData("trigger", { mode: "signal", type: value as any })}
          >
            <SelectTrigger className="cb-input cb-hover">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="liquidity_add">Liquidity Added</SelectItem>
              <SelectItem value="trading_enabled">Trading Enabled</SelectItem>
              <SelectItem value="ticker">Ticker Match</SelectItem>
              <SelectItem value="copy_wallet_buy">Copy Wallet Buy</SelectItem>
              <SelectItem value="volume_spike">Volume Spike</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Recipe Builder */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label style={{ color: "var(--cb-text)" }}>Bundle Recipe</Label>
          <div className="flex gap-1">
            <Select onValueChange={addRecipeStep}>
              <SelectTrigger className="cb-input cb-hover w-32">
                <SelectValue placeholder="Add step" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="approve">Approve</SelectItem>
                <SelectItem value="buy">Buy</SelectItem>
                <SelectItem value="guard">Guard</SelectItem>
                <SelectItem value="list">List</SelectItem>
                <SelectItem value="sell">Sell</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          {formData.recipe.map((step, index) => (
            <div key={index} className="cb-panel p-3 flex items-center gap-3">
              <GripVertical className="w-4 h-4" style={{ color: "var(--cb-subtext)" }} />
              <span className="text-lg">{getStepIcon(step.kind)}</span>
              <div className="flex-1">
                <div className="text-sm font-medium" style={{ color: "var(--cb-text)" }}>
                  {getStepDescription(step)}
                </div>
                {step.kind === "buy" && (
                  <div className="flex gap-2 mt-1">
                    <Select 
                      value={step.route} 
                      onValueChange={(value) => updateRecipeStep(index, { route: value as any })}
                    >
                      <SelectTrigger className="cb-input cb-hover w-24 h-6 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="raydium">Raydium</SelectItem>
                        <SelectItem value="jupiter">Jupiter</SelectItem>
                        <SelectItem value="pump">Pump</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      placeholder="SOL"
                      value={step.amountSol || ""}
                      onChange={(e) => updateRecipeStep(index, { amountSol: parseFloat(e.target.value) || undefined })}
                      className="cb-input cb-hover w-20 h-6 text-xs"
                    />
                  </div>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeRecipeStep(index)}
                className="p-1 h-6 w-6"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
          
          {formData.recipe.length === 0 && (
            <div className="cb-panel p-6 text-center" style={{ color: "var(--cb-subtext)" }}>
              <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No steps added yet. Click "Add step" to build your bundle recipe.</p>
            </div>
          )}
        </div>
      </div>

      {/* Limits */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label style={{ color: "var(--cb-text)" }}>Max SOL per Bundle</Label>
          <Input
            type="number"
            step="0.1"
            value={formData.limits.maxSol}
            onChange={(e) => updateNestedFormData("limits", "maxSol", parseFloat(e.target.value))}
            className="cb-input cb-hover"
          />
        </div>
        <div className="space-y-2">
          <Label style={{ color: "var(--cb-text)" }}>Daily Cap (SOL)</Label>
          <Input
            type="number"
            step="0.1"
            value={formData.limits.dailyCap}
            onChange={(e) => updateNestedFormData("limits", "dailyCap", parseFloat(e.target.value))}
            className="cb-input cb-hover"
          />
        </div>
        <div className="space-y-2">
          <Label style={{ color: "var(--cb-text)" }}>Retries</Label>
          <Input
            type="number"
            value={formData.limits.retries}
            onChange={(e) => updateNestedFormData("limits", "retries", parseInt(e.target.value))}
            className="cb-input cb-hover"
          />
        </div>
        <div className="space-y-2">
          <Label style={{ color: "var(--cb-text)" }}>Cooldown (sec)</Label>
          <Input
            type="number"
            value={formData.limits.cooldownSec}
            onChange={(e) => updateNestedFormData("limits", "cooldownSec", parseInt(e.target.value))}
            className="cb-input cb-hover"
          />
        </div>
      </div>

      {/* Execution Parameters */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label style={{ color: "var(--cb-text)" }}>Priority Fee (SOL)</Label>
          <Input
            type="number"
            step="0.0001"
            value={formData.exec.prio}
            onChange={(e) => updateNestedFormData("exec", "prio", parseFloat(e.target.value))}
            className="cb-input cb-hover"
          />
        </div>
        <div className="space-y-2">
          <Label style={{ color: "var(--cb-text)" }}>Tip (SOL)</Label>
          <Input
            type="number"
            step="0.0001"
            value={formData.exec.tip}
            onChange={(e) => updateNestedFormData("exec", "tip", parseFloat(e.target.value))}
            className="cb-input cb-hover"
          />
        </div>
        <div className="space-y-2">
          <Label style={{ color: "var(--cb-text)" }}>Slippage (%)</Label>
          <Input
            type="number"
            value={formData.exec.slippage}
            onChange={(e) => updateNestedFormData("exec", "slippage", parseFloat(e.target.value))}
            className="cb-input cb-hover"
          />
        </div>
        <div className="space-y-2">
          <Label style={{ color: "var(--cb-text)" }}>MEV Protection</Label>
          <button
            type="button"
            onClick={() => updateNestedFormData("exec", "mev", !formData.exec.mev)}
            className={`cb-chip px-3 py-2 text-sm w-full ${
              formData.exec.mev ? 'cb-chip[data-on="true"]' : ''
            }`}
            data-on={formData.exec.mev}
          >
            {formData.exec.mev ? "Enabled" : "Disabled"}
          </button>
        </div>
      </div>

      {/* Simulation */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label style={{ color: "var(--cb-text)" }}>Simulation</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={simulateBundle}
            disabled={simulationResult.status === "simulating" || formData.recipe.length === 0}
            className="cb-hover"
          >
            <Play className="w-4 h-4 mr-2" />
            {simulationResult.status === "simulating" ? "Simulating..." : "Simulate"}
          </Button>
        </div>

        {simulationResult.status === "success" && (
          <div className="cb-panel p-4">
            <div className="flex items-center gap-4">
              <Badge className={`cb-badge ${
                simulationResult.impact < 1 ? "cb-ok" : 
                simulationResult.impact < 2 ? "cb-warn" : "cb-err"
              }`}>
                Impact {simulationResult.impact.toFixed(1)}%
              </Badge>
              <Badge className="cb-badge cb-info">
                Fee {simulationResult.fees.toFixed(4)} SOL
              </Badge>
            </div>
          </div>
        )}

        {simulationResult.status === "error" && (
          <div className="cb-panel p-4 border-red-500/30">
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-4 h-4" />
              <span>Simulation failed - check recipe configuration</span>
            </div>
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="flex-1 cb-hover"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="gold"
          disabled={isSubmitting || !formData.walletId || formData.recipe.length === 0}
          className="flex-1"
        >
          {isSubmitting ? "Creating..." : "Create Bundler"}
        </Button>
      </div>
    </form>
  )
}
