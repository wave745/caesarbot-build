"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { X, RotateCcw, Settings, Zap } from "lucide-react"
import { PresetsModal } from "./presets-modal"

export type EchoSettings = {
  layout: {
    display: "Moxia" | "Legacy"
    metricsSize: "Small" | "Large"
    avatarShape: "Circle" | "Square"
    progressStyle: "Bar" | "Ring"
    columns: "Compact" | "Spaced"
    showNew: boolean
    showAlmostBonded: boolean
    almostBondedBy: "Curve" | "M Cap"
    showMigrated: boolean
    statsDigits: "Short" | "Rounded"
  }
  toggles: {
    copyNameOnClick: boolean
    pauseOnHover: boolean
    backgroundColor: boolean
    searchKeywords: boolean
    showAvatarReused: boolean
  }
  thresholds: {
    mc1: string
    mc2: string
    mc3: string
    tweetAge1: string
    tweetAge2: string
    tweetAge3: string
  }
  thresholdColors: {
    mc1: string
    mc2: string
    mc3: string
    tweet1: string
    tweet2: string
    tweet3: string
  }
  quickBuy: {
    buttonColor: string
    buttonTextColor: string
    extraBehavior: "None" | "Open Market" | "Open New Tab"
    size: "Small" | "Large" | "Mega" | "Ultra"
    shape: "Round" | "Square"
    width: number
    transparency: number
    showSecondButton: boolean
    extraButtonColor: string
    extraButtonTextColor: string
    extraPreset: string
    amount: string
    presets: {
      P1: { prio: string; tip: string; slippage: string; mev: boolean }
      P2: { prio: string; tip: string; slippage: string; mev: boolean }
      P3: { prio: string; tip: string; slippage: string; mev: boolean }
    }
  }
  dataDisplay: {
    top10Holders: boolean
    devHolding: boolean
    devFunded: boolean
    snipersHoldings: boolean
    snipersCount: boolean
    insidersHolding: boolean
    bundles: boolean
    dexBoosted: boolean
    dexPaid: boolean
    xTokenSearch: boolean
    progressLine: boolean
    totalTxns: boolean
    devBonded: boolean
    socials: boolean
    proHolders: boolean
    freshWalletBuys: boolean
    totalHolders: boolean
    volume: boolean
    marketCap: boolean
    marketCapInStats: boolean
    totalFees: boolean
    vibing: boolean
    contractAddress: boolean
    linkedXUser: boolean
    keywordsSearch: boolean
  }
}

const defaultSettings: EchoSettings = {
  layout: {
    display: "Moxia",
    metricsSize: "Small",
    avatarShape: "Circle",
    progressStyle: "Bar",
    columns: "Compact",
    showNew: true,
    showAlmostBonded: true,
    almostBondedBy: "Curve",
    showMigrated: true,
    statsDigits: "Rounded"
  },
  toggles: {
    copyNameOnClick: true,
    pauseOnHover: true,
    backgroundColor: false,
    searchKeywords: true,
    showAvatarReused: true
  },
  thresholds: {
    mc1: "100000",
    mc2: "20000",
    mc3: "1000",
    tweetAge1: "30",
    tweetAge2: "10",
    tweetAge3: "10"
  },
  thresholdColors: {
    mc1: "#22c55e", // green
    mc2: "#f59e0b", // amber
    mc3: "#06b6d4", // cyan
    tweet1: "#ef4444", // red
    tweet2: "#f59e0b", // amber
    tweet3: "#06b6d4"  // cyan
  },
  quickBuy: {
    buttonColor: "#22c55e",
    buttonTextColor: "#0b0b0b",
    extraBehavior: "None",
    size: "Small",
    shape: "Round",
    width: 60,
    transparency: 0,
    showSecondButton: false,
    extraButtonColor: "#22c55e",
    extraButtonTextColor: "#0b0b0b",
    extraPreset: "P1",
    amount: "0"
    ,presets: {
      P1: { prio: "0.003", tip: "0.004", slippage: "20", mev: true },
      P2: { prio: "0.008", tip: "0.012", slippage: "10", mev: false },
      P3: { prio: "0.012", tip: "0.03", slippage: "10", mev: false }
    }
  },
  dataDisplay: {
    top10Holders: true,
    devHolding: true,
    devFunded: false,
    snipersHoldings: true,
    snipersCount: true,
    insidersHolding: true,
    bundles: true,
    dexBoosted: true,
    dexPaid: true,
    xTokenSearch: true,
    progressLine: false,
    totalTxns: true,
    devBonded: true,
    socials: true,
    proHolders: true,
    freshWalletBuys: false,
    totalHolders: true,
    volume: true,
    marketCap: true,
    marketCapInStats: false,
    totalFees: true,
    vibing: false,
    contractAddress: true,
    linkedXUser: true,
    keywordsSearch: true
  }
}

interface EchoCustomizeModalProps {
  isOpen: boolean
  onClose: () => void
  settings?: EchoSettings
  onApply?: (next: EchoSettings) => void
}

export function EchoCustomizeModal({ isOpen, onClose, settings, onApply }: EchoCustomizeModalProps) {
  const [activeTab, setActiveTab] = useState<"layout" | "data" | "quick">("layout")
  const [showPresetsModal, setShowPresetsModal] = useState(false)
  const [local, setLocal] = useState<EchoSettings>(settings || defaultSettings)

  useEffect(() => {
    if (settings) setLocal(settings)
  }, [settings])

  if (!isOpen) return null

  const write = (updater: (prev: EchoSettings) => EchoSettings) => {
    setLocal(prev => updater(prev))
  }

  const handleApply = () => {
    onApply?.(local)
    onClose()
  }

  const handleReset = () => setLocal(defaultSettings);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/50">
      <div className="mt-14 w-[380px] sm:w-[420px] bg-[#0b0b0b] border border-[#1f1f1f] rounded-xl shadow-xl overflow-hidden max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#262626] bg-[#101010]">
          <div className="flex items-center gap-2 text-zinc-200">
            <Settings className="w-4 h-4 text-zinc-400" />
            <span className="font-medium">Customize</span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white" onClick={handleReset}>
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Tabs (scrollable content) */}
        <div className="flex-1 overflow-y-auto scrollbar-hide px-3 pt-3">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="grid grid-cols-3 bg-transparent">
              <TabsTrigger className="data-[state=active]:text-white data-[state=active]:border-b data-[state=active]:border-zinc-500 text-zinc-300 px-3 py-2" value="layout">Layout</TabsTrigger>
              <TabsTrigger className="data-[state=active]:text-white data-[state=active]:border-b data-[state=active]:border-zinc-500 text-zinc-300 px-3 py-2" value="data">Data</TabsTrigger>
              <TabsTrigger className="data-[state=active]:text-white data-[state=active]:border-b data-[state=active]:border-zinc-500 text-zinc-300 px-3 py-2" value="quick">Quick Buy</TabsTrigger>
            </TabsList>

            {/* Layout Tab */}
            <TabsContent value="layout" className="pt-3 pb-2">
              <div className="space-y-3">
                <Row label="Display" right={
                  <Chooser current={local.layout.display} options={["Moxia","Legacy"]} onChange={(v)=>write(p=>({...p,layout:{...p.layout,display:v as any}}))} />
                } />
                <Row label="Metrics" right={
                  <Chooser current={local.layout.metricsSize} options={["Small","Large"]} onChange={(v)=>write(p=>({...p,layout:{...p.layout,metricsSize:v as any}}))} />
                } />
                <Row label="Avatar" right={
                  <Chooser current={local.layout.avatarShape} options={["Circle","Square"]} onChange={(v)=>write(p=>({...p,layout:{...p.layout,avatarShape:v as any}}))} />
                } />
                <Row label="Progress" right={
                  <Chooser current={local.layout.progressStyle} options={["Bar","Ring"]} onChange={(v)=>write(p=>({...p,layout:{...p.layout,progressStyle:v as any}}))} />
                } />
                <Row label="Columns" right={
                  <Chooser current={local.layout.columns} options={["Compact","Spaced"]} onChange={(v)=>write(p=>({...p,layout:{...p.layout,columns:v as any}}))} />
                } />
                <Row label="New" right={<Toggle checked={local.layout.showNew} onChange={(v)=>write(p=>({...p,layout:{...p.layout,showNew:v}}))} />} />
                <Row label="Almost bonded" right={<Toggle checked={local.layout.showAlmostBonded} onChange={(v)=>write(p=>({...p,layout:{...p.layout,showAlmostBonded:v}}))} />} />
                <Row label="Almost bonded by" right={
                  <Chooser current={local.layout.almostBondedBy} options={["Curve","M Cap"]} onChange={(v)=>write(p=>({...p,layout:{...p.layout,almostBondedBy:v as any}}))} />
                } />
                <Row label="Migrated" right={<Toggle checked={local.layout.showMigrated} onChange={(v)=>write(p=>({...p,layout:{...p.layout,showMigrated:v}}))} />} />
                <Row label="Stats digits" right={
                  <Chooser current={local.layout.statsDigits} options={["Short","Rounded"]} onChange={(v)=>write(p=>({...p,layout:{...p.layout,statsDigits:v as any}}))} />
                } />

                {/* Extra toggles from screenshot (kept under Layout for v1) */}
                <Divider title="" />
                <Row label="Copy name on click" right={<Toggle checked={local.toggles.copyNameOnClick} onChange={(v)=>write(p=>({...p,toggles:{...p.toggles,copyNameOnClick:v}}))} />} />
                <Row label="Pause on hover" right={<Toggle checked={local.toggles.pauseOnHover} onChange={(v)=>write(p=>({...p,toggles:{...p.toggles,pauseOnHover:v}}))} />} />
                <Row label="Background color" right={<Toggle checked={local.toggles.backgroundColor} onChange={(v)=>write(p=>({...p,toggles:{...p.toggles,backgroundColor:v}}))} />} />
                <Row label="Search keywords" right={<Toggle checked={local.toggles.searchKeywords} onChange={(v)=>write(p=>({...p,toggles:{...p.toggles,searchKeywords:v}}))} />} />
                <Row label="Show avatar reused" right={<Toggle checked={local.toggles.showAvatarReused} onChange={(v)=>write(p=>({...p,toggles:{...p.toggles,showAvatarReused:v}}))} />} />

                {/* Threshold sections */}
                <Divider title="Market Cap Threshold" />
                <ThresholdRow color={local.thresholdColors.mc1} onColorChange={(c)=>write(p=>({...p,thresholdColors:{...p.thresholdColors,mc1:c}}))} value={local.thresholds.mc1} onChange={(v)=>write(p=>({...p,thresholds:{...p.thresholds,mc1:v}}))} suffix="$" />
                <ThresholdRow color={local.thresholdColors.mc2} onColorChange={(c)=>write(p=>({...p,thresholdColors:{...p.thresholdColors,mc2:c}}))} value={local.thresholds.mc2} onChange={(v)=>write(p=>({...p,thresholds:{...p.thresholds,mc2:v}}))} suffix="$" />
                <ThresholdRow color={local.thresholdColors.mc3} onColorChange={(c)=>write(p=>({...p,thresholdColors:{...p.thresholdColors,mc3:c}}))} value={local.thresholds.mc3} onChange={(v)=>write(p=>({...p,thresholds:{...p.thresholds,mc3:v}}))} suffix="$" />

                <Divider title="Tweet Age Threshold" />
                <ThresholdRow color={local.thresholdColors.tweet1} onColorChange={(c)=>write(p=>({...p,thresholdColors:{...p.thresholdColors,tweet1:c}}))} value={local.thresholds.tweetAge1} onChange={(v)=>write(p=>({...p,thresholds:{...p.thresholds,tweetAge1:v}}))} suffix="m" />
                <ThresholdRow color={local.thresholdColors.tweet2} onColorChange={(c)=>write(p=>({...p,thresholdColors:{...p.thresholdColors,tweet2:c}}))} value={local.thresholds.tweetAge2} onChange={(v)=>write(p=>({...p,thresholds:{...p.thresholds,tweetAge2:v}}))} suffix="m" />
                <ThresholdRow color={local.thresholdColors.tweet3} onColorChange={(c)=>write(p=>({...p,thresholdColors:{...p.thresholdColors,tweet3:c}}))} value={local.thresholds.tweetAge3} onChange={(v)=>write(p=>({...p,thresholds:{...p.thresholds,tweetAge3:v}}))} suffix="m" />
              </div>
            </TabsContent>

            {/* Data Tab */}
            <TabsContent value="data" className="pt-3 pb-2">
              <div className="space-y-2">
                {[
                  { key: 'top10Holders', label: 'Top 10 holders' },
                  { key: 'devHolding', label: 'Dev holding' },
                  { key: 'devFunded', label: 'Dev funded', disabled: true },
                  { key: 'snipersHoldings', label: 'Snipers holdings' },
                  { key: 'snipersCount', label: 'Snipers count' },
                  { key: 'insidersHolding', label: 'Insiders holding' },
                  { key: 'bundles', label: 'Bundles' },
                  { key: 'dexBoosted', label: 'Dex boosted' },
                  { key: 'dexPaid', label: 'Dex paid' },
                  { key: 'xTokenSearch', label: 'X token search' },
                  { key: 'progressLine', label: 'Progress line', disabled: true },
                  { key: 'totalTxns', label: 'Total txns' },
                  { key: 'devBonded', label: 'Dev bonded' },
                  { key: 'socials', label: 'Socials' },
                  { key: 'proHolders', label: 'Pro holders' },
                  { key: 'freshWalletBuys', label: 'Fresh wallet buys', disabled: true },
                  { key: 'totalHolders', label: 'Total holders' },
                  { key: 'volume', label: 'Volume' },
                  { key: 'marketCap', label: 'Market cap' },
                  { key: 'marketCapInStats', label: 'Market cap in stats' },
                  { key: 'totalFees', label: 'Total fees' },
                  { key: 'vibing', label: 'Vibing', disabled: true },
                  { key: 'contractAddress', label: 'Contract address' },
                  { key: 'linkedXUser', label: 'Linked X user' },
                  { key: 'keywordsSearch', label: 'Keywords search' }
                ].map((item) => (
                  <div
                    key={item.key}
                    className={`flex items-center justify-between px-2 py-2 rounded-md ${item.disabled ? 'text-zinc-500/70' : 'hover:bg-white/2.5'}`}
                  >
                    <span className={`text-sm ${item.disabled ? 'text-zinc-500' : 'text-zinc-200'}`}>{item.label}</span>
                    <Checkbox
                      disabled={Boolean(item.disabled)}
                      checked={local.dataDisplay[item.key as keyof typeof local.dataDisplay] as boolean}
                      onCheckedChange={(v)=>write(p=>({
                        ...p,
                        dataDisplay: {
                          ...p.dataDisplay,
                          [item.key]: Boolean(v)
                        }
                      }))}
                    />
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Quick Buy Tab */}
            <TabsContent value="quick" className="pt-3 pb-2">
              <div className="space-y-3">
                <Row label="Button color" right={
                  <ColorPicker value={local.quickBuy.buttonColor} onChange={(v)=>write(p=>({...p,quickBuy:{...p.quickBuy,buttonColor:v}}))} />
                } />
                <Row label="Button text color" right={
                  <ColorPicker value={local.quickBuy.buttonTextColor} onChange={(v)=>write(p=>({...p,quickBuy:{...p.quickBuy,buttonTextColor:v}}))} />
                } />

                <div className="px-2">
                  <div className="text-sm text-zinc-300 mb-1">Quick buy extra behavior</div>
                  <Chooser current={local.quickBuy.extraBehavior} options={["None","Open Market","Open New Tab"]} onChange={(v)=>write(p=>({...p,quickBuy:{...p.quickBuy,extraBehavior:v as any}}))} />
                </div>

                <Row label="Size" right={
                  <Chooser current={local.quickBuy.size} options={["Small","Large","Mega","Ultra"]} onChange={(v)=>write(p=>({...p,quickBuy:{...p.quickBuy,size:v as any}}))} />
                } />
                <Row label="Shape" right={
                  <Chooser current={local.quickBuy.shape} options={["Round","Square"]} onChange={(v)=>write(p=>({...p,quickBuy:{...p.quickBuy,shape:v as any}}))} />
                } />

                <div className="px-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-200">Width</span>
                    <input type="range" min={0} max={100} value={local.quickBuy.width} onChange={(e)=>write(p=>({...p,quickBuy:{...p.quickBuy,width: parseInt(e.target.value) || 0}}))} className="w-40" />
                  </div>
                </div>

                <div className="px-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-200">Transparency</span>
                    <input type="range" min={0} max={100} value={local.quickBuy.transparency} onChange={(e)=>write(p=>({...p,quickBuy:{...p.quickBuy,transparency: parseInt(e.target.value) || 0}}))} className="w-40" />
                  </div>
                </div>

                <Row label="Show second button" right={
                  <Checkbox checked={local.quickBuy.showSecondButton} onCheckedChange={(v)=>write(p=>({...p,quickBuy:{...p.quickBuy,showSecondButton:Boolean(v)}}))} />
                } />

                {local.quickBuy.showSecondButton && (
                  <div className="space-y-3 border-t border-[#1f1f1f] pt-3">
                    <div className="px-2">
                      <div className="text-sm text-zinc-300 mb-2">Config</div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 px-2 py-1 rounded-md border border-[#2a2a2a] bg-[#111111]">
                          <Zap className="w-3 h-3" />
                          <input
                            type="number"
                            value={local.quickBuy.amount}
                            onChange={(e)=>write(p=>({...p,quickBuy:{...p.quickBuy,amount:e.target.value}}))}
                            className="w-10 bg-transparent border-0 outline-none text-sm text-white"
                          />
                          <img src="/sol-logo.png" alt="SOL" className="w-3 h-3" />
                        </div>
                        <PresetDropdown current={local.quickBuy.extraPreset as 'P1'|'P2'|'P3'} onChange={(v)=>write(p=>({...p,quickBuy:{...p.quickBuy,extraPreset:v}}))} presets={local.quickBuy.presets} onEditPresets={()=>setShowPresetsModal(true)} />
                      </div>
                    </div>

                    <Row label="Extra button color" right={
                      <ColorPicker value={local.quickBuy.extraButtonColor} onChange={(v)=>write(p=>({...p,quickBuy:{...p.quickBuy,extraButtonColor:v}}))} />
                    } />
                    <Row label="Extra button text color" right={
                      <ColorPicker value={local.quickBuy.extraButtonTextColor} onChange={(v)=>write(p=>({...p,quickBuy:{...p.quickBuy,extraButtonTextColor:v}}))} />
                    } />
                  </div>
                )}
              </div>
            </TabsContent>

          </Tabs>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-[#262626]">
          <Button variant="outline" className="bg-[#111111] border-[#2a2a2a] text-white hover:bg-[#1a1a1a]" onClick={handleReset}>Reset</Button>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleApply}>Apply</Button>
        </div>
      </div>

      {/* Presets Modal */}
      <PresetsModal
        isOpen={showPresetsModal}
        onClose={() => setShowPresetsModal(false)}
        presets={local.quickBuy.presets}
        onSave={(newPresets) => {
          setLocal(prev => ({
            ...prev,
            quickBuy: {
              ...prev.quickBuy,
              presets: newPresets
            }
          }))
        }}
      />
    </div>
  )
}

// Reusable UI bits
function Row({ label, right }: { label: string; right: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-2 py-2 rounded-md hover:bg-white/2.5">
      <span className="text-sm text-zinc-200">{label}</span>
      <div className="text-xs text-sky-400">{right}</div>
    </div>
  )
}

function Chooser({ current, options, onChange }: { current: string; options: string[]; onChange: (v: string)=>void }) {
  return (
    <div className="flex items-center gap-2">
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`px-1.5 py-0.5 rounded text-[11px] ${current === opt ? 'text-sky-400' : 'text-zinc-400 hover:text-zinc-200'}`}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean)=>void }) {
  return (
    <Checkbox checked={checked} onCheckedChange={(v)=>onChange(Boolean(v))} />
  )
}

function Divider({ title }: { title: string }) {
  return (
    <div className="mt-3 mb-1 px-2 text-xs uppercase tracking-wide text-zinc-400">{title}</div>
  )
}

function ThresholdRow({ color, value, onChange, suffix, onColorChange }: { color: string; value: string; onChange: (v: string)=>void; suffix: string; onColorChange?: (c: string)=>void }) {
  return (
    <div className="flex items-center gap-2 px-2">
      {onColorChange ? (
        <input
          type="color"
          value={color}
          onChange={(e)=>onColorChange?.(e.target.value)}
          className="w-5 h-5 p-0 bg-transparent border-0 outline-none cursor-pointer rounded"
        />
      ) : (
        <div className={`w-4 h-4 rounded ${color}`}></div>
      )}
      <span className="text-xs text-zinc-400">if at least</span>
      <Input value={value} onChange={(e)=>onChange(e.target.value)} className="h-8 bg-[#111111] border-[#2a2a2a] text-white text-sm" />
      <span className="text-xs text-zinc-400">{suffix}</span>
    </div>
  )
}

function ColorPicker({ value, onChange }: { value: string; onChange: (v: string)=>void }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 rounded" style={{ backgroundColor: value }}></div>
      <input type="color" value={value} onChange={(e)=>onChange(e.target.value)} className="w-8 h-5 p-0 bg-transparent border-0 outline-none cursor-pointer" />
    </div>
  )
}

function PresetDropdown({ current, presets, onChange, onEditPresets }: { current: 'P1'|'P2'|'P3'; presets: any; onChange: (v: 'P1'|'P2'|'P3')=>void; onEditPresets: ()=>void }) {
  return (
    <div className="relative">
      <details className="group">
        <summary className="list-none cursor-pointer select-none px-2 py-1 rounded-md border border-[#2a2a2a] bg-[#111111] text-xs text-zinc-300 flex items-center gap-2">
          {current}
        </summary>
        <div className="absolute left-0 mt-1 min-w-[220px] bg-[#0e0e0e] border border-[#2a2a2a] rounded-lg shadow-xl z-50">
          {(['P1','P2','P3'] as const).map((id)=> (
            <button
              key={id}
              onClick={(e)=>{ e.preventDefault(); onChange(id); }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-[#151515] ${current===id ? 'bg-[#151515]' : ''}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-white">{id}</span>
                <span className="text-xs text-zinc-400">{presets[id].slippage}%</span>
              </div>
              <div className="mt-1 flex items-center gap-3 text-xs text-zinc-300">
                <span>⛽ {presets[id].prio}</span>
                <span>👤 {presets[id].tip}</span>
                <span>{presets[id].mev ? '🟢 On' : '🔴 Off'}</span>
              </div>
            </button>
          ))}
          <div className="border-t border-[#222]"></div>
          <button
            onClick={(e)=>{ e.preventDefault(); onEditPresets(); }}
            className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:bg-[#151515]"
          >
          </button>
        </div>
      </details>
    </div>
  )
}


