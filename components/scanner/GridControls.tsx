"use client"

import { useState } from "react";

export default function GridControls() {
  const [density, setDensity] = useState<"comfort" | "dense">("comfort");

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-zinc-400">Density</label>
      <button 
        onClick={() => setDensity("comfort")}
        className={`px-2 py-1 rounded text-sm transition-colors ${
          density === "comfort" 
            ? "bg-zinc-900 border border-zinc-700 text-white" 
            : "border border-zinc-800 text-zinc-400 hover:text-zinc-300"
        }`}
      >
        Comfort
      </button>
      <button 
        onClick={() => setDensity("dense")}
        className={`px-2 py-1 rounded text-sm transition-colors ${
          density === "dense" 
            ? "bg-zinc-900 border border-zinc-700 text-white" 
            : "border border-zinc-800 text-zinc-400 hover:text-zinc-300"
        }`}
      >
        Dense
      </button>
    </div>
  );
}

