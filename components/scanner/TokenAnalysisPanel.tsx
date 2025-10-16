"use client"

import { TokenRow } from "@/stores/scanner";
import { TrendingUp, TrendingDown, Users, DollarSign, Shield, Clock, BarChart3 } from "lucide-react";

interface TokenAnalysisPanelProps {
  token: TokenRow;
}

export default function TokenAnalysisPanel({ token }: TokenAnalysisPanelProps) {
  const formatNumber = (num: number) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toFixed(2);
  };

  const formatPrice = (price: number) => {
    if (price >= 1) return `$${price.toFixed(2)}`;
    if (price >= 0.01) return `$${price.toFixed(4)}`;
    return `$${price.toFixed(6)}`;
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-400 bg-red-500/20';
      case 'med': return 'text-yellow-400 bg-yellow-500/20';
      default: return 'text-green-400 bg-green-500/20';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'high': return '🔴';
      case 'med': return '🟡';
      default: return '🟢';
    }
  };

  return (
    <div className="space-y-6">
      {/* Token Header */}
      <div className="bg-[#111111]/90 border border-zinc-800 rounded-xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              {token.ticker?.charAt(0) || 'T'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{token.name}</h2>
              <p className="text-sm text-zinc-400">{token.ticker}</p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${getRiskColor(token.risk)}`}>
            <span>{getRiskIcon(token.risk)}</span>
            {token.risk?.toUpperCase() || 'UNKNOWN'}
          </div>
        </div>

        {/* Contract Address */}
        <div className="p-3 bg-zinc-800/50 rounded-lg">
          <div className="text-xs text-zinc-400 mb-1">Contract Address</div>
          <code className="text-sm text-yellow-400 font-mono break-all">{token.ca}</code>
        </div>
      </div>

      {/* Price & Market Data */}
      <div className="bg-[#111111]/90 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Market Data
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-zinc-800/50 rounded-lg">
            <div className="text-xs text-zinc-400 mb-1">Current Price</div>
            <div className="text-xl font-bold text-white">{formatPrice(token.price)}</div>
          </div>
          
          <div className="p-4 bg-zinc-800/50 rounded-lg">
            <div className="text-xs text-zinc-400 mb-1">Market Cap</div>
            <div className="text-lg font-semibold text-white">${formatNumber(token.mc)}</div>
          </div>
          
          <div className="p-4 bg-zinc-800/50 rounded-lg">
            <div className="text-xs text-zinc-400 mb-1">24h Volume</div>
            <div className="text-lg font-semibold text-white">${formatNumber(token.vol24h)}</div>
          </div>
          
          <div className="p-4 bg-zinc-800/50 rounded-lg">
            <div className="text-xs text-zinc-400 mb-1">Liquidity</div>
            <div className="text-lg font-semibold text-white">${formatNumber(token.lp)}</div>
          </div>
        </div>

        {/* Price Chart Sparkline */}
        {token.spark && token.spark.length > 0 && (
          <div className="mt-4">
            <div className="text-xs text-zinc-400 mb-2">24h Price Movement</div>
            <div className="h-16 bg-zinc-800/50 rounded-lg p-2">
              <div className="flex items-end justify-between h-full">
                {token.spark.map((price, index) => {
                  const maxPrice = Math.max(...token.spark);
                  const minPrice = Math.min(...token.spark);
                  const height = ((price - minPrice) / (maxPrice - minPrice)) * 100;
                  return (
                    <div
                      key={index}
                      className="bg-gradient-to-t from-yellow-500 to-orange-500 rounded-sm flex-1 mx-0.5"
                      style={{ height: `${Math.max(height, 5)}%` }}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Token Stats */}
      <div className="bg-[#111111]/90 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Token Statistics
        </h3>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-zinc-800">
            <span className="text-zinc-400">Total Supply</span>
            <span className="text-white font-medium">{formatNumber(token.supply || 0)}</span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-zinc-800">
            <span className="text-zinc-400">All-Time High</span>
            <span className="text-white font-medium">{formatPrice(token.ath || token.price)}</span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-zinc-800">
            <span className="text-zinc-400">Token Age</span>
            <span className="text-white font-medium flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {token.age ? `${Math.floor(token.age / 24)} days` : 'Unknown'}
            </span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-zinc-800">
            <span className="text-zinc-400">Whale Inflow</span>
            <span className="text-white font-medium">${formatNumber(token.whaleInflow || 0)}</span>
          </div>
        </div>
      </div>

      {/* Security Flags */}
      <div className="bg-[#111111]/90 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Security Analysis
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <span className="text-zinc-400">Bundle Activity</span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              token.flags?.bundled ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
            }`}>
              {token.flags?.bundled ? 'Detected' : 'Clean'}
            </span>
          </div>
          
          <div className="flex items-center justify-between py-2">
            <span className="text-zinc-400">Dev Sell Activity</span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              token.flags?.devSold ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
            }`}>
              {token.flags?.devSold ? 'Detected' : 'Clean'}
            </span>
          </div>
          
          <div className="flex items-center justify-between py-2">
            <span className="text-zinc-400">Site Reused</span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              token.flags?.siteReused ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
            }`}>
              {token.flags?.siteReused ? 'Yes' : 'No'}
            </span>
          </div>
          
          <div className="flex items-center justify-between py-2">
            <span className="text-zinc-400">DEX Updated</span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              token.flags?.dexUpdated ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
            }`}>
              {token.flags?.dexUpdated ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
      </div>

      {/* Tags */}
      {token.tags && token.tags.length > 0 && (
        <div className="bg-[#111111]/90 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {token.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}