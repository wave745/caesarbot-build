"use client"

import { useState } from "react";
import { useScanner } from "@/stores/scanner";

type Cmd = { key:string; label:string; icon:string; color:string; hint?:string };

const GROUPS: Record<string, Cmd[]> = {
  "Overview": [
    { key:"stats",   label:"Graduated Stats", icon:"📊", color:"from-sky-500 to-cyan-500" },
    { key:"search",  label:"Search Deploys",  icon:"🔎", color:"from-violet-500 to-fuchsia-500" },
    { key:"hmap",    label:"Market Heatmap",  icon:"🗺️", color:"from-amber-500 to-yellow-500" },
  ],
  "Wallets & Holders": [
    { key:"top",     label:"Top Holders",     icon:"👥", color:"from-blue-500 to-cyan-500" },
    { key:"holders", label:"Holder Info",     icon:"🧱", color:"from-slate-500 to-zinc-500" },
    { key:"fresh",   label:"Freshies %",      icon:"🌱", color:"from-emerald-500 to-green-500" },
    { key:"floor",   label:"Top Holder Floor",icon:"🧊", color:"from-indigo-500 to-blue-500" },
    { key:"common",  label:"Common Traders",  icon:"🔗", color:"from-teal-500 to-emerald-500" },
    { key:"holders_map", label:"Holders Map", icon:"🗂️", color:"from-stone-500 to-neutral-500" },
    { key:"whale",   label:"Whale Map",       icon:"🐋", color:"from-cyan-500 to-blue-500" },
  ],
  "Early & Snipers": [
    { key:"early",   label:"Early Buyers",    icon:"⚡", color:"from-orange-500 to-amber-500" },
    { key:"early_pf",label:"Early PF Wallets",icon:"🧬", color:"from-pink-500 to-rose-500" },
    { key:"snipers", label:"Snipers",         icon:"🎯", color:"from-red-500 to-rose-500" },
    { key:"pnls",    label:"Top PnLs",        icon:"💰", color:"from-lime-500 to-green-500" },
  ],
  "Security / Risk": [
    { key:"dex",     label:"DEX Updated?",    icon:"🧪", color:"from-yellow-500 to-amber-500" },
    { key:"bundle",  label:"Bundled Check",   icon:"📦", color:"from-rose-500 to-red-500" },
    { key:"site",    label:"Site Reuse",      icon:"🔁", color:"from-zinc-500 to-slate-500" },
    { key:"domain",  label:"Domain Age",      icon:"📅", color:"from-stone-500 to-neutral-500" },
    { key:"dev",     label:"Dev History",     icon:"🛠️", color:"from-fuchsia-500 to-purple-500" },
    { key:"image",   label:"Reverse Image",   icon:"🖼️", color:"from-cyan-500 to-teal-500" },
  ],
  "Wallet Tools": [
    { key:"wallet",  label:"Wallet Analyzer", icon:"🧮", color:"from-blue-500 to-indigo-500" },
    { key:"funded",  label:"Funding Trace",   icon:"🧷", color:"from-emerald-500 to-teal-500" },
  ],
};

export default function CommandBoard({ onClose, onChoose }:{
  onClose:()=>void; 
  onChoose?:(key:string)=>void;
}) {
  const { setFilters } = useScanner();
  const tabs = Object.keys(GROUPS);
  const [tab, setTab] = useState(tabs[0]);

  const handle = (k:string) => {
    // Map commands to filters
    switch(k) {
      case "whale":
        setFilters({ whales: true });
        break;
      case "early":
        setFilters({ early: true });
        break;
      case "snipers":
        setFilters({ snipers: true });
        break;
      case "bundle":
        setFilters({ riskyOnly: true });
        break;
      default:
        // For other commands, you could open specific drawer sections
        console.log(`Command: ${k}`);
    }
    
    onChoose?.(k);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}/>
      <div className="absolute right-6 top-6 w-[680px] max-h-[80vh] overflow-y-auto
                      rounded-2xl border border-zinc-800 bg-[#121212] shadow-2xl">
        {/* header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800">
          <div className="text-sm uppercase tracking-wide text-zinc-400">Filters</div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">✕</button>
        </div>

        {/* tabs */}
        <div className="px-5 pt-3 flex gap-6 text-sm">
          {tabs.map(t => (
            <button key={t}
              onClick={()=>setTab(t)}
              className={`pb-2 transition-colors ${
                t===tab 
                  ? "text-white border-b-2 border-white/80" 
                  : "text-zinc-400 hover:text-white/90"
              }`}>
              {t}
            </button>
          ))}
        </div>

        {/* body */}
        <div className="px-5 pb-5 pt-4 space-y-3">
          <div className="text-zinc-400 text-xs">Protocols / Checks</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {GROUPS[tab].map(c => (
              <div key={c.key} className="">
                <button
                  onClick={()=>handle(c.key)}
                  className={`w-full justify-start px-3 py-1.5 rounded-full border border-zinc-800
                              bg-zinc-950/70 hover:border-yellow-500/30 text-sm flex items-center gap-2 transition-colors`}
                >
                  <span className={`text-xs px-2 py-0.5 rounded-full border border-zinc-700 bg-gradient-to-br ${c.color} text-black/80`}>
                    {c.icon}
                  </span>
                  {c.label}
                </button>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between pt-3">
            <button className="text-xs underline text-zinc-400 hover:text-zinc-300 transition-colors">Select All</button>
            <button className="text-xs text-zinc-400 hover:text-zinc-300 transition-colors">↻ Refresh</button>
          </div>
        </div>
      </div>
    </div>
  );
}
