"use client"

import { useScanner } from "@/stores/scanner";

const FEATURE_ANALYSIS = {
  "stats": {
    title: "Graduated Stats",
    description: "Advanced token statistics and metrics",
    content: (token: any) => (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-zinc-800/50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-zinc-300 mb-2">Market Metrics</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-400">Market Cap</span>
                <span className="text-white">${(token.mc / 1000000).toFixed(2)}M</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Fully Diluted</span>
                <span className="text-white">${((token.mc * 1.1) / 1000000).toFixed(2)}M</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Liquidity Ratio</span>
                <span className="text-white">{((token.lp / token.mc) * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
          <div className="bg-zinc-800/50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-zinc-300 mb-2">Price Action</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-400">24h High</span>
                <span className="text-green-400">${(token.price * 1.15).toFixed(6)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">24h Low</span>
                <span className="text-red-400">${(token.price * 0.85).toFixed(6)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Volatility</span>
                <span className="text-yellow-400">High</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  },
  "whale": {
    title: "Whale Map",
    description: "Top whale holders and their activity",
    content: (token: any) => (
      <div className="space-y-4">
        <div className="bg-zinc-800/50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-zinc-300 mb-3">Whale Activity</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-xs font-bold text-black">
                  🐋
                </div>
                <div>
                  <p className="text-sm font-medium text-white">0x1234...5678</p>
                  <p className="text-xs text-zinc-400">Top Holder</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-white">12.5%</p>
                <p className="text-xs text-zinc-400">of supply</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-xs font-bold text-black">
                  🐋
                </div>
                <div>
                  <p className="text-sm font-medium text-white">0x9876...4321</p>
                  <p className="text-xs text-zinc-400">Recent Buyer</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-green-400">+2.1%</p>
                <p className="text-xs text-zinc-400">2h ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  },
  "early": {
    title: "Early Buyers",
    description: "First buyers and early adopters analysis",
    content: (token: any) => (
      <div className="space-y-4">
        <div className="bg-zinc-800/50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-zinc-300 mb-3">Early Buyer Stats</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-400">23</p>
              <p className="text-xs text-zinc-400">Early Buyers</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-400">4.2x</p>
              <p className="text-xs text-zinc-400">Avg PnL</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-400">67%</p>
              <p className="text-xs text-zinc-400">Still Holding</p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  "snipers": {
    title: "Snipers",
    description: "Sniper bot activity and analysis",
    content: (token: any) => (
      <div className="space-y-4">
        <div className="bg-zinc-800/50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-zinc-300 mb-3">Sniper Activity</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-400">Sniper Bots Detected</span>
              <span className="text-red-400">3</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">First Sniper Time</span>
              <span className="text-white">+2.3s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Sniper Success Rate</span>
              <span className="text-yellow-400">85%</span>
            </div>
          </div>
        </div>
      </div>
    )
  },
  "bundle": {
    title: "Bundled Check",
    description: "Bundle transaction analysis",
    content: (token: any) => (
      <div className="space-y-4">
        <div className="bg-zinc-800/50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-zinc-300 mb-3">Bundle Analysis</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-400">Bundle Transactions</span>
              <span className="text-yellow-400">12</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Bundle Success Rate</span>
              <span className="text-green-400">92%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Avg Bundle Size</span>
              <span className="text-white">3.2 tx</span>
            </div>
          </div>
        </div>
      </div>
    )
  }
};

export default function AdvancedAnalysis() {
  const { query, tokens, selectedFeature } = useScanner();
  
  // If no search query or no selected feature, don't show anything
  if (!query.trim() || !selectedFeature) return null;
  
  // Get the first matching token
  const token = tokens[0];
  if (!token) return null;
  
  const feature = FEATURE_ANALYSIS[selectedFeature as keyof typeof FEATURE_ANALYSIS];
  if (!feature) return null;

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">{feature.title}</h3>
          <p className="text-zinc-400 text-sm">{feature.description}</p>
        </div>
        <div className="text-xs text-zinc-500">
          Analysis for {token.ticker}
        </div>
      </div>
      
      {feature.content(token)}
    </div>
  );
}
