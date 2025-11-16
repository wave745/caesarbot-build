"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { X, RotateCcw, Settings } from "lucide-react"

export type EchoSettings = {
  layout: {
    metricsSize: "Small" | "Large"
    avatarShape: "Circle" | "Square"
    columns: "Compact" | "Spaced"
    showNew: boolean
    showAlmostBonded: boolean
    showMigrated: boolean
  }
  toggles: {
    copyNameOnClick: boolean
      pauseOnHover: boolean
      backgroundColor: boolean
      launchpadColorMatching: boolean
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
    size: "Small" | "Large" | "Mega" | "Ultra"
    shape: "Round" | "Square"
    width: number
    transparency: number
  }
  dataDisplay: {
    top10Holders: boolean
    devHolding: boolean
    snipersHoldings: boolean
    insidersHolding: boolean
    bundles: boolean
    dexBoosted: boolean
    dexPaid: boolean
    xTokenSearch: boolean
    devBonded: boolean
    socials: boolean
    totalHolders: boolean
    volume: boolean
    marketCap: boolean
    marketCapInStats: boolean
    totalFees: boolean
    contractAddress: boolean
    linkedXUser: boolean
    keywordsSearch: boolean
  }
}

const defaultSettings: EchoSettings = {
  layout: {
    metricsSize: "Small",
    avatarShape: "Circle",
    columns: "Compact",
    showNew: true,
    showAlmostBonded: true,
    showMigrated: true
  },
  toggles: {
    copyNameOnClick: true,
      pauseOnHover: true,
      backgroundColor: false,
      launchpadColorMatching: false
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
    buttonColor: "",
    buttonTextColor: "",
    size: "Small",
    shape: "Round",
    width: 60,
    transparency: 0
  },
  dataDisplay: {
    top10Holders: true,
    devHolding: true,
    snipersHoldings: true,
    insidersHolding: true,
    bundles: true,
    dexBoosted: true,
    dexPaid: true,
    xTokenSearch: true,
    devBonded: true,
    socials: true,
    totalHolders: true,
    volume: true,
    marketCap: true,
    marketCapInStats: false,
    totalFees: true,
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
      <div className="mt-14 w-[280px] sm:w-[320px] bg-[#0b0b0b] border border-[#1f1f1f] rounded-xl shadow-xl overflow-hidden max-h-[70vh] flex flex-col">
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
                <Row label="Metrics" right={
                  <Chooser current={local.layout.metricsSize} options={["Small","Large"]} onChange={(v)=>write(p=>({...p,layout:{...p.layout,metricsSize:v as any}}))} />
                } />
                <Row label="Avatar" right={
                  <Chooser current={local.layout.avatarShape} options={["Circle","Square"]} onChange={(v)=>write(p=>({...p,layout:{...p.layout,avatarShape:v as any}}))} />
                } />
                <Row label="Columns" right={
                  <Chooser current={local.layout.columns} options={["Compact","Spaced"]} onChange={(v)=>write(p=>({...p,layout:{...p.layout,columns:v as any}}))} />
                } />
                <Row label="New" right={<Toggle checked={local.layout.showNew} onChange={(v)=>write(p=>({...p,layout:{...p.layout,showNew:v}}))} />} />
                <Row label="Nearly there" right={<Toggle checked={local.layout.showAlmostBonded} onChange={(v)=>write(p=>({...p,layout:{...p.layout,showAlmostBonded:v}}))} />} />
                <Row label="Migrated" right={<Toggle checked={local.layout.showMigrated} onChange={(v)=>write(p=>({...p,layout:{...p.layout,showMigrated:v}}))} />} />

                {/* Extra toggles from screenshot (kept under Layout for v1) */}
                <Divider title="" />
                <Row label="Copy name on click" right={<Toggle checked={local.toggles.copyNameOnClick} onChange={(v)=>write(p=>({...p,toggles:{...p.toggles,copyNameOnClick:v}}))} />} />
                <Row label="Pause on hover" right={<Toggle checked={local.toggles.pauseOnHover} onChange={(v)=>write(p=>({...p,toggles:{...p.toggles,pauseOnHover:v}}))} />} />
                 <Row label="Background color" right={<Toggle checked={local.toggles.backgroundColor} onChange={(v)=>write(p=>({...p,toggles:{...p.toggles,backgroundColor:v}}))} />} />
                 <Row label="Launchpad color matching" right={<Toggle checked={local.toggles.launchpadColorMatching} onChange={(v)=>write(p=>({...p,toggles:{...p.toggles,launchpadColorMatching:v}}))} disabled={!local.toggles.backgroundColor} />} />

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
                  { key: 'snipersHoldings', label: 'Snipers holdings' },
                  { key: 'insidersHolding', label: 'Insiders holding' },
                  { key: 'bundles', label: 'Bundles' },
                  { key: 'dexBoosted', label: 'Dex boosted' },
                  { key: 'dexPaid', label: 'Dex paid' },
                  { key: 'xTokenSearch', label: 'X token search' },
                  { key: 'devBonded', label: 'Dev bonded' },
                  { key: 'socials', label: 'Socials' },
                  { key: 'totalHolders', label: 'Total holders' },
                  { key: 'volume', label: 'Volume' },
                  { key: 'marketCap', label: 'Market cap' },
                  { key: 'marketCapInStats', label: 'Market cap in stats' },
                  { key: 'totalFees', label: 'Total fees' },
                  { key: 'contractAddress', label: 'Contract address' },
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
              </div>
            </TabsContent>

          </Tabs>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-[#262626]">
          <Button variant="outline" size="sm" className="bg-[#111111] border-[#2a2a2a] text-white hover:bg-[#1a1a1a] text-xs px-3 py-1.5" onClick={handleReset}>Reset</Button>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs px-3 py-1.5" onClick={handleApply}>Apply</Button>
        </div>
      </div>

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

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean)=>void; disabled?: boolean }) {
  return (
    <Checkbox checked={checked} onCheckedChange={(v)=>onChange(Boolean(v))} disabled={disabled} />
  )
}

function Divider({ title }: { title: string }) {
  return (
    <div className="mt-3 mb-1 px-2 text-xs uppercase tracking-wide text-zinc-400">{title}</div>
  )
}

// Launchpad color mapping utility
export function getLaunchpadColor(platform: string): string {
  const colorMap: Record<string, string> = {
    'pump.fun': 'bg-green-900/30',
    'bonk.fun': 'bg-orange-900/30', 
    'pumpswap': 'bg-green-900/30',
    'moonshot': 'bg-purple-900/30',
    'moon.it': 'bg-yellow-900/30',
    'boop.fun': 'bg-blue-900/30',
    'orca': 'bg-cyan-900/30',
    'meteora': 'bg-red-900/30',
    'raydium': 'bg-red-900/30',
    'bagsfm': 'bg-green-900/30',
    'believeapp': 'bg-green-900/30',
    'jupiter': 'bg-blue-900/30'
  }
  
  return colorMap[platform] || 'bg-zinc-800/30'
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

