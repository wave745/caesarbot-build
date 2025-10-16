"use client"

import { useState } from "react";
import { BarChart3, ExternalLink, Smartphone } from "lucide-react";
import GMGNChart from "./GMGNChart";

interface MobileChartProps {
  contractAddress: string;
  tokenName?: string;
}

export default function MobileChart({ contractAddress, tokenName }: MobileChartProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isExpanded) {
    return (
      <div className="bg-[#111111]/90 border border-zinc-800 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Price Chart</h3>
          </div>
          <button
            onClick={() => setIsExpanded(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:from-blue-400 hover:to-purple-400 transition-all"
          >
            View Chart
          </button>
        </div>
        
        <div className="text-sm text-zinc-400 mb-3">
          Interactive price chart powered by GMGN
        </div>
        
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <a
            href={`https://www.gmgn.cc/token/sol/${contractAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-yellow-400 hover:text-yellow-300 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            GMGN
          </a>
          <a
            href={`https://solscan.io/token/${contractAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-yellow-400 hover:text-yellow-300 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            Solscan
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex flex-col">
      {/* Mobile Chart Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-yellow-400" />
          <div>
            <h3 className="text-lg font-semibold text-white">
              {tokenName ? `${tokenName} Chart` : "Price Chart"}
            </h3>
            <p className="text-sm text-zinc-400">Powered by GMGN</p>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(false)}
          className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Mobile Chart Content */}
      <div className="flex-1 overflow-hidden">
        <GMGNChart 
          contractAddress={contractAddress} 
          tokenName={tokenName}
          className="h-full"
        />
      </div>
    </div>
  );
}



