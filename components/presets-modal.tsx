"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface PresetsModalProps {
  isOpen: boolean
  onClose: () => void
  presets: {
    P1: { prio: string; tip: string; slippage: string; mev: boolean }
    P2: { prio: string; tip: string; slippage: string; mev: boolean }
    P3: { prio: string; tip: string; slippage: string; mev: boolean }
  }
  onSave: (presets: any) => void
}

export function PresetsModal({ isOpen, onClose, presets, onSave }: PresetsModalProps) {
  const [activePreset, setActivePreset] = useState<"P1" | "P2" | "P3">("P1")
  const [settingsType, setSettingsType] = useState<"buy" | "sell">("buy")
  const [local, setLocal] = useState(presets)

  if (!isOpen) return null

  const handleSave = () => {
    onSave(local)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-[320px] bg-[#0b0b0b] border border-[#1f1f1f] rounded-xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#262626] bg-[#101010]">
          <h2 className="text-lg font-medium text-white">Edit Solana Presets</h2>
          <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-1 space-y-0.5 max-h-[200px] overflow-y-auto">
          {/* Preset Tabs */}
          <div className="flex border-b border-zinc-700">
            {(['P1', 'P2', 'P3'] as const).map((preset) => (
              <button
                key={preset}
                onClick={() => setActivePreset(preset)}
                className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activePreset === preset
                    ? 'border-purple-500 text-white'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>

          {/* Buy/Sell Settings Toggle */}
          <div className="flex bg-zinc-800 rounded p-0.5">
            <button
              onClick={() => setSettingsType('buy')}
              className={`flex-1 px-2 py-1 text-xs font-medium rounded transition-colors ${
                settingsType === 'buy'
                  ? 'bg-teal-500 text-white'
                  : 'text-zinc-300 hover:text-white'
              }`}
            >
              Buy Settings
            </button>
            <button
              onClick={() => setSettingsType('sell')}
              className={`flex-1 px-2 py-1 text-xs font-medium rounded transition-colors ${
                settingsType === 'sell'
                  ? 'bg-red-500 text-white'
                  : 'text-zinc-300 hover:text-white'
              }`}
            >
              Sell Settings
            </button>
          </div>

          {/* Settings Fields */}
          <div className="space-y-0.5">
            {/* Priority */}
            <div>
              <div className="flex items-center gap-1 mb-0">
                <div className="w-4 h-4 bg-zinc-600 rounded flex items-center justify-center">
                  <span className="text-xs">⛽</span>
                </div>
                <span className="text-sm text-zinc-200">Prio</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.001"
                  value={local[activePreset].prio}
                  onChange={(e) => setLocal(prev => ({
                    ...prev,
                    [activePreset]: {
                      ...prev[activePreset],
                      prio: e.target.value
                    }
                  }))}
                  className="flex-1 px-1 py-0 bg-zinc-800 border border-zinc-600 rounded text-white text-xs"
                />
                      <div className="flex items-center gap-1 px-1 py-0.5 bg-purple-500/20 rounded">
                        <img src="/sol-logo.png" alt="SOL" className="w-3 h-3" />
                      </div>
              </div>
            </div>

            {/* Tip */}
            <div>
              <div className="flex items-center gap-1 mb-0">
                <div className="w-4 h-4 bg-zinc-600 rounded flex items-center justify-center">
                  <span className="text-xs">👤</span>
                </div>
                <span className="text-sm text-zinc-200">Tip</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.001"
                  value={local[activePreset].tip}
                  onChange={(e) => setLocal(prev => ({
                    ...prev,
                    [activePreset]: {
                      ...prev[activePreset],
                      tip: e.target.value
                    }
                  }))}
                  className="flex-1 px-1 py-0 bg-zinc-800 border border-zinc-600 rounded text-white text-xs"
                />
                      <div className="flex items-center gap-1 px-1 py-0.5 bg-purple-500/20 rounded">
                        <img src="/sol-logo.png" alt="SOL" className="w-3 h-3" />
                      </div>
              </div>
            </div>

            {/* Slippage */}
            <div>
              <div className="flex items-center gap-1 mb-0">
                <div className="w-4 h-4 bg-zinc-600 rounded flex items-center justify-center">
                  <span className="text-xs">🏃</span>
                </div>
                <span className="text-sm text-zinc-200">Slippage</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={local[activePreset].slippage}
                  onChange={(e) => setLocal(prev => ({
                    ...prev,
                    [activePreset]: {
                      ...prev[activePreset],
                      slippage: e.target.value
                    }
                  }))}
                  className="flex-1 px-1 py-0 bg-zinc-800 border border-zinc-600 rounded text-white text-xs"
                />
                <span className="text-sm text-zinc-400">%</span>
              </div>
            </div>

            {/* MEV Protection */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-200">MEV Protection</span>
              <button
                onClick={() => setLocal(prev => ({
                  ...prev,
                  [activePreset]: {
                    ...prev[activePreset],
                    mev: !prev[activePreset].mev
                  }
                }))}
                className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${
                  local[activePreset].mev ? 'bg-green-500' : 'bg-zinc-600'
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    local[activePreset].mev ? 'translate-x-4' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Custom RPC URL */}
            <div>
              <input
                type="text"
                placeholder="Custom RPC URL"
                className="w-full px-1 py-0 bg-zinc-800 border border-zinc-600 rounded text-white text-xs placeholder-zinc-400"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-1 py-0.5 border-t border-[#262626]">
        </div>
      </div>
    </div>
  )
}
