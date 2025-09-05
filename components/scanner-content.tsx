"use client"

import { useEffect, useState } from "react";
import TokenCard from "@/components/scanner/TokenCard";
import TokenDrawer from "@/components/scanner/TokenDrawer";
import LiveFeedTicker from "@/components/scanner/LiveFeedTicker";
import TopControls from "@/components/scanner/TopControls";
import SkeletonCard from "@/components/scanner/SkeletonCard";
import EmptyState from "@/components/scanner/EmptyState";
import KeyboardShortcuts from "@/components/scanner/KeyboardShortcuts";
import TrendingPanel from "@/components/scanner/TrendingPanel";
import { useScanner } from "@/stores/scanner";
import { ScannerService } from "@/lib/scanner-service";

export function ScannerContent() {
  const { tokens, setTokens, setQuery, filters, query } = useScanner();
  const [liveFeed, setLiveFeed] = useState<{ts: number, text: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [allTokens, setAllTokens] = useState(tokens);

  // Empty trending data - ready for real data integration
  const trendingTokens: { rank:number; ticker:string; name:string; vol:number; change:number }[] = [];

  // Load tokens based on filters
  useEffect(() => {
    const loadTokens = async () => {
      setLoading(true);
      const scannerService = ScannerService.getInstance();
      const data = await scannerService.getTokens(filters);
      setAllTokens(data);
      setTokens(data);
      setLoading(false);
    };
    
    loadTokens();
  }, [filters, setTokens]);

  // Filter tokens by search query
  useEffect(() => {
    if (!query.trim()) {
      setTokens(allTokens);
      return;
    }
    
    const filtered = allTokens.filter(token => 
      token.ticker.toLowerCase().includes(query.toLowerCase()) ||
      token.name.toLowerCase().includes(query.toLowerCase()) ||
      token.ca.toLowerCase().includes(query.toLowerCase())
    );
    setTokens(filtered);
  }, [query, allTokens, setTokens]);

  // Load live feed
  useEffect(() => {
    const loadLiveFeed = async () => {
      const scannerService = ScannerService.getInstance();
      const feed = await scannerService.getLiveFeed();
      setLiveFeed(feed);
    };
    
    loadLiveFeed();
    const interval = setInterval(loadLiveFeed, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <KeyboardShortcuts />
      <div className="flex">
        <main className="flex-1 p-6 space-y-6">
          {/* Live Feed Ticker */}
          {liveFeed.length > 0 && <LiveFeedTicker items={liveFeed}/>}
          
          {/* Top Controls */}
          <TopControls />
          
          {/* Token Count */}
          <div className="text-sm text-zinc-400">
            {loading ? "Loading..." : `Sort: MC · ${tokens.length} tokens`}
          </div>

          {/* Content */}
          {loading ? (
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </section>
          ) : tokens.length === 0 ? (
            <EmptyState />
          ) : (
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {tokens.map(t => <TokenCard key={t.ca} t={t} />)}
            </section>
          )}
        </main>
        <TrendingPanel tokens={trendingTokens} />
        <TokenDrawer />
      </div>
    </>
  );
}
