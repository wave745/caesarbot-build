"use client"

import { useEffect, useState } from "react";
import { useScanner, TokenRow } from "@/stores/scanner";
import { ScannerService } from "@/lib/scanner-service";
import Sparkline from "./Sparkline";
import { RiskBadge } from "./RiskBadge";

export default function BasicTokenDisplay() {
  const { query, setSelectedToken, setTokens } = useScanner();
  const [token, setToken] = useState<TokenRow | null>(null);
  const [loading, setLoading] = useState(false);
  
  // If no search query, don't show anything
  if (!query.trim()) return null;
  
  // Search for token when query changes
  useEffect(() => {
    const searchToken = async () => {
      if (!query.trim()) return;
      
      setLoading(true);
      const scannerService = ScannerService.getInstance();
      const results = await scannerService.searchToken(query);
      
      if (results.length > 0) {
        const foundToken = results[0];
        setToken(foundToken);
        setSelectedToken(foundToken);
        setTokens([foundToken]); // Update tokens array with search result
      } else {
        setToken(null);
        setSelectedToken(null);
        setTokens([]);
      }
      setLoading(false);
    };
    
    searchToken();
  }, [query, setSelectedToken, setTokens]);
  
  if (loading) {
    return (
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-6">
        <div className="text-center text-zinc-400">
          <p className="text-lg mb-2">Searching...</p>
        </div>
      </div>
    );
  }
  
  if (!token) {
    return (
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-6">
        <div className="text-center text-zinc-400">
          <p className="text-lg mb-2">No token found</p>
          <p className="text-sm">Try searching with a different ticker or contract address</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">{token.ticker}</h2>
          <p className="text-zinc-400 text-sm">{token.name}</p>
        </div>
        <RiskBadge level={token.risk} />
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div>
          <p className="text-zinc-400 text-xs uppercase tracking-wide mb-1">Price</p>
          <p className="text-white font-semibold">${token.price.toFixed(6)}</p>
        </div>
        <div>
          <p className="text-zinc-400 text-xs uppercase tracking-wide mb-1">Market Cap</p>
          <p className="text-white font-semibold">${(token.mc / 1000000).toFixed(2)}M</p>
        </div>
        <div>
          <p className="text-zinc-400 text-xs uppercase tracking-wide mb-1">24h Volume</p>
          <p className="text-white font-semibold">${(token.vol24h / 1000000).toFixed(2)}M</p>
        </div>
        <div>
          <p className="text-zinc-400 text-xs uppercase tracking-wide mb-1">Liquidity</p>
          <p className="text-white font-semibold">${(token.lp / 1000000).toFixed(2)}M</p>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-zinc-400 text-xs uppercase tracking-wide mb-2">Price Chart (24h)</p>
          <div className="h-16">
            <Sparkline points={token.spark} />
          </div>
        </div>
        <div className="ml-4 text-right">
          <p className="text-zinc-400 text-xs uppercase tracking-wide mb-1">Contract</p>
          <p className="text-yellow-400 text-xs font-mono break-all max-w-32">
            {token.ca.slice(0, 6)}...{token.ca.slice(-4)}
          </p>
        </div>
      </div>
    </div>
  );
}
