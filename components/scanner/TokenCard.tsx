"use client"

import { TokenRow } from "@/stores/scanner";
import Sparkline from "./Sparkline";
import { RiskBadge } from "./RiskBadge";
import { useScanner } from "@/stores/scanner";

export default function TokenCard({ t }: { t: TokenRow }) {
  const { select } = useScanner();
  return (
    <div 
      className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 hover:border-yellow-500/30 hover:shadow-[0_0_40px_-20px_rgba(234,179,8,0.25)] transition-all duration-200 cursor-pointer group"
      data-token-card
      role="button"
      tabIndex={0}
      aria-label={`Token ${t.ticker} - ${t.name}`}
    >
      {/* Row 1: Symbol • Name • Risk Badge */}
      <div className="flex items-center justify-between">
        <div className="font-medium text-white">
          {t.ticker} <span className="text-zinc-400">• {t.name}</span>
        </div>
        <RiskBadge level={t.risk}/>
      </div>

      {/* Row 2: MC / Vol / LP + Sparkline */}
      <div className="mt-2 grid grid-cols-2 text-sm">
        <div className="space-y-1">
          <div className="text-zinc-400">MC</div>
          <div className="font-medium text-white">${t.mc.toLocaleString()}</div>
        </div>
        <div className="space-y-1">
          <div className="text-zinc-400">Vol 24h</div>
          <div className="font-medium text-white">${t.vol24h.toLocaleString()}</div>
        </div>
        <div className="space-y-1">
          <div className="text-zinc-400">LP</div>
          <div className="font-medium text-white">${t.lp.toLocaleString()}</div>
        </div>
        <div className="flex items-end justify-end">
          <Sparkline points={t.spark}/>
        </div>
      </div>

      {/* Row 3: Actions */}
      <div className="mt-3 flex gap-2">
        <button className="px-3 py-1.5 text-sm rounded-lg bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 transition-colors">
          Track
        </button>
        <button className="px-3 py-1.5 text-sm rounded-lg bg-yellow-600/20 border border-yellow-600/40 hover:bg-yellow-600/30 transition-colors">
          Snipe
        </button>
        <button 
          onClick={()=>select(t)} 
          className="px-3 py-1.5 text-sm rounded-lg bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 transition-colors"
        >
          Details
        </button>
      </div>
    </div>
  );
}
