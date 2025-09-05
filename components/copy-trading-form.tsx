"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, ExternalLink } from "lucide-react"
import { useSniperStore } from "@/stores/sniper"
import { AutomationAPI } from "@/lib/services/automation-api"
import { Automation } from "@/lib/types/automation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CopyTradingFormProps {
  automation?: Automation | null
  onSubmit: (data: any) => void
  isSubmitting: boolean
  onClose: () => void
}

export function CopyTradingForm({ automation, onSubmit, isSubmitting, onClose }: CopyTradingFormProps) {
  const { wallets, selectedWallet, setSelectedWallet } = useSniperStore()
  
  const [formData, setFormData] = useState({
    walletId: "",
    target: "",
    limits: {
      maxSingleBuy: 0.25,
      maxPerToken: 1.0
    },
    buy: {
      once: true,
      skipPumpfun: true,
      mcapMin: 5000,
      mcapMax: undefined as number | undefined,
      buyPercent: 50,
      minBuySize: 0.01,
      mintAuthDisabled: true,
      freezeAuthDisabled: true,
      devPct: { min: undefined as number | undefined, max: 5 },
      top10Pct: { min: undefined as number | undefined, max: 25 },
      tokenAgeMin: 3,
      tokenAgeMax: undefined as number | undefined,
      holdersMin: 50,
      holdersMax: undefined as number | undefined,
      minDevFund: 0.1,
      devFundSource: "any" as "any" | "cex" | "dex" | "fresh"
    },
    sell: {
      copySells: true
    },
    exec: {
      expiresInSec: 86400,
      prio: 0.001,
      tip: 0.002,
      slippage: 1.0,
      mev: true
    },
    expiresAt: undefined as number | undefined
  })

  const [targetStats, setTargetStats] = useState<any>(null)
  const [isLoadingStats, setIsLoadingStats] = useState(false)

  // Initialize form with automation data
  useEffect(() => {
    if (automation && automation.copy) {
      setFormData({
        walletId: automation.walletId,
        target: automation.copy.target,
        limits: automation.copy.limits,
        buy: automation.copy.buy,
        sell: automation.copy.sell,
        exec: automation.exec,
        expiresAt: automation.expiresAt
      })
    }
  }, [automation])

  // Load target wallet stats
  const loadTargetStats = async (address: string) => {
    if (!address) return
    
    setIsLoadingStats(true)
    try {
      const stats = await AutomationAPI.getTargetWalletStats(address)
      setTargetStats(stats)
    } catch (error) {
      console.error("Failed to load target stats:", error)
      setTargetStats(null)
    } finally {
      setIsLoadingStats(false)
    }
  }

  // Load stats when target address changes
  useEffect(() => {
    if (formData.target) {
      loadTargetStats(formData.target)
    }
  }, [formData.target])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const updateFormData = (path: string, value: any) => {
    setFormData(prev => {
      const keys = path.split('.')
      const newData = { ...prev }
      let current = newData
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]] = { ...current[keys[i]] }
      }
      
      current[keys[keys.length - 1]] = value
      return newData
    })
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

      {/* Target Wallet */}
      <div className="space-y-2">
        <Label style={{ color: "var(--cb-text)" }}>Target Wallet Address</Label>
        <div className="flex gap-2">
          <Input
            value={formData.target}
            onChange={(e) => updateFormData("target", e.target.value)}
            placeholder="Enter wallet address to copy"
            className="cb-input cb-hover flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => loadTargetStats(formData.target)}
            disabled={!formData.target || isLoadingStats}
            className="cb-hover"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Target Stats */}
        {targetStats && (
          <div className="cb-panel p-3 mt-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div style={{ color: "var(--cb-subtext)" }}>Winrate</div>
                <div style={{ color: "var(--cb-text)" }}>{(targetStats.winrate * 100).toFixed(1)}%</div>
              </div>
              <div>
                <div style={{ color: "var(--cb-subtext)" }}>7d PnL</div>
                <div style={{ color: targetStats.pnl7d >= 0 ? "var(--cb-ok)" : "var(--cb-err)" }}>
                  {targetStats.pnl7d >= 0 ? "+" : ""}{targetStats.pnl7d.toFixed(2)} SOL
                </div>
              </div>
              <div>
                <div style={{ color: "var(--cb-subtext)" }}>Avg Size</div>
                <div style={{ color: "var(--cb-text)" }}>{targetStats.avgSize.toFixed(2)} SOL</div>
              </div>
              <div>
                <div style={{ color: "var(--cb-subtext)" }}>Total Trades</div>
                <div style={{ color: "var(--cb-text)" }}>{targetStats.totalTrades}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Limits */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium" style={{ color: "var(--cb-text)" }}>Limits</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label style={{ color: "var(--cb-text)" }}>Max Single Buy (SOL)</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.limits.maxSingleBuy}
              onChange={(e) => updateFormData("limits.maxSingleBuy", parseFloat(e.target.value))}
              className="cb-input cb-hover"
            />
          </div>
          
          <div className="space-y-2">
            <Label style={{ color: "var(--cb-text)" }}>Max Per Token (SOL)</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.limits.maxPerToken}
              onChange={(e) => updateFormData("limits.maxPerToken", parseFloat(e.target.value))}
              className="cb-input cb-hover"
            />
          </div>
        </div>
      </div>

      {/* Buy Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium" style={{ color: "var(--cb-text)" }}>Buy Settings</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label style={{ color: "var(--cb-text)" }}>Buy % of Source</Label>
            <Input
              type="number"
              min="1"
              max="100"
              value={formData.buy.buyPercent}
              onChange={(e) => updateFormData("buy.buyPercent", parseInt(e.target.value))}
              className="cb-input cb-hover"
            />
          </div>
          
          <div className="space-y-2">
            <Label style={{ color: "var(--cb-text)" }}>Min Buy Size (SOL)</Label>
            <Input
              type="number"
              step="0.001"
              value={formData.buy.minBuySize}
              onChange={(e) => updateFormData("buy.minBuySize", parseFloat(e.target.value))}
              className="cb-input cb-hover"
            />
          </div>
          
          <div className="space-y-2">
            <Label style={{ color: "var(--cb-text)" }}>MCap Min ($)</Label>
            <Input
              type="number"
              value={formData.buy.mcapMin}
              onChange={(e) => updateFormData("buy.mcapMin", parseInt(e.target.value))}
              className="cb-input cb-hover"
            />
          </div>
          
          <div className="space-y-2">
            <Label style={{ color: "var(--cb-text)" }}>MCap Max ($)</Label>
            <Input
              type="number"
              value={formData.buy.mcapMax || ""}
              onChange={(e) => updateFormData("buy.mcapMax", e.target.value ? parseInt(e.target.value) : undefined)}
              className="cb-input cb-hover"
              placeholder="No limit"
            />
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label style={{ color: "var(--cb-text)" }}>Buy Once</Label>
            <Switch
              checked={formData.buy.once}
              onCheckedChange={(checked) => updateFormData("buy.once", checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label style={{ color: "var(--cb-text)" }}>Skip Pumpfun</Label>
            <Switch
              checked={formData.buy.skipPumpfun}
              onCheckedChange={(checked) => updateFormData("buy.skipPumpfun", checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label style={{ color: "var(--cb-text)" }}>Mint Auth Disabled</Label>
            <Switch
              checked={formData.buy.mintAuthDisabled}
              onCheckedChange={(checked) => updateFormData("buy.mintAuthDisabled", checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label style={{ color: "var(--cb-text)" }}>Freeze Auth Disabled</Label>
            <Switch
              checked={formData.buy.freezeAuthDisabled}
              onCheckedChange={(checked) => updateFormData("buy.freezeAuthDisabled", checked)}
            />
          </div>
        </div>
      </div>

      {/* Safety Gates */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium" style={{ color: "var(--cb-text)" }}>Safety Gates</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label style={{ color: "var(--cb-text)" }}>Dev % Max</Label>
            <Input
              type="number"
              min="0"
              max="100"
              value={formData.buy.devPct.max || ""}
              onChange={(e) => updateFormData("buy.devPct.max", e.target.value ? parseInt(e.target.value) : undefined)}
              className="cb-input cb-hover"
              placeholder="No limit"
            />
          </div>
          
          <div className="space-y-2">
            <Label style={{ color: "var(--cb-text)" }}>Top10 % Max</Label>
            <Input
              type="number"
              min="0"
              max="100"
              value={formData.buy.top10Pct.max || ""}
              onChange={(e) => updateFormData("buy.top10Pct.max", e.target.value ? parseInt(e.target.value) : undefined)}
              className="cb-input cb-hover"
              placeholder="No limit"
            />
          </div>
          
          <div className="space-y-2">
            <Label style={{ color: "var(--cb-text)" }}>Token Age Min (min)</Label>
            <Input
              type="number"
              min="0"
              value={formData.buy.tokenAgeMin}
              onChange={(e) => updateFormData("buy.tokenAgeMin", parseInt(e.target.value))}
              className="cb-input cb-hover"
            />
          </div>
          
          <div className="space-y-2">
            <Label style={{ color: "var(--cb-text)" }}>Holders Min</Label>
            <Input
              type="number"
              min="0"
              value={formData.buy.holdersMin}
              onChange={(e) => updateFormData("buy.holdersMin", parseInt(e.target.value))}
              className="cb-input cb-hover"
            />
          </div>
        </div>
      </div>

      {/* Dev Funding */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium" style={{ color: "var(--cb-text)" }}>Dev Funding</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label style={{ color: "var(--cb-text)" }}>Min Dev Fund (SOL)</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.buy.minDevFund}
              onChange={(e) => updateFormData("buy.minDevFund", parseFloat(e.target.value))}
              className="cb-input cb-hover"
            />
          </div>
          
          <div className="space-y-2">
            <Label style={{ color: "var(--cb-text)" }}>Fund Source</Label>
            <Select 
              value={formData.buy.devFundSource} 
              onValueChange={(value: any) => updateFormData("buy.devFundSource", value)}
            >
              <SelectTrigger className="cb-input cb-hover">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="cex">CEX</SelectItem>
                <SelectItem value="dex">DEX</SelectItem>
                <SelectItem value="fresh">Fresh</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Sell Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium" style={{ color: "var(--cb-text)" }}>Sell Settings</h3>
        
        <div className="flex items-center justify-between">
          <Label style={{ color: "var(--cb-text)" }}>Copy Sells</Label>
          <Switch
            checked={formData.sell.copySells}
            onCheckedChange={(checked) => updateFormData("sell.copySells", checked)}
          />
        </div>
      </div>

      {/* Execution Parameters */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium" style={{ color: "var(--cb-text)" }}>Execution Parameters</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label style={{ color: "var(--cb-text)" }}>Expires (seconds)</Label>
            <Input
              type="number"
              value={formData.exec.expiresInSec}
              onChange={(e) => updateFormData("exec.expiresInSec", parseInt(e.target.value))}
              className="cb-input cb-hover"
            />
          </div>
          
          <div className="space-y-2">
            <Label style={{ color: "var(--cb-text)" }}>Priority Fee (SOL)</Label>
            <Input
              type="number"
              step="0.001"
              value={formData.exec.prio}
              onChange={(e) => updateFormData("exec.prio", parseFloat(e.target.value))}
              className="cb-input cb-hover"
            />
          </div>
          
          <div className="space-y-2">
            <Label style={{ color: "var(--cb-text)" }}>Tip (SOL)</Label>
            <Input
              type="number"
              step="0.001"
              value={formData.exec.tip}
              onChange={(e) => updateFormData("exec.tip", parseFloat(e.target.value))}
              className="cb-input cb-hover"
            />
          </div>
          
          <div className="space-y-2">
            <Label style={{ color: "var(--cb-text)" }}>Slippage (%)</Label>
            <Input
              type="number"
              step="0.1"
              value={formData.exec.slippage}
              onChange={(e) => updateFormData("exec.slippage", parseFloat(e.target.value))}
              className="cb-input cb-hover"
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <Label style={{ color: "var(--cb-text)" }}>MEV Protection</Label>
          <Switch
            checked={formData.exec.mev}
            onCheckedChange={(checked) => updateFormData("exec.mev", checked)}
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-3 pt-6 border-t" style={{ borderColor: "var(--cb-border)" }}>
        <Button
          type="button"
          variant="dark"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          variant="gold"
        >
          {isSubmitting ? "Saving..." : "Save Automation"}
        </Button>
      </div>
    </form>
  )
}
