"use client"

import { useScanner } from "@/stores/scanner";
import TokenAnalysisPanel from "./TokenAnalysisPanel";
import CommandResults from "./CommandResults";
import GMGNChart from "./GMGNChart";
import { Badge } from "../ui/badge";

export default function ScannerResults() {
  const { selectedToken, selectedFeature, mode } = useScanner();

  if (!selectedToken) {
    return null;
  }

  return (
    <div className={`grid gap-6 ${mode === "standard" ? "md:grid-cols-2" : "grid-cols-1"}`}>
      {mode === "standard" && (
        <>
          {/* Left Panel - Token Details */}
          <div className="space-y-6">
            <TokenAnalysisPanel token={selectedToken} />
          </div>

          {/* Right Panel - Chart */}
          <div className="space-y-6">
            <GMGNChart token={selectedToken} />
          </div>
        </>
      )}

      {mode === "advanced" && selectedFeature && (
        <div className="relative col-span-full">
          <Badge variant="secondary" className="absolute -top-3 left-3 z-10 bg-zinc-900 border-zinc-700 text-zinc-400">
            Advanced Analysis
          </Badge>
          <CommandResults />
        </div>
      )}
    </div>
  );
}