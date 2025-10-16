"use client"

import { useEffect } from "react";
import { useScanner } from "@/stores/scanner";
import { X } from "lucide-react";
import TokenDetails from "./TokenDetails";

export default function TokenDrawer() {
  const { selected, select } = useScanner();
  const open = !!selected;
  
  // Lock body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  // Handle ESC key to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        select(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, select]);

  if (!open) return null;

  const s = selected!;
  return (
    <div className="fixed inset-y-0 right-0 w-[440px] bg-black/95 border-l border-zinc-800 p-5 overflow-y-auto z-50">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-lg font-semibold text-white">{s.ticker} • {s.name}</div>
        <button 
          onClick={()=>select(null)} 
          className="text-zinc-400 hover:text-white transition-colors p-1 rounded hover:bg-zinc-900"
          aria-label="Close drawer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Token Details - Telegram Style */}
      <TokenDetails token={s} />

      {/* Actions - Pinned Footer */}
      <div className="sticky bottom-0 bg-black/95 -mx-5 px-5 py-4 border-t border-zinc-800 mt-8">
        <div className="grid grid-cols-2 gap-2">
          <button className="rounded-xl border border-zinc-700 bg-zinc-900 py-3 text-white hover:bg-zinc-800 transition-colors">
            Add to Portfolio
          </button>
          <button className="rounded-xl border border-yellow-600/40 bg-yellow-600/20 py-3 text-yellow-300 hover:bg-yellow-600/30 transition-colors">
            Open Sniper
          </button>
        </div>
      </div>
    </div>
  );
}
