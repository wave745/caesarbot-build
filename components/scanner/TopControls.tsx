"use client"

import { useScanner } from "@/stores/scanner";
import CommandBox from "./CommandBox";

const sortOptions = [
  { value: "mc", label: "MC" },
  { value: "vol24h", label: "Vol24h" },
  { value: "age", label: "Age" },
  { value: "risk", label: "Risk" },
  { value: "whaleInflow", label: "Whale Inflow" },
];


export default function TopControls() {
  const { query, setQuery } = useScanner();

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <input
        placeholder="Search CA / ticker / wallet"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full sm:w-96 rounded-xl bg-zinc-950/60 border border-zinc-800 px-3 py-2 text-white placeholder-zinc-400 focus:ring-1 focus:ring-yellow-500/40 focus:outline-none transition-all"
      />

      {/* Sort */}
      <select className="rounded-xl bg-zinc-950/60 border border-zinc-800 px-3 py-2 text-white focus:ring-1 focus:ring-yellow-500/40 focus:outline-none">
        {sortOptions.map(option => (
          <option key={option.value} value={option.value}>
            Sort: {option.label}
          </option>
        ))}
      </select>

      {/* Command Box */}
      <CommandBox />
    </div>
  );
}

