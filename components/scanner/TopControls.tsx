"use client"

import { useState, useRef, useEffect } from "react";
import { useScanner } from "@/stores/scanner";
import { Filter, ChevronDown } from "lucide-react";

const FILTER_OPTIONS = [
  { key: "whale", label: "🐋 Whale Map", description: "Top whale holders" },
  { key: "early", label: "⚡ Early Buyers", description: "First buyers analysis" },
  { key: "snipers", label: "🎯 Snipers", description: "Sniper bot activity" },
  { key: "bundle", label: "📦 Bundle Check", description: "Bundle transactions" },
  { key: "stats", label: "📊 Graduated Stats", description: "Advanced metrics" },
  { key: "holders", label: "👥 Holder Info", description: "Holder analysis" },
  { key: "fresh", label: "🌱 Freshies %", description: "New holder percentage" },
  { key: "dex", label: "🧪 DEX Updated", description: "DEX update status" },
  { key: "dev", label: "🛠️ Dev History", description: "Developer history" },
  { key: "wallet", label: "🧮 Wallet Analyzer", description: "Wallet analysis" },
];

export default function TopControls() {
  const { query, setQuery, setSelectedFeature } = useScanner();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFilterSelect = (key: string) => {
    setSelectedFeature(key);
    setIsOpen(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <input
        placeholder="Search CA / ticker / wallet"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-80 rounded-xl bg-zinc-950/60 border border-zinc-800 px-3 py-2 text-white placeholder-zinc-400 focus:ring-1 focus:ring-yellow-500/40 focus:outline-none transition-all"
      />

      {/* Advanced Scan Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-semibold rounded-xl hover:from-yellow-400 hover:to-orange-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
        >
          <Filter className="w-4 h-4" />
          Advanced Scan
          <ChevronDown className="w-4 h-4" />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute top-full left-0 mt-2 w-80 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto">
            <div className="p-2">
              <div className="text-xs text-zinc-400 uppercase tracking-wide mb-2 px-2">Scan Features</div>
              {FILTER_OPTIONS.map((option) => (
                <button
                  key={option.key}
                  onClick={() => handleFilterSelect(option.key)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-800 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{option.label.split(' ')[0]}</span>
                    <div>
                      <div className="text-sm font-medium text-white group-hover:text-yellow-400 transition-colors">
                        {option.label.split(' ').slice(1).join(' ')}
                      </div>
                      <div className="text-xs text-zinc-400">
                        {option.description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

