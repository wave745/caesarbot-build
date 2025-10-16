"use client"

export function RiskBadge({ level }: { level: "low"|"med"|"high" }) {
  const map = {
    low:  "bg-green-400/20 text-green-300 border-green-500/30",
    med:  "bg-yellow-400/20 text-yellow-300 border-yellow-500/30",
    high: "bg-red-400/20 text-red-300 border-red-500/30",
  }[level];
  return <span className={`text-xs px-2 py-0.5 rounded-md border ${map}`}>{level.toUpperCase()}</span>;
}
