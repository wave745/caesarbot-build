"use client"

import { useEffect, useState } from "react";
import TokenDrawer from "@/components/scanner/TokenDrawer";
import TopControls from "@/components/scanner/TopControls";
import SkeletonCard from "@/components/scanner/SkeletonCard";
import EmptyState from "@/components/scanner/EmptyState";
import KeyboardShortcuts from "@/components/scanner/KeyboardShortcuts";
import ScannerResults from "@/components/scanner/ScannerResults";
import { useScanner } from "@/stores/scanner";
import { ScannerService } from "@/lib/scanner-service";

export function ScannerContent() {
  const { 
    selectedToken, 
    setQuery, 
    query, 
    selectedFeature,
    setSelectedToken,
    mode
  } = useScanner();
  const [loading, setLoading] = useState(false);
  const [tokens, setTokens] = useState<any[]>([]);
  const scannerService = ScannerService.getInstance();

  // Search for token when query changes
  useEffect(() => {
    const searchToken = async () => {
      if (!query.trim()) {
        setTokens([]);
        setSelectedToken(null);
        return;
      }
      
      setLoading(true);
      try {
        const results = await scannerService.searchToken(query);
        setTokens(results);
        if (results.length > 0) {
          setSelectedToken(results[0]);
        } else {
          setSelectedToken(null);
        }
      } catch (error) {
        console.error("Error searching token:", error);
        setTokens([]);
        setSelectedToken(null);
      } finally {
        setLoading(false);
      }
    };

    searchToken();
  }, [query, setSelectedToken]);

  return (
    <>
      <KeyboardShortcuts />
      <div className="flex">
        <main className="flex-1 p-6 space-y-6">
          {/* Top Controls */}
          <TopControls />
          
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <SkeletonCard />
              <div className="ml-4">
                <div className="text-zinc-400">Searching for token...</div>
                <div className="text-sm text-zinc-500">Analyzing contract address</div>
              </div>
            </div>
          )}

          {/* Scanner Results - Shows when token is found */}
          {selectedToken && (
            <ScannerResults />
          )}

          {/* Empty State - Shows when no search query */}
          {!query && !loading && !selectedToken && (
            <EmptyState />
          )}

          {/* No Results State */}
          {query && !loading && tokens.length === 0 && !selectedFeature && (
            <div className="bg-[#111111]/90 border border-zinc-800 rounded-xl p-6 mb-6">
              <div className="text-center text-zinc-400">
                <p className="text-lg mb-2">No token found</p>
                <p className="text-sm">Please check the contract address and try again</p>
                <div className="mt-4 p-3 bg-zinc-800/50 rounded-lg text-left">
                  <div className="text-sm text-zinc-300 mb-2">Valid Solana address format:</div>
                  <code className="text-xs text-yellow-400 break-all">
                    {query}
                  </code>
                </div>
              </div>
            </div>
          )}
        </main>
        <TokenDrawer />
      </div>
    </>
  );
}