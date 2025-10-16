"use client"

import { useState } from "react";
import { useScanner } from "@/stores/scanner";
import { 
  Star, 
  Users, 
  Zap, 
  Shield, 
  MessageSquare, 
  TrendingUp,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const groups = [
  { key: "top",      label: "Top Picks",      icon: Star },
  { key: "wallets",  label: "Wallets & Holders", icon: Users },
  { key: "early",    label: "Early & Snipers", icon: Zap },
  { key: "security", label: "Security / Risk", icon: Shield },
  { key: "socials",  label: "Socials / KOL",  icon: MessageSquare },
  { key: "bundles",  label: "Bundles & PnL",  icon: TrendingUp },
] as const;

export default function SidebarFilters() {
  const { filters, setFilters } = useScanner();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`sticky top-[64px] h-[calc(100vh-64px)] shrink-0 border-r border-zinc-800 p-3 space-y-4 transition-all duration-300 ${
      collapsed ? "w-16" : "w-64"
    } hidden md:block`}>
      {/* Collapse toggle */}
      <div className="flex items-center justify-between">
        {!collapsed && <div className="text-xs uppercase text-zinc-400 tracking-wide">Scanner</div>}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded hover:bg-zinc-900 transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Filter groups */}
      <div className="grid gap-2">
        {groups.map(g => {
          const Icon = g.icon;
          return (
            <button
              key={g.key}
              onClick={() => setFilters({ group: g.key })}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-zinc-900 transition-colors group
                ${filters.group===g.key ? "bg-zinc-900 ring-1 ring-yellow-500/30" : ""}`}
              title={collapsed ? g.label : undefined}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span className="text-sm">{g.label}</span>}
            </button>
          );
        })}
      </div>

      {/* Quick toggles */}
      {!collapsed && (
        <div className="pt-4 border-t border-zinc-800 space-y-2">
          <div className="text-xs uppercase text-zinc-400 tracking-wide">Filters</div>
          <label className="flex items-center gap-2 text-sm">
            <input 
              type="checkbox" 
              checked={filters.whales || false}
              onChange={e=>setFilters({ whales: e.target.checked })}
              className="rounded border-zinc-600 bg-zinc-800"
            />
            <span>🐳 Whales</span>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input 
              type="checkbox" 
              checked={filters.early || false}
              onChange={e=>setFilters({ early: e.target.checked })}
              className="rounded border-zinc-600 bg-zinc-800"
            />
            <span>⚡ Early Buyers</span>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input 
              type="checkbox" 
              checked={filters.snipers || false}
              onChange={e=>setFilters({ snipers: e.target.checked })}
              className="rounded border-zinc-600 bg-zinc-800"
            />
            <span>🎯 Snipers</span>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input 
              type="checkbox" 
              checked={filters.kol || false}
              onChange={e=>setFilters({ kol: e.target.checked })}
              className="rounded border-zinc-600 bg-zinc-800"
            />
            <span>👑 KOL Activity</span>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input 
              type="checkbox" 
              checked={filters.riskyOnly || false}
              onChange={e=>setFilters({ riskyOnly: e.target.checked })}
              className="rounded border-zinc-600 bg-zinc-800"
            />
            <span>🧨 Risky Only</span>
          </label>
        </div>
      )}
    </aside>
  );
}
