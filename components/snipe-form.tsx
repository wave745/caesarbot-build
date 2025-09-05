"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2 } from "lucide-react"
import { useSniperStore } from "@/stores/sniper"
import { Automation } from "@/lib/types/automation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface SnipeFormProps {
  automation?: Automation | null
  onSubmit: (data: any) => void
  isSubmitting: boolean
  onClose: () => void
}

export function SnipeForm({ automation, onSubmit, isSubmitting, onClose }: SnipeFormProps) {
  const { wallets } = useSniperStore()
  
  const [formData, setFormData] = useState({
    walletId: "",
    tickers: [{ value: "", op: "contains" as "eq" | "contains" | "regex" }],
    budgetSol: 1.0,
    maxSpendSol: 5.0,
    maxSnipes: 10,
    hasSocials: false,
    devParams: {
      tokensCreated: { min: undefined as number | undefined, max: undefined as number | undefined },
      bondedCount: { min: undefined as number | undefined, max: undefined as number | undefined },
      creatorBuy: { min: undefined as number | undefined, max: undefined as number | undefined },
      bundleBuy: { min: undefined as number | undefined, max: undefined as number | undefined }
    },
    blacklist: [] as string[],
    whitelist: [] as string[],
    exec: {
      expiresInSec: 86400,
      prio: 0.001,
      tip: 0.002,
      slippage: 1.0,
      mev: true
    },
    execAsBundle: false,
    expiresAt: undefined as number | undefined
  })

  const [newTicker, setNewTicker] = useState({ value: "", op: "contains" as "eq" | "contains" | "regex" })
  const [newBlacklistItem, setNewBlacklistItem] = useState("")
  const [newWhitelistItem, setNewWhitelistItem] = useState("")

  // Initialize form with automation data
  useEffect(() => {
    if (automation && automation.snipe) {
      setFormData({
        walletId: automation.walletId,
        tickers: automation.snipe.tickers,
        budgetSol: automation.snipe.budgetSol,
        maxSpendSol: automation.snipe.maxSpendSol,
        maxSnipes: automation.snipe.maxSnipes,
        hasSocials: automation.snipe.hasSocials || false,
        devParams: {
          tokensCreated: { min: undefined as number | undefined, max: undefined as number | undefined },
          bondedCount: { min: undefined as number | undefined, max: undefined as number | undefined },
          creatorBuy: { min: undefined as number | undefined, max: undefined as number | undefined },
          bundleBuy: { min: undefined as number | undefined, max: undefined as number | undefined },
          ...automation.snipe.devParams
        } as any,
        blacklist: automation.snipe.blacklist || [],
        whitelist: automation.snipe.whitelist || [],
        exec: automation.exec,
        execAsBundle: false,
        expiresAt: automation.expiresAt
      })
    }
  }, [automation])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const updateFormData = (path: string, value: any) => {
    setFormData(prev => {
      const keys = path.split('.')
      const newData = { ...prev }
      let current: any = newData
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]] = { ...current[keys[i]] }
      }
      
      current[keys[keys.length - 1]] = value
      return newData as any
    })
  }

  const addTicker = () => {
    if (newTicker.value.trim()) {
      setFormData(prev => ({
        ...prev,
        tickers: [...prev.tickers, { ...newTicker }]
      }))
      setNewTicker({ value: "", op: "contains" })
    }
  }

  const removeTicker = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tickers: prev.tickers.filter((_, i) => i !== index)
    }))
  }

  const addBlacklistItem = () => {
    if (newBlacklistItem.trim()) {
      setFormData(prev => ({
        ...prev,
        blacklist: [...prev.blacklist, newBlacklistItem.trim()]
      }))
      setNewBlacklistItem("")
    }
  }

  const removeBlacklistItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      blacklist: prev.blacklist.filter((_, i) => i !== index)
    }))
  }

  const addWhitelistItem = () => {
    if (newWhitelistItem.trim()) {
      setFormData(prev => ({
        ...prev,
        whitelist: [...prev.whitelist, newWhitelistItem.trim()]
      }))
      setNewWhitelistItem("")
    }
  }

  const removeWhitelistItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      whitelist: prev.whitelist.filter((_, i) => i !== index)
    }))
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

      {/* Ticker Filters */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium" style={{ color: "var(--cb-text)" }}>Ticker Filters</h3>
        
        {/* Existing tickers */}
        {formData.tickers.map((ticker, index) => (
          <div key={index} className="flex items-center gap-2 p-3 cb-panel">
            <Input
              value={ticker.value}
              onChange={(e) => {
                const newTickers = [...formData.tickers]
                newTickers[index].value = e.target.value
                updateFormData("tickers", newTickers)
              }}
              placeholder="Ticker pattern"
              className="cb-input cb-hover flex-1"
            />
            <Select
              value={ticker.op}
              onValueChange={(value: "eq" | "contains" | "regex") => {
                const newTickers = [...formData.tickers]
                newTickers[index].op = value
                updateFormData("tickers", newTickers)
              }}
            >
              <SelectTrigger className="cb-input cb-hover w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="eq">Equals</SelectItem>
                <SelectItem value="contains">Contains</SelectItem>
                <SelectItem value="regex">Regex</SelectItem>
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeTicker(index)}
              className="p-1 h-8 w-8 text-red-400 hover:text-red-300"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        ))}
        
        {/* Add new ticker */}
        <div className="flex items-center gap-2">
          <Input
            value={newTicker.value}
            onChange={(e) => setNewTicker(prev => ({ ...prev, value: e.target.value }))}
            placeholder="Add ticker filter"
            className="cb-input cb-hover flex-1"
          />
          <Select
            value={newTicker.op}
            onValueChange={(value: "eq" | "contains" | "regex") => setNewTicker(prev => ({ ...prev, op: value }))}
          >
            <SelectTrigger className="cb-input cb-hover w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="eq">Equals</SelectItem>
              <SelectItem value="contains">Contains</SelectItem>
              <SelectItem value="regex">Regex</SelectItem>
            </SelectContent>
          </Select>
          <Button
            type="button"
            onClick={addTicker}
            variant="gold"
            size="icon"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Budget */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium" style={{ color: "var(--cb-text)" }}>Budget</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label style={{ color: "var(--cb-text)" }}>Buy for (SOL)</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.budgetSol}
              onChange={(e) => updateFormData("budgetSol", parseFloat(e.target.value))}
              className="cb-input cb-hover"
            />
          </div>
          
          <div className="space-y-2">
            <Label style={{ color: "var(--cb-text)" }}>Max Total Spend (SOL)</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.maxSpendSol}
              onChange={(e) => updateFormData("maxSpendSol", parseFloat(e.target.value))}
              className="cb-input cb-hover"
            />
          </div>
          
          <div className="space-y-2">
            <Label style={{ color: "var(--cb-text)" }}>Max Total Snipes</Label>
            <Input
              type="number"
              min="1"
              value={formData.maxSnipes}
              onChange={(e) => updateFormData("maxSnipes", parseInt(e.target.value))}
              className="cb-input cb-hover"
            />
          </div>
        </div>
      </div>

      {/* Socials Gate */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium" style={{ color: "var(--cb-text)" }}>Socials Gate</h3>
        
        <div className="flex items-center justify-between">
          <Label style={{ color: "var(--cb-text)" }}>Has Socials</Label>
          <Switch
            checked={formData.hasSocials}
            onCheckedChange={(checked) => updateFormData("hasSocials", checked)}
          />
        </div>
      </div>

      {/* Dev Parameters */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium" style={{ color: "var(--cb-text)" }}>Dev Parameters</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label style={{ color: "var(--cb-text)" }}>Tokens Created (min)</Label>
            <Input
              type="number"
              min="0"
              value={formData.devParams.tokensCreated.min || ""}
              onChange={(e) => updateFormData("devParams.tokensCreated.min", e.target.value ? parseInt(e.target.value) : undefined)}
              className="cb-input cb-hover"
              placeholder="No limit"
            />
          </div>
          
          <div className="space-y-2">
            <Label style={{ color: "var(--cb-text)" }}>Tokens Created (max)</Label>
            <Input
              type="number"
              min="0"
              value={formData.devParams.tokensCreated.max || ""}
              onChange={(e) => updateFormData("devParams.tokensCreated.max", e.target.value ? parseInt(e.target.value) : undefined)}
              className="cb-input cb-hover"
              placeholder="No limit"
            />
          </div>
          
          <div className="space-y-2">
            <Label style={{ color: "var(--cb-text)" }}>Bonded Count (min)</Label>
            <Input
              type="number"
              min="0"
              value={formData.devParams.bondedCount.min || ""}
              onChange={(e) => updateFormData("devParams.bondedCount.min", e.target.value ? parseInt(e.target.value) : undefined)}
              className="cb-input cb-hover"
              placeholder="No limit"
            />
          </div>
          
          <div className="space-y-2">
            <Label style={{ color: "var(--cb-text)" }}>Bonded Count (max)</Label>
            <Input
              type="number"
              min="0"
              value={formData.devParams.bondedCount.max || ""}
              onChange={(e) => updateFormData("devParams.bondedCount.max", e.target.value ? parseInt(e.target.value) : undefined)}
              className="cb-input cb-hover"
              placeholder="No limit"
            />
          </div>
          
          <div className="space-y-2">
            <Label style={{ color: "var(--cb-text)" }}>Creator Buy (min SOL)</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.devParams.creatorBuy.min || ""}
              onChange={(e) => updateFormData("devParams.creatorBuy.min", e.target.value ? parseFloat(e.target.value) : undefined)}
              className="cb-input cb-hover"
              placeholder="No limit"
            />
          </div>
          
          <div className="space-y-2">
            <Label style={{ color: "var(--cb-text)" }}>Creator Buy (max SOL)</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.devParams.creatorBuy.max || ""}
              onChange={(e) => updateFormData("devParams.creatorBuy.max", e.target.value ? parseFloat(e.target.value) : undefined)}
              className="cb-input cb-hover"
              placeholder="No limit"
            />
          </div>
          
          <div className="space-y-2">
            <Label style={{ color: "var(--cb-text)" }}>Bundle Buy (min SOL)</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.devParams.bundleBuy.min || ""}
              onChange={(e) => updateFormData("devParams.bundleBuy.min", e.target.value ? parseFloat(e.target.value) : undefined)}
              className="cb-input cb-hover"
              placeholder="No limit"
            />
          </div>
          
          <div className="space-y-2">
            <Label style={{ color: "var(--cb-text)" }}>Bundle Buy (max SOL)</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.devParams.bundleBuy.max || ""}
              onChange={(e) => updateFormData("devParams.bundleBuy.max", e.target.value ? parseFloat(e.target.value) : undefined)}
              className="cb-input cb-hover"
              placeholder="No limit"
            />
          </div>
        </div>
      </div>

      {/* Blacklist */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium" style={{ color: "var(--cb-text)" }}>Blacklist</h3>
        
        {/* Existing blacklist items */}
        {formData.blacklist.map((item, index) => (
          <div key={index} className="flex items-center gap-2 p-2 cb-panel">
            <span className="text-sm flex-1" style={{ color: "var(--cb-text)" }}>{item}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeBlacklistItem(index)}
              className="p-1 h-6 w-6 text-red-400 hover:text-red-300"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        ))}
        
        {/* Add new blacklist item */}
        <div className="flex items-center gap-2">
          <Input
            value={newBlacklistItem}
            onChange={(e) => setNewBlacklistItem(e.target.value)}
            placeholder="Add blacklist address"
            className="cb-input cb-hover flex-1"
          />
          <Button
            type="button"
            onClick={addBlacklistItem}
            variant="gold"
            size="icon"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Whitelist */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium" style={{ color: "var(--cb-text)" }}>Whitelist</h3>
        
        {/* Existing whitelist items */}
        {formData.whitelist.map((item, index) => (
          <div key={index} className="flex items-center gap-2 p-2 cb-panel">
            <span className="text-sm flex-1" style={{ color: "var(--cb-text)" }}>{item}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeWhitelistItem(index)}
              className="p-1 h-6 w-6 text-red-400 hover:text-red-300"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        ))}
        
        {/* Add new whitelist item */}
        <div className="flex items-center gap-2">
          <Input
            value={newWhitelistItem}
            onChange={(e) => setNewWhitelistItem(e.target.value)}
            placeholder="Add whitelist address"
            className="cb-input cb-hover flex-1"
          />
          <Button
            type="button"
            onClick={addWhitelistItem}
            variant="gold"
            size="icon"
          >
            <Plus className="w-4 h-4" />
          </Button>
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

        <div className="flex items-center justify-between">
          <div>
            <Label style={{ color: "var(--cb-text)" }}>Execute as Bundle</Label>
            <p className="text-xs" style={{ color: "var(--cb-subtext)" }}>
              Use Jito bundling for faster execution
            </p>
          </div>
          <Switch
            checked={formData.execAsBundle || false}
            onCheckedChange={(checked) => updateFormData("execAsBundle", checked)}
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
